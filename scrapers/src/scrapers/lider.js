import BaseScraper from '../base/BaseScraper.js';
import { extractPrice, randomDelay } from '../base/utils.js';

/**
 * Lider Scraper
 * Scrapes products from Lider (Walmart Chile)
 */
export class LiderScraper extends BaseScraper {
  constructor() {
    super({
      name: 'Lider',
      slug: 'lider',
      baseUrl: 'https://www.lider.cl',
      location: 'Temuco',
    });
    
    // Categories to scrape
    this.categories = [
      { name: 'Lácteos y Huevos', url: '/supermercado/category/Lácteos-y-Huevos' },
      { name: 'Bebidas', url: '/supermercado/category/Bebidas' },
      { name: 'Despensa', url: '/supermercado/category/Despensa' },
      { name: 'Snacks', url: '/supermercado/category/Snacks-y-Dulces' },
      { name: 'Carnes y Pescados', url: '/supermercado/category/Carnes-y-Pescados' },
    ];
  }

  /**
   * Set location to Temuco
   */
  async setLocation() {
    console.log(`📍 Setting location to: ${this.location}`);
    
    await this.navigateTo(`${this.baseUrl}/supermercado`);
    
    // Wait for page to load
    await randomDelay(2000, 3000);
    
    // Look for location/store selector
    const storeButtonExists = await this.waitForSelector('[data-testid="store-selector"], [class*="StoreSelector"]', 5000);
    
    if (storeButtonExists) {
      await this.page.click('[data-testid="store-selector"], [class*="StoreSelector"]');
      await randomDelay(1000, 2000);
      
      // Type "Temuco" in search
      const searchInputExists = await this.waitForSelector('input[placeholder*="tienda"], input[placeholder*="ubicación"]', 5000);
      
      if (searchInputExists) {
        await this.page.fill('input[placeholder*="tienda"], input[placeholder*="ubicación"]', 'Temuco');
        await randomDelay(500, 1000);
        
        // Select first Temuco store result
        await this.page.click('[data-testid="store-option"]:first-child, [class*="StoreOption"]:first-child');
        await randomDelay(1500, 2500);
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
    const productsLoaded = await this.waitForSelector(
      '[data-testid="product"], [class*="ProductCard"], [class*="product-card"]',
      10000
    );
    
    if (!productsLoaded) {
      console.warn(`⚠ No products found for category: ${category.name}`);
      return;
    }
    
    // Scroll to load more products
    await this.scrollPage(4);
    await randomDelay(2000, 3000);
    
    // Get all product elements
    const productElements = await this.page.$$(
      '[data-testid="product"], [class*="ProductCard"], [class*="product-card"]'
    );
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
      // Extract product name
      const name = await element.$eval(
        '[data-testid="product-title"], [class*="ProductTitle"], h3, h4',
        el => el.textContent.trim()
      ).catch(() => null);
      
      if (!name) return null;
      
      // Extract prices
      const normalPriceText = await element.$eval(
        '[data-testid="normal-price"], [class*="NormalPrice"], [class*="price-normal"]',
        el => el.textContent.trim()
      ).catch(() => null);
      
      const offerPriceText = await element.$eval(
        '[data-testid="offer-price"], [class*="OfferPrice"], [class*="price-offer"]',
        el => el.textContent.trim()
      ).catch(() => null);
      
      // Extract image
      const imageUrl = await element.$eval(
        'img[data-testid="product-image"], img[class*="ProductImage"]',
        el => el.src || el.dataset.src
      ).catch(() => null);
      
      // Extract product URL
      const productUrl = await element.$eval(
        'a[data-testid="product-link"], a[href*="/product/"]',
        el => el.href
      ).catch(() => null);
      
      // Extract brand
      const brand = await element.$eval(
        '[data-testid="brand"], [class*="Brand"], [class*="brand"]',
        el => el.textContent.trim()
      ).catch(() => null);
      
      // Extract unit info
      const unitInfo = await element.$eval(
        '[data-testid="unit"], [class*="Unit"], [class*="unit"]',
        el => el.textContent.trim()
      ).catch(() => null);
      
      // Parse prices
      const normalPrice = extractPrice(normalPriceText);
      const offerPrice = extractPrice(offerPriceText);
      
      if (!normalPrice) return null;
      
      // Extract product ID from URL
      const externalId = productUrl ? productUrl.split('/').pop().split('?')[0] : null;
      
      // Extract price per unit if available
      const pricePerUnitText = await element.$eval(
        '[data-testid="price-per-unit"], [class*="PricePerUnit"]',
        el => el.textContent.trim()
      ).catch(() => null);
      const pricePerUnit = extractPrice(pricePerUnitText);
      
      return this.createProductObject({
        externalId,
        name,
        brand,
        category,
        imageUrl,
        productUrl,
        normalPrice,
        offerPrice,
        pricePerUnit,
        description: unitInfo,
      });
    } catch (error) {
      console.warn(`  ⚠ Error parsing product element:`, error.message);
      return null;
    }
  }
}

export default LiderScraper;
