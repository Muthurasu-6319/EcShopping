import React from 'react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import HowItWorks from '../components/HowItWorks';
import FeaturedProducts from '../components/FeaturedProducts';
import MeetSellers from '../components/MeetSellers';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';

export default function Home({ onAddToCart }) {
  return (
    <>
      {/* 2. Hero Section */}
      <Hero />

      {/* 3. Shop by Category (6 Categories) */}
      <Categories />

      {/* 4. How It Works (5-Step Customer Flow + Mobile App Frame) */}
      <HowItWorks />

      {/* 5. Featured Products (Row 1: Handpicked + Row 2: More Fresh Picks) */}
      <FeaturedProducts onAddToCart={onAddToCart} />

      {/* 6. Meet Our Sellers (4 Verified Local Sellers) */}
      <MeetSellers />

      {/* 7. Why Choose Us & Vendor Banner */}
      <WhyChooseUs />

      {/* 8. Testimonials */}
      <Testimonials />

      {/* 9. Call to Action Banner */}
      <CTA />
    </>
  );
}
