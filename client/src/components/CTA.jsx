import React from 'react';
import './CTA.css';
import ctaBg from '../assets/cta_landscape_bg.png';

export default function CTA() {
  return (
    <section className="cta-section">
      <div className="cta-background">
        <img src={ctaBg} alt="Beautiful landscape" />
        <div className="cta-overlay"></div>
      </div>
      <div className="container cta-content">
        <h2>Discover. Shop. Support Local.</h2>
        <p>Fresh products • Trusted sellers • A better tomorrow</p>
        <button className="cta-btn">Start Shopping &rarr;</button>
      </div>
    </section>
  );
}
