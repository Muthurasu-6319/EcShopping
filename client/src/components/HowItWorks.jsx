import React from 'react';
import howItWorksPhone from '../assets/how-it-works-phone.png';
import './HowItWorks.css';

export default function HowItWorks() {
  const steps = [
    {
      step: 1,
      title: 'Discover',
      desc: 'Browse products from multiple sellers'
    },
    {
      step: 2,
      title: 'Choose',
      desc: 'Select the best quality products'
    },
    {
      step: 3,
      title: 'Add to Cart',
      desc: 'Review and proceed to checkout'
    },
    {
      step: 4,
      title: 'Pay',
      desc: 'Secure and flexible payment options'
    },
    {
      step: 5,
      title: 'Delivered',
      desc: 'Track your order until it reaches you'
    }
  ];

  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="container">
        {/* Main 2-Column Section Layout matching Reference Design */}
        <div className="how-it-works-main-layout">
          {/* Left Area: Section Header + 5 Horizontal Steps */}
          <div className="how-left-content">
            <div className="how-header">
              <span className="section-pill-tag">SIMPLE & EASY</span>
              <h2 className="section-title">How It Works</h2>
              <p className="section-subtitle">
                Get your favorite products in just a few simple steps.
              </p>
            </div>

            {/* 5-Step Flow */}
            <div className="steps-flow-container">
              {steps.map((item, idx) => (
                <div key={item.step} className="step-flow-item">
                  <div className="step-bubble-wrapper">
                    <div className="step-number-bubble">
                      <span>{item.step}</span>
                    </div>
                    {/* Connecting line strictly between step (i) and step (i+1) */}
                    {idx < steps.length - 1 && (
                      <div className="step-connector-line" aria-hidden="true" />
                    )}
                  </div>
                  <h3 className="step-title">{item.title}</h3>
                  <p className="step-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Area: Exactly Centered Illustration Image matching Reference */}
          <div className="how-phone-wrapper">
            <img 
              src={howItWorksPhone} 
              alt="EcShopping How It Works" 
              className="how-phone-img"
              loading="lazy" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
