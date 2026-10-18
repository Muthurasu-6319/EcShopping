import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import HeroBackground from "../assets/hero section bg image aimations/HeroBackground";
import cornerLeaves from "../assets/corner-leaves.png";
import topRightLeaves from "../assets/top-right-leaves.png";
import './Hero.css';

export default function Hero() {
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

          {/* Clean CTA Shop Now Button */}
          <div className="hero-cta-group">
            <Link to="/shop" className="hero-shop-btn" id="hero-shop-btn">
              <span>Shop Now</span>
              <ArrowRight size={18} className="btn-arrow" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
