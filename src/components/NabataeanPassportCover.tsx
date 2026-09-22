/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface NabataeanPassportCoverProps {
  onOpen?: () => void;
  className?: string;
  visitedCount?: number;
  totalLandmarks?: number;
  creatureName?: string;
  showButton?: boolean;
}

export const NabataeanPassportCover: React.FC<NabataeanPassportCoverProps> = ({
  onOpen,
  className = '',
  visitedCount = 0,
  totalLandmarks = 5,
  creatureName,
  showButton = true
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* Authentic Clean Passport Cover - Exact Photo Without Modifications */}
      <div
        onClick={onOpen}
        className={`relative w-full max-w-[380px] rounded-2xl shadow-2xl overflow-hidden cursor-pointer select-none group transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_25px_60px_-15px_rgba(50,15,22,0.8)] border-2 border-[#8A3343]/60 bg-[#521B24] ${className}`}
        style={{
          boxShadow:
            '0 25px 50px -12px rgba(40, 10, 18, 0.75), inset 0 0 20px rgba(0, 0, 0, 0.5)'
        }}
        title="انقر لفتح واستعراض صفحات جواز سفر الأنباط"
      >
        {/* Cover Photo - Displayed completely as-is with zero alterations or overlays */}
        <img
          src="/assets/passport-front-cover.jpg"
          alt="جواز سفر نبطي - The Hashemite Kingdom of Jordan Nabataean Passport"
          className="w-full h-auto object-contain block select-none pointer-events-none transition-transform duration-500 group-hover:scale-[1.01]"
          loading="eager"
        />

        {/* Subtle hover gleam on interaction */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* Interactive Open Action Button below the cover so the image stays 100% untouched */}
      {showButton && (
        <div className="mt-3 flex items-center justify-center">
          <button
            onClick={onOpen}
            className="px-4 py-1.5 rounded-full bg-[#521B24] hover:bg-[#6D2330] text-[#E5B55E] border border-[#C8963E]/50 text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer group"
          >
            <span className="group-hover:scale-110 transition-transform">📖</span>
            <span>انقر لفتح واستعراض صفحات الجواز</span>
          </button>
        </div>
      )}
    </div>
  );
};

