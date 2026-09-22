/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { Landmark, Language } from '../types';
import { LANDMARKS } from '../data/landmarks';
import {
  Camera,
  X,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Sparkles,
  RefreshCw,
  Upload,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Volume2
} from 'lucide-react';

interface LandmarkQrScannerProps {
  language: Language;
  visitedLandmarks: string[];
  onCheckInSuccess: (landmark: Landmark) => void;
  onClose: () => void;
  onViewStory: (landmark: Landmark) => void;
}

export const LandmarkQrScanner: React.FC<LandmarkQrScannerProps> = ({
  language,
  visitedLandmarks,
  onCheckInSuccess,
  onClose,
  onViewStory
}) => {
  const isAr = language === 'ar';

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const [cameraPermissionState, setCameraPermissionState] = useState<
    'prompt' | 'granted' | 'denied' | 'unsupported'
  >('prompt');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [detectedLandmark, setDetectedLandmark] = useState<Landmark | null>(null);
  const [showDemoSheet, setShowDemoSheet] = useState<boolean>(false);
  const [activeFacingMode, setActiveFacingMode] = useState<'environment' | 'user'>('environment');

  // Parse QR code payload to identify Petra landmark
  const parseLandmarkFromQr = (payload: string): Landmark | null => {
    const clean = payload.trim().toLowerCase();

    // Check by IDs
    for (const lm of LANDMARKS) {
      if (
        clean === lm.id ||
        clean === `anbat:landmark:${lm.id}` ||
        clean.includes(`landmark=${lm.id}`) ||
        clean.includes(`/checkin/${lm.id}`) ||
        clean.includes(`/${lm.id}`)
      ) {
        return lm;
      }
    }

    // Name-based fuzzy matches
    if (clean.includes('siq') || clean.includes('bab al-siq')) {
      return LANDMARKS.find(l => l.id === 'siq') || null;
    }
    if (clean.includes('treasury') || clean.includes('khazneh') || clean.includes('khazna')) {
      return LANDMARKS.find(l => l.id === 'treasury') || null;
    }
    if (clean.includes('facade') || clean.includes('facades')) {
      return LANDMARKS.find(l => l.id === 'facades') || null;
    }
    if (clean.includes('theatre') || clean.includes('theater')) {
      return LANDMARKS.find(l => l.id === 'theatre') || null;
    }
    if (clean.includes('monastery') || clean.includes('deir') || clean.includes('ad-deir')) {
      return LANDMARKS.find(l => l.id === 'monastery') || null;
    }

    return null;
  };

  // Start Camera Stream via MediaDevices API
  const startCamera = async () => {
    setCameraError(null);
    setDetectedLandmark(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraPermissionState('unsupported');
      setCameraError(
        isAr
          ? 'واجهة MediaDevices غير مدعومة في هذا المتصفح. يمكنك رفع صورة كود QR أو استخدام بطاقات العرض.'
          : 'MediaDevices API is not available in this browser context. You can upload a photo of the QR marker or use the demo cards.'
      );
      return;
    }

    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: activeFacingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setCameraPermissionState('granted');
      setIsScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        requestScanFrame();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraPermissionState('denied');
        setCameraError(
          isAr
            ? 'تم رفض إذن الوصول للكاميرا. يرجى السماح بالوصول للكاميرا أو رفع صورة الباركود.'
            : 'Camera permission was denied. Please allow camera access in your browser or upload a photo of the marker.'
        );
      } else {
        setCameraPermissionState('unsupported');
        setCameraError(
          isAr
            ? `تعذر تشغيل الكاميرا: ${err.message || 'خطأ غير معروف'}`
            : `Unable to access camera: ${err.message || 'Camera unavailable'}`
        );
      }
      setIsScanning(false);
    }
  };

  // Scan video frame continuously
  const requestScanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          const matched = parseLandmarkFromQr(code.data);
          if (matched) {
            handleCheckInSuccess(matched);
            return; // Stop scanning once successfully decoded
          }
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(scan);
    };

    animationFrameIdRef.current = requestAnimationFrame(scan);
  };

  // Handle successful physical check-in
  const handleCheckInSuccess = (landmark: Landmark) => {
    // Vibrate haptics if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    setDetectedLandmark(landmark);
    setIsScanning(false);
    onCheckInSuccess(landmark);

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
  };

  // Upload Photo fallback
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          const matched = parseLandmarkFromQr(code.data);
          if (matched) {
            handleCheckInSuccess(matched);
          } else {
            setCameraError(
              isAr
                ? `تمت قراءة الكود ("${code.data.substring(0, 20)}") ولكن لم يتم التعرف على معلم نبطي في بترا.`
                : `QR code detected ("${code.data.substring(0, 20)}"), but it did not match any of Petra's 5 monitored landmarks.`
            );
          }
        } else {
          setCameraError(
            isAr
              ? 'لم يتم العثور على رمز QR واضح في الصورة. يرجى تجربة صورة أوضح أو تجربة بطاقات العرض أدناه.'
              : 'No readable QR code found in the image. Please try a clearer picture or use the demo markers below.'
          );
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Start on mount
  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [activeFacingMode]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs">
      <div
        className="bg-[#FAF5ED] w-full max-w-lg rounded-2xl border-2 border-[#C8963E] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Hidden scan canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Modal Header */}
        <div className="bg-[#7A2E1D] text-[#F6EEE1] px-5 py-3.5 flex items-center justify-between border-b border-[#C8963E]/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[#C8963E] text-[#7A2E1D]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base md:text-lg text-[#F6EEE1]">
                {isAr ? 'ماسح QR لمعالم بترا الأثرية' : 'Petra Physical Marker Scanner'}
              </h3>
              <p className="text-[11px] text-[#E8DCC9]/90">
                {isAr ? 'امسح اللوحات الحجرية في الموقع لتسجيل الوصول' : 'MediaDevices Camera Check-In'}
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

        {/* Scanner Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Successful Check-In Card */}
          {detectedLandmark ? (
            <div className="bg-white rounded-xl border-2 border-emerald-500 p-6 text-center space-y-4 shadow-md animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {isAr ? '✓ تم التحقق من المعلم وتسجيل الوصول!' : '✓ Physical Landmark Verified!'}
                </span>
                <h4 className="font-heading font-bold text-xl text-[#7A2E1D] mt-2">
                  {isAr ? detectedLandmark.nameAr : detectedLandmark.nameEn}
                </h4>
                <p className="text-xs text-stone-600 mt-0.5">
                  {isAr ? detectedLandmark.subtitleAr : detectedLandmark.subtitleEn}
                </p>
              </div>

              <div className="bg-[#FAF5ED] p-3 rounded-lg border border-[#E8DCC9] text-xs text-stone-700 text-left">
                <p className="line-clamp-3">
                  {isAr ? detectedLandmark.shortDescAr : detectedLandmark.shortDescEn}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => {
                    onViewStory(detectedLandmark);
                    onClose();
                  }}
                  className="flex-1 bg-[#C8963E] hover:bg-[#b8852d] text-[#331C16] font-bold text-xs py-2.5 px-3 rounded-lg shadow-sm transition"
                >
                  {isAr ? 'عرض الرواية الأثرية الكاملة' : 'Read Monument Chronicle'}
                </button>
                <button
                  onClick={() => {
                    setDetectedLandmark(null);
                    startCamera();
                  }}
                  className="flex-1 bg-[#1F6E68] hover:bg-[#185853] text-white font-bold text-xs py-2.5 px-3 rounded-lg transition"
                >
                  {isAr ? 'مسح معلم آخر 📷' : 'Scan Another Landmark 📷'}
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Viewfinder */
            <div className="space-y-4">
              <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center border-2 border-[#C8963E] shadow-inner">
                {/* Video Feed */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />

                {/* Overlaid Target Brackets & Laser Sweep */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 relative border-2 border-[#C8963E]/60 rounded-xl">
                      {/* 4 Golden Corner Brackets */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#C8963E] rounded-tl" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#C8963E] rounded-tr" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#C8963E] rounded-bl" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#C8963E] rounded-br" />

                      {/* Moving laser scanline */}
                      <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#C8963E] to-transparent animate-pulse top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                )}

                {/* Status or error overlay if camera not running */}
                {!isScanning && (
                  <div className="absolute inset-0 bg-stone-900/90 text-stone-200 p-4 flex flex-col items-center justify-center text-center space-y-3">
                    <Camera className="w-10 h-10 text-[#C8963E] opacity-70" />
                    <p className="text-xs max-w-xs text-stone-300">
                      {cameraError || (isAr ? 'جاري تهيئة الكاميرا...' : 'Initializing camera stream...')}
                    </p>
                    <button
                      onClick={startCamera}
                      className="text-xs bg-[#C8963E] hover:bg-[#b8852d] text-[#331C16] font-bold px-4 py-2 rounded-lg transition"
                    >
                      {isAr ? 'إعادة تشغيل الكاميرا' : 'Retry Camera Access'}
                    </button>
                  </div>
                )}

                {/* Flip camera control */}
                {isScanning && (
                  <button
                    onClick={() =>
                      setActiveFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'))
                    }
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[10px] px-2 py-1 rounded border border-white/30 transition"
                  >
                    Flip Camera
                  </button>
                )}
              </div>

              {/* Instructions text */}
              <div className="text-center text-xs text-stone-600">
                {isAr
                  ? 'وجه الكاميرا نحو رمز QR الموضوع على اللوحة التفسيرية للمعلم في بترا.'
                  : 'Point camera at the physical QR marker located on the monument marker sign in Petra.'}
              </div>

              {/* Fallback Photo Upload & Demo Sheet Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8DCC9]">
                <label className="text-xs text-[#7A2E1D] hover:text-[#561E12] font-semibold flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded border border-[#C8963E]/40 transition shadow-xs">
                  <Upload className="w-3.5 h-3.5 text-[#C8963E]" />
                  <span>{isAr ? 'رفع صورة QR من الجهاز' : 'Upload Marker Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setShowDemoSheet(!showDemoSheet)}
                  className="text-xs text-[#1F6E68] hover:text-[#185853] font-semibold flex items-center gap-1 bg-white px-3 py-1.5 rounded border border-[#1F6E68]/40 transition shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAr ? 'بطاقات معالم بترا للاختبار' : 'Judge Demo QR Sheet'}</span>
                  {showDemoSheet ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Collapsible Demo Physical Markers for Judges */}
          {showDemoSheet && (
            <div className="bg-white p-4 rounded-xl border border-[#C8963E]/50 shadow-xs space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7A2E1D] uppercase tracking-wider">
                  {isAr ? 'لوحات المعالم الفيزيائية (محاكاة الاختبار):' : 'Physical Landmark Test Markers:'}
                </span>
                <span className="text-[10px] text-stone-500">Instant Check-In</span>
              </div>
              <p className="text-[11px] text-stone-600">
                {isAr
                  ? 'للتحكيم والاختبار السريع: يمكنك النقر على أي معلم لمحاكاة مسح رمزه الميداني فوراً.'
                  : 'For technical judging: Click any landmark below to simulate scanning its on-site physical QR sign.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {LANDMARKS.map(lm => {
                  const isAlreadyVisited = visitedLandmarks.includes(lm.id);
                  return (
                    <button
                      key={lm.id}
                      onClick={() => handleCheckInSuccess(lm)}
                      className={`p-2.5 rounded-lg border text-left transition flex items-center justify-between gap-2 ${
                        isAlreadyVisited
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-[#FAF5ED] border-[#E8DCC9] hover:border-[#C8963E] text-[#331C16]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                            isAlreadyVisited ? 'bg-[#1F6E68] text-white' : 'bg-[#7A2E1D] text-[#F6EEE1]'
                          }`}
                        >
                          {lm.routeOrder}
                        </span>
                        <div>
                          <span className="text-xs font-bold block">
                            {isAr ? lm.nameAr : lm.nameEn}
                          </span>
                          <span className="text-[10px] font-mono text-stone-500">
                            ID: {lm.id}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#C8963E] font-bold">
                        {isAlreadyVisited ? '✓ Checked' : 'Simulate Scan →'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#FAF5ED] px-5 py-3 border-t border-[#E8DCC9] flex items-center justify-between text-xs shrink-0">
          <span className="text-stone-500">
            {isAr ? 'التحقق الميداني عبر MediaDevices API' : 'On-Site MediaDevices QR Check-In'}
          </span>
          <button
            onClick={onClose}
            className="text-stone-600 hover:text-stone-900 font-medium px-2 py-1 rounded"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
