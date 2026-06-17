import React from 'react';
import Header from '../components/Header';
import Features from '../components/Features';
import ProjectSuggestions from '../components/ProjectSuggestions';
import TechStack from '../components/TechStack';
import Footer from '../components/Footer';

const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <Header />
      <Features />
      <ProjectSuggestions />
      <TechStack />
      <Footer />
    </div>
  );
};

export default FeaturesPage;
