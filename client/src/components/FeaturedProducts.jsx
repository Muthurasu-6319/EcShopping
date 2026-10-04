import React, { useState } from 'react';
import { Star, Heart, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import './FeaturedProducts.css';

export default function FeaturedProducts({ onAddToCart }) {
  const [wishlist, setWishlist] = useState({});
  const [addedItems, setAddedItems] = useState({});

  const row1Products = [
    {
      id: 101,
      title: 'Organic Mangoes (1kg)',
      seller: 'Green Valley Farms',
      rating: 4.8,
      reviews: 214,
      price: 140,
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=500&q=80',
      badges: [{ text: 'Fresh', type: 'fresh' }]
    },
    {
      id: 102,
      title: 'A2 Cow Milk (1L)',
      seller: 'Happy Dairy & Co.',
      rating: 4.9,
      reviews: 350,
      price: 60,
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=500&q=80',
      badges: [
        { text: 'Best Seller', type: 'bestseller' },
        { text: 'Organic', type: 'organic' }
      ]
    },
    {
      id: 103,
      title: 'Country Eggs (12 pcs)',
      seller: 'Village Farms (2KM)',
      rating: 4.8,
      reviews: 148,
      price: 90,
      image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=500&q=80',
      badges: [{ text: 'Fresh', type: 'fresh' }]
    },
    {
      id: 104,
      title: 'Desi Chicken (1kg)',
      seller: 'Farm Fresh (3KM)',
      rating: 4.9,
      reviews: 196,
      price: 250,
      image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=500&q=80',
      badges: [
        { text: 'Fresh', type: 'fresh' },
        { text: 'Organic', type: 'organic' }
      ]
    }
  ];

  const row2Products = [
    {
      id: 105,
      title: 'Desi Ghee (1L)',
      seller: 'Pure Farms',
      rating: 4.9,
      reviews: 120,
      price: 800,
      image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=500&q=80',
      badges: [{ text: 'Fresh', type: 'fresh' }]
    },
    {
      id: 106,
      title: 'Budgerigar (Pair)',
      seller: 'Birds World',
      rating: 4.6,
      reviews: 58,
      price: 1200,
      image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=500&q=80',
      badges: [{ text: 'Popular', type: 'popular' }]
    },
    {
      id: 107,
      title: 'Fresh Turmeric (1kg)',
      seller: 'Organic Spices',
      rating: 4.8,
      reviews: 94,
      price: 80,
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80',
      badges: [{ text: 'Natural', type: 'natural' }]
    },
    {
      id: 108,
      title: 'Aloe Vera Plant',
      seller: 'Green Life Nursery',
      rating: 4.9,
      reviews: 68,
      price: 150,
      image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=500&q=80',
      badges: [{ text: 'New', type: 'new' }]
    }
  ];

  const toggleWishlist = (id) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAdd = (product) => {
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    if (onAddToCart) {
      onAddToCart(product);
    }
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const renderProductCard = (product) => {
    const isWished = !!wishlist[product.id];
    const isAdded = !!addedItems[product.id];

    return (
      <div key={product.id} className="product-card">
        {/* Product Image Box */}
        <div className="product-image-box">
          <img 
            src={product.image} 
            alt={product.title} 
            className="product-img"
            loading="lazy"
          />

          {/* Badges Container */}
          <div className="product-badges-wrapper">
            {product.badges.map((b, i) => (
              <span key={i} className={`p-badge badge-${b.type}`}>
                {b.text}
              </span>
            ))}
          </div>

          {/* Wishlist Button */}
          <button 
            type="button" 
            className={`wishlist-btn ${isWished ? 'wished' : ''}`}
            onClick={() => toggleWishlist(product.id)}
            title={isWished ? "Remove from wishlist" : "Add to wishlist"}
            aria-label="Wishlist"
          >
            <Heart size={16} fill={isWished ? "#ef4444" : "none"} color={isWished ? "#ef4444" : "#475569"} />
          </button>
        </div>

        {/* Product Details */}
        <div className="product-body">
          <h3 className="product-title">{product.title}</h3>
          <p className="product-seller">{product.seller}</p>

          <div className="product-rating-row">
            <div className="star-rating">
              <Star size={14} className="star-icon" fill="#eab308" color="#eab308" />
              <span className="rating-score">{product.rating}</span>
            </div>
            <span className="rating-count">({product.reviews})</span>
          </div>

          <div className="product-price-row">
            <span className="currency-symbol">₹</span>
            <span className="price-amount">{product.price.toLocaleString('en-IN')}</span>
          </div>

          {/* Add to Cart Button */}
          <button 
            type="button" 
            className={`add-to-cart-btn ${isAdded ? 'added' : ''}`}
            onClick={() => handleAdd(product)}
          >
            {isAdded ? (
              <>
                <Check size={16} />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="featured-products-section" id="shop">
      <div className="container">
        {/* ROW 1: Handpicked products */}
        <div className="products-block">
          <div className="section-header-row">
            <div>
              <span className="section-pill-tag">POPULAR PRODUCTS</span>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Handpicked products from our trusted sellers.</p>
            </div>
            <button 
              type="button" 
              className="view-all-pill-btn"
              onClick={() => alert('Viewing all featured products')}
            >
              <span>View All Products</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="products-grid">
            {row1Products.map((p) => renderProductCard(p))}
          </div>
        </div>

        {/* ROW 2: More fresh picks */}
        <div className="products-block second-block">
          <div className="section-header-row">
            <div>
              <span className="section-pill-tag">POPULAR PRODUCTS</span>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">More fresh picks, just for you.</p>
            </div>
            <button 
              type="button" 
              className="view-all-pill-btn"
              onClick={() => alert('Viewing all fresh picks')}
            >
              <span>View All Products</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="products-grid">
            {row2Products.map((p) => renderProductCard(p))}
          </div>
        </div>
      </div>
    </section>
  );
}
