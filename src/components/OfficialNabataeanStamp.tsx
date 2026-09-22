/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface OfficialNabataeanStampProps {
  landmarkNameAr?: string;
  landmarkNameEn?: string;
  dateStr?: string;
  serialNumber?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rotationDeg?: number;
  isAnimated?: boolean;
}

export const OfficialNabataeanStamp: React.FC<OfficialNabataeanStampProps> = ({
  landmarkNameAr,
  landmarkNameEn,
  dateStr,
  serialNumber,
  size = 'md',
  rotationDeg = -3,
  isAnimated = false
}) => {
  const sizeMap = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48 sm:w-52 sm:h-52',
    xl: 'w-60 h-60 sm:w-64 sm:h-64'
  };

  const formattedDate = dateStr || new Date().toISOString().split('T')[0];
  const serial = serialNumber || 'JOR-PETRA-02';

  return (
    <div
      className={`relative inline-block select-none group ${sizeMap[size]} ${
        isAnimated ? 'animate-in zoom-in-50 duration-300' : ''
      }`}
      style={{
        transform: `rotate(${rotationDeg}deg)`
      }}
    >
      {/* Fallback & Enhanced Background Stamp Image from assets */}
      <img
        src="/assets/official-stamp.jpg"
        alt="Official Nabataean Seal"
        className="absolute inset-0 w-full h-full object-contain mix-blend-multiply opacity-95 transition-opacity"
        referrerPolicy="no-referrer"
        onError={e => {
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />

      {/* High-Definition SVG Stamp Vector Overlay ensuring razor-sharp clarity & responsive scaling */}
      <svg
        viewBox="0 0 300 300"
        className="w-full h-full text-[#9E2A2B] fill-current drop-shadow-xs"
        style={{
          filter: 'contrast(120%)'
        }}
      >
        <defs>
          {/* Circular path for top arc text */}
          <path
            id="topArcPath"
            d="M 40,150 A 110,110 0 1,1 260,150"
            fill="none"
          />
          {/* Circular path for bottom arc text */}
          <path
            id="bottomArcPath"
            d="M 260,150 A 110,110 0 0,1 40,150"
            fill="none"
          />
          {/* Secondary inner bottom arc for English text */}
          <path
            id="innerBottomArcPath"
            d="M 245,150 A 95,95 0 0,1 55,150"
            fill="none"
          />
        </defs>

        {/* Outer concentric stamp circles with authentic rubber distress dashes */}
        <circle
          cx="150"
          cy="150"
          r="142"
          fill="none"
          stroke="#9E2A2B"
          strokeWidth="3.5"
          strokeDasharray="6 2"
          opacity="0.9"
        />
        <circle
          cx="150"
          cy="150"
          r="134"
          fill="none"
          stroke="#9E2A2B"
          strokeWidth="1.5"
          opacity="0.85"
        />
        <circle
          cx="150"
          cy="150"
          r="92"
          fill="none"
          stroke="#9E2A2B"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          opacity="0.8"
        />

        {/* Top Arc Arabic text: المملكة الاردنية الهاشمية */}
        <text
          fill="#9E2A2B"
          fontSize="17"
          fontFamily="serif"
          fontWeight="bold"
          letterSpacing="2"
        >
          <textPath href="#topArcPath" startOffset="50%" textAnchor="middle">
            المملكة الاردنية الهاشمية
          </textPath>
        </text>

        {/* Left & Right 8-Pointed Nabataean Stars */}
        <g transform="translate(36, 142) scale(0.65)" fill="#9E2A2B">
          <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
          <polygon points="12,3 14,9 20,12 14,15 12,21 10,15 4,12 10,9" opacity="0.6" />
        </g>
        <g transform="translate(248, 142) scale(0.65)" fill="#9E2A2B">
          <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" />
          <polygon points="12,3 14,9 20,12 14,15 12,21 10,15 4,12 10,9" opacity="0.6" />
        </g>

        {/* Center Treasury Facade Engraving Silhouette */}
        <g transform="translate(95, 80) scale(0.38)" stroke="#9E2A2B" strokeWidth="2.5" fill="none">
          {/* Upper Urn & Tholos */}
          <path d="M 145,25 L 155,25 L 150,10 Z" fill="#9E2A2B" />
          <path d="M 125,50 L 175,50 L 150,25 Z" fill="#9E2A2B" />
          <rect x="135" y="50" width="30" height="40" rx="3" stroke="#9E2A2B" />
          {/* Broken Pediments */}
          <path d="M 60,65 L 115,40 L 115,90 L 60,90 Z" />
          <path d="M 240,65 L 185,40 L 185,90 L 240,90 Z" />
          {/* Lower Corinthian Pediment & Columns */}
          <polygon points="50,115 150,75 250,115" strokeWidth="3" />
          <line x1="50" y1="120" x2="250" y2="120" strokeWidth="3" />
          {/* 6 Corinthian columns */}
          <line x1="68" y1="120" x2="68" y2="240" strokeWidth="3.5" />
          <line x1="100" y1="120" x2="100" y2="240" strokeWidth="3.5" />
          <line x1="130" y1="120" x2="130" y2="240" strokeWidth="3.5" />
          <line x1="170" y1="120" x2="170" y2="240" strokeWidth="3.5" />
          <line x1="200" y1="120" x2="200" y2="240" strokeWidth="3.5" />
          <line x1="232" y1="120" x2="232" y2="240" strokeWidth="3.5" />
          {/* Central Portal Entrance */}
          <rect x="130" y="160" width="40" height="80" fill="#9E2A2B" opacity="0.3" />
          {/* Steps podium */}
          <line x1="40" y1="240" x2="260" y2="240" strokeWidth="4" />
          <line x1="30" y1="248" x2="270" y2="248" strokeWidth="4" />
        </g>

        {/* Bottom Arc Text Line 1: الانباط - جواز سفر نبطي */}
        <text
          fill="#9E2A2B"
          fontSize="14"
          fontFamily="serif"
          fontWeight="bold"
          letterSpacing="1.5"
        >
          <textPath href="#bottomArcPath" startOffset="50%" textAnchor="middle">
            الانباط • جواز سفر نبطي
          </textPath>
        </text>

        {/* Bottom Arc Text Line 2: NABATAEAN PASSPORT */}
        <text
          fill="#9E2A2B"
          fontSize="11.5"
          fontFamily="sans-serif"
          fontWeight="bold"
          letterSpacing="2.5"
        >
          <textPath href="#innerBottomArcPath" startOffset="50%" textAnchor="middle">
            NABATAEAN PASSPORT
          </textPath>
        </text>

        {/* Overlaid Rubber Date & Serial Stamp */}
        <g transform="translate(150, 205)" textAnchor="middle">
          <rect
            x="-65"
            y="-10"
            width="130"
            height="18"
            fill="#9E2A2B"
            rx="3"
            opacity="0.9"
          />
          <text
            x="0"
            y="3"
            fill="#FAF5ED"
            fontSize="9"
            fontWeight="bold"
            fontFamily="monospace"
            letterSpacing="1"
          >
            {formattedDate} • VERIFIED
          </text>
        </g>
      </svg>

      {/* Dynamic Landmark Title Label below stamp if provided */}
      {landmarkNameAr && (
        <div className="absolute -bottom-2 left-0 right-0 text-center pointer-events-none">
          <span className="bg-[#9E2A2B] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            {landmarkNameAr}
          </span>
        </div>
      )}
    </div>
  );
};
