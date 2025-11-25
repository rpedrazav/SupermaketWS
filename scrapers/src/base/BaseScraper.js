import { chromium } from 'playwright';
import { 
  normalizeProductName, 
  extractPrice, 
  randomDelay, 
  getRandomUserAgent,
  retryWithBackoff 
} from './utils.js';

/**
 * Base Scraper Class
 * All supermarket scrapers should extend this class
 */
export class BaseScraper {
  constructor(config) {
    this.supermarketName = config.name;
    this.supermarketSlug = config.slug;
    this.baseUrl = config.baseUrl;
    this.location = config.location || 'Temuco';
    this.headless = config.headless !== false;
    this.browser = null;
    this.context = null;
    this.page = null;
    this.products = [];
  }

  /**
   * Initialize browser and context
   */
  async init() {
    console.log(`🚀 Initializing ${this.supermarketName} scraper...`);
    
    this.browser = await chromium.launch({
      headless: this.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });

    // Create context with realistic settings
    this.context = await this.browser.newContext({
      userAgent: getRandomUserAgent(),
      viewport: { width: 1920, height: 1080 },
      locale: 'es-CL',
      timezoneId: 'America/Santiago',
      geolocation: { latitude: -38.7359, longitude: -72.5904 }, // Temuco coordinates
      permissions: ['geolocation'],
    });

    this.page = await this.context.newPage();
    
    // Set default timeout
    this.page.setDefaultTimeout(30000);
    
    console.log(`✓ Browser initialized for ${this.supermarketName}`);
  }

  /**
   * Close browser
   */
  async close() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
    console.log(`✓ Browser closed for ${this.supermarketName}`);
  }

  /**
   * Navigate to a URL with retry
   */
  async navigateTo(url, waitUntil = 'domcontentloaded') {
    console.log(`📍 Navigating to: ${url}`);
    
    await retryWithBackoff(async () => {
      await this.page.goto(url, { 
        waitUntil,
        timeout: 30000 
      });
    });
    
    await randomDelay(1000, 2000);
  }

  /**
   * Set location/store (to be overridden by specific scrapers)
   */
  async setLocation() {
    // Override in subclass if needed
    console.log(`📍 Location: ${this.location}`);
  }

  /**
   * Scrape products from a category or search page
   * Must be implemented by subclass
   */
  async scrapeProducts() {
    throw new Error('scrapeProducts() must be implemented by subclass');
  }

  /**
   * Parse a single product element
   * Must be implemented by subclass
   */
  async parseProduct(element) {
    throw new Error('parseProduct() must be implemented by subclass');
  }

  /**
   * Main scraping flow
   */
  async scrape() {
    const startTime = Date.now();
    
    try {
      await this.init();
      await this.setLocation();
      await this.scrapeProducts();
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      console.log(`
✓ Scraping completed for ${this.supermarketName}
  - Products scraped: ${this.products.length}
  - Duration: ${duration}s
      `);
      
      return {
        success: true,
        supermarket: this.supermarketSlug,
        products: this.products,
        count: this.products.length,
        duration,
      };
    } catch (error) {
      console.error(`✗ Scraping failed for ${this.supermarketName}:`, error.message);
      
      return {
        success: false,
        supermarket: this.supermarketSlug,
        error: error.message,
        products: this.products,
        count: this.products.length,
      };
    } finally {
      await this.close();
    }
  }

  /**
   * Helper: Take screenshot for debugging
   */
  async screenshot(name = 'screenshot') {
    const filename = `screenshots/${this.supermarketSlug}-${name}-${Date.now()}.png`;
    await this.page.screenshot({ path: filename, fullPage: true });
    console.log(`📸 Screenshot saved: ${filename}`);
    return filename;
  }

  /**
   * Helper: Wait for selector with timeout
   */
  async waitForSelector(selector, timeout = 10000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      console.warn(`⚠ Selector not found: ${selector}`);
      return false;
    }
  }

  /**
   * Helper: Scroll page to load lazy content
   */
  async scrollPage(scrolls = 3) {
    for (let i = 0; i < scrolls; i++) {
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await randomDelay(500, 1000);
    }
  }

  /**
   * Create product object with normalized data
   */
  createProductObject(data) {
    return {
      externalId: data.externalId || null,
      name: data.name,
      normalizedName: normalizeProductName(data.name),
      description: data.description || null,
      brand: data.brand || null,
      category: data.category || 'Sin categoría',
      subcategory: data.subcategory || null,
      unit: data.unit || null,
      unitSize: data.unitSize || null,
      imageUrl: data.imageUrl || null,
      productUrl: data.productUrl || null,
      barcode: data.barcode || null,
      normalPrice: data.normalPrice,
      offerPrice: data.offerPrice || null,
      hasOffer: data.offerPrice !== null && data.offerPrice < data.normalPrice,
      offerDescription: data.offerDescription || null,
      pricePerUnit: data.pricePerUnit || null,
    };
  }
}

export default BaseScraper;
