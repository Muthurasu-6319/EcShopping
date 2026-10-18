import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  User, 
  ShoppingCart, 
  Menu, 
  X, 
  Store, 
  ShieldCheck,
  LogOut,
  Heart
} from 'lucide-react';
import brandLogo from '../assets/logo/without-bg-logo.png';
import './Header.css';

export default function Header({ cartCount = 0, loggedInCustomer, onCustomerLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);

  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  // Sync wishlist count from storage
  useEffect(() => {
    const updateWishlist = () => {
      try {
        const items = JSON.parse(localStorage.getItem('ecshopping_wishlist') || '[]');
        setWishlistCount(items.length);
      } catch {
        setWishlistCount(0);
      }
    };

    updateWishlist();
    window.addEventListener('storage', updateWishlist);
    window.addEventListener('wishlistUpdated', updateWishlist);
    return () => {
      window.removeEventListener('storage', updateWishlist);
      window.removeEventListener('wishlistUpdated', updateWishlist);
    };
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="site-header">
      <div className="container header-container">
        {/* Left: Brand Logo */}
        <Link to="/" className="brand-logo" id="header-logo" aria-label="EcShopping Home">
          <img 
            src={brandLogo} 
            alt="EcShopping" 
            className="brand-logo-img" 
          />
        </Link>

        {/* Center: Main Navigation (Home, Shop, About, Contact) */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            end
          >
            Home
          </NavLink>
          <NavLink 
            to="/shop" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            Shop
          </NavLink>
          <NavLink 
            to="/about" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            About
          </NavLink>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            Contact
          </NavLink>
        </nav>

        {/* Right: Action Icons (Search, Login/User, Wishlist, Cart) */}
        <div className="header-actions">
          {/* 1. Search Action */}
          <div className="search-action-wrapper">
            <button 
              className={`action-icon-btn ${searchOpen ? 'active' : ''}`}
              onClick={() => setSearchOpen(!searchOpen)}
              title="Search"
              aria-label="Search"
            >
              <Search size={21} />
            </button>

            {searchOpen && (
              <form className="header-search-bar" onSubmit={handleSearchSubmit}>
                <input 
                  ref={searchInputRef}
                  type="text" 
                  className="header-search-input" 
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search products"
                />
                <button type="submit" className="header-search-submit" aria-label="Submit search">
                  <Search size={18} />
                </button>
                <button 
                  type="button" 
                  className="header-search-close" 
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>
              </form>
            )}
          </div>

          {/* 2. User Account / Login (Displays Initial Letter when logged in) */}
          <Link 
            to={loggedInCustomer ? "/profile" : "/login"}
            className={`action-icon-btn header-user-btn ${loggedInCustomer ? 'has-initial' : ''}`}
            title={loggedInCustomer ? `My Account (${loggedInCustomer.name})` : "Login to your account"}
            aria-label="User Account"
          >
            {loggedInCustomer ? (
              <span className="user-initial-avatar">
                {loggedInCustomer.name?.trim()?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            ) : (
              <User size={21} />
            )}
          </Link>

          {/* 3. Wishlist / Likes Heart */}
          <Link 
            to="/wishlist" 
            className="action-icon-btn header-wishlist-btn" 
            title="Wishlist" 
            aria-label="Wishlist"
          >
            <Heart size={21} />
            <span className="icon-badge wishlist-badge">{wishlistCount}</span>
          </Link>

          {/* 4. Shopping Cart */}
          <Link 
            to="/cart" 
            className="action-icon-btn header-cart-btn" 
            title="Shopping Cart" 
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={21} />
            <span className="icon-badge cart-badge">{cartCount}</span>
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
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"} 
              onClick={() => setMobileMenuOpen(false)}
              end
            >
              Home
            </NavLink>
            <NavLink 
              to="/shop" 
              className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"} 
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"} 
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"} 
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </NavLink>
            <div className="mobile-drawer-divider" />
            <Link to="/wishlist" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              My Wishlist ({wishlistCount})
            </Link>
            <Link to="/cart" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              My Cart ({cartCount})
            </Link>
            {loggedInCustomer ? (
              <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                My Profile ({loggedInCustomer.name})
              </Link>
            ) : (
              <Link to="/login" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Customer Account / Login
              </Link>
            )}
            <div className="mobile-drawer-divider" />
            <Link to="/vendor" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Vendor Portal
            </Link>
            <Link to="/admin" className="mobile-nav-link admin-link" onClick={() => setMobileMenuOpen(false)}>
              Admin Portal
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
