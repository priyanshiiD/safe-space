import React from 'react';
import Header from '../components/Header';
import SafetyMap from '../components/SafetyMap';
import Footer from '../components/Footer';

const SafetyMapPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <Header />
      <SafetyMap />
      <Footer />
    </div>
  );
};

export default SafetyMapPage;
