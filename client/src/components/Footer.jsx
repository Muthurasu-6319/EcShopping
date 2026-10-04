import React from 'react';
import './Footer.css';
import { Sprout, MapPin, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand-col">
          <a href="/" className="footer-brand">
            <div className="brand-icon-wrapper">
              <Sprout className="brand-icon" size={24} />
            </div>
            <span className="brand-name">
              Ec<span className="brand-highlight">Shopping</span>
            </span>
          </a>
          <p className="footer-desc">
            Connecting farmers, sellers and customers for a healthier and greener future.
          </p>
          <div className="social-links">
            <a href="#fb">FB</a>
            <a href="#ig">IG</a>
            <a href="#tw">TW</a>
          </div>
        </div>

        <div className="footer-links-col">
          <h4>Shop</h4>
          <ul>
            <li><a href="#all">All Products</a></li>
            <li><a href="#cat">Categories</a></li>
            <li><a href="#feat">Featured</a></li>
            <li><a href="#new">New Arrivals</a></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4>Support</h4>
          <ul>
            <li><a href="#help">Help & Support</a></li>
            <li><a href="#track">Track Order</a></li>
            <li><a href="#ret">Returns & Refunds</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4>Vendor</h4>
          <ul>
            <li><a href="#become">Become a Vendor</a></li>
            <li><a href="#login">Vendor Login</a></li>
            <li><a href="#terms">Terms & Conditions</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
          </ul>
        </div>

        <div className="footer-newsletter-col">
          <h4>Get Updates</h4>
          <p>Subscribe to get the latest products and offers.</p>
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
