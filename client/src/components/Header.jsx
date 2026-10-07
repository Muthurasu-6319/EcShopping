import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  User, 
  ShoppingCart, 
  Menu, 
  X, 
  Sprout, 
  Store, 
  ShieldCheck
} from 'lucide-react';
import './Header.css';

export default function Header({ cartCount = 0 }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Searching for: ${searchQuery}`);
    }
  };

  return (
    <header className="site-header">
      <div className="container header-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" id="header-logo">
          <div className="brand-icon-wrapper">
            <Sprout className="brand-icon" size={24} />
          </div>
          <div className="brand-text-group">
            <span className="brand-name">
              Ec<span className="brand-highlight">Shopping</span>
            </span>
            <span className="brand-tagline">Fresh • Pure • Community</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/shop" className="nav-link">Shop</Link>
          <a href="#vendor" className="nav-link vendor-link">
            <Store size={15} className="inline-icon" />
            Become a Vendor
          </a>
          <a href="#support" className="nav-link">Help & Support</a>
        </nav>

        {/* Right Section: Search & Actions */}
        <div className="header-actions">
          {/* Search Box */}
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search products, sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search products and sellers"
            />
            <button type="submit" className="search-btn" aria-label="Submit search">
              <Search size={17} />
            </button>
          </form>

          {/* User Account with Portal Dropdown */}
          <div className="user-menu-wrapper">
            <button 
              className="action-icon-btn user-btn" 
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              title="Account & Portals"
              aria-label="User Account"
            >
              <User size={20} />
            </button>

            {userDropdownOpen && (
              <div className="user-dropdown-menu">
                <div className="dropdown-header">
                  <p className="dropdown-title">Account & Portals</p>
                  <p className="dropdown-subtitle">Access your marketplace role</p>
                </div>
                <div className="dropdown-divider" />
                <a href="#login" className="dropdown-item">
                  <User size={16} />
                  <div>
                    <span className="dropdown-item-title">Customer Login</span>
                    <span className="dropdown-item-desc">Orders, addresses & wishlist</span>
                  </div>
                </a>
                <Link to="/vendor" className="dropdown-item">
                  <Store size={16} />
                  <div>
                    <span className="dropdown-item-title">Vendor Portal</span>
                    <span className="dropdown-item-desc">Manage shop, products & sales</span>
                  </div>
                </Link>
                <Link to="/admin" className="dropdown-item admin-item">
                  <ShieldCheck size={16} />
                  <div>
                    <span className="dropdown-item-title">Super Admin (/admin)</span>
                    <span className="dropdown-item-desc">Approvals & platform control</span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Shopping Cart Button */}
          <Link to="/cart" className="action-icon-btn cart-btn" title="View Cart" aria-label="Shopping Cart">
            <ShoppingCart size={20} />
            <span className="cart-badge">{cartCount}</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-nav">
            <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/shop" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
            <a href="#vendor" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Become a Vendor</a>
            <a href="#support" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Help & Support</a>
            <div className="mobile-drawer-divider" />
            <a href="#login" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Customer Login / Register</a>
            <Link to="/vendor" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Vendor Portal Login</Link>
            <Link to="/admin" className="mobile-nav-link admin-link" onClick={() => setMobileMenuOpen(false)}>Super Admin Portal</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
