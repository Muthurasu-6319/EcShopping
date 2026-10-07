import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getCustomerOrders } from '../utils/storage';
import { User, Package, LogOut } from 'lucide-react';
import './CustomerProfile.css';

export default function CustomerProfile({ loggedInCustomer, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (loggedInCustomer) {
      setOrders(getCustomerOrders(loggedInCustomer.email));
    }
  }, [loggedInCustomer]);

  if (!loggedInCustomer) {
    return <Navigate to="/" />;
  }

  return (
    <div className="customer-profile-page container">
      <div className="profile-header">
        <h1>My Account</h1>
        <p>Manage your orders and personal details</p>
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
          </div>
          <nav className="profile-nav">
            <button 
              className={activeTab === 'orders' ? 'active' : ''} 
              onClick={() => setActiveTab('orders')}
            >
              <Package size={18} /> My Orders
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
              <h2>Order History</h2>
              
              {orders.length === 0 ? (
                <div className="no-orders">
                  <Package size={48} color="#cbd5e1" />
                  <p>You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div className="order-card" key={order.id}>
                      <div className="order-card-header">
                        <div>
                          <span className="order-id">Order {order.id}</span>
                          <span className="order-date">{new Date(order.date).toLocaleDateString()}</span>
                        </div>
                        <span className={`order-status ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="order-items">
                        {order.items.map((item, idx) => (
                          <div className="order-item" key={idx}>
                            <img src={item.image} alt={item.title || item.name} />
                            <div className="item-details">
                              <h4>{item.title || item.name}</h4>
                              <p>Qty: {item.quantity} {item.variant ? `(${item.variant})` : ''}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="order-footer">
                        <span className="total-label">Total Amount:</span>
                        <span className="total-amount">₹{order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
