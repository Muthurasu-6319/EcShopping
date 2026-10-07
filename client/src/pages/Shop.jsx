import React, { useState, useEffect } from 'react';
import { ChevronRight, Grid, List, LayoutGrid, SlidersHorizontal, Heart, Clock, ChevronDown, Plus, Minus, Eye, Star, ShoppingBag } from 'lucide-react';
import './Shop.css';

// Mock data for products
const shopSliderImages = [
  "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Grocery
  "https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Vegetables
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"  // Farm
];

const mockProducts = [
  {
    id: 1,
    title: "Pure Coconut Oil - Ramesh Farms",
    price: 150,
    image: "https://images.unsplash.com/photo-1611077543781-a96c138b1d98?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    soldBy: "RAMESH FARMS",
    badge: "Popular",
    rating: 4.8,
    reviews: 120,
    variants: ["1 Litre", "500 ml"]
  },
  {
    id: 2,
    title: "Natural Turmeric powder",
    price: 45,
    image: "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    soldBy: "Shop up",
    badge: "Natural",
    rating: 4.9,
    reviews: 84,
    variants: ["1 kg", "250 gm", "500 gm"]
  },
  {
    id: 3,
    title: "Palm jaggery powder",
    price: 120,
    image: "https://images.unsplash.com/photo-1613589921763-7140e6c5bbbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    soldBy: "RAMESH FARMS",
    badge: "Fresh",
    rating: 4.7,
    reviews: 56,
    variants: ["1 kg", "500 gm"]
  },
  {
    id: 4,
    title: "Sheep (Live)",
    price: 8000,
    image: "https://images.unsplash.com/photo-1484557985045-edf25e08da73?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    soldBy: "Agri Farm",
    badge: null,
    rating: 4.5,
    reviews: 12,
    variants: []
  },
  {
    id: 5,
    title: "Fresh Organic Tomatoes",
    price: 40,
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    soldBy: "Green Valley",
    badge: "New",
    rating: 4.9,
    reviews: 230,
    variants: ["1 kg", "2 kg"]
  },
  {
    id: 6,
    title: "Country Chicken - Nattu Kozhi",
    price: 450,
    image: "https://images.unsplash.com/photo-1548365328-8c6db3220e4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    soldBy: "Poultry Hub",
    badge: "Popular",
    rating: 4.6,
    reviews: 95,
    variants: ["1 kg", "Live"]
  }
];

export default function Shop({ onAddToCart }) {
  const [viewMode, setViewMode] = useState('grid');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantities, setQuantities] = useState({});

  const handleVariantSelect = (productId, variant) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variant }));
  };

  const handleQuantityChange = (productId, delta) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const next = current + delta;
      if (next < 1) return prev;
      return { ...prev, [productId]: next };
    });
  };

  const handleAddToCartWithVariant = (product) => {
    const qty = quantities[product.id] || 1;
    const variant = selectedVariants[product.id] || (product.variants && product.variants[0]);
    
    onAddToCart(product, qty, variant); 
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % shopSliderImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="shop-page">
      {/* Shop Hero Slider */}
      <div className="shop-hero-slider">
        {shopSliderImages.map((img, index) => (
          <div 
            key={index} 
            className={`slider-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="slider-overlay">
          <h2>Fresh Groceries & Farm Products</h2>
          <p>Direct from local farmers to your doorstep</p>
        </div>
        <div className="slider-dots">
          {shopSliderImages.map((_, index) => (
            <button 
              key={index} 
              aria-label={`Go to slide ${index + 1}`}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Breadcrumb Area */}
      <div className="shop-breadcrumb-area">
        <div className="container">
          <div className="breadcrumb-inner">
            <button className="browse-categories-btn">
              <List size={20} />
              BROWSE CATEGORIES
            </button>
            <div className="breadcrumb-nav">
              <a href="/">Home</a>
              <ChevronRight size={16} />
              <span>Shop</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container shop-container">
        {/* Sidebar */}
        <aside className="shop-sidebar">
          <div className="widget filter-widget">
            <h3 className="widget-title">Product Categories</h3>
            <ul className="category-list">
              <li><label><input type="checkbox" /> Groceries (15)</label></li>
              <li><label><input type="checkbox" /> Fresh Vegetables (23)</label></li>
              <li><label><input type="checkbox" /> Live Stock (5)</label></li>
              <li><label><input type="checkbox" /> Spices (12)</label></li>
              <li><label><input type="checkbox" /> Oils (8)</label></li>
            </ul>
          </div>
          <div className="widget filter-widget">
            <h3 className="widget-title">Price Range</h3>
            <input type="range" min="0" max="10000" className="price-slider" />
            <div className="price-labels">
              <span>₹0</span>
              <span>₹10,000+</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="shop-main">
          {/* Shop Header / Filters */}
          <div className="shop-header">
            <div className="filter-toggle-mobile">
              <button><SlidersHorizontal size={18} /> Filters</button>
            </div>
            
            <div className="view-modes">
              <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                <Grid size={18} />
              </button>
              <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                <LayoutGrid size={18} />
              </button>
            </div>

            <div className="sort-by">
              <span>Sort by:</span>
              <select defaultValue="default">
                <option value="default">Default sorting</option>
                <option value="popularity">Sort by popularity</option>
                <option value="rating">Sort by average rating</option>
                <option value="newest">Sort by latest</option>
                <option value="price-low">Sort by price: low to high</option>
                <option value="price-high">Sort by price: high to low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className={`product-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {mockProducts.map((product) => {
              const activeVariant = selectedVariants[product.id] || (product.variants && product.variants[0]);
              const qty = quantities[product.id] || 1;
              const isHovered = hoveredProduct === product.id;

              return (
                <div 
                  key={product.id} 
                  className="product-card"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className="product-image">
                    <img src={product.image} alt={product.title} />
                    
                    {/* Badges */}
                    <div className="product-badges">
                      {product.badge && <span className={`shop-badge badge-${product.badge.toLowerCase()}`}>{product.badge}</span>}
                    </div>

                    {/* Wishlist Button */}
                    <button className="shop-wishlist-btn">
                      <Heart size={16} color="#475569" />
                    </button>

                    {/* Variant Overlay Glassmorphism */}
                    {product.variants && product.variants.length > 0 && (
                      <div className={`variant-overlay ${isHovered ? 'show' : ''}`}>
                        <div className="variant-header">
                          <span className="variant-title">Options</span>
                          <ChevronDown size={16} />
                        </div>
                        <div className="variant-options">
                          {product.variants.map(v => (
                            <button 
                              key={v}
                              className={`variant-pill ${activeVariant === v ? 'active' : ''}`}
                              onClick={() => handleVariantSelect(product.id, v)}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                        
                        <div className="variant-action-row">
                          <div className="qty-selector">
                            <input type="number" value={qty} readOnly />
                            <div className="qty-btns">
                              <button onClick={() => handleQuantityChange(product.id, 1)}><Plus size={12} /></button>
                              <button onClick={() => handleQuantityChange(product.id, -1)}><Minus size={12} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-title">{product.title}</h3>
                    <div className="product-seller">{product.seller || product.soldBy}</div>
                    
                    <div className="shop-rating-row">
                      <div className="star-rating">
                        <Star size={14} className="star-icon" fill="#eab308" color="#eab308" />
                        <span className="rating-score">{product.rating}</span>
                      </div>
                      <span className="rating-count">({product.reviews})</span>
                    </div>

                    <div className="shop-price-row">
                      <span className="currency-symbol">₹</span>
                      <span className="price-amount">{product.price.toLocaleString('en-IN')}</span>
                    </div>
                    
                    {viewMode === 'list' && (
                      <div className="product-description">
                        High quality product sourced directly from local farmers and vendors. Authentic taste and freshness guaranteed.
                      </div>
                    )}
                    
                    <button className="shop-add-to-cart-btn" onClick={() => handleAddToCartWithVariant(product)}>
                      <ShoppingBag size={16} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination */}
          <div className="pagination">
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn next">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
