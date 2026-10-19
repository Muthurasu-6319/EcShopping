// Storage utility: localStorage cache backed by the TiDB server for
// products and orders. Reads stay synchronous (from the cache); writes
// update the cache immediately and push to the server in the background.

import api from './api';

const VENDORS_KEY = 'ecshopping_vendors';
const PRODUCTS_KEY = 'ecshopping_products';
const CUSTOMERS_KEY = 'ecshopping_customers';
const ORDERS_KEY = 'ecshopping_orders';

// Fire-and-forget server push; never blocks the UI.
const pushToServer = (operation) => {
  Promise.resolve()
    .then(operation)
    .catch((err) => console.warn('[api] background sync failed:', err.message));
};

const normalizeProduct = (p) => ({
  id: p.id,
  vendorId: p.vendorId || p.vendor_id || null,
  vendorName: p.vendorName || p.vendor_name || '',
  title: p.title || p.name || 'Untitled product',
  name: p.name || p.title || 'Untitled product',
  description: p.description || '',
  category: p.category || 'General',
  price: Number(p.price) || 0,
  strikePrice: p.strikePrice != null && p.strikePrice !== '' ? Number(p.strikePrice) : null,
  unit: p.unit || '',
  image: p.image || '',
  stockStatus: p.stockStatus || (p.inStock === false ? 'out_of_stock' : 'in_stock'),
  inStock: (p.stockStatus || 'in_stock') !== 'out_of_stock',
  status: p.status || 'pending',
  createdAt: p.createdAt || new Date().toISOString()
});

const normalizeVendor = (v) => ({
  id: v.id,
  name: v.name,
  email: v.email,
  phone: v.phone || '',
  status: v.status || 'pending',
  directSelling: v.directSelling != null ? Boolean(v.directSelling) : Boolean(v.direct_selling),
  createdAt: v.createdAt || v.created_at || new Date().toISOString()
});

const normalizeOrder = (o) => {
  let shippingAddress = o.shippingAddress;
  if (typeof shippingAddress === 'string') {
    try { shippingAddress = JSON.parse(shippingAddress); } catch { shippingAddress = null; }
  }
  return {
    ...o,
    shippingAddress,
    items: Array.isArray(o.items) ? o.items : [],
    totalAmount: o.totalAmount != null ? Number(o.totalAmount) : Number(o.total) || 0,
    status: o.status || 'Processing',
    date: o.date || new Date().toISOString()
  };
};

// Initialize mock data if empty
export const initStorage = () => {
  if (!localStorage.getItem(VENDORS_KEY)) {
    localStorage.setItem(VENDORS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(CUSTOMERS_KEY)) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(ORDERS_KEY)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
  }
};

export const getVendors = () => {
  return JSON.parse(localStorage.getItem(VENDORS_KEY) || '[]');
};

export const addVendor = (vendor) => {
  const vendors = getVendors();
  const newVendor = {
    ...vendor,
    id: 'v' + Date.now(),
    createdAt: new Date().toISOString()
  };
  vendors.push(newVendor);
  localStorage.setItem(VENDORS_KEY, JSON.stringify(vendors));
  return newVendor;
};

export const updateVendorStatus = (id, status) => {
  const vendors = getVendors();
  const updated = vendors.map(v => v.id === id ? { ...v, status } : v);
  localStorage.setItem(VENDORS_KEY, JSON.stringify(updated));
  pushToServer(() => api.updateVendorStatus(id, status));
};

export const toggleVendorDirectSelling = (id, directSelling) => {
  const vendors = getVendors();
  const updated = vendors.map(v => v.id === id ? { ...v, directSelling } : v);
  localStorage.setItem(VENDORS_KEY, JSON.stringify(updated));
  pushToServer(() => api.updateVendorDirectSelling(id, directSelling));
};

export const deleteVendor = (id) => {
  const vendors = getVendors();
  const updated = vendors.filter(v => v.id !== id);
  localStorage.setItem(VENDORS_KEY, JSON.stringify(updated));
};

export const verifyVendorLogin = (email, password) => {
  const vendors = getVendors();
  const vendor = vendors.find(v => v.email === email && v.password === password);
  if (!vendor) return { success: false, message: 'Invalid credentials' };
  if (vendor.status === 'pending') return { success: false, message: 'Your account is pending admin approval' };
  if (vendor.status === 'rejected') return { success: false, message: 'Your account has been rejected' };
  return { success: true, vendor };
};

// --- Product Management ---

export const getProducts = () => {
  return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
};

export const addProduct = (vendor, productData) => {
  const products = getProducts();

  const newProduct = {
    ...productData,
    id: 'p' + Date.now(),
    vendorId: vendor.id,
    vendorName: vendor.name,
    status: 'pending', // Every new listing awaits admin approval
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

  // Persist to the server so admins can review it from any device.
  pushToServer(() => api.createProduct(newProduct));

  return newProduct;
};

export const updateProductStatus = (id, status) => {
  const products = getProducts();
  const updated = products.map(p => p.id === id ? { ...p, status } : p);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
  pushToServer(() => api.updateProductStatus(id, status));
};

export const deleteProduct = (id) => {
  const products = getProducts();
  const updated = products.filter(p => p.id !== id);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
  pushToServer(() => api.deleteProduct(id));
  return updated;
};

export const updateProduct = (id, updatedData) => {
  const products = getProducts();
  const updated = products.map(p => p.id === id ? { ...p, ...updatedData } : p);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
  pushToServer(() => api.updateProduct(id, updatedData));
  return updated.find(p => p.id === id);
};

export const toggleProductStock = (id) => {
  const products = getProducts();
  const target = products.find(p => p.id === id);
  if (!target) return null;
  const newInStock = target.stockStatus === 'in_stock' ? false : target.inStock === false ? true : false;
  const newStatus = newInStock ? 'in_stock' : 'out_of_stock';
  const updated = products.map(p => p.id === id ? { ...p, inStock: newInStock, stockStatus: newStatus } : p);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
  pushToServer(() => api.updateProduct(id, { stockStatus: newStatus }));
  return { ...target, inStock: newInStock, stockStatus: newStatus };
};

export const updateVendor = (id, updatedData) => {
  const vendors = getVendors();
  const updated = vendors.map(v => v.id === id ? { ...v, ...updatedData } : v);
  localStorage.setItem(VENDORS_KEY, JSON.stringify(updated));
  // Also update current vendor session if matching
  const current = JSON.parse(localStorage.getItem('ecshopping_current_vendor') || 'null');
  if (current && current.id === id) {
    localStorage.setItem('ecshopping_current_vendor', JSON.stringify({ ...current, ...updatedData }));
  }
  return { ...updatedData, id };
};

// --- Customer Management ---

const CURRENT_CUSTOMER_KEY = 'ecshopping_current_customer';

export const getCurrentCustomer = () => {
  return JSON.parse(localStorage.getItem(CURRENT_CUSTOMER_KEY) || 'null');
};

export const setCurrentCustomer = (customer) => {
  if (customer) {
    localStorage.setItem(CURRENT_CUSTOMER_KEY, JSON.stringify(customer));
  } else {
    localStorage.removeItem(CURRENT_CUSTOMER_KEY);
  }
};

export const getCustomers = () => {
  return JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
};

export const addCustomer = (customerData) => {
  const customers = getCustomers();
  
  // Prevent duplicate email
  const existing = customers.find(c => c.email.toLowerCase() === customerData.email.toLowerCase());
  if (existing) {
    return { success: false, message: 'Email already exists', customer: existing };
  }

  const newCustomer = {
    ...customerData,
    id: 'c' + Date.now(),
    createdAt: new Date().toISOString()
  };
  
  customers.push(newCustomer);
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  return { success: true, customer: newCustomer };
};

// --- Order Management ---

export const getOrders = () => {
  return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
};

export const getCustomerOrders = (customerEmail) => {
  const orders = getOrders();
  return orders.filter(o => o.customerEmail && o.customerEmail.toLowerCase() === (customerEmail || '').toLowerCase());
};

export const getVendorOrders = (vendorId, vendorName) => {
  const orders = getOrders();
  return orders.filter(o => {
    if (!o.items) return false;
    return o.items.some(item => {
      if (item.vendorId && vendorId && String(item.vendorId) === String(vendorId)) return true;
      const itemSeller = (item.soldBy || item.vendorName || item.seller || '').toLowerCase();
      const vName = (vendorName || '').toLowerCase();
      return itemSeller && vName && (itemSeller.includes(vName) || vName.includes(itemSeller));
    });
  }).map(order => ({
    ...order,
    // Filter only items belonging to this vendor for their breakdown
    vendorItems: order.items.filter(item => {
      if (item.vendorId && vendorId && String(item.vendorId) === String(vendorId)) return true;
      const itemSeller = (item.soldBy || item.vendorName || item.seller || '').toLowerCase();
      const vName = (vendorName || '').toLowerCase();
      return itemSeller && vName && (itemSeller.includes(vName) || vName.includes(itemSeller));
    })
  }));
};

export const addOrder = (orderData) => {
  const orders = getOrders();
  const newOrder = {
    ...orderData,
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000), // e.g. ORD-123456
    status: 'Processing',
    date: new Date().toISOString()
  };
  orders.unshift(newOrder); // newest first
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

  // Persist the order (routes it to the relevant vendors server-side).
  pushToServer(() => api.createOrder(newOrder));

  return newOrder;
};

export const updateOrderStatus = (orderId, newStatus) => {
  const orders = getOrders();
  const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  pushToServer(() => api.updateOrderStatus(orderId, newStatus));
  return updated;
};

// --- Server synchronisation ---

/** Pull every product from the server into the local cache. */
export const syncProductsFromServer = async () => {
  try {
    const data = await api.getProducts();
    if (data?.success && Array.isArray(data.products)) {
      const normalized = data.products.map(normalizeProduct);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(normalized));
      return normalized;
    }
  } catch (err) {
    console.warn('[api] product sync skipped:', err.message);
  }
  return getProducts();
};

/** Pull every vendor from the server into the local cache. */
export const syncVendorsFromServer = async () => {
  try {
    const data = await api.getVendors();
    if (data?.success && Array.isArray(data.vendors)) {
      const normalized = data.vendors.map(normalizeVendor);
      localStorage.setItem(VENDORS_KEY, JSON.stringify(normalized));
      return normalized;
    }
  } catch (err) {
    console.warn('[api] vendor sync skipped:', err.message);
  }
  return getVendors();
};

/** Pull orders from the server into the local cache (optionally filtered). */
export const syncOrdersFromServer = async (params = {}) => {
  try {
    const data = await api.getOrders(params);
    if (data?.success && Array.isArray(data.orders)) {
      const normalized = data.orders.map(normalizeOrder);
      if (Object.keys(params).length === 0) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(normalized));
      }
      return normalized;
    }
  } catch (err) {
    console.warn('[api] order sync skipped:', err.message);
  }
  return getOrders();
};

/** Refresh vendors, products and orders from the server. */
export const syncFromServer = async () => {
  const [vendors, products, orders] = await Promise.all([
    syncVendorsFromServer(),
    syncProductsFromServer(),
    syncOrdersFromServer()
  ]);
  return { vendors, products, orders };
};
