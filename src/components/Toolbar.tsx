import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ToolbarAction } from '../types';
import { STRUCTURE_TOOLS, MATH_SYMBOLS, GREEK_LETTERS } from '../data/symbols';

interface Template { label: string; latex: string; }

interface ToolbarProps {
  onInsert: (action: ToolbarAction) => void;
  onInsertSnippet: (snippet: string) => void;
  onRandomVar: () => void;
  onTemplate: (latex: string) => void;
  onColorInsert: (color: string) => void;
  onToggleLatexCode: () => void;
  showLatexCode: boolean;
  latexCode: string;
  templates: Template[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleGrid: () => void;
  showGrid: boolean;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onOpenMatrix: () => void;
}

const COLORS = [
  { label: 'blue', hex: '#3b82f6' }, { label: 'red', hex: '#ef4444' },
  { label: 'green', hex: '#22c55e' }, { label: 'purple', hex: '#a855f7' },
  { label: 'orange', hex: '#f97316' }, { label: 'cyan', hex: '#06b6d4' },
];

interface Pos { top: number; left: number; width: number; }

function Dropdown({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos>({ top: 0, left: 0, width: 200 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: Math.max(180, r.width) });
    }
    setOpen(o => !o);
  };

  return (
    <>
      <button ref={btnRef} type="button" onClick={toggle}
        className="px-2 py-0.5 text-xs font-mono rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors shrink-0"
      >{label} &#9660;</button>

      {open && createPortal(
        <div ref={menuRef}
          className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-y-auto"
          style={{ top: pos.top, left: pos.left, maxHeight: '320px', minWidth: pos.width }}
          onMouseDown={e => e.stopPropagation()}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
}

export function Toolbar({
  onInsert, onInsertSnippet, onRandomVar, onTemplate, onColorInsert,
  onToggleLatexCode, showLatexCode, templates,
  theme, onToggleTheme, onToggleGrid, showGrid,
  onToggleSidebar, sidebarOpen, onOpenMatrix
}: ToolbarProps) {
  const [colorOpen, setColorOpen] = useState(false);
  const colorBtnRef = useRef<HTMLButtonElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!colorOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        colorMenuRef.current && !colorMenuRef.current.contains(e.target as Node) &&
        colorBtnRef.current && !colorBtnRef.current.contains(e.target as Node)
      ) {
        setColorOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [colorOpen]);

  return (
    <header className="flex items-center gap-1 px-2 py-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 select-none shrink-0 flex-wrap" style={{ minHeight: '32px' }}>
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-1 shrink-0">MathForge</span>

      <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 shrink-0 mx-0.5" />

      <Dropdown label="Struct">
        <div className="py-1">
          {STRUCTURE_TOOLS.map(t => (
            <button key={t.action} type="button" onClick={() => { onInsert(t.action as ToolbarAction); }}
              className="w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 whitespace-nowrap"
            >{t.title}</button>
          ))}
        </div>
      </Dropdown>

      <Dropdown label="Templates">
        <div className="py-1">
          {templates.map(t => (
            <button key={t.label} type="button" onClick={() => { onTemplate(t.latex); }}
              className="w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 whitespace-nowrap"
            >{t.label}</button>
          ))}
        </div>
      </Dropdown>

      <Dropdown label="Greek">
        <div className="grid grid-cols-4 gap-0.5 p-2">
          {GREEK_LETTERS.map(g => (
            <button key={g.command} type="button" onClick={() => onInsertSnippet(g.snippet)} title={g.name}
              className="px-1.5 py-1 text-xs font-mono hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-center"
            >{g.command.slice(1)}</button>
          ))}
        </div>
      </Dropdown>

      <Dropdown label="Sym">
        <div className="grid grid-cols-5 gap-0.5 p-2">
          {MATH_SYMBOLS.map(t => (
            <button key={t.action} type="button" onClick={() => onInsertSnippet(t.snippet)} title={t.title}
              className="w-8 h-8 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded flex items-center justify-center"
            >{t.label}</button>
          ))}
        </div>
      </Dropdown>

      <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 shrink-0 mx-0.5" />

      <button type="button" onClick={() => onInsert('sub')} title="Subscript _{}"
        className="px-2 py-0.5 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shrink-0">x<sub>n</sub></button>

      <button type="button" onClick={() => onInsert('super')} title="Superscript ^{}"
        className="px-2 py-0.5 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shrink-0">x<sup>n</sup></button>

      <button type="button" onClick={() => onInsert('frac')} title="Fraction"
        className="px-2 py-0.5 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shrink-0">a/b</button>

      <button type="button" onClick={onRandomVar} title="Insert random variable"
        className="px-2 py-0.5 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shrink-0">Var</button>

      <button type="button" onClick={() => onInsert('newline')} title="Line break"
        className="px-2 py-0.5 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shrink-0">&#8626;</button>

      <button type="button" onClick={onOpenMatrix} title="Matrix wizard"
        className="px-2 py-0.5 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shrink-0">&#9634;</button>

      <button type="button" onClick={() => onInsertSnippet('\\today')} title="Insert \\today"
        className="px-2 py-0.5 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shrink-0">Today</button>

      {/* Color picker */}
      <button ref={colorBtnRef} type="button" onClick={() => setColorOpen(o => !o)} title="Insert color"
        className="px-2 py-0.5 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shrink-0 flex items-center gap-1">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-500 via-red-400 to-green-400" />
        Color
      </button>

      {colorOpen && createPortal(
        <div ref={colorMenuRef}
          className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-2"
          style={{
            top: (colorBtnRef.current?.getBoundingClientRect().bottom ?? 0) + 4,
            left: colorBtnRef.current?.getBoundingClientRect().left ?? 0,
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="flex gap-1">
            {COLORS.map(c => (
              <button key={c.label} type="button" onClick={() => { onColorInsert(c.label); setColorOpen(false); }} title={c.label}
                className="w-7 h-7 rounded-full border-2 border-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          <div className="flex gap-1 mt-1">
            <input type="color" onChange={e => { onColorInsert(e.target.value); setColorOpen(false); }} title="Custom color"
              className="w-7 h-7 p-0 border border-gray-300 dark:border-gray-600 rounded cursor-pointer" />
            <button type="button" onClick={() => { onInsertSnippet('\\color{}'); setColorOpen(false); }} title="\\color{}"
              className="px-2 py-0.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded border border-gray-300 dark:border-gray-600">custom</button>
          </div>
        </div>,
        document.body
      )}

      <div className="flex-1 min-w-2" />

      {/* LaTeX code toggle */}
      <button type="button" onClick={onToggleLatexCode} title="Show/hide LaTeX source"
        className={`px-2 py-0.5 text-xs rounded shrink-0 font-mono ${showLatexCode ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
        {'</>'}
      </button>

      <button type="button" onClick={onToggleSidebar} title="Toggle sidebar"
        className={`px-2 py-0.5 text-xs rounded shrink-0 ${sidebarOpen ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>Sidebar</button>

      <button type="button" onClick={onToggleGrid} title="Toggle grid"
        className={`px-2 py-0.5 text-xs rounded shrink-0 ${showGrid ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>Grid</button>

      <button type="button" onClick={onToggleTheme} title="Toggle dark/light"
        className="px-2 py-0.5 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 shrink-0">{theme === 'light' ? 'Dark' : 'Light'}</button>
    </header>
  );
}
