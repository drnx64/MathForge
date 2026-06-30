import 'react';

declare global {
  interface MathJaxStartup {
    readyPromise: Promise<void>;
    pageReady?: () => Promise<void>;
  }

  interface MathJaxConfig {
    options?: Record<string, unknown>;
    startup?: Partial<MathJaxStartup>;
    tex?: Record<string, unknown>;
    svg?: Record<string, unknown>;
    loader?: Record<string, unknown>;
  }

  interface MathJaxObject {
    tex2svg(tex: string, options?: { display?: boolean; em?: number; ex?: number; containerWidth?: number }): SVGSVGElement;
    tex2svgPromise(tex: string, options?: { display?: boolean; em?: number; ex?: number; containerWidth?: number }): Promise<SVGSVGElement>;
    startup: MathJaxStartup;
  }

  interface Window {
    MathJax: MathJaxObject;
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': any;
    }
  }
}
