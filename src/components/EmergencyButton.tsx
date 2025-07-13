import React, { useState } from 'react';
import { AlertTriangle, Phone, MapPin, Users, Clock, Heart, Shield } from 'lucide-react';
import LocationEmergencyNumbers from './LocationEmergencyNumbers';
import { SafetyService } from '../services/safetyService';

const EmergencyButton: React.FC = () => {
  const [isEmergency, setIsEmergency] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmergencyClick = async () => {
    setIsEmergency(true);
    setCountdown(5);
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          sendEmergencyAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendEmergencyAlert = async () => {
    try {
      setIsLoading(true);
      
      // Get current location
      const position = await getCurrentPosition();
      const address = await getAddressFromCoords(position.coords.latitude, position.coords.longitude);
      
      // Show confirmation dialog first
      const confirmed = window.confirm(
        'Are you sure you want to send an emergency alert?\n\n' +
        'This will notify emergency contacts and authorities with your location.'
      );
      
      if (!confirmed) {
        setIsLoading(false);
        setIsEmergency(false);
        return;
      }
      
      // Send emergency alert to backend
      await SafetyService.sendEmergencyAlert(
        { 
          latitude: position.coords.latitude, 
          longitude: position.coords.longitude 
        },
        address
      );
      
      // Show success message
      alert(
        '🚨 EMERGENCY ALERT SENT!\n\n' +
        'Your location and emergency alert have been sent to:\n' +
        '• Emergency contacts\n' +
        '• Local authorities\n' +
        '• SafeSpace community\n\n' +
        'Help is on the way. Stay safe!'
      );
      
      // Log for developer monitoring (you can check browser console)
      console.log('🚨 EMERGENCY ALERT TRIGGERED:', {
        timestamp: new Date().toISOString(),
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        address: address,
        userAgent: navigator.userAgent
      });
      
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      alert('Failed to send emergency alert. Please try again or call emergency services directly.');
    } finally {
      setIsLoading(false);
      setIsEmergency(false);
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
    });
  };

  const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${lat}, ${lng}`;
    } catch (error) {
      return `${lat}, ${lng}`;
    }
  };

  const cancelEmergency = () => {
    setIsEmergency(false);
    setCountdown(0);
  };

  return (
    <section id="emergency-button" className="py-16 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 opacity-50"></div>
      
      <div className="max-w-4xl mx-auto text-center relative">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full">
            <Shield size={32} className="text-white" />
          </div>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Emergency Assistance
        </h2>
        <h3 className="text-2xl md:text-3xl font-semibold text-gray-600 mb-8">
          Help When You Need It Most
        </h3>
        
        <div className="bg-gradient-to-r from-red-50 via-pink-50 to-rose-50 rounded-2xl p-8 mb-8 border-2 border-red-100">
          {!isEmergency ? (
            <div>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="p-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-2xl">
                    <AlertTriangle size={48} className="text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 p-2 bg-yellow-400 rounded-full animate-bounce">
                    <Heart size={16} className="text-white" />
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Need Help? We're Here for You
              </h3>
              
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Press the emergency button to instantly alert your trusted contacts, 
                share your location, and connect with emergency services.
              </p>
              
              <button
                onClick={handleEmergencyClick}
                disabled={isLoading}
                className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 hover:from-red-600 hover:via-pink-600 hover:to-rose-600 text-white px-12 py-6 rounded-full text-xl font-bold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : '🚨 EMERGENCY'}
              </button>
              
              <p className="text-sm text-gray-500 mt-4">
                Hold for 3 seconds or tap to activate
              </p>
            </div>
          ) : (
            <div>
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-bounce shadow-2xl">
                  <Clock size={48} className="text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-red-600 mb-2">
                Emergency Alert Activating in {countdown}
              </h3>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={cancelEmergency}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-full font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendEmergencyAlert}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-semibold transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Now'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Emergency Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-red-100">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full">
                <Phone size={32} className="text-white" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Instant Alerts
            </h4>
            <p className="text-gray-600 text-sm">
              Automatically contacts emergency services and your trusted contacts
            </p>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border-2 border-pink-100">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full">
                <MapPin size={32} className="text-white" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Location Sharing
            </h4>
            <p className="text-gray-600 text-sm">
              Shares your exact location with emergency contacts in real-time
            </p>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <Users size={32} className="text-white" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Community Alert
            </h4>
            <p className="text-gray-600 text-sm">
              Notifies nearby SafeSpace users who can provide immediate help
            </p>
          </div>
        </div>

        {/* Location-based Emergency numbers */}
        <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200">
          <LocationEmergencyNumbers showTitle={true} compact={false} />
        </div>
      </div>
    </section>
  );
};

export default EmergencyButton;