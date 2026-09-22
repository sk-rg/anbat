/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, VisitorGuideBadge, KnowledgeEntry, Landmark, UserSession } from './types';
import { storageService } from './services/storageService';
import { LANDMARKS } from './data/landmarks';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { SatchelSection } from './components/SatchelSection';
import { PetraMap } from './components/PetraMap';
import { ChatGuide } from './components/ChatGuide';
import { PassportSection } from './components/PassportSection';
import { AdminConsole } from './components/AdminConsole';
import { ArchitectureModal } from './components/ArchitectureModal';
import { LandmarkQrScanner } from './components/LandmarkQrScanner';
import { LandmarkStoryModal } from './components/LandmarkStoryModal';
import { FooterProgress } from './components/FooterProgress';
import { initializeConditionChain, resetConditionLogs } from './services/hashChainService';
import {
  Compass,
  Shield,
  Layers,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Heart,
  Camera
} from 'lucide-react';

export default function App() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [currentView, setCurrentView] = useState<'visitor' | 'admin'>('visitor');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [language, setLanguage] = useState<Language>('en');
  const [visitedLandmarks, setVisitedLandmarks] = useState<string[]>([]);
  const [activeBadge, setActiveBadge] = useState<VisitorGuideBadge | null>(null);
  const [chatInitialQuestion, setChatInitialQuestion] = useState<string>('');
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [storyModalLandmark, setStoryModalLandmark] = useState<Landmark | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize storage state
  useEffect(() => {
    const savedLang = storageService.getLanguage();
    setLanguage(savedLang);

    const savedSession = storageService.getUserSession();
    setUserSession(savedSession);

    const savedVisited = storageService.getVisitedLandmarks();
    setVisitedLandmarks(savedVisited);

    const savedBadge = storageService.getVisitorBadge();
    setActiveBadge(savedBadge);

    // Boot condition ledger
    initializeConditionChain();

    // Check URL parameters for direct passport linking
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const viewParam = params.get('view');
        const stepParam = params.get('step');
        if (viewParam === 'passport' || stepParam === '5' || stepParam === 'passport') {
          setActiveStep(5);
          setCurrentView('visitor');
        }
      } catch {
        // Ignore URL parsing errors
      }
    }
  }, []);

  const handleLoginSuccess = (session: UserSession) => {
    storageService.saveUserSession(session);
    setUserSession(session);
    showToast(
      language === 'ar'
        ? `مرحباً بك يا ${session.name} في تطبيق الأنباط!`
        : `Welcome to ANBAT Companion, ${session.name}!`
    );
  };

  const handleLogout = () => {
    storageService.clearUserSession();
    setUserSession(null);
    showToast(language === 'ar' ? 'تم تسجيل الخروج بنجاح.' : 'Logged out successfully.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    storageService.saveLanguage(newLang);
    document.documentElement.setAttribute('lang', newLang);
    document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
  };

  const handleToggleVisitedLandmark = (landmarkId: string) => {
    const updated = storageService.toggleVisitedLandmark(landmarkId);
    setVisitedLandmarks(updated);
    if (updated.includes(landmarkId)) {
      showToast(language === 'ar' ? 'تم تسجيل زيارة المعلم!' : 'Landmark marked as visited!');
    }
  };

  // Demo Fast Track: Mark all 5 landmarks visited
  const handleJumpAllLandmarks = () => {
    const allIds = LANDMARKS.map(l => l.id);
    storageService.saveVisitedLandmarks(allIds);
    setVisitedLandmarks(allIds);
    showToast(
      language === 'ar'
        ? 'تم وسم كافة معالم بترا الـ 5 بالزيارة! الوعل النوبي الأسطوري متاح الآن في الحقيبة!'
        : 'All 5 landmarks visited! Legendary Nubian Ibex unlocked in Satchel!'
    );
  };

  // Reset entire demo data
  const handleResetDemo = async () => {
    storageService.clearAll();
    await resetConditionLogs();
    setVisitedLandmarks([]);
    setActiveBadge(null);
    setActiveStep(1);
    showToast(language === 'ar' ? 'تمت إعادة ضبط بيانات العرض بنجاح.' : 'Demo data restored to initial state.');
  };

  // Handle physical QR check-in
  const handleQrCheckInSuccess = (landmark: Landmark) => {
    const updated = storageService.markLandmarkVisited(landmark.id);
    setVisitedLandmarks(updated);

    if (updated.length === LANDMARKS.length) {
      showToast(
        language === 'ar'
          ? `✓ تم التحقق ميدانياً من ${landmark.nameAr}! كافة المعالم الـ 5 مكتملة، وتم فك قفل الوعل الأسطوري!`
          : `✓ Physical check-in verified at ${landmark.nameEn}! All 5 monuments visited – Legendary Ibex unlocked!`
      );
    } else {
      showToast(
        language === 'ar'
          ? `✓ تم تسجيل وصولك الميداني إلى: ${landmark.nameAr} (${updated.length}/5)`
          : `✓ Physical check-in verified at ${landmark.nameEn}! (${updated.length}/5)`
      );
    }
  };

  // Ask about landmark
  const handleAskAboutLandmark = (query: string) => {
    setChatInitialQuestion(query);
    setCurrentView('visitor');
    setActiveStep(4); // Chat step
  };

  const isAr = language === 'ar';

  // If user is not logged in, present the Modern Login Page
  if (!userSession) {
    return (
      <LoginPage
        language={language}
        onLanguageChange={handleLanguageChange}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F6EEE1] text-[#331C16] flex flex-col font-sans"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#7A2E1D] text-[#F6EEE1] border border-[#C8963E] px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-[#C8963E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        activeStep={activeStep}
        onStepSelect={step => {
          setCurrentView('visitor');
          setActiveStep(step);
        }}
        language={language}
        onLanguageChange={handleLanguageChange}
        visitedCount={visitedLandmarks.length}
        totalLandmarks={LANDMARKS.length}
        onJumpAllLandmarks={handleJumpAllLandmarks}
        onResetDemo={handleResetDemo}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenQrScanner={() => setIsScannerOpen(true)}
        userSession={userSession}
        onLogout={handleLogout}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* View Switch Router */}
        {currentView === 'admin' ? (
          <AdminConsole
            language={language}
            onBackToVisitor={() => setCurrentView('visitor')}
            onQuestionResolved={entry => {
              showToast(
                language === 'ar'
                  ? `تمت إضافة "${entry.titleAr}" إلى قاعدة المعرفة!`
                  : `Added "${entry.titleEn}" to knowledge base!`
              );
            }}
          />
        ) : (
          /* Visitor 5-Step Flow Router */
          <div>
            {/* Step 1: Open Satchel */}
            {activeStep === 1 && (
              <SatchelSection
                language={language}
                visitedLandmarks={visitedLandmarks}
                activeBadge={activeBadge}
                currentStep={1}
                onBadgeCreated={badge => {
                  setActiveBadge(badge);
                  setActiveStep(2);
                  showToast(
                    language === 'ar'
                      ? 'تم استدعاء الدليل بنجاح! انتقلت إلى الخطوة 2: لقاء الدليل'
                      : 'Companion summoned! Routed to Step 2: Meet Guide'
                  );
                }}
                onProceedToMap={() => setActiveStep(3)}
                onProceedToChat={() => setActiveStep(4)}
              />
            )}

            {/* Step 2: Meet Guide (Show Satchel in active state or guide info) */}
            {activeStep === 2 && (
              <SatchelSection
                language={language}
                visitedLandmarks={visitedLandmarks}
                activeBadge={activeBadge}
                currentStep={2}
                onBadgeCreated={badge => setActiveBadge(badge)}
                onProceedToMap={() => setActiveStep(3)}
                onProceedToChat={() => setActiveStep(4)}
              />
            )}

            {/* Step 3: Explore Map */}
            {activeStep === 3 && (
              <PetraMap
                language={language}
                visitedLandmarks={visitedLandmarks}
                onToggleVisited={handleToggleVisitedLandmark}
                onAskAboutLandmark={handleAskAboutLandmark}
                onOpenSatchelForLegendary={() => setActiveStep(1)}
                onOpenQrScanner={() => setIsScannerOpen(true)}
              />
            )}

            {/* Step 4: Ask Guide */}
            {activeStep === 4 && (
              <ChatGuide
                language={language}
                onLanguageChange={handleLanguageChange}
                activeBadge={activeBadge}
                initialQuestion={chatInitialQuestion}
                onOpenSatchel={() => setActiveStep(1)}
                onOpenAdmin={() => setCurrentView('admin')}
              />
            )}

            {/* Step 5: Collect & Share */}
            {activeStep === 5 && (
              <PassportSection
                language={language}
                activeBadge={activeBadge}
                visitedLandmarks={visitedLandmarks}
                onOpenSatchel={() => setActiveStep(1)}
                onExploreMap={() => setActiveStep(3)}
                onAskGuide={() => setActiveStep(4)}
                onCheckInLandmark={handleQrCheckInSuccess}
                userSession={userSession}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer with Visual Step Progress Tracker */}
      <footer className="mt-10">
        <FooterProgress
          language={language}
          activeStep={activeStep}
          onStepSelect={step => {
            setCurrentView('visitor');
            setActiveStep(step);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        <div className="bg-[#7A2E1D] text-[#F6EEE1] border-t border-[#C8963E]/40 py-6">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm text-[#C8963E]">
                ANBAT • أنباط
              </span>
              <span className="text-[#E8DCC9]/70">|</span>
              <span className="text-[#E8DCC9]">
                {isAr ? 'رفيقك النبطي لمدينة بترا الأثرية' : 'Your Nabataean Companion to Petra'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[#E8DCC9]/90">
              <button
                onClick={() => setIsArchitectureOpen(true)}
                className="hover:text-[#C8963E] transition flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isAr ? 'المخطط الهندسي ودليل الحكام' : 'Architecture & Demo Guide'}</span>
              </button>
              <span>•</span>
              <button
                onClick={() => setCurrentView('admin')}
                className="hover:text-[#C8963E] transition flex items-center gap-1 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{isAr ? 'لوحة المشرف (admin123)' : 'Admin Console (admin123)'}</span>
              </button>
              <span>•</span>
              <span className="font-mono text-[#C8963E]">#ANBAT_Petra</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Architecture & Demo Walkthrough Modal */}
      {isArchitectureOpen && (
        <ArchitectureModal
          language={language}
          onClose={() => setIsArchitectureOpen(false)}
        />
      )}

      {/* Camera-Based MediaDevices QR Scanner */}
      {isScannerOpen && (
        <LandmarkQrScanner
          language={language}
          visitedLandmarks={visitedLandmarks}
          onCheckInSuccess={handleQrCheckInSuccess}
          onClose={() => setIsScannerOpen(false)}
          onViewStory={landmark => {
            setStoryModalLandmark(landmark);
            setIsScannerOpen(false);
          }}
        />
      )}

      {/* Landmark Story Modal */}
      {storyModalLandmark && (
        <LandmarkStoryModal
          landmark={storyModalLandmark}
          language={language}
          isVisited={visitedLandmarks.includes(storyModalLandmark.id)}
          onToggleVisited={(landmarkId: string) => handleToggleVisitedLandmark(landmarkId)}
          onClose={() => setStoryModalLandmark(null)}
          onAskAboutLandmark={(query: string) => {
            setStoryModalLandmark(null);
            handleAskAboutLandmark(query);
          }}
        />
      )}
    </div>
  );
}
