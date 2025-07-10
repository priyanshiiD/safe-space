import React from 'react';
import { Shield, Users, MapPin, Phone, Heart, Star, Flower2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Hero: React.FC = () => {
  const { user } = useAuth();

  const handleGetStarted = () => {
    // Scroll to features section
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWatchDemo = () => {
    // Show demo modal or scroll to emergency button
    document.getElementById('emergency-button')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-rose-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-pink-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-500"></div>
      
      {/* Decorative flowers */}
      <div className="absolute top-32 right-20 text-pink-300 opacity-30">
        <Flower2 size={40} />
      </div>
      <div className="absolute bottom-32 left-20 text-rose-300 opacity-30">
        <Flower2 size={32} />
      </div>
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="p-6 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-full shadow-2xl">
                <Shield size={56} className="text-white" />
              </div>
              <div className="absolute -top-2 -right-2 p-2 bg-yellow-400 rounded-full animate-bounce">
                <Star size={16} className="text-white" />
              </div>
              <div className="absolute -bottom-2 -left-2 p-2 bg-pink-400 rounded-full">
                <Heart size={16} className="text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Your Safety,
            <br />
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Our Priority
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
            SafeSpace empowers women with real-time safety tools, community support, 
            and emergency assistance at your fingertips.
          </p>
          
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            A comprehensive safety platform designed with women's needs in mind
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-rose-600 hover:via-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🌸 Get Started Now
            </button>
            <button 
              onClick={handleWatchDemo}
              className="border-2 border-rose-500 text-rose-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-rose-500 hover:text-white transition-all"
            >
              Watch Demo 📱
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-rose-400">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full">
                <Users size={32} className="text-rose-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">50K+</h3>
            <p className="text-gray-600">Women Protected</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-pink-400">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
                <MapPin size={32} className="text-pink-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">25+</h3>
            <p className="text-gray-600">Cities Covered</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-purple-400">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-100 to-rose-100 rounded-full">
                <Phone size={32} className="text-purple-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">24/7</h3>
            <p className="text-gray-600">Emergency Support</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-yellow-400">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full">
                <Shield size={32} className="text-yellow-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">99.9%</h3>
            <p className="text-gray-600">Response Rate</p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="bg-gradient-to-r from-rose-100 via-pink-100 to-purple-100 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            🌸 Trusted by Women Worldwide
          </h3>
          <p className="text-gray-600 mb-6">
            Built with care, designed for safety - Understanding women's unique safety challenges
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span>🔒 Complete Privacy</span>
            <span>🌐 Global Support</span>
            <span>👮‍♀️ Authority Integration</span>
            <span>🏥 Healthcare Access</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;