import { useState, useEffect, useCallback } from 'react';
import type { HistoryEntry, CustomMacro } from '../types';
import { loadHistory, saveHistory, clearHistory } from '../utils/history';
import { loadMacros, saveMacros } from '../utils/macros';
import { formatTimestamp } from '../utils/latex';
import { GREEK_LETTERS, MATH_SYMBOLS } from '../data/symbols';

interface SidebarProps {
  onRestore: (entry: HistoryEntry) => void;
  onMacroChange: (macros: CustomMacro[]) => void;
  onInsertSnippet: (snippet: string) => void;
  historyVersion?: number;
}

type Tab = 'greek' | 'symbols' | 'history' | 'macros';

export function Sidebar({ onRestore, onMacroChange, onInsertSnippet, historyVersion = 0 }: SidebarProps) {
  const [tab, setTab] = useState<Tab>('greek');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [macros, setMacros] = useState<CustomMacro[]>([]);
  const [macroName, setMacroName] = useState('');
  const [macroExp, setMacroExp] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const load = useCallback(() => {
    setHistory(loadHistory());
    setMacros(loadMacros());
  }, []);

  useEffect(() => { load(); }, [load, historyVersion]);

  const handleClear = () => { clearHistory(); setHistory([]); };

  const handleAddMacro = () => {
    const name = macroName.trim();
    const exp = macroExp.trim();
    if (!name || !exp) return;
    const updated = [...macros.filter(m => m.name !== name), { name, expansion: exp }];
    setMacros(updated);
    saveMacros(updated);
    onMacroChange(updated);
    setMacroName('');
    setMacroExp('');
  };

  const handleRemoveMacro = (name: string) => {
    const updated = macros.filter(m => m.name !== name);
    setMacros(updated);
    saveMacros(updated);
    onMacroChange(updated);
  };

  // Drag-to-reorder history
  const handleDragStart = (idx: number) => { setDragIdx(idx); };
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const reordered = [...history];
    const [item] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, item);
    setHistory(reordered);
    setDragIdx(idx);
  };
  const handleDrop = () => {
    if (dragIdx === null) return;
    saveHistory(history);
    setDragIdx(null);
  };
  const handleDragEnd = () => { setDragIdx(null); };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'greek', label: 'Greek' },
    { key: 'symbols', label: 'Symbols' },
    { key: 'history', label: 'Hist' },
    { key: 'macros', label: 'Macros' },
  ];

  return (
    <div className="w-64 shrink-0 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`flex-1 py-1.5 text-xs font-medium text-center border-b-2 transition-colors ${
              tab === t.key
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >{t.label}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {tab === 'greek' && (
          <div className="grid grid-cols-4 gap-1">
            {GREEK_LETTERS.map(g => (
              <button key={g.command} type="button" onClick={() => onInsertSnippet(g.snippet)} title={g.command}
                className="h-9 text-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors flex items-center justify-center"
              >{g.char}</button>
            ))}
          </div>
        )}

        {tab === 'symbols' && (
          <div className="grid grid-cols-4 gap-1">
            {MATH_SYMBOLS.map(t => (
              <button key={t.action} type="button" onClick={() => onInsertSnippet(t.snippet)} title={t.title}
                className="h-9 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors flex items-center justify-center"
              >{t.label}</button>
            ))}
          </div>
        )}

        {tab === 'history' && (
          <>
            {history.length === 0 && <div className="text-xs text-gray-400 text-center py-4">No history yet</div>}
            {history.map((entry, idx) => (
              <div key={entry.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                className={`group flex items-center gap-1 p-1 mb-1 rounded text-xs font-mono text-gray-700 dark:text-gray-300 border border-transparent transition-colors ${
                  dragIdx === idx ? 'opacity-50 border-dashed border-gray-400' : 'hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-gray-300 dark:text-gray-500 cursor-grab text-[10px] px-0.5 select-none">&#x2630;</span>
                <button type="button" onClick={() => onRestore(entry)} className="flex-1 text-left truncate min-w-0">
                  <div className="truncate">{entry.latex}</div>
                  <div className="text-[10px] text-gray-400">{formatTimestamp(entry.timestamp)}</div>
                </button>
              </div>
            ))}
            {history.length > 0 && (
              <button type="button" onClick={handleClear} className="w-full text-center py-1 text-[11px] text-red-500 hover:text-red-600 mt-2">Clear history</button>
            )}
          </>
        )}

        {tab === 'macros' && (
          <>
            <div className="flex gap-1 mb-2">
              <input value={macroName} onChange={e => setMacroName(e.target.value)} placeholder="\\cmd"
                className="flex-1 px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono" />
            </div>
            <div className="flex gap-1 mb-2">
              <input value={macroExp} onChange={e => setMacroExp(e.target.value)} placeholder="\\expansion"
                className="flex-1 px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono" />
              <button type="button" onClick={handleAddMacro} className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">+</button>
            </div>
            {macros.length === 0 && <div className="text-xs text-gray-400 text-center py-2">No custom macros</div>}
            {macros.map(m => (
              <div key={m.name} className="flex items-center gap-1 py-1 px-1 text-xs font-mono text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <span className="text-blue-600 dark:text-blue-400">{m.name}</span>
                <span className="text-gray-400">&rarr;</span>
                <span className="flex-1 truncate">{m.expansion}</span>
                <button type="button" onClick={() => handleRemoveMacro(m.name)} className="text-red-400 hover:text-red-600 px-1">&times;</button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
