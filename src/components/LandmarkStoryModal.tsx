/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Landmark, Language } from '../types';
import { storageService } from '../services/storageService';
import { X, CheckCircle, MapPin, Compass, BookOpen, MessageSquare } from 'lucide-react';

interface LandmarkStoryModalProps {
  landmark: Landmark | null;
  language: Language;
  isVisited: boolean;
  onClose: () => void;
  onToggleVisited: (landmarkId: string) => void;
  onAskAboutLandmark: (query: string) => void;
}

export const LandmarkStoryModal: React.FC<LandmarkStoryModalProps> = ({
  landmark,
  language,
  isVisited,
  onClose,
  onToggleVisited,
  onAskAboutLandmark
}) => {
  if (!landmark) return null;
  const isAr = language === 'ar';

  const handleAsk = () => {
    const question = isAr
      ? `أخبرني بالتفصيل عن تاريخ ${landmark.nameAr} وكيف نحتها الأنباط في الصخر؟`
      : `Tell me about the history of ${landmark.nameEn} and how the Nabataeans engineered it.`;
    onAskAboutLandmark(question);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="bg-[#FAF5ED] w-full max-w-xl rounded-xl border-2 border-[#C8963E] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Top Header */}
        <div className="bg-[#7A2E1D] text-[#F6EEE1] px-5 py-4 flex items-center justify-between border-b border-[#C8963E]/40">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-[#C8963E] text-[#331C16] text-xs font-bold flex items-center justify-center shrink-0">
              {landmark.routeOrder}
            </span>
            <div>
              <h3 className="font-heading font-bold text-lg md:text-xl text-[#F6EEE1]">
                {isAr ? landmark.nameAr : landmark.nameEn}
              </h3>
              <p className="text-xs text-[#E8DCC9]/90">
                {isAr ? landmark.subtitleAr : landmark.subtitleEn}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#E8DCC9] hover:text-white p-1 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Landmark Photo Thumbnail */}
        {landmark.thumbnailUrl && (
          <div className="relative h-48 w-full bg-[#3D140B] overflow-hidden border-b border-[#C8963E]/30">
            <img
              src={landmark.thumbnailUrl}
              alt={isAr ? landmark.nameAr : landmark.nameEn}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 left-4 right-4 text-white text-xs font-semibold drop-shadow-md">
              {isAr ? landmark.subtitleAr : landmark.subtitleEn}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 md:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Quick status pill */}
          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E8DCC9]">
            <div className="flex items-center gap-1.5 text-[#1F6E68] font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Route Stop #{landmark.routeOrder} of 5</span>
            </div>
            <div
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                isVisited
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              {isVisited ? (isAr ? '✓ تمت الزيارة' : '✓ Landmark Visited') : (isAr ? 'غير مزار بعد' : 'Not Visited Yet')}
            </div>
          </div>

          {/* Overview */}
          <div className="text-xs md:text-sm text-stone-700 font-medium leading-relaxed">
            {isAr ? landmark.shortDescAr : landmark.shortDescEn}
          </div>

          {/* Curated Story from Knowledge Base */}
          <div className="bg-white p-4 rounded-lg border border-[#C8963E]/30 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#7A2E1D] uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5 text-[#C8963E]" />
              <span>{isAr ? 'الرواية الأثرية المحققة' : 'Verified Archaeological Chronicle'}</span>
            </div>
            <p className="text-xs md:text-sm text-[#331C16] leading-relaxed">
              {isAr ? landmark.curatedStoryAr : landmark.curatedStoryEn}
            </p>
          </div>

          {/* Knowledge Topics Tags */}
          <div>
            <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">
              {isAr ? 'المواضيع المرتبطة بقاعدة المعرفة:' : 'Linked Knowledge Base Topics:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {landmark.knowledgeEntryIds.map(kid => (
                <span
                  key={kid}
                  className="bg-[#FAF5ED] border border-[#C8963E]/40 text-[#7A2E1D] text-[11px] font-mono px-2 py-0.5 rounded"
                >
                  #{kid}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-[#FAF5ED] px-5 py-3.5 border-t border-[#E8DCC9] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onToggleVisited(landmark.id)}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              isVisited
                ? 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                : 'bg-[#1F6E68] hover:bg-[#185853] text-white shadow-sm'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isVisited ? (isAr ? 'إلغاء وسم الزيارة' : 'Mark as Unvisited') : (isAr ? 'وسم كمعلم تمت زيارته' : 'Mark Landmark as Visited')}</span>
          </button>

          <button
            onClick={handleAsk}
            className="text-xs font-bold bg-[#C8963E] hover:bg-[#b8852d] text-[#331C16] px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm"
          >
            <MessageSquare className="w-4 h-4 text-[#7A2E1D]" />
            <span>{isAr ? 'اسأل الدليل عن هذا المعلم' : 'Ask Guide About This'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
