/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Landmark, Language } from '../types';
import { LANDMARKS } from '../data/landmarks';
import { LandmarkStoryModal } from './LandmarkStoryModal';
import { GooglePetraMap } from './GooglePetraMap';
import {
  MapPin,
  CheckCircle2,
  Sparkles,
  Compass,
  ArrowRight,
  Info,
  Layers,
  Camera,
  QrCode,
  Globe
} from 'lucide-react';

interface PetraMapProps {
  language: Language;
  visitedLandmarks: string[];
  onToggleVisited: (landmarkId: string) => void;
  onAskAboutLandmark: (query: string) => void;
  onOpenSatchelForLegendary: () => void;
  onOpenQrScanner?: () => void;
}

export const PetraMap: React.FC<PetraMapProps> = ({
  language,
  visitedLandmarks,
  onToggleVisited,
  onAskAboutLandmark,
  onOpenSatchelForLegendary,
  onOpenQrScanner
}) => {
  const isAr = language === 'ar';
  const [viewMode, setViewMode] = useState<'google' | 'artistic'>('google');
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [hoveredLandmark, setHoveredLandmark] = useState<Landmark | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleLandmarkMouseEnter = (landmark: Landmark) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredLandmark(landmark);
  };

  const handleLandmarkMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredLandmark(null);
    }, 200);
  };

  const handleTooltipMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredLandmark(null);
    }, 180);
  };

  const getTooltipLayout = (landmark: Landmark) => {
    const { x, y } = landmark.svgCoordinates;
    const leftPct = (x / 860) * 100;
    const topPct = (y / 480) * 100;

    // High altitude points (e.g. Monastery y=130) display tooltip below the pin
    const placeBelow = y < 170;

    // Horizontal anchoring logic to keep card comfortably within map bounds
    let xTransform = '-50%';
    let arrowLeft = '50%';
    if (leftPct < 24) {
      xTransform = '-10%';
      arrowLeft = '22%';
    } else if (leftPct > 76) {
      xTransform = '-90%';
      arrowLeft = '78%';
    }

    const yTransform = placeBelow ? '26px' : 'calc(-100% - 26px)';

    return {
      left: leftPct,
      top: topPct,
      placeBelow,
      arrowLeft,
      transform: `translate(${xTransform}, ${yTransform})`
    };
  };

  const total = LANDMARKS.length;
  const visitedCount = visitedLandmarks.length;
  const progressPercent = Math.round((visitedCount / total) * 100);
  const allVisited = visitedCount >= total;

  return (
    <div className="bg-[#FAF5ED] rounded-xl border border-[#C8963E]/30 p-5 md:p-7 shadow-md mb-8">
      {/* Map Header with Visited Counter and Progress Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#C8963E]/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#7A2E1D] text-[#F6EEE1] text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h2 className="font-heading font-bold text-xl md:text-2xl text-[#7A2E1D]">
              {isAr ? 'خريطة مسار بترا التفاعلية' : 'Interactive Petra Route Map'}
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[#561E12]/80 mt-1">
            {isAr
              ? 'انقر على أي معلم صخري على المسار الحقيقي للاطلاع على روايته التاريخية وتسجيل زيارتك، أو مرر المؤشر لمعاينة صورته واسمه.'
              : 'Hover over any landmark pin to preview its image and name, or click to open its verified story chronicle.'}
          </p>
        </div>

        {/* Visited Counter, Progress Bar & Camera QR Scan Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="bg-white p-3 rounded-lg border border-[#E8DCC9] shadow-xs min-w-[240px]">
            <div className="flex items-center justify-between text-xs font-bold text-[#331C16] mb-1.5">
              <span className="flex items-center gap-1.5 text-[#7A2E1D]">
                <Compass className="w-3.5 h-3.5 text-[#C8963E]" />
                {isAr ? 'تقدم رحلة الاستكشاف:' : 'Exploration Progress:'}
              </span>
              <span className="text-[#1F6E68]">
                {visitedCount} / {total} {isAr ? 'معالم' : 'Landmarks'} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#C8963E] to-[#1F6E68] h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* QR Scan Button */}
          {onOpenQrScanner && (
            <button
              id="btn-scan-qr-map"
              type="button"
              onClick={onOpenQrScanner}
              className="bg-[#1F6E68] hover:bg-[#185853] text-white font-bold text-xs px-4 py-3 rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
              title="Open camera to scan physical QR marker in Petra"
            >
              <Camera className="w-4 h-4" />
              <span>{isAr ? 'مسح باركود المعلم 📷' : 'Scan Landmark QR 📷'}</span>
            </button>
          )}
        </div>
      </div>

      {/* On-Site Physical Marker Banner */}
      <div className="mb-4 bg-gradient-to-r from-[#1F6E68]/15 via-[#FAF5ED] to-[#C8963E]/15 border border-[#1F6E68]/30 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2.5 text-xs text-[#331C16]">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-[#1F6E68] shrink-0" />
          <span>
            {isAr
              ? 'هل أنت في موقع بترا الآن؟ افتح كاميرا الماسح لمسح اللوحات الحجرية في الموقع لتسجيل الوصول تلقائياً.'
              : 'Visiting Petra on-site? Use the camera scanner to check-in at physical monument markers in the canyon.'}
          </span>
        </div>
        {onOpenQrScanner && (
          <button
            onClick={onOpenQrScanner}
            className="text-[11px] font-bold text-[#1F6E68] hover:text-[#185853] underline flex items-center gap-1 shrink-0"
          >
            <span>{isAr ? 'تشغيل الكاميرا الآن ←' : 'Open Camera Scanner →'}</span>
          </button>
        )}
      </div>

      {/* Unlock Celebration Alert if all 5 visited */}
      {allVisited && (
        <div className="mb-5 bg-gradient-to-r from-amber-500/20 via-emerald-500/10 to-amber-500/20 border border-[#C8963E] rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm text-[#331C16]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C8963E] shrink-0" />
            <div>
              <span className="font-bold text-[#7A2E1D]">
                {isAr ? 'تهانينا! أتممت استكشاف كافة معالم بترا الـ 5!' : 'All 5 Petra Monuments Cleared!'}
              </span>
              <p className="text-xs text-stone-700">
                {isAr
                  ? 'تم فك القفل عن الوعل النوبي الأسطوري (Al-Badan). يمكنك الآن استدعاؤه في الحقيبة.'
                  : 'The Legendary Nubian Ibex (Al-Badan) is now unlocked for summon in your Satchel.'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSatchelForLegendary}
            className="bg-[#7A2E1D] hover:bg-[#612215] text-[#F6EEE1] font-bold px-3 py-1.5 rounded shadow text-xs transition flex items-center gap-1"
          >
            <span>{isAr ? 'استدعِ الوعل الملكي الآن 🐐' : 'Summon Legendary Ibex 🐐'}</span>
          </button>
        </div>
      )}

      {/* Map View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="inline-flex p-1 bg-white border border-[#C8963E]/40 rounded-xl shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode('google')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'google'
                ? 'bg-[#7A2E1D] text-[#F6EEE1] shadow-xs'
                : 'text-[#331C16] hover:bg-[#FAF5ED]'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#C8963E]" />
            <span>{isAr ? 'خريطة Google المباشرة 🗺️' : 'Google Maps Live 🗺️'}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('artistic')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'artistic'
                ? 'bg-[#7A2E1D] text-[#F6EEE1] shadow-xs'
                : 'text-[#331C16] hover:bg-[#FAF5ED]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#C8963E]" />
            <span>{isAr ? 'الخريطة الأثرية النبطية 📜' : 'Illustrated Route 📜'}</span>
          </button>
        </div>

        <div className="text-xs text-[#561E12]/80 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C8963E]" />
          <span>
            {viewMode === 'google'
              ? isAr
                ? 'خريطة Google Maps متصلة بأقمار صناعية وتضاريس جبال البترا الحقيقية'
                : 'Google Maps with real satellite & terrain of Petra mountains'
              : isAr
              ? 'مخطط توضيحي تاريخي لمسار البترا الصخري'
              : 'Stylized historical canyon trail illustration'}
          </span>
        </div>
      </div>

      {viewMode === 'google' ? (
        <GooglePetraMap
          language={language}
          visitedLandmarks={visitedLandmarks}
          onSelectLandmark={setSelectedLandmark}
          onToggleVisited={onToggleVisited}
        />
      ) : (
        /* Stylized SVG Map Container */
        <div className="relative bg-[#E8DCC9]/50 rounded-xl border-2 border-[#C8963E]/40 overflow-hidden shadow-inner">
        {/* Map Legend */}
        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-xs px-3 py-2 rounded-md border border-[#C8963E]/30 text-[11px] text-[#331C16] shadow-xs">
          <div className="font-bold text-[#7A2E1D] mb-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#C8963E]" />
            {isAr ? 'دليل الخريطة النبطية' : 'Route Legend'}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#1F6E68] inline-block"></span>
            <span>{isAr ? 'معلم مزار' : 'Visited'}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-3 h-3 rounded-full bg-[#7A2E1D] inline-block animate-pulse"></span>
            <span>{isAr ? 'معلم ينتظر الزيارة' : 'Unvisited Landmark'}</span>
          </div>
        </div>

        {/* Real Route Stylized SVG Vector Canvas */}
        <svg
          viewBox="0 0 860 480"
          className="w-full h-auto max-h-[500px] select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Sandstone canyon gradient */}
            <linearGradient id="sandstoneMapBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F6EEE1" />
              <stop offset="50%" stopColor="#EDE2CF" />
              <stop offset="100%" stopColor="#E2D4BE" />
            </linearGradient>

            {/* Canyon cliff shadow */}
            <linearGradient id="cliffGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7A2E1D" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#561E12" stopOpacity="0.04" />
            </linearGradient>

            {/* Glowing pin pulse */}
            <filter id="glowPin" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7A2E1D" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background Map Surface */}
          <rect width="860" height="480" fill="url(#sandstoneMapBg)" />

          {/* Geological Canyon Contour Shading */}
          <path
            d="M 0 100 Q 180 80 260 140 T 420 180 T 600 120 T 860 80 L 860 0 L 0 0 Z"
            fill="url(#cliffGrad)"
          />
          <path
            d="M 0 420 Q 200 460 380 400 T 620 440 T 860 400 L 860 480 L 0 480 Z"
            fill="url(#cliffGrad)"
          />

          {/* Stylized Mountain Ridgeline Contours */}
          <g stroke="#C8963E" strokeWidth="1" strokeOpacity="0.35" fill="none">
            <path d="M 60 180 Q 140 140 220 200" />
            <path d="M 240 120 Q 320 80 400 130" />
            <path d="M 520 90 Q 600 40 680 100" />
            <path d="M 680 70 Q 760 30 840 80" />
            {/* Wadi riverbeds / ancient water conduits */}
            <path d="M 80 410 Q 180 370 280 320" stroke="#1F6E68" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.6" />
            <path d="M 280 320 Q 420 280 580 230" stroke="#1F6E68" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.6" />
          </g>

          {/* The Sacred Pilgrim Trail Connecting the 5 Landmarks */}
          <path
            d="M 120 380 Q 200 360 280 310 Q 360 290 440 260 Q 520 240 590 220 Q 670 180 740 130"
            fill="none"
            stroke="#7A2E1D"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 6"
          />

          {/* Trail Direction Chevrons / Waymarkers */}
          <g fill="#C8963E" opacity="0.8">
            <circle cx="200" cy="345" r="3" />
            <circle cx="360" cy="285" r="3" />
            <circle cx="515" cy="240" r="3" />
            <circle cx="665" cy="175" r="3" />
          </g>

          {/* 5 Landmark Interactive Markers */}
          {LANDMARKS.map(landmark => {
            const isVisited = visitedLandmarks.includes(landmark.id);
            const isHovered = hoveredLandmark?.id === landmark.id;
            const { x, y } = landmark.svgCoordinates;

            return (
              <g
                key={landmark.id}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setSelectedLandmark(landmark)}
                onMouseEnter={() => handleLandmarkMouseEnter(landmark)}
                onMouseLeave={handleLandmarkMouseLeave}
                id={`map-landmark-pin-${landmark.id}`}
              >
                {/* Active Pulse Ring for unvisited */}
                {!isVisited && (
                  <circle
                    cx={x}
                    cy={y}
                    r="24"
                    fill="none"
                    stroke="#7A2E1D"
                    strokeWidth="2"
                    opacity="0.4"
                  >
                    <animate
                      attributeName="r"
                      values="16;28;16"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.6;0;0.6"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Pin Shadow */}
                <ellipse cx={x} cy={y + 14} rx="12" ry="5" fill="#331C16" fillOpacity="0.25" />

                {/* Outer Pin Body */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? '20' : '17'}
                  fill={isVisited ? '#1F6E68' : '#7A2E1D'}
                  stroke="#F6EEE1"
                  strokeWidth="3"
                  filter="url(#glowPin)"
                />

                {/* Gold rim accent */}
                <circle cx={x} cy={y} r={isHovered ? '16' : '13'} fill="none" stroke="#C8963E" strokeWidth="1.5" />

                {/* Inside Pin Label: Route Order or Checkmark */}
                <text
                  x={x}
                  y={y + 4.5}
                  textAnchor="middle"
                  fill="#F6EEE1"
                  fontSize={isVisited ? '13' : '12'}
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {isVisited ? '✓' : landmark.routeOrder}
                </text>

                {/* Landmark Name Plaque beneath pin */}
                <g transform={`translate(${x}, ${y + 24})`}>
                  <rect
                    x="-65"
                    y="0"
                    width="130"
                    height="22"
                    rx="4"
                    fill="#331C16"
                    fillOpacity="0.85"
                    stroke="#C8963E"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="15"
                    textAnchor="middle"
                    fill="#F6EEE1"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="sans-serif"
                  >
                    {isAr ? landmark.nameAr : landmark.nameEn}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Hoverable Landmark Tooltip Preview */}
        {hoveredLandmark && (() => {
          const isVisited = visitedLandmarks.includes(hoveredLandmark.id);
          const layout = getTooltipLayout(hoveredLandmark);

          return (
            <div
              id={`map-hover-tooltip-${hoveredLandmark.id}`}
              onMouseEnter={handleTooltipMouseEnter}
              onMouseLeave={handleTooltipMouseLeave}
              onClick={() => {
                setSelectedLandmark(hoveredLandmark);
                setHoveredLandmark(null);
              }}
              className="absolute z-30 w-64 sm:w-72 bg-[#FAF5ED] rounded-xl border-2 border-[#C8963E] shadow-2xl overflow-hidden cursor-pointer transition-all duration-150 animate-in fade-in zoom-in-95 group pointer-events-auto select-none"
              style={{
                left: `${layout.left}%`,
                top: `${layout.top}%`,
                transform: layout.transform
              }}
              role="tooltip"
              aria-label={isAr ? hoveredLandmark.nameAr : hoveredLandmark.nameEn}
            >
              {/* Pointer indicator arrow aligning with the pin */}
              {layout.placeBelow ? (
                <div
                  className="absolute -top-1.5 w-3.5 h-3.5 bg-[#3D140B] border-t-2 border-l-2 border-[#C8963E] z-10"
                  style={{ left: layout.arrowLeft, transform: 'translateX(-50%) rotate(45deg)' }}
                />
              ) : (
                <div
                  className="absolute -bottom-1.5 w-3.5 h-3.5 bg-[#FAF5ED] border-b-2 border-r-2 border-[#C8963E] z-10"
                  style={{ left: layout.arrowLeft, transform: 'translateX(-50%) rotate(45deg)' }}
                />
              )}

              {/* Landmark Thumbnail Header */}
              <div className="relative h-28 w-full bg-[#3D140B] overflow-hidden">
                {hoveredLandmark.thumbnailUrl ? (
                  <img
                    src={hoveredLandmark.thumbnailUrl}
                    alt={isAr ? hoveredLandmark.nameAr : hoveredLandmark.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    onError={e => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#7A2E1D]">
                    <Compass className="w-8 h-8 text-[#C8963E]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

                {/* Badges on Thumbnail */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                  <span className="bg-[#7A2E1D]/90 backdrop-blur-xs text-[#F6EEE1] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#C8963E]/50 shadow-xs">
                    #{hoveredLandmark.routeOrder}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                      isVisited
                        ? 'bg-emerald-700/90 text-white border border-emerald-400/50'
                        : 'bg-[#C8963E]/90 text-[#331C16] border border-[#F6EEE1]/40'
                    }`}
                  >
                    {isVisited
                      ? isAr
                        ? '✓ تمت الزيارة'
                        : '✓ Visited'
                      : isAr
                      ? 'غير مزار'
                      : 'Not Visited'}
                  </span>
                </div>

                {/* Landmark Name overlay on Thumbnail */}
                <div className="absolute bottom-2 left-2.5 right-2.5 text-white pointer-events-none">
                  <h4 className="font-heading font-bold text-sm leading-tight drop-shadow-md line-clamp-1">
                    {isAr ? hoveredLandmark.nameAr : hoveredLandmark.nameEn}
                  </h4>
                </div>
              </div>

              {/* Card Body Details */}
              <div className="p-3 bg-[#FAF5ED] space-y-1.5 text-left rtl:text-right">
                <p className="text-[11px] font-semibold text-[#7A2E1D] flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-[#C8963E] shrink-0" />
                  <span className="truncate">
                    {isAr ? hoveredLandmark.subtitleAr : hoveredLandmark.subtitleEn}
                  </span>
                </p>

                <p className="text-[11px] text-[#561E12]/80 line-clamp-2 leading-snug">
                  {isAr ? hoveredLandmark.shortDescAr : hoveredLandmark.shortDescEn}
                </p>

                <div className="pt-1.5 flex items-center justify-between text-[10px] font-bold text-[#1F6E68] border-t border-[#E8DCC9]">
                  <span>{isAr ? 'انقر لفتح الرواية والقصة الأثرية' : 'Click to view full story & history'}</span>
                  <span className="text-[#C8963E] group-hover:translate-x-1 transition-transform rtl:rotate-180">
                    →
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Map Bottom Helper Bar */}
        <div className="bg-[#561E12] text-[#F6EEE1] px-4 py-2 flex flex-wrap items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-[#E8DCC9]">
            <Info className="w-3.5 h-3.5 text-[#C8963E]" />
            {isAr
              ? 'المسار الفعلي: من مدخل السيق إلى الخزنة، ثم شارع الواجهات، والمدرج، وصولاً إلى دير الأعالي.'
              : 'Real archaeological trajectory: Siq Gorge → Treasury → Facades → Theatre → High Ad-Deir.'}
          </span>
          <span className="text-[#C8963E] font-medium hidden sm:inline">
            {isAr ? 'انقر على أي معلم صخري لفتح تفاصيله' : 'Click on any landmark pin to view details'}
          </span>
        </div>
      </div>
      )}

      {/* List of Landmarks for Quick Mobile Access */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {LANDMARKS.map(landmark => {
          const isVisited = visitedLandmarks.includes(landmark.id);
          return (
            <button
              key={landmark.id}
              onClick={() => setSelectedLandmark(landmark)}
              className={`p-2.5 rounded-lg border text-left transition flex items-center justify-between gap-2 ${
                isVisited
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                  : 'bg-white border-[#E8DCC9] hover:border-[#C8963E] text-[#331C16]'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span
                  className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                    isVisited ? 'bg-[#1F6E68] text-white' : 'bg-[#7A2E1D] text-[#F6EEE1]'
                  }`}
                >
                  {isVisited ? '✓' : landmark.routeOrder}
                </span>
                <span className="text-xs font-semibold truncate">
                  {isAr ? landmark.nameAr : landmark.nameEn}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#C8963E] shrink-0 rtl:rotate-180" />
            </button>
          );
        })}
      </div>

      {/* Landmark Story Modal */}
      {selectedLandmark && (
        <LandmarkStoryModal
          landmark={selectedLandmark}
          language={language}
          isVisited={visitedLandmarks.includes(selectedLandmark.id)}
          onClose={() => setSelectedLandmark(null)}
          onToggleVisited={onToggleVisited}
          onAskAboutLandmark={onAskAboutLandmark}
        />
      )}
    </div>
  );
};
