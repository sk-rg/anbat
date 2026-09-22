/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Language, UserSession, UserProfile } from '../types';
import { storageService } from '../services/storageService';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Compass,
  X,
  User,
  Utensils,
  Globe,
  Calendar,
  Camera,
  Upload,
  BookOpen,
  ShieldCheck,
  Languages,
  Check
} from 'lucide-react';

interface LoginPageProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLoginSuccess: (session: UserSession) => void;
}

const JORDANIAN_DISHES = [
  { id: 'mansaf', nameAr: 'المنسف الكركي بالجميد البلدي', nameEn: 'Karak Mansaf with Jameed' },
  { id: 'maqluba', nameAr: 'المقلوبة الأردنية بالباذنجان والزهرة', nameEn: 'Jordanian Maqluba' },
  { id: 'musakhan', nameAr: 'المسخن التراثي بزيت الزيتون والسماق', nameEn: 'Traditional Musakhan' },
  { id: 'rashoof', nameAr: 'الرشوف البلقاوي باللبن المخيض', nameEn: 'Balqawi Rashoof with Yogurt' },
  { id: 'makmoura', nameAr: 'المكمورة الشمالية بطبقات العجين واللحم', nameEn: 'Northern Makmoura' },
  { id: 'sajieh', nameAr: 'صاجية اللحم البتراوية على الحطب', nameEn: 'Petra Meat Sajieh' },
  { id: 'falafel', nameAr: 'الحمص والفلافل المقرمش مع شاي الميرمية', nameEn: 'Hummus & Falafel with Sage Tea' },
  { id: 'other', nameAr: 'طبق أردني آخر (كتابة مخصصة)...', nameEn: 'Other Jordanian Dish (Custom)...' }
];

const COUNTRIES = [
  { id: 'JO', nameAr: 'الأردن', nameEn: 'Jordan' },
  { id: 'SA', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia' },
  { id: 'AE', nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates' },
  { id: 'PS', nameAr: 'فلسطين', nameEn: 'Palestine' },
  { id: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait' },
  { id: 'QA', nameAr: 'قطر', nameEn: 'Qatar' },
  { id: 'OM', nameAr: 'سلطنة عُمان', nameEn: 'Oman' },
  { id: 'BH', nameAr: 'البحرين', nameEn: 'Bahrain' },
  { id: 'EG', nameAr: 'مصر', nameEn: 'Egypt' },
  { id: 'US', nameAr: 'الولايات المتحدة', nameEn: 'United States' },
  { id: 'GB', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom' },
  { id: 'DE', nameAr: 'ألمانيا', nameEn: 'Germany' },
  { id: 'FR', nameAr: 'فرنسا', nameEn: 'France' },
  { id: 'OTHER', nameAr: 'دولة أخرى', nameEn: 'Other Country' }
];

export const LoginPage: React.FC<LoginPageProps> = ({
  language,
  onLanguageChange,
  onLoginSuccess
}) => {
  const isAr = language === 'ar';

  // Mode: 'signin' or 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In fields
  const [signInIdentifier, setSignInIdentifier] = useState('yara@anbat.jo');
  const [signInPassword, setSignInPassword] = useState('nabataean2026');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up fields
  const [signUpFirstName, setSignUpFirstName] = useState('');
  const [signUpLastName, setSignUpLastName] = useState('');
  const [signUpAge, setSignUpAge] = useState<number | string>('');
  const [signUpPhotoUrl, setSignUpPhotoUrl] = useState<string>('');
  const [signUpDishChoice, setSignUpDishChoice] = useState('mansaf');
  const [signUpCustomDish, setSignUpCustomDish] = useState('');
  const [signUpCountryChoice, setSignUpCountryChoice] = useState('JO');
  const [signUpCustomCountry, setSignUpCustomCountry] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [shakeCard, setShakeCard] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const triggerShake = () => {
    setShakeCard(true);
    setTimeout(() => setShakeCard(false), 500);
  };

  // Photo upload handling
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(isAr ? 'يرجى اختيار ملف صورة صالح' : 'Please choose a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(isAr ? 'حجم الصورة يجب أن لا يتجاوز 5 ميغابايت' : 'Image size should not exceed 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSignUpPhotoUrl(result);
      showToast(isAr ? '✓ تم تحميل صورتك الشخصية بنجاح!' : '✓ Photo uploaded successfully!', 'success');
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // Validate Sign In
  const validateSignIn = () => {
    const trimmedId = signInIdentifier.trim();
    if (!trimmedId) {
      return isAr ? 'يرجى إدخال البريد الإلكتروني أو اسم المستخدم' : 'Please enter your email or username';
    }
    if (!signInPassword || signInPassword.length < 4) {
      return isAr ? 'يرجى إدخال كلمة المرور (4 خانات فأكثر)' : 'Please enter a password (4+ characters)';
    }
    return null;
  };

  // Validate Sign Up
  const validateSignUp = () => {
    if (!signUpFirstName.trim()) {
      return isAr ? 'يرجى إدخال الاسم الأول' : 'Please enter your first name';
    }
    if (!signUpLastName.trim()) {
      return isAr ? 'يرجى إدخال الاسم الثاني / اسم العائلة' : 'Please enter your last name';
    }
    if (!signUpAge || Number(signUpAge) <= 0 || Number(signUpAge) > 120) {
      return isAr ? 'يرجى إدخال عمر صحيح بين 1 و 120' : 'Please enter a valid age between 1 and 120';
    }
    if (signUpDishChoice === 'other' && !signUpCustomDish.trim()) {
      return isAr ? 'يرجى كتابة اسم أكلتك الأردنية المفضلة' : 'Please enter your favorite Jordanian dish';
    }
    if (signUpCountryChoice === 'OTHER' && !signUpCustomCountry.trim()) {
      return isAr ? 'يرجى كتابة اسم بلدك' : 'Please specify your country';
    }
    if (!signUpEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpEmail.trim())) {
      return isAr ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please enter a valid email address';
    }
    if (!signUpPassword || signUpPassword.length < 6) {
      return isAr ? 'يجب أن لا تقل كلمة المرور عن 6 خانات' : 'Password must be at least 6 characters';
    }
    if (signUpPassword !== signUpConfirmPassword) {
      return isAr ? 'كلمتا المرور غير متطابقتين، يرجى التأكد' : 'Passwords do not match';
    }
    return null;
  };

  // Handle Sign In submission
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const err = validateSignIn();
    if (err) {
      setErrorMessage(err);
      triggerShake();
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Look up if user registered previously
      const savedProfile = storageService.findUserByEmail(signInIdentifier.trim());

      let session: UserSession;
      if (savedProfile) {
        session = {
          email: savedProfile.email,
          name: `${savedProfile.firstName} ${savedProfile.lastName}`.trim(),
          firstName: savedProfile.firstName,
          lastName: savedProfile.lastName,
          age: savedProfile.age,
          photoUrl: savedProfile.photoUrl,
          favoriteDish: savedProfile.favoriteDish,
          country: savedProfile.country,
          provider: 'local',
          signedInAt: new Date().toISOString()
        };
      } else {
        const cleanName = signInIdentifier.includes('@')
          ? signInIdentifier.split('@')[0]
          : signInIdentifier;
        session = {
          email: signInIdentifier.includes('@') ? signInIdentifier : `${signInIdentifier}@anbat.petra`,
          name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
          firstName: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
          lastName: 'البتراوي',
          age: 25,
          country: isAr ? 'الأردن' : 'Jordan',
          favoriteDish: isAr ? 'المنسف الكركي بالجميد البلدي' : 'Jordanian Mansaf',
          provider: 'local',
          signedInAt: new Date().toISOString()
        };
      }

      setSuccessMessage(
        isAr
          ? 'تم تسجيل الدخول بنجاح! جاري فتح تطبيق وجواز سفر الأنباط...'
          : 'Signed in successfully! Opening ANBAT & Passport...'
      );
      showToast(isAr ? `مرحباً بك يا ${session.name}` : `Welcome back, ${session.name}!`, 'success');

      setTimeout(() => {
        onLoginSuccess(session);
      }, 700);
    }, 900);
  };

  // Handle Sign Up submission
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const err = validateSignUp();
    if (err) {
      setErrorMessage(err);
      triggerShake();
      return;
    }

    setIsLoading(true);

    // Prepare food display string
    let finalFood = '';
    if (signUpDishChoice === 'other') {
      finalFood = signUpCustomDish.trim();
    } else {
      const selectedObj = JORDANIAN_DISHES.find(d => d.id === signUpDishChoice);
      finalFood = isAr ? selectedObj?.nameAr || '' : selectedObj?.nameEn || selectedObj?.nameAr || '';
    }

    // Prepare country display string
    let finalCountry = '';
    if (signUpCountryChoice === 'OTHER') {
      finalCountry = signUpCustomCountry.trim();
    } else {
      const selectedCountry = COUNTRIES.find(c => c.id === signUpCountryChoice);
      finalCountry = isAr ? selectedCountry?.nameAr || '' : selectedCountry?.nameEn || '';
    }

    const newProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      email: signUpEmail.trim().toLowerCase(),
      firstName: signUpFirstName.trim(),
      lastName: signUpLastName.trim(),
      age: Number(signUpAge),
      photoUrl: signUpPhotoUrl || '/assets/explorer-portrait.jpg',
      favoriteDish: finalFood,
      country: finalCountry,
      password: signUpPassword,
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      setIsLoading(false);
      // Save profile to storage
      storageService.registerUser(newProfile);

      // Pre-fill email in Sign In form
      setSignInIdentifier(newProfile.email);
      setSignInPassword('');

      setSuccessMessage(
        isAr
          ? '✓ تم إنشاء حساب المستكشف بنجاح! تم ربط بياناتك (الاسم، العمر، الأكلة، والصورة) مباشرة بجواز سفر الأنباط. جاري الانتقال لصفحة تسجيل الدخول...'
          : '✓ Account created & linked to your Nabataean Passport! Switching to Sign In...'
      );

      showToast(
        isAr
          ? `أهلاً بك يا ${newProfile.firstName}! تم تجهيز بيانات جوازك الأثري.`
          : `Welcome ${newProfile.firstName}! Passport profile is ready.`,
        'success'
      );

      // Transition smoothly to Sign In view as requested
      setTimeout(() => {
        setAuthMode('signin');
        setSuccessMessage(
          isAr
            ? 'تم حفظ بياناتك بنجاح. سجّل دخولك الآن بكلمة المرور للدخول إلى تطبيق وجواز الأنباط.'
            : 'Account registered. Please enter your password to sign in.'
        );
      }, 1500);
    }, 1100);
  };

  // Social Login handlers
  const handleSocialLogin = (provider: 'google' | 'github') => {
    setIsLoading(true);
    showToast(
      isAr ? `جاري الاتصال عبر ${provider === 'google' ? 'Google' : 'GitHub'}...` : `Connecting via ${provider}...`,
      'info'
    );

    setTimeout(() => {
      setIsLoading(false);
      const session: UserSession = {
        email: provider === 'google' ? 'yara.explorer@gmail.com' : 'petra-dev@github.com',
        name: provider === 'google' ? 'يارا (مستكشفة البتراء)' : 'رحالة البتراء التقني',
        firstName: provider === 'google' ? 'يارا' : 'رحالة',
        lastName: provider === 'google' ? 'البتراوي' : 'الأنباط',
        age: 24,
        country: isAr ? 'الأردن' : 'Jordan',
        favoriteDish: isAr ? 'المنسف الكركي بالجميد البلدي' : 'Karak Mansaf',
        photoUrl: '/assets/explorer-portrait.jpg',
        provider,
        signedInAt: new Date().toISOString()
      };
      setSuccessMessage(isAr ? `تمت المصادقة عبر ${provider}! جاري الانتقال...` : `Authorized via ${provider}! Launching...`);
      showToast(isAr ? 'تم تسجيل الدخول بنجاح!' : 'Authorized successfully!', 'success');
      setTimeout(() => {
        onLoginSuccess(session);
      }, 600);
    }, 900);
  };

  // Guest Instant Login
  const handleGuestQuickLogin = () => {
    setIsLoading(true);
    showToast(isAr ? 'جاري الدخول بصفة زائر مستكشف...' : 'Entering as Petra Explorer...', 'info');
    setTimeout(() => {
      setIsLoading(false);
      const session: UserSession = {
        email: 'guest@anbat.petra',
        name: isAr ? 'رحالة الأنباط' : 'Petra Explorer',
        firstName: isAr ? 'رحالة' : 'Petra',
        lastName: isAr ? 'الأنباط' : 'Explorer',
        age: 28,
        country: isAr ? 'الأردن' : 'Jordan',
        favoriteDish: isAr ? 'المنسف الكركي بالجميد البلدي' : 'Jordanian Mansaf',
        photoUrl: '/assets/explorer-portrait.jpg',
        provider: 'guest',
        signedInAt: new Date().toISOString()
      };
      onLoginSuccess(session);
    }, 600);
  };

  return (
    <div
      className="min-h-screen bg-[#240C07] text-[#F6EEE1] font-sans flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-x-hidden selection:bg-[#C8963E]/30 selection:text-[#F6EEE1]"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Ambient Nabataean Sandstone & Golden Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-36 -left-36 w-96 h-96 bg-[#7A2E1D]/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-36 w-96 h-96 bg-[#C8963E]/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-36 left-1/3 w-96 h-96 bg-[#1F6E68]/20 rounded-full blur-3xl"></div>
        {/* Subtle stone pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#c8963e0a_1px,transparent_1px),linear-gradient(to_bottom,#c8963e0a_1px,transparent_1px)] bg-[size:36px_36px] opacity-70"></div>
      </div>

      {/* Top Bar with Language Toggle & App Brand */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-20 py-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#C8963E] via-[#A6381D] to-[#7A2E1D] flex items-center justify-center shadow-lg shadow-[#7A2E1D]/40 border border-[#F6EEE1]/30">
            <span className="font-heading font-black text-xl text-[#F6EEE1]">أن</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-lg tracking-wider text-[#F6EEE1]">ANBAT</span>
              <span className="text-[#C8963E] text-xs font-serif">| أنباط</span>
            </div>
            <span className="text-xs text-[#E8DCC9]/80 block font-sans">
              {isAr ? 'بوابة مستكشفي مدينة بترا الأثرية' : 'Petra Heritage & Explorer Portal'}
            </span>
          </div>
        </div>

        {/* Language Switch Button */}
        <button
          onClick={() => onLanguageChange(isAr ? 'en' : 'ar')}
          className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#3D150B]/90 hover:bg-[#561E12] border border-[#C8963E]/40 text-[#F6EEE1] transition-all shadow-sm cursor-pointer"
        >
          <Languages className="w-4 h-4 text-[#C8963E]" />
          <span>{isAr ? 'English' : 'العربية'}</span>
        </button>
      </header>

      {/* Center Auth Card Container */}
      <main className="w-full max-w-xl mx-auto my-6 relative z-10">
        <div className="relative group">
          {/* Glowing Border Halo */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#C8963E] via-[#7A2E1D] to-[#C8963E] rounded-3xl blur-md opacity-40 group-hover:opacity-60 transition duration-700"></div>

          {/* Main Card with Nabataean Sandstone Aesthetic */}
          <div
            className={`relative rounded-2xl bg-[#33130C]/95 backdrop-blur-xl border-2 border-[#C8963E]/40 shadow-2xl p-6 sm:p-8 transition-all duration-300 ${
              shakeCard ? 'animate-bounce' : ''
            }`}
          >
            {/* Top Emblem & Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7A2E1D] via-[#A83E26] to-[#C8963E] flex items-center justify-center shadow-xl shadow-[#7A2E1D]/50 mb-3 ring-2 ring-[#C8963E]/40">
                <Compass className="w-7 h-7 text-[#F6EEE1]" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-wide text-[#F6EEE1]">
                {authMode === 'signin'
                  ? (isAr ? 'تسجيل الدخول لتطبيق الأنباط' : 'Sign In to ANBAT')
                  : (isAr ? 'إنشاء حساب مستكشف نبطي جديد' : 'Create Explorer Account')}
              </h1>

              <p className="text-xs sm:text-sm text-[#E8DCC9]/80 mt-1.5 max-w-md">
                {authMode === 'signin'
                  ? (isAr ? 'أدخل بريدك وكلمة المرور للوصول لحقيبتك النبطية وجواز سفرك الأثري' : 'Enter your credentials to unlock your Nabataean satchel & passport')
                  : (isAr ? 'سجّل هويتك وأكلتك الأردنية المفضلة ليتم ربطها مباشرة مع جواز سفرك' : 'Register your details & favorite dish to link directly with your passport')}
              </p>
            </div>

            {/* Mode Switch Tabs (Sign In / Sign Up) */}
            <div className="grid grid-cols-2 p-1 bg-[#240C07] rounded-xl border border-[#C8963E]/30 mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-[#C8963E] text-[#240C07] shadow-sm font-bold'
                    : 'text-[#E8DCC9] hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-[#C8963E] text-[#240C07] shadow-sm font-bold'
                    : 'text-[#E8DCC9] hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{isAr ? 'إنشاء حساب جديد (Sign Up)' : 'Sign Up'}</span>
              </button>
            </div>

            {/* Error / Success Alerts */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-700/80 text-rose-200 text-xs font-medium flex items-center gap-2.5 shadow-sm">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-600/80 text-emerald-200 text-xs font-medium flex items-center gap-2.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ========================================================
                SIGN IN FORM
                ======================================================== */}
            {authMode === 'signin' && (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                {/* Email or Username */}
                <div>
                  <label className="block text-xs font-semibold text-[#E8DCC9] uppercase tracking-wider mb-1.5">
                    {isAr ? 'البريد الإلكتروني أو اسم المستخدم' : 'Email or Username'}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 ${isAr ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-[#C8963E]`}>
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={signInIdentifier}
                      onChange={e => setSignInIdentifier(e.target.value)}
                      placeholder={isAr ? 'yara@anbat.jo أو اسم المستخدم' : 'you@example.com'}
                      className={`w-full ${isAr ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-2.5 bg-[#1F0A05]/90 text-[#F6EEE1] placeholder:text-[#E8DCC9]/40 text-sm rounded-xl border border-[#C8963E]/40 focus:outline-none focus:border-[#C8963E] focus:ring-2 focus:ring-[#C8963E]/30 transition`}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#E8DCC9] uppercase tracking-wider mb-1.5">
                    {isAr ? 'كلمة المرور' : 'Password'}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 ${isAr ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-[#C8963E]`}>
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showSignInPassword ? 'text' : 'password'}
                      value={signInPassword}
                      onChange={e => setSignInPassword(e.target.value)}
                      onKeyUp={handleKeyUp}
                      onKeyDown={handleKeyUp}
                      placeholder="••••••••"
                      className={`w-full ${isAr ? 'pr-10 pl-11' : 'pl-10 pr-11'} py-2.5 bg-[#1F0A05]/90 text-[#F6EEE1] placeholder:text-[#E8DCC9]/40 text-sm rounded-xl border border-[#C8963E]/40 focus:outline-none focus:border-[#C8963E] focus:ring-2 focus:ring-[#C8963E]/30 transition`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className={`absolute inset-y-0 ${isAr ? 'left-0 pl-3.5' : 'right-0 pr-3.5'} flex items-center text-[#E8DCC9]/60 hover:text-[#C8963E] transition-colors focus:outline-none cursor-pointer`}
                      title={showSignInPassword ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isAr ? 'إظهار كلمة المرور' : 'Show password')}
                    >
                      {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {capsLockActive && (
                    <div className="text-xs text-amber-400 flex items-center gap-1 mt-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{isAr ? 'زر Caps Lock مفعّل' : 'Caps Lock is ON'}</span>
                    </div>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#C8963E]/50 bg-[#1F0A05] text-[#7A2E1D] focus:ring-[#C8963E]/30 cursor-pointer"
                    />
                    <span className="text-xs text-[#E8DCC9]/90 hover:text-white transition-colors">
                      {isAr ? 'تذكرني على هذا الجهاز' : 'Remember me'}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-xs font-semibold text-[#C8963E] hover:text-[#F4C572] hover:underline transition focus:outline-none cursor-pointer"
                  >
                    {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                  </button>
                </div>

                {/* Primary Sign In Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full relative group overflow-hidden py-3 px-4 rounded-xl text-sm font-bold text-[#F6EEE1] bg-gradient-to-r from-[#7A2E1D] via-[#A83E26] to-[#C8963E] hover:from-[#8B3421] hover:to-[#D4A248] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#7A2E1D]/50 border border-[#F6EEE1]/20 flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{isAr ? 'جارٍ التحقق وفتح تطبيق الأنباط...' : 'Entering ANBAT Companion...'}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 font-heading tracking-wide text-base">
                        <span>{isAr ? 'دخول تطبيق الأنباط' : 'Sign In & Open ANBAT'}</span>
                        <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================
                SIGN UP FORM (With direct connection to Nabataean Passport)
                ======================================================== */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                {/* Banner: Direct passport linking explanation */}
                <div className="p-3 bg-[#1F0A05]/80 rounded-xl border border-[#C8963E]/40 flex items-start gap-2.5 text-xs text-[#E8DCC9]">
                  <BookOpen className="w-5 h-5 text-[#C8963E] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#C8963E] block">
                      {isAr ? 'ربط مباشر مع جواز سفر الأنباط:' : 'Direct Nabataean Passport Link:'}
                    </span>
                    <p className="text-[11px] leading-relaxed text-[#E8DCC9]/90 mt-0.5">
                      {isAr
                        ? 'سيتم طباعة اسمك، عمرك، صورتك، بلدك، وأكلتك الأردنية المفضلة مباشرة في الصفحة 01 من جوازك الأثري التفاعلي.'
                        : 'Your name, age, photo, country, and favorite Jordanian dish will be printed directly onto Page 01 of your Nabataean Passport.'}
                    </p>
                  </div>
                </div>

                {/* First Name & Last Name (Row) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#E8DCC9] uppercase tracking-wider mb-1">
                      {isAr ? 'الاسم الأول *' : 'First Name *'}
                    </label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 ${isAr ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-[#C8963E]`}>
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={signUpFirstName}
                        onChange={e => setSignUpFirstName(e.target.value)}
                        placeholder={isAr ? 'مثال: يارا' : 'e.g. Yara'}
                        className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-[#1F0A05]/90 text-[#F6EEE1] placeholder:text-[#E8DCC9]/40 text-xs rounded-xl border border-[#C8963E]/40 focus:outline-none focus:border-[#C8963E] focus:ring-2 focus:ring-[#C8963E]/30 transition`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#E8DCC9] uppercase tracking-wider mb-1">
                      {isAr ? 'الاسم الثاني / العائلة *' : 'Last Name *'}
                    </label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 ${isAr ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-[#C8963E]`}>
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={signUpLastName}
                        onChange={e => setSignUpLastName(e.target.value)}
                        placeholder={isAr ? 'مثال: محمد' : 'e.g. Mohammed'}
                        className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-[#1F0A05]/90 text-[#F6EEE1] placeholder:text-[#E8DCC9]/40 text-xs rounded-xl border border-[#C8963E]/40 focus:outline-none focus:border-[#C8963E] focus:ring-2 focus:ring-[#C8963E]/30 transition`}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Age & Country (Row) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Age */}
                  <div>
                    <label className="block text-xs font-semibold text-[#E8DCC9] uppercase tracking-wider mb-1">
                      {isAr ? 'العمر (بالسنوات) *' : 'Age *'}
                    </label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 ${isAr ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-[#C8963E]`}>
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={signUpAge}
                        onChange={e => setSignUpAge(e.target.value)}
                        placeholder={isAr ? 'مثال: 24' : 'e.g. 24'}
                        className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-[#1F0A05]/90 text-[#F6EEE1] placeholder:text-[#E8DCC9]/40 text-xs rounded-xl border border-[#C8963E]/40 focus:outline-none focus:border-[#C8963E] focus:ring-2 focus:ring-[#C8963E]/30 transition`}
                        required
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-xs font-semibold text-[#E8DCC9] uppercase tracking-wider mb-1">
                      {isAr ? 'البلد / الجنسية *' : 'Country / Nationality *'}
                    </label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 ${isAr ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-[#C8963E]`}>
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                      <select
                        value={signUpCountryChoice}
                        onChange={e => setSignUpCountryChoice(e.target.value)}
                        className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-[#1F0A05]/90 text-[#F6EEE1] text-xs rounded-xl border border-[#C8963E]/40 focus:outline-none focus:border-[#C8963E] focus:ring-2 focus:ring-[#C8963E]/30 transition cursor-pointer`}
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.id} value={c.id} className="bg-[#240C07] text-[#F6EEE1]">
                            {isAr ? c.nameAr : c.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Custom Country input if other selected */}
                {signUpCountryChoice === 'OTHER' && (
                  <div>
                    <input
                      type="text"
                      value={signUpCustomCountry}
                      onChange={e => setSignUpCustomCountry(e.target.value)}
                      placeholder={isAr ? 'اكتب اسم بلدك هنا...' : 'Type your country name...'}
                      className="w-full px-3 py-2 bg-[#1F0A05]/90 text-[#F6EEE1] placeholder:text-[#E8DCC9]/40 text-xs rounded-xl border border-[#C8963E]/40 focus:outline-none focus:border-[#C8963E]"
                      required
                    />
                  </div>
                )}

                {/* Favorite Jordanian Food */}
                <div>
                  <label className="block text-xs font-semibold text-[#E8DCC9] uppercase tracking-wider mb-1">
                    {isAr ? 'الأكلة الأردنية المفضلة *' : 'Favorite Jordanian Dish *'}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 ${isAr ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-[#C8963E]`}>
                      <Utensils className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={signUpDishChoice}
                      onChange={e => setSignUpDishChoice(e.target.value)}
                      className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-[#1F0A05]/90 text-[#F6EEE1] text-xs rounded-xl border border-[#C8963E]/40 focus:outline-none focus:border-[#C8963E] focus:ring-2 focus:ring-[#C8963E]/30 transition cursor-pointer`}
                    >
                      {JORDANIAN_DISHES.map(d => (
                        <option key={d.id} value={d.id} className="bg-[#240C07] text-[#F6EEE1]">
                          {isAr ? d.nameAr : d.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {signUpDishChoice === 'other' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={signUpCustomDish}
                        onChange={e => setSignUpCustomDish(e.target.value)}
                        placeholder={isAr ? 'اكتب أكلتك الأردنية المفضلة (مثل: كباب بتراوي، شوربة عدس...)' : 'Type your favorite dish...'}
                        className="w-full px-3 py-2 bg-[#1F0A05]/90 text-[#F6EEE1] placeholder:text-[#E8DCC9]/40 text-xs rounded-xl border border-[#C8963E]/40 focus:outline-none focus:border-[#C8963E]"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Profile Photo (Optional / اختياري) */}
                <div className="p-3 bg-[#1F0A05]/60 rounded-xl border border-[#C8963E]/30">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-[#E8DCC9] uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#C8963E]" />
                      <span>{isAr ? 'الصورة الشخصية للجواز (اختياري)' : 'Passport Photo (Optional)'}</span>
                    </label>
                    <span className="text-[10px] text-[#C8963E] font-serif">
                      {isAr ? 'تظهر على غلاف وصفحة الجواز' : 'Appears on passport'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Preview box */}
                    <div className="w-16 h-20 rounded-lg border-2 border-[#C8963E] bg-[#240C07] p-0.5 overflow-hidden shrink-0 shadow-md relative group">
                      <img
                        src={signUpPhotoUrl || '/assets/explorer-portrait.jpg'}
                        alt="Profile preview"
                        className="w-full h-full object-cover rounded"
                      />
                      {signUpPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setSignUpPhotoUrl('')}
                          className="absolute top-0.5 right-0.5 bg-rose-900/90 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                          title="حذف الصورة"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#3D150B] hover:bg-[#561E12] border border-[#C8963E]/40 text-xs font-semibold text-[#F6EEE1] transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#C8963E]" />
                        <span>{isAr ? 'اختر صورة من جهازك' : 'Upload from device'}</span>
                      </button>

                      <p className="text-[10px] text-[#E8DCC9]/60">
                        {isAr
                          ? 'JPG أو PNG. إذا لم ترفع صورة، سيتم وضع صورة المستكشف النبطي الافتراضية.'
                          : 'JPG or PNG. If omitted, default explorer portrait is used.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#E8DCC9] uppercase tracking-wider mb-1">
                    {isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 ${isAr ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-[#C8963E]`}>
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      value={signUpEmail}
                      onChange={e => setSignUpEmail(e.target.value)}
                      placeholder="explorer@example.com"
                      className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-[#1F0A05]/90 text-[#F6EEE1] placeholder:text-[#E8DCC9]/40 text-xs rounded-xl border border-[#C8963E]/40 focus:outline-none focus:border-[#C8963E] focus:ring-2 focus:ring-[#C8963E]/30 transition`}
                      required
                    />
                  </div>
                </div>

                {/* Password & Confirm Password (Row) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-[#E8DCC9] uppercase tracking-wider mb-1">
                      {isAr ? 'كلمة المرور *' : 'Password *'}
                    </label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 ${isAr ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-[#C8963E]`}>
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        value={signUpPassword}
                        onChange={e => setSignUpPassword(e.target.value)}
                        onKeyUp={handleKeyUp}
                        placeholder="••••••••"
                        className={`w-full ${isAr ? 'pr-9 pl-9' : 'pl-9 pr-9'} py-2 bg-[#1F0A05]/90 text-[#F6EEE1] placeholder:text-[#E8DCC9]/40 text-xs rounded-xl border border-[#C8963E]/40 focus:outline-none focus:border-[#C8963E] transition`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className={`absolute inset-y-0 ${isAr ? 'left-0 pl-2.5' : 'right-0 pr-2.5'} flex items-center text-[#E8DCC9]/60 hover:text-[#C8963E] cursor-pointer`}
                      >
                        {showSignUpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-[#E8DCC9] uppercase tracking-wider mb-1">
                      {isAr ? 'تأكيد كلمة المرور *' : 'Confirm Password *'}
                    </label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 ${isAr ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-[#C8963E]`}>
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={signUpConfirmPassword}
                        onChange={e => setSignUpConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full ${isAr ? 'pr-9 pl-9' : 'pl-9 pr-9'} py-2 bg-[#1F0A05]/90 text-[#F6EEE1] placeholder:text-[#E8DCC9]/40 text-xs rounded-xl border border-[#C8963E]/40 focus:outline-none focus:border-[#C8963E] transition`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute inset-y-0 ${isAr ? 'left-0 pl-2.5' : 'right-0 pr-2.5'} flex items-center text-[#E8DCC9]/60 hover:text-[#C8963E] cursor-pointer`}
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Sign Up Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full relative group overflow-hidden py-3 px-4 rounded-xl text-sm font-bold text-[#F6EEE1] bg-gradient-to-r from-[#7A2E1D] via-[#A83E26] to-[#C8963E] hover:from-[#8B3421] hover:to-[#D4A248] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#7A2E1D]/50 border border-[#F6EEE1]/20 flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{isAr ? 'جارٍ تسجيل الحساب وتجهيز الجواز الأثري...' : 'Registering & preparing passport...'}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 font-heading tracking-wide text-sm sm:text-base">
                        <span>{isAr ? 'إتمام التسجيل والانتقال لصفحة الدخول' : 'Complete Sign Up & Go to Sign In'}</span>
                        <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Quick Guest Access & Social Logins */}
            <div className="mt-5 pt-4 border-t border-[#C8963E]/20">
              <button
                type="button"
                onClick={handleGuestQuickLogin}
                className="w-full py-2.5 px-3 bg-[#3D150B]/80 hover:bg-[#561E12] border border-[#C8963E]/40 rounded-xl text-xs font-semibold text-[#F6EEE1] transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Compass className="w-4 h-4 text-[#C8963E]" />
                <span>{isAr ? 'دخول فوري مباشر كزائر استكشافي (بدون كلمة مرور)' : 'Quick Explorer Guest Access (1-Click)'}</span>
              </button>
            </div>

            {/* "Or continue with" Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#C8963E]/30"></div>
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-[#33130C] px-3 text-[#E8DCC9]/70 font-medium">
                  {isAr ? 'أو عبر الحسابات السريعة' : 'Or continue with'}
                </span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="w-full py-2.5 px-4 bg-[#1F0A05]/90 hover:bg-[#3D150B] border border-[#C8963E]/40 rounded-xl text-xs font-semibold text-[#F6EEE1] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27a7.24 7.24 0 0 1 0-4.54V6.58H1.25a12.008 12.008 0 0 0 0 10.84l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('github')}
                className="w-full py-2.5 px-4 bg-[#1F0A05]/90 hover:bg-[#3D150B] border border-[#C8963E]/40 rounded-xl text-xs font-semibold text-[#F6EEE1] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-[#F6EEE1]" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            {/* Footer switcher link */}
            <div className="mt-5 pt-3 border-t border-[#C8963E]/20 text-center">
              <p className="text-xs text-[#E8DCC9]/80">
                {authMode === 'signup'
                  ? (isAr ? 'لديك حساب بالفعل؟' : 'Already have an account?')
                  : (isAr ? 'ليس لديك حساب بعد؟' : "Don't have an account?")}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-[#C8963E] hover:text-[#F4C572] mx-1.5 hover:underline transition focus:outline-none cursor-pointer"
                >
                  {authMode === 'signup'
                    ? (isAr ? 'تسجيل الدخول' : 'Sign In')
                    : (isAr ? 'إنشاء حساب جديد (Sign Up)' : 'Sign Up')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="max-w-md mx-auto text-center text-xs text-[#E8DCC9]/60 py-3">
        <span>© 2026 ANBAT (أنباط) • سلطة إقليم البترا التنموي السياحي</span>
      </footer>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#33130C] border-2 border-[#C8963E]/50 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-[#F6EEE1]">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-[#E8DCC9]/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-11 h-11 rounded-xl bg-[#7A2E1D] text-[#C8963E] border border-[#C8963E]/40 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-heading font-bold text-[#F6EEE1]">
              {isAr ? 'استعادة كلمة المرور' : 'Reset Password'}
            </h3>
            <p className="text-xs text-[#E8DCC9]/80 mt-1 mb-4">
              {isAr
                ? 'أدخل بريدك الإلكتروني المسجل وسنرسل لك رابط استعادة فوري لحسابك الأثري.'
                : "Enter your registered email and we'll send a password recovery link."}
            </p>
            <form
              onSubmit={e => {
                e.preventDefault();
                setIsForgotModalOpen(false);
                showToast(
                  isAr
                    ? `تم إرسال تعليمات الاستعادة إلى ${forgotEmail || signInIdentifier}`
                    : `Reset link sent to ${forgotEmail || signInIdentifier}`,
                  'success'
                );
              }}
              className="space-y-3"
            >
              <input
                type="email"
                defaultValue={signInIdentifier.includes('@') ? signInIdentifier : ''}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 bg-[#1F0A05] text-[#F6EEE1] text-xs rounded-xl border border-[#C8963E]/40 focus:outline-none focus:border-[#C8963E]"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#7A2E1D] hover:bg-[#8B3421] text-[#F6EEE1] text-xs font-bold rounded-xl border border-[#C8963E]/40 transition cursor-pointer"
              >
                {isAr ? 'إرسال رابط الاستعادة' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-[#1F6E68] text-white border-white/30'
              : toast.type === 'error'
              ? 'bg-rose-950 text-rose-200 border-rose-700/80'
              : 'bg-[#561E12] text-[#F6EEE1] border-[#C8963E]/50'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          ) : (
            <Sparkles className="w-4 h-4 text-[#C8963E]" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};
