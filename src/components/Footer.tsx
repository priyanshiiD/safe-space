import React from 'react';
import { Shield, Heart, Phone, MapPin, Flower2 } from 'lucide-react';
import LocationEmergencyNumbers from './LocationEmergencyNumbers';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 text-pink-300 opacity-20">
        <Flower2 size={60} />
      </div>
      <div className="absolute bottom-10 left-10 text-rose-300 opacity-20">
        <Heart size={50} />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-lg">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">SafeSpace</h3>
                <p className="text-sm text-gray-300">Women's Safety Platform</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Empowering women with technology-driven safety solutions. 
              Building safer communities, one connection at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-pink-300">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#home" className="text-gray-300 hover:text-pink-300 transition-colors">Home</a></li>
              <li><a href="#features" className="text-gray-300 hover:text-pink-300 transition-colors">Features</a></li>
              <li><a href="#safety-map" className="text-gray-300 hover:text-pink-300 transition-colors">Safety Map</a></li>
              <li><a href="#community" className="text-gray-300 hover:text-pink-300 transition-colors">Community</a></li>
              <li><a href="#support" className="text-gray-300 hover:text-pink-300 transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-purple-300">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-purple-300 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-300 hover:text-purple-300 transition-colors">Safety Tips</a></li>
              <li><a href="#" className="text-gray-300 hover:text-purple-300 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-purple-300 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-purple-300 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Emergency Contacts */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-rose-300">Emergency Numbers</h4>
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
              <LocationEmergencyNumbers showTitle={false} compact={true} />
            </div>

            {/* Crisis Resources */}
            <div className="mt-4 p-4 bg-gradient-to-r from-red-900 to-pink-900 bg-opacity-50 rounded-lg border border-red-700">
              <div className="flex items-center space-x-2 mb-2">
                <Heart size={16} className="text-red-400" />
                <h5 className="font-semibold text-red-300">Crisis Resources</h5>
              </div>
              <p className="text-xs text-gray-300 mb-2">
                If you're in immediate danger, call your local emergency number
              </p>
              <p className="text-xs text-gray-300">
                Numbers shown are based on your current location
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2024 SafeSpace. All rights reserved. Made with 💝 for women's safety.
            </p>
          </div>
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-6 text-xs">
              <a href="#" className="text-gray-400 hover:text-pink-300 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-300 transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-300 transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;