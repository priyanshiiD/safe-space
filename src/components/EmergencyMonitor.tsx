import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';
import { SafetyService } from '../services/safetyService';

interface EmergencyAlert {
  id: string;
  address: string;
  status: string;
  lastLocationAt?: string;
  createdAt: string;
}

const EmergencyMonitor: React.FC = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      const response = await SafetyService.getEmergencyAlertsPublic();
      const formatted = (response.alerts || []).map((alert: any) => ({
        id: alert._id,
        address: alert.address,
        status: alert.status,
        createdAt: new Date(alert.createdAt).toLocaleString(),
        lastLocationAt: alert.lastLocationAt ? new Date(alert.lastLocationAt).toLocaleString() : undefined
      }));
      setAlerts(formatted);
    } catch (error) {
      console.error('Error loading emergency alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="emergency-monitor" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full">
            <AlertTriangle size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">SOS Monitor</h2>
            <p className="text-gray-600">Live emergency alerts and last known locations.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-gray-500">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="text-gray-500">No active emergency alerts.</div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="border border-red-100 rounded-xl p-4 bg-red-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-red-600 font-semibold">
                    <AlertTriangle size={16} />
                    <span>{alert.status.toUpperCase()}</span>
                  </div>
                  <div className="text-xs text-gray-500">Created {alert.createdAt}</div>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <MapPin size={16} />
                  <span>{alert.address}</span>
                </div>
                {alert.lastLocationAt && (
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2">
                    <Clock size={14} />
                    <span>Last updated: {alert.lastLocationAt}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EmergencyMonitor;