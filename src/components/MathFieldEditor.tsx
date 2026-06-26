import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import 'mathlive';
import type MathfieldElement from 'mathlive';

export interface MathFieldHandle {
  insert(latex: string): void;
  focus(): void;
  getLatex(): string;
}

interface Props {
  value: string;
  onChange: (latex: string) => void;
  className?: string;
  fontSize?: number;
}

export const MathFieldEditor = forwardRef<MathFieldHandle, Props>(
  ({ value, onChange, className, fontSize = 24 }, ref) => {
    const elRef = useRef<MathfieldElement | null>(null);
    const onChangeRef = useRef(onChange);
    const valueRef = useRef(value);

    onChangeRef.current = onChange;
    valueRef.current = value;

    useImperativeHandle(ref, () => ({
      insert(latex: string) {
        elRef.current?.insert(latex);
        elRef.current?.focus();
      },
      focus() {
        elRef.current?.focus();
      },
      getLatex() {
        return elRef.current?.getValue('latex') || '';
      },
    }));

    const setRef = useCallback((node: HTMLElement | null) => {
      if (!node) { elRef.current = null; return; }
      const mf = node as unknown as MathfieldElement;
      elRef.current = mf;

      const handler = () => {
        const latex = mf.getValue('latex');
        valueRef.current = latex;
        onChangeRef.current(latex);
      };

      mf.addEventListener('input', handler);

      if (valueRef.current && mf.value !== valueRef.current) {
        mf.value = valueRef.current;
      }
    }, []);

    useEffect(() => {
      const mf = elRef.current;
      if (!mf) return;
      const current = mf.getValue('latex');
      if (value !== current) {
        mf.value = value;
      }
    }, [value]);

    return (
      <math-field
        ref={setRef}
        class={className}
        style={{
          fontSize: `${fontSize}px`,
          '--mathfield-placeholder-color': '#9ca3af',
        } as React.CSSProperties}
        placeholder="Type LaTeX..."
        virtual-keyboard-policy="manual"
        smart-fence
        smart-mode
      />
    );
  },
);
