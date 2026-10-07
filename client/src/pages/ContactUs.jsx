import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import './ContactUs.css';

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="contact-us-page container">
      <h1>Contact Us</h1>
      <p className="contact-subtitle">We'd love to hear from you. Please fill out the form below or reach out using the contact details.</p>
      
      <div className="contact-layout">
        <div className="contact-info">
          <div className="info-item">
            <Mail size={24} />
            <div>
              <h3>Email</h3>
              <p>support@ecshopping.com</p>
            </div>
          </div>
          <div className="info-item">
            <Phone size={24} />
            <div>
              <h3>Phone</h3>
              <p>+91 9876543210</p>
            </div>
          </div>
          <div className="info-item">
            <MapPin size={24} />
            <div>
              <h3>Address</h3>
              <p>123 Shopping Avenue, Tech City, India</p>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" required placeholder="Your Name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required placeholder="Your Email" />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea required rows="5" placeholder="How can we help you?"></textarea>
          </div>
          <button type="submit" className="submit-btn">Send Message</button>
          {submitted && <p className="success-msg">Message sent successfully!</p>}
        </form>
      </div>
    </div>
  );
}
