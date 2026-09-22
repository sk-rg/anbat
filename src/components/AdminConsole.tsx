/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  KnowledgeEntry,
  MonumentConditionEntry,
  UnansweredQuestion,
  IntegrityVerificationResult,
  Language
} from '../types';
import { storageService } from '../services/storageService';
import {
  appendConditionEntry,
  verifyChainIntegrity,
  simulateTampering,
  resetConditionLogs,
  initializeConditionChain
} from '../services/hashChainService';
import { LANDMARKS } from '../data/landmarks';
import {
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  FileText,
  Upload,
  RefreshCw,
  PlusCircle,
  Check,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Eye,
  Camera,
  Info
} from 'lucide-react';

interface AdminConsoleProps {
  language: Language;
  onQuestionResolved?: (entry: KnowledgeEntry) => void;
  onBackToVisitor: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  language,
  onQuestionResolved,
  onBackToVisitor
}) => {
  const isAr = language === 'ar';

  // Password authentication state ("admin123" simple demo gate)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Sub-tabs: 1. Unanswered Queue | 2. Knowledge Base | 3. Monument Condition Register
  const [activeTab, setActiveTab] = useState<'queue' | 'kb' | 'register'>('queue');

  // Unanswered Questions Queue State
  const [unansweredQueue, setUnansweredQueue] = useState<UnansweredQuestion[]>([]);
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [approvedAnswerText, setApprovedAnswerText] = useState('');
  const [queueError, setQueueError] = useState<string | null>(null);
  const [resolvedSuccessMessage, setResolvedSuccessMessage] = useState<string | null>(null);

  // Knowledge Base Manager State
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [isAddingNewKb, setIsAddingNewKb] = useState(false);
  const [kbTitleEn, setKbTitleEn] = useState('');
  const [kbTitleAr, setKbTitleAr] = useState('');
  const [kbContentEn, setKbContentEn] = useState('');
  const [kbContentAr, setKbContentAr] = useState('');
  const [kbCategory, setKbCategory] = useState<'landmark' | 'engineering' | 'beliefs' | 'myth' | 'condition'>('landmark');
  const [kbKeywords, setKbKeywords] = useState('');
  const [kbError, setKbError] = useState<string | null>(null);
  const [kbSuccess, setKbSuccess] = useState<string | null>(null);

  // Monument Condition Register State
  const [conditionLogs, setConditionLogs] = useState<MonumentConditionEntry[]>([]);
  const [verificationResult, setVerificationResult] = useState<IntegrityVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tamperMessage, setTamperMessage] = useState<string | null>(null);

  // Append new condition log form
  const [newLogLandmark, setNewLogLandmark] = useState('siq');
  const [newLogNote, setNewLogNote] = useState('');
  const [newLogSeverity, setNewLogSeverity] = useState<number>(2);
  const [newLogPhotoBase64, setNewLogPhotoBase64] = useState<string | undefined>(undefined);
  const [logFormError, setLogFormError] = useState<string | null>(null);
  const [logFormSuccess, setLogFormSuccess] = useState<string | null>(null);
  const [isAppending, setIsAppending] = useState(false);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setUnansweredQueue(storageService.getUnansweredQueue());
    setKnowledgeList(storageService.getKnowledgeBase());
    const chain = await initializeConditionChain();
    setConditionLogs(chain);
  };

  // Password submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin123') {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError(isAr ? 'كلمة المرور غير صحيحة. كلمة مرور العرض هي: admin123' : 'Incorrect password. Demo password is: admin123');
    }
  };

  // 1. Resolve Unanswered Question
  const handleResolveQuestion = (qId: string) => {
    const target = unansweredQueue.find(q => q.id === qId);
    if (!target) return;

    if (!approvedAnswerText.trim()) {
      setQueueError(isAr ? 'يرجى كتابة الإجابة المعتمدة أولاً.' : 'Please enter an approved answer.');
      return;
    }

    setQueueError(null);
    const newKbEntry = storageService.resolveQuestionWithAnswer(qId, approvedAnswerText.trim());

    if (newKbEntry) {
      setUnansweredQueue(storageService.getUnansweredQueue());
      setKnowledgeList(storageService.getKnowledgeBase());
      setAnsweringQuestionId(null);
      setApprovedAnswerText('');
      setResolvedSuccessMessage(
        isAr
          ? `✓ تم اعتماد الإجابة وإضافتها لقاعدة المعرفة! يمكن للمرشد الذكي الآن الإجابة عن سؤال: "${target.question}"`
          : `✓ Approved answer saved to knowledge base! The AI guide is now empowered to answer: "${target.question}"`
      );
      if (onQuestionResolved) {
        onQuestionResolved(newKbEntry);
      }
    }
  };

  // 2. Add or Edit Knowledge Base Entry
  const handleSaveKbEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbTitleEn.trim() || !kbContentEn.trim()) {
      setKbError(isAr ? 'يرجى ملء العنوان والمحتوى باللغة الإنجليزية على الأقل.' : 'Please enter at least English title and content.');
      return;
    }

    setKbError(null);
    const kwArray = kbKeywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const entryToSave: KnowledgeEntry = {
      id: editingEntry ? editingEntry.id : `kb-manual-${Date.now()}`,
      titleEn: kbTitleEn.trim(),
      titleAr: kbTitleAr.trim() || kbTitleEn.trim(),
      category: kbCategory,
      contentEn: kbContentEn.trim(),
      contentAr: kbContentAr.trim() || kbContentEn.trim(),
      keywords: kwArray.length > 0 ? kwArray : [kbTitleEn.toLowerCase().slice(0, 10)],
      addedBy: 'admin',
      createdAt: new Date().toISOString()
    };

    storageService.addKnowledgeEntry(entryToSave);
    setKnowledgeList(storageService.getKnowledgeBase());
    setKbSuccess(isAr ? 'تم حفظ السجل المعرفي بنجاح!' : 'Knowledge entry saved successfully!');

    // Reset form
    setEditingEntry(null);
    setIsAddingNewKb(false);
    setKbTitleEn('');
    setKbTitleAr('');
    setKbContentEn('');
    setKbContentAr('');
    setKbKeywords('');
  };

  const startEditKb = (entry: KnowledgeEntry) => {
    setEditingEntry(entry);
    setIsAddingNewKb(true);
    setKbTitleEn(entry.titleEn);
    setKbTitleAr(entry.titleAr);
    setKbContentEn(entry.contentEn);
    setKbContentAr(entry.contentAr);
    setKbCategory(entry.category);
    setKbKeywords(entry.keywords.join(', '));
  };

  // 3. Append New Monument Condition Log
  const handleAppendLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogNote.trim()) {
      setLogFormError(isAr ? 'يرجى كتابة ملاحظة المعاينة الأثرية.' : 'Please enter condition note.');
      return;
    }
    if (newLogSeverity < 1 || newLogSeverity > 5) {
      setLogFormError(isAr ? 'درجة الخطورة يجب أن تكون بين 1 و 5.' : 'Severity must be between 1 and 5.');
      return;
    }

    setLogFormError(null);
    setIsAppending(true);

    try {
      await appendConditionEntry(
        newLogLandmark,
        newLogNote.trim(),
        Number(newLogSeverity),
        newLogPhotoBase64
      );

      const updated = storageService.getConditionLogs();
      setConditionLogs(updated);
      setNewLogNote('');
      setNewLogPhotoBase64(undefined);
      setLogFormSuccess(isAr ? '✓ تم تسجيل البلوك في السلسلة وحساب SHA-256 بنجاح!' : '✓ Block appended to chain with SHA-256 hash!');
      // Re-verify
      const vResult = await verifyChainIntegrity();
      setVerificationResult(vResult);
    } catch (err: any) {
      setLogFormError(err.message || 'Error creating condition block.');
    } finally {
      setIsAppending(false);
    }
  };

  // Handle Photo Upload as Base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setLogFormError(isAr ? 'حجم الصورة كبير جداً (الحد الأقصى 2MB).' : 'Image size too large (max 2MB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewLogPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Verify Chain Integrity
  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    setTamperMessage(null);
    try {
      const res = await verifyChainIntegrity();
      setVerificationResult(res);
    } finally {
      setIsVerifying(false);
    }
  };

  // Simulate Tampering
  const handleSimulateTamper = () => {
    const tamperRes = simulateTampering(2);
    if (tamperRes.success) {
      setConditionLogs(storageService.getConditionLogs());
      setTamperMessage(
        isAr
          ? `[تمت محاكاة التلاعب بنجاح]: تم تعديل السجل رقم 2 سراً في التخزين (${tamperRes.alteredField}). اضغط الآن على "التحقق من سلامة السلسلة" لمشاهدة فشل التحقق الرياضي!`
          : `[Tampering simulated successfully]: Record #2 silently altered in storage (${tamperRes.alteredField}). Click "Verify Integrity" now to observe hash chain verification failure!`
      );
      setVerificationResult(null);
    }
  };

  // Reset Demo Data
  const handleResetLogs = async () => {
    const fresh = await resetConditionLogs();
    setConditionLogs(fresh);
    setVerificationResult(null);
    setTamperMessage(isAr ? 'تم استعادة السلسلة إلى حالتها الأولية الصالحة.' : 'Chain reset to original valid genesis state.');
  };

  // ----------------------------------------------------
  // Render Password Gate if Not Authenticated
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="bg-[#FAF5ED] rounded-xl border border-[#C8963E]/40 p-8 shadow-lg max-w-md mx-auto my-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[#7A2E1D] text-[#C8963E] flex items-center justify-center mx-auto mb-4 border-2 border-[#C8963E]/40 shadow-inner">
          <KeyRound className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-bold text-xl text-[#7A2E1D] mb-1">
          {isAr ? 'بوابة إدارة موقع بترا الأثري' : 'Petra Site Management Console'}
        </h2>
        <p className="text-xs text-stone-600 mb-6">
          {isAr
            ? 'منطقة مخصصة لفريق صيانة الآثار واعتماد إجابات الزوار. (كلمة مرور العرض: admin123)'
            : 'Restricted area for monument condition logging and approved knowledge curation. (Demo Password: admin123)'}
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              id="input-admin-password"
              type="password"
              value={passwordInput}
              onChange={e => {
                setPasswordInput(e.target.value);
                if (authError) setAuthError(null);
              }}
              placeholder={isAr ? 'أدخل كلمة المرور...' : 'Enter demo password...'}
              className="w-full bg-white border border-[#C8963E]/50 rounded-lg px-4 py-2.5 text-center text-sm font-semibold tracking-wider text-[#331C16] focus:ring-2 focus:ring-[#7A2E1D] focus:outline-none"
            />
          </div>

          {authError && (
            <div className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200">
              {authError}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              id="btn-admin-login"
              type="submit"
              className="flex-1 bg-[#1F6E68] hover:bg-[#185853] text-white py-2.5 rounded-lg text-xs md:text-sm font-bold shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>{isAr ? 'تسجيل الدخول' : 'Access Admin Console'}</span>
            </button>
            <button
              type="button"
              onClick={() => setPasswordInput('admin123')}
              className="bg-[#C8963E]/20 hover:bg-[#C8963E]/30 text-[#7A2E1D] text-xs font-semibold px-3 py-2.5 rounded-lg border border-[#C8963E]/50 transition"
              title="Quick fill demo password"
            >
              admin123
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-[#E8DCC9]">
          <button
            onClick={onBackToVisitor}
            className="text-xs text-[#7A2E1D] hover:underline"
          >
            {isAr ? '← العودة إلى بوابة الزائر' : '← Return to Visitor Experience'}
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Authenticated Admin Dashboard
  // ----------------------------------------------------
  return (
    <div className="bg-[#FAF5ED] rounded-xl border border-[#C8963E]/30 p-5 md:p-7 shadow-md mb-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#C8963E]/20">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#1F6E68] text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-xl md:text-2xl text-[#7A2E1D]">
              {isAr ? 'لوحة إدارة موقع بترا الأثري' : 'Petra Heritage Management Console'}
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold">
              {isAr ? 'مُصرح' : 'Authorized'}
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#561E12]/80 mt-1">
            {isAr
              ? 'إدارة أسئلة الزوار غير المجابة، تحديث قاعدة المعرفة، وسجل حالة الآثار المشفر بسلسلة تجزئة SHA-256.'
              : 'Unanswered questions feedback loop, knowledge management, and SHA-256 hash-chained monument register.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToVisitor}
            className="text-xs bg-white hover:bg-stone-100 text-[#7A2E1D] border border-[#C8963E]/40 font-semibold px-3 py-1.5 rounded transition flex items-center gap-1"
          >
            {isAr ? 'بوابة الزائر' : 'Visitor App'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-xs bg-[#7A2E1D] hover:bg-[#612215] text-[#F6EEE1] font-semibold px-3 py-1.5 rounded transition"
          >
            {isAr ? 'قفل اللوحة' : 'Lock Console'}
          </button>
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-[#E8DCC9] pb-3">
        <button
          id="admin-tab-queue"
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition ${
            activeTab === 'queue'
              ? 'bg-[#7A2E1D] text-[#F6EEE1] shadow-sm'
              : 'bg-white text-stone-700 hover:bg-[#FAF5ED] border border-[#E8DCC9]'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-[#C8963E]" />
          <span>{isAr ? 'طابور الأسئلة المعلقة' : '1. Unanswered Queue'}</span>
          {unansweredQueue.filter(q => q.status === 'pending').length > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#C8963E] text-[#331C16] text-[10px] font-bold flex items-center justify-center">
              {unansweredQueue.filter(q => q.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          id="admin-tab-kb"
          onClick={() => setActiveTab('kb')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition ${
            activeTab === 'kb'
              ? 'bg-[#7A2E1D] text-[#F6EEE1] shadow-sm'
              : 'bg-white text-stone-700 hover:bg-[#FAF5ED] border border-[#E8DCC9]'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#C8963E]" />
          <span>{isAr ? 'إدارة قاعدة المعرفة' : '2. Knowledge Base'}</span>
          <span className="text-[11px] opacity-75">({knowledgeList.length})</span>
        </button>

        <button
          id="admin-tab-register"
          onClick={() => setActiveTab('register')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition ${
            activeTab === 'register'
              ? 'bg-[#1F6E68] text-white shadow-sm'
              : 'bg-white text-stone-700 hover:bg-[#FAF5ED] border border-[#E8DCC9]'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{isAr ? 'سجل حالة الآثار المشفر' : '3. Monument Condition Register'}</span>
          <span className="text-[11px] opacity-80 font-mono">({conditionLogs.length} blocks)</span>
        </button>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* TAB 1: UNANSWERED QUESTIONS QUEUE (Feedback Loop Demonstration) */}
      {/* ---------------------------------------------------------------- */}
      {activeTab === 'queue' && (
        <div className="space-y-5">
          <div className="bg-amber-50/70 border border-amber-300 p-3.5 rounded-lg text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">{isAr ? 'حلقة التغذية الراجعة (The Closed Feedback Loop):' : 'The Closed Feedback Loop:'} </span>
              {isAr
                ? 'عندما يسأل زائر سؤالاً لا يعرفه الدليل، يُسجل هنا فوراً. بمجرد اعتماد إجابة موثقة وحفظها، يتعلم الذكاء الاصطناعي الإجابة فوراً ويجيب عنها الزائر القادم بدقة دون هلوسة!'
                : 'When a visitor asks an unverified question, it lands here. When the site team writes an approved answer, it is appended to the knowledge base. The AI guide can then immediately answer that question!'}
            </div>
          </div>

          {resolvedSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resolvedSuccessMessage}</span>
              </div>
              <button
                onClick={onBackToVisitor}
                className="bg-[#1F6E68] text-white px-2.5 py-1 rounded text-xs font-bold hover:bg-[#185853] transition"
              >
                {isAr ? 'جرب السؤال الآن في المحادثة 💬' : 'Test Question in Chat 💬'}
              </button>
            </div>
          )}

          {queueError && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{queueError}</span>
            </div>
          )}

          {/* List of Questions */}
          <div className="space-y-3">
            {unansweredQueue.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg border border-dashed border-[#E8DCC9] text-stone-500 text-xs">
                {isAr ? 'لا توجد أسئلة معلقة حالياً في الطابور.' : 'No unanswered questions currently in the queue.'}
              </div>
            ) : (
              unansweredQueue.map(q => {
                const isPending = q.status === 'pending';
                const isAnswering = answeringQuestionId === q.id;

                return (
                  <div
                    key={q.id}
                    className={`bg-white p-4 rounded-xl border transition shadow-xs ${
                      isPending ? 'border-[#C8963E]/60 bg-amber-50/20' : 'border-stone-200 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {isPending ? (isAr ? 'بانتظار المراجعة' : 'Pending Review') : (isAr ? 'تم الاعتماد' : 'Resolved')}
                        </span>
                        <span className="text-xs text-stone-500">
                          {new Date(q.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs text-[#7A2E1D] font-medium">
                        Guide: {q.creatureName || 'Nabataean Guide'}
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-[#331C16] mb-2">
                      "{q.question}"
                    </h4>

                    {/* If already resolved, show approved answer */}
                    {!isPending && q.resolvedAnswer && (
                      <div className="bg-[#FAF5ED] p-3 rounded-lg border border-[#E8DCC9] text-xs text-[#331C16] mt-2">
                        <span className="font-bold text-[#1F6E68] block mb-1">
                          {isAr ? 'الإجابة المعتمدة في قاعدة المعرفة:' : 'Approved Answer in Knowledge Base:'}
                        </span>
                        <p>{q.resolvedAnswer}</p>
                      </div>
                    )}

                    {/* Answering Form if active */}
                    {isPending && isAnswering && (
                      <div className="mt-3 pt-3 border-t border-[#E8DCC9] space-y-2">
                        <label className="block text-xs font-bold text-[#7A2E1D]">
                          {isAr ? 'صياغة الإجابة المعتمدة أثرياً:' : 'Draft Verified Site Answer:'}
                        </label>
                        <textarea
                          rows={3}
                          value={approvedAnswerText}
                          onChange={e => setApprovedAnswerText(e.target.value)}
                          placeholder={
                            isAr
                              ? 'اكتب الإجابة المعتمدة من قبل خبراء آثار بترا...'
                              : 'Write the verified answer approved by Petra archaeologists...'
                          }
                          className="w-full bg-[#FAF5ED] border border-[#C8963E]/50 rounded-lg p-2.5 text-xs text-[#331C16] focus:outline-none focus:ring-2 focus:ring-[#7A2E1D]"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            id="btn-save-approved-answer"
                            onClick={() => handleResolveQuestion(q.id)}
                            className="bg-[#1F6E68] hover:bg-[#185853] text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isAr ? 'اعتماد وحفظ بقاعدة المعرفة' : 'Approve & Save to Knowledge Base'}</span>
                          </button>
                          <button
                            onClick={() => {
                              setAnsweringQuestionId(null);
                              setApprovedAnswerText('');
                            }}
                            className="bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs px-3 py-2 rounded-lg transition"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Trigger Answer Button */}
                    {isPending && !isAnswering && (
                      <div className="mt-2 text-right">
                        <button
                          onClick={() => {
                            setAnsweringQuestionId(q.id);
                            setApprovedAnswerText(
                              isAr
                                ? 'أكدت السجلات الأثرية الحديثة لمحمية بترا الأثرية أن...'
                                : 'Recent archaeological surveys at Petra have confirmed that...'
                            );
                          }}
                          className="text-xs bg-[#7A2E1D] hover:bg-[#612215] text-[#F6EEE1] font-bold px-3 py-1.5 rounded transition"
                        >
                          {isAr ? 'كتابة إجابة معتمدة' : 'Write Approved Answer'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* TAB 2: KNOWLEDGE BASE MANAGER */}
      {/* ---------------------------------------------------------------- */}
      {activeTab === 'kb' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DCC9]">
            <div>
              <h3 className="font-bold text-sm text-[#7A2E1D]">
                {isAr ? 'السجلات المعرفية المعتمدة لمدينة بترا' : 'Curated Archaeological Corpus'}
              </h3>
              <p className="text-xs text-stone-600">
                {isAr
                  ? 'يتم تغذية نموذج الذكاء الاصطناعي حصراً بالسجلات المسترجعة من هذه القائمة.'
                  : 'Gemini is fed exclusively with relevant entries retrieved from this corpus.'}
              </p>
            </div>
            {!isAddingNewKb && (
              <button
                onClick={() => {
                  setEditingEntry(null);
                  setIsAddingNewKb(true);
                  setKbTitleEn('');
                  setKbTitleAr('');
                  setKbContentEn('');
                  setKbContentAr('');
                  setKbKeywords('');
                }}
                className="bg-[#1F6E68] hover:bg-[#185853] text-white text-xs font-bold px-3 py-2 rounded-lg transition flex items-center gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isAr ? 'إضافة سجل معرفي جديد' : 'Add Knowledge Entry'}</span>
              </button>
            )}
          </div>

          {kbSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{kbSuccess}</span>
            </div>
          )}

          {/* Add/Edit Form */}
          {isAddingNewKb && (
            <form onSubmit={handleSaveKbEntry} className="bg-white p-5 rounded-xl border border-[#C8963E]/40 shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-[#7A2E1D] pb-2 border-b border-[#E8DCC9]">
                {editingEntry ? (isAr ? 'تعديل السجل المعرفي' : 'Edit Knowledge Entry') : (isAr ? 'إضافة سجل معرفي جديد' : 'New Verified Entry')}
              </h4>

              {kbError && (
                <div className="p-2.5 bg-red-50 border border-red-300 text-red-800 text-xs rounded">
                  {kbError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Title (English)*:
                  </label>
                  <input
                    type="text"
                    value={kbTitleEn}
                    onChange={e => setKbTitleEn(e.target.value)}
                    placeholder="e.g. Ad-Deir Altar Sanctuary"
                    className="w-full bg-[#FAF5ED] border border-[#E8DCC9] rounded px-3 py-1.5 text-xs text-[#331C16] focus:outline-none focus:ring-1 focus:ring-[#7A2E1D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    العنوان (العربية):
                  </label>
                  <input
                    type="text"
                    value={kbTitleAr}
                    onChange={e => setKbTitleAr(e.target.value)}
                    placeholder="مثال: محراب مذبح الدير"
                    className="w-full bg-[#FAF5ED] border border-[#E8DCC9] rounded px-3 py-1.5 text-xs text-[#331C16] focus:outline-none focus:ring-1 focus:ring-[#7A2E1D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category:
                  </label>
                  <select
                    value={kbCategory}
                    onChange={e => setKbCategory(e.target.value as any)}
                    className="w-full bg-[#FAF5ED] border border-[#E8DCC9] rounded px-3 py-1.5 text-xs text-[#331C16]"
                  >
                    <option value="landmark">Landmark / Monument</option>
                    <option value="engineering">Hydraulic Engineering</option>
                    <option value="beliefs">Beliefs & Deities</option>
                    <option value="myth">Myths & Legends</option>
                    <option value="condition">Condition & Conservation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Keywords (comma-separated):
                  </label>
                  <input
                    type="text"
                    value={kbKeywords}
                    onChange={e => setKbKeywords(e.target.value)}
                    placeholder="deir, altar, sanctuary, obodas, مذبح, الدير"
                    className="w-full bg-[#FAF5ED] border border-[#E8DCC9] rounded px-3 py-1.5 text-xs text-[#331C16]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Content (English)*:
                </label>
                <textarea
                  rows={3}
                  value={kbContentEn}
                  onChange={e => setKbContentEn(e.target.value)}
                  placeholder="Verified historical text..."
                  className="w-full bg-[#FAF5ED] border border-[#E8DCC9] rounded p-2.5 text-xs text-[#331C16]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  المحتوى (العربية):
                </label>
                <textarea
                  rows={3}
                  value={kbContentAr}
                  onChange={e => setKbContentAr(e.target.value)}
                  placeholder="النص التاريخي المحقق بالعربية..."
                  className="w-full bg-[#FAF5ED] border border-[#E8DCC9] rounded p-2.5 text-xs text-[#331C16]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="bg-[#1F6E68] hover:bg-[#185853] text-white text-xs font-bold px-4 py-2 rounded shadow-xs"
                >
                  {editingEntry ? (isAr ? 'تحديث السجل' : 'Update Entry') : (isAr ? 'حفظ السجل' : 'Save Entry')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewKb(false);
                    setEditingEntry(null);
                  }}
                  className="bg-stone-200 text-stone-700 text-xs px-3 py-2 rounded"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          )}

          {/* Table / List of entries */}
          <div className="bg-white rounded-xl border border-[#E8DCC9] overflow-hidden shadow-xs">
            <div className="divide-y divide-[#E8DCC9] max-h-[460px] overflow-y-auto">
              {knowledgeList.map(item => (
                <div key={item.id} className="p-4 hover:bg-[#FAF5ED]/50 transition flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                        {item.category.toUpperCase()}
                      </span>
                      <h4 className="font-bold text-xs md:text-sm text-[#7A2E1D]">
                        {isAr ? item.titleAr : item.titleEn}
                      </h4>
                      {item.addedBy === 'admin' && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                          Admin Added
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-700 line-clamp-2">
                      {isAr ? item.contentAr : item.contentEn}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.keywords.slice(0, 6).map((k, i) => (
                        <span key={i} className="text-[10px] bg-stone-100 text-stone-600 px-1 rounded">
                          #{k}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => startEditKb(item)}
                    className="text-xs text-[#1F6E68] hover:underline font-semibold shrink-0"
                  >
                    {isAr ? 'تعديل' : 'Edit'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* TAB 3: MONUMENT CONDITION REGISTER (SHA-256 HASH CHAIN) */}
      {/* ---------------------------------------------------------------- */}
      {activeTab === 'register' && (
        <div className="space-y-6">
          {/* Cryptographic Hash Chain Notice */}
          <div className="bg-[#1F6E68]/10 border border-[#1F6E68]/40 p-4 rounded-xl text-xs text-[#331C16] leading-relaxed space-y-2">
            <div className="flex items-center gap-2 text-[#1F6E68] font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>
                {isAr
                  ? 'سجل المعاينة الأثرية غير القابل للتلاعب (SHA-256 Web Crypto Ledger)'
                  : 'Append-Only, Tamper-Evident SHA-256 Hash Chain'}
              </span>
            </div>
            <p>
              {isAr
                ? 'لحماية السجلات التاريخية من التزوير، تُحفظ كل معاينة ككتلة رقمية مرتبطة بالسجل السابق بشكل تسلسلي غير قابل للتعديل، مما يضمن كشف أي محاولة تلاعب بالبيانات أو حذفها فوراً.'
                : 'To protect historic monument records from unauthorized alteration, every inspection report is permanently sealed into a tamper-evident digital ledger linking each record to the previous one, immediately detecting any data tampering.'}
            </p>
          </div>

          {/* Chain Integrity Action Center */}
          <div className="bg-white p-4 rounded-xl border border-[#C8963E]/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                id="btn-verify-integrity"
                onClick={handleVerifyIntegrity}
                disabled={isVerifying}
                className="bg-[#1F6E68] hover:bg-[#185853] text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isVerifying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{isAr ? 'التحقق من سلامة السلسلة (Verify Integrity)' : 'Verify Chain Integrity'}</span>
              </button>

              <button
                id="btn-simulate-tamper"
                onClick={handleSimulateTamper}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs px-3.5 py-2.5 rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Silently edits record #2 so judges can witness the cryptographic verification fail"
              >
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>{isAr ? 'عرض التحكيم: محاكاة التلاعب (Simulate Tampering)' : 'Demo: Simulate Tampering'}</span>
              </button>
            </div>

            <button
              id="btn-reset-chain-demo"
              onClick={handleResetLogs}
              className="text-xs text-stone-600 hover:text-red-700 flex items-center gap-1 px-3 py-2 rounded border border-stone-300 hover:border-red-300 transition"
              title="Restores pristine genesis chain"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isAr ? 'إعادة ضبط البيانات الأولية' : 'Reset Demo Data'}</span>
            </button>
          </div>

          {/* Verification Result Display */}
          {verificationResult && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in duration-200 ${
                verificationResult.isValid
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-red-50 border-red-400 text-red-950'
              }`}
            >
              {verificationResult.isValid ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-bold text-sm">
                  {verificationResult.isValid ? (
                    <span className="text-emerald-800">
                      {isAr ? '✓ السلسلة سليمة تماماً (Chain Valid)' : '✓ Cryptographic Chain Valid'}
                    </span>
                  ) : (
                    <span className="text-red-800">
                      {isAr
                        ? `⚠️ تم كشف تلاعب بالبيانات في السجل #${verificationResult.tamperedIndex}!`
                        : `⚠️ Tampering Detected at Entry #${verificationResult.tamperedIndex}!`}
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono">{verificationResult.details}</p>
                <div className="text-[11px] text-stone-600">
                  {verificationResult.verifiedCount} {isAr ? 'سجلات تم فحص توقيعها الرياضي' : 'blocks cryptographically scanned.'}
                </div>
              </div>
            </div>
          )}

          {/* Simulated Tampering Feedback Banner */}
          {tamperMessage && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{tamperMessage}</span>
            </div>
          )}

          {/* Append New Condition Log Entry Form */}
          <div className="bg-white p-5 rounded-xl border border-[#C8963E]/40 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-[#7A2E1D] pb-2 border-b border-[#E8DCC9] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C8963E]" />
              <span>{isAr ? 'تسجيل معاينة إنشائية جديدة (Append-Only Log)' : 'Append New Inspection Block to Chain'}</span>
            </h4>

            {logFormSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{logFormSuccess}</span>
              </div>
            )}

            {logFormError && (
              <div className="p-2.5 bg-red-50 border border-red-300 text-red-800 text-xs rounded">
                {logFormError}
              </div>
            )}

            <form onSubmit={handleAppendLog} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Landmark Selection */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isAr ? 'المعلم الأثري:' : 'Monitored Landmark:'}
                  </label>
                  <select
                    id="select-condition-landmark"
                    value={newLogLandmark}
                    onChange={e => setNewLogLandmark(e.target.value)}
                    className="w-full bg-[#FAF5ED] border border-[#E8DCC9] rounded-lg px-3 py-2 text-xs font-medium text-[#331C16]"
                  >
                    {LANDMARKS.map(lm => (
                      <option key={lm.id} value={lm.id}>
                        {lm.routeOrder}. {isAr ? lm.nameAr : lm.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Severity Rating 1 to 5 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-700">
                      {isAr ? 'درجة الخطورة (Severity 1-5):' : 'Severity Rating (1-5):'}
                    </label>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        newLogSeverity >= 4
                          ? 'bg-red-100 text-red-800'
                          : newLogSeverity >= 3
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Level {newLogSeverity} / 5
                    </span>
                  </div>
                  <input
                    id="input-condition-severity"
                    type="range"
                    min="1"
                    max="5"
                    value={newLogSeverity}
                    onChange={e => setNewLogSeverity(Number(e.target.value))}
                    className="w-full accent-[#7A2E1D] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500">
                    <span>1 (Minor / Routine)</span>
                    <span>3 (Moderate Erosion)</span>
                    <span>5 (Critical Risk)</span>
                  </div>
                </div>
              </div>

              {/* Note input */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isAr ? 'الملاحظات الميدانية للمعاينة الأثرية*:' : 'Field Inspection Observation Note*: '}
                </label>
                <textarea
                  id="input-condition-note"
                  rows={2}
                  value={newLogNote}
                  onChange={e => {
                    setNewLogNote(e.target.value);
                    if (logFormError) setLogFormError(null);
                  }}
                  placeholder={
                    isAr
                      ? 'مثال: فحص قناة المياه بعد موجة الأمطار، لوحظ تراكم رواسب طينية خفيفة...'
                      : 'e.g., Inspected lower frieze after rainfall. Minor clay deposit detected near base conduit...'
                  }
                  className="w-full bg-[#FAF5ED] border border-[#E8DCC9] rounded-lg p-2.5 text-xs text-[#331C16] focus:ring-1 focus:ring-[#7A2E1D] focus:outline-none"
                />
              </div>

              {/* Optional Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#C8963E]" />
                  <span>{isAr ? 'صورة توثيقية اختيارية (Base64):' : 'Optional Field Photo (Stored as Base64):'}</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#7A2E1D] file:text-[#F6EEE1] hover:file:bg-[#612215] cursor-pointer"
                />
                {newLogPhotoBase64 && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={newLogPhotoBase64}
                      alt="Condition inspection preview"
                      className="w-14 h-14 object-cover rounded border border-[#C8963E]"
                    />
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      {isAr ? 'تم تحميل الصورة وجاهزة للربط بالبلوك' : 'Photo attached to block'}
                    </span>
                  </div>
                )}
              </div>

              <button
                id="btn-append-condition-log"
                type="submit"
                disabled={isAppending || !newLogNote.trim()}
                className="bg-[#7A2E1D] hover:bg-[#612215] text-[#F6EEE1] text-xs md:text-sm font-bold px-5 py-2.5 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isAppending ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C8963E]" />
                ) : (
                  <PlusCircle className="w-4 h-4 text-[#C8963E]" />
                )}
                <span>{isAr ? 'حساب SHA-256 وضم السجل للسلسلة' : 'Compute SHA-256 & Append Block'}</span>
              </button>
            </form>
          </div>

          {/* The Append-Only Hash Chain Ledger Display */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-600">
              {isAr ? 'سلسلة الكتل المشفرة الحالية (Active Hash Chain Blocks):' : 'Active Hash Chain Blocks in Storage:'}
            </h4>

            <div className="space-y-3">
              {conditionLogs.map(item => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-xl border border-[#E8DCC9] shadow-xs relative overflow-hidden space-y-2"
                >
                  {/* Top Bar of Block */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#1F6E68] text-white text-xs font-mono font-bold flex items-center justify-center">
                        #{item.index}
                      </span>
                      <span className="font-bold text-xs md:text-sm text-[#7A2E1D] uppercase">
                        {item.landmarkId.toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.severity >= 4
                            ? 'bg-red-100 text-red-800'
                            : item.severity >= 3
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        Severity {item.severity}/5
                      </span>
                    </div>

                    <span className="text-[11px] text-stone-400 font-mono">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {/* Note & optional photo */}
                  <div className="flex items-start gap-3">
                    {item.photoBase64 && (
                      <img
                        src={item.photoBase64}
                        alt="Inspection record thumbnail"
                        className="w-14 h-14 object-cover rounded border border-[#E8DCC9] shrink-0"
                      />
                    )}
                    <p className="text-xs text-[#331C16] leading-relaxed flex-1">
                      {item.note}
                    </p>
                  </div>

                  {/* Cryptographic Hashes */}
                  <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-[10px] font-mono space-y-1 text-stone-600">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-stone-400 font-bold shrink-0">prevHash:</span>
                      <span className="truncate text-stone-500">{item.prevHash}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-[#1F6E68] font-bold shrink-0">blockHash:</span>
                      <span className="truncate text-[#7A2E1D] font-bold">{item.hash}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
