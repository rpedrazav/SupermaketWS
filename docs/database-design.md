# Diseño de Base de Datos - SupermarketWS

## Estrategia de Base de Datos

Se eligió **PostgreSQL** como base de datos principal por las siguientes razones:

1. **Relaciones claras**: El dominio tiene relaciones bien definidas (supermercados → productos → precios)
2. **Integridad referencial**: Necesitamos garantizar consistencia en los datos
3. **Extensiones útiles**: 
   - `pg_trgm`: Para búsqueda de similitud de texto (product matching)
   - `uuid-ossp`: Para generar UUIDs como identificadores
4. **Consultas complejas**: Necesitamos JOINs y agregaciones para comparar precios
5. **Historial de precios**: Ideal para análisis de series temporales

## Esquema de Tablas

### 1. `supermarkets` - Supermercados

Almacena información de cada cadena de supermercado.

```sql
- id (UUID, PK): Identificador único
- name (VARCHAR): Nombre del supermercado
- slug (VARCHAR, UNIQUE): URL-friendly identifier
- website_url (VARCHAR): URL del sitio web
- logo_url (VARCHAR): URL del logo
- chain_group (VARCHAR): Grupo empresarial (Cencosud, Walmart, SMU, Regional)
- location (VARCHAR): Ubicación (default: Temuco)
- is_active (BOOLEAN): Si está activo para scraping
- created_at, updated_at (TIMESTAMP): Timestamps
```

**Propósito**: Mantener catálogo de supermercados y su configuración.

### 2. `products` - Productos

Catálogo de productos de cada supermercado.

```sql
- id (UUID, PK): Identificador único
- supermarket_id (UUID, FK): Referencia al supermercado
- external_id (VARCHAR): ID del producto en el sitio original
- name (VARCHAR): Nombre original del producto
- normalized_name (VARCHAR): Nombre normalizado para matching
- description (TEXT): Descripción
- brand (VARCHAR): Marca
- category (VARCHAR): Categoría principal
- subcategory (VARCHAR): Subcategoría
- unit (VARCHAR): Unidad de medida (kg, lt, un)
- unit_size (DECIMAL): Tamaño de la unidad
- image_url (VARCHAR): URL de la imagen
- product_url (VARCHAR): URL del producto
- barcode (VARCHAR): Código de barras (EAN/UPC)
- is_available (BOOLEAN): Disponibilidad actual
- created_at, updated_at, last_scraped_at (TIMESTAMP): Timestamps
```

**Constraint único**: `(supermarket_id, external_id)` - Un producto por supermercado

**Propósito**: Mantener el catálogo completo de productos de cada cadena.

### 3. `prices` - Precios Actuales

Precios actuales de los productos.

```sql
- id (UUID, PK): Identificador único
- product_id (UUID, FK): Referencia al producto
- normal_price (DECIMAL): Precio normal
- offer_price (DECIMAL): Precio de oferta (NULL si no hay)
- discount_percentage (DECIMAL): % de descuento
- has_offer (BOOLEAN): Indica si tiene oferta
- offer_description (TEXT): Descripción de la oferta
- price_per_unit (DECIMAL): Precio por kg/lt (para comparación)
- currency (VARCHAR): Moneda (default: CLP)
- is_current (BOOLEAN): Solo un precio current por producto
- effective_date (TIMESTAMP): Fecha efectiva del precio
- created_at (TIMESTAMP): Timestamp
```

**Constraint único**: `(product_id, is_current)` WHERE `is_current = true`

**Propósito**: Almacenar precio actual de cada producto. Solo hay un precio "current" por producto.

### 4. `price_history` - Historial de Precios

Registro histórico de cambios de precio.

```sql
- id (UUID, PK): Identificador único
- product_id (UUID, FK): Referencia al producto
- normal_price (DECIMAL): Precio normal
- offer_price (DECIMAL): Precio de oferta
- discount_percentage (DECIMAL): % de descuento
- has_offer (BOOLEAN): Indica si tenía oferta
- price_per_unit (DECIMAL): Precio por unidad
- recorded_at (TIMESTAMP): Momento del registro
- created_at (TIMESTAMP): Timestamp
```

**Propósito**: Mantener historial de precios para análisis de tendencias y gráficos.

### 5. `product_matches` - Coincidencia de Productos

Relaciona productos similares de diferentes supermercados.

```sql
- id (UUID, PK): Identificador único
- master_product_id (UUID): ID del producto "maestro"
- matched_product_id (UUID, FK, UNIQUE): Producto relacionado
- similarity_score (DECIMAL): Score de similitud (0-100)
- match_method (VARCHAR): Método usado (barcode, name_similarity, manual)
- is_verified (BOOLEAN): Si fue verificado manualmente
- created_at, updated_at (TIMESTAMP): Timestamps
```

**Propósito**: Resolver el problema de que "Leche Colun 1L" se llame diferente en cada supermercado.

### 6. `scraping_logs` - Logs de Scraping

Registro de ejecuciones de los scrapers.

```sql
- id (UUID, PK): Identificador único
- supermarket_id (UUID, FK): Supermercado scrapeado
- status (VARCHAR): Estado (success, failed, partial)
- products_scraped (INTEGER): Productos scrapeados
- products_updated (INTEGER): Productos actualizados
- products_new (INTEGER): Productos nuevos
- error_message (TEXT): Mensaje de error si aplica
- duration_seconds (INTEGER): Duración en segundos
- started_at (TIMESTAMP): Inicio
- finished_at (TIMESTAMP): Fin
- created_at (TIMESTAMP): Timestamp
```

**Propósito**: Monitorear y depurar el proceso de scraping.

## Product Matching - Estrategia de Resolución

El desafío principal es identificar que "Leche Colun 1L" en Jumbo es el mismo producto que "Leche Colun Entera 1 Litro" en Lider.

### Métodos de Matching

#### 1. **Matching por Código de Barras** (Más confiable)
- Si dos productos tienen el mismo barcode (EAN/UPC), son el mismo producto
- Confidence: 100%
- Limitación: No todos los sitios exponen el código de barras

```sql
-- Ejemplo de matching por barcode
SELECT p1.id, p1.name, p2.id, p2.name
FROM products p1
JOIN products p2 ON p1.barcode = p2.barcode 
WHERE p1.supermarket_id != p2.supermarket_id
AND p1.barcode IS NOT NULL;
```

#### 2. **Matching por Similitud de Nombre** (ML/Heurística)
- Normalizar nombres: lowercase, remover stopwords, remover acentos
- Calcular similitud usando:
  - Trigram similarity (PostgreSQL `pg_trgm`)
  - Levenshtein distance
  - Token set ratio

```javascript
// Ejemplo de normalización
function normalizeProductName(name) {
    return name
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remover acentos
        .replace(/[^a-z0-9\s]/g, '') // Solo alfanuméricos
        .replace(/\s+/g, ' ') // Normalizar espacios
        .trim();
}

// Stopwords a remover: 'de', 'con', 'para', 'unidades', 'pack', etc.
```

```sql
-- Ejemplo de búsqueda de similitud con PostgreSQL
SELECT 
    p1.id,
    p1.name,
    p2.id,
    p2.name,
    similarity(p1.normalized_name, p2.normalized_name) as score
FROM products p1
CROSS JOIN products p2
WHERE p1.supermarket_id != p2.supermarket_id
AND similarity(p1.normalized_name, p2.normalized_name) > 0.6
AND p1.category = p2.category  -- Filtrar por categoría
ORDER BY score DESC;
```

#### 3. **Matching Manual** (Fallback)
- Para productos conflictivos o de alto valor
- Interface administrativa para revisar y aprobar matches
- Marcar como `is_verified = true`

### Algoritmo de Matching Propuesto

```javascript
async function matchProducts(product) {
    // 1. Intentar match por barcode
    if (product.barcode) {
        const exactMatch = await findByBarcode(product.barcode);
        if (exactMatch) {
            return createMatch(product, exactMatch, 100, 'barcode');
        }
    }
    
    // 2. Intentar match por similitud de nombre
    const normalizedName = normalizeProductName(product.name);
    const similarProducts = await findSimilarProducts(
        normalizedName, 
        product.category,
        0.65 // Threshold mínimo
    );
    
    if (similarProducts.length > 0) {
        const bestMatch = similarProducts[0];
        return createMatch(
            product, 
            bestMatch, 
            bestMatch.score * 100, 
            'name_similarity'
        );
    }
    
    // 3. No se encontró match - crear nuevo master
    return createMasterProduct(product);
}
```

### Vista de Comparación de Precios

La vista `price_comparison` facilita consultas de comparación:

```sql
SELECT 
    product_name,
    brand,
    supermarket_name,
    normal_price,
    offer_price,
    discount_percentage
FROM price_comparison
WHERE master_product_id = '...'
ORDER BY COALESCE(offer_price, normal_price) ASC;
```

## Índices y Performance

### Índices Creados

1. **Búsqueda de productos**: 
   - `idx_products_normalized_name` (Trigram GIN index)
   - `idx_products_barcode`
   
2. **Filtrado por categoría/marca**:
   - `idx_products_category`
   - `idx_products_brand`

3. **Precios actuales**:
   - `idx_prices_current` (WHERE is_current = true)
   - `idx_prices_offer` (WHERE has_offer = true)

4. **Historial**:
   - `idx_price_history_recorded` (DESC para queries recientes)

### Consideraciones de Performance

- **Particionamiento**: Si el historial crece mucho, considerar particionamiento por fecha
- **Archivado**: Mover precios antiguos (>1 año) a tabla de archivo
- **Cache**: Usar Redis para cachear comparaciones frecuentes
- **Materializar vistas**: La vista `price_comparison` podría materializarse si es muy usada

## Triggers Automáticos

### 1. Actualización de `updated_at`
Automáticamente actualiza el timestamp cuando se modifica un registro.

### 2. Archivo de Precios
Cuando se inserta un nuevo precio:
- Copia el precio actual a `price_history`
- Marca el precio anterior como `is_current = false`
- Inserta el nuevo precio como `is_current = true`

Esto garantiza que siempre haya un histórico completo de cambios.

## Migraciones Futuras

Consideraciones para expansión:

1. **Usuarios y Listas de Compras**: 
   - Tabla `users`
   - Tabla `shopping_lists`
   - Tabla `shopping_list_items`

2. **Notificaciones de Precios**:
   - Tabla `price_alerts`
   - Notificar cuando un producto baje de precio

3. **Reviews de Supermercados**:
   - Tabla `supermarket_reviews`
   - Rating y comentarios

4. **Stock/Disponibilidad**:
   - Campo `stock_status` en products
   - Historial de disponibilidad

## Backup y Recovery

Recomendaciones:

1. **Backup diario**: Full backup de la BD
2. **WAL archiving**: Para point-in-time recovery
3. **Replicación**: Configurar streaming replication para HA
4. **Monitoreo**: Alertas sobre tamaño de tablas y performance

## Consultas Útiles

### Productos más baratos por categoría
```sql
SELECT DISTINCT ON (master_product_id)
    product_name,
    brand,
    supermarket_name,
    COALESCE(offer_price, normal_price) as best_price,
    category
FROM price_comparison
WHERE has_offer = true
ORDER BY master_product_id, best_price ASC;
```

### Historial de precios de un producto
```sql
SELECT 
    recorded_at,
    normal_price,
    offer_price,
    has_offer
FROM price_history
WHERE product_id = '...'
ORDER BY recorded_at DESC
LIMIT 30;
```

### Supermercados más económicos
```sql
SELECT 
    s.name,
    COUNT(*) as productos_mas_baratos,
    AVG(COALESCE(pr.offer_price, pr.normal_price)) as precio_promedio
FROM prices pr
JOIN products p ON pr.product_id = p.id
JOIN supermarkets s ON p.supermarket_id = s.id
WHERE pr.is_current = true
GROUP BY s.id, s.name
ORDER BY precio_promedio ASC;
```
