import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import './Wishlist.css';
import { getProducts } from '../utils/storage';

export default function Wishlist({ onAddToCart }) {
  // Simulating wishlist with localStorage for now
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('ecshopping_wishlist');
    if (saved) {
      setWishlistItems(JSON.parse(saved));
    } else {
      // Just some dummy items for demonstration if empty
      const products = getProducts();
      if(products.length >= 2) {
        setWishlistItems([products[0], products[1]]);
      }
    }
  }, []);

  const removeFromWishlist = (id) => {
    const updated = wishlistItems.filter(item => item.id !== id);
    setWishlistItems(updated);
    localStorage.setItem('ecshopping_wishlist', JSON.stringify(updated));
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page empty-wishlist container">
        <Heart size={64} color="#cbd5e1" />
        <h2>Your Wishlist is Empty</h2>
        <p>Save items you love and buy them later.</p>
        <Link to="/shop" className="continue-shopping">Explore Products</Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page container">
      <h1>My Wishlist</h1>
      <div className="wishlist-grid">
        {wishlistItems.map(item => (
          <div className="wishlist-card" key={item.id}>
            <div className="remove-btn" onClick={() => removeFromWishlist(item.id)}>
              <Trash2 size={18} />
            </div>
            <Link to={`/product/${item.id}`}>
              <img src={item.image} alt={item.title} />
            </Link>
            <div className="wishlist-info">
              <Link to={`/product/${item.id}`} className="title-link">
                <h3>{item.title}</h3>
              </Link>
              <p className="price">₹{item.price}</p>
              <button 
                className="move-to-cart-btn"
                onClick={() => {
                  onAddToCart(item);
                  removeFromWishlist(item.id);
                }}
              >
                <ShoppingCart size={16} /> Move to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
