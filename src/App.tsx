import 'mathlive';
import { useState, useCallback, useRef, useEffect, type ChangeEvent } from 'react';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { ConfigPanel } from './components/ConfigPanel';
import { StatusBar } from './components/StatusBar';
import { MatrixWizard } from './components/MatrixWizard';
import { useMathJax } from './hooks/useMathJax';
import { useSettings } from './hooks/useSettings';
import { exportSVG, exportPNG, exportJPG } from './utils/export';
import { addToHistory } from './utils/history';
import type { ToolbarAction, HistoryEntry, CustomMacro } from './types';

const STORAGE_KEY = 'mathforge-latex';
const RANDOM_VARS = ['x', 'y', 'z', 'a', 'b', 'c', 'n', 'm', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w'];

function fillRandomVars(snippet: string): string {
  let idx = 0;
  return snippet.replace(/\{\}/g, () => `{${RANDOM_VARS[idx++ % RANDOM_VARS.length]}}`);
}

const SNIPPET_MAP = new Map<string, string>();
(['frac', 'sqrt', 'int', 'sum', 'prod', 'lim']).forEach(a => {
  const m: Record<string, string> = { frac: '\\frac{}{}', sqrt: '\\sqrt{}', int: '\\int_{}^{}', sum: '\\sum_{}^{}', prod: '\\prod_{}^{}', lim: '\\lim_{}' };
  SNIPPET_MAP.set(a, m[a]);
});
SNIPPET_MAP.set('sub', '_{}');
SNIPPET_MAP.set('super', '^{}');
SNIPPET_MAP.set('cases', '\\begin{cases}  \\end{cases}');
SNIPPET_MAP.set('matrix', '\\begin{matrix}  \\end{matrix}');
SNIPPET_MAP.set('align', '\\begin{align}  \\end{align}');
SNIPPET_MAP.set('text', '\\text{}');
SNIPPET_MAP.set('binom', '\\binom{}{}');
SNIPPET_MAP.set('color', '\\color{blue}{}');

const TEMPLATES = [
  { label: 'Quadratic Formula', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
  { label: 'Pythagorean Theorem', latex: 'a^2 + b^2 = c^2' },
  { label: 'Euler Identity', latex: 'e^{i\\pi} + 1 = 0' },
  { label: 'Taylor Series', latex: '\\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x-a)^n' },
  { label: 'Fourier Transform', latex: '\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) e^{-2\\pi i x \\xi} \\, dx' },
  { label: 'Schrödinger Equation', latex: 'i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi' },
  { label: 'Maxwell Equations', latex: '\\begin{aligned} \\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\varepsilon_0} \\\\ \\nabla \\cdot \\mathbf{B} &= 0 \\end{aligned}' },
  { label: 'Bayes Theorem', latex: 'P(A|B) = \\frac{P(B|A) \\, P(A)}{P(B)}' },
  { label: 'Einstein Field Eq', latex: 'G_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}' },
  { label: 'Binomial Theorem', latex: '(a+b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k' },
];

export default function App() {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  const [latex, setLatex] = useState(saved || '\\int_{0}^{1} x^2 \\, dx');
  const [svgHtml, setSvgHtml] = useState('');
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [statusType, setStatusType] = useState<'info' | 'error' | 'success'>('info');
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [showLatexCode, setShowLatexCode] = useState(false);
  const [customMacros, setCustomMacros] = useState<CustomMacro[]>([]);
  const [historyVersion, setHistoryVersion] = useState(0);

  const mfRef = useRef<any>(null);
  const compileTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const svgElementRef = useRef<SVGSVGElement | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>();

  const mathjax = useMathJax();
  const settings = useSettings();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme.mode === 'dark');
  }, [settings.theme.mode]);

  useEffect(() => {
    if (!svgHtml) { svgElementRef.current = null; return; }
    const div = document.createElement('div');
    div.innerHTML = svgHtml;
    svgElementRef.current = div.querySelector('svg');
  }, [svgHtml]);

  // Auto-save
  useEffect(() => {
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, latex);
    }, 500);
    return () => clearTimeout(autoSaveRef.current);
  }, [latex]);

  // Hidden compile for preview & export
  const compile = useCallback(async (input: string) => {
    if (!mathjax.loaded || !input.trim()) {
      if (!input.trim()) setSvgHtml('');
      return;
    }
    clearTimeout(compileTimeoutRef.current);
    compileTimeoutRef.current = setTimeout(async () => {
      try {
        const html = await mathjax.render(`\\displaystyle{${input.trim()}}`);
        if (html) setSvgHtml(html);
      } catch { /* preview will show nothing */ }
    }, 100);
  }, [mathjax.loaded, mathjax.render]);

  useEffect(() => { compile(latex); }, [latex, compile]);

  const saveToHistory = useCallback(() => {
    if (svgHtml && latex.trim()) {
      addToHistory(latex, svgHtml);
      setHistoryVersion(v => v + 1);
    }
  }, [latex, svgHtml]);

  const insertIntoTarget = useCallback((text: string) => {
    const el = mfRef.current;
    if (el?.insert) { el.insert(text); el.focus(); return; }
  }, []);

  const handleInsertSnippet = useCallback((snippet: string) => {
    insertIntoTarget(fillRandomVars(snippet));
  }, [insertIntoTarget]);

  const handleInsert = useCallback((action: ToolbarAction) => {
    const snippet = SNIPPET_MAP.get(action);
    if (snippet) handleInsertSnippet(snippet);
  }, [handleInsertSnippet]);

  const handleTemplate = useCallback((latexTemplate: string) => {
    insertIntoTarget(latexTemplate);
  }, [insertIntoTarget]);

  const handleColorInsert = useCallback((color: string) => {
    insertIntoTarget(`\\color{${color}}{}`);
  }, [insertIntoTarget]);

  const handleRestore = useCallback((entry: HistoryEntry) => {
    setLatex(entry.latex);
    setSvgHtml(entry.svgHtml);
    const el = mfRef.current;
    if (el) el.value = entry.latex;
  }, []);

  const handleMacroChange = useCallback((macros: CustomMacro[]) => {
    setCustomMacros(macros);
    const el = mfRef.current;
    if (el) {
      const macroObj: Record<string, string> = {};
      macros.forEach(m => { macroObj[m.name] = m.value; });
      el.macros = macroObj;
    }
  }, []);

  const doExport = useCallback(async (fn: () => void | Promise<void>, label: string) => {
    if (!svgElementRef.current) { setStatusMessage('Nothing to export'); setStatusType('error'); return; }
    try {
      await fn();
      setStatusMessage(`${label} exported`);
      setStatusType('success');
      saveToHistory();
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Export failed');
      setStatusType('error');
    }
  }, [saveToHistory]);

  const handleExportSVG = useCallback(() => doExport(() => exportSVG(svgElementRef.current!, { ...settings.config, format: 'svg' }), 'SVG'), [settings.config, doExport]);
  const handleExportPNG = useCallback(() => doExport(() => exportPNG(svgElementRef.current!, settings.config), 'PNG'), [settings.config, doExport]);
  const handleExportJPG = useCallback(() => doExport(() => exportJPG(svgElementRef.current!, settings.config), 'JPG'), [settings.config, doExport]);
  const handleExportPDF = useCallback(() => { window.print(); }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'Enter') { e.preventDefault(); handleExportPNG(); }
      if (ctrl && e.key === '1') { e.preventDefault(); handleExportSVG(); }
      if (ctrl && e.key === '2') { e.preventDefault(); handleExportPNG(); }
      if (ctrl && e.key === 's') { e.preventDefault(); saveToHistory(); setStatusMessage('Saved'); setStatusType('info'); }
      if (ctrl && e.key === 'l') { e.preventDefault(); setShowLatexCode(p => !p); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const setMfRef = useCallback((node: HTMLElement | null) => {
    if (!node) { mfRef.current = null; return; }
    const mf = node as any;
    mfRef.current = mf;
    const handler = () => {
      try { setLatex(mf.getValue?.('latex') ?? mf.value ?? ''); }
      catch { /* ignore */ }
    };
    mf.addEventListener('input', handler);
    if (latex && mf.value !== latex) mf.value = latex;
    // Apply saved macros
    if (customMacros.length > 0) {
      const macroObj: Record<string, string> = {};
      customMacros.forEach(m => { macroObj[m.name] = m.value; });
      mf.macros = macroObj;
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Toolbar
        onInsert={handleInsert}
        onInsertSnippet={handleInsertSnippet}
        onRandomVar={() => insertIntoTarget(Math.random().toString(36).slice(2, 5))}
        onTemplate={handleTemplate}
        onColorInsert={handleColorInsert}
        onToggleLatexCode={() => setShowLatexCode(p => !p)}
        showLatexCode={showLatexCode}
        latexCode={latex}
        templates={TEMPLATES}
        theme={settings.theme.mode}
        onToggleTheme={settings.toggleTheme}
        onToggleGrid={settings.toggleGrid}
        showGrid={settings.showGrid}
        onToggleSidebar={() => {}}
        sidebarOpen={true}
        onOpenMatrix={() => setMatrixOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
        <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
          {/* Preview on TOP */}
          <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 p-6 flex flex-col items-center justify-start gap-4">
            {svgHtml ? (
              <div className="select-none mt-8 print-area" style={{ fontSize: `${settings.fontSize * 1.3}px`, lineHeight: 1.6 }}>
                <div dangerouslySetInnerHTML={{ __html: svgHtml }} />
              </div>
            ) : (
              <div className="text-gray-300 dark:text-gray-500 text-sm mt-16">Type to see preview</div>
            )}
          </div>

          {/* Mathlive on BOTTOM */}
          <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 flex justify-center">
            <math-field
              ref={setMfRef}
              className="w-full max-w-3xl"
              style={{
                fontSize: `${settings.editorFontSize}px`,
                '--mathfield-placeholder-color': '#9ca3af',
                minHeight: '48px',
              } as React.CSSProperties}
              placeholder="Type math here..."
              virtual-keyboard-policy="manual"
              smart-fence
              smart-mode
            />
          </div>

          {/* Optional: LaTeX code panel */}
          {showLatexCode && (
            <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
              <div className="flex items-center gap-2 px-4 pt-2 pb-1">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">LaTeX Source</span>
                <button type="button" onClick={() => { navigator.clipboard.writeText(latex); setStatusMessage('Copied!'); setStatusType('info'); }} className="text-xs text-blue-500 hover:text-blue-700">Copy</button>
              </div>
              <textarea
                readOnly
                value={latex}
                rows={3}
                className="w-full resize-none outline-none border-0 bg-transparent text-gray-700 dark:text-gray-300 font-mono text-sm leading-relaxed px-4 pb-2"
                spellCheck={false}
              />
            </div>
          )}
        </div>

        <Sidebar
          onRestore={handleRestore}
          onMacroChange={handleMacroChange}
          onInsertSnippet={handleInsertSnippet}
          historyVersion={historyVersion}
        />
      </div>

      <ConfigPanel
        config={settings.config}
        presets={settings.presets}
        fontSize={settings.fontSize}
        onFontSizeChange={settings.setFontSize}
        onUpdateConfig={settings.updateConfig}
        onApplyPreset={settings.applyPreset}
        onExportSVG={handleExportSVG}
        onExportPNG={handleExportPNG}
        onExportJPG={handleExportJPG}
        onExportPDF={handleExportPDF}
        disabled={!svgHtml}
      />

      <StatusBar message={statusMessage} type={statusType} />

      <MatrixWizard
        open={matrixOpen}
        onClose={() => setMatrixOpen(false)}
        onInsert={handleInsertSnippet}
      />
    </div>
  );
}
