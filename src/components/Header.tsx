import React, { useState } from 'react';
import { Shield, Menu, X, User, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <>
    <header className="bg-white shadow-lg border-b-2 border-rose-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-lg">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                SafeSpace
              </h1>
              <p className="text-xs text-gray-500">Women's Safety Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">
              Home
            </a>
            <a href="#features" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">
              Features
            </a>
            <a href="#safety-map" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">
              Safety Map
            </a>
            <a href="#community" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">
              Community
            </a>
            <a href="#support" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">
              Support
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-rose-600 transition-colors">
              <Bell size={20} />
            </button>
            <button className="p-2 text-gray-600 hover:text-rose-600 transition-colors">
              <Settings size={20} />
            </button>
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Hi, {user.fullName}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition-all"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleAuthClick}
                  className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white px-4 py-2 rounded-full hover:from-rose-600 hover:via-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
                >
              <User size={16} />
              <span>Sign In</span>
            </button>
              )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-rose-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <a href="#home" className="text-gray-700 hover:text-rose-600 font-medium">
                Home
              </a>
              <a href="#features" className="text-gray-700 hover:text-rose-600 font-medium">
                Features
              </a>
              <a href="#safety-map" className="text-gray-700 hover:text-rose-600 font-medium">
                Safety Map
              </a>
              <a href="#community" className="text-gray-700 hover:text-rose-600 font-medium">
                Community
              </a>
              <a href="#support" className="text-gray-700 hover:text-rose-600 font-medium">
                Support
              </a>
                {user ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Hi, {user.fullName}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full w-fit"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleAuthClick}
                    className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white px-4 py-2 rounded-full w-fit"
                  >
                <User size={16} />
                <span>Sign In</span>
              </button>
                )}
            </nav>
          </div>
        )}
      </div>
    </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};

export default Header;