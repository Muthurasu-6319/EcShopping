import React from 'react';
import { Link } from 'react-router-dom';
import brandLogo from '../assets/logo/without-bg-logo.png';
import { Globe } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand-col">
          <Link to="/" className="footer-brand" aria-label="EcShopping">
            <img 
              src={brandLogo} 
              alt="EcShopping" 
              className="footer-brand-logo-img" 
            />
          </Link>
          <p className="footer-desc">
            Connecting farmers, local sellers, and customers for a fresh, authentic, and organic future.
          </p>
          <div className="social-links">
            <a href="#fb" aria-label="Facebook">FB</a>
            <a href="#ig" aria-label="Instagram">IG</a>
            <a href="#tw" aria-label="Twitter">TW</a>
          </div>
        </div>

        <div className="footer-links-col">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shop">All Products</Link></li>
            <li><Link to="/shop">Fresh Vegetables</Link></li>
            <li><Link to="/shop">Organic Grocery</Link></li>
            <li><Link to="/shop">Farm Dairy</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4>Support</h4>
          <ul>
            <li><Link to="/contact">Help & Support</Link></li>
            <li><Link to="/profile">Track Order</Link></li>
            <li><Link to="/contact">Returns & Refunds</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4>Marketplace</h4>
          <ul>
            <li><Link to="/vendor">Vendor Portal</Link></li>
            <li><Link to="/vendor/register">Become a Seller</Link></li>
            <li><Link to="/admin">Admin Portal</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>

        <div className="footer-newsletter-col">
          <h4>Get Updates</h4>
          <p>Subscribe to get the latest organic products and farm-fresh offers.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" required />
            <button type="submit">&rarr;</button>
          </form>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>&copy; 2026 EcShopping. All rights reserved.</p>
        <div className="footer-meta">
          <span>Tamil Nadu</span>
          <span className="dot">•</span>
          <span>English</span>
          <Globe size={14} className="globe-icon" />
        </div>
      </div>
    </footer>
  );
}
