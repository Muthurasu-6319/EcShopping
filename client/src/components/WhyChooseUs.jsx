import React from 'react';
import './WhyChooseUs.css';
import { ShieldCheck, BadgeCheck, Truck, Check } from 'lucide-react';
import farmerImg from '../assets/farmer_holding_leaves.png';
import vendorImg from '../assets/vendor_with_tablet.png';

export default function WhyChooseUs() {
  return (
    <section className="why-choose-section">
      <div className="container">
        
        {/* Top Part: Why Choose EcShopping */}
        <div className="why-choose-top">
          <div className="why-choose-header">
            <div className="why-choose-titles">
              <span className="subtitle">YOUR TRUST, OUR PRIORITY</span>
              <h2>Why Choose EcShopping?</h2>
              <p>A marketplace built around trust, quality and community.</p>
            </div>
            <a href="#sellers" className="view-sellers-btn">
              View All Sellers &rarr;
            </a>
          </div>

          <div className="why-choose-content">
            <div className="why-choose-cards">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <ShieldCheck className="feature-icon" size={24} />
                </div>
                <h3>Verified Sellers</h3>
                <p>Sellers are reviewed and approved before they go live.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <BadgeCheck className="feature-icon" size={24} />
                </div>
                <h3>Approved Products</h3>
                <p>Products are checked for quality and authenticity.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <Truck className="feature-icon" size={24} />
                </div>
                <h3>Order Tracking</h3>
                <p>Follow your order from confirmation to delivery.</p>
              </div>
            </div>

            <div className="why-choose-image">
              <img src={farmerImg} alt="Farmer holding leaves" />
            </div>
          </div>
        </div>

        {/* Bottom Part: Have Products to Sell Banner */}
        <div className="vendor-banner">
          <div className="vendor-banner-image">
            <img src={vendorImg} alt="Vendor with tablet" />
          </div>
          <div className="vendor-banner-content">
            <div className="vendor-banner-text">
              <div className="vendor-banner-icon">🌱</div>
              <h2>Have Products to Sell?</h2>
              <p>Bring your shop, farm or business online and reach thousands of customers.</p>
              <button className="become-vendor-btn">Become a Vendor &rarr;</button>
            </div>
            <div className="vendor-banner-checklist">
              <ul>
                <li><Check size={18} className="check-icon" /> Easy Registration</li>
                <li><Check size={18} className="check-icon" /> Upload Your Products</li>
                <li><Check size={18} className="check-icon" /> Get Verified</li>
                <li><Check size={18} className="check-icon" /> Start Selling</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
