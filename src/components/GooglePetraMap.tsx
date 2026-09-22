/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import { Landmark, Language } from '../types';
import { LANDMARKS } from '../data/landmarks';
import {
  MapPin,
  Compass,
  Navigation,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Footprints,
  Eye
} from 'lucide-react';

interface GooglePetraMapProps {
  language: Language;
  visitedLandmarks: string[];
  onSelectLandmark: (landmark: Landmark) => void;
  onToggleVisited: (landmarkId: string) => void;
}

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const deltaP = ((lat2 - lat1) * Math.PI) / 180;
  const deltaL = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(deltaL / 2) * Math.sin(deltaL / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function formatDistance(meters: number, isAr: boolean): string {
  if (meters < 1000) {
    return isAr ? `${meters} متر` : `${meters} m`;
  }
  const km = (meters / 1000).toFixed(1);
  return isAr ? `${km} كم` : `${km} km`;
}

// Subcomponent to draw the historical trail polyline between the 5 landmarks
const TrailPolyline: React.FC<{ coordinates: { lat: number; lng: number }[] }> = ({ coordinates }) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');

  useEffect(() => {
    if (!map || !mapsLib) return;

    const trail = new mapsLib.Polyline({
      path: coordinates,
      geodesic: true,
      strokeColor: '#7A2E1D',
      strokeOpacity: 0.85,
      strokeWeight: 4,
      map: map
    });

    return () => {
      trail.setMap(null);
    };
  }, [map, mapsLib, coordinates]);

  return null;
};

// Subcomponent to pan to specific coordinates when clicked
const MapCenterController: React.FC<{
  target: { lat: number; lng: number } | null;
  zoom?: number;
}> = ({ target, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !target) return;
    map.panTo(target);
    if (zoom) {
      map.setZoom(zoom);
    }
  }, [map, target, zoom]);

  return null;
};

export const GooglePetraMap: React.FC<GooglePetraMapProps> = ({
  language,
  visitedLandmarks,
  onSelectLandmark,
  onToggleVisited
}) => {
  const isAr = language === 'ar';
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    'AIzaSyBzRVEPUVM2_d893hArpU96nYnv9jcBgds';

  const defaultCenter = useMemo(() => ({ lat: 30.3285, lng: 35.4465 }), []);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('terrain');
  const [activeLandmark, setActiveLandmark] = useState<Landmark | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'tracking' | 'error' | 'simulated'>('idle');
  const [panTarget, setPanTarget] = useState<{ lat: number; lng: number } | null>(null);

  // Extract path coordinates along the route
  const routePath = useMemo(() => {
    return LANDMARKS.map(l => l.geoCoordinates);
  }, []);

  // Request browser geolocation
  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert(isAr ? 'متصفحك لا يدعم تحديد الموقع الجغرافي.' : 'Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('tracking');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setUserLocation(coords);
        setPanTarget(coords);
      },
      err => {
        console.warn('Geolocation error:', err.message);
        setLocationStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [isAr]);

  // Simulate visiting Petra (sets location at the Siq or Treasury so users can test distances anywhere)
  const handleSimulateAtTreasury = () => {
    // Exact location just outside the Treasury in the Siq canyon
    const treasuryCoords = { lat: 30.3225, lng: 35.4520 };
    setUserLocation(treasuryCoords);
    setLocationStatus('simulated');
    setPanTarget(treasuryCoords);
  };

  // Find distance to each landmark from user location
  const distances = useMemo(() => {
    if (!userLocation) return null;
    const res: Record<string, number> = {};
    LANDMARKS.forEach(l => {
      res[l.id] = calculateDistanceMeters(
        userLocation.lat,
        userLocation.lng,
        l.geoCoordinates.lat,
        l.geoCoordinates.lng
      );
    });
    return res;
  }, [userLocation]);

  // Check closest landmark
  const closestLandmarkInfo = useMemo(() => {
    if (!distances) return null;
    let closestId = LANDMARKS[0].id;
    let minDistance = Infinity;

    Object.entries(distances).forEach(([id, dist]) => {
      if (dist < minDistance) {
        minDistance = dist;
        closestId = id;
      }
    });

    const landmark = LANDMARKS.find(l => l.id === closestId);
    return {
      landmark,
      distance: minDistance,
      isNearby: minDistance <= 80 // within 80 meters
    };
  }, [distances]);

  return (
    <div className="flex flex-col gap-3">
      {/* Map Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-[#C8963E]/30 shadow-xs text-xs">
        {/* Map Type Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-[#7A2E1D] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#C8963E]" />
            {isAr ? 'نمط الخريطة:' : 'Map Style:'}
          </span>
          <div className="inline-flex rounded-md shadow-xs bg-[#FAF5ED] p-0.5 border border-[#E8DCC9]">
            <button
              type="button"
              onClick={() => setMapType('terrain')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                mapType === 'terrain'
                  ? 'bg-[#7A2E1D] text-[#F6EEE1] shadow-xs'
                  : 'text-[#331C16] hover:bg-stone-200'
              }`}
            >
              {isAr ? 'تضاريس جبلية ⛰️' : 'Terrain ⛰️'}
            </button>
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                mapType === 'satellite'
                  ? 'bg-[#7A2E1D] text-[#F6EEE1] shadow-xs'
                  : 'text-[#331C16] hover:bg-stone-200'
              }`}
            >
              {isAr ? 'قمر صناعي 🛰️' : 'Satellite 🛰️'}
            </button>
            <button
              type="button"
              onClick={() => setMapType('roadmap')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                mapType === 'roadmap'
                  ? 'bg-[#7A2E1D] text-[#F6EEE1] shadow-xs'
                  : 'text-[#331C16] hover:bg-stone-200'
              }`}
            >
              {isAr ? 'طرق وشوارع 🗺️' : 'Roadmap 🗺️'}
            </button>
          </div>
        </div>

        {/* GPS Live Locator & Demo buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleRequestLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1F6E68] text-white hover:bg-[#185853] font-medium transition shadow-xs cursor-pointer"
            title={isAr ? 'تحديد موقعك الحالي الحقيقي عبر GPS' : 'Locate my position via GPS'}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isAr ? 'موقعي المباشر' : 'My GPS Location'}</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateAtTreasury}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#FAF5ED] text-[#7A2E1D] border border-[#C8963E]/40 hover:bg-[#E8DCC9]/60 font-medium transition cursor-pointer"
            title={isAr ? 'محاكاة التواجد عند ساحة الخزنة لتجربة حساب المسافات' : 'Simulate standing at Treasury'}
          >
            <Footprints className="w-3.5 h-3.5 text-[#C8963E]" />
            <span>{isAr ? 'تجربة موقع بالبترا' : 'Simulate in Petra'}</span>
          </button>
        </div>
      </div>

      {/* Proximity / Landmark Distance Alert Banner if GPS active */}
      {closestLandmarkInfo && closestLandmarkInfo.landmark && (
        <div
          className={`p-3 rounded-lg border flex flex-wrap items-center justify-between gap-2.5 text-xs transition-all ${
            closestLandmarkInfo.isNearby
              ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm'
              : 'bg-amber-50/70 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-2">
            <Compass
              className={`w-4 h-4 shrink-0 ${
                closestLandmarkInfo.isNearby
                  ? 'text-emerald-600 animate-bounce'
                  : 'text-amber-700'
              }`}
            />
            <div>
              <span className="font-bold">
                {closestLandmarkInfo.isNearby
                  ? isAr
                    ? `🎯 أنت الآن بجوار ${closestLandmarkInfo.landmark.nameAr}!`
                    : `🎯 You are right next to ${closestLandmarkInfo.landmark.nameEn}!`
                  : isAr
                  ? `أقرب معلم إليك: ${closestLandmarkInfo.landmark.nameAr} (${formatDistance(
                      closestLandmarkInfo.distance,
                      isAr
                    )})`
                  : `Closest landmark: ${closestLandmarkInfo.landmark.nameEn} (${formatDistance(
                      closestLandmarkInfo.distance,
                      isAr
                    )})`}
              </span>
              <p className="text-[11px] opacity-80">
                {locationStatus === 'simulated'
                  ? isAr
                    ? 'وضع تجربة: موقعك محاكى بجوار الخزنة في وادي بترا'
                    : 'Simulation mode: position set beside Treasury in Petra'
                  : isAr
                  ? 'يتم تحديث المسافة باستمرار بناءً على إحداثياتك'
                  : 'Distance continuously calculated from your GPS'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectLandmark(closestLandmarkInfo.landmark!)}
            className="px-3 py-1 bg-[#7A2E1D] text-[#F6EEE1] rounded font-bold hover:bg-[#612215] transition cursor-pointer text-xs"
          >
            {isAr ? 'فتح التفاصيل والرواية' : 'View Landmark Story'}
          </button>
        </div>
      )}

      {/* Google Maps Container */}
      <div className="relative w-full h-[520px] rounded-xl overflow-hidden border-2 border-[#C8963E]/40 shadow-md">
        <APIProvider apiKey={apiKey} language={isAr ? 'ar' : 'en'} region="JO">
          <Map
            defaultCenter={defaultCenter}
            defaultZoom={14}
            mapId="DEMO_MAP_ID"
            mapTypeId={mapType}
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Trail Polyline */}
            <TrailPolyline coordinates={routePath} />

            {/* Map Centering controller */}
            <MapCenterController target={panTarget} zoom={15} />

            {/* User GPS Location Marker */}
            {userLocation && (
              <AdvancedMarker position={userLocation} title={isAr ? 'موقعك الحالي' : 'Your Location'}>
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-75" />
                  <div className="relative w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>
              </AdvancedMarker>
            )}

            {/* 5 Petra Landmarks Markers */}
            {LANDMARKS.map(landmark => {
              const isVisited = visitedLandmarks.includes(landmark.id);
              const dist = distances ? distances[landmark.id] : null;

              return (
                <AdvancedMarker
                  key={landmark.id}
                  position={landmark.geoCoordinates}
                  title={isAr ? landmark.nameAr : landmark.nameEn}
                  onClick={() => {
                    setActiveLandmark(landmark);
                  }}
                >
                  <div
                    className={`group cursor-pointer flex flex-col items-center transition-transform hover:scale-110 duration-200 select-none ${
                      isVisited ? 'scale-100' : 'scale-105'
                    }`}
                  >
                    {/* Badge / Pin */}
                    <div
                      className={`relative flex items-center justify-center rounded-full shadow-lg border-2 border-white transition-all ${
                        isVisited
                          ? 'bg-[#1F6E68] text-white w-9 h-9'
                          : 'bg-[#7A2E1D] text-[#F6EEE1] w-10 h-10 ring-2 ring-[#C8963E]'
                      }`}
                    >
                      <span className="font-bold text-xs">
                        {isVisited ? '✓' : `#${landmark.routeOrder}`}
                      </span>

                      {/* Small pulse ring for unvisited */}
                      {!isVisited && (
                        <span className="absolute -inset-1 rounded-full border border-[#7A2E1D] animate-ping opacity-35" />
                      )}
                    </div>

                    {/* Plaque name tag under pin */}
                    <div className="mt-1 bg-[#331C16]/90 backdrop-blur-xs text-[#F6EEE1] text-[10px] font-semibold px-2 py-0.5 rounded shadow border border-[#C8963E]/40 whitespace-nowrap">
                      {isAr ? landmark.nameAr : landmark.nameEn}
                      {dist !== null && (
                        <span className="ml-1 text-[#C8963E] text-[9px] font-normal">
                          ({formatDistance(dist, isAr)})
                        </span>
                      )}
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Active Landmark InfoWindow */}
            {activeLandmark && (
              <InfoWindow
                position={activeLandmark.geoCoordinates}
                onCloseClick={() => setActiveLandmark(null)}
                pixelOffset={[0, -25]}
              >
                <div className="w-64 max-w-[280px] p-1 font-sans text-left rtl:text-right">
                  {/* Photo Header */}
                  {activeLandmark.thumbnailUrl && (
                    <div className="relative h-24 w-full rounded-md overflow-hidden mb-2 bg-[#7A2E1D]">
                      <img
                        src={activeLandmark.thumbnailUrl}
                        alt={isAr ? activeLandmark.nameAr : activeLandmark.nameEn}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-[#7A2E1D]/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        #{activeLandmark.routeOrder}
                      </span>
                    </div>
                  )}

                  {/* Title and Subtitle */}
                  <h4 className="font-bold text-sm text-[#7A2E1D] leading-tight">
                    {isAr ? activeLandmark.nameAr : activeLandmark.nameEn}
                  </h4>
                  <p className="text-[11px] text-stone-600 mb-2 truncate">
                    {isAr ? activeLandmark.subtitleAr : activeLandmark.subtitleEn}
                  </p>

                  {/* Distance if calculated */}
                  {distances && distances[activeLandmark.id] !== undefined && (
                    <div className="mb-2 text-[11px] text-[#1F6E68] font-semibold flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5" />
                      <span>
                        {isAr ? 'المسافة إليك: ' : 'Distance to you: '}
                        {formatDistance(distances[activeLandmark.id], isAr)}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectLandmark(activeLandmark);
                        setActiveLandmark(null);
                      }}
                      className="flex-1 bg-[#7A2E1D] hover:bg-[#612215] text-[#F6EEE1] text-xs font-bold py-1.5 px-2 rounded text-center transition cursor-pointer"
                    >
                      {isAr ? 'رواية المعلم 📖' : 'Read Chronicle 📖'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleVisited(activeLandmark.id)}
                      className={`text-xs py-1.5 px-2.5 rounded font-bold transition cursor-pointer border ${
                        visitedLandmarks.includes(activeLandmark.id)
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-white hover:bg-stone-50 text-[#331C16] border-stone-300'
                      }`}
                      title={isAr ? 'تسجيل كمعلم مزار' : 'Toggle visited'}
                    >
                      {visitedLandmarks.includes(activeLandmark.id) ? '✓' : isAr ? 'تسجيل' : 'Check-in'}
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Floating Petra Trajectory Badge */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-lg border border-[#C8963E]/40 text-xs shadow-md max-w-xs hidden sm:block">
          <div className="font-bold text-[#7A2E1D] flex items-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5 text-[#C8963E]" />
            <span>{isAr ? 'مسار الاستكشاف النبطي' : 'Petra Exploration Route'}</span>
          </div>
          <p className="text-[11px] text-[#331C16]/80 leading-snug">
            {isAr
              ? 'يمتد الخط البني من مدخل السيق مروراً بالخزنة وشارع الواجهات والمدرج حتى دير الأعالي.'
              : 'Brown line tracks the Siq canyon to Treasury, Facades, Theatre, and High Monastery.'}
          </p>
        </div>
      </div>
    </div>
  );
};
