/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, UserSession } from '../types';
import {
  Compass,
  ShieldCheck,
  Languages,
  Sparkles,
  BookOpen,
  Layers,
  RotateCcw,
  Camera,
  MapPin,
  MessageSquare,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';

interface HeaderProps {
  currentView: 'visitor' | 'admin';
  onViewChange: (view: 'visitor' | 'admin') => void;
  activeStep: number;
  onStepSelect: (step: number) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  visitedCount: number;
  totalLandmarks: number;
  onJumpAllLandmarks: () => void;
  onResetDemo: () => void;
  onOpenArchitecture: () => void;
  onOpenQrScanner?: () => void;
  userSession?: UserSession | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  activeStep,
  onStepSelect,
  language,
  onLanguageChange,
  visitedCount,
  totalLandmarks,
  onJumpAllLandmarks,
  onResetDemo,
  onOpenArchitecture,
  onOpenQrScanner,
  userSession,
  onLogout
}) => {
  const isAr = language === 'ar';

  const steps = [
    { num: 1, titleEn: 'Open Satchel', titleAr: 'فتح الحقيبة', icon: Sparkles },
    { num: 2, titleEn: 'Meet Guide', titleAr: 'لقاء الدليل', icon: Compass },
    { num: 3, titleEn: 'Explore Map', titleAr: 'خريطة بترا', icon: MapPin },
    { num: 4, titleEn: 'Ask Guide', titleAr: 'سؤال الدليل', icon: MessageSquare },
    { num: 5, titleEn: 'Collect & Share', titleAr: 'الجواز والمشاركة', icon: BookOpen }
  ];

  const handleStepClick = (stepNum: number) => {
    if (currentView !== 'visitor') {
      onViewChange('visitor');
    }
    onStepSelect(stepNum);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#7A2E1D] text-[#F6EEE1] border-b border-[#C8963E]/40 shadow-md">
      {/* Top Bar: Brand, Language, View Tabs, Demo Controls */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => handleStepClick(1)}
          title={isAr ? 'العودة للبداية: الخطوة 1' : 'Back to Journey Start: Step 1'}
          role="button"
          tabIndex={0}
        >
          <div className="w-10 h-10 rounded-lg bg-[#C8963E] group-hover:bg-[#d8a64e] text-[#7A2E1D] flex items-center justify-center font-bold text-xl shadow-inner border border-[#F6EEE1]/40 transition-colors">
            أن
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-lg md:text-xl tracking-wide text-[#F6EEE1]">
                ANBAT <span className="text-[#C8963E] text-sm md:text-base font-normal font-sans">| أنباط</span>
              </h1>
            </div>
            <p className="text-xs text-[#E8DCC9]/90 hidden md:block">
              {isAr ? 'رفيقك النبطي الذكي لمدينة بترا الأثرية' : 'Your Nabataean Companion & Monument Log'}
            </p>
          </div>
        </div>

        {/* View Switcher: Visitor vs Admin */}
        <div className="flex items-center bg-[#561E12] p-1 rounded-lg border border-[#C8963E]/30 text-xs">
          <button
            id="tab-visitor-view"
            onClick={() => onViewChange('visitor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
              currentView === 'visitor'
                ? 'bg-[#C8963E] text-[#331C16] shadow-sm font-semibold'
                : 'text-[#E8DCC9] hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isAr ? 'بوابة الزائر' : 'Visitor Experience'}</span>
          </button>
          <button
            id="tab-admin-view"
            onClick={() => onViewChange('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
              currentView === 'admin'
                ? 'bg-[#1F6E68] text-white shadow-sm font-semibold'
                : 'text-[#E8DCC9] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAr ? 'لوحة إدارة الموقع' : 'Site Manager Admin'}</span>
          </button>
        </div>

        {/* Right Action Tools: Language, Architecture Modal, QR Scanner, Demo Fast-Track */}
        <div className="flex items-center gap-2">
          {/* QR Scanner */}
          {onOpenQrScanner && (
            <button
              id="btn-header-qr-scanner"
              onClick={onOpenQrScanner}
              className="flex items-center gap-1 text-xs bg-[#1F6E68] hover:bg-[#185853] text-white px-2.5 py-1.5 rounded border border-white/20 transition font-semibold shadow-xs cursor-pointer"
              title="Scan physical QR marker at Petra"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'مسح QR' : 'Scan QR'}</span>
            </button>
          )}

          {/* Architecture / Info */}
          <button
            id="btn-architecture-modal"
            onClick={onOpenArchitecture}
            className="flex items-center gap-1 text-xs bg-[#561E12] hover:bg-[#682415] text-[#C8963E] px-2.5 py-1.5 rounded border border-[#C8963E]/40 transition cursor-pointer"
            title="Inspect Data Flow & Demo Guide"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'المخطط الهندسي' : 'Architecture & Demo'}</span>
          </button>

          {/* Language Toggle */}
          <button
            id="btn-language-toggle"
            onClick={() => onLanguageChange(isAr ? 'en' : 'ar')}
            className="flex items-center gap-1 text-xs bg-[#561E12] hover:bg-[#682415] text-[#F6EEE1] px-2.5 py-1.5 rounded border border-[#C8963E]/30 transition cursor-pointer"
            title="Switch Language (English / Arabic)"
          >
            <Languages className="w-3.5 h-3.5 text-[#C8963E]" />
            <span className="font-semibold">{isAr ? 'English' : 'العربية'}</span>
          </button>

          {/* Logged in User Badge & Logout */}
          {userSession && (
            <div className="flex items-center gap-1.5 bg-[#4A180E] px-2.5 py-1 rounded border border-[#C8963E]/40 text-xs">
              <div className="w-5 h-5 rounded-full bg-[#C8963E] text-[#331C16] flex items-center justify-center font-bold text-[10px]">
                {userSession.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-[#F6EEE1] max-w-[100px] truncate hidden sm:inline" title={userSession.email}>
                {userSession.name}
              </span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-[#E8DCC9] hover:text-rose-300 ml-1 p-0.5 transition cursor-pointer flex items-center gap-1"
                  title={isAr ? 'تسجيل الخروج والعودة لصفحة الدخول' : 'Log out'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">{isAr ? 'خروج' : 'Exit'}</span>
                </button>
              )}
            </div>
          )}

          {/* Demo Control Dropdown/Pills */}
          <div className="hidden lg:flex items-center gap-1 bg-[#4A180E] px-2 py-1 rounded border border-[#C8963E]/20 text-[11px]">
            <span className="text-[#C8963E] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Demo:
            </span>
            <button
              id="btn-demo-jump-all"
              onClick={onJumpAllLandmarks}
              className="text-[#F6EEE1] hover:text-[#C8963E] underline px-1 py-0.5 transition cursor-pointer"
              title="Instantly marks all 5 landmarks visited to test Legendary Creature unlock"
            >
              Jump 5/5
            </button>
            <span className="text-[#E8DCC9]/40">|</span>
            <button
              id="btn-demo-reset-all"
              onClick={onResetDemo}
              className="text-[#E8DCC9] hover:text-red-300 flex items-center gap-0.5 px-1 py-0.5 transition cursor-pointer"
              title="Reset all demo state to fresh initial records"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* 5-Step Flow Strip for Visitor Experience */}
      <div className="bg-[#561E12]/95 border-t border-[#C8963E]/20 px-3 py-1.5 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[660px] text-xs">
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Visitor Step Navigation">
            {steps.map((st, index) => {
              const StepIcon = st.icon;
              const isActive = currentView === 'visitor' && activeStep === st.num;
              const isPast = currentView === 'visitor' && activeStep > st.num;

              return (
                <React.Fragment key={st.num}>
                  <button
                    id={`step-nav-${st.num}`}
                    onClick={() => handleStepClick(st.num)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer select-none text-xs shrink-0 ${
                      isActive
                        ? 'bg-[#C8963E] text-[#331C16] font-bold shadow-md ring-2 ring-[#F6EEE1]/80 scale-[1.02]'
                        : isPast
                        ? 'text-[#C8963E] hover:text-[#F6EEE1] hover:bg-[#7A2E1D]/70 font-medium'
                        : 'text-[#E8DCC9]/70 hover:text-white hover:bg-[#7A2E1D]/40 font-medium'
                    }`}
                    title={
                      isAr
                        ? `انتقال إلى الخطوة ${st.num}: ${st.titleAr}`
                        : `Route to Step ${st.num}: ${st.titleEn}`
                    }
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors shadow-xs ${
                        isActive
                          ? 'bg-[#7A2E1D] text-[#F6EEE1]'
                          : isPast
                          ? 'bg-[#1F6E68] text-white'
                          : 'bg-[#4A180E] text-[#E8DCC9]/80 border border-[#C8963E]/30'
                      }`}
                    >
                      {isPast ? '✓' : st.num}
                    </span>
                    <StepIcon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-[#7A2E1D]' : isPast ? 'text-[#1F6E68]' : 'text-[#C8963E]/80'
                      }`}
                    />
                    <span className="whitespace-nowrap font-medium">{isAr ? st.titleAr : st.titleEn}</span>

                    {/* Active highlight underline marker */}
                    {isActive && (
                      <span className="absolute -bottom-1 left-3 right-3 h-0.5 bg-[#7A2E1D] rounded-full" />
                    )}
                  </button>

                  {index < steps.length - 1 && (
                    <div
                      className="flex items-center px-0.5 shrink-0 text-[#E8DCC9]/40 select-none"
                      aria-hidden="true"
                    >
                      <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Quick Landmark Progress Counter in Step Bar - Clickable to open Map (Step 3) */}
          <button
            id="btn-header-visited-landmarks"
            onClick={() => handleStepClick(3)}
            className="flex items-center gap-1.5 pl-3 rtl:pr-3 rtl:pl-0 border-l rtl:border-r rtl:border-l-0 border-[#C8963E]/30 text-[11px] text-[#E8DCC9] hover:text-[#F6EEE1] hover:bg-[#7A2E1D]/80 px-2 py-1 rounded-md transition-all cursor-pointer group shrink-0"
            title={isAr ? 'انقر للانتقال إلى خريطة المعالم المزارة (الخطوة 3)' : 'Click to route to Petra Map (Step 3)'}
          >
            <MapPin className="w-3.5 h-3.5 text-[#C8963E] group-hover:scale-110 transition-transform" />
            <span className="group-hover:underline underline-offset-2">
              {isAr ? 'المعالم المزارة:' : 'Explored:'}
            </span>
            <span className="font-bold text-[#C8963E] bg-[#4A180E] px-1.5 py-0.5 rounded border border-[#C8963E]/30 group-hover:border-[#C8963E]">
              {visitedCount}/{totalLandmarks}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

