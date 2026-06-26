import type { ExportConfig } from '../types';

interface ExportResult {
  svgString: string;
  width: number;
  height: number;
}

function computeBBox(el: SVGSVGElement): { x: number; y: number; w: number; h: number } {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.appendChild(el);
  document.body.appendChild(container);

  let bbox: DOMRect;
  try {
    bbox = el.getBBox();
  } catch {
    bbox = new DOMRect(0, 0, 0, 0);
  }

  document.body.removeChild(container);
  return { x: bbox.x, y: bbox.y, w: bbox.width, h: bbox.height };
}

export function prepareSVG(
  svgElement: SVGSVGElement,
  config: ExportConfig
): ExportResult {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  const { x, y, w, h } = computeBBox(clone);
  const origW = Math.max(1, Math.ceil(w));
  const origH = Math.max(1, Math.ceil(h));

  const scale = config.dpi / 96;
  const pad = config.padding;
  const finalW = Math.round((origW + pad * 2) * scale);
  const finalH = Math.round((origH + pad * 2) * scale);

  clone.setAttribute('width', `${finalW}`);
  clone.setAttribute('height', `${finalH}`);
  clone.setAttribute(
    'viewBox',
    `${x - pad} ${y - pad} ${origW + pad * 2} ${origH + pad * 2}`
  );
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  if (config.background && config.background !== 'transparent') {
    const xmlns = 'http://www.w3.org/2000/svg';
    const rect = document.createElementNS(xmlns, 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', config.background);
    rect.setAttribute('x', `${x - pad}`);
    rect.setAttribute('y', `${y - pad}`);
    clone.insertBefore(rect, clone.firstChild);
  }

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);

  return { svgString, width: finalW, height: finalH };
}

export function exportSVG(svgElement: SVGSVGElement, config: ExportConfig): void {
  const { svgString } = prepareSVG(svgElement, config);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'equation.svg';
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportPNG(svgElement: SVGSVGElement, config: ExportConfig): Promise<void> {
  const { svgString, width, height } = prepareSVG(svgElement, config);
  const blob = await renderToBlob(svgString, width, height, 'image/png');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'equation.png';
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportJPG(svgElement: SVGSVGElement, config: ExportConfig): Promise<void> {
  const bg = config.background && config.background !== 'transparent' ? config.background : '#FFFFFF';
  const merged = { ...config, background: bg };
  const { svgString, width, height } = prepareSVG(svgElement, merged);
  const blob = await renderToBlob(svgString, width, height, 'image/jpeg');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'equation.jpg';
  a.click();
  URL.revokeObjectURL(url);
}

function renderToBlob(svg: string, w: number, h: number, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('No canvas context'));

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Blob creation failed'));
      }, type, type === 'image/jpeg' ? 0.95 : undefined);
    };
    img.onerror = () => reject(new Error('Image render failed'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}
