import React, { useState, useEffect } from 'react';
import { LogOut, Users, CheckCircle, XCircle, Package, ShoppingCart } from 'lucide-react';
import { 
  getVendors, 
  updateVendorStatus, 
  toggleVendorDirectSelling, 
  getProducts, 
  updateProductStatus, 
  getOrders, 
  updateOrderStatus, 
  getCustomers 
} from '../../utils/storage';
import './AdminDashboard.css';

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    setVendors(getVendors());
    setProducts(getProducts());
    setOrders(getOrders());
    setCustomers(getCustomers());
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

  const handleOrderStatusUpdate = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    setOrders(getOrders());
  };

  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>EcShopping Admin</h2>
        </div>
        <nav className="admin-nav">
          <a href="#" className={activeTab === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>Dashboard</a>
          <a href="#" className={activeTab === 'orders' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('orders'); }}>Orders ({orders.length})</a>
          <a href="#" className={activeTab === 'vendors' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('vendors'); }}>Vendors ({vendors.length})</a>
          <a href="#" className={activeTab === 'products' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('products'); }}>Products ({products.length})</a>
          <a href="#" className={activeTab === 'customers' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('customers'); }}>Customers ({customers.length})</a>
        </nav>
        <button className="admin-logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>
            {activeTab === 'dashboard' && 'Dashboard Overview'}
            {activeTab === 'orders' && 'All Customer Orders'}
            {activeTab === 'vendors' && 'Vendor Management'}
            {activeTab === 'products' && 'Product Approvals'}
            {activeTab === 'customers' && 'Customer Accounts'}
          </h1>
        </header>

        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <>
              <div className="stat-cards">
                <div className="stat-card">
                  <h3>Total Sales</h3>
                  <p>₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Orders</h3>
                  <p>{orders.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Customers</h3>
                  <p>{customers.length}</p>
                </div>
              </div>
              
              <div className="admin-placeholder-box" style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Recent Orders Overview</h3>
                <p style={{ color: '#64748b', margin: '0 0 15px 0' }}>Latest orders placed across all vendors in EcShopping.</p>
                <button 
                  className="approve-btn" 
                  onClick={() => setActiveTab('orders')}
                >
                  <Package size={16} /> View All {orders.length} Orders
                </button>
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

          {activeTab === 'orders' && (
            <div className="admin-vendors-section">
              <div className="vendors-header">
                <h2>All Orders Placed</h2>
                <p>Track customer purchases and update fulfillment status</p>
              </div>

              <div className="vendors-table-container">
                <table className="vendors-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Items & Vendors</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td><strong>{order.id}</strong></td>
                        <td style={{ fontSize: '13px', color: '#64748b' }}>
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{order.customerEmail}</div>
                          {order.customerPhone && (
                            <div style={{ fontSize: '12px', color: '#64748b' }}>📞 {order.customerPhone}</div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {order.items?.map((it, idx) => (
                              <div key={idx} style={{ fontSize: '13px' }}>
                                • <strong>{it.title || it.name}</strong> x {it.quantity}
                                <span style={{ color: '#059669', marginLeft: '6px', fontSize: '12px', background: '#ecfdf5', padding: '1px 6px', borderRadius: '4px' }}>
                                  Vendor: {it.soldBy || it.vendorName || it.seller || 'Ramesh Farms'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td><strong style={{ color: '#0f172a' }}>₹{order.totalAmount?.toFixed(2)}</strong></td>
                        <td>
                          <span className={`status-badge status-${(order.status || 'processing').toLowerCase()}`}>
                            {order.status || 'Processing'}
                          </span>
                        </td>
                        <td>
                          <select 
                            value={order.status || 'Processing'} 
                            onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                            style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>
                          No orders placed yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="admin-vendors-section">
              <div className="vendors-header">
                <h2>Registered Customers</h2>
                <p>View customers who signed up or ordered through checkout</p>
              </div>

              <div className="vendors-table-container">
                <table className="vendors-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Contact Phone</th>
                      <th>City / State</th>
                      <th>Registered On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.email}</td>
                        <td>{c.phone || 'N/A'}</td>
                        <td>{c.city ? `${c.city}, ${c.state || ''}` : 'N/A'}</td>
                        <td style={{ fontSize: '13px', color: '#64748b' }}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>
                          No registered customers yet.
                        </td>
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
