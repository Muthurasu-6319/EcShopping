import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Plus, Minus, ArrowRight } from 'lucide-react';
import './FeaturedProducts.css';

export default function FeaturedProducts({ onAddToCart }) {
  const [wishlist, setWishlist] = useState({});
  const [quantities, setQuantities] = useState({});

  const productsList = [
    {
      id: 101,
      title: 'Black Salt / Karuppu Uppu 100g',
      seller: 'Ramesh Farms',
      rating: 5.0,
      reviews: 7,
      price: 28,
      originalPrice: 35,
      image: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&w=600&q=80',
      badge: 'Best Seller'
    },
    {
      id: 102,
      title: 'Beetroot Malt 20g | Trail Pack',
      seller: 'Shop Up',
      rating: 5.0,
      reviews: 1,
      price: 36,
      originalPrice: 45,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      badge: 'Best Seller'
    },
    {
      id: 103,
      title: 'ABC Malt 20g | Trail Pack',
      seller: 'Organic Foods',
      rating: 5.0,
      reviews: 1,
      price: 36,
      originalPrice: 45,
      image: 'https://images.unsplash.com/photo-1611077543781-a96c138b1d98?auto=format&fit=crop&w=600&q=80',
      badge: 'Best Seller'
    },
    {
      id: 104,
      title: 'Red Banana Malt 20g | Trail Pack',
      seller: 'Agri Farm',
      rating: 5.0,
      reviews: 1,
      price: 37,
      originalPrice: 46,
      image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=600&q=80',
      badge: null
    },
    {
      id: 105,
      title: 'Natural Mustard Seeds 250g',
      seller: 'Pure Spices',
      rating: 4.9,
      reviews: 12,
      price: 55,
      originalPrice: 70,
      image: 'https://images.unsplash.com/photo-1613589921763-7140e6c5bbbd?auto=format&fit=crop&w=600&q=80',
      badge: null
    },
    {
      id: 106,
      title: 'Organic Flax Seed 200g',
      seller: 'Green Valley',
      rating: 4.8,
      reviews: 18,
      price: 65,
      originalPrice: 85,
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
      badge: null
    },
    {
      id: 107,
      title: 'Pure Coconut Oil 1 Litre',
      seller: 'Ramesh Farms',
      rating: 4.9,
      reviews: 42,
      price: 150,
      originalPrice: 190,
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
      badge: 'Best Seller'
    },
    {
      id: 108,
      title: 'Palm Jaggery Powder 500g',
      seller: 'Shop Up',
      rating: 4.9,
      reviews: 28,
      price: 120,
      originalPrice: 150,
      image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=600&q=80',
      badge: 'Best Seller'
    }
  ];

  const toggleWishlist = (id) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQtyChange = (id, delta) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleAddToCart = (product) => {
    const qty = quantities[product.id] || 1;
    if (onAddToCart) {
      onAddToCart(product, qty);
    }
  };

  return (
    <section className="featured-products-section" id="shop">
      <div className="container">
        {/* Section Header */}
        <div className="products-block">
          <div className="section-header-row">
            <div>
              <span className="section-pill-tag">POPULAR PRODUCTS</span>
              <h2 className="section-title">All Products</h2>
            </div>
            <Link to="/shop" className="view-all-link">
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Competitor Style 4-Column Product Grid */}
          <div className="competitor-product-grid">
            {productsList.map((product) => {
              const isWished = !!wishlist[product.id];
              const qty = quantities[product.id] || 1;

              return (
                <div key={product.id} className="competitor-product-card">
                  {/* Square Image Box with Overlay Bar */}
                  <div className="card-image-wrapper">
                    <Link to={`/product/${product.id}`} className="card-image-link">
                      <img 
                        src={product.image} 
                        alt={product.title} 
                        className="card-main-image"
                        loading="lazy"
                      />
                    </Link>

                    {/* Green Best Seller Badge */}
                    {product.badge && (
                      <span className="card-bestseller-badge">
                        {product.badge}
                      </span>
                    )}

                    {/* Wishlist Button */}
                    <button 
                      type="button" 
                      className={`card-wishlist-toggle ${isWished ? 'wished' : ''}`}
                      onClick={() => toggleWishlist(product.id)}
                      title={isWished ? "Remove from wishlist" : "Add to wishlist"}
                      aria-label="Wishlist"
                    >
                      <Heart 
                        size={17} 
                        fill={isWished ? "#ef4444" : "none"} 
                        color={isWished ? "#ef4444" : "#475569"} 
                      />
                    </button>

                    {/* Bottom Action Bar: Quantity Controls + ADD TO CART */}
                    <div className="card-bottom-action-bar">
                      <div className="card-qty-control">
                        <button 
                          type="button" 
                          onClick={() => handleQtyChange(product.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="card-qty-num">{qty}</span>
                        <button 
                          type="button" 
                          onClick={() => handleQtyChange(product.id, 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button 
                        type="button" 
                        className="card-add-cart-btn"
                        onClick={() => handleAddToCart(product)}
                      >
                        ADD TO CART
                      </button>
                    </div>
                  </div>

                  {/* Product Details Below Image */}
                  <div className="card-details-box">
                    <Link to={`/product/${product.id}`} className="card-title-link">
                      <h3 className="card-product-title">{product.title}</h3>
                    </Link>

                    <div className="card-price-row">
                      {product.originalPrice && (
                        <span className="card-original-price">
                          Rs. {product.originalPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="card-current-price">
                        Rs. {product.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="card-rating-row">
                      <div className="card-stars">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill="#f59e0b" 
                            color="#f59e0b" 
                          />
                        ))}
                      </div>
                      <span className="card-reviews-text">
                        {product.reviews} {product.reviews === 1 ? 'review' : 'reviews'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
