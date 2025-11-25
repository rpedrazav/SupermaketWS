/**
 * Format price in Chilean pesos
 */
export function formatPrice(price) {
  if (!price) return 'N/A';
  
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Calculate savings between two prices
 */
export function calculateSavings(normalPrice, offerPrice) {
  if (!offerPrice || offerPrice >= normalPrice) return 0;
  return normalPrice - offerPrice;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(normalPrice, offerPrice) {
  if (!offerPrice || offerPrice >= normalPrice) return 0;
  return Math.round(((normalPrice - offerPrice) / normalPrice) * 100);
}

/**
 * Format date in Spanish
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format relative time
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  return `Hace ${Math.floor(diffDays / 30)} meses`;
}

/**
 * Truncate text
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get supermarket logo placeholder
 */
export function getSupermarketLogo(slug) {
  // In a real app, these would be actual logo URLs
  const logos = {
    jumbo: '🏬',
    lider: '🏪',
    'santa-isabel': '🏬',
    acuenta: '🏪',
    unimarc: '🏬',
    'mayorista-10': '🏪',
    cugat: '🏬',
    'el-trebol': '🏪',
    eltit: '🏬',
  };
  
  return logos[slug] || '🏬';
}

/**
 * Get chain group color
 */
export function getChainColor(chainGroup) {
  const colors = {
    Cencosud: 'bg-blue-100 text-blue-800',
    Walmart: 'bg-yellow-100 text-yellow-800',
    SMU: 'bg-green-100 text-green-800',
    Regional: 'bg-purple-100 text-purple-800',
  };
  
  return colors[chainGroup] || 'bg-gray-100 text-gray-800';
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Group products by category
 */
export function groupByCategory(products) {
  return products.reduce((acc, product) => {
    const category = product.category || 'Sin categoría';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});
}
