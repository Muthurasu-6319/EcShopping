import React from 'react';
import './AboutUs.css';

export default function AboutUs() {
  return (
    <div className="about-us-page container">
      <div className="about-header">
        <h1>About EcShopping</h1>
        <p>Your one-stop destination for everything you need.</p>
      </div>
      <div className="about-content">
        <section>
          <h2>Our Story</h2>
          <p>Founded in 2026, EcShopping started with a simple idea: to make online shopping easier, faster, and more reliable for everyone. We connect thousands of vendors with millions of customers, ensuring top quality and best prices.</p>
        </section>
        <section>
          <h2>Our Mission</h2>
          <p>To empower local sellers and provide customers with a seamless shopping experience backed by trust and excellence.</p>
        </section>
      </div>
    </div>
  );
}
