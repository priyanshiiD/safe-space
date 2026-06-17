import React from 'react';
import { Shield } from 'lucide-react';
import EmergencyMonitor from '../components/EmergencyMonitor';

const MonitorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <div className="sticky top-0 z-40 border-b border-rose-100 bg-white/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-lg">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">SafeSpace</div>
              <div className="text-xs text-gray-500">SOS Monitor</div>
            </div>
          </div>
          <a
            href="/"
            className="text-sm font-semibold text-rose-600 hover:text-rose-700"
          >
            Back to Home
          </a>
        </div>
      </div>
      <EmergencyMonitor />
    </div>
  );
};

export default MonitorPage;
