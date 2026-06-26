import { useEffect, useState, useCallback, useRef } from 'react';

interface MathJaxState {
  loaded: boolean;
  error: string | null;
  render: (tex: string) => Promise<string>;
}

const MATHJAX_URL = '/mathjax/tex-svg-full.js';

export function useMathJax(): MathJaxState {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const renderCnt = useRef(0);

  useEffect(() => {
    try {
      if (typeof window.MathJax?.tex2svg === 'function') {
        setLoaded(true);
        return;
      }

      (window as unknown as Record<string, unknown>).MathJax = {
        options: {
          ignoreHtmlClass: '.*',
          processHtmlClass: 'none',
        },
        startup: {
          pageReady: () => Promise.resolve(),
        },
        tex: {
          packages: { '[+]': ['ams'] },
          processEscapes: false,
          processEnvironments: false,
          processRefs: false,
        },
        svg: {
          fontCache: 'none',
          assistiveMml: 'none',
        },
      };

      const script = document.createElement('script');
      script.src = MATHJAX_URL;
      script.async = true;

      script.onload = () => {
        const check = () => {
          if (typeof window.MathJax?.tex2svg === 'function') {
            setLoaded(true);
          } else {
            setTimeout(check, 50);
          }
        };
        setTimeout(check, 100);
      };

      script.onerror = () => setError('Failed to load MathJax script');
      document.head.appendChild(script);

      return () => {
        if (script.parentNode) script.parentNode.removeChild(script);
      };
    } catch (e) {
      setError(`Setup error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);

  const render = useCallback(async (tex: string): Promise<string> => {
    if (!window.MathJax) throw new Error('MathJax not loaded');
    if (typeof window.MathJax.tex2svg !== 'function') {
      throw new Error('MathJax.tex2svg unavailable');
    }

    const id = ++renderCnt.current;

    // tex2svg returns an mjx-container with <svg> + optional <mjx-assistive-mml>
    const container = window.MathJax.tex2svg(tex, { display: true, em: 16, ex: 8 });
    if (id !== renderCnt.current) return '';
    if (!container || !container.querySelector) return '';

    // Extract only the SVG element, strip assistive MathML
    const svgEl = container.querySelector('svg');
    if (!svgEl) {
      const html = container.innerHTML;
      return html;
    }

    const wrapper = document.createElement('div');
    wrapper.appendChild(svgEl.cloneNode(true));
    const html = wrapper.innerHTML;
    wrapper.remove();

    return html;
  }, []);

  return { loaded, error, render };
}
