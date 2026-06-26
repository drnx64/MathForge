import { useState, useCallback } from 'react';
import type { ExportConfig, Preset, Theme } from '../types';

const PRESETS: Preset[] = [
  { name: 'Exam Solution', dpi: 300, padding: 4, description: 'High-density print, fits dual-column LaTeX templates' },
  { name: 'Lecture Slide', dpi: 600, padding: 16, description: 'Large-scale projection, optimal contrast for decks' },
  { name: 'Notebook', dpi: 300, padding: 8, description: 'Designed for markdown engines like Obsidian or Notion' },
  { name: 'Social Square', dpi: 1200, padding: 48, description: 'High-res 1:1 viewport with deep padding' },
];

interface SettingsState {
  config: ExportConfig;
  theme: Theme;
  fontSize: number;
  editorFontSize: number;
  showGrid: boolean;
  showBBox: boolean;
}

const DEFAULT_CONFIG: ExportConfig = {
  dpi: 300,
  padding: 8,
  format: 'png',
  background: '#FFFFFF',
};

export function useSettings() {
  const [state, setState] = useState<SettingsState>({
    config: { ...DEFAULT_CONFIG },
    theme: { mode: 'light' },
    fontSize: 24,
    editorFontSize: 14,
    showGrid: false,
    showBBox: false,
  });

  const updateConfig = useCallback((patch: Partial<ExportConfig>) => {
    setState(s => ({ ...s, config: { ...s.config, ...patch } }));
  }, []);

  const toggleTheme = useCallback(() => {
    setState(s => ({
      ...s,
      theme: { mode: s.theme.mode === 'light' ? 'dark' : 'light' },
    }));
  }, []);

  const toggleGrid = useCallback(() => {
    setState(s => ({ ...s, showGrid: !s.showGrid }));
  }, []);

  const toggleBBox = useCallback(() => {
    setState(s => ({ ...s, showBBox: !s.showBBox }));
  }, []);

  const setFontSize = useCallback((size: number) => {
    setState(s => ({ ...s, fontSize: Math.max(12, Math.min(72, size)) }));
  }, []);

  const setEditorFontSize = useCallback((size: number) => {
    setState(s => ({ ...s, editorFontSize: Math.max(10, Math.min(36, size)) }));
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setState(s => ({
      ...s,
      config: { ...s.config, dpi: preset.dpi, padding: preset.padding },
    }));
  }, []);

  return {
    ...state,
    presets: PRESETS,
    updateConfig,
    toggleTheme,
    toggleGrid,
    toggleBBox,
    setFontSize,
    setEditorFontSize,
    applyPreset,
  };
}
