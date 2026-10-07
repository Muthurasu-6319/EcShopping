import React from 'react';
import { LogOut } from 'lucide-react';
import '../admin/AdminDashboard.css';

export default function VendorDashboard({ vendor, onLogout }) {
  if (!vendor) return null;

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
          <a href="#" className="active">Dashboard</a>
          <a href="#">My Products</a>
          <a href="#">Orders Received</a>
          <a href="#">Earnings</a>
        </nav>
        <button className="admin-logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>Vendor Dashboard</h1>
        </header>

        <div className="admin-content">
          <div className="stat-cards">
            <div className="stat-card">
              <h3>My Total Sales</h3>
              <p>₹24,500</p>
            </div>
            <div className="stat-card">
              <h3>Active Products</h3>
              <p>12</p>
            </div>
            <div className="stat-card">
              <h3>Pending Orders</h3>
              <p>5</p>
            </div>
          </div>
          
          <div className="admin-placeholder-box">
            <h2>Welcome to your Vendor Panel</h2>
            <p>You can manage your products, track orders, and view your earnings here.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
