import { useState } from 'react';

interface MatrixWizardProps {
  open: boolean;
  onClose: () => void;
  onInsert: (snippet: string) => void;
}

export function MatrixWizard({ open, onClose, onInsert }: MatrixWizardProps) {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [type, setType] = useState<'matrix' | 'pmatrix' | 'bmatrix' | 'vmatrix' | 'array'>('matrix');

  if (!open) return null;

  const envName = type === 'array' ? 'array' : `${type}`;
  const colSpec = type === 'array' ? `{${'c'.repeat(cols)}}` : '';

  const generate = () => {
    const lines: string[] = [];
    for (let r = 0; r < rows; r++) {
      const cells: string[] = [];
      for (let c = 0; c < cols; c++) {
        cells.push('  ');
      }
      const sep = r < rows - 1 ? ' \\\\' : '';
      lines.push(`  ${cells.join(' & ')}${sep}`);
    }
    const snippet = `\\begin{${envName}}${colSpec}\n${lines.join('\n')}\n\\end{${envName}}`;
    onInsert(snippet);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-5 w-72">
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Matrix Wizard</div>

        <div className="space-y-2 mb-4">
          <label className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            Rows
            <input
              type="number"
              value={rows}
              min={1}
              max={10}
              onChange={e => setRows(Number(e.target.value))}
              className="w-16 px-1.5 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-right"
            />
          </label>
          <label className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            Columns
            <input
              type="number"
              value={cols}
              min={1}
              max={10}
              onChange={e => setCols(Number(e.target.value))}
              className="w-16 px-1.5 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-right"
            />
          </label>
          <label className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            Type
            <select
              value={type}
              onChange={e => setType(e.target.value as typeof type)}
              className="w-24 px-1.5 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            >
              <option value="matrix">matrix</option>
              <option value="pmatrix">( )</option>
              <option value="bmatrix">[ ]</option>
              <option value="vmatrix">| |</option>
              <option value="array">array</option>
            </select>
          </label>
        </div>

        {/* Preview of dimensions */}
        <div className="mb-4 text-center text-xs font-mono text-gray-500 dark:text-gray-400">
          {rows} &times; {cols} {type}
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={generate}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}
