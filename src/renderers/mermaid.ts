let mermaidModule: typeof import('mermaid') | null = null;
let currentTheme: string | null = null;
let diagramCounter = 0;

async function getMermaid(isDark: boolean) {
  if (!mermaidModule) {
    mermaidModule = await import('mermaid');
  }
  const mermaid = mermaidModule.default || mermaidModule;
  const themeKey = isDark ? 'dark' : 'neutral';

  if (themeKey !== currentTheme) {
    currentTheme = themeKey;
    mermaid.initialize({
      startOnLoad: false,
      theme: themeKey as any,
      themeVariables: isDark
        ? {
            darkMode: true,
            background: '#1e293b',
            primaryColor: '#1e293b',
            primaryTextColor: '#f8fafc',
            primaryBorderColor: '#38bdf8',
            lineColor: '#94a3b8',
            secondaryColor: '#334155',
            tertiaryColor: '#0f172a',
          }
        : {
            darkMode: false,
            background: '#ffffff',
            primaryColor: '#f0f9ff',
            primaryTextColor: '#0f172a',
            primaryBorderColor: '#0284c7',
            lineColor: '#475569',
            secondaryColor: '#f8fafc',
            tertiaryColor: '#ffffff',
          },
      securityLevel: 'loose', // Content is already strictly sanitized via DOMPurify
      fontFamily: 'inherit',
    });
  }

  return mermaid;
}

export async function renderMermaidDiagrams(container: HTMLElement, isDark: boolean): Promise<void> {
  const mermaidBlocks = container.querySelectorAll<HTMLElement>('.mermaid-container:not([data-rendered="true"])');
  if (mermaidBlocks.length === 0) return;

  try {
    const mermaid = await getMermaid(isDark);

    for (const block of mermaidBlocks) {
      const rawEl = block.querySelector<HTMLElement>('.mermaid-raw');
      const code = (rawEl ? rawEl.textContent : null) || block.getAttribute('data-mermaid') || '';
      if (!code.trim()) continue;

      const id = 'mermaid_' + Math.random().toString(36).substring(2, 9) + '_' + (diagramCounter++);

      try {
        // First validate syntax with parse
        await mermaid.parse(code.trim());

        // Race render with timeout to prevent hanging on malformed diagrams
        const renderPromise = mermaid.render(id, code.trim());
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Mermaid rendering timed out')), 3500)
        );

        const { svg } = await Promise.race([renderPromise, timeoutPromise]);
        block.innerHTML = svg;
        block.dataset.rendered = 'true';
      } catch (err: any) {
        // Clean up temporary DOM elements mermaid may create on error
        const tempEl = document.getElementById(id) || document.getElementById(`d${id}`);
        if (tempEl && tempEl.parentNode) {
          tempEl.parentNode.removeChild(tempEl);
        }

        block.innerHTML = `
          <div class="render-error">
            <div class="render-error-title">Mermaid Diagram Error</div>
            <div class="render-error-message">${err?.message || err?.str || 'Invalid Mermaid diagram syntax'}</div>
          </div>
        `;
        block.dataset.rendered = 'true';
      }
    }
  } catch (err: any) {
    console.error('Failed to load Mermaid module:', err);
    mermaidBlocks.forEach((block) => {
      block.innerHTML = `
        <div class="render-error">
          <div class="render-error-title">Mermaid Module Error</div>
          <div class="render-error-message">${err?.message || 'Failed to initialize Mermaid module'}</div>
        </div>
      `;
    });
  }
}
