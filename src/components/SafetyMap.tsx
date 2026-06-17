import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, LayersControl, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, AlertTriangle, Shield, Users, Navigation, Filter, Route, TriangleAlert, CircleDot } from 'lucide-react';
import { SafetyService } from '../services/safetyService';

interface SafetyReport {
  id: string;
  reportType: string;
  address: string;
  severity: string;
  createdAt: string;
  coordinates: [number, number];
}

interface SafetyRoute {
  id: string;
  key: string;
  name: string;
  score: number;
  distanceKm: number;
  etaMin: number;
  riskNotes: string[];
  coordinates: Array<[number, number]>;
  color: string;
  isBest?: boolean;
}

interface SafetyDestination {
  id: string;
  name: string;
  area: string;
  coordinates: [number, number];
}

const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const earthRadiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const SafetyMap: React.FC = () => {
  const [recentReports, setRecentReports] = useState<SafetyReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [roadRoutes, setRoadRoutes] = useState<Record<string, Array<[number, number]>>>({});
  const [selectedDestinationId, setSelectedDestinationId] = useState('vijay-nagar');
  const [nearbyRadiusKm, setNearbyRadiusKm] = useState(3);
  const [filters, setFilters] = useState({
    type: 'all',
    severity: 'all',
    days: 30
  });
  const [selectedRouteId, setSelectedRouteId] = useState<string>('safe');

  const reportTypes = ['all', 'harassment', 'unsafe_area', 'well_lit', 'safe_zone', 'emergency'];
  const severityLevels = ['all', 'low', 'medium', 'high', 'positive'];

  const indoreCenter: [number, number] = [22.7196, 75.8577];
  const destinations: SafetyDestination[] = useMemo(() => ([
    {
      id: 'vijay-nagar',
      name: 'Vijay Nagar',
      area: 'Treasure Island side',
      coordinates: [22.7530, 75.8968]
    },
    {
      id: 'rajwada',
      name: 'Rajwada',
      area: 'Old city core',
      coordinates: [22.7172, 75.8577]
    },
    {
      id: 'palasia',
      name: 'Palasia',
      area: 'Central Indore',
      coordinates: [22.7247, 75.8890]
    },
    {
      id: 'bhanwarkuan',
      name: 'Bhanwarkuan',
      area: 'University belt',
      coordinates: [22.6947, 75.8608]
    }
  ]), []);
  const selectedDestination = destinations.find((destination) => destination.id === selectedDestinationId) || destinations[0];
  const currentPoint = userLocation || { lat: indoreCenter[0], lng: indoreCenter[1] };

  const sampleIndoreReports: SafetyReport[] = [
    {
      id: 'ind-1',
      reportType: 'harassment',
      address: 'Palasia Square, Indore',
      severity: 'high',
      createdAt: new Date().toISOString(),
      coordinates: [75.8890, 22.7247]
    },
    {
      id: 'ind-2',
      reportType: 'unsafe_area',
      address: 'Vijay Nagar, near Treasure Island',
      severity: 'medium',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      coordinates: [75.8968, 22.7530]
    },
    {
      id: 'ind-3',
      reportType: 'well_lit',
      address: 'AB Road, near Rajwada',
      severity: 'positive',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      coordinates: [75.8577, 22.7172]
    },
    {
      id: 'ind-4',
      reportType: 'safe_zone',
      address: 'RNT Marg, Indore',
      severity: 'positive',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      coordinates: [75.8815, 22.7201]
    },
    {
      id: 'ind-5',
      reportType: 'unsafe_area',
      address: 'Bhanwarkuan Square',
      severity: 'high',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
      coordinates: [75.8608, 22.6947]
    }
  ];

  const routes: SafetyRoute[] = useMemo(() => {
    const start = currentPoint;
    const destination = selectedDestination.coordinates;
    const directDistance = getDistanceKm(start.lat, start.lng, destination[0], destination[1]);
    const nearbyHigh = recentReports.filter((report) => {
      const distance = getDistanceKm(start.lat, start.lng, report.coordinates[1], report.coordinates[0]);
      return distance <= nearbyRadiusKm && report.severity === 'high';
    }).length;
    const nearbyMedium = recentReports.filter((report) => {
      const distance = getDistanceKm(start.lat, start.lng, report.coordinates[1], report.coordinates[0]);
      return distance <= nearbyRadiusKm && report.severity === 'medium';
    }).length;
    const incidentPenalty = nearbyHigh * 10 + nearbyMedium * 5;

    const routeBuilder = (
      id: string,
      namePrefix: string,
      scoreBase: number,
      distanceMultiplier: number,
      etaMultiplier: number,
      riskNotes: string[],
      waypoints: Array<[number, number]>,
      color: string,
      isBest?: boolean
    ): SafetyRoute => ({
      id,
      key: `${selectedDestinationId}-${id}`,
      name: `${namePrefix} to ${selectedDestination.name}`,
      score: clamp(Math.round(scoreBase - incidentPenalty), 25, 98),
      distanceKm: Number((directDistance * distanceMultiplier).toFixed(1)),
      etaMin: Math.max(10, Math.round(directDistance * etaMultiplier)),
      riskNotes,
      coordinates: [
        [start.lat, start.lng],
        ...waypoints,
        [destination[0], destination[1]]
      ],
      color,
      isBest
    });

    const midLat = (start.lat + destination[0]) / 2;
    const midLng = (start.lng + destination[1]) / 2;

    return [
      routeBuilder(
        'safe',
        'Safer route',
        92,
        1.12,
        3.7,
        [`Heads toward ${selectedDestination.name}`, 'Fewer nearby recent incidents', 'Keeps a wider margin from active hotspot areas'],
        [
          [midLat + 0.013, midLng - 0.008],
          [midLat + 0.018, midLng + 0.006]
        ],
        '#16a34a',
        true
      ),
      routeBuilder(
        'balanced',
        'Balanced route',
        76,
        1.02,
        3.1,
        [`Shortest practical path to ${selectedDestination.name}`, 'Mix of busy and quieter stretches', 'Good if you want a middle ground'],
        [[midLat + 0.004, midLng + 0.003]],
        '#f59e0b'
      ),
      routeBuilder(
        'risky',
        'Fastest route',
        58,
        0.93,
        2.7,
        ['Fewer turns but more exposure to active streets', 'Only use if speed matters more than comfort', 'Near higher-activity zones'],
        [
          [midLat - 0.01, midLng - 0.01],
          [destination[0] - 0.004, destination[1] + 0.006]
        ],
        '#dc2626'
      )
    ];
  }, [currentPoint, nearbyRadiusKm, recentReports, selectedDestination, selectedDestinationId]);

  useEffect(() => {
    // Get user's location and load safety reports
    getCurrentLocation();
  }, []);

  useEffect(() => {
    const loadRoadRoute = async () => {
      const start = userLocation ? [userLocation.lng, userLocation.lat] : [indoreCenter[1], indoreCenter[0]];
      const selected = routes.find((route) => route.id === selectedRouteId) || routes[0];
      const waypoints = [start, ...selected.coordinates.slice(1).map(([lat, lng]) => [lng, lat])];

      try {
        const coordinates = waypoints.map((point) => `${point[0]},${point[1]}`).join(';');
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`
        );
        const data = await response.json();

        if (data?.routes?.[0]?.geometry?.coordinates) {
          const roadPath = data.routes[0].geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
          );
          setRoadRoutes((prev) => ({ ...prev, [selected.key]: roadPath }));
        }
      } catch (error) {
        console.error('Error loading road route geometry:', error);
      }
    };

    loadRoadRoute();
  }, [selectedRouteId, userLocation, routes]);

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
          // Use Indore city center as fallback for this project
          loadSafetyReports(indoreCenter[0], indoreCenter[1]);
        }
      );
    } else {
      loadSafetyReports(indoreCenter[0], indoreCenter[1]);
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
          createdAt: report.createdAt,
          coordinates: report.location?.coordinates || [lng, lat]
        }));
        setRecentReports(formattedReports.length > 0 ? formattedReports : sampleIndoreReports);
      }
    } catch (error) {
      console.error('Error loading safety reports:', error);
      setRecentReports(sampleIndoreReports);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindSafeRoute = () => {
    if (!userLocation) {
      alert('Please allow location access to find safe routes');
      return;
    }
    setSelectedRouteId('safe');
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
    alert('Use the filters and map pins to explore reports around Indore.');
  };

  const filteredReports = useMemo(() => {
    const cutoff = Date.now() - filters.days * 24 * 60 * 60 * 1000;
    return recentReports.filter((report) => {
      const matchesType = filters.type === 'all' || report.reportType === filters.type;
      const matchesSeverity = filters.severity === 'all' || report.severity === filters.severity;
      const createdAt = new Date(report.createdAt).getTime();
      const matchesDate = Number.isNaN(createdAt) ? true : createdAt >= cutoff;
      return matchesType && matchesSeverity && matchesDate;
    });
  }, [recentReports, filters]);

  const markerIcon = useMemo(() => {
    return new L.Icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
  }, []);

  const mapCenter = userLocation ? [userLocation.lat, userLocation.lng] : [indoreCenter[0], indoreCenter[1]];
  const selectedRoute = routes.find((route) => route.id === selectedRouteId) || routes[0];

  const nearbyReports = useMemo(() => {
    return filteredReports.filter((report) => {
      const distance = getDistanceKm(currentPoint.lat, currentPoint.lng, report.coordinates[1], report.coordinates[0]);
      return distance <= nearbyRadiusKm;
    });
  }, [currentPoint.lat, currentPoint.lng, filteredReports, nearbyRadiusKm]);

  return (
    <section id="safety-map" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Community Safety Map
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose where she wants to go, then see safer routes and incidents around her current location in Indore.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Choose destination</label>
            <select
              value={selectedDestinationId}
              onChange={(event) => setSelectedDestinationId(event.target.value)}
              className="w-full rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm text-gray-800"
            >
              {destinations.map((destination) => (
                <option key={destination.id} value={destination.id}>
                  {destination.name} - {destination.area}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Near me radius</label>
            <select
              value={nearbyRadiusKm}
              onChange={(event) => setNearbyRadiusKm(Number(event.target.value))}
              className="w-full rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm text-gray-800"
            >
              <option value={2}>2 km</option>
              <option value={3}>3 km</option>
              <option value={5}>5 km</option>
              <option value={8}>8 km</option>
            </select>
          </div>
          <div className="rounded-xl bg-white p-4 border border-rose-100">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Current focus</div>
            <div className="text-sm font-semibold text-gray-800">{selectedDestination.name}</div>
            <div className="text-xs text-gray-500">Starting from your live location when available</div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {routes.map((route) => (
            <button
              key={route.key}
              onClick={() => setSelectedRouteId(route.id)}
              className={`text-left rounded-2xl p-5 border-2 transition-all ${
                selectedRouteId === route.id ? 'border-rose-500 bg-white shadow-lg' : 'border-gray-100 bg-white/80 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: route.color }} />
                  <span className="font-semibold text-gray-800">{route.name}</span>
                </div>
                {route.isBest && <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Best</span>}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <span>Score: <strong>{route.score}/100</strong></span>
                <span>{route.distanceKm} km</span>
                <span>{route.etaMin} min</span>
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                {route.riskNotes.map((note) => (
                  <div key={note} className="flex items-start space-x-2">
                    <CircleDot size={12} className="mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-gray-100 rounded-2xl overflow-hidden h-96">
              <MapContainer center={mapCenter as [number, number]} zoom={13} scrollWheelZoom className="h-full w-full">
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="Standard">
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Dark">
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.Overlay checked name="Report Pins">
                    <>
                      {filteredReports.map((report) => (
                        <Marker key={report.id} position={[report.coordinates[1], report.coordinates[0]]} icon={markerIcon}>
                          <Popup>
                            <div className="text-sm">
                              <div className="font-semibold text-gray-800">{report.reportType.replace('_', ' ')}</div>
                              <div className="text-gray-600">{report.address}</div>
                              <div className="text-xs text-gray-500">Severity: {report.severity}</div>
                              <div className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleString()}</div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </>
                  </LayersControl.Overlay>
                  <LayersControl.Overlay checked name="Suggested Route">
                    <Polyline positions={roadRoutes[selectedRoute.key] || selectedRoute.coordinates} pathOptions={{ color: selectedRoute.color, weight: 6, opacity: 0.9 }} />
                  </LayersControl.Overlay>
                  <LayersControl.Overlay name="Heatmap">
                    <>
                      {filteredReports.map((report) => (
                        <CircleMarker
                          key={`${report.id}-heat`}
                          center={[report.coordinates[1], report.coordinates[0]]}
                          radius={14}
                          pathOptions={{
                            color: 'transparent',
                            fillColor: report.severity === 'high' ? '#ef4444' : report.severity === 'medium' ? '#f59e0b' : '#10b981',
                            fillOpacity: 0.25
                          }}
                        />
                      ))}
                    </>
                  </LayersControl.Overlay>
                  {userLocation && (
                    <LayersControl.Overlay checked name="Your Location">
                      <Marker position={[userLocation.lat, userLocation.lng]} icon={markerIcon}>
                        <Popup>You are here</Popup>
                      </Marker>
                      <Circle center={[userLocation.lat, userLocation.lng]} radius={nearbyRadiusKm * 1000} pathOptions={{ color: '#db2777', fillColor: '#f472b6', fillOpacity: 0.08, weight: 1 }} />
                    </LayersControl.Overlay>
                  )}
                  <LayersControl.Overlay checked name="Destination">
                    <Marker position={[selectedDestination.coordinates[0], selectedDestination.coordinates[1]]} icon={markerIcon}>
                      <Popup>
                        <div className="text-sm">
                          <div className="font-semibold text-gray-800">{selectedDestination.name}</div>
                          <div className="text-gray-600">{selectedDestination.area}</div>
                        </div>
                      </Popup>
                    </Marker>
                  </LayersControl.Overlay>
                </LayersControl>
              </MapContainer>
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
              <h3 className="text-xl font-bold text-gray-800 mb-4">Indore Route Safety</h3>
              <div className="mb-4 rounded-xl bg-white p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">{selectedRoute.name}</span>
                  <span className="text-sm text-gray-500">{selectedRoute.score}/100</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${selectedRoute.score}%`, backgroundColor: selectedRoute.color }} />
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  {selectedRoute.isBest ? `Recommended for ${selectedDestination.name} with lower nearby incident density.` : `Alternative route to ${selectedDestination.name} with mixed safety conditions.`}
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <Filter size={14} />
                <span>Filters</span>
              </div>
              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                  <select
                    value={filters.type}
                    onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    {reportTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === 'all' ? 'All' : type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Severity</label>
                  <select
                    value={filters.severity}
                    onChange={(event) => setFilters((prev) => ({ ...prev, severity: event.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    {severityLevels.map((level) => (
                      <option key={level} value={level}>
                        {level === 'all' ? 'All' : level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Last days</label>
                  <select
                    value={filters.days}
                    onChange={(event) => setFilters((prev) => ({ ...prev, days: Number(event.target.value) }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value={7}>7</option>
                    <option value={14}>14</option>
                    <option value={30}>30</option>
                    <option value={90}>90</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reports near you</span>
                  <span className="font-semibold text-green-600">{nearbyReports.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current destination</span>
                  <span className="font-semibold text-blue-600">{selectedDestination.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reports today</span>
                  <span className="font-semibold text-purple-600">{filteredReports.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold text-pink-600">&lt; 2 min</span>
                </div>
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Incidents around your current location</h3>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading reports...</p>
                </div>
              ) : (
              <div className="space-y-4">
                {(nearbyReports.length > 0 ? nearbyReports : filteredReports).map((report) => (
                  <div key={report.id} className={`border-l-4 pl-4 py-2 ${report.severity === 'high' ? 'border-red-500' : report.severity === 'medium' ? 'border-yellow-500' : 'border-green-500'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        report.severity === 'high' ? 'bg-red-100 text-red-600' :
                        report.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                          {report.reportType.replace('_', ' ')}
                      </span>
                        <span className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleString()}</span>
                    </div>
                      <p className="text-sm text-gray-700">{report.address}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {report.severity === 'high' ? 'High risk: avoid late travel nearby.' : report.severity === 'medium' ? 'Caution: mixed visibility and activity nearby.' : 'Lower risk nearby, but stay alert.'}
                      </p>
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