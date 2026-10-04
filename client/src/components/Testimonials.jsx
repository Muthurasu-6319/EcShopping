import React from 'react';
import './Testimonials.css';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      id: 1,
      name: 'Priya S.',
      rating: 5,
      text: '"Fresh vegetables and great quality. Highly recommend!"',
      avatar: 'https://i.pravatar.cc/150?u=priya',
      productImg: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 2,
      name: 'Ramesh K.',
      rating: 5,
      text: '"The milk and dairy products are always fresh. Very reliable seller."',
      avatar: 'https://i.pravatar.cc/150?u=ramesh',
      productImg: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 3,
      name: 'Anitha M.',
      rating: 5,
      text: '"Easy to use and fast delivery. Will shop again!"',
      avatar: 'https://i.pravatar.cc/150?u=anitha',
      productImg: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=150&q=80'
    }
  ];

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="testimonials-header">
          <div>
            <span className="subtitle">WHAT OUR CUSTOMERS SAY</span>
            <h2>Trusted by Thousands</h2>
            <p>Read what our happy customers have to say about us.</p>
          </div>
          <div className="testimonials-nav">
            <button className="nav-btn"><ChevronLeft size={20} /></button>
            <button className="nav-btn"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="testimonials-grid">
          {reviews.map(review => (
            <div key={review.id} className="testimonial-card">
              <div className="testimonial-user">
                <img src={review.avatar} alt={review.name} className="user-avatar" />
                <div>
                  <h4>{review.name}</h4>
                  <div className="stars">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="testimonial-text">{review.text}</p>
              <div className="testimonial-product">
                <img src={review.productImg} alt="Product" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
