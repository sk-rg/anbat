/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Cryptographic Hash-Chain Engine for the Petra Monument Condition Register.
 * Uses the standard Web Crypto API (crypto.subtle) to create an append-only,
 * tamper-evident ledger for heritage site managers.
 */

import { MonumentConditionEntry, IntegrityVerificationResult } from '../types';
import { storageService, INITIAL_CONDITION_LOGS } from './storageService';

const GENESIS_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Computes SHA-256 string for the block payload:
 * hash = SHA-256(prevHash + landmarkId + note + severity + timestamp)
 */
export async function computeEntryHash(
  prevHash: string,
  landmarkId: string,
  note: string,
  severity: number,
  timestamp: string
): Promise<string> {
  const payload = `${prevHash}|${landmarkId}|${note.trim()}|${severity}|${timestamp}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback simple hash for environments without WebCrypto (rare)
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * Initializes and verifies initial genesis condition logs so hashes are mathematically exact.
 */
export async function initializeConditionChain(): Promise<MonumentConditionEntry[]> {
  const current = storageService.getConditionLogs();
  if (current.length === 0) {
    const initialized: MonumentConditionEntry[] = [];
    let prevHash = GENESIS_PREV_HASH;

    for (let i = 0; i < INITIAL_CONDITION_LOGS.length; i++) {
      const item = INITIAL_CONDITION_LOGS[i];
      const hash = await computeEntryHash(
        prevHash,
        item.landmarkId,
        item.note,
        item.severity,
        item.timestamp
      );
      const entry: MonumentConditionEntry = {
        ...item,
        index: i + 1,
        prevHash,
        hash
      };
      initialized.push(entry);
      prevHash = hash;
    }
    storageService.saveConditionLogs(initialized);
    return initialized;
  }
  return current;
}

/**
 * Appends a new monument condition inspection record to the chain.
 */
export async function appendConditionEntry(
  landmarkId: string,
  note: string,
  severity: number,
  photoBase64?: string
): Promise<MonumentConditionEntry> {
  const chain = storageService.getConditionLogs();
  const lastEntry = chain[chain.length - 1];
  const prevHash = lastEntry ? lastEntry.hash : GENESIS_PREV_HASH;
  const timestamp = new Date().toISOString();

  const hash = await computeEntryHash(
    prevHash,
    landmarkId,
    note,
    severity,
    timestamp
  );

  const newEntry: MonumentConditionEntry = {
    id: `mcl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    index: chain.length + 1,
    landmarkId,
    note: note.trim(),
    severity,
    photoBase64,
    timestamp,
    prevHash,
    hash
  };

  chain.push(newEntry);
  storageService.saveConditionLogs(chain);
  return newEntry;
}

/**
 * Verifies the cryptographic integrity of the entire chain from block 1 to N.
 */
export async function verifyChainIntegrity(): Promise<IntegrityVerificationResult> {
  const chain = storageService.getConditionLogs();

  if (chain.length === 0) {
    return {
      isValid: true,
      verifiedCount: 0,
      details: 'Ledger is currently empty. Genesis state valid.'
    };
  }

  let expectedPrevHash = GENESIS_PREV_HASH;

  for (let i = 0; i < chain.length; i++) {
    const entry = chain[i];

    // Check 1: Pointer consistency
    if (entry.prevHash !== expectedPrevHash) {
      return {
        isValid: false,
        tamperedIndex: i + 1,
        verifiedCount: i,
        details: `Tampering detected at entry #${i + 1}: prevHash pointer mismatch. Expected ${expectedPrevHash.substring(0, 12)}... but found ${entry.prevHash.substring(0, 12)}...`
      };
    }

    // Check 2: Payload integrity
    const recomputedHash = await computeEntryHash(
      entry.prevHash,
      entry.landmarkId,
      entry.note,
      entry.severity,
      entry.timestamp
    );

    if (recomputedHash !== entry.hash) {
      return {
        isValid: false,
        tamperedIndex: i + 1,
        verifiedCount: i,
        details: `Tampering detected at entry #${i + 1} (${entry.landmarkId.toUpperCase()}): Stored block hash does not match payload digest! Stored: ${entry.hash.substring(0, 12)}... vs Computed: ${recomputedHash.substring(0, 12)}...`
      };
    }

    expectedPrevHash = entry.hash;
  }

  return {
    isValid: true,
    verifiedCount: chain.length,
    details: `Chain valid! All ${chain.length} condition blocks verified via SHA-256 Web Crypto hash-chaining.`
  };
}

/**
 * Demo helper: Silently alters an existing entry in storage without updating
 * its hash or downstream pointers. This allows technical judges to observe the
 * tamper-evident detection in real time.
 */
export function simulateTampering(targetIndex = 2): { success: boolean; alteredField: string } {
  const chain = storageService.getConditionLogs();
  if (chain.length < targetIndex) {
    return { success: false, alteredField: 'No entries available to tamper with.' };
  }

  const target = chain[targetIndex - 1];
  const originalSeverity = target.severity;
  // Silently downgrade severity or modify note
  target.severity = target.severity === 1 ? 4 : 1;
  target.note = target.note + ' [TAMPERED DATA: Unsigned emergency override]';

  storageService.saveConditionLogs(chain);
  return {
    success: true,
    alteredField: `Entry #${targetIndex} (${target.landmarkId}) severity modified from ${originalSeverity} to ${target.severity}`
  };
}

/**
 * Resets condition logs back to cleanly hashed default entries
 */
export async function resetConditionLogs(): Promise<MonumentConditionEntry[]> {
  localStorage.removeItem('anbat_condition_logs_v1');
  return initializeConditionChain();
}
