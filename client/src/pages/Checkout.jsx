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
  const [phone, setPhone] = useState(loggedInCustomer ? loggedInCustomer.phone || '' : '');
  const [address, setAddress] = useState(loggedInCustomer ? loggedInCustomer.address || '' : '');
  const [city, setCity] = useState(loggedInCustomer ? loggedInCustomer.city || '' : '');
  const [state, setState] = useState(loggedInCustomer ? loggedInCustomer.state || 'TN' : 'TN');
  const [postcode, setPostcode] = useState(loggedInCustomer ? loggedInCustomer.postcode || '' : '');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [autoCredentials, setAutoCredentials] = useState(null);

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
    
    const fullName = `${firstName} ${lastName}`.trim();
    let currentCustomer = loggedInCustomer;

    // If the customer is not currently logged in, auto-create account or auto-login if exists
    if (!loggedInCustomer) {
      const generatedPassword = Math.random().toString(36).slice(-8) + 'A1!'; // Basic complex password
      
      const customerResult = addCustomer({
        name: fullName,
        email: email,
        phone: phone,
        address: address,
        city: city,
        state: state,
        postcode: postcode,
        password: generatedPassword
      });

      if (customerResult.success) {
        currentCustomer = customerResult.customer;
        onCustomerLogin(currentCustomer);
        setAutoCredentials({
          email: email,
          password: generatedPassword,
          isNew: true
        });

        try {
          // Send welcome email via our backend
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          await fetch(`${apiUrl}/api/send-welcome`, {
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
          console.error("Email sending notice:", err);
        }
      } else if (customerResult.customer) {
        // Customer already exists, auto-login them
        currentCustomer = customerResult.customer;
        onCustomerLogin(currentCustomer);
        setAutoCredentials({
          email: email,
          isNew: false
        });
      }
    }

    // Save the order with vendor tagging and full shipping info
    const placedOrder = addOrder({
      customerName: fullName,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: {
        street: address,
        city: city,
        state: state,
        postcode: postcode
      },
      items: cartItems.map(item => ({
        ...item,
        vendorId: item.vendorId || (item.soldBy === 'RAMESH FARMS' || item.seller === 'RAMESH FARMS' ? 'v1' : (item.vendorId || 'v1')),
        soldBy: item.soldBy || item.seller || item.vendorName || 'EcShopping Partner'
      })),
      subtotal: subtotal,
      shipping: shipping,
      totalAmount: total,
      paymentMethod: paymentMethod
    });

    setOrderPlaced(true);
    setIsLoading(false);
    setTimeout(() => {
      clearCart();
      navigate('/profile');
    }, 3500);
  };

  if (orderPlaced) {
    return (
      <div className="checkout-success">
        <CheckCircle size={80} color="#4caf50" />
        <h2>Order Placed Successfully!</h2>
        <p>Thank you for shopping with EcShopping, <strong>{firstName || 'Customer'}</strong>.</p>
        {autoCredentials?.isNew && (
          <div className="auto-account-notice" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '15px 20px', borderRadius: '8px', margin: '20px auto', maxWidth: '480px', textAlign: 'left' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#166534' }}>🎉 Account Created & Logged In!</h4>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#15803d' }}>
              We've created your EcShopping account. Login details have been sent to <strong>{autoCredentials.email}</strong>.
            </p>
            <p style={{ margin: '0', fontSize: '13px', color: '#4b5563' }}>
              Temporary password: <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>{autoCredentials.password}</code>
            </p>
          </div>
        )}
        <p className="redirect-text" style={{ color: '#64748b', fontSize: '14px' }}>
          Redirecting to your Order History in your Profile...
        </p>
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
              <input 
                type="text" 
                placeholder="House number and street name" 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Town / City *</label>
              <input 
                type="text" 
                value={city} 
                onChange={e => setCity(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>State / County *</label>
              <select value={state} onChange={e => setState(e.target.value)} required>
                <option value="TN">Tamil Nadu</option>
                <option value="KA">Karnataka</option>
                <option value="KL">Kerala</option>
              </select>
            </div>
            <div className="form-group">
              <label>Postcode / ZIP *</label>
              <input 
                type="text" 
                value={postcode} 
                onChange={e => setPostcode(e.target.value)} 
                required 
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone *</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  required 
                />
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
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cod" 
                    checked={paymentMethod === 'cod'} 
                    onChange={e => setPaymentMethod(e.target.value)} 
                  />
                  <span>Cash on Delivery</span>
                </label>
                <div className="payment-desc">Pay with cash upon delivery.</div>
                
                <label className="payment-option">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="upi" 
                    checked={paymentMethod === 'upi'} 
                    onChange={e => setPaymentMethod(e.target.value)} 
                  />
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
