import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  ChevronDown 
} from 'lucide-react';
import HeroBackground from "../assets/hero section bg image aimations/HeroBackground";
import cornerLeaves from "../assets/corner-leaves.png";
import topRightLeaves from "../assets/top-right-leaves.png";
import './Hero.css';

export default function Hero() {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(max-width: 768px)').matches;
    }
    return false;
  });

  // Responsive focus tracking: > 768px -> 0.6, <= 768px -> 0.7 (Farmer face not cut on mobile)
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    const handleMediaChange = (e) => {
      setIsMobile(e.matches);
    };

    if (mql.addEventListener) {
      mql.addEventListener('change', handleMediaChange);
    } else {
      mql.addListener(handleMediaChange);
    }

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleMediaChange);
      } else {
        mql.removeListener(handleMediaChange);
      }
    };
  }, []);

  const responsiveFocus = isMobile ? 0.7 : 0.6;

  const locations = [
    'All Tamil Nadu',
    'Madurai',
    'Coimbatore',
    'Chennai',
    'Erode',
    'Tirunelveli',
    'Salem',
    'Trichy',
    'Thanjavur',
    'Dindigul'
  ];

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setIsLocationOpen(false);
  };

  const handleExplore = () => {
    const locText = selectedLocation ? ` in ${selectedLocation}` : '';
    alert(`Exploring fresh products from verified local sellers${locText}!`);
  };

  return (
    <section className="hero-section" id="home">
      {/* 1. First Child: WebGL Shader Animated Hero Background */}
      <HeroBackground focus={responsiveFocus} />

      {/* 2. Readability Gradient Overlay (between background and content, z-index: 0) */}
      <div className="hero-readability-overlay" aria-hidden="true" />

      {/* 3. Bottom-Left Fresh Leaves Framing Accent */}
      <img 
        src={cornerLeaves} 
        alt="" 
        className="hero-corner-leaves" 
        aria-hidden="true" 
      />

      {/* 4. Top-Right Fresh Leaves Framing Accent */}
      <img 
        src={topRightLeaves} 
        alt="" 
        className="hero-top-right-leaves" 
        aria-hidden="true" 
      />

      {/* 5. Hero Content (position: relative, z-index: 1) */}
      <div className="container hero-container">
        <div className="hero-content">
          {/* Top Pill Badge */}
          <div className="hero-pill-badge">
            <span className="pill-dot"></span>
            <span>ONE MARKETPLACE • MANY SELLERS</span>
          </div>

          {/* Main Title with Gradient Accents */}
          <h1 className="hero-title">
            <span className="hero-title-main">From Local Sellers</span> <br />
            <span className="hero-title-accent">to Your Doorstep.</span>
          </h1>

          {/* Subtitle Description */}
          <p className="hero-description">
            Fresh produce, dairy, livestock, handmade goods, pet supplies, birds and more — 
            all from trusted sellers. Shop easily, support local, and enjoy <strong>quality products</strong> at the best price.
          </p>

          {/* Location & Explore Action Bar */}
          <div className="hero-action-bar">
            {/* Location Selector */}
            <div className="location-picker-wrapper">
              <MapPin className="picker-icon" size={19} />
              
              <button 
                type="button"
                className="location-select-btn"
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                aria-expanded={isLocationOpen}
              >
                <span className={`location-text ${selectedLocation ? 'selected' : ''}`}>
                  {selectedLocation || 'Choose your location'}
                </span>
                <ChevronDown size={16} className={`chevron-icon ${isLocationOpen ? 'rotated' : ''}`} />
              </button>

              {/* Location Dropdown Menu */}
              {isLocationOpen && (
                <div className="location-dropdown-menu">
                  <div className="dropdown-label">Popular Locations in TN</div>
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      className={`location-option ${selectedLocation === loc ? 'active' : ''}`}
                      onClick={() => handleSelectLocation(loc)}
                    >
                      <MapPin size={14} className="option-icon" />
                      <span>{loc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="action-bar-divider" />

            {/* Explore Button */}
            <button 
              type="button" 
              className="explore-btn" 
              onClick={handleExplore}
              id="hero-explore-btn"
            >
              <span>Explore Products</span>
              <ArrowRight size={17} className="btn-arrow" />
            </button>
          </div>

          {/* Trust Badges / Value Propositions */}
          <div className="hero-trust-badges">
            <div className="trust-badge-item">
              <div className="trust-icon-box">
                <ShieldCheck size={20} />
              </div>
              <div className="trust-text">
                <strong>Trusted Sellers</strong>
                <span>& Verified Products</span>
              </div>
            </div>

            <div className="trust-badge-divider" />

            <div className="trust-badge-item">
              <div className="trust-icon-box">
                <CreditCard size={20} />
              </div>
              <div className="trust-text">
                <strong>Secure Payments</strong>
                <span>& Safe Shopping</span>
              </div>
            </div>

            <div className="trust-badge-divider" />

            <div className="trust-badge-item">
              <div className="trust-icon-box">
                <Truck size={20} />
              </div>
              <div className="trust-text">
                <strong>Track Your Order</strong>
                <span>Every Step</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
