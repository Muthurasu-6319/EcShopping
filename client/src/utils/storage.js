// Mock Storage Utility using localStorage

const VENDORS_KEY = 'ecshopping_vendors';
const PRODUCTS_KEY = 'ecshopping_products';
const CUSTOMERS_KEY = 'ecshopping_customers';
const ORDERS_KEY = 'ecshopping_orders';

// Initialize mock data if empty
export const initStorage = () => {
  if (!localStorage.getItem(VENDORS_KEY)) {
    localStorage.setItem(VENDORS_KEY, JSON.stringify([
      {
        id: 'v1',
        name: 'Ramesh Farms',
        email: 'ramesh@example.com',
        password: 'password123',
        status: 'approved',
        directSelling: true, // Specific vendors can sell directly without approval
        createdAt: new Date().toISOString()
      }
    ]));
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
};

export const toggleVendorDirectSelling = (id, directSelling) => {
  const vendors = getVendors();
  const updated = vendors.map(v => v.id === id ? { ...v, directSelling } : v);
  localStorage.setItem(VENDORS_KEY, JSON.stringify(updated));
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
  const isDirectSelling = vendor.directSelling === true;
  
  const newProduct = {
    ...productData,
    id: 'p' + Date.now(),
    vendorId: vendor.id,
    vendorName: vendor.name,
    status: isDirectSelling ? 'approved' : 'pending',
    createdAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  return newProduct;
};

export const updateProductStatus = (id, status) => {
  const products = getProducts();
  const updated = products.map(p => p.id === id ? { ...p, status } : p);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
};

// --- Customer Management ---

export const getCustomers = () => {
  return JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
};

export const addCustomer = (customerData) => {
  const customers = getCustomers();
  
  // Prevent duplicate email
  if (customers.some(c => c.email === customerData.email)) {
    return { success: false, message: 'Email already exists' };
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
  return orders.filter(o => o.customerEmail === customerEmail);
};

export const addOrder = (orderData) => {
  const orders = getOrders();
  const newOrder = {
    ...orderData,
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000), // e.g. ORD-123456
    status: 'Processing',
    date: new Date().toISOString()
  };
  orders.push(newOrder);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return newOrder;
};
