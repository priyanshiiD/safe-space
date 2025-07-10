import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import EmergencyButton from './components/EmergencyButton';
import SafetyMap from './components/SafetyMap';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
        <Header />
        <Hero />
        <EmergencyButton />
        <Features />
        <SafetyMap />
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;