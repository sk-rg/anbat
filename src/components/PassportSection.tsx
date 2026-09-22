/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, VisitorGuideBadge, Landmark, UserSession } from '../types';
import { PassportBooklet } from './PassportBooklet';

interface PassportSectionProps {
  language: Language;
  activeBadge: VisitorGuideBadge | null;
  visitedLandmarks: string[];
  onOpenSatchel: () => void;
  onExploreMap: () => void;
  onAskGuide: () => void;
  onCheckInLandmark?: (landmark: Landmark) => void;
  userSession?: UserSession | null;
}

export const PassportSection: React.FC<PassportSectionProps> = ({
  language,
  activeBadge,
  visitedLandmarks,
  onOpenSatchel,
  onExploreMap,
  onAskGuide,
  onCheckInLandmark,
  userSession
}) => {
  return (
    <div className="bg-[#FAF5ED] rounded-xl border border-[#C8963E]/30 p-4 sm:p-7 shadow-md mb-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#C8963E]/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#7A2E1D] text-[#F6EEE1] text-xs font-bold flex items-center justify-center">
              5
            </span>
            <h2 className="font-heading font-bold text-xl md:text-2xl text-[#7A2E1D]">
              {language === 'ar' ? 'جواز السفر الأثري التفاعلي الذكي' : 'Interactive Anbat Passport (جواز سفر الأنباط)'}
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[#561E12]/80 mt-1">
            {language === 'ar'
              ? 'دفتر تفاعلي ثلاثي الأبعاد بطابع أردني نبطي أصيل: صفحة الهوية والأكلة المفضلة، صفحة المخلوق المساعد وشريط الترابط، وسجل أختام المعالم الميدانية عبر تقنية الـ QR الذكية.'
              : 'Interactive 3D Nabataean flip book: traveler identity with favourite dish, companion creature bond, and automated IoT QR monument visas.'}
          </p>
        </div>
      </div>

      {/* The Interactive Passport Booklet Component */}
      <PassportBooklet
        language={language}
        activeBadge={activeBadge}
        visitedLandmarks={visitedLandmarks}
        onOpenSatchel={onOpenSatchel}
        onExploreMap={onExploreMap}
        onAskGuide={onAskGuide}
        onCheckInLandmark={onCheckInLandmark}
        userSession={userSession}
      />
    </div>
  );
};
