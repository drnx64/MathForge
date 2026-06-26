import type { ExportConfig, Preset } from '../types';

interface ConfigPanelProps {
  config: ExportConfig;
  presets: Preset[];
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onUpdateConfig: (patch: Partial<ExportConfig>) => void;
  onApplyPreset: (preset: Preset) => void;
  onExportSVG: () => void;
  onExportPNG: () => void;
  onExportJPG: () => void;
  disabled: boolean;
}

export function ConfigPanel({
  config,
  presets,
  fontSize,
  onFontSizeChange,
  onUpdateConfig,
  onApplyPreset,
  onExportSVG,
  onExportPNG,
  onExportJPG,
  disabled,
}: ConfigPanelProps) {
  const dpiOptions = [150, 300, 600, 1200];

  return (
    <footer className="flex items-center gap-3 px-3 py-1.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0">
      {/* Font Size */}
      <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
        Size:
        <input
          type="number"
          value={fontSize}
          onChange={e => onFontSizeChange(Number(e.target.value))}
          min={12}
          max={72}
          className="w-14 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
        />
      </label>

      {/* Padding */}
      <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
        Pad:
        <input
          type="number"
          value={config.padding}
          onChange={e => onUpdateConfig({ padding: Number(e.target.value) })}
          min={0}
          max={96}
          className="w-14 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
        />
      </label>

      {/* DPI */}
      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
        <span>DPI:</span>
        {dpiOptions.map(d => (
          <button
            key={d}
            onClick={() => onUpdateConfig({ dpi: d })}
            className={`px-1.5 py-0.5 rounded text-xs border transition-colors ${
              config.dpi === d
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Presets */}
      <select
        onChange={e => {
          const idx = Number(e.target.value);
          if (idx >= 0) onApplyPreset(presets[idx]);
        }}
        defaultValue=""
        className="text-xs px-1.5 py-0.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
      >
        <option value="" disabled>Presets</option>
        {presets.map((p, i) => (
          <option key={p.name} value={i}>{p.name}</option>
        ))}
      </select>

      {/* Background */}
      <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
        BG:
        <input
          type="color"
          value={config.background}
          onChange={e => onUpdateConfig({ background: e.target.value })}
          className="w-6 h-5 p-0 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
        />
      </label>

      <div className="flex-1" />

      {/* Export buttons */}
      <button
        onClick={onExportSVG}
        disabled={disabled}
        className="px-2.5 py-0.5 text-xs font-medium rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        SVG
      </button>
      <button
        onClick={onExportPNG}
        disabled={disabled}
        className="px-2.5 py-0.5 text-xs font-medium rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        PNG
      </button>
      <button
        onClick={onExportJPG}
        disabled={disabled}
        className="px-2.5 py-0.5 text-xs font-medium rounded bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        JPG
      </button>
    </footer>
  );
}
