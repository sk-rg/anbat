/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, VisitorGuideBadge, Landmark, UserSession } from '../types';
import { CREATURES } from '../data/creatures';
import { LANDMARKS } from '../data/landmarks';
import { CreatureSvg } from './CreatureSvg';
import { OfficialNabataeanStamp } from './OfficialNabataeanStamp';
import { NabataeanPassportCover } from './NabataeanPassportCover';
import { SharePassportModal } from './SharePassportModal';
import { playStampSound, playSuccessChime } from '../utils/audio';
import {
  BookOpen,
  Check,
  Copy,
  Share2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  QrCode,
  MapPin,
  Clock,
  Calendar,
  Utensils,
  Award,
  Heart,
  Volume2,
  RotateCcw,
  CheckCircle2,
  Compass,
  Camera,
  ExternalLink,
  Edit3,
  Link as LinkIcon
} from 'lucide-react';

interface PassportBookletProps {
  language: Language;
  activeBadge: VisitorGuideBadge | null;
  visitedLandmarks: string[];
  onOpenSatchel: () => void;
  onExploreMap: () => void;
  onAskGuide: () => void;
  onCheckInLandmark?: (landmark: Landmark) => void;
  userSession?: UserSession | null;
}

export const PassportBooklet: React.FC<PassportBookletProps> = ({
  language,
  activeBadge,
  visitedLandmarks,
  onOpenSatchel,
  onExploreMap,
  onAskGuide,
  onCheckInLandmark,
  userSession
}) => {
  const isAr = language === 'ar';

  const defaultName = userSession
    ? (`${userSession.firstName || ''} ${userSession.lastName || ''}`.trim() || userSession.name)
    : 'هبة خالد المصري / HEBA KHALID AL-MASRI';

  const defaultDish = userSession?.favoriteDish || 'المنسف الكركي الأصيل / MANSAF';

  // Booklet state: 0 = Cover, 1 = Identity & Creature (Pages 01 & 02), 2..6 = Landmarks 1..5
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState<number>(1);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [holderName, setHolderName] = useState<string>(defaultName);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [favFood, setFavFood] = useState<string>(defaultDish);

  useEffect(() => {
    if (userSession) {
      const full = `${userSession.firstName || ''} ${userSession.lastName || ''}`.trim() || userSession.name;
      if (full) setHolderName(full);
      if (userSession.favoriteDish) setFavFood(userSession.favoriteDish);
    }
  }, [userSession]);
  const [justStampedId, setJustStampedId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [targetQrLandmark, setTargetQrLandmark] = useState<Landmark | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [copiedDirectLink, setCopiedDirectLink] = useState<boolean>(false);
  const [bondBonusXp, setBondBonusXp] = useState<number>(0);
  const [creatureReaction, setCreatureReaction] = useState<string | null>(null);

  // Active creature details
  const activeCreature = activeBadge ? CREATURES[activeBadge.creatureId] : CREATURES['falcon'];
  const creatureDisplayName =
    activeBadge?.customName ||
    (activeCreature ? (isAr ? activeCreature.nameAr : activeCreature.nameEn) : 'الصقر البتراوي');

  // Bond Level calculations: Base 3 + visited count + bonus feeds
  const totalVisited = visitedLandmarks.length;
  const baseBondLevel = Math.min(5, Math.max(1, totalVisited + Math.floor(bondBonusXp / 150)));
  const bondPercent = Math.min(100, Math.round((baseBondLevel / 5) * 100));

  // Stamp a landmark with realistic animation and sound
  const handleStampLandmark = (landmark: Landmark) => {
    if (soundEnabled) {
      playStampSound();
      setTimeout(() => playSuccessChime(), 250);
    }

    setJustStampedId(landmark.id);
    setTimeout(() => setJustStampedId(null), 1200);

    if (onCheckInLandmark) {
      onCheckInLandmark(landmark);
    }
  };

  // Perform QR check-in and immediately flip to that landmark's page
  const handleQrCheckIn = (landmark: Landmark) => {
    setIsQrModalOpen(false);
    // Find index for this landmark (landmarks are index 2 to 6)
    const landmarkIdx = LANDMARKS.findIndex(l => l.id === landmark.id);
    if (landmarkIdx !== -1) {
      setCurrentSpreadIndex(landmarkIdx + 2);
    }

    // Trigger stamp
    setTimeout(() => {
      handleStampLandmark(landmark);
    }, 400);
  };

  // Interact with companion creature (pet/feed)
  const handleInteractWithCreature = (type: 'pet' | 'feed') => {
    if (type === 'feed') {
      setBondBonusXp(prev => prev + 50);
      setCreatureReaction(
        isAr ? '😋 استمتع بطعامه المفضل (الدجاج المتبل المشوي)! +50 XP' : '😋 Loved his grilled spiced chicken! +50 XP'
      );
    } else {
      setBondBonusXp(prev => prev + 25);
      setCreatureReaction(
        isAr ? '✨ يشعر بالأمان والترابط الوثيق معك! +25 XP' : '✨ Feels a deep loyal bond with you! +25 XP'
      );
    }
    if (soundEnabled) playSuccessChime();
    setTimeout(() => setCreatureReaction(null), 3500);
  };

  // Direct Passport URL with query param
  const getPassportShareUrl = () => {
    if (typeof window === 'undefined') return '';
    try {
      const u = new URL(window.location.href);
      u.searchParams.set('view', 'passport');
      return u.toString();
    } catch {
      return window.location.href;
    }
  };

  // Quick Copy Direct Link
  const handleCopyDirectLink = async () => {
    const url = getPassportShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedDirectLink(true);
      setTimeout(() => setCopiedDirectLink(false), 2500);
    } catch {
      setIsShareModalOpen(true);
    }
  };

  // Open Full Share Dialog
  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  // Navigation handlers
  const totalSpreads = 7; // 0: Cover, 1: Identity/Creature, 2..6: 5 Landmarks
  const goPrev = () => {
    setCurrentSpreadIndex(prev => Math.max(0, prev - 1));
  };
  const goNext = () => {
    setCurrentSpreadIndex(prev => Math.min(totalSpreads - 1, prev + 1));
  };

  // Current landmark when viewing spreads 2..6
  const currentLandmarkIndex = currentSpreadIndex >= 2 ? currentSpreadIndex - 2 : null;
  const currentLandmark =
    currentLandmarkIndex !== null && currentLandmarkIndex < LANDMARKS.length
      ? LANDMARKS[currentLandmarkIndex]
      : null;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Controls Bar: Sound toggle, Full Index jump, and Status */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 mb-4 bg-[#FAF5ED] border border-[#C8963E]/30 rounded-xl px-4 py-2.5 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7A2E1D] hover:bg-[#561E12] text-[#F6EEE1] text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#C8963E]" />
            <span>{isOpen ? (isAr ? 'إغلاق الدفتر' : 'Close Passport') : (isAr ? 'فتح الدفتر' : 'Open Passport')}</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
              soundEnabled
                ? 'bg-[#E8DCC9] border-[#C8963E] text-[#561E12]'
                : 'bg-stone-200 border-stone-300 text-stone-500'
            }`}
            title={soundEnabled ? 'صوت الختم مفعّل' : 'صوت الختم مكتوم'}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{soundEnabled ? (isAr ? 'صوت الختم: مفعّل' : 'Sound: ON') : (isAr ? 'مكتوم' : 'Muted')}</span>
          </button>
        </div>

        {/* Spread Title Indicator */}
        <div className="text-xs font-semibold text-[#7A2E1D] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C8963E]" />
          <span>
            {currentSpreadIndex === 0 && (isAr ? 'الغلاف الملكي النبطي' : 'Royal Nabataean Cover')}
            {currentSpreadIndex === 1 && (isAr ? 'الصفحات 01-02: التعريف بالمستكشف والمرشد' : 'Pages 01-02: Identity & Companion')}
            {currentSpreadIndex >= 2 && currentLandmark && (
              <>
                {isAr
                  ? `الصفحات 0${(currentSpreadIndex - 1) * 2 + 1}-0${(currentSpreadIndex - 1) * 2 + 2}: ${currentLandmark.nameAr}`
                  : `Pages 0${(currentSpreadIndex - 1) * 2 + 1}-0${(currentSpreadIndex - 1) * 2 + 2}: ${currentLandmark.nameEn}`}
              </>
            )}
          </span>
        </div>

        {/* Global QR Scanner Trigger, Quick Copy Link & Full Share */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTargetQrLandmark(null);
              setIsQrModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C8963E] hover:bg-[#B38230] text-[#331C16] text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{isAr ? 'مسح رمز QR للتختيم' : 'Scan Field QR'}</span>
          </button>

          {/* Quick Copy Link Button */}
          <button
            onClick={handleCopyDirectLink}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 text-xs font-medium transition cursor-pointer"
            title={isAr ? 'نسخ الرابط المباشر للجواز' : 'Copy Direct Passport Link'}
          >
            {copiedDirectLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {copiedDirectLink ? (isAr ? 'تم نسخ الرابط!' : 'Link Copied!') : (isAr ? 'نسخ الرابط' : 'Copy Link')}
            </span>
          </button>

          {/* Full Share Button (Opens Modal with WhatsApp, Twitter, Link) */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7A2E1D] hover:bg-[#9E2A2B] text-white text-xs font-bold transition cursor-pointer shadow-xs"
            title={isAr ? 'مشاركة رابط الجواز عبر التطبيقات' : 'Share Passport Link'}
          >
            <Share2 className="w-3.5 h-3.5 text-[#E5B55E]" />
            <span>{isAr ? 'مشاركة' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Passport Flip Book Shell */}
      <div className="relative w-full max-w-5xl perspective-1000">
        {!isOpen ? (
          /* ========================================================
             CLOSED PASSPORT COVER VIEW (Flip Book Front Cover)
             Matches EXACTLY the Hashemite Nabataean Passport cover photo!
             ======================================================== */
          <div className="w-full flex flex-col items-center">
            <NabataeanPassportCover
              onOpen={() => {
                setIsOpen(true);
                setCurrentSpreadIndex(1);
              }}
              visitedCount={visitedLandmarks.length}
              totalLandmarks={5}
              creatureName={creatureDisplayName}
            />

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsOpen(true);
                  setCurrentSpreadIndex(1);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C8963E] to-[#E5B55E] text-[#331C16] text-xs font-bold tracking-wider uppercase shadow-md hover:brightness-105 transition flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>{isAr ? 'افتح الجواز واستعرض الصفحات 📖' : 'Open Passport Pages 📖'}</span>
              </button>

              <button
                onClick={handleShare}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Share2 className="w-4 h-4 text-[#7A2E1D]" />
                <span>{isAr ? 'مشاركة الرابط' : 'Share Link'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
             OPEN PASSPORT BOOKLET SPREAD (2-Page Book Experience)
             ======================================================== */
          <div className="relative w-full bg-[#EFE6D5] rounded-2xl shadow-2xl border-4 border-[#7A2E1D] overflow-hidden">
            {/* Center Book Spine Crease & Shadow */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-black/15 via-black/5 to-black/15 z-30 pointer-events-none hidden md:block" />

            {/* ======================================================
                SPREAD 0 (Cover & Inside Welcome Decree):
                ====================================================== */}
            {currentSpreadIndex === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-[#C8963E]/30 min-h-[580px] bg-[#FAF5ED]">
                {/* Right Page: Exact Cover Portrait View */}
                <div className="p-4 sm:p-6 flex flex-col items-center justify-center bg-[#FAF5ED] pattern-paper">
                  <NabataeanPassportCover
                    visitedCount={visitedLandmarks.length}
                    totalLandmarks={5}
                    creatureName={creatureDisplayName}
                    className="max-w-[340px]"
                    showButton={false}
                  />
                </div>

                {/* Left Page: Royal Welcome Decree & Instructions */}
                <div className="p-5 sm:p-7 flex flex-col justify-between bg-[#FAF5ED] pattern-paper">
                  <div>
                    <div className="text-center border-b border-[#C8963E]/40 pb-3 mb-4">
                      <p className="text-[10px] font-mono tracking-widest uppercase text-[#C8963E] font-bold">
                        PETRA ARCHAEOLOGICAL PARK • سلطة إقليم البترا
                      </p>
                      <h2 className="text-base sm:text-lg font-heading font-black text-[#561E12] mt-1">
                        {isAr ? 'المرسوم الترحيبي لزوار مملكة الأنباط' : 'Nabataean Royal Welcome Decree'}
                      </h2>
                      <p className="text-[10px] text-[#7A2E1D] font-serif">
                        {isAr ? 'وثيقة دخول وتوثيق مسار البتراء الأثري الذكي' : 'Smart Field Verification & Route Passport'}
                      </p>
                    </div>

                    <div className="space-y-3 text-xs text-[#561E12]/90 leading-relaxed font-serif">
                      <p>
                        {isAr
                          ? 'أهلاً وسهلاً بك في عاصمة الأنباط الوردية، إحدى عجائب الدنيا السبع وموئل الحضارة العربية العريقة المنحوتة في الصخر.'
                          : 'Welcome to the Rose-Red City of the Nabataeans, carved directly into towering sandstone cliffs and world wonder.'}
                      </p>
                      <p>
                        {isAr
                          ? 'يحمل هذا الجواز التفاعلي الذكي سجلاً معتمداً لرحلتك الميدانية، ومستوى ترابطك مع دليلك الأثري ورفيق دربك، إلى جانب سجل الأختام المعتمدة عند زيارة المعالم الخمسة الرئيسية.'
                          : 'This smart passport bears official certification of your expedition, companion creature bond, and automated IoT QR monument visas.'}
                      </p>

                      <div className="p-3 bg-[#EFE6D5] rounded-xl border border-[#C8963E]/40 text-[11px] font-sans space-y-1.5 mt-4">
                        <span className="font-bold text-[#7A2E1D] block">
                          {isAr ? 'إرشادات المستكشف الذكي:' : 'Explorer Guidelines:'}
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-stone-700">
                          <li>{isAr ? 'امسح رموز QR المثبتة عند كل معلم في البتراء للحصول على الختم المعتمد تلقائياً.' : 'Scan QR codes at monuments to gain official visas.'}</li>
                          <li>{isAr ? 'أطعم وداعب رفيقك الأثري في الصفحة 02 لزيادة مستوى الرابط (+XP).' : 'Interact with your companion creature on page 02.'}</li>
                          <li>{isAr ? 'شارك رابط جوازك وسجلك الميداني مع أصدقائك عبر زر المشاركة.' : 'Share your verified passport link with friends.'}</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#C8963E]/30 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#561E12]/60">NO. J-9984112 • OFFICIAL</span>
                    <button
                      onClick={() => setCurrentSpreadIndex(1)}
                      className="px-4 py-2 rounded-xl bg-[#7A2E1D] hover:bg-[#9E2A2B] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span>{isAr ? 'الانتقال لصفحة الهوية (صفحة 01) ➔' : 'Turn to ID Page (Page 01) ➔'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================
                SPREAD 1 (Pages 01 & 02): Identity & Companion Creature
                Matching EXACTLY user's blueprint image (image.png)!
                ====================================================== */}
            {currentSpreadIndex === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-[#C8963E]/30 min-h-[580px] bg-[#FAF5ED]">
                {/* ----------------------------------------------------
                    RIGHT PAGE (Page 01 in user image): IDENTIFICATION PAGE
                    وثيقة التعريف / صفحة التعريف
                    ---------------------------------------------------- */}
                <div className="p-5 sm:p-7 flex flex-col justify-between relative bg-[#FAF5ED] pattern-paper">
                  {/* Watermark Logo */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <img src="/assets/official-stamp.jpg" alt="" className="w-80 h-80 object-contain" />
                  </div>

                  {/* Top Header */}
                  <div>
                    <div className="text-center border-b border-[#C8963E]/40 pb-2 mb-4">
                      <p className="text-[10px] sm:text-xs font-serif font-bold text-[#7A2E1D] tracking-widest uppercase">
                        THE HASHEMITE KINGDOM OF JORDAN - المملكة الأردنية الهاشمية
                      </p>
                      <h2 className="text-sm sm:text-base font-heading font-black text-[#561E12] mt-0.5">
                        PETRA ARCHAEOLOGICAL PARK - ANBAT PASSPORT
                      </h2>
                      <p className="text-[9px] sm:text-[10px] font-mono text-[#C8963E] mt-0.5">
                        وثيقة التعريف المعتمدة / IDENTIFICATION PAGE
                      </p>
                    </div>

                    {/* Holder Grid: Photo on one side, Personal details on other */}
                    <div className="grid grid-cols-3 gap-3 items-start">
                      {/* Personal Data Fields (2 Cols) */}
                      <div className="col-span-2 space-y-2 text-xs">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase tracking-wider text-[#561E12]/60 font-semibold">
                              PASSPORT HOLDER NAME / اسم صاحب الجواز
                            </span>
                            <button
                              onClick={() => setIsEditingName(!isEditingName)}
                              className="text-[9px] text-[#C8963E] hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <Edit3 className="w-2.5 h-2.5" />
                              <span>{isAr ? 'تعديل' : 'Edit'}</span>
                            </button>
                          </div>
                          {isEditingName ? (
                            <div className="flex items-center gap-1 mt-0.5">
                              <input
                                type="text"
                                value={holderName}
                                onChange={(e) => setHolderName(e.target.value)}
                                className="w-full text-xs font-bold text-[#561E12] bg-white border border-[#C8963E] rounded px-1.5 py-0.5"
                              />
                              <button
                                onClick={() => setIsEditingName(false)}
                                className="bg-[#7A2E1D] text-white text-[10px] px-2 py-0.5 rounded"
                              >
                                حفظ
                              </button>
                            </div>
                          ) : (
                            <p className="font-heading font-bold text-[#561E12] text-xs sm:text-sm tracking-wide">
                              {holderName}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                          <div>
                            <span className="text-[8px] text-[#561E12]/60 uppercase block">
                              {userSession?.age ? (isAr ? 'AGE / العمر' : 'AGE / DATE OF BIRTH') : 'DATE OF BIRTH / تاريخ الميلاد'}
                            </span>
                            <p className="font-mono font-bold text-[#561E12]">
                              {userSession?.age
                                ? `${userSession.age} ${isAr ? 'سنة' : 'YRS'} (${2026 - Number(userSession.age || 25)})`
                                : '01/01/1998'}
                            </p>
                          </div>
                          <div>
                            <span className="text-[8px] text-[#561E12]/60 uppercase block">TYPE / النوع</span>
                            <p className="font-mono font-bold text-[#561E12]">J-9984112 ({isAr ? 'مستكشف' : 'EXPLORER'})</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                          <div>
                            <span className="text-[8px] text-[#561E12]/60 uppercase block">COUNTRY / البلد</span>
                            <p className="font-bold text-[#561E12] uppercase truncate" title={userSession?.country || 'JORDAN'}>
                              {userSession?.country || (isAr ? 'الأردن / JORDAN' : 'JORDAN')}
                            </p>
                          </div>
                          <div>
                            <span className="text-[8px] text-[#561E12]/60 uppercase block">AUTHORITY / السلطة</span>
                            <p className="font-bold text-[#561E12] text-[9px] leading-tight">PETRA PARK</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                          <div>
                            <span className="text-[8px] text-[#561E12]/60 uppercase block">DATE OF ISSUE / تاريخ الإصدار</span>
                            <p className="font-mono font-bold text-[#561E12]">2026/09/22</p>
                          </div>
                          <div>
                            <span className="text-[8px] text-[#561E12]/60 uppercase block">STATUS / الحالة</span>
                            <p className="font-mono font-bold text-emerald-800">{isAr ? 'معتمد رسمياً' : 'ACTIVE / VERIFIED'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Photo Frame (1 Col) matching user's passport holder photo */}
                      <div className="col-span-1 flex flex-col items-center">
                        <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-lg border-2 border-[#C8963E] p-1 bg-white shadow-md relative overflow-hidden group">
                          <img
                            src={userSession?.photoUrl || '/assets/explorer-portrait.jpg'}
                            alt="Passport Holder"
                            className="w-full h-full object-cover rounded"
                          />
                          <div className="absolute inset-0 bg-[#C8963E]/10 pointer-events-none" />
                        </div>
                        <span className="text-[8px] text-[#561E12]/60 font-mono mt-1 text-center">
                          {isAr ? 'صورة صاحب الجواز' : 'HOLDER PHOTO'}
                        </span>
                      </div>
                    </div>

                    {/* Dedicated Favourite Food Section (الأكلة المفضلة) matching user image */}
                    <div className="mt-4 p-2.5 rounded-xl bg-[#EFE6D5] border border-[#C8963E]/40 flex items-center justify-between shadow-inner">
                      <div>
                        <span className="text-[9px] text-[#7A2E1D] font-bold uppercase tracking-wider block">
                          FAVOURITE FOOD / الأكلة المفضلة
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="font-heading font-black text-sm text-[#561E12]">
                            {favFood}
                          </p>
                        </div>
                        <span className="text-[9px] text-[#561E12]/70">
                          {isAr ? 'طبق أردني تراثي مسجل ضمن بيانات المستكشف' : 'Traditional Jordanian dish linked to explorer profile'}
                        </span>
                      </div>

                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#C8963E] overflow-hidden shadow-xs shrink-0 bg-white">
                        <img
                          src="/assets/fav-food.jpg"
                          alt="Favourite Dish"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* MRZ Machine Readable Zone at bottom of Page 01 */}
                  <div className="mt-4 pt-2 border-t border-dashed border-[#C8963E]/40">
                    <div className="bg-[#EAE0CD]/70 rounded p-1.5 font-mono text-[9px] sm:text-[10px] text-[#561E12]/80 leading-relaxed tracking-wider break-all select-all">
                      P&lt;JORALMASRI&lt;&lt;HEBA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br />
                      BA84.15&lt;428801046020289161&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-[#561E12]/50 font-mono mt-1 px-1">
                      <span>OFFICIAL DIGITAL BIOMETRIC PASSPORT</span>
                      <span className="font-bold text-[#7A2E1D]">PAGE 01 / صفحة 01</span>
                    </div>
                  </div>
                </div>

                {/* ----------------------------------------------------
                    LEFT PAGE (Page 02 in user image): COMPANION CREATURE
                    المخلوق المساعد / المرشد
                    ---------------------------------------------------- */}
                <div className="p-5 sm:p-7 flex flex-col justify-between relative bg-[#FAF5ED] pattern-paper">
                  {/* Top Header */}
                  <div>
                    <div className="text-center border-b border-[#C8963E]/40 pb-2 mb-4">
                      <p className="text-[10px] sm:text-xs font-serif font-bold text-[#7A2E1D] tracking-widest uppercase">
                        المخلوق المساعد / COMPANION CREATURE
                      </p>
                      <h2 className="text-sm sm:text-base font-heading font-black text-[#561E12] mt-0.5">
                        PETRA ANCIENT FAUNA GUARDIAN
                      </h2>
                      <p className="text-[9px] sm:text-[10px] font-mono text-[#C8963E] mt-0.5">
                        سجل الترويض والترابط الأثري / CREATURE BOND PROFILE
                      </p>
                    </div>

                    {/* Creature Profile Grid */}
                    <div className="grid grid-cols-3 gap-3 items-start">
                      {/* Creature Portrait Frame (1 Col) */}
                      <div className="col-span-1 flex flex-col items-center">
                        <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-lg border-2 border-[#C8963E] p-1 bg-amber-50/50 shadow-md relative overflow-hidden flex items-center justify-center">
                          <CreatureSvg
                            type={(activeCreature?.id && ['camel', 'falcon', 'ibex', 'scorpion'].includes(activeCreature.id)) ? (activeCreature.id as 'camel' | 'falcon' | 'ibex' | 'scorpion') : 'falcon'}
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute top-1 right-1 bg-[#C8963E] text-white text-[8px] font-bold px-1 rounded">
                            {activeCreature?.rarity || 'Very Rare'}
                          </div>
                        </div>
                        <span className="text-[8px] text-[#561E12]/60 font-mono mt-1 text-center">
                          صورة المخلوق / PHOTO
                        </span>
                      </div>

                      {/* Creature Details (2 Cols) matching image.png */}
                      <div className="col-span-2 space-y-2 text-xs">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-[#561E12]/60 font-semibold block">
                            CREATURE NAME / اسم المخلوق
                          </span>
                          <p className="font-heading font-black text-[#561E12] text-sm sm:text-base">
                            {creatureDisplayName}
                          </p>
                        </div>

                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-[#561E12]/60 font-semibold block">
                            SPECIES / النوع
                          </span>
                          <p className="font-bold text-[#561E12] text-xs">
                            {isAr ? 'الصقر (صقر الأعالي)' : 'Falcon (High Peak Falcon)'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                          <div>
                            <span className="text-[8px] text-[#561E12]/60 uppercase block">HABITAT / موطن</span>
                            <p className="font-bold text-[#561E12] text-[10px]">{isAr ? 'جبال البتراء' : 'Petra Mountains'}</p>
                          </div>
                          <div>
                            <span className="text-[8px] text-[#561E12]/60 uppercase block">RARITY / الندرة</span>
                            <p className="font-bold text-[#7A2E1D] text-[10px]">{isAr ? 'نادر جداً' : 'Very Rare'}</p>
                          </div>
                        </div>

                        <div className="text-[10px]">
                          <span className="text-[8px] text-[#561E12]/60 uppercase block">DATE TAMED / تاريخ الترويض</span>
                          <p className="font-mono font-bold text-[#561E12]">2026/9/21</p>
                        </div>
                      </div>
                    </div>

                    {/* Dedicated Favourite Food of Creature */}
                    <div className="mt-3 p-2 rounded-xl bg-[#EFE6D5] border border-[#C8963E]/40 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[8px] text-[#7A2E1D] font-bold uppercase block">
                          FAVOURITE FOOD / طعامه المفضل
                        </span>
                        <p className="font-bold text-[#561E12] text-xs mt-0.5">
                          {isAr ? 'دجاج متبل مشوي' : 'GRILLED SPICED CHICKEN'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl">🍗</span>
                        <button
                          onClick={() => handleInteractWithCreature('feed')}
                          className="px-2 py-1 bg-[#C8963E] hover:bg-[#B38230] text-[#331C16] text-[10px] font-bold rounded shadow-xs cursor-pointer transition"
                        >
                          {isAr ? 'إطعام 🍗' : 'Feed'}
                        </button>
                      </div>
                    </div>

                    {/* Interactive Bond Level Bar matching image.png */}
                    <div className="mt-3 p-2.5 rounded-xl bg-white/70 border border-[#C8963E]/40 shadow-xs">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-[#7A2E1D] flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-[#7A2E1D] text-[#7A2E1D]" />
                          <span>{isAr ? 'مستوى الرابط' : 'BOND LEVEL'}</span>
                        </span>
                        <span className="font-mono font-bold text-[#561E12] text-[11px]">
                          ({bondPercent}%) {baseBondLevel}/5
                        </span>
                      </div>
                      {/* Progress Track */}
                      <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-[#C8963E] to-[#7A2E1D] rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${bondPercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-[#561E12]/70 mt-1">
                        <span>{isAr ? 'يزداد بزيارة المعالم ومسح الأكواد' : 'Increases with landmark visits & QR scans'}</span>
                        <button
                          onClick={() => handleInteractWithCreature('pet')}
                          className="text-[#C8963E] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{isAr ? 'مداعبة المرشد (+25 XP)' : 'Pet (+25 XP)'}</span>
                        </button>
                      </div>

                      {/* Feedback reaction toast */}
                      {creatureReaction && (
                        <div className="mt-1.5 p-1 bg-amber-100 border border-amber-300 rounded text-center text-[10px] font-bold text-[#561E12] animate-in fade-in duration-200">
                          {creatureReaction}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mini Stamps Badges at bottom of Page 02 matching image.png */}
                  <div className="mt-4 pt-2 border-t border-dashed border-[#C8963E]/40">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Treasury Mini Stamp */}
                      <div className="p-1.5 rounded-lg border border-[#C8963E]/50 bg-[#EAE0CD]/40 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border border-[#9E2A2B] flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-[#9E2A2B]">🏛️</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-[#561E12]/60 uppercase block">صورة المعلم</span>
                          <span className="text-[10px] font-bold text-[#7A2E1D]">Treasury Stamp</span>
                        </div>
                      </div>

                      {/* High Place Mini Stamp */}
                      <div className="p-1.5 rounded-lg border border-[#C8963E]/50 bg-[#EAE0CD]/40 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border border-[#C8963E] flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-[#C8963E]">⛰️</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-[#561E12]/60 uppercase block">صورة المعلم</span>
                          <span className="text-[10px] font-bold text-[#7A2E1D]">High Place Stamp</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-[#561E12]/50 font-mono mt-2 px-1">
                      <span>BONDED EXPLORER COMPANION REGISTRY</span>
                      <span className="font-bold text-[#7A2E1D]">PAGE 02 / صفحة 02</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================
                SPREADS 2 to 6 (Pages 03 to 12): LANDMARK DOUBLE-PAGE SPREADS
                Left Page: High-Res Monument Photo & Exploration Story
                Right Page: Official Visit Ledger & Dynamic Stamp Canvas
                ====================================================== */}
            {currentSpreadIndex >= 2 && currentLandmark && (
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-[#C8963E]/30 min-h-[580px] bg-[#FAF5ED]">
                {/* ----------------------------------------------------
                    LEFT PAGE: MONUMENT PHOTOGRAPHY & EXPLORATION CHRONICLE
                    صورة المعلم ونبذة الاستكشاف
                    ---------------------------------------------------- */}
                <div className="p-5 sm:p-7 flex flex-col justify-between relative bg-[#FAF5ED] pattern-paper">
                  {/* Top Header */}
                  <div>
                    <div className="flex items-center justify-between border-b border-[#C8963E]/40 pb-2 mb-3">
                      <div>
                        <span className="text-[9px] font-mono text-[#C8963E] uppercase font-bold">
                          PETRA MONUMENT #{currentLandmark.routeOrder}
                        </span>
                        <h2 className="text-base sm:text-lg font-heading font-black text-[#561E12]">
                          {isAr ? currentLandmark.nameAr : currentLandmark.nameEn}
                        </h2>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#7A2E1D] text-white text-[10px] font-bold">
                        {isAr ? `المعلم ${currentLandmark.routeOrder} من 5` : `Stop ${currentLandmark.routeOrder} of 5`}
                      </span>
                    </div>

                    {/* High-Resolution Photograph with ancient frame */}
                    <div className="relative rounded-xl overflow-hidden border-2 border-[#C8963E] shadow-md group">
                      <img
                        src={currentLandmark.thumbnailUrl}
                        alt={currentLandmark.nameEn}
                        className="w-full h-44 sm:h-52 object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-white text-xs flex items-center justify-between">
                        <span className="font-heading font-bold text-shadow">
                          {isAr ? currentLandmark.subtitleAr : currentLandmark.subtitleEn}
                        </span>
                        <span className="text-[10px] font-mono bg-[#7A2E1D]/80 px-2 py-0.5 rounded backdrop-blur-xs">
                          {currentLandmark.id === 'siq' && '1.2 km'}
                          {currentLandmark.id === 'treasury' && '39.5m'}
                          {currentLandmark.id === 'facades' && '40 tombs'}
                          {currentLandmark.id === 'theatre' && '8,000 seats'}
                          {currentLandmark.id === 'monastery' && '48m high'}
                        </span>
                      </div>
                    </div>

                    {/* Curated Explorer Chronicle */}
                    <div className="mt-3 p-3 rounded-xl bg-[#EFE6D5]/80 border border-[#C8963E]/30 text-xs text-[#561E12] leading-relaxed">
                      <p className="font-serif">
                        {isAr ? currentLandmark.curatedStoryAr : currentLandmark.curatedStoryEn}
                      </p>
                    </div>

                    {/* Architectural Specifications Card */}
                    <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-[#561E12]">
                      <div className="p-1.5 rounded bg-white/70 border border-[#C8963E]/20">
                        <span className="text-[8px] text-[#561E12]/60 uppercase block">{isAr ? 'الفترة التاريخية' : 'Era'}</span>
                        <span className="font-bold">{isAr ? 'القرن الأول ق.م - الأول م' : '1st c. BC - 1st c. AD'}</span>
                      </div>
                      <div className="p-1.5 rounded bg-white/70 border border-[#C8963E]/20">
                        <span className="text-[8px] text-[#561E12]/60 uppercase block">{isAr ? 'الإحداثيات النبطية' : 'Coords'}</span>
                        <span className="font-mono font-bold">{currentLandmark.svgCoordinates.x}°E, {currentLandmark.svgCoordinates.y}°N</span>
                      </div>
                    </div>
                  </div>

                  {/* Ask Companion Trigger */}
                  <div className="mt-3 pt-2 border-t border-dashed border-[#C8963E]/40 flex items-center justify-between">
                    <button
                      onClick={onAskGuide}
                      className="text-xs text-[#7A2E1D] hover:text-[#561E12] font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C8963E]" />
                      <span>{isAr ? 'اسأل المرشد النبطي عن هذا المكان' : 'Ask Guide about this site'}</span>
                    </button>
                    <span className="text-[9px] font-mono text-[#561E12]/50">
                      PAGE 0{(currentSpreadIndex - 1) * 2 + 1}
                    </span>
                  </div>
                </div>

                {/* ----------------------------------------------------
                    RIGHT PAGE: OFFICIAL VISIT RECORD & DYNAMIC STAMP
                    سجل وبيانات الزيارة والأختام الذكية
                    ---------------------------------------------------- */}
                <div className="p-5 sm:p-7 flex flex-col justify-between relative bg-[#FAF5ED] pattern-paper">
                  {/* Top Header */}
                  <div>
                    <div className="text-center border-b border-[#C8963E]/40 pb-2 mb-3">
                      <p className="text-[10px] sm:text-xs font-serif font-bold text-[#7A2E1D] tracking-widest uppercase">
                        المملكة الأردنية الهاشمية • سلطة إقليم البترا
                      </p>
                      <h2 className="text-sm sm:text-base font-heading font-black text-[#561E12] mt-0.5">
                        OFFICIAL VISIT VISA & FIELD VERIFICATION
                      </h2>
                      <p className="text-[9px] font-mono text-[#C8963E] mt-0.5">
                        سجل التوثيق الميداني والختم الرسمي / SITE LEDGER
                      </p>
                    </div>

                    {/* Automated Visit Ledger Form */}
                    <div className="bg-[#EFE6D5] p-3 rounded-xl border border-[#C8963E]/40 space-y-2 text-xs mb-4 shadow-inner">
                      <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                        <div>
                          <span className="text-[8px] text-[#561E12]/60 uppercase block flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>تاريخ الزيارة / VISIT DATE</span>
                          </span>
                          <p className="font-mono font-bold text-[#561E12]">
                            {visitedLandmarks.includes(currentLandmark.id) ? '2026/09/21' : (isAr ? 'بانتظار الزيارة' : 'Awaiting Visit')}
                          </p>
                        </div>
                        <div>
                          <span className="text-[8px] text-[#561E12]/60 uppercase block flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>ساعة الوصول / ARRIVAL TIME</span>
                          </span>
                          <p className="font-mono font-bold text-[#561E12]">
                            {visitedLandmarks.includes(currentLandmark.id) ? '14:27 LOCAL' : '--:--'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs pt-1 border-t border-[#C8963E]/20">
                        <div>
                          <span className="text-[8px] text-[#561E12]/60 uppercase block">VISA SERIAL / رقم الختم</span>
                          <p className="font-mono font-bold text-[#7A2E1D] text-[10px]">
                            JOR-PETRA-0{currentLandmark.routeOrder}-{currentLandmark.id.toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <span className="text-[8px] text-[#561E12]/60 uppercase block">STATUS / حالة التوثيق</span>
                          <p className="font-bold flex items-center gap-1 text-[10px]">
                            {visitedLandmarks.includes(currentLandmark.id) ? (
                              <span className="text-emerald-700 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{isAr ? 'معتمد ومختوم' : 'Verified'}</span>
                              </span>
                            ) : (
                              <span className="text-amber-800 flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                <span>{isAr ? 'غير مختوم بعد' : 'Not Visited'}</span>
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                        THE DYNAMIC STAMP AREA (مساحة الختم الديناميكي)
                        ================================================= */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed border-[#C8963E]/50 bg-white/40 min-h-[200px] relative">
                      {visitedLandmarks.includes(currentLandmark.id) ? (
                        /* VISITED: Display Official Circular Stamp from user's image! */
                        <div className="flex flex-col items-center">
                          <OfficialNabataeanStamp
                            landmarkNameAr={currentLandmark.nameAr}
                            landmarkNameEn={currentLandmark.nameEn}
                            size="lg"
                            rotationDeg={justStampedId === currentLandmark.id ? 0 : -3}
                            isAnimated={justStampedId === currentLandmark.id}
                          />

                          <div className="mt-2 text-center">
                            <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                              ✓ {isAr ? 'مختوم ومصادق رسمياً' : 'OFFICIALLY STAMPED & VERIFIED'}
                            </span>
                            <p className="text-[8px] text-[#561E12]/60 font-mono mt-0.5">
                              {isAr ? 'منح +150 XP لرابط المخلوق المرشد' : '+150 Bond XP Awarded to Guide'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* NOT VISITED: Placeholder with direct QR Scan button */
                        <div className="text-center p-4 flex flex-col items-center">
                          <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#C8963E]/60 flex items-center justify-center mb-3 bg-[#FAF5ED]">
                            <QrCode className="w-10 h-10 text-[#C8963E]/60 animate-pulse" />
                          </div>

                          <h3 className="font-heading font-bold text-xs sm:text-sm text-[#7A2E1D]">
                            {isAr ? 'بانتظار الختم الرسمي للموقع' : 'Awaiting Official Monument Stamp'}
                          </h3>
                          <p className="text-[10px] text-[#561E12]/70 max-w-xs mt-1 mb-3">
                            {isAr
                              ? 'امسح رمز QR Code في الموقع الميداني لطباعة الختم النبطي تلقائياً وزيادة مستوى الترابط!'
                              : 'Scan the field QR code to auto-stamp this page and raise creature bond level!'}
                          </p>

                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setTargetQrLandmark(currentLandmark);
                                setIsQrModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#7A2E1D] hover:bg-[#561E12] text-[#F6EEE1] text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5 text-[#C8963E]" />
                              <span>{isAr ? 'مسح QR المعلم للتختيم' : 'Scan Monument QR'}</span>
                            </button>

                            <button
                              onClick={() => handleStampLandmark(currentLandmark)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#C8963E]/20 hover:bg-[#C8963E]/40 border border-[#C8963E] text-[#561E12] text-xs font-bold transition cursor-pointer flex items-center gap-1"
                              title="تختيم فوري للتجربة"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#C8963E]" />
                              <span>{isAr ? 'ختم تجريبي سريع ⚡' : 'Demo Stamp ⚡'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Page Footer */}
                  <div className="mt-3 pt-2 border-t border-dashed border-[#C8963E]/40 flex items-center justify-between">
                    <span className="text-[9px] text-[#561E12]/60 font-mono">
                      PETRA ARCHAEOLOGICAL PARK AUTHORITY
                    </span>
                    <span className="text-[9px] font-mono text-[#561E12]/50">
                      PAGE 0{(currentSpreadIndex - 1) * 2 + 2}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                BOOKLET BOTTOM NAVIGATION & SPREAD SELECTOR TABS
                ======================================================== */}
            <div className="bg-[#561E12] text-[#F6EEE1] border-t-2 border-[#C8963E]/50 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
              {/* Previous Spread Button */}
              <button
                onClick={goPrev}
                disabled={currentSpreadIndex === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#7A2E1D] hover:bg-[#9E2A2B] disabled:opacity-30 disabled:pointer-events-none text-xs font-bold transition cursor-pointer shadow-xs"
              >
                {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                <span>{isAr ? 'الصفحات السابقة' : 'Previous Pages'}</span>
              </button>

              {/* Fast Jump Index Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
                <button
                  onClick={() => setCurrentSpreadIndex(0)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer shrink-0 ${
                    currentSpreadIndex === 0
                      ? 'bg-[#C8963E] text-[#331C16]'
                      : 'bg-[#40150B] text-[#E8DCC9]/70 hover:text-white'
                  }`}
                >
                  {isAr ? 'الغلاف' : 'Cover'}
                </button>

                <button
                  onClick={() => setCurrentSpreadIndex(1)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer shrink-0 ${
                    currentSpreadIndex === 1
                      ? 'bg-[#C8963E] text-[#331C16]'
                      : 'bg-[#40150B] text-[#E8DCC9]/70 hover:text-white'
                  }`}
                >
                  {isAr ? 'الهوية والمخلوق (1-2)' : 'ID & Creature (1-2)'}
                </button>

                {LANDMARKS.map((lm, idx) => {
                  const isVisited = visitedLandmarks.includes(lm.id);
                  const spreadNum = idx + 2;
                  return (
                    <button
                      key={lm.id}
                      onClick={() => setCurrentSpreadIndex(spreadNum)}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
                        currentSpreadIndex === spreadNum
                          ? 'bg-[#C8963E] text-[#331C16]'
                          : isVisited
                          ? 'bg-[#7A2E1D] text-[#E8DCC9] border border-[#C8963E]/40'
                          : 'bg-[#40150B] text-[#E8DCC9]/60 hover:text-white'
                      }`}
                    >
                      <span>{isAr ? lm.nameAr.split(' ')[0] : lm.id.toUpperCase()}</span>
                      {isVisited && <span className="text-[10px] text-amber-300">★</span>}
                    </button>
                  );
                })}
              </div>

              {/* Next Spread Button */}
              <button
                onClick={goNext}
                disabled={currentSpreadIndex === totalSpreads - 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#7A2E1D] hover:bg-[#9E2A2B] disabled:opacity-30 disabled:pointer-events-none text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <span>{isAr ? 'الصفحات التالية' : 'Next Pages'}</span>
                {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          INTERACTIVE FIELD QR CODE MODAL (Live IoT Simulator & Scan)
          ============================================================ */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF5ED] rounded-2xl border-2 border-[#C8963E] p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#7A2E1D] text-[#FAF5ED] flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#7A2E1D]">
                {isAr ? 'مسح رمز الاستجابة السريعة الميداني (QR Code)' : 'Field QR Code Scanner & IoT Simulator'}
              </h3>
            </div>

            <p className="text-xs text-[#561E12]/80 mb-4">
              {isAr
                ? 'عند وصولك لأي معلم أثري في البتراء، قم بمسح الرمز الميداني المثبت في الموقع ليتم تختيم جواز سفرك فوراً!'
                : 'When reaching any archaeological landmark in Petra, scan the field QR code to auto-stamp your passport instantly!'}
            </p>

            {/* Landmark QR Selector Grid */}
            <div className="space-y-2 mb-4">
              <span className="text-[10px] uppercase font-bold text-[#561E12]/70 block">
                {isAr ? 'اختر معلماً لمحاكاة المسح الميداني الفوري:' : 'Select a monument to simulate live scanning:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {LANDMARKS.map(lm => {
                  const isVisited = visitedLandmarks.includes(lm.id);
                  return (
                    <button
                      key={lm.id}
                      onClick={() => handleQrCheckIn(lm)}
                      className="p-2.5 rounded-xl border border-[#C8963E]/40 bg-white hover:bg-amber-50 text-start flex items-center justify-between gap-2 transition cursor-pointer shadow-2xs group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#FAF5ED] border border-[#C8963E]/30 flex items-center justify-center shrink-0">
                          <QrCode className="w-4 h-4 text-[#7A2E1D]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#561E12] group-hover:text-[#7A2E1D]">
                            {isAr ? lm.nameAr : lm.nameEn}
                          </p>
                          <span className="text-[9px] font-mono text-stone-500">
                            anbat:landmark:{lm.id}
                          </span>
                        </div>
                      </div>

                      {isVisited ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="text-[10px] font-bold text-[#C8963E] group-hover:underline shrink-0">
                          {isAr ? 'مسح 📷' : 'Scan'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#EFE6D5] p-3 rounded-xl border border-[#C8963E]/30 text-[11px] text-[#561E12] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C8963E]" />
                <span>{isAr ? 'التختيم الآلي يمنح +150 XP للترابط مع المرشد' : 'Auto-stamping grants +150 XP creature bond'}</span>
              </span>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="px-3 py-1 bg-[#7A2E1D] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SHARE PASSPORT MODAL (Direct Link, WhatsApp, X, Native)
          ============================================================ */}
      <SharePassportModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        language={language}
        visitedCount={visitedLandmarks.length}
        totalLandmarks={LANDMARKS.length}
        creatureName={creatureDisplayName}
      />
    </div>
  );
};
