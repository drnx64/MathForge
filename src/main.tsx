import { createRoot } from 'react-dom/client'
import './index.css'
import 'mathlive/fonts.css'
import 'mathlive/static.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

window.addEventListener('error', (e) => {
  console.error('[MathForge] Unhandled error:', e.error || e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('[MathForge] Unhandled promise rejection:', e.reason);
});

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)
