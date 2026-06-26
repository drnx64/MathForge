import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  info: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, info: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, info: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ info });
    console.error('MathForge crash:', error);
    console.error('Component stack:', info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const e = this.state.error;
      const stack = e?.stack || 'No stack trace available';
      const componentStack = this.state.info?.componentStack || 'No component stack';

      return (
        <div className="h-screen flex items-start justify-center bg-gray-50 p-8 overflow-auto">
          <div className="max-w-2xl w-full">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
              <div className="text-lg font-semibold text-red-700 mb-1">Application Error</div>
              <div className="text-sm text-red-600 font-mono">{e?.message || 'Unknown error'}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Stack Trace
              </div>
              <pre className="p-4 text-xs font-mono text-gray-800 overflow-auto max-h-60 leading-relaxed">
                {stack}
              </pre>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Component Stack
              </div>
              <pre className="p-4 text-xs font-mono text-gray-800 overflow-auto max-h-40 leading-relaxed">
                {componentStack}
              </pre>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="text-sm font-medium text-amber-800 mb-1">How to fix</div>
              <ol className="text-xs text-amber-700 list-decimal list-inside space-y-1">
                <li>Check the browser console (F12) for full error details</li>
                <li>Verify MathJax script loaded correctly (check Network tab for <code className="bg-amber-100 px-1 rounded">/mathjax/tex-svg-full.js</code>)</li>
                <li>Clear browser cache and reload</li>
                <li>If using a local build, run <code className="bg-amber-100 px-1 rounded">npm run build</code> first</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Reload Application
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, info: null });
                }}
                className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 border border-gray-300 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
