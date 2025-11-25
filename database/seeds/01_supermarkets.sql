-- Seed data: Supermercados iniciales
-- Insertar datos de los supermercados configurados para Temuco

INSERT INTO supermarkets (name, slug, website_url, logo_url, chain_group, location, is_active) VALUES
-- Cencosud
('Jumbo', 'jumbo', 'https://www.jumbo.cl/', 'https://www.jumbo.cl/assets/logo.png', 'Cencosud', 'Portal Temuco', true),
('Santa Isabel', 'santa-isabel', 'https://www.santaisabel.cl/', 'https://www.santaisabel.cl/assets/logo.png', 'Cencosud', 'Temuco', true),

-- Walmart Chile
('Lider', 'lider', 'https://www.lider.cl/supermercado', 'https://www.lider.cl/assets/logo.png', 'Walmart', 'Temuco', true),
('Acuenta', 'acuenta', 'https://www.acuenta.cl/', 'https://www.acuenta.cl/assets/logo.png', 'Walmart', 'Temuco', true),

-- SMU
('Unimarc', 'unimarc', 'https://www.unimarc.cl/', 'https://www.unimarc.cl/assets/logo.png', 'SMU', 'Temuco', true),
('Mayorista 10', 'mayorista-10', 'https://www.mayorista10.cl/', 'https://www.mayorista10.cl/assets/logo.png', 'SMU', 'Temuco', true),

-- Regionales Temuco
('Supermercados Cugat', 'cugat', 'https://cugat.cl/', null, 'Regional', 'Temuco', true),
('Supermercados El Trébol', 'el-trebol', 'https://www.supertrebol.cl/', null, 'Regional', 'Temuco', true),
('Supermercados Eltit', 'eltit', 'https://www.eltit.cl/', null, 'Regional', 'Temuco', true);

-- Insertar categorías comunes (esto se puede expandir)
-- Nota: En este diseño, las categorías están en la tabla de productos
-- Esta es solo una referencia de las categorías típicas a usar

-- Ejemplos de categorías:
-- - Lácteos y Huevos
-- - Carnes y Pescados
-- - Frutas y Verduras
-- - Panadería y Pastelería
-- - Bebidas
-- - Despensa
-- - Snacks y Dulces
-- - Congelados
-- - Aseo y Limpieza
-- - Cuidado Personal
