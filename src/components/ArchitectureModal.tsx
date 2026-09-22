/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language } from '../types';
import {
  X,
  Layers,
  Database,
  Shield,
  Bot,
  Compass,
  Cpu,
  CheckCircle2,
  FileCode,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';

interface ArchitectureModalProps {
  language: Language;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  language,
  onClose
}) => {
  const isAr = language === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-[#FAF5ED] w-full max-w-4xl max-h-[90vh] rounded-2xl border-2 border-[#C8963E] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Top Header */}
        <div className="bg-[#7A2E1D] text-[#F6EEE1] px-6 py-4 flex items-center justify-between border-b border-[#C8963E]/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#C8963E] text-[#7A2E1D]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg md:text-xl text-[#F6EEE1]">
                {isAr ? 'المخطط الهندسي ودليل تحكيم الهاكاثون' : 'ANBAT System Architecture & Judge Demo Guide'}
              </h2>
              <p className="text-xs text-[#E8DCC9]/90">
                {isAr ? 'التفاصيل التقنية، تدفق البيانات، ومخطط فحص الـ MVP' : 'Technical Specifications, RAG Pipeline & Live Demo Walkthrough'}
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

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs md:text-sm text-[#331C16]">
          {/* 1. Visual Architecture Flow Diagram */}
          <div className="bg-white p-5 rounded-xl border border-[#C8963E]/40 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#7A2E1D] uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#C8963E]" />
              <span>1. System Architecture & Data Flow</span>
            </h3>

            {/* Architecture Blocks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
              {/* Box A: Visitor Client */}
              <div className="bg-[#FAF5ED] p-3.5 rounded-lg border border-[#E8DCC9] space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#7A2E1D]">
                  <Compass className="w-4 h-4 text-[#C8963E]" />
                  <span>A. Visitor Client (React)</span>
                </div>
                <ul className="space-y-1 text-stone-600 text-[11px]">
                  <li>• Deterministic Creature Summoner (Explainable math)</li>
                  <li>• Interactive SVG Route Map (5 Real-world landmarks)</li>
                  <li>• Camera QR Marker Check-In (MediaDevices API)</li>
                  <li>• HTML5 Canvas Passport Badge Generator (.PNG)</li>
                  <li>• Multilingual Chat UI (English & Arabic RTL)</li>
                </ul>
              </div>

              {/* Box B: Grounded RAG & Gemini */}
              <div className="bg-[#FAF5ED] p-3.5 rounded-lg border border-[#C8963E]/60 space-y-2 relative">
                <div className="flex items-center gap-1.5 font-bold text-[#1F6E68]">
                  <Bot className="w-4 h-4 text-[#1F6E68]" />
                  <span>B. Grounded RAG & AI Proxy</span>
                </div>
                <ul className="space-y-1 text-stone-600 text-[11px]">
                  <li>• Express `/api/chat` Proxy (Server-side key security)</li>
                  <li>• Local Token-Overlap Retrieval Engine (Bi-lingual)</li>
                  <li>• Gemini 3.8 Flash with Zero-Hallucination Mandate</li>
                  <li>• Auto-Queueing for unverified queries</li>
                </ul>
              </div>

              {/* Box C: Site Management & Ledger */}
              <div className="bg-[#FAF5ED] p-3.5 rounded-lg border border-[#E8DCC9] space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#7A2E1D]">
                  <Shield className="w-4 h-4 text-[#C8963E]" />
                  <span>C. Conservation Ledger</span>
                </div>
                <ul className="space-y-1 text-stone-600 text-[11px]">
                  <li>• Append-Only Hash Chain via Web Crypto API</li>
                  <li>• Tamper-evident sequential digital sealing</li>
                  <li>• Cryptographic Integrity Scanner</li>
                  <li>• Closed-Loop Question Answering Queue</li>
                </ul>
              </div>
            </div>

            {/* ASCII Data Flow Diagram */}
            <div className="bg-stone-900 text-stone-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
              <div>[Visitor Question] ➔ [Retrieval Engine: Top-2 KB Matches] ➔ [Express /api/chat Proxy]</div>
              <div className="text-emerald-400">       ↳ If Grounded: Gemini 3.8 Flash answers with Sources Tagged</div>
              <div className="text-amber-400">       ↳ If Unknown: Creature says "I don't know yet" ➔ Pushed to Admin Queue</div>
              <div className="text-cyan-400">[Admin Console] ➔ Write Approved Answer ➔ Stored in KB ➔ Loop Closed!</div>
              <div className="text-purple-400">[Site Manager] ➔ Append Condition Log ➔ Web Crypto SHA-256 ➔ Tamper-Evident Ledger</div>
            </div>
          </div>

          {/* 2. Step-by-Step Hackathon Judge Demo Script */}
          <div className="bg-white p-5 rounded-xl border border-[#C8963E]/40 shadow-xs space-y-3">
            <h3 className="font-heading font-bold text-sm text-[#7A2E1D] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C8963E]" />
              <span>2. Recommended 3-Minute Technical Judge Demo Walkthrough</span>
            </h3>

            <div className="space-y-2.5 text-xs text-stone-700">
              <div className="flex items-start gap-2 bg-[#FAF5ED] p-2.5 rounded border border-[#E8DCC9]">
                <span className="w-5 h-5 rounded-full bg-[#7A2E1D] text-[#F6EEE1] font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-[#331C16]">Module A (Satchel & Companion Reveal): </strong>
                  Select a starting landmark (e.g., Siq Entrance) and time (Morning). Click <em>Open the Satchel</em>. Notice the reveal animation, creature lore, and naming input. Click <em>Copy Share Text</em> and <em>Download Badge as Image</em> to see the generated PNG passport.
                </div>
              </div>

              <div className="flex items-start gap-2 bg-[#FAF5ED] p-2.5 rounded border border-[#E8DCC9]">
                <span className="w-5 h-5 rounded-full bg-[#7A2E1D] text-[#F6EEE1] font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-[#331C16]">Module B (Interactive Route Map & Legendary Unlock): </strong>
                  Navigate to the Map tab. Click on landmark pins along the sandstone canyon trail. Click <em>Mark Landmark as Visited</em>. Alternatively, click <em>Demo: Jump 5/5</em> in the top header. Observe the progress bar hit 100% and immediately unlock the <strong>Legendary Nubian Ibex (Al-Badan)</strong>.
                </div>
              </div>

              <div className="flex items-start gap-2 bg-[#FAF5ED] p-2.5 rounded border border-[#E8DCC9]">
                <span className="w-5 h-5 rounded-full bg-[#7A2E1D] text-[#F6EEE1] font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="text-[#331C16]">Module C (Grounded RAG & Negative Test): </strong>
                  In the chat, click <em>Water Engineering</em> to see grounded answering with source tags. Next, click the negative test button (<em>"Did Nabataeans construct locomotives and mango plantations?"</em>). Notice the companion politely confesses it does not know, and flags that the query has been automatically forwarded to the Site Team.
                </div>
              </div>

              <div className="flex items-start gap-2 bg-[#FAF5ED] p-2.5 rounded border border-[#E8DCC9]">
                <span className="w-5 h-5 rounded-full bg-[#7A2E1D] text-[#F6EEE1] font-bold text-[10px] flex items-center justify-center shrink-0">4</span>
                <div>
                  <strong className="text-[#331C16]">Module D.1 (Closed Feedback Loop in Admin): </strong>
                  Switch to <em>Site Manager Admin</em> (password: <code>admin123</code>). In <em>Unanswered Queue</em>, see the question just asked. Click <em>Write Approved Answer</em> and approve it. Return to Chat and ask it again: the AI now answers with authority!
                </div>
              </div>

              <div className="flex items-start gap-2 bg-[#FAF5ED] p-2.5 rounded border border-[#E8DCC9]">
                <span className="w-5 h-5 rounded-full bg-[#7A2E1D] text-[#F6EEE1] font-bold text-[10px] flex items-center justify-center shrink-0">5</span>
                <div>
                  <strong className="text-[#331C16]">Module D.2 (Tamper-Evident SHA-256 Ledger): </strong>
                  In Admin, click <em>3. Monument Condition Register</em>. Click <em>Verify Chain Integrity</em> (observe big green check). Then click <em>Demo: Simulate Tampering</em> (alters record #2 in storage) and click <em>Verify Chain Integrity</em> again (observe cryptographic tamper alert at block #2). Finally, click <em>Reset Demo Data</em> to restore the valid ledger.
                </div>
              </div>
            </div>
          </div>

          {/* 3. Security, Quality & Known MVP Boundaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-300 space-y-1.5">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Security & Architecture Compliance</span>
              </div>
              <ul className="text-emerald-900 space-y-1 text-[11px]">
                <li>• Zero client-side API keys: Express proxies all Gemini calls.</li>
                <li>• Client-side Web Crypto API for SHA-256 (no insecure hashing libs).</li>
                <li>• Robust local persistence in localStorage across browser tabs.</li>
                <li>• Bi-directional Arabic RTL typography and English localization.</li>
              </ul>
            </div>

            <div className="bg-stone-100 p-4 rounded-xl border border-stone-300 space-y-1.5">
              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-stone-700" />
                <span>MVP Scope Constraints (By Hackathon Design)</span>
              </div>
              <ul className="text-stone-700 space-y-1 text-[11px]">
                <li>• Offline storage uses browser localStorage (not multi-tenant cloud DB).</li>
                <li>• Admin login uses fixed demo password "admin123" for judging ease.</li>
                <li>• RAG retrieval uses local token scoring rather than remote vector index.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#FAF5ED] px-6 py-3.5 border-t border-[#E8DCC9] flex items-center justify-between shrink-0">
          <span className="text-xs text-stone-500">
            ANBAT Petra MVP • Built for Hackathon Technical Judging
          </span>
          <button
            onClick={onClose}
            className="bg-[#7A2E1D] hover:bg-[#612215] text-[#F6EEE1] text-xs font-bold px-4 py-2 rounded-lg transition"
          >
            {isAr ? 'إغلاق الدليل' : 'Close Guide'}
          </button>
        </div>
      </div>
    </div>
  );
};
