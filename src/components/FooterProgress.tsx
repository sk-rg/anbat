import React from 'react';
import { Language } from '../types';
import {
  Sparkles,
  Compass,
  MapPin,
  MessageSquare,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';

interface FooterProgressProps {
  language: Language;
  activeStep: number;
  onStepSelect: (step: number) => void;
}

export const FooterProgress: React.FC<FooterProgressProps> = ({
  language,
  activeStep,
  onStepSelect
}) => {
  const isAr = language === 'ar';

  const steps = [
    { num: 1, titleEn: 'Open Satchel', titleAr: 'فتح الحقيبة', icon: Sparkles },
    { num: 2, titleEn: 'Meet Guide', titleAr: 'لقاء الدليل', icon: Compass },
    { num: 3, titleEn: 'Explore Map', titleAr: 'خريطة بترا', icon: MapPin },
    { num: 4, titleEn: 'Ask Guide', titleAr: 'سؤال الدليل', icon: MessageSquare },
    { num: 5, titleEn: 'Collect & Share', titleAr: 'الجواز والمشاركة', icon: BookOpen }
  ];

  const percentage = Math.round((activeStep / 5) * 100);
  const currentStepData = steps.find(s => s.num === activeStep) || steps[0];

  return (
    <div
      id="footer-progress-tracker"
      className="bg-[#561E12] border-t border-b border-[#C8963E]/30 px-4 py-5 text-[#F6EEE1]"
    >
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header row: Title, current step name, and dynamic percentage pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C8963E] animate-pulse" />
            <span className="font-bold text-[#E8DCC9]">
              {isAr ? 'مسار الرحلة الاستكشافية:' : 'Journey Exploration Progress:'}
            </span>
            <span className="text-[#C8963E] font-semibold">
              {isAr
                ? `الخطوة ${activeStep} من 5 • ${currentStepData.titleAr}`
                : `Step ${activeStep} of 5 • ${currentStepData.titleEn}`}
            </span>
          </div>

          {/* Dynamic Percentage Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#3D140B] px-3 py-1 rounded-full border border-[#C8963E]/40 text-xs shadow-inner">
              <span className="text-[#E8DCC9]/80 font-medium">
                {isAr ? 'نسبة الإنجاز:' : 'Completion:'}
              </span>
              <span
                id="footer-progress-percentage-text"
                className="font-bold text-[#C8963E] text-sm tabular-nums"
              >
                {percentage}%
              </span>
            </div>

            {/* Quick Step Step-Through Buttons */}
            <div className="flex items-center gap-1">
              <button
                id="btn-footer-prev-step"
                disabled={activeStep <= 1}
                onClick={() => onStepSelect(activeStep - 1)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition cursor-pointer ${
                  activeStep <= 1
                    ? 'opacity-40 cursor-not-allowed text-[#E8DCC9]/40'
                    : 'bg-[#7A2E1D] hover:bg-[#682415] text-[#F6EEE1] border border-[#C8963E]/30'
                }`}
                title={isAr ? 'الخطوة السابقة' : 'Previous Step'}
              >
                <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                <span className="hidden sm:inline">{isAr ? 'السابق' : 'Prev'}</span>
              </button>

              <button
                id="btn-footer-next-step"
                disabled={activeStep >= 5}
                onClick={() => onStepSelect(activeStep + 1)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition cursor-pointer ${
                  activeStep >= 5
                    ? 'opacity-40 cursor-not-allowed text-[#E8DCC9]/40'
                    : 'bg-[#C8963E] hover:bg-[#b8852d] text-[#331C16] font-bold shadow-xs'
                }`}
                title={isAr ? 'الخطوة التالية' : 'Next Step'}
              >
                <span className="hidden sm:inline">{isAr ? 'التالي' : 'Next'}</span>
                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5">
          <div
            className="w-full bg-[#3D140B] h-3 rounded-full overflow-hidden border border-[#C8963E]/30 p-0.5 shadow-inner"
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={isAr ? 'شريط تقدم الخطوات' : 'Step progress bar'}
          >
            <div
              id="footer-progress-bar-fill"
              className="h-full rounded-full bg-gradient-to-r from-[#7A2E1D] via-[#C8963E] to-[#1F6E68] transition-all duration-500 ease-out shadow-xs"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* 5 Interactive Step Nodes with Dynamic States */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2 pt-1">
          {steps.map(st => {
            const StepIcon = st.icon;
            const isActive = activeStep === st.num;
            const isCompleted = activeStep > st.num;

            return (
              <button
                key={st.num}
                id={`footer-step-node-${st.num}`}
                onClick={() => onStepSelect(st.num)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all text-center group cursor-pointer ${
                  isActive
                    ? 'bg-[#C8963E] text-[#331C16] font-bold shadow-md ring-2 ring-[#F6EEE1]/70 scale-[1.02]'
                    : isCompleted
                    ? 'bg-[#7A2E1D]/80 hover:bg-[#7A2E1D] text-[#E8DCC9] border border-[#1F6E68]/60'
                    : 'bg-[#3D140B]/60 hover:bg-[#3D140B] text-[#E8DCC9]/60 border border-[#C8963E]/20'
                }`}
                title={isAr ? `انتقال إلى الخطوة ${st.num}: ${st.titleAr}` : `Go to Step ${st.num}: ${st.titleEn}`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                      isActive
                        ? 'bg-[#7A2E1D] text-[#F6EEE1]'
                        : isCompleted
                        ? 'bg-[#1F6E68] text-white'
                        : 'bg-[#561E12] text-[#E8DCC9]/70 border border-[#C8963E]/30'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3" /> : st.num}
                  </span>
                  <StepIcon
                    className={`w-3.5 h-3.5 hidden md:block shrink-0 ${
                      isActive
                        ? 'text-[#7A2E1D]'
                        : isCompleted
                        ? 'text-[#1F6E68]'
                        : 'text-[#C8963E]/60'
                    }`}
                  />
                </div>
                <span className="text-[10px] sm:text-xs truncate w-full block">
                  {isAr ? st.titleAr : st.titleEn}
                </span>
                <span
                  className={`text-[9px] mt-0.5 font-medium hidden sm:inline ${
                    isActive
                      ? 'text-[#561E12]'
                      : isCompleted
                      ? 'text-[#1F6E68]'
                      : 'text-[#E8DCC9]/40'
                  }`}
                >
                  {isActive
                    ? isAr
                      ? 'الخطوة الحالية'
                      : 'Current'
                    : isCompleted
                    ? isAr
                      ? 'مكتملة ✓'
                      : 'Completed'
                    : `${st.num * 20}%`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
