/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Client service for interacting with the /api/chat endpoint.
 * Implements one automatic retry on failure, fallback to closest knowledge base entry,
 * and automatic synchronization with the Unanswered Questions queue.
 */

import { Language, KnowledgeEntry, WebCitation } from '../types';
import { retrieveRelevantKnowledge, findClosestKnowledgeEntry } from './retrievalService';
import { storageService } from './storageService';

export interface ChatResponseResult {
  text: string;
  sources: string[];
  groundingUrls?: WebCitation[];
  searchQueries?: string[];
  isUnknown: boolean;
  isFallback: boolean;
  errorMessage?: string;
  queuedForReview: boolean;
}

/**
 * Sends a visitor question to the guide creature, executing grounded RAG retrieval,
 * calling the proxy, with retry logic and graceful fallback.
 */
export async function askGuideCreature(
  question: string,
  creatureName: string,
  creatureType: string,
  language: Language
): Promise<ChatResponseResult> {
  const trimmed = question.trim();
  if (!trimmed) {
    throw new Error(language === 'ar' ? 'يرجى كتابة سؤالك أولاً.' : 'Please enter a question for your guide.');
  }

  if (trimmed.length > 500) {
    throw new Error(
      language === 'ar'
        ? `تجاوز السؤال الحد المسموح (500 حرف). طول سؤالك الحالي ${trimmed.length} حرف.`
        : `Question exceeds the 500 characters limit (currently ${trimmed.length}/500). Please shorten your question.`
    );
  }

  // 1. Perform grounded RAG retrieval on current curated knowledge base
  const retrieval = retrieveRelevantKnowledge(trimmed, language, 3);

  // 2. Call backend /api/chat (gemini-3.5-flash + Google Search grounding) with retry logic
  let attempt = 0;
  let lastError: any = null;

  while (attempt < 2) {
    attempt++;
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          creatureName,
          creatureType,
          language,
          relevantDocs: retrieval.entries
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          const rateLimitMsg = errorData.text || errorData.message || errorData.error || (
            language === 'ar'
              ? 'تجاوزت حد الطلبات المسموح به مؤقتاً، يرجى المحاولة بعد قليل'
              : 'Temporary request rate limit exceeded, please try again shortly'
          );
          return {
            text: rateLimitMsg,
            sources: [],
            groundingUrls: [],
            searchQueries: [],
            isUnknown: false,
            isFallback: true,
            queuedForReview: false
          };
        }
        throw new Error(errorData.message || errorData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();

      let queuedForReview = false;
      if (data.isUnknown) {
        queuedForReview = storageService.addToUnansweredQueue(trimmed, language, creatureName);
      }

      return {
        text: data.text,
        sources: data.sources || [],
        groundingUrls: data.groundingUrls || [],
        searchQueries: data.searchQueries || [],
        isUnknown: data.isUnknown,
        isFallback: !!data.isFallback,
        queuedForReview
      };

    } catch (err: any) {
      console.warn(`Attempt ${attempt} to contact Gemini guide failed:`, err);
      lastError = err;
      if (attempt < 2) {
        // Short backoff before retry
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }
  }

  // 3. Fallback mechanism if fetch completely failed (e.g. offline device)
  const closestDoc = findClosestKnowledgeEntry(trimmed);
  const queuedFallback = storageService.addToUnansweredQueue(trimmed, language, creatureName);

  const fallbackTitle = closestDoc
    ? (language === 'ar' ? closestDoc.titleAr : closestDoc.titleEn)
    : 'Petra Archive';
  const fallbackSnippet = closestDoc
    ? (language === 'ar' ? closestDoc.contentAr : closestDoc.contentEn)
    : '';

  const fallbackText = language === 'ar'
    ? `أهلاً بك يا رحالة بترا، بصفتي ${creatureName}، هذه المعلومة الأثرية الموثقة لدينا في سجلات بترا:\n\n📜 **${fallbackTitle}**\n${fallbackSnippet}`
    : `Greetings traveler! As ${creatureName}, here is the closest verified archaeological record from our Petra archive:\n\n📜 **${fallbackTitle}**\n${fallbackSnippet}`;

  return {
    text: fallbackText,
    sources: closestDoc ? [fallbackTitle] : [],
    groundingUrls: [],
    searchQueries: [],
    isUnknown: false,
    isFallback: true,
    errorMessage: lastError?.message,
    queuedForReview: queuedFallback
  };
}
