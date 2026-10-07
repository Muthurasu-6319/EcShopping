import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initStorage } from './utils/storage';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import VendorLogin from './pages/vendor/VendorLogin';
import VendorRegister from './pages/vendor/VendorRegister';
import VendorDashboard from './pages/vendor/VendorDashboard';
import { CheckCircle } from 'lucide-react';
import './App.css';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [vendorUser, setVendorUser] = useState(null);

  useEffect(() => {
    initStorage();
  }, []);

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
        <Routes>
          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              isAdminLoggedIn ? (
                <AdminDashboard onLogout={() => setIsAdminLoggedIn(false)} />
              ) : (
                <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />
              )
            } 
          />

          {/* Vendor Routes */}
          <Route 
            path="/vendor/register" 
            element={<VendorRegister />} 
          />
          <Route 
            path="/vendor/*" 
            element={
              vendorUser ? (
                <VendorDashboard vendor={vendorUser} onLogout={() => setVendorUser(null)} />
              ) : (
                <VendorLogin onLogin={(user) => setVendorUser(user)} />
              )
            } 
          />

          {/* Public Storefront Routes */}
          <Route 
            path="/*" 
            element={
              <>
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
              </>
            } 
          />
        </Routes>

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
