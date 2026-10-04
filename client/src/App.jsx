import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import HowItWorks from './components/HowItWorks';
import FeaturedProducts from './components/FeaturedProducts';
import MeetSellers from './components/MeetSellers';
import { ShoppingBag, CheckCircle } from 'lucide-react';
import './App.css';

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  const handleAddToCart = (product) => {
    setCartCount((prev) => prev + 1);
    setToastMessage(`Added "${product.title}" to cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  return (
    <div className="app-wrapper">
      {/* 1. AgriMart Header */}
      <Header cartCount={cartCount} />

      <main>
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Shop by Category (6 Categories) */}
        <Categories />

        {/* 4. How It Works (5-Step Customer Flow + Mobile App Frame) */}
        <HowItWorks />

        {/* 5. Featured Products (Row 1: Handpicked + Row 2: More Fresh Picks) */}
        <FeaturedProducts onAddToCart={handleAddToCart} />

        {/* 6. Meet Our Sellers (4 Verified Local Sellers) */}
        <MeetSellers />
      </main>

      {/* Toast Notification when adding item to cart */}
      {toastMessage && (
        <div className="cart-toast" role="status" aria-live="polite">
          <CheckCircle size={18} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
