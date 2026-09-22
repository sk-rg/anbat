/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Retrieval Engine for Grounded RAG in ANBAT.
 * Searches curated knowledge base entries in both English and Arabic,
 * calculating token overlap, title weighting, and keyword match scores.
 */

import { KnowledgeEntry, Language } from '../types';
import { storageService } from './storageService';

export interface RetrievalResult {
  entries: KnowledgeEntry[];
  hasRelevantDocs: boolean;
  topScore: number;
}

/**
 * Normalizes text for comparison across Arabic and English:
 * - Lowercases English
 * - Strips diacritics / tashkeel from Arabic
 * - Normalizes Arabic letter variants (alif, yaa, taa marbouta)
 */
function normalizeQuery(text: string): string {
  let cleaned = text.toLowerCase().trim();

  // Remove common punctuation
  cleaned = cleaned.replace(/[?.,!،؟;:()\[\]"'/\\-]/g, ' ');

  // Arabic normalizations
  cleaned = cleaned
    .replace(/[\u064B-\u065F]/g, '') // Remove Arabic tashkeel/diacritics
    .replace(/[أإآ]/g, 'ا') // Normalize alif
    .replace(/ة/g, 'ه') // Normalize taa marbouta
    .replace(/ى/g, 'ي') // Normalize alif maqsura
    .replace(/\s+/g, ' ');

  return cleaned;
}

/**
 * Common stop words to deprioritize in scoring
 */
const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'to', 'of', 'for', 'with', 'about', 'what', 'where', 'who', 'how', 'why', 'can', 'you', 'tell', 'me',
  'في', 'من', 'على', 'إلى', 'عن', 'ما', 'ماذا', 'هل', 'كيف', 'اين', 'أين', 'هو', 'هي', 'التي', 'الذي', 'مع', 'هذا', 'هذه', 'كان', 'تم'
]);

/**
 * Scores a single knowledge entry against the user's query tokens.
 */
function scoreEntry(entry: KnowledgeEntry, queryTokens: string[], originalQuery: string): number {
  let score = 0;
  const entryTextEn = normalizeQuery(`${entry.titleEn} ${entry.contentEn} ${entry.keywords.join(' ')}`);
  const entryTextAr = normalizeQuery(`${entry.titleAr} ${entry.contentAr} ${entry.keywords.join(' ')}`);
  const titleTextEn = normalizeQuery(entry.titleEn);
  const titleTextAr = normalizeQuery(entry.titleAr);

  const normalizedQuery = normalizeQuery(originalQuery);

  // Exact phrase check in title
  if (titleTextEn.includes(normalizedQuery) || titleTextAr.includes(normalizedQuery)) {
    score += 50;
  }

  // Token matching
  for (const token of queryTokens) {
    if (STOP_WORDS.has(token) || token.length < 2) continue;

    // Title match: high weight
    if (titleTextEn.includes(token) || titleTextAr.includes(token)) {
      score += 25;
    }

    // Keyword tags match: high weight
    const keywordMatch = entry.keywords.some(k => normalizeQuery(k).includes(token));
    if (keywordMatch) {
      score += 20;
    }

    // Body content match: moderate weight
    if (entryTextEn.includes(token) || entryTextAr.includes(token)) {
      score += 8;
    }
  }

  return score;
}

/**
 * Retrieves the top relevant knowledge entries for the user's question.
 * Returns up to maxResults (default 3).
 */
export function retrieveRelevantKnowledge(
  query: string,
  lang: Language = 'en',
  maxResults = 3
): RetrievalResult {
  const allEntries = storageService.getKnowledgeBase();
  const normalized = normalizeQuery(query);
  const tokens = normalized.split(/\s+/).filter(t => t.length > 1);

  if (tokens.length === 0) {
    return { entries: [], hasRelevantDocs: false, topScore: 0 };
  }

  const scored = allEntries.map(entry => ({
    entry,
    score: scoreEntry(entry, tokens, query)
  }));

  // Sort descending by relevance score
  scored.sort((a, b) => b.score - a.score);

  const topScored = scored.filter(item => item.score > 0);
  const topScore = topScored.length > 0 ? topScored[0].score : 0;

  // Threshold: if score is very low (< 10), consider it not relevant enough to avoid hallucinations
  const RELEVANCE_THRESHOLD = 8;
  const hasRelevantDocs = topScore >= RELEVANCE_THRESHOLD;

  const selectedEntries = hasRelevantDocs
    ? topScored.slice(0, maxResults).map(s => s.entry)
    : [];

  return {
    entries: selectedEntries,
    hasRelevantDocs,
    topScore
  };
}

/**
 * Finds the single closest knowledge entry even if below threshold (for offline fallback).
 */
export function findClosestKnowledgeEntry(query: string): KnowledgeEntry | null {
  const allEntries = storageService.getKnowledgeBase();
  if (allEntries.length === 0) return null;

  const normalized = normalizeQuery(query);
  const tokens = normalized.split(/\s+/).filter(t => t.length > 1);
  if (tokens.length === 0) return allEntries[0];

  const scored = allEntries.map(entry => ({
    entry,
    score: scoreEntry(entry, tokens, query)
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.entry || allEntries[0];
}
