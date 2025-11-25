import { query } from '../database/index.js';
import { Product } from '../../domain/entities/Product.js';

export class ProductRepository {
  // Find all products with pagination
  async findAll({ limit = 20, offset = 0, supermarketId, category, isAvailable }) {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (supermarketId) {
      paramCount++;
      sql += ` AND supermarket_id = $${paramCount}`;
      params.push(supermarketId);
    }

    if (category) {
      paramCount++;
      sql += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (isAvailable !== undefined) {
      paramCount++;
      sql += ` AND is_available = $${paramCount}`;
      params.push(isAvailable);
    }

    sql += ' ORDER BY created_at DESC';
    
    paramCount++;
    sql += ` LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    sql += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await query(sql, params);
    return result.rows.map(row => Product.fromDB(row));
  }

  // Find product by ID
  async findById(id) {
    const sql = 'SELECT * FROM products WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows.length > 0 ? Product.fromDB(result.rows[0]) : null;
  }

  // Find by supermarket and external ID
  async findByExternalId(supermarketId, externalId) {
    const sql = 'SELECT * FROM products WHERE supermarket_id = $1 AND external_id = $2';
    const result = await query(sql, [supermarketId, externalId]);
    return result.rows.length > 0 ? Product.fromDB(result.rows[0]) : null;
  }

  // Search products by name
  async search(searchTerm, { limit = 20, offset = 0 }) {
    const normalizedTerm = searchTerm.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    
    const sql = `
      SELECT * FROM products 
      WHERE normalized_name % $1
      OR normalized_name ILIKE $2
      ORDER BY similarity(normalized_name, $1) DESC
      LIMIT $3 OFFSET $4
    `;
    
    const result = await query(sql, [
      normalizedTerm,
      `%${normalizedTerm}%`,
      limit,
      offset
    ]);
    
    return result.rows.map(row => Product.fromDB(row));
  }

  // Find similar products for matching
  async findSimilar(normalizedName, category, threshold = 0.65) {
    const sql = `
      SELECT 
        *,
        similarity(normalized_name, $1) as similarity_score
      FROM products 
      WHERE category = $2
      AND similarity(normalized_name, $1) > $3
      ORDER BY similarity_score DESC
      LIMIT 10
    `;
    
    const result = await query(sql, [normalizedName, category, threshold]);
    return result.rows.map(row => ({
      product: Product.fromDB(row),
      score: row.similarity_score,
    }));
  }

  // Create new product
  async create(product) {
    const validation = product.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid product: ${validation.errors.join(', ')}`);
    }

    const data = product.toDB();
    const sql = `
      INSERT INTO products (
        supermarket_id, external_id, name, normalized_name, description,
        brand, category, subcategory, unit, unit_size, image_url,
        product_url, barcode, is_available, last_scraped_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    
    const result = await query(sql, [
      data.supermarket_id,
      data.external_id,
      data.name,
      data.normalized_name,
      data.description,
      data.brand,
      data.category,
      data.subcategory,
      data.unit,
      data.unit_size,
      data.image_url,
      data.product_url,
      data.barcode,
      data.is_available,
      data.last_scraped_at,
    ]);
    
    return Product.fromDB(result.rows[0]);
  }

  // Update product
  async update(id, updates) {
    const data = updates.toDB ? updates.toDB() : updates;
    
    const sql = `
      UPDATE products 
      SET 
        name = COALESCE($2, name),
        normalized_name = COALESCE($3, normalized_name),
        description = COALESCE($4, description),
        brand = COALESCE($5, brand),
        category = COALESCE($6, category),
        subcategory = COALESCE($7, subcategory),
        unit = COALESCE($8, unit),
        unit_size = COALESCE($9, unit_size),
        image_url = COALESCE($10, image_url),
        product_url = COALESCE($11, product_url),
        barcode = COALESCE($12, barcode),
        is_available = COALESCE($13, is_available),
        last_scraped_at = COALESCE($14, last_scraped_at),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(sql, [
      id,
      data.name,
      data.normalized_name,
      data.description,
      data.brand,
      data.category,
      data.subcategory,
      data.unit,
      data.unit_size,
      data.image_url,
      data.product_url,
      data.barcode,
      data.is_available,
      data.last_scraped_at,
    ]);
    
    return result.rows.length > 0 ? Product.fromDB(result.rows[0]) : null;
  }

  // Delete product
  async delete(id) {
    const sql = 'DELETE FROM products WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }

  // Count total products
  async count({ supermarketId, category, isAvailable }) {
    let sql = 'SELECT COUNT(*) FROM products WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (supermarketId) {
      paramCount++;
      sql += ` AND supermarket_id = $${paramCount}`;
      params.push(supermarketId);
    }

    if (category) {
      paramCount++;
      sql += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (isAvailable !== undefined) {
      paramCount++;
      sql += ` AND is_available = $${paramCount}`;
      params.push(isAvailable);
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].count);
  }
}
