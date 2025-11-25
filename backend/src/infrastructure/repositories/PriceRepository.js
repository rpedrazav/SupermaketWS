import { query } from '../database/index.js';
import { Price } from '../../domain/entities/Price.js';

export class PriceRepository {
  // Find current price for a product
  async findCurrentByProductId(productId) {
    const sql = 'SELECT * FROM prices WHERE product_id = $1 AND is_current = true';
    const result = await query(sql, [productId]);
    return result.rows.length > 0 ? Price.fromDB(result.rows[0]) : null;
  }

  // Find price history for a product
  async findHistoryByProductId(productId, { limit = 30, offset = 0 }) {
    const sql = `
      SELECT * FROM price_history 
      WHERE product_id = $1 
      ORDER BY recorded_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [productId, limit, offset]);
    return result.rows;
  }

  // Compare prices across supermarkets for similar products
  async compareByMasterProduct(masterProductId) {
    const sql = `
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.brand,
        p.image_url,
        s.name as supermarket_name,
        s.slug as supermarket_slug,
        s.chain_group,
        pr.normal_price,
        pr.offer_price,
        pr.has_offer,
        pr.discount_percentage,
        pr.price_per_unit,
        pm.similarity_score
      FROM product_matches pm
      JOIN products p ON pm.matched_product_id = p.id
      JOIN supermarkets s ON p.supermarket_id = s.id
      JOIN prices pr ON p.id = pr.product_id
      WHERE pm.master_product_id = $1
      AND pr.is_current = true
      AND p.is_available = true
      AND s.is_active = true
      ORDER BY COALESCE(pr.offer_price, pr.normal_price) ASC
    `;
    
    const result = await query(sql, [masterProductId]);
    return result.rows;
  }

  // Find products with offers
  async findWithOffers({ limit = 20, offset = 0, supermarketId }) {
    let sql = `
      SELECT 
        pr.*,
        p.name as product_name,
        p.brand,
        p.image_url,
        s.name as supermarket_name
      FROM prices pr
      JOIN products p ON pr.product_id = p.id
      JOIN supermarkets s ON p.supermarket_id = s.id
      WHERE pr.has_offer = true 
      AND pr.is_current = true
      AND p.is_available = true
    `;
    const params = [];
    let paramCount = 0;

    if (supermarketId) {
      paramCount++;
      sql += ` AND p.supermarket_id = $${paramCount}`;
      params.push(supermarketId);
    }

    sql += ' ORDER BY pr.discount_percentage DESC';
    
    paramCount++;
    sql += ` LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    sql += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await query(sql, params);
    return result.rows;
  }

  // Create new price
  async create(price) {
    const validation = price.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid price: ${validation.errors.join(', ')}`);
    }

    // Calculate discount if not set
    price.calculateDiscount();

    const data = price.toDB();
    const sql = `
      INSERT INTO prices (
        product_id, normal_price, offer_price, discount_percentage,
        has_offer, offer_description, price_per_unit, currency,
        is_current, effective_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const result = await query(sql, [
      data.product_id,
      data.normal_price,
      data.offer_price,
      data.discount_percentage,
      data.has_offer,
      data.offer_description,
      data.price_per_unit,
      data.currency,
      data.is_current,
      data.effective_date,
    ]);
    
    return Price.fromDB(result.rows[0]);
  }

  // Update price
  async update(id, updates) {
    const data = updates.toDB ? updates.toDB() : updates;
    
    const sql = `
      UPDATE prices 
      SET 
        normal_price = COALESCE($2, normal_price),
        offer_price = COALESCE($3, offer_price),
        discount_percentage = COALESCE($4, discount_percentage),
        has_offer = COALESCE($5, has_offer),
        offer_description = COALESCE($6, offer_description),
        price_per_unit = COALESCE($7, price_per_unit),
        is_current = COALESCE($8, is_current)
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(sql, [
      id,
      data.normal_price,
      data.offer_price,
      data.discount_percentage,
      data.has_offer,
      data.offer_description,
      data.price_per_unit,
      data.is_current,
    ]);
    
    return result.rows.length > 0 ? Price.fromDB(result.rows[0]) : null;
  }

  // Get price statistics by supermarket
  async getStatsBySupermarket(supermarketId) {
    const sql = `
      SELECT 
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE pr.has_offer = true) as products_with_offers,
        AVG(COALESCE(pr.offer_price, pr.normal_price)) as avg_price,
        MIN(COALESCE(pr.offer_price, pr.normal_price)) as min_price,
        MAX(COALESCE(pr.offer_price, pr.normal_price)) as max_price,
        AVG(pr.discount_percentage) FILTER (WHERE pr.has_offer = true) as avg_discount
      FROM prices pr
      JOIN products p ON pr.product_id = p.id
      WHERE p.supermarket_id = $1
      AND pr.is_current = true
      AND p.is_available = true
    `;
    
    const result = await query(sql, [supermarketId]);
    return result.rows[0];
  }
}
