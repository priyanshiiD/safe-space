import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Shield, Users, Navigation } from 'lucide-react';
import { SafetyService } from '../services/safetyService';

interface SafetyReport {
  id: string;
  reportType: string;
  address: string;
  severity: string;
  createdAt: string;
}

const SafetyMap: React.FC = () => {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [recentReports, setRecentReports] = useState<SafetyReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Mock safety data for visualization (in real app, this would come from API)
  const safetyData = [
    { id: 1, area: "Downtown", safety: "high", reports: 2, color: "bg-green-500" },
    { id: 2, area: "University District", safety: "medium", reports: 5, color: "bg-yellow-500" },
    { id: 3, area: "Industrial Area", safety: "low", reports: 12, color: "bg-red-500" },
    { id: 4, area: "Residential North", safety: "high", reports: 1, color: "bg-green-500" },
    { id: 5, area: "Shopping District", safety: "medium", reports: 3, color: "bg-yellow-500" },
  ];

  useEffect(() => {
    // Get user's location and load safety reports
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          loadSafetyReports(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location (e.g., city center)
          loadSafetyReports(40.7128, -74.0060); // NYC coordinates as fallback
        }
      );
    } else {
      // Fallback to default location
      loadSafetyReports(40.7128, -74.0060);
    }
  };

  const loadSafetyReports = async (lat: number, lng: number) => {
    try {
      setIsLoading(true);
      const response = await SafetyService.getSafetyReports(lat, lng, 10);
      
      if (response.reports) {
        const formattedReports = response.reports.map((report: any) => ({
          id: report._id,
          reportType: report.reportType,
          address: report.address,
          severity: report.severity,
          createdAt: new Date(report.createdAt).toLocaleString()
        }));
        setRecentReports(formattedReports);
      }
    } catch (error) {
      console.error('Error loading safety reports:', error);
      // Keep mock data as fallback
      setRecentReports([
        {
          id: '1',
          reportType: "harassment",
          address: "Main Street & 5th Ave",
          severity: "medium",
          createdAt: "2 hours ago"
        },
        {
          id: '2',
          reportType: "unsafe_area",
          address: "Park Avenue",
          severity: "high",
          createdAt: "4 hours ago"
        },
        {
          id: '3',
          reportType: "well_lit",
          address: "University Campus",
          severity: "positive",
          createdAt: "6 hours ago"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindSafeRoute = () => {
    if (!userLocation) {
      alert('Please allow location access to find safe routes');
      return;
    }
    alert('Safe Route Feature: Would show navigation with safety considerations and community data');
  };

  const handleReportIncident = () => {
    if (!userLocation) {
      alert('Please allow location access to report incidents');
      return;
    }
    alert('Report Incident Feature: Would open a form to report safety incidents anonymously');
  };

  const handleFindNearbyHelp = () => {
    if (!userLocation) {
      alert('Please allow location access to find nearby help');
      return;
    }
    alert('Nearby Help Feature: Would show nearby SafeSpace users and emergency contacts');
  };

  const handleViewAllReports = () => {
    alert('View All Reports Feature: Would show a comprehensive list of all safety reports in your area');
  };

  return (
    <section id="safety-map" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Community Safety Map
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time safety information powered by our community. 
            See safety reports, well-lit areas, and get the safest routes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-gray-100 rounded-2xl p-8 h-96 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 opacity-50"></div>
              
              {/* Simulated Map Areas */}
              <div className="relative h-full">
                <div className="absolute top-4 left-4 text-sm font-medium text-gray-600">
                  <div className="flex items-center space-x-2 mb-2">
                    <Navigation size={16} />
                    <span>Interactive Safety Map</span>
                  </div>
                </div>

                {/* Safety Zones */}
                {safetyData.map((zone, index) => (
                  <div
                    key={zone.id}
                    className={`absolute w-16 h-16 ${zone.color} rounded-full opacity-70 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center`}
                    style={{
                      top: `${20 + index * 15}%`,
                      left: `${15 + index * 18}%`
                    }}
                    onClick={() => setSelectedArea(zone.area)}
                  >
                    <MapPin size={20} className="text-white" />
                  </div>
                ))}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg p-4 shadow-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Safety Levels</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>High Safety</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Medium Safety</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Low Safety</span>
                    </div>
                  </div>
                </div>

                {/* Selected Area Info */}
                {selectedArea && (
                  <div className="absolute top-4 right-4 bg-white rounded-lg p-4 shadow-lg max-w-xs">
                    <h4 className="font-semibold text-gray-800 mb-2">{selectedArea}</h4>
                    <p className="text-sm text-gray-600">
                      Click on areas to see detailed safety information and recent reports.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Map Controls */}
            <div className="flex flex-wrap gap-4 mt-6">
              <button 
                onClick={handleFindSafeRoute}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Shield size={16} />
                <span>Find Safe Route</span>
              </button>
              <button 
                onClick={handleReportIncident}
                className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
              >
                <AlertTriangle size={16} />
                <span>Report Incident</span>
              </button>
              <button 
                onClick={handleFindNearbyHelp}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Users size={16} />
                <span>Find Nearby Help</span>
              </button>
            </div>
          </div>

          {/* Recent Reports & Stats */}
          <div className="space-y-6">
            {/* Safety Stats */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Safety Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Safe Areas</span>
                  <span className="font-semibold text-green-600">78%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-semibold text-blue-600">2,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reports Today</span>
                  <span className="font-semibold text-purple-600">{recentReports.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold text-pink-600">&lt; 2 min</span>
                </div>
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Reports</h3>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading reports...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="border-l-4 border-purple-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          report.severity === 'high' ? 'bg-red-100 text-red-600' :
                          report.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {report.reportType.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">{report.createdAt}</span>
                      </div>
                      <p className="text-sm text-gray-700">{report.address}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                onClick={handleViewAllReports}
                className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                View All Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafetyMap;