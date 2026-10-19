/**
 * Thin REST client for the EcShopping Express API.
 * All server persistence for products and orders flows through here.
 * Requests degrade gracefully: callers should catch errors and fall back
 * to the local cache when the API is unreachable.
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const error = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(error);
  }

  return data;
}

const qs = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.append(key, value);
  });
  const str = search.toString();
  return str ? `?${str}` : '';
};

export const api = {
  /* Auth */
  registerVendor: (data) => request('/api/auth/vendor/register', { method: 'POST', body: data }),
  loginVendor: (email, password) => request('/api/auth/vendor/login', { method: 'POST', body: { email, password } }),

  /* Vendors (admin) */
  getVendors: (params) => request(`/api/vendors${qs(params)}`),
  updateVendorStatus: (id, status) => request(`/api/vendors/${encodeURIComponent(id)}/status`, { method: 'PUT', body: { status } }),
  updateVendorDirectSelling: (id, directSelling) => request(`/api/vendors/${encodeURIComponent(id)}/direct-selling`, { method: 'PUT', body: { directSelling } }),

  /* Products */
  getProducts: (params) => request(`/api/products${qs(params)}`),
  getProduct: (id) => request(`/api/products/${encodeURIComponent(id)}`),
  createProduct: (product) => request('/api/products', { method: 'POST', body: product }),
  updateProduct: (id, updates) => request(`/api/products/${encodeURIComponent(id)}`, { method: 'PUT', body: updates }),
  updateProductStatus: (id, status) => request(`/api/products/${encodeURIComponent(id)}/status`, { method: 'PUT', body: { status } }),
  deleteProduct: (id) => request(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  /* Reviews */
  getReviews: (params) => request(`/api/reviews${qs(params)}`),
  createReview: (review) => request('/api/reviews', { method: 'POST', body: review }),

  /* Orders */
  getOrders: (params) => request(`/api/orders${qs(params)}`),
  getOrder: (id) => request(`/api/orders/${encodeURIComponent(id)}`),
  createOrder: (order) => request('/api/orders', { method: 'POST', body: order }),
  updateOrderStatus: (id, status) => request(`/api/orders/${encodeURIComponent(id)}/status`, { method: 'PUT', body: { status } })
};

export default api;
