import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Eye, EyeOff, MapPin, X } from 'lucide-react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { SafetyService } from '../services/safetyService';
import { useAuth } from '../contexts/AuthContext';

interface ReportLocation {
  lat: number;
  lng: number;
}

interface ReportedSafetyReport {
  id: string;
  reportType: string;
  address: string;
  severity: string;
  createdAt: string;
  coordinates: [number, number];
}

interface Props {
  userLocation: ReportLocation | null;
  mapCenter: ReportLocation;
  onClose: () => void;
  onReported: (report: ReportedSafetyReport) => void;
}

const INCIDENT_TYPES = [
  { value: 'harassment', label: 'Harassment' },
  { value: 'unsafe_area', label: 'Unsafe area' },
  { value: 'well_lit', label: 'Well lit / safe' },
  { value: 'safe_zone', label: 'Safe zone' },
  { value: 'emergency', label: 'Emergency' }
];

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low', selected: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'medium', label: 'Medium', selected: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'high', label: 'High', selected: 'bg-red-100 text-red-700 border-red-300' }
];

const reportLocationIcon = L.divIcon({
  className: '',
  html: '<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#e11d48;border:2px solid white;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

const MapLocationClickHandler: React.FC<{
  onSelect: (location: ReportLocation) => void;
}> = ({ onSelect }) => {
  useMapEvents({
    click(event) {
      onSelect({ lat: event.latlng.lat, lng: event.latlng.lng });
    }
  });
  return null;
};

const MapCenterUpdater: React.FC<{ center: ReportLocation }> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center, map]);

  return null;
};

const ReportIncidentModal: React.FC<Props> = ({ userLocation, mapCenter, onClose, onReported }) => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('harassment');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reportLocation, setReportLocation] = useState<ReportLocation | null>(userLocation);
  const [address, setAddress] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reportLocation && userLocation) setReportLocation(userLocation);
  }, [reportLocation, userLocation]);

  useEffect(() => {
    if (!reportLocation) {
      setAddress('');
      return;
    }

    const controller = new AbortController();
    const { lat, lng } = reportLocation;
    setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    setIsResolvingAddress(true);

    const resolveAddress = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          {
            headers: { 'Accept-Language': 'en' },
            signal: controller.signal
          }
        );
        if (!response.ok) throw new Error(`Address lookup failed with status ${response.status}`);
        const data = await response.json() as { display_name?: string };
        if (data.display_name) setAddress(data.display_name.split(',').slice(0, 4).join(', '));
      } catch (requestError) {
        if (!(requestError instanceof Error && requestError.name === 'AbortError')) {
          console.error('Could not resolve report location address:', requestError);
        }
      } finally {
        if (!controller.signal.aborted) setIsResolvingAddress(false);
      }
    };

    void resolveAddress();
    return () => controller.abort();
  }, [reportLocation]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      setError('Please sign in to submit an incident report.');
      return;
    }
    if (!reportLocation) {
      setError('Choose the incident location on the map or allow location access.');
      return;
    }
    if (description.trim().length < 5) {
      setError('Add a short description (at least 5 characters).');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const coordinates: [number, number] = [reportLocation.lng, reportLocation.lat];
      const response = await SafetyService.createSafetyReport({
        coordinates,
        address: address || `${reportLocation.lat.toFixed(5)}, ${reportLocation.lng.toFixed(5)}`,
        reportType,
        description: description.trim(),
        severity,
        isAnonymous
      });

      const savedReport = response.report;
      if (!savedReport?._id) {
        throw new Error('The server did not confirm the saved report. Refresh the map before trying again.');
      }

      onReported({
        id: savedReport._id,
        reportType,
        address: address || 'Selected location',
        severity,
        createdAt: savedReport.createdAt || new Date().toISOString(),
        coordinates: savedReport.location?.coordinates ?? coordinates
      });
      setDone(true);
    } catch (submitError) {
      console.error('Error submitting incident report:', submitError);
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLocation = reportLocation ?? mapCenter;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-incident-title"
        className="w-full max-w-xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 p-5 flex items-center justify-between">
          <div>
            <h2 id="report-incident-title" className="text-xl font-bold text-white">Report an Incident</h2>
            <p className="text-pink-100 text-sm mt-0.5">Share a location-based community report</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close incident report"
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="p-10 text-center overflow-y-auto">
            <CheckCircle size={56} className="text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Report submitted</h3>
            <p className="text-gray-500 mb-6">
              Your report was saved and added to this map. Community reports may not be independently verified.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="bg-gradient-to-r from-rose-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
            <div>
              <label htmlFor="incident-type" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Incident type
              </label>
              <select
                id="incident-type"
                value={reportType}
                onChange={event => setReportType(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                {INCIDENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <fieldset>
              <legend className="block text-sm font-semibold text-gray-700 mb-1.5">Severity</legend>
              <div className="grid grid-cols-3 gap-2">
                {SEVERITY_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={severity === option.value}
                    onClick={() => setSeverity(option.value)}
                    className={`py-2 rounded-xl border-2 text-sm font-semibold transition-colors ${
                      severity === option.value ? option.selected : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="incident-description" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                id="incident-description"
                value={description}
                onChange={event => setDescription(event.target.value)}
                placeholder="Briefly describe what happened or what makes this area notable."
                rows={3}
                maxLength={500}
                required
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
              <p className="text-xs text-gray-400 text-right">{description.length}/500</p>
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-700">Incident location</div>
                  <div className="flex items-start gap-2 mt-1 text-sm text-gray-600">
                    <MapPin size={15} className="text-rose-500 mt-0.5 flex-shrink-0" />
                    <span className="break-words">
                      {!reportLocation
                        ? 'No location selected'
                        : isResolvingAddress
                          ? 'Finding address…'
                          : address}
                    </span>
                  </div>
                </div>
                {userLocation && (
                  <button
                    type="button"
                    onClick={() => setReportLocation(userLocation)}
                    className="text-xs text-purple-700 hover:text-purple-900 font-semibold whitespace-nowrap"
                  >
                    Use my location
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowLocationPicker(show => !show)}
                className="mt-3 text-sm text-rose-600 hover:text-rose-700 font-semibold"
              >
                {showLocationPicker ? 'Hide map' : 'Choose location on map'}
              </button>
              {showLocationPicker && (
                <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
                  <MapContainer
                    center={[selectedLocation.lat, selectedLocation.lng]}
                    zoom={13}
                    scrollWheelZoom
                    className="h-56 w-full"
                  >
                    <MapCenterUpdater center={selectedLocation} />
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapLocationClickHandler onSelect={setReportLocation} />
                    {reportLocation && (
                      <Marker position={[reportLocation.lat, reportLocation.lng]} icon={reportLocationIcon} />
                    )}
                  </MapContainer>
                  <p className="bg-gray-50 px-3 py-2 text-xs text-gray-500">
                    Click the map to place the report pin. Drag the map to find another location.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-gray-50 p-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isAnonymous}
                  aria-label="Submit this report anonymously"
                  onClick={() => setIsAnonymous(value => !value)}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${isAnonymous ? 'bg-rose-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isAnonymous ? 'translate-x-5' : ''}`} />
                </button>
                {isAnonymous ? <EyeOff size={16} className="text-rose-500" /> : <Eye size={16} className="text-gray-400" />}
                <span className="text-sm font-medium text-gray-700">Hide my name on the public map</span>
              </div>
              <p className="ml-14 mt-1 text-xs text-gray-500">
                Your account is still used to submit the report; anonymous reports do not show your name in the public report feed.
              </p>
            </div>

            {error && (
              <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!user && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl p-3">
                Sign in to submit an incident report.
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !user}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-500 text-white font-semibold hover:from-rose-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting…' : 'Submit report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportIncidentModal;
