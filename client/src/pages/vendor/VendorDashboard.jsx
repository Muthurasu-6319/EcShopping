import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Package, ShoppingBag, TrendingUp, CheckCircle } from 'lucide-react';
import { getProducts, addProduct, getVendorOrders, updateOrderStatus } from '../../utils/storage';
import '../admin/AdminDashboard.css';

export default function VendorDashboard({ vendor, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: '', price: '', image: '' });

  const loadData = () => {
    const allProducts = getProducts();
    setProducts(allProducts.filter(p => p.vendorId === vendor.id));
    setOrders(getVendorOrders(vendor.id, vendor.name));
  };

  useEffect(() => {
    loadData();
  }, [vendor.id, activeTab]);

  const handleAddProduct = (e) => {
    e.preventDefault();
    addProduct(vendor, { ...newProduct, price: Number(newProduct.price) });
    loadData();
    setNewProduct({ title: '', price: '', image: '' });
    setShowAddForm(false);
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    loadData();
  };

  if (!vendor) return null;

  // Calculate vendor-specific revenue from orders
  const vendorRevenue = orders.reduce((total, order) => {
    const itemsTotal = (order.vendorItems || []).reduce((sum, item) => {
      const priceStr = item.price.toString().replace(/[^0-9.-]+/g, "");
      const price = parseFloat(priceStr.split('-')[0]) || 0;
      return sum + (price * item.quantity);
    }, 0);
    return total + itemsTotal;
  }, 0);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>Vendor Panel</h2>
        </div>
        <div style={{ padding: '0 24px', color: '#86efac', fontSize: '14px', marginBottom: '10px' }}>
          Welcome, {vendor.name}
        </div>
        <nav className="admin-nav">
          <a href="#" className={activeTab === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>Dashboard</a>
          <a href="#" className={activeTab === 'products' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('products'); }}>My Products ({products.length})</a>
          <a href="#" className={activeTab === 'orders' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('orders'); }}>Orders Received ({orders.length})</a>
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
            {activeTab === 'dashboard' && 'Vendor Dashboard'}
            {activeTab === 'products' && 'My Products'}
            {activeTab === 'orders' && 'Orders Received'}
          </h1>
        </header>

        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <>
              <div className="stat-cards">
                <div className="stat-card">
                  <h3>My Total Sales</h3>
                  <p>₹{vendorRevenue.toLocaleString()}</p>
                </div>
                <div className="stat-card">
                  <h3>Orders Received</h3>
                  <p>{orders.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Active Products</h3>
                  <p>{products.filter(p => p.status === 'approved').length}</p>
                </div>
              </div>
              
              <div className="admin-placeholder-box" style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Vendor Order Notifications</h3>
                <p style={{ color: '#64748b', margin: '0 0 15px 0' }}>
                  Whenever a customer buys products supplied by <strong>{vendor.name}</strong>, orders appear instantly in your panel.
                </p>
                <button 
                  className="approve-btn" 
                  onClick={() => setActiveTab('orders')}
                >
                  <Package size={16} /> View Orders Received ({orders.length})
                </button>
              </div>
            </>
          )}

          {activeTab === 'products' && (
            <div className="admin-vendors-section">
              <div className="vendors-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2>Product Catalog</h2>
                  <p>Add and manage your products</p>
                </div>
                <button 
                  className="approve-btn" 
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  <Plus size={16} /> Add Product
                </button>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddProduct} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                  <h3>Add New Product</h3>
                  <div style={{ display: 'grid', gap: '15px', marginBottom: '15px' }}>
                    <input 
                      type="text" 
                      placeholder="Product Title" 
                      value={newProduct.title}
                      onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                      required
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                    <input 
                      type="number" 
                      placeholder="Price (₹)" 
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                      required
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                    <input 
                      type="url" 
                      placeholder="Image URL" 
                      value={newProduct.image}
                      onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                      required
                      style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <button type="submit" className="approve-btn">Submit Product</button>
                  <button type="button" className="reject-btn" style={{ marginLeft: '10px' }} onClick={() => setShowAddForm(false)}>Cancel</button>
                  <p style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
                    Note: {vendor.directSelling ? 'Your product will be approved instantly as you have direct selling privileges.' : 'Your product will require admin approval before it appears on the store.'}
                  </p>
                </form>
              )}

              <div className="vendors-table-container">
                <table className="vendors-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td>
                          <img src={product.image} alt={product.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} />
                        </td>
                        <td>{product.title}</td>
                        <td>₹{product.price}</td>
                        <td>
                          <span className={`status-badge status-${product.status}`}>
                            {product.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>You haven't added any products yet.</td>
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
                <h2>Orders Received for {vendor.name}</h2>
                <p>Track orders placed for your products by customers</p>
              </div>

              <div className="vendors-table-container">
                <table className="vendors-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Customer Details</th>
                      <th>Your Products Ordered</th>
                      <th>Delivery Address</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      const itemsForThisVendor = order.vendorItems || order.items;
                      const vendorSubtotal = itemsForThisVendor.reduce((sum, item) => {
                        const priceStr = item.price.toString().replace(/[^0-9.-]+/g, "");
                        const price = parseFloat(priceStr.split('-')[0]) || 0;
                        return sum + (price * item.quantity);
                      }, 0);

                      return (
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
                              {itemsForThisVendor.map((it, idx) => (
                                <div key={idx} style={{ fontSize: '13px' }}>
                                  • <strong>{it.title || it.name}</strong> x {it.quantity} {it.variant ? `(${it.variant})` : ''} - ₹{((parseFloat(String(it.price).replace(/[^0-9.-]+/g, "")) || 0) * it.quantity).toFixed(2)}
                                </div>
                              ))}
                              <div style={{ fontWeight: 600, color: '#166534', marginTop: '4px', fontSize: '13px' }}>
                                Your share: ₹{vendorSubtotal.toFixed(2)}
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: '13px', color: '#475569' }}>
                            {order.shippingAddress ? (
                              <div>
                                {order.shippingAddress.street}<br/>
                                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postcode}
                              </div>
                            ) : (
                              'Standard Delivery'
                            )}
                          </td>
                          <td>
                            <span className={`status-badge status-${(order.status || 'processing').toLowerCase()}`}>
                              {order.status || 'Processing'}
                            </span>
                          </td>
                          <td>
                            <select 
                              value={order.status || 'Processing'} 
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>
                          No orders received for your products yet.
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
