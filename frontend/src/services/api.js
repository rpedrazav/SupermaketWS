import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },
  
  search: async (query, params = {}) => {
    const response = await apiClient.get('/products/search', {
      params: { q: query, ...params },
    });
    return response.data;
  },
  
  getPriceHistory: async (id, params = {}) => {
    const response = await apiClient.get(`/products/${id}/history`, { params });
    return response.data;
  },
};

// Supermarkets API
export const supermarketsAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/supermarkets', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`/supermarkets/${id}`);
    return response.data;
  },
  
  getBySlug: async (slug) => {
    const response = await apiClient.get(`/supermarkets/slug/${slug}`);
    return response.data;
  },
  
  getByChain: async (chainGroup) => {
    const response = await apiClient.get(`/supermarkets/chain/${chainGroup}`);
    return response.data;
  },
};

// Prices API
export const pricesAPI = {
  compare: async (masterProductId) => {
    const response = await apiClient.get('/prices/compare', {
      params: { masterProductId },
    });
    return response.data;
  },
  
  getOffers: async (params = {}) => {
    const response = await apiClient.get('/prices/offers', { params });
    return response.data;
  },
  
  getHistory: async (productId, params = {}) => {
    const response = await apiClient.get(`/prices/history/${productId}`, { params });
    return response.data;
  },
};

// Error interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // No response received
      console.error('Network Error:', error.request);
    } else {
      // Error in request setup
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
