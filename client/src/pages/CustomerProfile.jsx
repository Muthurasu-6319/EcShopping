import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomerOrders } from '../utils/storage';
import { User, Package, LogOut } from 'lucide-react';
import './CustomerProfile.css';

export default function CustomerProfile({ loggedInCustomer, onLogout, onOpenLogin }) {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (loggedInCustomer) {
      setOrders(getCustomerOrders(loggedInCustomer.email));
    }
  }, [loggedInCustomer]);

  if (!loggedInCustomer) {
    return (
      <div className="customer-profile-page container">
        <div className="profile-header">
          <h1>My Account</h1>
          <p>Sign in to view your orders, saved details and tracking in one place.</p>
        </div>
        <div className="no-orders">
          <User size={48} color="#cbd5e1" />
          <p>You are not signed in yet.</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button type="button" className="btn-place-order" style={{ display: 'inline-block', border: 'none', cursor: 'pointer' }} onClick={() => onOpenLogin?.()}>
              Sign in
            </button>
            <Link to="/shop" style={{ display: 'inline-block', padding: '12px 24px', border: '1px solid #e2e8f0', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, color: '#334155' }}>
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-profile-page container">
      <div className="profile-header">
        <h1>My Account</h1>
        <p>Welcome back, <strong>{loggedInCustomer.name}</strong>! Manage your orders and personal details.</p>
      </div>

      <div className="profile-layout">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-user-card">
            <div className="avatar">
              <User size={32} color="#fff" />
            </div>
            <h3>{loggedInCustomer.name}</h3>
            <p>{loggedInCustomer.email}</p>
            {loggedInCustomer.phone && (
              <p style={{ marginTop: '4px', fontSize: '13px', color: '#16a34a' }}>📞 {loggedInCustomer.phone}</p>
            )}
          </div>
          <nav className="profile-nav">
            <button 
              className={activeTab === 'orders' ? 'active' : ''} 
              onClick={() => setActiveTab('orders')}
            >
              <Package size={18} /> My Orders ({orders.length})
            </button>
            <button 
              className={activeTab === 'details' ? 'active' : ''} 
              onClick={() => setActiveTab('details')}
            >
              <User size={18} /> Personal Details
            </button>
            <button className="logout-btn" onClick={onLogout}>
              <LogOut size={18} /> Logout
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="profile-content">
          {activeTab === 'orders' && (
            <div className="orders-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ margin: 0 }}>Order History</h2>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <Link to="/orders" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                    View all orders
                  </Link>
                  <Link to="/shop" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                    + Continue Shopping
                  </Link>
                </div>
              </div>
              
              {orders.length === 0 ? (
                <div className="no-orders">
                  <Package size={48} color="#cbd5e1" />
                  <p>You haven't placed any orders yet.</p>
                  <Link to="/shop" className="btn-place-order" style={{ display: 'inline-block', marginTop: '15px', textDecoration: 'none' }}>
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div className="order-card" key={order.id}>
                      <div className="order-card-header">
                        <div>
                          <Link to={`/orders/${order.id}`} className="order-id" style={{ textDecoration: 'none' }}>
                            Order {order.orderNumber || order.id}
                          </Link>
                          <span className="order-date">{new Date(order.date).toLocaleDateString()}</span>
                        </div>
                        <span className={`status-badge status-${(order.status || 'processing').toLowerCase()}`}>
                          {order.status || 'Processing'}
                        </span>
                      </div>
                      <div className="order-items">
                        {order.items.map((item, idx) => (
                          <div className="order-item" key={idx}>
                            <img src={item.image} alt={item.title || item.name} />
                            <div className="item-details">
                              <h4>{item.title || item.name}</h4>
                              <p>Qty: {item.quantity} {item.variant ? `(${item.variant})` : ''}</p>
                              <span style={{ fontSize: '12px', color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                                Seller / Vendor: {item.soldBy || item.vendorName || item.seller || 'Ramesh Farms'}
                              </span>
                            </div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>
                              ₹{((parseFloat(String(item.price).replace(/[^0-9.-]+/g, "")) || 0) * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {order.shippingAddress && (
                        <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '13px', color: '#64748b' }}>
                          <strong style={{ color: '#334155' }}>📍 Delivery Address:</strong> {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postcode}
                        </div>
                      )}

                      <div className="order-footer">
                        <span className="total-label">
                          Payment: <strong style={{ textTransform: 'uppercase' }}>{order.paymentMethod || 'COD'}</strong>
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="total-label">Total Amount:</span>
                          <span className="total-amount">₹{(Number(order.totalAmount ?? order.total) || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="orders-section">
              <h2>My Details</h2>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <p><strong>Full Name:</strong> {loggedInCustomer.name}</p>
                <p><strong>Email Address:</strong> {loggedInCustomer.email}</p>
                {loggedInCustomer.phone && <p><strong>Phone:</strong> {loggedInCustomer.phone}</p>}
                {loggedInCustomer.address && (
                  <p><strong>Saved Address:</strong> {loggedInCustomer.address}, {loggedInCustomer.city}, {loggedInCustomer.state} - {loggedInCustomer.postcode}</p>
                )}
                <p style={{ marginTop: '20px', color: '#64748b', fontSize: '13px' }}>
                  Your password was automatically generated when placing your first order and sent to your registered email address.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
