import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, MapPin, Phone, Users, Shield } from 'lucide-react';

interface EmergencyAlert {
  _id: string;
  userId: {
    fullName: string;
    phone: string;
  };
  location: {
    coordinates: [number, number];
  };
  address: string;
  status: string;
  createdAt: string;
}

interface EmergencyStats {
  totalAlerts: number;
  activeAlerts: number;
  todayAlerts: number;
  lastUpdated: string;
}

const EmergencyMonitor: React.FC = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [stats, setStats] = useState<EmergencyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchEmergencyData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchEmergencyData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmergencyData = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Fetch alerts
      const alertsResponse = await fetch(`${API_BASE_URL}/safety/emergency`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Fetch stats
      const statsResponse = await fetch(`${API_BASE_URL}/safety/emergency/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (alertsResponse.ok && statsResponse.ok) {
        const alertsData = await alertsResponse.json();
        const statsData = await statsResponse.json();
        
        setAlerts(alertsData.alerts);
        setStats(statsData);
        setError('');
      } else {
        setError('Failed to fetch emergency data');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching emergency data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'false_alarm': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading emergency monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full">
                <Shield size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Emergency Monitor</h1>
                <p className="text-gray-600">Real-time emergency alert monitoring</p>
              </div>
            </div>
            <button
              onClick={fetchEmergencyData}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-pink-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Alerts</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalAlerts}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <AlertTriangle size={24} className="text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Alerts</p>
                  <p className="text-3xl font-bold text-red-600">{stats.activeAlerts}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Clock size={24} className="text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Today's Alerts</p>
                  <p className="text-3xl font-bold text-green-600">{stats.todayAlerts}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users size={24} className="text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts List */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Emergency Alerts</h2>
            <div className="text-sm text-gray-500">
              Last updated: {stats?.lastUpdated ? formatDate(stats.lastUpdated) : 'N/A'}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Alerts</h3>
              <p className="text-gray-600">All clear! No emergency alerts at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-full">
                          <AlertTriangle size={16} className="text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {alert.userId?.fullName || 'Unknown User'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {alert.userId?.phone || 'No phone number'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                          {alert.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span>{alert.address}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{formatDate(alert.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyMonitor; 