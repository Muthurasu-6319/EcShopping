import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import './Cart.css';

export default function Cart({ cartItems, updateQuantity, removeItem }) {
  const navigate = useNavigate();

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    const priceStr = item.price.toString().replace(/[^0-9.-]+/g,"");
    const price = parseFloat(priceStr.split('-')[0]) || 0; // Just taking the first part if it's a range
    return total + (price * item.quantity);
  }, 0);
  
  const shipping = subtotal > 0 ? 50 : 0;
  const total = subtotal + shipping;

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={64} className="empty-icon" />
            <h2>Your cart is currently empty.</h2>
            <p>Looks like you haven't added any products yet.</p>
            <Link to="/shop" className="btn-primary mt-4">Return to Shop</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-section">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => {
                    const priceStr = item.price.toString().replace(/[^0-9.-]+/g,"");
                    const price = parseFloat(priceStr.split('-')[0]) || 0;
                    const itemSubtotal = price * item.quantity;
                    
                    return (
                      <tr key={`${item.id}-${item.variant || 'default'}`}>
                        <td className="product-col">
                          <img src={item.image || 'https://via.placeholder.com/150'} alt={item.title} />
                          <div className="product-details">
                            <h3>{item.title || item.name} {item.variant ? `(${item.variant})` : ''}</h3>
                            {item.soldBy && <span className="seller">Sold By: {item.soldBy}</span>}
                          </div>
                        </td>
                        <td className="price-col">₹{price.toFixed(2)}</td>
                        <td className="quantity-col">
                          <div className="qty-control">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                              <Minus size={14} />
                            </button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="subtotal-col">₹{itemSubtotal.toFixed(2)}</td>
                        <td className="action-col">
                          <button className="remove-btn" onClick={() => removeItem(item.id)}>
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="cart-summary-section">
              <div className="cart-totals">
                <h2>Cart Totals</h2>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>₹{shipping.toFixed(2)}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                
                <button 
                  className="btn-checkout" 
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
