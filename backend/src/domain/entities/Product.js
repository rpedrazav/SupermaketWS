// Product entity - Domain model
export class Product {
  constructor({
    id,
    supermarketId,
    externalId,
    name,
    normalizedName,
    description,
    brand,
    category,
    subcategory,
    unit,
    unitSize,
    imageUrl,
    productUrl,
    barcode,
    isAvailable,
    createdAt,
    updatedAt,
    lastScrapedAt,
  }) {
    this.id = id;
    this.supermarketId = supermarketId;
    this.externalId = externalId;
    this.name = name;
    this.normalizedName = normalizedName || this.normalizeName(name);
    this.description = description;
    this.brand = brand;
    this.category = category;
    this.subcategory = subcategory;
    this.unit = unit;
    this.unitSize = unitSize;
    this.imageUrl = imageUrl;
    this.productUrl = productUrl;
    this.barcode = barcode;
    this.isAvailable = isAvailable !== false; // default true
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.lastScrapedAt = lastScrapedAt;
  }

  // Normalize product name for matching
  normalizeName(name) {
    if (!name) return '';
    
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s]/g, '') // Only alphanumeric and spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  // Validate product data
  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim() === '') {
      errors.push('Product name is required');
    }
    
    if (!this.supermarketId) {
      errors.push('Supermarket ID is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Convert to database format (snake_case)
  toDB() {
    return {
      id: this.id,
      supermarket_id: this.supermarketId,
      external_id: this.externalId,
      name: this.name,
      normalized_name: this.normalizedName,
      description: this.description,
      brand: this.brand,
      category: this.category,
      subcategory: this.subcategory,
      unit: this.unit,
      unit_size: this.unitSize,
      image_url: this.imageUrl,
      product_url: this.productUrl,
      barcode: this.barcode,
      is_available: this.isAvailable,
      last_scraped_at: this.lastScrapedAt || new Date(),
    };
  }

  // Create from database record (snake_case to camelCase)
  static fromDB(dbRecord) {
    if (!dbRecord) return null;
    
    return new Product({
      id: dbRecord.id,
      supermarketId: dbRecord.supermarket_id,
      externalId: dbRecord.external_id,
      name: dbRecord.name,
      normalizedName: dbRecord.normalized_name,
      description: dbRecord.description,
      brand: dbRecord.brand,
      category: dbRecord.category,
      subcategory: dbRecord.subcategory,
      unit: dbRecord.unit,
      unitSize: dbRecord.unit_size,
      imageUrl: dbRecord.image_url,
      productUrl: dbRecord.product_url,
      barcode: dbRecord.barcode,
      isAvailable: dbRecord.is_available,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      lastScrapedAt: dbRecord.last_scraped_at,
    });
  }
}
