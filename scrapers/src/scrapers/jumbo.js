import BaseScraper from '../base/BaseScraper.js';
import { extractPrice, randomDelay } from '../base/utils.js';

/**
 * Jumbo Scraper
 * Scrapes products from Jumbo (Cencosud) - Portal Temuco
 */
export class JumboScraper extends BaseScraper {
  constructor() {
    super({
      name: 'Jumbo',
      slug: 'jumbo',
      baseUrl: 'https://www.jumbo.cl',
      location: 'Portal Temuco',
    });
    
    // Categories to scrape (can be expanded)
    this.categories = [
      { name: 'Lácteos', url: '/lacteos-y-huevos' },
      { name: 'Bebidas', url: '/bebidas' },
      { name: 'Despensa', url: '/despensa' },
      { name: 'Snacks', url: '/snacks-y-dulces' },
      { name: 'Carnes', url: '/carnes-y-pescados' },
    ];
  }

  /**
   * Set location to Portal Temuco
   */
  async setLocation() {
    console.log(`📍 Setting location to: ${this.location}`);
    
    await this.navigateTo(this.baseUrl);
    
    // Check if there's a location selector
    // Note: This is a generic implementation - adjust selectors based on actual site structure
    const locationButtonExists = await this.waitForSelector('[data-testid="location-selector"]', 5000);
    
    if (locationButtonExists) {
      await this.page.click('[data-testid="location-selector"]');
      await randomDelay(1000, 2000);
      
      // Search for "Portal Temuco" or "Temuco"
      const searchInputExists = await this.waitForSelector('input[placeholder*="ubicación"]', 5000);
      
      if (searchInputExists) {
        await this.page.fill('input[placeholder*="ubicación"]', 'Portal Temuco');
        await randomDelay(500, 1000);
        
        // Click on the first result
        await this.page.click('[data-testid="location-result"]:first-child');
        await randomDelay(1000, 2000);
      }
    }
    
    console.log(`✓ Location set to ${this.location}`);
  }

  /**
   * Scrape products from all categories
   */
  async scrapeProducts() {
    console.log(`🔍 Starting to scrape products from ${this.categories.length} categories...`);
    
    for (const category of this.categories) {
      try {
        console.log(`\n📂 Scraping category: ${category.name}`);
        await this.scrapeCategoryProducts(category);
      } catch (error) {
        console.error(`✗ Error scraping category ${category.name}:`, error.message);
      }
    }
  }

  /**
   * Scrape products from a single category
   */
  async scrapeCategoryProducts(category) {
    const categoryUrl = `${this.baseUrl}${category.url}`;
    await this.navigateTo(categoryUrl, 'networkidle');
    
    // Wait for products to load
    const productsLoaded = await this.waitForSelector('[data-testid="product-card"], .product-card, [class*="ProductCard"]', 10000);
    
    if (!productsLoaded) {
      console.warn(`⚠ No products found for category: ${category.name}`);
      return;
    }
    
    // Scroll to load more products
    await this.scrollPage(3);
    
    // Get all product elements
    // Note: Adjust selectors based on actual site structure
    const productElements = await this.page.$$('[data-testid="product-card"], .product-card, [class*="ProductCard"]');
    console.log(`  Found ${productElements.length} product elements`);
    
    for (const element of productElements) {
      try {
        const product = await this.parseProduct(element, category.name);
        if (product) {
          this.products.push(product);
        }
      } catch (error) {
        console.warn(`  ⚠ Error parsing product:`, error.message);
      }
    }
    
    console.log(`  ✓ Scraped ${productElements.length} products from ${category.name}`);
  }

  /**
   * Parse a single product element
   */
  async parseProduct(element, category) {
    try {
      // Extract product data
      // Note: These selectors are generic and need to be adjusted based on actual Jumbo site structure
      
      const name = await element.$eval(
        '[data-testid="product-name"], .product-name, [class*="ProductName"]',
        el => el.textContent.trim()
      ).catch(() => null);
      
      if (!name) return null;
      
      const normalPriceText = await element.$eval(
        '[data-testid="product-price"], .product-price, [class*="ProductPrice"]',
        el => el.textContent.trim()
      ).catch(() => null);
      
      const offerPriceText = await element.$eval(
        '[data-testid="product-offer-price"], .offer-price, [class*="OfferPrice"]',
        el => el.textContent.trim()
      ).catch(() => null);
      
      const imageUrl = await element.$eval(
        'img[data-testid="product-image"], img.product-image, img[class*="ProductImage"]',
        el => el.src
      ).catch(() => null);
      
      const productUrl = await element.$eval(
        'a[data-testid="product-link"], a[class*="ProductLink"]',
        el => el.href
      ).catch(() => null);
      
      const brand = await element.$eval(
        '[data-testid="product-brand"], .product-brand, [class*="Brand"]',
        el => el.textContent.trim()
      ).catch(() => null);
      
      // Extract prices
      const normalPrice = extractPrice(normalPriceText);
      const offerPrice = extractPrice(offerPriceText);
      
      if (!normalPrice) return null;
      
      // Extract product ID from URL
      const externalId = productUrl ? productUrl.split('/').pop().split('?')[0] : null;
      
      return this.createProductObject({
        externalId,
        name,
        brand,
        category,
        imageUrl,
        productUrl: productUrl ? `${this.baseUrl}${productUrl}` : null,
        normalPrice,
        offerPrice,
      });
    } catch (error) {
      console.warn(`  ⚠ Error parsing product element:`, error.message);
      return null;
    }
  }
}

export default JumboScraper;
