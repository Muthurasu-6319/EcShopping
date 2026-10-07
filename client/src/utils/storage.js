// Mock Storage Utility using localStorage

const VENDORS_KEY = 'ecshopping_vendors';

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
        createdAt: new Date().toISOString()
      }
    ]));
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
