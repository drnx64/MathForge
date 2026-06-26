interface StatusBarProps {
  message: string;
  type: 'info' | 'error' | 'success';
  compileTimeMs?: number;
}

export function StatusBar({ message, type, compileTimeMs }: StatusBarProps) {
  const colors = {
    info: 'text-gray-500 dark:text-gray-400',
    error: 'text-red-600 dark:text-red-400',
    success: 'text-emerald-600 dark:text-emerald-400',
  };

  return (
    <div className="flex items-center px-3 py-0.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0">
      <span className={`text-[11px] font-mono ${colors[type]}`}>
        {message}
        {compileTimeMs !== undefined && (
          <span className="text-gray-400 ml-2">({compileTimeMs}ms)</span>
        )}
      </span>
    </div>
  );
}
