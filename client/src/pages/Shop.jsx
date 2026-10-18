import React, { useState, useEffect } from 'react';
import { ChevronRight, Grid, List, LayoutGrid, SlidersHorizontal, Heart, Clock, ChevronDown, Plus, Minus, Eye, Star, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts } from '../utils/storage';
import './Shop.css';
import '../components/FeaturedProducts.css';

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
  const [products, setProducts] = useState(mockProducts);

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
    // Load approved products from storage and combine with mock products
    const vendorProducts = getProducts().filter(p => p.status === 'approved');
    const combinedProducts = [
      ...mockProducts,
      ...vendorProducts.map(vp => ({
        id: vp.id,
        title: vp.title,
        price: Number(vp.price),
        image: vp.image,
        soldBy: vp.vendorName,
        badge: "New",
        rating: 5.0, // Default rating for new products
        reviews: 0,
        variants: [] // Defaults
      }))
    ];
    setProducts(combinedProducts);

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
          <div className="competitor-product-grid">
            {products.map((product) => {
              const qty = quantities[product.id] || 1;
              const originalPrice = product.originalPrice || (product.price ? Math.round(product.price * 1.25) : null);

              return (
                <div key={product.id} className="competitor-product-card">
                  {/* Square Image Box with Bottom Action Bar */}
                  <div className="card-image-wrapper">
                    <Link to={`/product/${product.id}`} className="card-image-link">
                      <img 
                        src={product.image} 
                        alt={product.title} 
                        className="card-main-image"
                        loading="lazy" 
                      />
                    </Link>
                    
                    {/* Badge */}
                    {product.badge && (
                      <span className="card-bestseller-badge">
                        {product.badge}
                      </span>
                    )}

                    {/* Wishlist Button */}
                    <button 
                      type="button" 
                      className="card-wishlist-toggle"
                      aria-label="Wishlist"
                    >
                      <Heart size={16} color="#475569" />
                    </button>

                    {/* Bottom Action Bar: Quantity Controls + ADD TO CART */}
                    <div className="card-bottom-action-bar">
                      <div className="card-qty-control">
                        <button 
                          type="button" 
                          onClick={() => handleQuantityChange(product.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="card-qty-num">{qty}</span>
                        <button 
                          type="button" 
                          onClick={() => handleQuantityChange(product.id, 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button 
                        type="button" 
                        className="card-add-cart-btn" 
                        onClick={() => handleAddToCartWithVariant(product)}
                      >
                        ADD TO CART
                      </button>
                    </div>
                  </div>
                  
                  {/* Details Below Image */}
                  <div className="card-details-box">
                    <Link to={`/product/${product.id}`} className="card-title-link">
                      <h3 className="card-product-title">{product.title}</h3>
                    </Link>

                    <div className="card-price-row">
                      {originalPrice && (
                        <span className="card-original-price">
                          Rs. {originalPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="card-current-price">
                        Rs. {Number(product.price).toFixed(2)}
                      </span>
                    </div>

                    <div className="card-rating-row">
                      <div className="card-stars">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                        ))}
                      </div>
                      <span className="card-reviews-text">
                        {product.reviews || 0} reviews
                      </span>
                    </div>
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
