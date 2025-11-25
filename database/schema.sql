-- SupermarketWS Database Schema
-- PostgreSQL 14+

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extensión para similitud de texto (para product matching)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Tabla de Supermercados
CREATE TABLE supermarkets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    website_url VARCHAR(500) NOT NULL,
    logo_url VARCHAR(500),
    chain_group VARCHAR(100), -- 'Cencosud', 'Walmart', 'SMU', 'Regional'
    location VARCHAR(255) DEFAULT 'Temuco',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supermarket_id UUID NOT NULL REFERENCES supermarkets(id) ON DELETE CASCADE,
    external_id VARCHAR(255), -- ID del producto en el sitio original
    name VARCHAR(500) NOT NULL,
    normalized_name VARCHAR(500), -- Nombre normalizado para matching
    description TEXT,
    brand VARCHAR(255),
    category VARCHAR(255),
    subcategory VARCHAR(255),
    unit VARCHAR(50), -- 'kg', 'lt', 'un', etc.
    unit_size DECIMAL(10, 2), -- Tamaño de la unidad
    image_url VARCHAR(1000),
    product_url VARCHAR(1000),
    barcode VARCHAR(100), -- EAN, UPC, etc.
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_scraped_at TIMESTAMP,
    UNIQUE(supermarket_id, external_id)
);

-- Tabla de Precios Actuales
CREATE TABLE prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    normal_price DECIMAL(10, 2) NOT NULL,
    offer_price DECIMAL(10, 2), -- NULL si no hay oferta
    discount_percentage DECIMAL(5, 2), -- Porcentaje de descuento
    has_offer BOOLEAN DEFAULT false,
    offer_description TEXT,
    price_per_unit DECIMAL(10, 2), -- Precio por kg/lt para comparación
    currency VARCHAR(10) DEFAULT 'CLP',
    is_current BOOLEAN DEFAULT true, -- Solo un precio current por producto
    effective_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, is_current) WHERE is_current = true
);

-- Tabla de Historial de Precios
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    normal_price DECIMAL(10, 2) NOT NULL,
    offer_price DECIMAL(10, 2),
    discount_percentage DECIMAL(5, 2),
    has_offer BOOLEAN DEFAULT false,
    price_per_unit DECIMAL(10, 2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Product Matching (para relacionar productos similares)
CREATE TABLE product_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_product_id UUID, -- Producto "maestro" o representativo
    matched_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    similarity_score DECIMAL(5, 2), -- 0-100, confianza del match
    match_method VARCHAR(50), -- 'barcode', 'name_similarity', 'manual'
    is_verified BOOLEAN DEFAULT false, -- Verificado manualmente
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(matched_product_id)
);

-- Tabla de Logs de Scraping
CREATE TABLE scraping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supermarket_id UUID REFERENCES supermarkets(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'partial'
    products_scraped INTEGER DEFAULT 0,
    products_updated INTEGER DEFAULT 0,
    products_new INTEGER DEFAULT 0,
    error_message TEXT,
    duration_seconds INTEGER,
    started_at TIMESTAMP NOT NULL,
    finished_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejor performance
CREATE INDEX idx_products_supermarket ON products(supermarket_id);
CREATE INDEX idx_products_normalized_name ON products(normalized_name);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_is_available ON products(is_available);

CREATE INDEX idx_prices_product ON prices(product_id);
CREATE INDEX idx_prices_current ON prices(is_current) WHERE is_current = true;
CREATE INDEX idx_prices_offer ON prices(has_offer) WHERE has_offer = true;

CREATE INDEX idx_price_history_product ON price_history(product_id);
CREATE INDEX idx_price_history_recorded ON price_history(recorded_at DESC);

CREATE INDEX idx_product_matches_master ON product_matches(master_product_id);
CREATE INDEX idx_product_matches_matched ON product_matches(matched_product_id);

CREATE INDEX idx_scraping_logs_supermarket ON scraping_logs(supermarket_id);
CREATE INDEX idx_scraping_logs_status ON scraping_logs(status);
CREATE INDEX idx_scraping_logs_started ON scraping_logs(started_at DESC);

-- Índice para búsqueda de texto con trigram
CREATE INDEX idx_products_name_trgm ON products USING gin (normalized_name gin_trgm_ops);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_supermarkets_updated_at BEFORE UPDATE ON supermarkets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_matches_updated_at BEFORE UPDATE ON product_matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para archivar precio actual antes de insertar nuevo
CREATE OR REPLACE FUNCTION archive_current_price()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar precio actual en historial antes de marcarlo como no actual
    INSERT INTO price_history (product_id, normal_price, offer_price, discount_percentage, has_offer, price_per_unit)
    SELECT product_id, normal_price, offer_price, discount_percentage, has_offer, price_per_unit
    FROM prices
    WHERE product_id = NEW.product_id AND is_current = true;
    
    -- Marcar todos los precios del producto como no actuales
    UPDATE prices SET is_current = false WHERE product_id = NEW.product_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para archivar precios
CREATE TRIGGER archive_price_before_insert BEFORE INSERT ON prices
    FOR EACH ROW EXECUTE FUNCTION archive_current_price();

-- Vista para comparación de precios
CREATE OR REPLACE VIEW price_comparison AS
SELECT 
    pm.master_product_id,
    p.id as product_id,
    p.name as product_name,
    p.brand,
    p.category,
    s.name as supermarket_name,
    s.chain_group,
    pr.normal_price,
    pr.offer_price,
    pr.has_offer,
    pr.discount_percentage,
    pr.price_per_unit,
    pm.similarity_score
FROM products p
JOIN supermarkets s ON p.supermarket_id = s.id
JOIN prices pr ON p.id = pr.product_id AND pr.is_current = true
LEFT JOIN product_matches pm ON p.id = pm.matched_product_id
WHERE p.is_available = true AND s.is_active = true
ORDER BY pm.master_product_id, pr.normal_price;

-- Comentarios sobre las tablas
COMMENT ON TABLE supermarkets IS 'Información de los supermercados disponibles';
COMMENT ON TABLE products IS 'Catálogo de productos de cada supermercado';
COMMENT ON TABLE prices IS 'Precios actuales de los productos';
COMMENT ON TABLE price_history IS 'Historial de cambios de precios para análisis de tendencias';
COMMENT ON TABLE product_matches IS 'Relaciones entre productos similares de diferentes supermercados';
COMMENT ON TABLE scraping_logs IS 'Logs de ejecución de los scrapers';
