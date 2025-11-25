// Supermarket entity - Domain model
export class Supermarket {
  constructor({
    id,
    name,
    slug,
    websiteUrl,
    logoUrl,
    chainGroup,
    location = 'Temuco',
    isActive = true,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.name = name;
    this.slug = slug || this.generateSlug(name);
    this.websiteUrl = websiteUrl;
    this.logoUrl = logoUrl;
    this.chainGroup = chainGroup; // 'Cencosud', 'Walmart', 'SMU', 'Regional'
    this.location = location;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Generate URL-friendly slug from name
  generateSlug(name) {
    if (!name) return '';
    
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Validate supermarket data
  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim() === '') {
      errors.push('Supermarket name is required');
    }
    
    if (!this.websiteUrl) {
      errors.push('Website URL is required');
    }
    
    if (!this.slug) {
      errors.push('Slug is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Convert to database format
  toDB() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      website_url: this.websiteUrl,
      logo_url: this.logoUrl,
      chain_group: this.chainGroup,
      location: this.location,
      is_active: this.isActive,
    };
  }

  // Create from database record
  static fromDB(dbRecord) {
    if (!dbRecord) return null;
    
    return new Supermarket({
      id: dbRecord.id,
      name: dbRecord.name,
      slug: dbRecord.slug,
      websiteUrl: dbRecord.website_url,
      logoUrl: dbRecord.logo_url,
      chainGroup: dbRecord.chain_group,
      location: dbRecord.location,
      isActive: dbRecord.is_active,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    });
  }
}
