import 'mathlive';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { ConfigPanel } from './components/ConfigPanel';
import { StatusBar } from './components/StatusBar';
import { Sidebar } from './components/Sidebar';
import { MatrixWizard } from './components/MatrixWizard';
import { useMathJax } from './hooks/useMathJax';
import { useSettings } from './hooks/useSettings';
import { exportSVG, exportPNG, exportJPG } from './utils/export';
import { addToHistory } from './utils/history';
import { STRUCTURE_TOOLS, SPACING_TOOLS, BRACKET_TOOLS } from './data/symbols';
import type { ToolbarAction, HistoryEntry } from './types';

const RANDOM_VARS = ['x', 'y', 'z', 'a', 'b', 'c', 'n', 'm', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w'];

function fillRandomVars(snippet: string): string {
  let idx = 0;
  return snippet.replace(/\{\}/g, () => `{${RANDOM_VARS[idx++ % RANDOM_VARS.length]}}`);
}

const SNIPPET_MAP = new Map<string, string>();
STRUCTURE_TOOLS.forEach(t => SNIPPET_MAP.set(t.action, t.snippet));
SPACING_TOOLS.forEach(t => SNIPPET_MAP.set(t.action, t.snippet));
BRACKET_TOOLS.forEach(t => SNIPPET_MAP.set(t.action, t.snippet));
SNIPPET_MAP.set('sub', '_{}');
SNIPPET_MAP.set('super', '^{}');

export default function App() {
  const [latex, setLatex] = useState('\\int_{0}^{1} x^2 \\, dx');
  const [svgHtml, setSvgHtml] = useState('');
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [statusType, setStatusType] = useState<'info' | 'error' | 'success'>('info');
  const [matrixOpen, setMatrixOpen] = useState(false);

  const mfRef = useRef<any>(null);
  const compileTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const svgElementRef = useRef<SVGSVGElement | null>(null);

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

  // Hidden compile for export only
  const compile = useCallback(async (input: string) => {
    if (!mathjax.loaded || !input.trim()) {
      if (!input.trim()) setSvgHtml('');
      return;
    }
    if (compileTimeoutRef.current) clearTimeout(compileTimeoutRef.current);
    compileTimeoutRef.current = setTimeout(async () => {
      try {
        const html = await mathjax.render(`\\displaystyle{${input.trim()}}`);
        if (html) setSvgHtml(html);
      } catch { /* export will handle missing svg */ }
    }, 80);
  }, [mathjax.loaded, mathjax.render]);

  useEffect(() => { compile(latex); }, [latex, compile]);

  const saveToHistory = useCallback(() => {
    if (svgHtml && latex.trim()) addToHistory(latex, svgHtml);
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

  const handleRestore = useCallback((entry: HistoryEntry) => {
    setLatex(entry.latex);
    setSvgHtml(entry.svgHtml);
    const el = mfRef.current;
    if (el) el.value = entry.latex;
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

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'Enter') { e.preventDefault(); handleExportPNG(); }
      if (ctrl && e.key === '1') { e.preventDefault(); handleExportSVG(); }
      if (ctrl && e.key === '2') { e.preventDefault(); handleExportPNG(); }
      if (ctrl && e.key === 's') { e.preventDefault(); saveToHistory(); setStatusMessage('Saved'); setStatusType('info'); }
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
  }, []);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Toolbar
        onInsert={handleInsert}
        onInsertSnippet={handleInsertSnippet}
        onRandomVar={() => insertIntoTarget(Math.random().toString(36).slice(2, 5))}
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
          <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 p-6 flex items-start justify-center">
            <math-field
              ref={setMfRef}
              className="w-full max-w-3xl"
              style={{
                fontSize: `${settings.editorFontSize}px`,
                '--mathfield-placeholder-color': '#9ca3af',
                minHeight: '80px',
              } as React.CSSProperties}
              placeholder="Type math here..."
              virtual-keyboard-policy="manual"
              smart-fence
              smart-mode
            />
          </div>

          {/* Preview panel */}
          {svgHtml && (
            <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2 px-4 pt-2 pb-1">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Preview</span>
              </div>
              <div className="px-6 pb-4 flex justify-center"
                style={{ fontSize: `${settings.fontSize * 1.2}px` }}>
                <div dangerouslySetInnerHTML={{ __html: svgHtml }} />
              </div>
            </div>
          )}
        </div>

        <Sidebar
          onRestore={handleRestore}
          onMacroChange={() => {}}
          onInsertSnippet={handleInsertSnippet}
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
