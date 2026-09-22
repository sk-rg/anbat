/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'ar';

export type CreatureRarity = 'Common' | 'Rare' | 'Legendary';

export type TimeOfDay = 'Morning' | 'Afternoon' | 'Dusk / Night';

export interface Creature {
  id: string;
  nameEn: string;
  nameAr: string;
  titleEn: string;
  titleAr: string;
  rarity: CreatureRarity;
  loreEn: string;
  loreAr: string;
  icon: string; // Emoji representation
  svgArtKey: 'camel' | 'falcon' | 'ibex' | 'scorpion';
  traits: string[];
  preferredTime: TimeOfDay;
  startingLandmarkAffinity: string;
}

export interface VisitorGuideBadge {
  creatureId: string;
  customName: string;
  unlockedAt: string;
  startingLandmarkId: string;
  timeOfDay: TimeOfDay;
  rarityRoll: number;
  explainableFormula: string;
}

export interface Landmark {
  id: string;
  nameEn: string;
  nameAr: string;
  subtitleEn: string;
  subtitleAr: string;
  routeOrder: number;
  svgCoordinates: { x: number; y: number };
  geoCoordinates: { lat: number; lng: number };
  shortDescEn: string;
  shortDescAr: string;
  curatedStoryEn: string;
  curatedStoryAr: string;
  knowledgeEntryIds: string[];
  thumbnailUrl?: string;
}

export interface KnowledgeEntry {
  id: string;
  titleEn: string;
  titleAr: string;
  category: 'landmark' | 'engineering' | 'beliefs' | 'myth' | 'condition';
  contentEn: string;
  contentAr: string;
  keywords: string[];
  landmarkId?: string;
  addedBy?: 'curated' | 'admin';
  createdAt?: string;
}

export interface WebCitation {
  title?: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'creature' | 'system';
  text: string;
  language: Language;
  timestamp: string;
  sources?: string[]; // Knowledge entry titles or IDs
  groundingUrls?: WebCitation[];
  searchQueries?: string[];
  isFallback?: boolean;
  isUnknown?: boolean;
  queuedForReview?: boolean;
}

export interface UnansweredQuestion {
  id: string;
  question: string;
  language: Language;
  timestamp: string;
  creatureName?: string;
  status: 'pending' | 'resolved';
  resolvedAnswer?: string;
  resolvedAt?: string;
}

export interface MonumentConditionEntry {
  id: string;
  index: number;
  landmarkId: string;
  note: string;
  severity: number; // 1 to 5
  photoBase64?: string;
  timestamp: string;
  prevHash: string;
  hash: string;
}

export interface IntegrityVerificationResult {
  isValid: boolean;
  tamperedIndex?: number;
  details: string;
  verifiedCount: number;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  age?: number | string;
  photoUrl?: string;
  favoriteDish?: string;
  country?: string;
  password?: string;
  createdAt: string;
}

export interface UserSession {
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  age?: number | string;
  photoUrl?: string;
  favoriteDish?: string;
  country?: string;
  provider: 'local' | 'google' | 'github' | 'guest';
  signedInAt: string;
}

