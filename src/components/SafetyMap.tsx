import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup, CircleMarker,
  LayersControl, Polyline, Circle, useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin, AlertTriangle, Shield, Users, Filter, CircleDot,
  Search, X, Navigation, Building2, Cross, Flame, BadgeAlert,
  Clock, Moon
} from 'lucide-react';
import { SafetyService } from '../services/safetyService';
import ReportIncidentModal from './ReportIncidentModal';

/* ── Types ──────────────────────────────────────────────── */
interface SafetyReport {
  id: string;
  reportType: string;
  address: string;
  severity: string;
  createdAt: string;
  coordinates: [number, number]; // [lng, lat] GeoJSON
}
interface SafetyRoute {
  id: string;
  key: string;
  name: string;
  score: number;
  distanceKm: number;
  etaMin: number;
  riskNotes: string[];
  coordinates: Array<[number, number]>; // [lat, lng] Leaflet
  color: string;
}
interface GeoPoint { lat: number; lng: number; label: string; }
interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}
interface HelpPlace {
  id: number;
  lat: number;
  lng: number;
  name: string;
  category: string;
  phone?: string;
  distanceKm: number;
}
interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    amenity?: string;
    name?: string;
    phone?: string;
    'contact:phone'?: string;
  };
}

/* ── Helpers ─────────────────────────────────────────────── */
const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const formatCategory = (cat: string) =>
  ({ police: 'Police Station', hospital: 'Hospital', pharmacy: 'Pharmacy', fire_station: 'Fire Station', clinic: 'Clinic', doctors: 'Doctor' }[cat] ?? cat);
const categoryIcon = (cat: string) => {
  const map: Record<string, string> = {
    police: '🚔', hospital: '🏥', pharmacy: '💊', fire_station: '🚒', clinic: '⚕️', doctors: '👨‍⚕️'
  };
  return map[cat] ?? '📍';
};

const INDIA_CENTER: [number, number] = [20.5937, 78.9629];
const reportTypes = ['all', 'harassment', 'unsafe_area', 'well_lit', 'safe_zone', 'emergency'];
const severityLevels = ['all', 'low', 'medium', 'high', 'positive'];

/* ── Address search input ────────────────────────────────── */
const AddressSearch: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (q: string) => void;
  suggestions: NominatimResult[];
  onSelect: (r: NominatimResult) => void;
  onClear: () => void;
  loading: boolean;
  icon: React.ReactNode;
}> = ({ label, placeholder, value, onChange, suggestions, onSelect, onClear, loading, icon }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">{label}</label>
      <div className="relative flex items-center">
        <span className="absolute left-3 text-gray-400">{icon}</span>
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="w-full rounded-xl border border-rose-100 bg-white pl-9 pr-8 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
        {loading && <div className="absolute right-8 w-3 h-3 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />}
        {value && <button onClick={onClear} className="absolute right-2 text-gray-400 hover:text-gray-600"><X size={14} /></button>}
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-[9999] w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-1 max-h-52 overflow-y-auto">
          {suggestions.map(r => (
            <li
              key={r.place_id}
              onClick={() => { onSelect(r); setOpen(false); }}
              className="px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 cursor-pointer border-b border-gray-50 last:border-0"
            >
              <div className="font-medium truncate">{r.display_name.split(',')[0]}</div>
              <div className="text-xs text-gray-400 truncate">{r.display_name.split(',').slice(1, 3).join(',')}</div>
            </li>
          ))}
        </ul>
      )}
      {open && !loading && value.trim().length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-[9999] w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-1 px-4 py-3 text-sm text-gray-500">
          No places found. Try a landmark, street, or full address.
        </div>
      )}
    </div>
  );
};

/* ── Map click handler ───────────────────────────────────── */
const MapClickHandler: React.FC<{
  mode: 'none' | 'set-start' | 'set-dest';
  onMapClick: (lat: number, lng: number) => void;
}> = ({ mode, onMapClick }) => {
  useMapEvents({
    click(e) {
      if (mode !== 'none') onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

/* ── Main component ──────────────────────────────────────── */
const SafetyMap: React.FC = () => {
  const [recentReports, setRecentReports] = useState<SafetyReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportLoadError, setReportLoadError] = useState('');
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [roadRoutes, setRoadRoutes] = useState<Record<string, Array<[number, number]>>>({});
  const [nearbyRadiusKm, setNearbyRadiusKm] = useState(3);
  const [filters, setFilters] = useState({ type: 'all', severity: 'all', days: 30 });
  const [selectedRouteId, setSelectedRouteId] = useState<string>('safe');

  // Address search state
  const [destQuery, setDestQuery] = useState('');
  const [destSuggestions, setDestSuggestions] = useState<NominatimResult[]>([]);
  const [destLoading, setDestLoading] = useState(false);
  const [destination, setDestination] = useState<GeoPoint | null>(null);

  const [startQuery, setStartQuery] = useState('');
  const [startSuggestions, setStartSuggestions] = useState<NominatimResult[]>([]);
  const [startLoading, setStartLoading] = useState(false);
  const [customStart, setCustomStart] = useState<GeoPoint | null>(null);

  // Nearby help
  const [nearbyHelp, setNearbyHelp] = useState<HelpPlace[]>([]);
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpError, setHelpError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // Map click mode
  const [clickMode, setClickMode] = useState<'none' | 'set-start' | 'set-dest'>('none');

  // Report incident modal
  const [showReportModal, setShowReportModal] = useState(false);

  // Debounce timers
  const destTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Current starting point */
  const currentPoint = useMemo(
    () => customStart ?? userLocation ?? { lat: INDIA_CENTER[0], lng: INDIA_CENTER[1], label: 'India' },
    [customStart, userLocation]
  );

  /* Time-of-day penalty */
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 21;
  const nightPenalty = isNight ? 15 : 0;

  /* Search nearby first, then fall back to broader results. */
  const searchAddress = useCallback(async (
    q: string,
    setResults: (r: NominatimResult[]) => void,
    setLoad: (b: boolean) => void,
    timer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
  ) => {
    if (timer.current) clearTimeout(timer.current);
    if (!q || q.length < 2) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setLoad(true);
      try {
        const bias = customStart ?? userLocation;
        const fetchResults = async (localOnly: boolean) => {
          const params = new URLSearchParams({
            q, format: 'json', limit: '10', addressdetails: '1'
          });
          if (bias && localOnly) {
            const radiusDegrees = 0.5;
            params.set(
              'viewbox',
              `${bias.lng - radiusDegrees},${bias.lat + radiusDegrees},${bias.lng + radiusDegrees},${bias.lat - radiusDegrees}`
            );
            params.set('bounded', '1');
          }
          const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
            headers: { 'Accept-Language': 'en' }
          });
          if (!response.ok) throw new Error(`Address search failed with status ${response.status}`);
          return await response.json() as NominatimResult[];
        };

        let results = await fetchResults(Boolean(bias));
        if (bias && results.length === 0) results = await fetchResults(false);
        setResults(results);
      } catch (error) {
        console.error('Address search failed:', error);
        setResults([]);
      }
      finally { setLoad(false); }
    }, 800);
  }, [userLocation, customStart]);

  /* Reverse geocode for map clicks */
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      return data.display_name?.split(',').slice(0, 3).join(', ') ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  /* Handle map click */
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    const label = await reverseGeocode(lat, lng);
    if (clickMode === 'set-dest') {
      setDestination({ lat, lng, label });
      setDestQuery(label);
      setDestSuggestions([]);
    } else if (clickMode === 'set-start') {
      setCustomStart({ lat, lng, label });
      setStartQuery(label);
      setStartSuggestions([]);
    }
    setClickMode('none');
  }, [clickMode]);

  /* Overpass API — find real nearby help */
  const findNearbyHelp = async () => {
    const center = customStart ?? userLocation;
    setShowHelp(true);
    setHelpError('');
    if (!center) {
      setNearbyHelp([]);
      setHelpError('Allow location access or set a starting point to search nearby services.');
      return;
    }

    setHelpLoading(true);
    const radiusM = nearbyRadiusKm * 1000;
    const query = `
      [out:json][timeout:20];
      (
        nwr["amenity"="police"](around:${radiusM},${center.lat},${center.lng});
        nwr["amenity"="hospital"](around:${radiusM},${center.lat},${center.lng});
        nwr["amenity"="pharmacy"](around:${radiusM},${center.lat},${center.lng});
        nwr["amenity"="fire_station"](around:${radiusM},${center.lat},${center.lng});
        nwr["amenity"="clinic"](around:${radiusM},${center.lat},${center.lng});
        nwr["amenity"="doctors"](around:${radiusM},${center.lat},${center.lng});
      );
      out center tags;
    `;
    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: `data=${encodeURIComponent(query)}`
      });
      if (!res.ok) throw new Error(`Nearby services request failed with status ${res.status}`);

      const data = await res.json() as { elements?: OverpassElement[] };
      const places = (data.elements ?? [])
        .map((el): HelpPlace | null => {
          const lat = el.lat ?? el.center?.lat;
          const lng = el.lon ?? el.center?.lon;
          const category = el.tags?.amenity;
          if (lat === undefined || lng === undefined || !category) return null;

          return {
            id: el.id,
            lat,
            lng,
            name: el.tags?.name ?? formatCategory(category),
            category,
            phone: el.tags?.phone ?? el.tags?.['contact:phone'],
            distanceKm: getDistanceKm(center.lat, center.lng, lat, lng)
          };
        })
        .filter((place): place is HelpPlace => place !== null)
        .sort((a: HelpPlace, b: HelpPlace) => a.distanceKm - b.distanceKm)
        .slice(0, 20);
      setNearbyHelp(places);
    } catch (error) {
      console.error('Nearby services search failed:', error);
      setNearbyHelp([]);
      setHelpError('Could not load nearby services. Please try again later.');
    } finally { setHelpLoading(false); }
  };

  /* Routes */
  const routes: SafetyRoute[] = useMemo(() => {
    if (!destination || (!userLocation && !customStart)) return [];
    const start = currentPoint;
    const dest = destination;
    const directDistance = getDistanceKm(start.lat, start.lng, dest.lat, dest.lng);
    const nearbyHigh = recentReports.filter(r =>
      getDistanceKm(start.lat, start.lng, r.coordinates[1], r.coordinates[0]) <= nearbyRadiusKm && r.severity === 'high'
    ).length;
    const nearbyMedium = recentReports.filter(r =>
      getDistanceKm(start.lat, start.lng, r.coordinates[1], r.coordinates[0]) <= nearbyRadiusKm && r.severity === 'medium'
    ).length;
    const penalty = nearbyHigh * 10 + nearbyMedium * 5 + nightPenalty;
    const midLat = (start.lat + dest.lat) / 2;
    const midLng = (start.lng + dest.lng) / 2;
    const destName = destination.label.split(',')[0];

    const make = (
      id: string, namePrefix: string, scoreBase: number,
      distMult: number, etaMult: number, riskNotes: string[],
      waypoints: Array<[number, number]>, color: string
    ): SafetyRoute => ({
      id,
      key: `${start.lat.toFixed(5)}-${start.lng.toFixed(5)}-${dest.lat.toFixed(5)}-${dest.lng.toFixed(5)}-${id}`,
      name: `${namePrefix} to ${destName}`,
      score: clamp(Math.round(scoreBase - penalty), 10, 98),
      distanceKm: Number((directDistance * distMult).toFixed(1)),
      etaMin: Math.max(5, Math.round(directDistance * etaMult)),
      riskNotes: isNight ? ['⚠️ Night travel — extra caution', ...riskNotes] : riskNotes,
      coordinates: [[start.lat, start.lng], ...waypoints, [dest.lat, dest.lng]],
      color,
    });

    return [
      make('safe', 'Route option A', 92, 1.12, 3.7,
        ['Experimental option; road-level safety is not verified'],
        [[midLat + 0.013, midLng - 0.008], [midLat + 0.018, midLng + 0.006]], '#16a34a'),
      make('balanced', 'Route option B', 76, 1.02, 3.1,
        ['Alternative route estimate; conditions are not verified'],
        [[midLat + 0.004, midLng + 0.003]], '#f59e0b'),
      make('risky', 'Route option C', 58, 0.93, 2.7,
        ['Approximate distance and time; not verified for safety'],
        [[midLat - 0.01, midLng - 0.01], [dest.lat - 0.004, dest.lng + 0.006]], '#dc2626'),
    ];
  }, [currentPoint, customStart, destination, nearbyRadiusKm, recentReports, isNight, nightPenalty, userLocation]);

  const selectedRoute = useMemo(
    () => routes.find(route => route.id === selectedRouteId) ?? routes[0],
    [routes, selectedRouteId]
  );

  /* Load OSRM road geometry — cached per route key */
  useEffect(() => {
    if (!selectedRoute || roadRoutes[selectedRoute.key]) {
      setIsRouteLoading(false);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      setIsRouteLoading(true);
      const waypoints = selectedRoute.coordinates.map(([lat, lng]) => [lng, lat]);
      try {
        const coords = waypoints.map(p => `${p[0]},${p[1]}`).join(';');
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`Route request failed with status ${res.status}`);
        const data = await res.json();
        if (data?.routes?.[0]?.geometry?.coordinates) {
          const path = data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
          setRoadRoutes(prev => ({ ...prev, [selectedRoute.key]: path }));
        } else {
          throw new Error('No road route was returned');
        }
      } catch (error) {
        if (!(error instanceof Error && error.name === 'AbortError')) {
          console.error('Could not load road route geometry:', error);
        }
      } finally {
        if (!controller.signal.aborted) setIsRouteLoading(false);
      }
    };
    void run();

    return () => controller.abort();
  }, [selectedRoute, roadRoutes]);

  const loadSafetyReports = useCallback(async (lat: number, lng: number) => {
    try {
      setIsLoading(true);
      setReportLoadError('');
      const response = await SafetyService.getSafetyReports(lat, lng, nearbyRadiusKm * 1000);
      if (response.reports?.length > 0) {
        setRecentReports(response.reports.map((r: any) => ({
          id: r._id, reportType: r.reportType, address: r.address,
          severity: r.severity, createdAt: r.createdAt,
          coordinates: r.location?.coordinates ?? [lng, lat]
        })));
      } else {
        setRecentReports([]);
      }
    } catch (error) {
      console.error('Could not load community safety reports:', error);
      setRecentReports([]);
      setReportLoadError('Unable to load reports for this location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [nearbyRadiusKm]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      position => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
      error => console.warn('Current location is unavailable; choose a start point manually.', error)
    );
  }, []);

  useEffect(() => {
    const start = customStart ?? userLocation;
    if (start) {
      void loadSafetyReports(start.lat, start.lng);
    } else {
      setRecentReports([]);
      setReportLoadError('Allow location access or set a starting point to load nearby reports.');
    }
  }, [customStart, userLocation, loadSafetyReports]);

  const handleNewReport = (report: SafetyReport) => {
    setReportLoadError('');
    setRecentReports(prev => [report, ...prev]);
  };

  const filteredReports = useMemo(() => {
    const cutoff = Date.now() - filters.days * 86400 * 1000;
    return recentReports.filter(r => {
      const matchType = filters.type === 'all' || r.reportType === filters.type;
      const matchSev = filters.severity === 'all' || r.severity === filters.severity;
      const ts = new Date(r.createdAt).getTime();
      return matchType && matchSev && (Number.isNaN(ts) || ts >= cutoff);
    });
  }, [recentReports, filters]);

  const nearbyReports = useMemo(
    () => filteredReports.filter(r =>
      getDistanceKm(currentPoint.lat, currentPoint.lng, r.coordinates[1], r.coordinates[0]) <= nearbyRadiusKm
    ),
    [filteredReports, currentPoint, nearbyRadiusKm]
  );

  /* Marker icons */
  const defaultIcon = useMemo(() => new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41]
  }), []);

  const makeColoredIcon = (color: string) => L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${color};border:2px solid white;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
    iconSize: [28, 28], iconAnchor: [14, 28]
  });

  const hasStartingPoint = Boolean(userLocation || customStart);
  const mapCenter: [number, number] = destination && hasStartingPoint
    ? [(currentPoint.lat + destination.lat) / 2, (currentPoint.lng + destination.lng) / 2]
    : destination ? [destination.lat, destination.lng]
    : [currentPoint.lat, currentPoint.lng];

  const severityBar = (s: string) =>
    s === 'high' ? 'border-red-500' : s === 'medium' ? 'border-amber-400' : 'border-emerald-500';
  const severityBadge = (s: string) =>
    s === 'high' ? 'bg-red-100 text-red-700' : s === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';

  return (
    <>
      {showReportModal && (
        <ReportIncidentModal
          userLocation={userLocation}
          mapCenter={currentPoint}
          onClose={() => setShowReportModal(false)}
          onReported={handleNewReport}
        />
      )}

      <section id="safety-map" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Community Safety Map</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose a starting point and destination to view route options alongside community reports. Scores and travel times are experimental estimates, not verified safety or navigation advice.
            </p>
            {isNight && (
              <div className="inline-flex items-center space-x-2 mt-4 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full px-4 py-2 text-sm font-medium">
                <Moon size={14} />
                <span>Night mode active — route scores adjusted for after-hours travel</span>
              </div>
            )}
          </div>

          {/* Address inputs */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
            <div>
              <AddressSearch
                label="Starting from"
                placeholder={userLocation ? 'Your live location (click to change)' : 'Type an address or click map…'}
                value={startQuery}
                onChange={q => { setStartQuery(q); searchAddress(q, setStartSuggestions, setStartLoading, startTimer); }}
                suggestions={startSuggestions}
                onSelect={r => {
                  setCustomStart({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), label: r.display_name });
                  setStartQuery(r.display_name.split(',').slice(0, 2).join(','));
                  setStartSuggestions([]);
                }}
                onClear={() => { setStartQuery(''); setStartSuggestions([]); setCustomStart(null); }}
                loading={startLoading}
                icon={<Navigation size={14} />}
              />
              {customStart && userLocation && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomStart(null);
                    setStartQuery('');
                    setStartSuggestions([]);
                  }}
                  className="mt-1 text-xs text-purple-700 hover:text-purple-900 underline"
                >
                  Use my current location
                </button>
              )}
            </div>
            <AddressSearch
              label="Destination"
              placeholder="Search anywhere — Mumbai, Rajwada, MG Road…"
              value={destQuery}
              onChange={q => { setDestQuery(q); searchAddress(q, setDestSuggestions, setDestLoading, destTimer); }}
              suggestions={destSuggestions}
              onSelect={r => {
                setDestination({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), label: r.display_name });
                setDestQuery(r.display_name.split(',').slice(0, 2).join(','));
                setDestSuggestions([]);
                setSelectedRouteId('safe');
              }}
              onClear={() => { setDestQuery(''); setDestSuggestions([]); setDestination(null); }}
              loading={destLoading}
              icon={<MapPin size={14} />}
            />
            <div className="rounded-xl bg-white p-3 border border-rose-100 flex flex-col justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Click map to set</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setClickMode(m => m === 'set-start' ? 'none' : 'set-start')}
                  className={`flex-1 text-xs py-1.5 px-2 rounded-lg font-medium transition-all ${clickMode === 'set-start' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  📍 Start
                </button>
                <button
                  onClick={() => setClickMode(m => m === 'set-dest' ? 'none' : 'set-dest')}
                  className={`flex-1 text-xs py-1.5 px-2 rounded-lg font-medium transition-all ${clickMode === 'set-dest' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  🎯 Dest
                </button>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Radius</label>
                  <select
                    value={nearbyRadiusKm}
                    onChange={e => setNearbyRadiusKm(Number(e.target.value))}
                    className="rounded-lg border border-rose-100 bg-white px-2 py-1 text-xs text-gray-800"
                  >
                    {[2, 3, 5, 8].map(v => <option key={v} value={v}>{v}km</option>)}
                  </select>
                </div>
              </div>
              {clickMode !== 'none' && (
                <div className="mt-2 text-xs text-center text-rose-600 font-medium animate-pulse">
                  Click anywhere on the map to set {clickMode === 'set-start' ? 'start' : 'destination'}
                </div>
              )}
            </div>
          </div>

          {/* Route cards */}
          {destination && hasStartingPoint ? (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {routes.map(route => (
                <button
                  key={route.key}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`text-left rounded-2xl p-5 border-2 transition-all ${
                    selectedRouteId === route.id
                      ? 'border-rose-500 bg-white shadow-lg'
                      : 'border-gray-100 bg-white/80 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: route.color }} />
                      <span className="font-semibold text-gray-800 text-sm">{route.name}</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Demo score</span>
                      <span className="font-bold" style={{ color: route.color }}>{route.score}/100</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${route.score}%`, backgroundColor: route.color }} />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                    <span className="font-semibold">{route.distanceKm} km</span>
                    <span>•</span><span>{route.etaMin} min</span>
                  </div>
                  <div className="space-y-1">
                    {route.riskNotes.map(note => (
                      <div key={note} className="flex items-start space-x-1.5 text-xs text-gray-500">
                        <CircleDot size={10} className="mt-0.5 flex-shrink-0" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="mb-8 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/40 p-8 text-center">
              <Search size={32} className="text-rose-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                {destination ? 'Set a starting point to view route options' : 'Search a destination above to view route options'}
              </p>
              <p className="text-sm text-gray-400 mt-1">Search results depend on OpenStreetMap coverage</p>
            </div>
          )}

          {/* Map + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map */}
            <div className="lg:col-span-2">
              <div className="relative bg-gray-100 rounded-2xl overflow-hidden" style={{ height: '520px' }}>
                {clickMode !== 'none' && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[999] bg-rose-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg pointer-events-none">
                    Click on the map to set {clickMode === 'set-start' ? 'starting point' : 'destination'}
                  </div>
                )}
                {isRouteLoading && (
                  <div className="absolute top-3 right-16 z-[999] bg-white rounded-full px-3 py-1.5 shadow-md flex items-center space-x-2 text-xs text-gray-600">
                    <div className="w-3 h-3 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
                    <span>Loading road route…</span>
                  </div>
                )}
                <MapContainer
                  center={mapCenter}
                  zoom={hasStartingPoint || destination ? 13 : 5}
                  scrollWheelZoom
                  className="h-full w-full"
                  key={`${mapCenter[0]}-${mapCenter[1]}`}
                >
                  <MapClickHandler mode={clickMode} onMapClick={handleMapClick} />
                  <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Standard">
                      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Dark">
                      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    </LayersControl.BaseLayer>

                    <LayersControl.Overlay checked name="Report Pins">
                      <>
                        {filteredReports.map(r => (
                          <Marker key={r.id} position={[r.coordinates[1], r.coordinates[0]]} icon={defaultIcon}>
                            <Popup>
                              <div className="text-sm">
                                <div className="font-bold capitalize">{r.reportType.replace(/_/g, ' ')}</div>
                                <div className="text-gray-600">{r.address}</div>
                                <div className="text-xs text-gray-400 mt-1">Severity: {r.severity}</div>
                                <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</div>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </>
                    </LayersControl.Overlay>

                    {selectedRoute && destination && (
                      <LayersControl.Overlay checked name="Suggested Route">
                        <Polyline
                          positions={roadRoutes[selectedRoute.key] ?? selectedRoute.coordinates}
                          pathOptions={{ color: selectedRoute.color, weight: 6, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
                        />
                      </LayersControl.Overlay>
                    )}

                    <LayersControl.Overlay name="Heatmap">
                      <>
                        {filteredReports.map(r => (
                          <CircleMarker
                            key={`${r.id}-heat`}
                            center={[r.coordinates[1], r.coordinates[0]]}
                            radius={16}
                            pathOptions={{
                              color: 'transparent',
                              fillColor: r.severity === 'high' ? '#ef4444' : r.severity === 'medium' ? '#f59e0b' : '#10b981',
                              fillOpacity: 0.25
                            }}
                          />
                        ))}
                      </>
                    </LayersControl.Overlay>

                    {userLocation && (
                      <LayersControl.Overlay checked name="Your Location">
                        <Marker position={[userLocation.lat, userLocation.lng]} icon={makeColoredIcon('#3b82f6')}>
                          <Popup><strong>You are here</strong></Popup>
                        </Marker>
                      </LayersControl.Overlay>
                    )}

                    {(userLocation || customStart) && (
                      <LayersControl.Overlay checked name="Search Radius">
                        <Circle
                          center={[currentPoint.lat, currentPoint.lng]}
                          radius={nearbyRadiusKm * 1000}
                          pathOptions={{ color: '#db2777', fillColor: '#f472b6', fillOpacity: 0.07, weight: 1.5, dashArray: '6 4' }}
                        />
                      </LayersControl.Overlay>
                    )}

                    {customStart && (
                      <LayersControl.Overlay checked name="Custom Start">
                        <Marker position={[customStart.lat, customStart.lng]} icon={makeColoredIcon('#8b5cf6')}>
                          <Popup><strong>Start:</strong> {customStart.label}</Popup>
                        </Marker>
                      </LayersControl.Overlay>
                    )}

                    {destination && (
                      <LayersControl.Overlay checked name="Destination">
                        <Marker position={[destination.lat, destination.lng]} icon={makeColoredIcon('#dc2626')}>
                          <Popup><strong>Destination:</strong> {destination.label}</Popup>
                        </Marker>
                      </LayersControl.Overlay>
                    )}

                    {nearbyHelp.length > 0 && (
                      <LayersControl.Overlay checked name="Nearby Help">
                        <>
                          {nearbyHelp.map(p => (
                            <Marker key={p.id} position={[p.lat, p.lng]} icon={makeColoredIcon(
                              p.category === 'police' ? '#3b82f6' :
                              p.category === 'hospital' ? '#ef4444' :
                              p.category === 'pharmacy' ? '#10b981' : '#f59e0b'
                            )}>
                              <Popup>
                                <div className="text-sm">
                                  <div className="font-bold">{categoryIcon(p.category)} {p.name}</div>
                                  <div className="text-gray-500 capitalize">{formatCategory(p.category)}</div>
                                  <div className="text-gray-500">{p.distanceKm.toFixed(1)} km away</div>
                                  {p.phone && <div className="text-blue-600">{p.phone}</div>}
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                        </>
                      </LayersControl.Overlay>
                    )}
                  </LayersControl>
                </MapContainer>
              </div>

              {/* Map controls */}
              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={() => { if (destination && hasStartingPoint) setSelectedRouteId('safe'); }}
                  disabled={!destination || !hasStartingPoint}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Shield size={15} /><span>View Route Options</span>
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors text-sm"
                >
                  <AlertTriangle size={15} /><span>Report Incident</span>
                </button>
                <button
                  onClick={findNearbyHelp}
                  disabled={helpLoading}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 text-sm"
                >
                  <Users size={15} />
                  <span>{helpLoading ? 'Searching…' : 'Find Nearby Help'}</span>
                </button>
                <button
                  onClick={() => loadSafetyReports(currentPoint.lat, currentPoint.lng)}
                  disabled={(!userLocation && !customStart) || isLoading}
                  className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <Navigation size={15} /><span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Route stats */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Route Estimates</h3>
                {selectedRoute && destination ? (
                  <div className="mb-4 rounded-xl bg-white p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800 text-sm">{selectedRoute.name}</span>
                      <span className="text-sm text-gray-500">{selectedRoute.score}/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${selectedRoute.score}%`, backgroundColor: selectedRoute.color }} />
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      Experimental estimate; road-level safety is not verified.
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-white p-4 border border-gray-100 text-center text-gray-400 text-sm">
                    Set a destination to see route scores
                  </div>
                )}

                {/* Filters */}
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                  <Filter size={14} /><span>Filters</span>
                </div>
                <div className="space-y-2 mb-4">
                  {[
                    { label: 'Type', key: 'type', options: reportTypes },
                    { label: 'Severity', key: 'severity', options: severityLevels },
                    { label: 'Last days', key: 'days', options: [7, 14, 30, 90] as any[] },
                  ].map(({ label, key, options }) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      <select
                        value={(filters as any)[key]}
                        onChange={e => setFilters(p => ({ ...p, [key]: key === 'days' ? Number(e.target.value) : e.target.value }))}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      >
                        {options.map(o => (
                          <option key={o} value={o}>
                            {key === 'days' ? `${o} days` : o === 'all' ? 'All' : String(o).replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Reports near start', value: nearbyReports.length, color: 'text-green-600' },
                    { label: 'Destination', value: destination ? destination.label.split(',')[0] : '—', color: 'text-blue-600' },
                    { label: 'Total reports', value: filteredReports.length, color: 'text-purple-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">{label}</span>
                      <span className={`font-semibold text-sm ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nearby Help results */}
              {showHelp && (
                <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800">Nearby Help</h3>
                    <button onClick={() => { setShowHelp(false); setNearbyHelp([]); }} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                  </div>
                  {helpLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto" />
                      <p className="text-gray-500 text-sm mt-2">Searching via OpenStreetMap…</p>
                    </div>
                  ) : helpError ? (
                    <p className="text-red-700 text-sm text-center py-3">{helpError}</p>
                  ) : nearbyHelp.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-3">No nearby help places found within {nearbyRadiusKm} km</p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {nearbyHelp.map(p => (
                        <div key={p.id} className="bg-white rounded-xl p-3 border border-blue-100 flex items-start space-x-3">
                          <span className="text-xl">{categoryIcon(p.category)}</span>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-800 text-sm truncate">{p.name}</div>
                            <div className="text-xs text-gray-500">{formatCategory(p.category)} • {p.distanceKm.toFixed(1)} km</div>
                            {p.phone && <a href={`tel:${p.phone}`} className="text-xs text-blue-600">{p.phone}</a>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!helpError && (
                    <p className="text-xs text-gray-500 mt-3">
                      Police, hospitals, clinics, pharmacies, and fire stations from OpenStreetMap. Listings may be incomplete; verify details before relying on them.
                    </p>
                  )}
                </div>
              )}

              {/* Reports list */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Reports Near Start</h3>
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
                    <p className="text-gray-500 mt-2 text-sm">Loading reports…</p>
                  </div>
                ) : reportLoadError ? (
                  <p role="alert" className="text-center text-red-600 text-sm py-4">{reportLoadError}</p>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {nearbyReports.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-4">No reports match these filters near this start point.</p>
                    ) : (
                      nearbyReports.map(r => (
                        <div key={r.id} className={`border-l-4 pl-4 py-2 ${severityBar(r.severity)}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${severityBadge(r.severity)}`}>
                              {r.reportType.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{r.address}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SafetyMap;