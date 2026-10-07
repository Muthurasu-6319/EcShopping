import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { addCustomer, addOrder } from '../utils/storage';
import './Checkout.css';

export default function Checkout({ cartItems, clearCart, loggedInCustomer, onCustomerLogin }) {
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [firstName, setFirstName] = useState(loggedInCustomer ? loggedInCustomer.name.split(' ')[0] : '');
  const [lastName, setLastName] = useState(loggedInCustomer ? loggedInCustomer.name.split(' ').slice(1).join(' ') : '');
  const [email, setEmail] = useState(loggedInCustomer ? loggedInCustomer.email : '');

  const subtotal = cartItems.reduce((total, item) => {
    const priceStr = item.price.toString().replace(/[^0-9.-]+/g,"");
    const price = parseFloat(priceStr.split('-')[0]) || 0;
    return total + (price * item.quantity);
  }, 0);
  
  const shipping = subtotal > 0 ? 50 : 0;
  const total = subtotal + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // If the customer is not currently logged in, try to auto-create an account
    if (!loggedInCustomer) {
      const generatedPassword = Math.random().toString(36).slice(-8) + 'A1!'; // Basic complex password
      const fullName = `${firstName} ${lastName}`.trim();
      
      const customerResult = addCustomer({
        name: fullName,
        email: email,
        password: generatedPassword
      });

      // If account creation succeeds (email didn't exist)
      if (customerResult.success) {
        // Auto-login the customer
        onCustomerLogin(customerResult.customer);

        try {
          // Send welcome email via our local backend
          await fetch(`${import.meta.env.VITE_API_URL}/api/send-welcome`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: fullName,
              email: email,
              password: generatedPassword
            })
          });
        } catch (err) {
          console.error("Email sending failed, but order placed. Backend might not be running.", err);
        }
      }
      // If customerResult.success is false (email exists), we just proceed with the order as guest.
    }

    // Save the order
    addOrder({
      customerName: `${firstName} ${lastName}`.trim(),
      customerEmail: email,
      items: cartItems,
      totalAmount: total,
      paymentMethod: 'cod' // Simplified for now
    });

    setOrderPlaced(true);
    setIsLoading(false);
    setTimeout(() => {
      clearCart();
      navigate('/');
    }, 4000);
  };

  if (orderPlaced) {
    return (
      <div className="checkout-success">
        <CheckCircle size={80} color="#4caf50" />
        <h2>Order Placed Successfully!</h2>
        <p>Thank you for shopping with EcShopping.</p>
        <p>Redirecting to home page...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page container">
        <h2>Your cart is empty. Please add items to proceed.</h2>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">Checkout</h1>
        
        <form className="checkout-layout" onSubmit={handleSubmit}>
          <div className="billing-details">
            <h2>Billing Details</h2>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Company Name (Optional)</label>
              <input type="text" />
            </div>
            <div className="form-group">
              <label>Country / Region *</label>
              <select required>
                <option>India</option>
              </select>
            </div>
            <div className="form-group">
              <label>Street Address *</label>
              <input type="text" placeholder="House number and street name" required />
            </div>
            <div className="form-group">
              <label>Town / City *</label>
              <input type="text" required />
            </div>
            <div className="form-group">
              <label>State / County *</label>
              <select required>
                <option value="">Select an option...</option>
                <option value="TN">Tamil Nadu</option>
                <option value="KA">Karnataka</option>
                <option value="KL">Kerala</option>
              </select>
            </div>
            <div className="form-group">
              <label>Postcode / ZIP *</label>
              <input type="text" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone *</label>
                <input type="tel" required />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
          </div>

          <div className="order-summary">
            <h2>Your Order</h2>
            <div className="order-box">
              <div className="order-row header">
                <span>Product</span>
                <span>Subtotal</span>
              </div>
              
              {cartItems.map((item) => {
                const priceStr = item.price.toString().replace(/[^0-9.-]+/g,"");
                const price = parseFloat(priceStr.split('-')[0]) || 0;
                return (
                  <div className="order-row item" key={item.id}>
                    <span>{item.title || item.name} <strong>x {item.quantity}</strong></span>
                    <span>₹{(price * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
              
              <div className="order-row subtotal">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="order-row shipping">
                <span>Shipping</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>
              <div className="order-row total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <div className="payment-methods">
                <label className="payment-option">
                  <input type="radio" name="payment" value="cod" defaultChecked />
                  <span>Cash on Delivery</span>
                </label>
                <div className="payment-desc">Pay with cash upon delivery.</div>
                
                <label className="payment-option">
                  <input type="radio" name="payment" value="upi" />
                  <span>UPI / Cards</span>
                </label>
              </div>

              <button type="submit" className="btn-place-order" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
