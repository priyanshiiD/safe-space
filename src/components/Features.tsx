import React from 'react';
import { 
  Shield, 
  MapPin, 
  Users, 
  MessageCircle, 
  Phone, 
  Eye,
  Lock,
  Bell,
  Heart,
  Flower2,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Features: React.FC = () => {
  const { user } = useAuth();

  const handleDownload = () => {
    // Scroll to emergency button to show the main feature
    document.getElementById('emergency-button')?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: <Shield size={32} className="text-rose-600" />,
      title: "Real-time Location Sharing",
      description: "Share your location with trusted contacts automatically when you feel unsafe",
      color: "bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200",
      decorative: "🌸"
    },
    {
      icon: <Phone size={32} className="text-red-600" />,
      title: "Emergency SOS",
      description: "One-tap emergency button that alerts authorities and your emergency contacts",
      color: "bg-gradient-to-br from-red-50 to-rose-50 border-red-200",
      decorative: "🚨"
    },
    {
      icon: <Users size={32} className="text-purple-600" />,
      title: "Community Network",
      description: "Connect with other women in your area for mutual support and safety",
      color: "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200",
      decorative: "👭"
    },
    {
      icon: <MapPin size={32} className="text-pink-600" />,
      title: "Safety Heat Map",
      description: "View real-time safety reports and avoid potentially dangerous areas",
      color: "bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200",
      decorative: "🗺️"
    },
    {
      icon: <MessageCircle size={32} className="text-indigo-600" />,
      title: "Anonymous Reporting",
      description: "Report incidents anonymously to help other women stay safe",
      color: "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200",
      decorative: "📝"
    },
    {
      icon: <Eye size={32} className="text-teal-600" />,
      title: "Safe Route Planning",
      description: "Get the safest route recommendations based on community data",
      color: "bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200",
      decorative: "🛣️"
    },
    {
      icon: <Lock size={32} className="text-yellow-600" />,
      title: "Secure Messaging",
      description: "End-to-end encrypted messaging with your safety network",
      color: "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200",
      decorative: "🔐"
    },
    {
      icon: <Bell size={32} className="text-blue-600" />,
      title: "Smart Notifications",
      description: "Intelligent alerts based on your location and safety patterns",
      color: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200",
      decorative: "🔔"
    },
    {
      icon: <Heart size={32} className="text-rose-600" />,
      title: "24/7 Support",
      description: "Access to trained counselors and support staff anytime you need help",
      color: "bg-gradient-to-br from-rose-50 to-red-50 border-rose-200",
      decorative: "💝"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-rose-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 text-pink-200 opacity-50">
        <Flower2 size={60} />
      </div>
      <div className="absolute bottom-10 left-10 text-rose-200 opacity-50">
        <Star size={50} />
      </div>
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-full">
              <Heart size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Comprehensive Safety Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every feature is designed with women's safety in mind, providing multiple layers 
            of protection and community support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-8 rounded-2xl border-2 ${feature.color} hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}
            >
              {/* Decorative emoji */}
              <div className="absolute top-4 right-4 text-2xl opacity-30">
                {feature.decorative}
              </div>
              
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-full shadow-lg">
                  {feature.icon}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 text-center leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative">
              <div className="flex justify-center mb-4">
                <div className="flex space-x-2">
                  <span className="text-3xl">🌸</span>
                  <span className="text-3xl">💪</span>
                  <span className="text-3xl">🛡️</span>
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Feel Safer?
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Join thousands of women who trust SafeSpace for their daily safety needs.
              </p>
              <button 
                onClick={handleDownload}
                className="bg-white text-rose-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg text-lg"
              >
                🌸 Download SafeSpace
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;