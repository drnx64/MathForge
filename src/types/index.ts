export interface ExportConfig {
  dpi: number;
  padding: number;
  format: 'svg' | 'png' | 'jpg';
  background: string;
}

export interface Preset {
  name: string;
  dpi: number;
  padding: number;
  description: string;
}

export interface Theme {
  mode: 'light' | 'dark';
}

export type ToolbarAction =
  | 'frac' | 'sqrt' | 'int' | 'sum' | 'prod' | 'lim'
  | 'sub' | 'super' | 'over' | 'under'
  | 'left' | 'right' | 'langle' | 'rangle'
  | 'matrix' | 'cases' | 'align'
  | 'newline' | 'smallskip' | 'medskip' | 'bigskip'
  | 'quad' | 'qquad'
  | 'text'
  | 'randomvar'
  | string;

export interface ToolItem {
  action: ToolbarAction;
  label: string;
  title: string;
  snippet: string;
  cursorOffset: number;
}

export interface GreekLetter {
  name: string;
  command: string;
  snippet: string;
  char: string;
}

export interface HistoryEntry {
  id: string;
  latex: string;
  svgHtml: string;
  timestamp: number;
}

export interface CustomMacro {
  name: string;
  expansion: string;
}
