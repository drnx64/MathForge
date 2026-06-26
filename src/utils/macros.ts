import type { CustomMacro } from '../types';

const STORAGE_KEY = 'mathforge_macros';

export function loadMacros(): CustomMacro[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomMacro[];
  } catch {
    return [];
  }
}

export function saveMacros(macros: CustomMacro[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(macros));
  } catch {
    // ignore
  }
}

export function addMacro(name: string, expansion: string): CustomMacro[] {
  const list = loadMacros();
  const existing = list.findIndex(m => m.name === name);
  if (existing >= 0) {
    list[existing] = { name, expansion };
  } else {
    list.push({ name, expansion });
  }
  saveMacros(list);
  return list;
}

export function removeMacro(name: string): CustomMacro[] {
  const list = loadMacros().filter(m => m.name !== name);
  saveMacros(list);
  return list;
}

export function expandMacros(latex: string, macros: CustomMacro[]): string {
  let result = latex;
  for (const m of macros) {
    const re = new RegExp(`\\${m.name}(?![a-zA-Z])`, 'g');
    result = result.replace(re, m.expansion);
  }
  return result;
}
