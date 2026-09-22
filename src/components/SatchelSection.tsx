/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Creature, Language, TimeOfDay, VisitorGuideBadge } from '../types';
import { CREATURES, calculateCreatureReveal } from '../data/creatures';
import { LANDMARKS } from '../data/landmarks';
import { CreatureSvg } from './CreatureSvg';
import { storageService } from '../services/storageService';
import {
  Sparkles,
  Award,
  Share2,
  Download,
  Copy,
  Check,
  Lock,
  Unlock,
  Info,
  Clock,
  MapPin
} from 'lucide-react';

interface SatchelSectionProps {
  language: Language;
  visitedLandmarks: string[];
  activeBadge: VisitorGuideBadge | null;
  currentStep?: number;
  onBadgeCreated: (badge: VisitorGuideBadge) => void;
  onProceedToMap: () => void;
  onProceedToChat: () => void;
}

export const SatchelSection: React.FC<SatchelSectionProps> = ({
  language,
  visitedLandmarks,
  activeBadge,
  currentStep = 1,
  onBadgeCreated,
  onProceedToMap,
  onProceedToChat
}) => {
  const isAr = language === 'ar';
  const isStep2 = currentStep === 2;
  const allLandmarksVisited = visitedLandmarks.length >= LANDMARKS.length;

  // Configuration for deterministic reveal
  const [startingLandmark, setStartingLandmark] = useState<string>(LANDMARKS[0].id);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('Morning');
  const [customRoll, setCustomRoll] = useState<number>(45);

  // Animation and state
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedCreature, setRevealedCreature] = useState<Creature | null>(
    activeBadge ? CREATURES[activeBadge.creatureId] || null : null
  );
  const [explainableMath, setExplainableMath] = useState<string>(
    activeBadge ? activeBadge.explainableFormula : ''
  );
  const [creatureName, setCreatureName] = useState<string>(
    activeBadge ? activeBadge.customName : ''
  );
  const [copiedShare, setCopiedShare] = useState(false);
  const [isGeneratingBadge, setIsGeneratingBadge] = useState(false);

  // Hidden canvas for generating downloadable passport badge image
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Execute reveal
  const handleOpenSatchel = () => {
    setIsRevealing(true);
    setRevealedCreature(null);

    // Simulate short dramatic opening animation
    setTimeout(() => {
      const result = calculateCreatureReveal(
        startingLandmark,
        timeOfDay,
        customRoll,
        allLandmarksVisited
      );

      setRevealedCreature(result.creature);
      setExplainableMath(result.explainableFormula);

      // Default customized name
      const defaultName = isAr
        ? `${result.creature.nameAr.split(' ')[0]} البتراوي`
        : `Companion ${result.creature.nameEn.split(' ')[0]}`;
      setCreatureName(defaultName);

      // Auto save badge
      const newBadge: VisitorGuideBadge = {
        creatureId: result.creature.id,
        customName: defaultName,
        unlockedAt: new Date().toISOString(),
        startingLandmarkId: startingLandmark,
        timeOfDay,
        rarityRoll: result.roll,
        explainableFormula: result.explainableFormula
      };
      storageService.saveVisitorBadge(newBadge);
      onBadgeCreated(newBadge);

      setIsRevealing(false);
    }, 900);
  };

  // Update creature name
  const handleSaveCustomName = (newName: string) => {
    setCreatureName(newName);
    if (activeBadge && revealedCreature) {
      const updated: VisitorGuideBadge = {
        ...activeBadge,
        customName: newName.trim() || activeBadge.customName
      };
      storageService.saveVisitorBadge(updated);
      onBadgeCreated(updated);
    }
  };

  // Copy share text
  const handleCopyShare = () => {
    if (!revealedCreature) return;
    const currentName = creatureName || revealedCreature.nameEn;
    const shareText = isAr
      ? `🏛️ لقد فتحت حقيبة بترا النبطية وحصلت على رفيقي: ${currentName} (${revealedCreature.nameAr}) برتبة [${revealedCreature.rarity}]! استكشف بترا مع #ANBAT_Petra #بترا #Jordan`
      : `🏛️ I opened my Nabataean Satchel at Petra and unlocked my AI companion: ${currentName} (${revealedCreature.nameEn}) [${revealedCreature.rarity}]! Explore Petra with #ANBAT_Petra #Petra #VisitJordan`;

    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  // Download Badge as high-resolution PNG using HTML5 canvas
  const handleDownloadBadge = () => {
    if (!revealedCreature || !canvasRef.current) return;
    setIsGeneratingBadge(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set resolution (600x800 for a passport card)
    canvas.width = 600;
    canvas.height = 780;

    // Background sandstone gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, 780);
    bgGradient.addColorStop(0, '#7A2E1D');
    bgGradient.addColorStop(0.3, '#933D2A');
    bgGradient.addColorStop(0.8, '#561E12');
    bgGradient.addColorStop(1, '#331C16');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 600, 780);

    // Outer decorative border
    ctx.strokeStyle = '#C8963E';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 560, 740);

    ctx.strokeStyle = '#F6EEE1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(28, 28, 544, 724);

    // Inner card body
    ctx.fillStyle = '#F6EEE1';
    ctx.fillRect(40, 140, 520, 590);

    // Top Title in Terracotta banner
    ctx.fillStyle = '#C8963E';
    ctx.font = 'bold 26px serif';
    ctx.textAlign = 'center';
    ctx.fillText('ANBAT • NABATAEAN PASSPORT', 300, 75);

    ctx.fillStyle = '#E8DCC9';
    ctx.font = '15px sans-serif';
    ctx.fillText('OFFICIAL PETRA VISITOR COMPANION BADGE', 300, 105);

    // Creature Artwork Frame
    ctx.fillStyle = '#E8DCC9';
    ctx.beginPath();
    ctx.arc(300, 250, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#C8963E';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Emoji icon in center
    ctx.font = '72px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(revealedCreature.icon, 300, 275);

    // Rarity Pill
    ctx.fillStyle =
      revealedCreature.rarity === 'Legendary'
        ? '#C8963E'
        : revealedCreature.rarity === 'Rare'
        ? '#1F6E68'
        : '#7A2E1D';
    ctx.fillRect(210, 350, 180, 34);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`${revealedCreature.rarity.toUpperCase()} GUIDE`, 300, 373);

    // Custom Name
    ctx.fillStyle = '#331C16';
    ctx.font = 'bold 28px serif';
    ctx.fillText(creatureName || revealedCreature.nameEn, 300, 425);

    // Native Name & Title
    ctx.fillStyle = '#7A2E1D';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(revealedCreature.nameAr, 300, 455);

    ctx.fillStyle = '#561E12';
    ctx.font = 'italic 15px serif';
    ctx.fillText(`"${revealedCreature.titleEn}"`, 300, 485);

    // Divider line
    ctx.strokeStyle = '#C8963E';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(70, 510);
    ctx.lineTo(530, 510);
    ctx.stroke();

    // Traits / Metadata
    ctx.textAlign = 'left';
    ctx.fillStyle = '#331C16';
    ctx.font = '13px sans-serif';
    ctx.fillText(`• Landmark Origin: ${startingLandmark.toUpperCase()}`, 70, 545);
    ctx.fillText(`• Encounter Period: ${timeOfDay}`, 70, 570);
    ctx.fillText(`• Route Cleared: ${visitedLandmarks.length} / 5 Landmarks Visited`, 70, 595);
    ctx.fillText(`• Date Issued: ${new Date().toLocaleDateString()}`, 70, 620);

    // Lore snippet
    ctx.font = '12px serif';
    ctx.fillStyle = '#555555';
    const words = revealedCreature.loreEn.split(' ');
    let line = '';
    let y = 655;
    for (let n = 0; n < words.length && y < 705; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 460 && n > 0) {
        ctx.fillText(line, 70, y);
        line = words[n] + ' ';
        y += 18;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 70, y);

    // Official Stamp
    ctx.save();
    ctx.translate(470, 670);
    ctx.rotate(-0.15);
    ctx.strokeStyle = '#7A2E1D';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#7A2E1D';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PETRA ARCHIVE', 0, -10);
    ctx.fillText('#ANBAT_Petra', 0, 5);
    ctx.fillText('VERIFIED MVP', 0, 20);
    ctx.restore();

    // Trigger download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `ANBAT-Badge-${revealedCreature.id}.png`;
    link.href = dataUrl;
    link.click();
    setIsGeneratingBadge(false);
  };

  return (
    <div className="bg-[#FAF5ED] rounded-xl border border-[#C8963E]/30 p-5 md:p-7 shadow-md mb-8">
      {/* Hidden canvas element for badge rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Module Title & Explainable Logic Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#C8963E]/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#7A2E1D] text-[#F6EEE1] text-xs font-bold flex items-center justify-center">
              {isStep2 ? 2 : 1}
            </span>
            <h2 className="font-heading font-bold text-xl md:text-2xl text-[#7A2E1D]">
              {isStep2
                ? isAr
                  ? 'الخطوة 2: لقاء الدليل الأثري وشارة الجواز'
                  : 'Step 2: Meet Your Nabataean Companion Guide'
                : isAr
                ? 'الخطوة 1: فتح حقيبة الأنباط واستدعاء الدليل'
                : 'Step 1: The Nabataean Satchel & Companion Reveal'}
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[#561E12]/80 mt-1">
            {isStep2
              ? isAr
                ? 'ملف المرشد الأثري الخاص بك، سماته الأثرية، وشارة جواز بترا الرقمية القابلة للتنزيل والمشاركة.'
                : 'Your summoned companion guide dossier, personality traits, and official Petra passport badge.'
              : isAr
              ? 'تعتمد خوارزمية الاستدعاء على: معلم البداية + وقت اليوم + نسبة الندرة. (الوعل الملكي الأسطوري يُفتح فقط عند زيارة كافة المعالم الـ 5).'
              : 'Deterministic & explainable reveal based on starting landmark + time of day + rarity roll. (Legendary Ibex unlocks ONLY after visiting all 5 landmarks).'}
          </p>
        </div>

        {/* Status of Legendary Unlock */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
            allLandmarksVisited
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-stone-100 text-stone-700 border-stone-300'
          }`}
        >
          {allLandmarksVisited ? (
            <>
              <Unlock className="w-4 h-4 text-[#C8963E]" />
              <span>{isAr ? 'الوعل الأسطوري مُتاح الآن! (5/5 معالم)' : 'Legendary Ibex Unlocked (5/5 Visited)'}</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-stone-500" />
              <span>
                {isAr
                  ? `الوعل الأسطوري مقفل (${visitedLandmarks.length}/5 معالم)`
                  : `Legendary Locked (${visitedLandmarks.length}/5 Visited)`}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Controls + Reveal View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Reveal Parameters (Explainable Logic Inputs) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-[#E8DCC9] shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7A2E1D]">
            <Info className="w-4 h-4 text-[#C8963E]" />
            <span>{isAr ? 'مدخلات الخوارزمية التفسيرية' : 'Explainable Reveal Parameters'}</span>
          </div>

          {/* 1. Chosen Starting Landmark */}
          <div>
            <label className="block text-xs font-semibold text-[#331C16] mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C8963E]" />
              {isAr ? 'معلم البداية المختار:' : 'Starting Landmark:'}
            </label>
            <select
              id="select-starting-landmark"
              value={startingLandmark}
              onChange={e => setStartingLandmark(e.target.value)}
              className="w-full bg-[#FAF5ED] border border-[#C8963E]/40 rounded-md px-3 py-2 text-xs md:text-sm text-[#331C16] focus:outline-none focus:ring-2 focus:ring-[#7A2E1D]"
            >
              {LANDMARKS.map(l => (
                <option key={l.id} value={l.id}>
                  {l.routeOrder}. {isAr ? l.nameAr : l.nameEn}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-stone-500">
              {isAr ? 'يمنح وزناً لموطن المخلوق المفضل في بترا' : 'Influences creature biome and canyon affinity'}
            </span>
          </div>

          {/* 2. Time of Day */}
          <div>
            <label className="block text-xs font-semibold text-[#331C16] mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C8963E]" />
              {isAr ? 'وقت الزيارة:' : 'Time of Day:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Morning', 'Afternoon', 'Dusk / Night'] as TimeOfDay[]).map(tod => (
                <button
                  key={tod}
                  type="button"
                  onClick={() => setTimeOfDay(tod)}
                  className={`py-1.5 px-2 rounded text-xs font-medium border text-center transition ${
                    timeOfDay === tod
                      ? 'bg-[#7A2E1D] text-[#F6EEE1] border-[#7A2E1D]'
                      : 'bg-[#FAF5ED] text-[#331C16] border-[#E8DCC9] hover:border-[#C8963E]'
                  }`}
                >
                  {tod === 'Morning' ? (isAr ? 'صباح' : 'Morning') : tod === 'Afternoon' ? (isAr ? 'ظهيرة' : 'Afternoon') : (isAr ? 'غروب/ليل' : 'Dusk/Night')}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button: Open Satchel */}
          <button
            id="btn-open-satchel"
            onClick={handleOpenSatchel}
            disabled={isRevealing}
            className="w-full bg-[#7A2E1D] hover:bg-[#632416] text-[#F6EEE1] py-3 rounded-lg font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
          >
            {isRevealing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-[#C8963E] border-t-transparent rounded-full"
                />
                <span>{isAr ? 'جاري فتح الحقيبة واستدعاء الدليل...' : 'Opening Satchel & Summoning Guide...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#C8963E]" />
                <span>{isAr ? 'افتح الحقيبة (Open the Satchel)' : 'Open the Satchel'}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Creature Reveal & Passport Badge */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {revealedCreature ? (
              <motion.div
                key={revealedCreature.id}
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl border-2 border-[#C8963E]/40 p-6 shadow-md relative overflow-hidden"
              >
                {/* Rarity banner top right */}
                <div
                  className={`absolute top-0 right-0 px-4 py-1 text-xs font-bold uppercase rounded-bl-lg tracking-wider ${
                    revealedCreature.rarity === 'Legendary'
                      ? 'bg-[#C8963E] text-[#331C16]'
                      : revealedCreature.rarity === 'Rare'
                      ? 'bg-[#1F6E68] text-white'
                      : 'bg-[#7A2E1D] text-[#F6EEE1]'
                  }`}
                >
                  ★ {revealedCreature.rarity} Companion
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-5">
                  {/* Vector Art Frame */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#FAF5ED] border-2 border-[#C8963E] flex items-center justify-center p-2 shadow-inner shrink-0">
                    <CreatureSvg type={revealedCreature.svgArtKey} className="w-full h-full" />
                  </div>

                  {/* Creature Details */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h3 className="font-heading font-bold text-xl md:text-2xl text-[#7A2E1D]">
                        {isAr ? revealedCreature.nameAr : revealedCreature.nameEn}
                      </h3>
                      <span className="text-2xl">{revealedCreature.icon}</span>
                    </div>
                    <p className="text-xs md:text-sm font-medium text-[#1F6E68] mt-0.5">
                      {isAr ? revealedCreature.titleAr : revealedCreature.titleEn}
                    </p>

                    {/* Creature Naming Input */}
                    <div className="mt-3 flex items-center gap-2 max-w-sm">
                      <span className="text-xs text-stone-600 font-semibold shrink-0">
                        {isAr ? 'اسم دليلك:' : 'Guide Name:'}
                      </span>
                      <input
                        id="input-creature-custom-name"
                        type="text"
                        value={creatureName}
                        onChange={e => handleSaveCustomName(e.target.value)}
                        placeholder="Give your guide a custom name..."
                        className="flex-1 bg-[#FAF5ED] border border-[#C8963E]/50 rounded px-2.5 py-1 text-xs md:text-sm font-semibold text-[#7A2E1D] focus:ring-1 focus:ring-[#7A2E1D] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Lore text */}
                <div className="bg-[#FAF5ED] p-3.5 rounded-lg border border-[#E8DCC9] text-xs md:text-sm leading-relaxed text-[#331C16] mb-4">
                  <p>{isAr ? revealedCreature.loreAr : revealedCreature.loreEn}</p>
                </div>

                {/* Passport Badge Actions: Copy Share & Download PNG */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8DCC9]">
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-copy-share-badge"
                      onClick={handleCopyShare}
                      className="text-xs bg-[#FAF5ED] hover:bg-[#F3E8D8] text-[#7A2E1D] border border-[#C8963E]/40 font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition"
                    >
                      {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedShare ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ نص المشاركة' : 'Copy Share Text')}</span>
                    </button>

                    <button
                      id="btn-download-badge-image"
                      onClick={handleDownloadBadge}
                      disabled={isGeneratingBadge}
                      className="text-xs bg-[#1F6E68] hover:bg-[#185853] text-white font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isGeneratingBadge ? (isAr ? 'جاري التحميل...' : 'Generating...') : (isAr ? 'تحميل الشارة كصورة' : 'Download Badge as Image')}</span>
                    </button>
                  </div>

                  {/* Forward flow buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-satchel-to-map"
                      onClick={onProceedToMap}
                      className="text-xs bg-[#C8963E] hover:bg-[#b8852d] text-[#331C16] font-bold px-3 py-1.5 rounded shadow-sm transition"
                    >
                      {isAr ? 'التالي: خريطة بترا ←' : 'Next: Explore Map →'}
                    </button>
                    <button
                      id="btn-satchel-to-chat"
                      onClick={onProceedToChat}
                      className="text-xs bg-[#7A2E1D] hover:bg-[#632416] text-[#F6EEE1] font-bold px-3 py-1.5 rounded shadow-sm transition"
                    >
                      {isAr ? 'اسأل الدليل 💬' : 'Ask Guide 💬'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Satchel Waiting View */
              <div className="bg-white rounded-xl border border-dashed border-[#C8963E] p-8 text-center flex flex-col items-center justify-center min-h-[340px]">
                <div className="w-20 h-20 rounded-full bg-[#FAF5ED] border border-[#C8963E]/40 flex items-center justify-center text-4xl mb-4 shadow-inner">
                  🎒
                </div>
                <h3 className="font-heading font-bold text-lg text-[#7A2E1D]">
                  {isAr ? 'الحقيبة بانتظار الفتح' : 'Your Nabataean Satchel is Sealed'}
                </h3>
                <p className="text-xs md:text-sm text-stone-600 max-w-md mt-1 mb-4">
                  {isAr
                    ? 'اختر معلماتك في اللوحة المجاورة ثم انقر على "افتح الحقيبة" لاستدعاء رفيقك الأثري وكشف شارة جواز بترا الخاصة بك.'
                    : 'Configure your starting landmark and time of day on the left, then click "Open the Satchel" to summon your Nabataean guide creature.'}
                </p>
                <button
                  onClick={handleOpenSatchel}
                  className="bg-[#C8963E] hover:bg-[#b8852d] text-[#331C16] font-bold text-xs md:text-sm px-5 py-2 rounded-lg shadow transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? 'افتح الحقيبة الآن' : 'Open the Satchel Now'}</span>
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
