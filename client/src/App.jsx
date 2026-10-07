import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import { CheckCircle } from 'lucide-react';
import './App.css';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const handleAddToCart = (product, quantity = 1, variant = null) => {
    setCartItems((prevItems) => {
      // Check if item with same id and variant exists
      const existingItem = prevItems.find(item => item.id === product.id && item.variant === variant);
      if (existingItem) {
        return prevItems.map(item => 
          item.id === product.id && item.variant === variant 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prevItems, { ...product, quantity, variant }];
    });
    
    const variantText = variant ? ` (${variant})` : '';
    setToastMessage(`Added "${product.title || product.name}${variantText}" to cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate total count for header badge
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <Router>
      <div className="app-wrapper">
        <Header cartCount={cartCount} />

        <main>
          <Routes>
            <Route path="/" element={<Home onAddToCart={handleAddToCart} />} />
            <Route path="/shop" element={<Shop onAddToCart={handleAddToCart} />} />
            <Route path="/cart" element={
              <Cart 
                cartItems={cartItems} 
                updateQuantity={updateQuantity} 
                removeItem={removeItem} 
              />
            } />
            <Route path="/checkout" element={
              <Checkout 
                cartItems={cartItems} 
                clearCart={clearCart} 
              />
            } />
          </Routes>
        </main>

        <Footer />

        {/* Toast Notification when adding item to cart */}
        {toastMessage && (
          <div className="cart-toast" role="status" aria-live="polite">
            <CheckCircle size={18} className="toast-icon" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
