/**
 * Utility functions for web scraping
 */

/**
 * Normalize product name for matching
 * @param {string} name - Product name
 * @returns {string} Normalized name
 */
export function normalizeProductName(name) {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Only alphanumeric and spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

/**
 * Extract price from text
 * @param {string} priceText - Price text (e.g., "$1.990", "1990")
 * @returns {number|null} Price as number
 */
export function extractPrice(priceText) {
  if (!priceText) return null;
  
  // Remove currency symbols, dots (thousand separators), and spaces
  const cleanPrice = priceText
    .replace(/[$\s.]/g, '')
    .replace(/,/g, '.'); // Convert comma to dot for decimals
  
  const price = parseFloat(cleanPrice);
  return isNaN(price) ? null : price;
}

/**
 * Wait for a random time to avoid detection
 * @param {number} min - Minimum milliseconds
 * @param {number} max - Maximum milliseconds
 * @returns {Promise<void>}
 */
export async function randomDelay(min = 1000, max = 3000) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Extract number from text
 * @param {string} text - Text containing number
 * @returns {number|null}
 */
export function extractNumber(text) {
  if (!text) return null;
  const match = text.match(/\d+/);
  return match ? parseInt(match[0]) : null;
}

/**
 * Clean and normalize text
 * @param {string} text - Text to clean
 * @returns {string}
 */
export function cleanText(text) {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Generate a slug from text
 * @param {string} text - Text to slugify
 * @returns {string}
 */
export function slugify(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise<any>}
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * User agents for rotation
 */
export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
];

/**
 * Get a random user agent
 * @returns {string}
 */
export function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}
