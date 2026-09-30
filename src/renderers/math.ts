let katexModule: typeof import('katex') | null = null;
let katexCssLoaded = false;

async function getKatex() {
  if (!katexModule) {
    katexModule = await import('katex');
  }
  if (!katexCssLoaded) {
    try {
      // @ts-expect-error vite supports css import
      await import('katex/dist/katex.min.css');
      katexCssLoaded = true;
    } catch {
      // CSS may already be included or loaded
    }
  }
  return katexModule.default || katexModule;
}

export async function renderMathBlocks(container: HTMLElement): Promise<void> {
  const inlineMath = container.querySelectorAll<HTMLElement>('.math-inline:not([data-rendered="true"])');
  const blockMath = container.querySelectorAll<HTMLElement>('.math-block:not([data-rendered="true"])');

  if (inlineMath.length === 0 && blockMath.length === 0) return;

  try {
    const katex = await getKatex();

    inlineMath.forEach((el) => {
      const rawEl = el.querySelector<HTMLElement>('.math-raw');
      const formula = (rawEl ? rawEl.textContent : null) || el.getAttribute('data-math') || '';
      try {
        el.innerHTML = katex.renderToString(formula, {
          displayMode: false,
          throwOnError: true,
        });
        el.dataset.rendered = 'true';
      } catch (err: any) {
        el.innerHTML = `<span class="render-error-inline" style="color: var(--callout-caution); font-size: 12px; font-family: var(--font-mono);" title="${err.message}">[Math Error]</span>`;
        el.dataset.rendered = 'true';
      }
    });

    blockMath.forEach((el) => {
      const rawEl = el.querySelector<HTMLElement>('.math-raw');
      const formula = (rawEl ? rawEl.textContent : null) || el.getAttribute('data-math') || '';
      try {
        el.innerHTML = katex.renderToString(formula, {
          displayMode: true,
          throwOnError: true,
        });
        el.dataset.rendered = 'true';
      } catch (err: any) {
        el.innerHTML = `
          <div class="render-error">
            <div class="render-error-title">KaTeX Math Error</div>
            <div class="render-error-message">${err.message || 'Syntax error in mathematical formula'}</div>
          </div>
        `;
        el.dataset.rendered = 'true';
      }
    });
  } catch (err: any) {
    console.error('Failed to load KaTeX renderer:', err);
    inlineMath.forEach((el) => {
      el.innerHTML = `<span class="render-error-inline" style="color: var(--callout-caution); font-size: 12px; font-family: var(--font-mono);">[Math Error]</span>`;
      el.dataset.rendered = 'true';
    });
    blockMath.forEach((el) => {
      el.innerHTML = `
        <div class="render-error">
          <div class="render-error-title">KaTeX Module Error</div>
          <div class="render-error-message">${err?.message || 'Failed to load KaTeX module'}</div>
        </div>
      `;
      el.dataset.rendered = 'true';
    });
  }
}

