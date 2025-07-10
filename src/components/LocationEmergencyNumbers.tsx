import React, { useState, useEffect } from 'react';
import { Phone, MapPin, AlertTriangle, Heart, Shield, Globe } from 'lucide-react';
import { LocationEmergencyService, EmergencyNumber } from '../utils/emergencyNumbers';

interface LocationEmergencyNumbersProps {
  showTitle?: boolean;
  compact?: boolean;
}

const LocationEmergencyNumbers: React.FC<LocationEmergencyNumbersProps> = ({ 
  showTitle = true, 
  compact = false 
}) => {
  const [emergencyNumbers, setEmergencyNumbers] = useState<EmergencyNumber[]>([]);
  const [userLocation, setUserLocation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadEmergencyNumbers();
  }, []);

  const loadEmergencyNumbers = async () => {
    try {
      setLoading(true);
      const location = await LocationEmergencyService.getUserLocation();
      const numbers = await LocationEmergencyService.getEmergencyNumbers();
      
      setEmergencyNumbers(numbers);
      setUserLocation(location?.country || 'Unknown Location');
      setError('');
    } catch (err) {
      setError('Unable to load emergency numbers');
      console.error('Error loading emergency numbers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (number: string) => {
    if (LocationEmergencyService.isCallable(number)) {
      const formattedNumber = LocationEmergencyService.formatForCalling(number);
      window.open(`tel:${formattedNumber}`, '_self');
    } else {
      alert(`Please contact: ${number}`);
    }
  };

  const getIconForType = (type: EmergencyNumber['type']) => {
    switch (type) {
      case 'police': return <Shield size={16} className="text-blue-600" />;
      case 'medical': return <Heart size={16} className="text-red-600" />;
      case 'fire': return <AlertTriangle size={16} className="text-orange-600" />;
      case 'women': return <Heart size={16} className="text-pink-600" />;
      case 'crisis': return <Phone size={16} className="text-purple-600" />;
      default: return <Phone size={16} className="text-gray-600" />;
    }
  };

  const getColorForType = (type: EmergencyNumber['type']) => {
    switch (type) {
      case 'police': return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      case 'medical': return 'border-red-200 bg-red-50 hover:bg-red-100';
      case 'fire': return 'border-orange-200 bg-orange-50 hover:bg-orange-100';
      case 'women': return 'border-pink-200 bg-pink-50 hover:bg-pink-100';
      case 'crisis': return 'border-purple-200 bg-purple-50 hover:bg-purple-100';
      default: return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        <span className="ml-2 text-gray-600">Loading emergency numbers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
        <button 
          onClick={loadEmergencyNumbers}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      {showTitle && (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <MapPin size={20} className="text-rose-600" />
            <h3 className="text-lg font-bold text-gray-800">Emergency Numbers</h3>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Globe size={16} />
            <span>Location: {userLocation}</span>
          </div>
        </div>
      )}

      <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {emergencyNumbers.map((emergency, index) => (
          <div
            key={index}
            className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${getColorForType(emergency.type)}`}
            onClick={() => handleCall(emergency.number)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getIconForType(emergency.type)}
                <span className="font-semibold text-gray-800 text-sm">
                  {emergency.service}
                </span>
              </div>
              <Phone size={14} className="text-gray-400" />
            </div>
            
            <div className="text-lg font-bold text-gray-900 mb-1">
              {emergency.number}
            </div>
            
            <p className="text-xs text-gray-600 leading-tight">
              {emergency.description}
            </p>
            
            {LocationEmergencyService.isCallable(emergency.number) && (
              <div className="mt-2 text-xs text-green-600 font-medium">
                Tap to call
              </div>
            )}
          </div>
        ))}
      </div>

      {!compact && (
        <div className="mt-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle size={16} className="text-rose-600" />
            <span className="font-semibold text-rose-800 text-sm">Important</span>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed">
            These numbers are automatically updated based on your location. 
            In a real emergency, always call your local emergency services immediately.
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationEmergencyNumbers;