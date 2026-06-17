import React from 'react';
import Header from '../components/Header';
import EmergencyButton from '../components/EmergencyButton';
import Footer from '../components/Footer';

const SosPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <Header />
      <EmergencyButton />
      <Footer />
    </div>
  );
};

export default SosPage;
