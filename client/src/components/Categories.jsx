import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import './Categories.css';

export default function Categories() {
  const categories = [
    {
      id: 1,
      title: 'Fresh & Natural',
      subtitle: '#Fruits, Vegetables, Organic',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=500&q=80',
      badge: 'Farm Fresh'
    },
    {
      id: 2,
      title: 'Groceries',
      subtitle: '#Rice, Grains, Spices, Oils',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80',
      badge: 'Pantry'
    },
    {
      id: 3,
      title: 'Dairy & Farm Products',
      subtitle: '#Milk, Eggs, Cheese, etc.',
      image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=500&q=80',
      badge: 'Pure Dairy'
    },
    {
      id: 4,
      title: 'Livestock',
      subtitle: '#Cows, Goats, Poultry, etc.',
      image: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=500&q=80',
      badge: 'Native Breeds'
    },
    {
      id: 5,
      title: 'Birds & Pets',
      subtitle: '#Birds, Fish, Pets, Accessories',
      image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=500&q=80',
      badge: 'Pets & Birds'
    },
    {
      id: 6,
      title: 'Home & Lifestyle',
      subtitle: '#Plants, Gardening, Handmade',
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=500&q=80',
      badge: 'Handmade'
    }
  ];

  return (
    <section className="categories-section" id="categories">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-row">
          <div>
            <span className="section-pill-tag">EXPLORE CATEGORIES</span>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">
              Everything you need, in one place. From farm-fresh produce to pets and more.
            </p>
          </div>
          <button 
            type="button" 
            className="view-all-link-btn"
            onClick={() => alert('Browsing all categories...')}
          >
            <span>View All Categories</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* 6 Category Cards Grid */}
        <div className="categories-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="category-card" tabIndex={0} role="button">
              <div className="category-image-wrapper">
                <img 
                  src={cat.image} 
                  alt={cat.title} 
                  className="category-image"
                  loading="lazy"
                />
                <span className="category-tag-badge">{cat.badge}</span>
              </div>
              <div className="category-info">
                <h3 className="category-title">{cat.title}</h3>
                <p className="category-subtitle">{cat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
