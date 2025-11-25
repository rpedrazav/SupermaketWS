import { query } from '../database/index.js';
import { Supermarket } from '../../domain/entities/Supermarket.js';

export class SupermarketRepository {
  // Find all supermarkets
  async findAll({ isActive } = {}) {
    let sql = 'SELECT * FROM supermarkets';
    const params = [];
    
    if (isActive !== undefined) {
      sql += ' WHERE is_active = $1';
      params.push(isActive);
    }
    
    sql += ' ORDER BY name ASC';
    
    const result = await query(sql, params);
    return result.rows.map(row => Supermarket.fromDB(row));
  }

  // Find supermarket by ID
  async findById(id) {
    const sql = 'SELECT * FROM supermarkets WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows.length > 0 ? Supermarket.fromDB(result.rows[0]) : null;
  }

  // Find supermarket by slug
  async findBySlug(slug) {
    const sql = 'SELECT * FROM supermarkets WHERE slug = $1';
    const result = await query(sql, [slug]);
    return result.rows.length > 0 ? Supermarket.fromDB(result.rows[0]) : null;
  }

  // Find by chain group
  async findByChainGroup(chainGroup) {
    const sql = 'SELECT * FROM supermarkets WHERE chain_group = $1 ORDER BY name ASC';
    const result = await query(sql, [chainGroup]);
    return result.rows.map(row => Supermarket.fromDB(row));
  }

  // Create new supermarket
  async create(supermarket) {
    const validation = supermarket.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid supermarket: ${validation.errors.join(', ')}`);
    }

    const data = supermarket.toDB();
    const sql = `
      INSERT INTO supermarkets (
        name, slug, website_url, logo_url, chain_group, location, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await query(sql, [
      data.name,
      data.slug,
      data.website_url,
      data.logo_url,
      data.chain_group,
      data.location,
      data.is_active,
    ]);
    
    return Supermarket.fromDB(result.rows[0]);
  }

  // Update supermarket
  async update(id, updates) {
    const data = updates.toDB ? updates.toDB() : updates;
    
    const sql = `
      UPDATE supermarkets 
      SET 
        name = COALESCE($2, name),
        slug = COALESCE($3, slug),
        website_url = COALESCE($4, website_url),
        logo_url = COALESCE($5, logo_url),
        chain_group = COALESCE($6, chain_group),
        location = COALESCE($7, location),
        is_active = COALESCE($8, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(sql, [
      id,
      data.name,
      data.slug,
      data.website_url,
      data.logo_url,
      data.chain_group,
      data.location,
      data.is_active,
    ]);
    
    return result.rows.length > 0 ? Supermarket.fromDB(result.rows[0]) : null;
  }

  // Delete supermarket
  async delete(id) {
    const sql = 'DELETE FROM supermarkets WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }

  // Count supermarkets
  async count({ isActive } = {}) {
    let sql = 'SELECT COUNT(*) FROM supermarkets';
    const params = [];
    
    if (isActive !== undefined) {
      sql += ' WHERE is_active = $1';
      params.push(isActive);
    }
    
    const result = await query(sql, params);
    return parseInt(result.rows[0].count);
  }
}
