import type { HistoryEntry } from '../types';
import { generateId } from './latex';

const STORAGE_KEY = 'mathforge_history';

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 50)));
  } catch {
    // storage full — silently ignore
  }
}

export function addToHistory(latex: string, svgHtml: string): HistoryEntry[] {
  const entries = loadHistory();
  const entry: HistoryEntry = { id: generateId(), latex, svgHtml, timestamp: Date.now() };
  const updated = [entry, ...entries].slice(0, 50);
  saveHistory(updated);
  return updated;
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
