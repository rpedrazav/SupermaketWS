// Price entity - Domain model
export class Price {
  constructor({
    id,
    productId,
    normalPrice,
    offerPrice,
    discountPercentage,
    hasOffer,
    offerDescription,
    pricePerUnit,
    currency = 'CLP',
    isCurrent = true,
    effectiveDate,
    createdAt,
  }) {
    this.id = id;
    this.productId = productId;
    this.normalPrice = parseFloat(normalPrice);
    this.offerPrice = offerPrice ? parseFloat(offerPrice) : null;
    this.discountPercentage = discountPercentage ? parseFloat(discountPercentage) : null;
    this.hasOffer = hasOffer || false;
    this.offerDescription = offerDescription;
    this.pricePerUnit = pricePerUnit ? parseFloat(pricePerUnit) : null;
    this.currency = currency;
    this.isCurrent = isCurrent;
    this.effectiveDate = effectiveDate || new Date();
    this.createdAt = createdAt;
  }

  // Calculate discount percentage if not provided
  calculateDiscount() {
    if (this.offerPrice && this.normalPrice > 0) {
      const discount = ((this.normalPrice - this.offerPrice) / this.normalPrice) * 100;
      this.discountPercentage = Math.round(discount * 100) / 100; // Round to 2 decimals
      this.hasOffer = true;
    } else {
      this.discountPercentage = null;
      this.hasOffer = false;
    }
  }

  // Get the effective price (offer if available, otherwise normal)
  getEffectivePrice() {
    return this.offerPrice || this.normalPrice;
  }

  // Get savings amount
  getSavings() {
    if (this.hasOffer && this.offerPrice) {
      return this.normalPrice - this.offerPrice;
    }
    return 0;
  }

  // Validate price data
  validate() {
    const errors = [];
    
    if (!this.productId) {
      errors.push('Product ID is required');
    }
    
    if (!this.normalPrice || this.normalPrice <= 0) {
      errors.push('Normal price must be greater than 0');
    }
    
    if (this.offerPrice && this.offerPrice > this.normalPrice) {
      errors.push('Offer price cannot be greater than normal price');
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
      product_id: this.productId,
      normal_price: this.normalPrice,
      offer_price: this.offerPrice,
      discount_percentage: this.discountPercentage,
      has_offer: this.hasOffer,
      offer_description: this.offerDescription,
      price_per_unit: this.pricePerUnit,
      currency: this.currency,
      is_current: this.isCurrent,
      effective_date: this.effectiveDate,
    };
  }

  // Create from database record
  static fromDB(dbRecord) {
    if (!dbRecord) return null;
    
    return new Price({
      id: dbRecord.id,
      productId: dbRecord.product_id,
      normalPrice: dbRecord.normal_price,
      offerPrice: dbRecord.offer_price,
      discountPercentage: dbRecord.discount_percentage,
      hasOffer: dbRecord.has_offer,
      offerDescription: dbRecord.offer_description,
      pricePerUnit: dbRecord.price_per_unit,
      currency: dbRecord.currency,
      isCurrent: dbRecord.is_current,
      effectiveDate: dbRecord.effective_date,
      createdAt: dbRecord.created_at,
    });
  }
}
