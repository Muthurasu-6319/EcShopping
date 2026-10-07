import React, { useState, useEffect } from 'react';
import { LogOut, Users, CheckCircle, XCircle, Package } from 'lucide-react';
import { getVendors, updateVendorStatus, toggleVendorDirectSelling, getProducts, updateProductStatus } from '../../utils/storage';
import './AdminDashboard.css';

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setVendors(getVendors());
    setProducts(getProducts());
  }, [activeTab]);

  const handleStatusUpdate = (id, status) => {
    updateVendorStatus(id, status);
    setVendors(getVendors()); // Refresh list
  };

  const handleToggleDirectSelling = (id, currentValue) => {
    toggleVendorDirectSelling(id, !currentValue);
    setVendors(getVendors());
  };

  const handleProductStatusUpdate = (id, status) => {
    updateProductStatus(id, status);
    setProducts(getProducts());
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>EcShopping Admin</h2>
        </div>
        <nav className="admin-nav">
          <a href="#" className={activeTab === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>Dashboard</a>
          <a href="#" className={activeTab === 'vendors' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('vendors'); }}>Vendors</a>
          <a href="#" className={activeTab === 'products' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('products'); }}>Products</a>
          <a href="#">Orders</a>
          <a href="#">Customers</a>
        </nav>
        <button className="admin-logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>{activeTab === 'dashboard' ? 'Dashboard Overview' : 'Vendor Management'}</h1>
        </header>

        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <>
              <div className="stat-cards">
                <div className="stat-card">
                  <h3>Total Sales</h3>
                  <p>₹1,24,500</p>
                </div>
                <div className="stat-card">
                  <h3>Total Orders</h3>
                  <p>156</p>
                </div>
                <div className="stat-card">
                  <h3>Products</h3>
                  <p>42</p>
                </div>
              </div>
              
              <div className="admin-placeholder-box">
                <h2>Welcome to Admin Panel</h2>
                <p>More features will be added here soon.</p>
              </div>
            </>
          )}

          {activeTab === 'vendors' && (
            <div className="admin-vendors-section">
              <div className="vendors-header">
                <h2>Registered Vendors</h2>
                <p>Manage and approve vendor accounts</p>
              </div>

              <div className="vendors-table-container">
                <table className="vendors-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map(vendor => (
                      <tr key={vendor.id}>
                        <td>{vendor.name}</td>
                        <td>{vendor.email}</td>
                        <td>
                          <span className={`status-badge status-${vendor.status}`}>
                            {vendor.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {vendor.status === 'pending' && (
                            <div className="action-buttons">
                              <button 
                                className="approve-btn" 
                                onClick={() => handleStatusUpdate(vendor.id, 'approved')}
                                title="Approve"
                              >
                                <CheckCircle size={18} /> Approve
                              </button>
                              <button 
                                className="reject-btn" 
                                onClick={() => handleStatusUpdate(vendor.id, 'rejected')}
                                title="Reject"
                              >
                                <XCircle size={18} /> Reject
                              </button>
                            </div>
                          )}
                          {vendor.status === 'approved' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span className="text-muted">Approved</span>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer' }}>
                                <input 
                                  type="checkbox" 
                                  checked={vendor.directSelling || false}
                                  onChange={() => handleToggleDirectSelling(vendor.id, vendor.directSelling)}
                                />
                                Direct Selling
                              </label>
                            </div>
                          )}
                          {vendor.status === 'rejected' && (
                            <span className="text-muted">Rejected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {vendors.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No vendors found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="admin-vendors-section">
              <div className="vendors-header">
                <h2>Product Approvals</h2>
                <p>Review products submitted by vendors</p>
              </div>

              <div className="vendors-table-container">
                <table className="vendors-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title & Vendor</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td>
                          <img src={product.image} alt={product.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} />
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{product.title}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>By {product.vendorName}</div>
                        </td>
                        <td>₹{product.price}</td>
                        <td>
                          <span className={`status-badge status-${product.status}`}>
                            {product.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {product.status === 'pending' && (
                            <div className="action-buttons">
                              <button 
                                className="approve-btn" 
                                onClick={() => handleProductStatusUpdate(product.id, 'approved')}
                              >
                                <CheckCircle size={14} /> Approve
                              </button>
                              <button 
                                className="reject-btn" 
                                onClick={() => handleProductStatusUpdate(product.id, 'rejected')}
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            </div>
                          )}
                          {product.status !== 'pending' && (
                            <span className="text-muted">{product.status === 'approved' ? 'Approved' : 'Rejected'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No products found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
