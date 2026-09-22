/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import initialKnowledgeBase from '../data/knowledgeBase.json';
import {
  KnowledgeEntry,
  MonumentConditionEntry,
  UnansweredQuestion,
  VisitorGuideBadge,
  Language,
  UserSession,
  UserProfile
} from '../types';

const STORAGE_KEYS = {
  KNOWLEDGE_BASE: 'anbat_knowledge_base_v1',
  UNANSWERED_QUEUE: 'anbat_unanswered_queue_v1',
  CONDITION_LOGS: 'anbat_condition_logs_v1',
  VISITOR_BADGE: 'anbat_visitor_badge_v1',
  VISITED_LANDMARKS: 'anbat_visited_landmarks_v1',
  LANGUAGE: 'anbat_user_lang_v1',
  USER_SESSION: 'anbat_user_session_v1',
  REGISTERED_USERS: 'anbat_registered_users_v1'
};

export const INITIAL_CONDITION_LOGS: MonumentConditionEntry[] = [
  {
    id: 'log-gen-001',
    index: 1,
    landmarkId: 'siq',
    note: 'Winter flash-flood diversion channel inspected at Bab Al-Siq. Sandstone aqueduct terracotta pipes intact, silt cleared.',
    severity: 1,
    timestamp: '2026-09-18T09:30:00.000Z',
    prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
    hash: 'a3f78921e5b8c9d045612345abcdef67890123456789abcdef0123456789abcd' // Re-computed on init
  },
  {
    id: 'log-gen-002',
    index: 2,
    landmarkId: 'treasury',
    note: 'Minor surface salt efflorescence noticed near eastern base column plinth following high humidity.',
    severity: 2,
    timestamp: '2026-09-19T14:15:00.000Z',
    prevHash: 'a3f78921e5b8c9d045612345abcdef67890123456789abcdef0123456789abcd',
    hash: 'b4e89032f6c9d1e156723456bcdefa78901234567890bcdef1234567890bcde'
  },
  {
    id: 'log-gen-003',
    index: 3,
    landmarkId: 'theatre',
    note: 'Tourist foot-traffic abrasion monitored along tier 18 sandstone seats. Warning barriers adjusted.',
    severity: 2,
    timestamp: '2026-09-20T11:00:00.000Z',
    prevHash: 'b4e89032f6c9d1e156723456bcdefa78901234567890bcdef1234567890bcde',
    hash: 'c5f90143a7d0e2f267834567cdefab89012345678901cdef2345678901cdefa'
  }
];

export const storageService = {
  // Knowledge Base
  getKnowledgeBase(): KnowledgeEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_BASE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading knowledge base from storage', e);
    }
    const initial = initialKnowledgeBase as KnowledgeEntry[];
    this.saveKnowledgeBase(initial);
    return initial;
  },

  saveKnowledgeBase(entries: KnowledgeEntry[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_BASE, JSON.stringify(entries));
    } catch (e) {
      console.error('Error saving knowledge base', e);
    }
  },

  addKnowledgeEntry(entry: KnowledgeEntry) {
    const list = this.getKnowledgeBase();
    const existingIndex = list.findIndex(e => e.id === entry.id);
    if (existingIndex >= 0) {
      list[existingIndex] = entry;
    } else {
      list.unshift(entry);
    }
    this.saveKnowledgeBase(list);
  },

  // Unanswered Questions Queue
  getUnansweredQueue(): UnansweredQuestion[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.UNANSWERED_QUEUE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading unanswered queue', e);
    }
    return [
      {
        id: 'q-demo-1',
        question: 'Did the Nabataeans cultivate almond trees in the mountain terraces above Ad-Deir?',
        language: 'en',
        timestamp: '2026-09-20T16:40:00.000Z',
        creatureName: 'Al-Jammal',
        status: 'pending'
      }
    ];
  },

  saveUnansweredQueue(queue: UnansweredQuestion[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.UNANSWERED_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error('Error saving unanswered queue', e);
    }
  },

  addToUnansweredQueue(questionText: string, lang: Language, creatureName?: string): boolean {
    const trimmed = questionText.trim();
    if (!trimmed) return false;

    const queue = this.getUnansweredQueue();
    // Prevent duplicate entries
    const normalized = trimmed.toLowerCase();
    const alreadyExists = queue.some(
      q => q.status === 'pending' && q.question.trim().toLowerCase() === normalized
    );

    if (alreadyExists) {
      return false;
    }

    const newQuestion: UnansweredQuestion = {
      id: `uq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      question: trimmed,
      language: lang,
      timestamp: new Date().toISOString(),
      creatureName: creatureName || 'Creature Guide',
      status: 'pending'
    };

    queue.unshift(newQuestion);
    this.saveUnansweredQueue(queue);
    return true;
  },

  resolveQuestionWithAnswer(questionId: string, approvedAnswer: string): KnowledgeEntry | null {
    const queue = this.getUnansweredQueue();
    const target = queue.find(q => q.id === questionId);
    if (!target) return null;

    target.status = 'resolved';
    target.resolvedAnswer = approvedAnswer;
    target.resolvedAt = new Date().toISOString();
    this.saveUnansweredQueue(queue);

    // Save as new knowledge base entry so AI can immediately answer it
    const newEntry: KnowledgeEntry = {
      id: `kb-resolved-${Date.now()}`,
      titleEn: `Site Team Verified: ${target.question.substring(0, 45)}...`,
      titleAr: `إجابة معتمدة: ${target.question.substring(0, 45)}...`,
      category: 'landmark',
      contentEn: approvedAnswer,
      contentAr: approvedAnswer,
      keywords: target.question.toLowerCase().split(/\s+/).filter(w => w.length > 2),
      addedBy: 'admin',
      createdAt: new Date().toISOString()
    };

    this.addKnowledgeEntry(newEntry);
    return newEntry;
  },

  // Condition Logs
  getConditionLogs(): MonumentConditionEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONDITION_LOGS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading condition logs', e);
    }
    return INITIAL_CONDITION_LOGS;
  },

  saveConditionLogs(logs: MonumentConditionEntry[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONDITION_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Error saving condition logs', e);
    }
  },

  // Visitor State
  getVisitedLandmarks(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VISITED_LANDMARKS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading visited landmarks', e);
    }
    return [];
  },

  saveVisitedLandmarks(ids: string[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.VISITED_LANDMARKS, JSON.stringify(ids));
    } catch (e) {
      console.error('Error saving visited landmarks', e);
    }
  },

  toggleVisitedLandmark(id: string): string[] {
    const list = this.getVisitedLandmarks();
    let updated: string[];
    if (list.includes(id)) {
      updated = list.filter(item => item !== id);
    } else {
      updated = [...list, id];
    }
    this.saveVisitedLandmarks(updated);
    return updated;
  },

  markLandmarkVisited(id: string): string[] {
    const list = this.getVisitedLandmarks();
    if (!list.includes(id)) {
      list.push(id);
      this.saveVisitedLandmarks(list);
    }
    return list;
  },

  getVisitorBadge(): VisitorGuideBadge | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VISITOR_BADGE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading badge', e);
    }
    return null;
  },

  saveVisitorBadge(badge: VisitorGuideBadge | null) {
    try {
      if (badge) {
        localStorage.setItem(STORAGE_KEYS.VISITOR_BADGE, JSON.stringify(badge));
      } else {
        localStorage.removeItem(STORAGE_KEYS.VISITOR_BADGE);
      }
    } catch (e) {
      console.error('Error saving badge', e);
    }
  },

  getLanguage(): Language {
    try {
      const lang = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (lang === 'ar' || lang === 'en') return lang;
    } catch {
      // ignore
    }
    return 'en';
  },

  setLanguage(lang: Language) {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch {
      // ignore
    }
  },

  saveLanguage(lang: Language) {
    this.setLanguage(lang);
  },

  // User Authentication Session
  getUserSession(): UserSession | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading user session', e);
    }
    return null;
  },

  saveUserSession(session: UserSession | null) {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
      }
    } catch (e) {
      console.error('Error saving user session', e);
    }
  },

  clearUserSession() {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    } catch (e) {
      console.error('Error clearing user session', e);
    }
  },

  // Registered Users Directory
  getRegisteredUsers(): UserProfile[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading registered users', e);
    }
    return [];
  },

  registerUser(profile: UserProfile): void {
    try {
      const users = this.getRegisteredUsers();
      const existingIdx = users.findIndex(u => u.email.toLowerCase() === profile.email.toLowerCase());
      if (existingIdx >= 0) {
        users[existingIdx] = profile;
      } else {
        users.push(profile);
      }
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Error registering user', e);
    }
  },

  findUserByEmail(email: string): UserProfile | null {
    try {
      const users = this.getRegisteredUsers();
      return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
    } catch (e) {
      console.error('Error finding user by email', e);
      return null;
    }
  },

  // Reset demo data to pristine state
  resetAllDemoData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.KNOWLEDGE_BASE);
      localStorage.removeItem(STORAGE_KEYS.UNANSWERED_QUEUE);
      localStorage.removeItem(STORAGE_KEYS.CONDITION_LOGS);
      localStorage.removeItem(STORAGE_KEYS.VISITOR_BADGE);
      localStorage.removeItem(STORAGE_KEYS.VISITED_LANDMARKS);
    } catch (e) {
      console.error('Error resetting demo data', e);
    }
  },

  clearAll() {
    this.resetAllDemoData();
  }
};
