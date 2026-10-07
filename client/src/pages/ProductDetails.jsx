import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProducts } from '../utils/storage';
import { Star, ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import './ProductDetails.css';

export default function ProductDetails({ onAddToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');

  useEffect(() => {
    const products = getProducts();
    const foundProduct = products.find(p => p.id === parseInt(id));
    if (foundProduct) {
      setProduct(foundProduct);
      if (foundProduct.variants && foundProduct.variants.length > 0) {
        setSelectedVariant(foundProduct.variants[0]);
      }
    }
  }, [id]);

  if (!product) {
    return (
      <div className="product-details-container loading">
        <h2>Product not found or loading...</h2>
        <Link to="/shop">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="product-details-container container">
      <Link to="/shop" className="back-link"><ArrowLeft size={16} /> Back to Shop</Link>
      
      <div className="product-details-grid">
        <div className="product-image-section">
          <img src={product.image} alt={product.title} className="main-image" />
        </div>
        
        <div className="product-info-section">
          <div className="product-category">{product.category}</div>
          <h1 className="product-title">{product.title}</h1>
          
          <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill={i < Math.floor(product.rating?.rate || 4) ? "#fbbf24" : "none"} color={i < Math.floor(product.rating?.rate || 4) ? "#fbbf24" : "#cbd5e1"} />
              ))}
            </div>
            <span className="reviews-count">({product.rating?.count || 120} reviews)</span>
          </div>
          
          <div className="product-price">₹{product.price}</div>
          
          <p className="product-description">{product.description}</p>
          
          {product.variants && product.variants.length > 0 && (
            <div className="product-variants">
              <h3>Available Options</h3>
              <div className="variant-options">
                {product.variants.map((variant, idx) => (
                  <button 
                    key={idx} 
                    className={`variant-btn ${selectedVariant === variant ? 'selected' : ''}`}
                    onClick={() => setSelectedVariant(variant)}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="product-actions">
            <div className="quantity-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            
            <button 
              className="add-to-cart-large"
              onClick={() => onAddToCart(product, quantity, selectedVariant)}
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
            
            <button className="wishlist-btn-large">
              <Heart size={20} />
            </button>
          </div>
          
          <div className="product-meta">
            <p><strong>Vendor:</strong> {product.vendorName || 'EcShopping Official'}</p>
            <p><strong>Stock:</strong> {product.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
