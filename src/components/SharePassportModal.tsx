/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  ExternalLink,
  MessageCircle,
  Globe,
  Award
} from 'lucide-react';
import { Language } from '../types';

interface SharePassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  visitedCount: number;
  totalLandmarks: number;
  creatureName: string;
}

export const SharePassportModal: React.FC<SharePassportModalProps> = ({
  isOpen,
  onClose,
  language,
  visitedCount,
  totalLandmarks,
  creatureName
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const isAr = language === 'ar';

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setHasNativeShare(true);
    }

    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('view', 'passport');
        setShareUrl(url.toString());
      } catch {
        setShareUrl(window.location.href);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const shareTitle = isAr
    ? '🏛️ جواز سفر الأنباط التفاعلي - البتراء'
    : '🏛️ Interactive Nabataean Passport - Petra';

  const shareMessage = isAr
    ? `🏛️ جواز سفر الأنباط التفاعلي الذكي (Petra Anbat Passport):\nوثقت زيارة ${visitedCount}/${totalLandmarks} من معالم البتراء الوردية برفقة ${creatureName}!\n\nاستكشف جواز السفر ومعالم بترا عبر الرابط:\n${shareUrl}`
    : `🏛️ Smart Nabataean Petra Passport:\nVerified ${visitedCount}/${totalLandmarks} Petra landmarks accompanied by ${creatureName}!\n\nExplore the passport and Petra via this link:\n${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
      const input = document.getElementById('share-url-input') as HTMLInputElement;
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    }
  };

  const handleCopyFullText = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      handleCopyLink();
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: isAr
            ? `وثقت زيارة ${visitedCount}/${totalLandmarks} من معالم البتراء برفقة ${creatureName}!`
            : `Verified ${visitedCount}/${totalLandmarks} Petra landmarks with ${creatureName}!`,
          url: shareUrl
        });
      } catch {
        // User cancelled or error
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleTwitterShare = () => {
    const tweetText = isAr
      ? `🏛️ وثقت زيارة ${visitedCount}/${totalLandmarks} من معالم البتراء في جواز سفر الأنباط التفاعلي برفقة ${creatureName}!`
      : `🏛️ Verified ${visitedCount}/${totalLandmarks} Petra landmarks in the Interactive Nabataean Passport with ${creatureName}!`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}&url=${encodeURIComponent(shareUrl)}&hashtags=Petra,Jordan,البتراء,الأردن`;
    window.open(tweetUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF5ED] rounded-2xl border-2 border-[#C8963E] p-5 sm:p-7 max-w-lg w-full shadow-2xl relative text-[#561E12]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition cursor-pointer"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7A2E1D] to-[#561E12] text-[#E5B55E] flex items-center justify-center shadow-md shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg sm:text-xl text-[#7A2E1D]">
              {isAr ? 'مشاركة رابط جواز سفر الأنباط' : 'Share Nabataean Passport Link'}
            </h3>
            <p className="text-xs text-[#561E12]/80">
              {isAr
                ? 'شارك إنجازاتك وأختامك الأثرية في البتراء برابط مباشر ودقيق'
                : 'Share your verified Petra archaeological visas and journey link'}
            </p>
          </div>
        </div>

        {/* Passport Status Pill */}
        <div className="mb-4 p-3 rounded-xl bg-[#EFE6D5] border border-[#C8963E]/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#C8963E]" />
            <span className="font-bold">
              {isAr ? 'حالة التوثيق الميداني:' : 'Passport Status:'}{' '}
              <span className="text-[#7A2E1D]">
                {visitedCount}/{totalLandmarks} {isAr ? 'معالم موثقة' : 'Stamped'}
              </span>
            </span>
          </div>
          <span className="text-[11px] font-medium bg-[#7A2E1D] text-[#FAF5ED] px-2 py-0.5 rounded-full">
            {creatureName}
          </span>
        </div>

        {/* Direct Link Field */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-[#7A2E1D] mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-[#C8963E]" />
              <span>{isAr ? 'الرابط المباشر للجواز:' : 'Direct Passport Link:'}</span>
            </span>
            {copiedLink && (
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in">
                <Check className="w-3 h-3" />
                {isAr ? 'تم نسخ الرابط!' : 'Link copied!'}
              </span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="share-url-input"
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3 py-2 bg-white border border-[#C8963E]/50 rounded-xl text-xs font-mono text-[#561E12] select-all focus:outline-none focus:ring-2 focus:ring-[#C8963E]"
              />
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-[#C8963E] hover:bg-[#B38230] text-[#331C16] text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer shrink-0"
              title="نسخ الرابط"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الرابط' : 'Copy Link')}</span>
            </button>
          </div>
        </div>

        {/* Quick Share Buttons Grid */}
        <div className="mb-4">
          <span className="block text-[11px] font-bold text-[#561E12]/70 mb-2 uppercase">
            {isAr ? 'مشاركة فورية عبر التطبيقات:' : 'Instant Share Platforms:'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="p-2.5 rounded-xl border border-emerald-400 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>واتساب WhatsApp</span>
            </button>

            {/* X / Twitter */}
            <button
              onClick={handleTwitterShare}
              className="p-2.5 rounded-xl border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
            >
              <span className="font-mono text-sm leading-none">𝕏</span>
              <span>تويتر / 𝕏</span>
            </button>

            {/* Native Share (Web Share API) or Full Text */}
            <button
              onClick={hasNativeShare ? handleNativeShare : handleCopyFullText}
              className="p-2.5 rounded-xl border border-[#C8963E] bg-amber-50 hover:bg-amber-100 text-[#7A2E1D] text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
            >
              {copiedText ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <ExternalLink className="w-4 h-4 text-[#C8963E]" />
              )}
              <span>
                {hasNativeShare
                  ? isAr
                    ? 'مشاركة الجهاز'
                    : 'Device Share'
                  : copiedText
                  ? isAr
                    ? 'تم نسخ النص'
                    : 'Text Copied'
                  : isAr
                  ? 'نسخ المنشور كاملاً'
                  : 'Copy Full Text'}
              </span>
            </button>
          </div>
        </div>

        {/* Text Preview Card */}
        <div className="p-3 bg-white/80 rounded-xl border border-[#C8963E]/30 text-[11px] text-[#561E12]/80 space-y-1">
          <span className="font-bold text-[#7A2E1D] block">
            {isAr ? 'معاينة نص المنشور مع الرابط:' : 'Share message preview:'}
          </span>
          <p className="whitespace-pre-line font-mono text-[10px] leading-relaxed bg-[#FAF5ED] p-2 rounded-lg border border-[#C8963E]/20 select-all">
            {shareMessage}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#C8963E]/30 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#7A2E1D] hover:bg-[#9E2A2B] text-white text-xs font-bold transition cursor-pointer"
          >
            {isAr ? 'تم' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
