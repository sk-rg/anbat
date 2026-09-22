/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language, VisitorGuideBadge } from '../types';
import { CREATURES } from '../data/creatures';
import { askGuideCreature } from '../services/geminiService';
import { CreatureSvg } from './CreatureSvg';
import {
  Send,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  Clock,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  RefreshCw,
  Languages,
  Info,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Search
} from 'lucide-react';

interface ChatGuideProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeBadge: VisitorGuideBadge | null;
  initialQuestion?: string;
  onOpenSatchel: () => void;
  onOpenAdmin: () => void;
}

export const ChatGuide: React.FC<ChatGuideProps> = ({
  language,
  onLanguageChange,
  activeBadge,
  initialQuestion,
  onOpenSatchel,
  onOpenAdmin
}) => {
  const isAr = language === 'ar';

  const activeCreature = activeBadge ? CREATURES[activeBadge.creatureId] || CREATURES.camel : CREATURES.camel;
  const guideName = activeBadge?.customName || (isAr ? activeCreature.nameAr : activeCreature.nameEn);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'creature',
      text: isAr
        ? `أهلاً بك يا رحالة بترا! أنا دليلك النبطي ${guideName} (${activeCreature.nameAr}). يمكنك سؤالي عن آثار بترا، أو هندسة السدود والقنوات، أو أوقات الزيارة الحالية وتذاكر الدخول، أو الطقس وفعالية البترا ليلاً. إجاباتي معززة ببحث Google المباشر والسجلات الأثرية المحققة.`
        : `Greetings traveler! I am ${guideName} (${activeCreature.nameEn}), your Nabataean companion. Ask me about Petra's carved monuments, hydraulic water dams, live opening hours, tickets, or Petra by Night. My answers are powered by live Google Search grounding and verified archaeological archives.`,
      language,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: ['ANBAT Verified Petra Archive', 'Google Search Grounding']
    }
  ]);

  const [inputQuestion, setInputQuestion] = useState(initialQuestion || '');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [queuedNotification, setQueuedNotification] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'monuments' | 'logistics' | 'engineering' | 'myths'>('all');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialQuestion) {
      setInputQuestion(initialQuestion);
    }
  }, [initialQuestion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Stop speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-to-speech audio reader for the guide
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean text of markdown formatting for cleaner speech
    const cleanText = text.replace(/[*#_`~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isAr ? 'ar-SA' : 'en-US';
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyText = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Curated demo questions categorized for fast discovery
  const suggestedQueries = [
    {
      category: 'logistics',
      labelEn: 'Hours & Tickets 2026',
      labelAr: 'ساعات العمل والأسعار 2026',
      textEn: 'What are the current Petra site opening hours, ticket prices, and does the Jordan Pass include them?',
      textAr: 'ما هي ساعات عمل موقع البترا حالياً وأسعار التذاكر وهل يشملها تصريح جوردان باس (Jordan Pass)؟'
    },
    {
      category: 'logistics',
      labelEn: 'Petra by Night',
      labelAr: 'فعالية البترا ليلاً',
      textEn: 'When is Petra by Night held, what is the ticket price, and what does the candle experience include?',
      textAr: 'متى تقام فعالية البترا ليلاً (Petra by Night) وكم سعر تذكرتها وكيف تنظم مسيرة الشموع؟'
    },
    {
      category: 'monuments',
      labelEn: 'Treasury Architecture',
      labelAr: 'عمارة الخزنة',
      textEn: 'Who carved Al-Khazneh (The Treasury) and what purpose did its lower chambers serve?',
      textAr: 'من نحت الخزنة ولأي غرض شيدت وماذا كشفت الحفريات الحديثة في غرفها السفلية؟'
    },
    {
      category: 'monuments',
      labelEn: 'The Monastery Hike',
      labelAr: 'درب صعود الدير',
      textEn: 'How many steps lead to Ad-Deir (The Monastery) and what is its significance in Nabataean history?',
      textAr: 'كم عدد درجات الصعود إلى الدير (Ad-Deir) وما هي أهميته الدينية للملك عبادة الأول؟'
    },
    {
      category: 'engineering',
      labelEn: 'Water Engineering',
      labelAr: 'هندسة المياه النبطية',
      textEn: 'How did the Nabataeans collect rainwater and divert flash floods using terracotta aqueducts and dams?',
      textAr: 'كيف جمع الأنباط مياه الأمطار ودرؤوا مخاطر السيول عبر القنوات الفخارية والسدود التحويلية؟'
    },
    {
      category: 'myths',
      labelEn: 'Treasury Gold Myth',
      labelAr: 'حقيقة ذهب الخزنة',
      textEn: 'Is there really Pharaoh gold concealed inside the Treasury urn or is it solid sandstone?',
      textAr: 'هل يوجد ذهب حقيقي لفرعون مخبأ داخل جرة الخزنة أم أنها حجر رملي صلب بالكامل؟'
    },
    {
      category: 'myths',
      labelEn: 'Djinn Blocks Truth',
      labelAr: 'حقيقة مكعبات الجن',
      textEn: 'What are the mysterious Djinn Blocks near the Siq entrance according to archaeological inscriptions?',
      textAr: 'ما هي حقيقة مكعبات الجن المنحوتة في باب السيق حسب النقوش الأثرية النبطية؟'
    },
    {
      category: 'myths',
      labelEn: 'Negative Test',
      labelAr: 'اختبار تاريخي (عدم المعرفة)',
      textEn: 'Did the Nabataeans cultivate mango plantations and use steam locomotives?',
      textAr: 'هل قام الأنباط بزراعة أشجار المانجو واستخدام القطارات البخارية في بترا؟'
    }
  ];

  const filteredQueries = activeTab === 'all'
    ? suggestedQueries
    : suggestedQueries.filter(q => q.category === activeTab);

  const handleSendMessage = async (queryToSend?: string) => {
    const raw = queryToSend !== undefined ? queryToSend : inputQuestion;
    const trimmed = raw.trim();

    // 1. Validation checks
    if (!trimmed) {
      setValidationError(isAr ? 'يرجى كتابة سؤالك أولاً!' : 'Please enter a question for your guide.');
      return;
    }

    if (trimmed.length > 500) {
      setValidationError(
        isAr
          ? `تجاوز السؤال الحد المسموح (500 حرف). سؤالك الحالي ${trimmed.length}/500 حرف.`
          : `Question exceeds the 500 character limit (currently ${trimmed.length}/500). Please shorten your inquiry.`
      );
      return;
    }

    setValidationError(null);
    setQueuedNotification(null);

    // Append user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      language,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const response = await askGuideCreature(
        trimmed,
        guideName,
        activeCreature.nameEn,
        language
      );

      const creatureMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'creature',
        text: response.text,
        language,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources,
        groundingUrls: response.groundingUrls,
        searchQueries: response.searchQueries,
        isFallback: response.isFallback,
        isUnknown: response.isUnknown,
        queuedForReview: response.queuedForReview
      };

      setMessages(prev => [...prev, creatureMsg]);

      // If question was automatically added to unanswered queue, show feedback
      if (response.queuedForReview || response.isUnknown) {
        setQueuedNotification(
          isAr
            ? 'تم إرسال هذا السؤال تلقائياً إلى قائمة تدقيق فريق إدارة الموقع (Admin Queue) للمراجعة وتحديث قاعدة المعرفة.'
            : 'Question automatically added to the Site Manager "Unanswered Questions" queue for review!'
        );
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'system',
        text: err.message || (isAr ? 'تعذر إرسال السؤال.' : 'Failed to send question.'),
        language,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF5ED] rounded-xl border border-[#C8963E]/30 p-5 md:p-7 shadow-md mb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#C8963E]/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white border-2 border-[#C8963E] flex items-center justify-center p-1.5 shadow-sm">
            <CreatureSvg type={activeCreature.svgArtKey} className="w-full h-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#7A2E1D] text-[#F6EEE1] text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="font-heading font-bold text-xl text-[#7A2E1D]">
                {guideName}
              </h2>
              <span className="text-xs bg-[#C8963E]/20 text-[#7A2E1D] border border-[#C8963E]/40 px-2 py-0.5 rounded font-semibold">
                {activeCreature.rarity}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] text-[#1F6E68] font-bold">
                <Globe className="w-3 h-3 text-[#1F6E68]" />
                {isAr ? 'مدعوم ببحث Google المباشر (Search Grounded)' : 'Google Search Grounding Live'}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-mono">
                gemini-3.5-flash
              </span>
            </div>
          </div>
        </div>

        {/* Language switch & Satchel quick link */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onLanguageChange(isAr ? 'en' : 'ar')}
            className="text-xs bg-white hover:bg-stone-50 text-[#7A2E1D] border border-[#C8963E]/40 px-2.5 py-1.5 rounded flex items-center gap-1.5 transition font-semibold cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-[#C8963E]" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>
          {!activeBadge && (
            <button
              onClick={onOpenSatchel}
              className="text-xs bg-[#C8963E] hover:bg-[#b5832f] text-[#331C16] font-bold px-3 py-1.5 rounded shadow-sm transition cursor-pointer"
            >
              {isAr ? 'افتح الحقيبة أولاً 🎒' : 'Open Satchel 🎒'}
            </button>
          )}
        </div>
      </div>

      {/* Grounding System Rules Notice */}
      <div className="mb-4 bg-stone-100/90 border-l-4 border-[#C8963E] p-2.5 rounded text-[11px] text-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#7A2E1D] text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
            G
          </div>
          <span>
            {isAr
              ? 'ضمان الدقة والأمان: يستند دليلك إلى السجلات الأثرية النبطية المعتمدة ونتائج بحث Google اللحظية للأسعار ومواعيد الزيارة والطقس.'
              : 'Search Grounding: Answers are grounded in verified Nabataean archives & live Google Search data for accurate hours, fees, and conditions.'}
          </span>
        </div>
        <button
          onClick={onOpenAdmin}
          className="text-[#1F6E68] font-bold hover:underline shrink-0 text-[11px] cursor-pointer"
        >
          {isAr ? 'عرض طابور تدقيق الموقع ←' : 'View Site Queue →'}
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="bg-white rounded-xl border border-[#E8DCC9] shadow-inner p-4 min-h-[360px] max-h-[460px] overflow-y-auto space-y-4 mb-4">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                {msg.text}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-[#FAF5ED] border border-[#C8963E] flex items-center justify-center text-sm shadow-xs shrink-0 mt-0.5">
                  {activeCreature.icon}
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-[#7A2E1D] text-[#F6EEE1] rounded-tr-xs'
                    : msg.isFallback
                    ? 'bg-amber-50/90 border border-amber-300 text-[#331C16] rounded-tl-xs'
                    : msg.isUnknown
                    ? 'bg-stone-100 border border-stone-300 text-stone-900 rounded-tl-xs'
                    : 'bg-[#FAF5ED] border border-[#E8DCC9] text-[#331C16] rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Google Search Queries Conducted */}
                {msg.searchQueries && msg.searchQueries.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#E8DCC9]/70 flex flex-wrap items-center gap-1.5 text-[11px] text-stone-600">
                    <span className="font-semibold text-[#1F6E68] flex items-center gap-1">
                      <Search className="w-3 h-3 text-[#1F6E68]" />
                      {isAr ? 'تم البحث في Google عن:' : 'Google Search Query:'}
                    </span>
                    {msg.searchQueries.map((q, idx) => (
                      <span
                        key={idx}
                        className="bg-white/90 border border-[#C8963E]/30 px-1.5 py-0.5 rounded text-[10px] text-stone-700 font-mono"
                      >
                        "{q}"
                      </span>
                    ))}
                  </div>
                )}

                {/* Google Search Grounding Citations & Web Links */}
                {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#E8DCC9]/70 space-y-1">
                    <div className="text-[11px] font-bold text-[#1F6E68] flex items-center gap-1">
                      <Globe className="w-3 h-3 text-[#1F6E68]" />
                      {isAr ? 'مصادر الويب الموثقة (Google Search):' : 'Web Grounding Citations (Google Search):'}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {msg.groundingUrls.map((item, idx) => (
                        <a
                          key={idx}
                          href={item.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white hover:bg-emerald-50 border border-emerald-200/80 px-2 py-1 rounded text-[11px] text-[#1F6E68] flex items-center justify-between gap-1 transition shadow-2xs group"
                        >
                          <span className="truncate font-medium group-hover:underline">
                            {item.title || item.uri}
                          </span>
                          <ExternalLink className="w-3 h-3 shrink-0 text-emerald-600" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Local Verified Archaeological Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#E8DCC9]/70 flex flex-wrap items-center gap-1.5 text-[11px] text-[#7A2E1D]">
                    <span className="font-semibold flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-[#C8963E]" />
                      {isAr ? 'السجلات الأثرية:' : 'Verified Archives:'}
                    </span>
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className="bg-white/80 border border-[#C8963E]/30 px-1.5 py-0.5 rounded text-[10px] text-stone-700 font-medium"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                )}

                {/* Queue Tag if unknown */}
                {msg.queuedForReview && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-800 font-semibold bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                    <Clock className="w-3 h-3 text-amber-700" />
                    <span>
                      {isAr
                        ? 'مُدرج تلقائياً في طابور مراجعة إدارة الموقع'
                        : 'Queued in Site Manager Unanswered Review'}
                    </span>
                  </div>
                )}

                {/* Bottom Actions: Copy, Speak, Timestamp */}
                <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-black/5 text-[10px] text-stone-400">
                  <div className="flex items-center gap-1.5">
                    {!isUser && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleToggleSpeak(msg.id, msg.text)}
                          title={isAr ? 'استمع للدليل الصوتي' : 'Listen to audio guide'}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition cursor-pointer ${
                            speakingMsgId === msg.id
                              ? 'bg-[#7A2E1D] text-[#F6EEE1] font-bold'
                              : 'hover:bg-stone-200/60 text-stone-600'
                          }`}
                        >
                          {speakingMsgId === msg.id ? (
                            <>
                              <VolumeX className="w-3 h-3 text-amber-300" />
                              <span className="text-[10px]">{isAr ? 'إيقاف' : 'Stop'}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-[#7A2E1D]" />
                              <span className="text-[10px]">{isAr ? 'استماع 🔊' : 'Listen'}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          title={isAr ? 'نسخ الإجابة' : 'Copy answer'}
                          className="flex items-center gap-1 hover:bg-stone-200/60 text-stone-600 px-1.5 py-0.5 rounded transition cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-[10px] text-emerald-700 font-bold">{isAr ? 'تم النسخ' : 'Copied'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-stone-500" />
                              <span className="text-[10px]">{isAr ? 'نسخ' : 'Copy'}</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>

                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-[#7A2E1D] text-[#F6EEE1] flex items-center justify-center text-xs font-bold shadow-xs shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-2.5 justify-start">
            <div className="w-8 h-8 rounded-full bg-[#FAF5ED] border border-[#C8963E] flex items-center justify-center text-sm shadow-xs shrink-0">
              {activeCreature.icon}
            </div>
            <div className="bg-[#FAF5ED] border border-[#E8DCC9] rounded-2xl px-4 py-3 text-xs text-stone-600 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#7A2E1D]" />
              <span>
                {isAr
                  ? `${guideName} يتحقق من بحث Google والسجلات الأثرية النبطية...`
                  : `${guideName} is checking Google Search & Nabataean archives...`}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Queued Feedback Banner */}
      {queuedNotification && (
        <div className="mb-3 bg-amber-50 border border-amber-300 rounded-lg p-2.5 flex items-center justify-between text-xs text-amber-900 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{queuedNotification}</span>
          </div>
          <button
            onClick={onOpenAdmin}
            className="text-xs bg-[#7A2E1D] text-[#F6EEE1] px-2.5 py-1 rounded font-semibold shrink-0 hover:bg-[#612215] transition cursor-pointer"
          >
            {isAr ? 'افتح لوحة الإدارة لإجابة السؤال' : 'Answer in Admin'}
          </button>
        </div>
      )}

      {/* Inline Validation Warning */}
      {validationError && (
        <div className="mb-3 bg-red-50 border border-red-300 text-red-800 rounded-lg p-2 text-xs flex items-center gap-1.5 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Categorized Suggested Questions */}
      <div className="mb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold text-[#7A2E1D] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C8963E]" />
            {isAr ? 'استكشف مع الدليل:' : 'Explore with Guide:'}
          </span>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2 py-0.5 rounded-full font-medium transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#7A2E1D] text-[#F6EEE1]'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {isAr ? 'الكل' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('logistics')}
              className={`px-2 py-0.5 rounded-full font-medium transition cursor-pointer ${
                activeTab === 'logistics'
                  ? 'bg-[#7A2E1D] text-[#F6EEE1]'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {isAr ? 'مواعيد وتذاكر 🕒' : 'Hours & Tickets 🕒'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('monuments')}
              className={`px-2 py-0.5 rounded-full font-medium transition cursor-pointer ${
                activeTab === 'monuments'
                  ? 'bg-[#7A2E1D] text-[#F6EEE1]'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {isAr ? 'الآثار 🏛️' : 'Monuments 🏛️'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('engineering')}
              className={`px-2 py-0.5 rounded-full font-medium transition cursor-pointer ${
                activeTab === 'engineering'
                  ? 'bg-[#7A2E1D] text-[#F6EEE1]'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {isAr ? 'الهندسة 💧' : 'Hydraulics 💧'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {filteredQueries.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(isAr ? q.textAr : q.textEn)}
              disabled={isLoading}
              className="text-[11px] bg-white hover:bg-[#FAF5ED] text-[#331C16] border border-[#C8963E]/40 rounded-full px-3 py-1 transition flex items-center gap-1 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#C8963E]" />
              <span>{isAr ? q.labelAr : q.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form with Char Counter */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="space-y-1.5"
      >
        <div className="flex items-center gap-2">
          <input
            id="input-chat-question"
            type="text"
            value={inputQuestion}
            onChange={e => {
              setInputQuestion(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder={
              isAr
                ? `اسأل ${guideName} (مثال: كم تذكرة الدخول؟ أو كيف حفر الأنباط الخزنة؟)...`
                : `Ask ${guideName} (e.g. Current ticket price, or how was the Treasury carved?)...`
            }
            disabled={isLoading}
            className="flex-1 bg-white border border-[#C8963E]/50 rounded-lg px-4 py-2.5 text-xs md:text-sm text-[#331C16] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7A2E1D] shadow-xs"
          />

          <button
            id="btn-chat-send"
            type="submit"
            disabled={isLoading || !inputQuestion.trim()}
            className="bg-[#7A2E1D] hover:bg-[#632416] text-[#F6EEE1] px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
          >
            <span>{isAr ? 'إرسال' : 'Ask'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-[#1F6E68]" />
            <span>
              {isAr
                ? 'بحث Google مباشر + أرشيف البترا النبطي المعتمد'
                : 'Live Google Search Grounding + Verified Petra Archives'}
            </span>
          </div>
          <span className={inputQuestion.length > 500 ? 'text-red-600 font-bold' : ''}>
            {inputQuestion.length} / 500
          </span>
        </div>
      </form>
    </div>
  );
};

