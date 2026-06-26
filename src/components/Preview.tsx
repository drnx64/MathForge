import { useRef, useEffect } from 'react';

interface PreviewProps {
  svgHtml: string;
  error: string | null;
  isCompiling: boolean;
  theme: 'light' | 'dark';
  fontSize: number;
  showGrid: boolean;
  showBBox: boolean;
}

export function Preview({ svgHtml, error, isCompiling, theme, fontSize, showGrid }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !svgHtml) return;
    el.innerHTML = svgHtml;
    const svg = el.querySelector('svg');
    if (svg) {
      svg.style.maxWidth = '100%';
      svg.style.height = 'auto';
      svg.style.display = 'block';
    }
  }, [svgHtml]);

  const handleDragStart = (e: React.DragEvent) => {
    const svgEl = containerRef.current?.querySelector('svg');
    if (!svgEl) { e.preventDefault(); return; }
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    e.dataTransfer.setData('text/plain', svgData);
    e.dataTransfer.setData('image/svg+xml', URL.createObjectURL(blob));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className={`relative flex-1 flex items-center justify-center overflow-hidden ${isDark ? 'bg-[#1e1e1e]' : 'bg-[#f0f0f0]'}`}>
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(150,150,150,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(150,150,150,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />
      )}

      <div
        ref={cardRef}
        className={`relative shadow-lg rounded-lg overflow-hidden transition-colors ${isDark ? 'bg-[#121212]' : 'bg-white'}`}
        style={{ padding: `${Math.max(fontSize * 0.5, 16)}px`, minWidth: '80px', minHeight: '40px' }}
        draggable={!!svgHtml && !error}
        onDragStart={handleDragStart}
      >
        {isCompiling && (
          <div className={`absolute inset-0 flex items-center justify-center z-10 rounded-lg ${isDark ? 'bg-black/40' : 'bg-white/60'}`}>
            <span className="text-xs text-gray-400">Compiling...</span>
          </div>
        )}

        {error ? (
          <div className="text-red-500 text-xs font-mono whitespace-pre-wrap max-w-md">{error}</div>
        ) : svgHtml ? (
          <div
            ref={containerRef}
            className="flex items-center justify-center"
            style={{
              filter: isDark ? 'invert(1)' : 'none',
              minHeight: '20px',
            }}
          />
        ) : (
          <div className="text-gray-400 dark:text-gray-500 text-xs font-mono">Type LaTeX to see preview</div>
        )}
      </div>
    </div>
  );
}
