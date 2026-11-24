import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Phone, MapPin, Users, Clock, Heart, Shield, Trash2 } from 'lucide-react';
import LocationEmergencyNumbers from './LocationEmergencyNumbers';
import { SafetyService } from '../services/safetyService';
import { useAuth } from '../contexts/AuthContext';

const EmergencyButton: React.FC = () => {
  const [isEmergency, setIsEmergency] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Array<{ _id?: string; name: string; email: string; phone: string; relationship: string }>>([]);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', relationship: '' });
  const locationTimerRef = useRef<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const response = await SafetyService.getEmergencyContacts();
        setContacts(response.contacts || []);
      } catch (error) {
        console.error('Error loading emergency contacts:', error);
      }
    };

    if (user) {
      loadContacts();
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (locationTimerRef.current) {
        window.clearInterval(locationTimerRef.current);
      }
    };
  }, []);

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
      
      // Send emergency alert
      const response = await SafetyService.sendEmergencyAlert(
        { 
          latitude: position.coords.latitude, 
          longitude: position.coords.longitude 
        },
        address
      );

      if (response.alert?._id) {
        setActiveAlertId(response.alert._id);
        startLiveLocationUpdates(response.alert._id);
      }
      
      alert('Emergency alert sent to your contacts and authorities!');
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      alert('Failed to send emergency alert. Please try again or call emergency services directly.');
    } finally {
      setIsLoading(false);
      setIsEmergency(false);
    }
  };

  const startLiveLocationUpdates = (alertId: string) => {
    if (locationTimerRef.current) {
      window.clearInterval(locationTimerRef.current);
    }

    const startedAt = Date.now();

    locationTimerRef.current = window.setInterval(async () => {
      try {
        if (Date.now() - startedAt > 10 * 60 * 1000) {
          window.clearInterval(locationTimerRef.current!);
          return;
        }

        const position = await getCurrentPosition();
        const address = await getAddressFromCoords(position.coords.latitude, position.coords.longitude);

        await SafetyService.updateEmergencyLocation(
          alertId,
          { latitude: position.coords.latitude, longitude: position.coords.longitude },
          address
        );
      } catch (error) {
        console.error('Error updating SOS location:', error);
      }
    }, 30000);
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

  const stopEmergencyAlert = async () => {
    if (!activeAlertId) return;

    try {
      setIsLoading(true);
      await SafetyService.resolveEmergencyAlert(activeAlertId);
      if (locationTimerRef.current) {
        window.clearInterval(locationTimerRef.current);
      }
      setActiveAlertId(null);
      alert('SOS resolved. Stay safe!');
    } catch (error) {
      console.error('Error resolving SOS:', error);
      alert('Unable to stop SOS. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await SafetyService.addEmergencyContact({
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        relationship: contactForm.relationship,
        isPrimary: contacts.length === 0
      });
      setContacts((prev) => [...prev, response.contact]);
      setContactForm({ name: '', email: '', phone: '', relationship: '' });
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      alert('Unable to add contact. Please sign in and try again.');
    }
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
                Start an SOS alert for your saved contacts and include your location when browser access is allowed. This demo does not contact emergency services.
              </p>
              
              <button
                onClick={handleEmergencyClick}
                disabled={isLoading}
                className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 hover:from-red-600 hover:via-pink-600 hover:to-rose-600 text-white px-12 py-6 rounded-full text-xl font-bold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : '🚨 EMERGENCY'}
              </button>

              {activeAlertId && (
                <div className="mt-4">
                  <button
                    onClick={stopEmergencyAlert}
                    disabled={isLoading}
                    className="bg-gray-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
                  >
                    {isLoading ? 'Stopping...' : 'Stop SOS'}
                  </button>
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-4">
                A 5-second countdown starts. Cancel before it sends if needed.
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
              Email to Saved Contacts
            </h4>
            <p className="text-gray-600 text-sm">
              Emails saved contacts when the backend and email service are configured
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
              Includes your current location in the alert and attempts periodic updates
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
              Browse community safety reports for additional context
            </p>
          </div>
        </div>

        {/* Location-based Emergency numbers */}
        <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200">
          <LocationEmergencyNumbers showTitle={true} compact={false} />
        </div>

        {/* Emergency contacts */}
        <div className="mt-8 p-6 bg-white rounded-2xl border-2 border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Emergency Contacts</h3>
          {user ? (
            <>
              <form onSubmit={handleAddContact} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Name"
                  value={contactForm.name}
                  onChange={(event) => setContactForm({ ...contactForm, name: event.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={contactForm.email}
                  onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={contactForm.phone}
                  onChange={(event) => setContactForm({ ...contactForm, phone: event.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Relationship"
                  value={contactForm.relationship}
                  onChange={(event) => setContactForm({ ...contactForm, relationship: event.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
                <button
                  type="submit"
                  className="md:col-span-2 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white py-2 rounded-lg font-semibold"
                >
                  Add Contact
                </button>
              </form>
              {contacts.length === 0 ? (
                <p className="text-sm text-gray-500">No emergency contacts added yet.</p>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact, index) => (
                    <div key={contact._id ?? `${contact.email}-${index}`} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                      <div>
                        <div className="font-semibold text-gray-800">{contact.name}</div>
                        <div className="text-sm text-gray-600">{contact.email}</div>
                        <div className="text-sm text-gray-600">{contact.phone} • {contact.relationship}</div>
                      </div>
                      {contact._id && (
                        <button
                          onClick={async () => {
                            const contactId = contact._id;
                            if (!contactId || !window.confirm(`Remove ${contact.name} from emergency contacts?`)) return;

                            try {
                              await SafetyService.deleteEmergencyContact(contactId);
                              setContacts(prev => prev.filter(c => c._id !== contactId));
                            } catch (error) {
                              console.error('Error removing emergency contact:', error);
                              alert(error instanceof Error ? error.message : 'Failed to remove contact. Please try again.');
                            }
                          }}
                          className="ml-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                          title="Remove contact"
                          aria-label={`Remove ${contact.name} from emergency contacts`}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">Sign in to add emergency contacts.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default EmergencyButton;