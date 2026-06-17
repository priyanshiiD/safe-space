import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import TechStack from '../components/TechStack';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <Header />
      <Hero />
      <Features />
      <TechStack />
      <Footer />
    </div>
  );
};

export default HomePage;
