import React from 'react';
import { MapPin, Star, ArrowRight, Store, CheckCircle } from 'lucide-react';
import './MeetSellers.css';

export default function MeetSellers() {
  const sellers = [
    {
      id: 1,
      name: 'Green Valley Farms',
      region: 'Coimbatore, TN',
      location: 'Madurai, TN',
      distance: 'Same City',
      rating: 4.8,
      reviews: 124,
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
      tag: 'Organic Farm'
    },
    {
      id: 2,
      name: 'Pure Dairy',
      region: 'Coimbatore, TN',
      location: 'Madurai, TN',
      distance: 'Same City',
      rating: 4.9,
      reviews: 98,
      image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80',
      tag: 'Fresh Milk'
    },
    {
      id: 3,
      name: 'Village Livestock',
      region: 'Erode, TN',
      location: 'Erode, TN',
      distance: '35 km away',
      rating: 4.6,
      reviews: 76,
      image: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80',
      tag: 'Native Breeds'
    },
    {
      id: 4,
      name: 'Happy Birds',
      region: 'Tirunelveli, Dist',
      location: 'Tenkasi, TN',
      distance: 'Direct Farm',
      rating: 4.8,
      reviews: 52,
      image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=80',
      tag: 'Birds & Pets'
    }
  ];

  return (
    <section className="meet-sellers-section" id="sellers">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-row">
          <div>
            <span className="section-pill-tag">TRUSTED PARTNERS</span>
            <h2 className="section-title">Meet Our Sellers</h2>
            <p className="section-subtitle">
              Support local businesses and explore unique products from our verified sellers.
            </p>
          </div>
          <button 
            type="button" 
            className="view-all-pill-btn"
            onClick={() => alert('Viewing all verified sellers in Tamil Nadu')}
          >
            <span>View All Sellers</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* 4 Sellers Grid */}
        <div className="sellers-grid">
          {sellers.map((seller) => (
            <div key={seller.id} className="seller-card">
              <div className="seller-banner-box">
                <img 
                  src={seller.image} 
                  alt={seller.name} 
                  className="seller-banner-img"
                  loading="lazy"
                />
                <span className="seller-badge">
                  <CheckCircle size={12} className="verified-check" />
                  Verified
                </span>
              </div>

              <div className="seller-card-body">
                <div className="seller-name-row">
                  <h3 className="seller-name">{seller.name}</h3>
                  <span className="seller-niche-tag">{seller.tag}</span>
                </div>

                <p className="seller-region">{seller.region}</p>

                <div className="seller-meta-row">
                  <div className="seller-rating">
                    <Star size={14} fill="#eab308" color="#eab308" />
                    <span className="rating-score">{seller.rating}</span>
                    <span className="rating-count">({seller.reviews})</span>
                  </div>

                  <div className="seller-location">
                    <MapPin size={13} className="loc-icon" />
                    <span>{seller.location}</span>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="view-shop-btn"
                  onClick={() => alert(`Visiting ${seller.name}'s shop...`)}
                >
                  <Store size={15} />
                  <span>View Shop</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
