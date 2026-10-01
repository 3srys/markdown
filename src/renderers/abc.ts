let abcjsModule: any = null;

async function getAbcjs() {
  if (!abcjsModule) {
    abcjsModule = await import('abcjs');
  }
  return abcjsModule.default || abcjsModule;
}

export async function renderAbc(container: HTMLElement, isDark: boolean): Promise<void> {
  const blocks = container.querySelectorAll<HTMLElement>('.abc-container:not([data-rendered="true"])');
  if (blocks.length === 0) return;

  try {
    const abcjs = await getAbcjs();

    for (const block of blocks) {
      const rawEl = block.querySelector<HTMLElement>('.abc-raw');
      const code = (rawEl ? rawEl.textContent : null) || block.getAttribute('data-abc') || '';
      if (!code.trim()) continue;

      block.innerHTML = ''; // clear loader
      const renderDiv = document.createElement('div');
      renderDiv.className = 'abc-render-target';
      block.appendChild(renderDiv);

      try {
        abcjs.renderAbc(renderDiv, code.trim(), {
          responsive: 'resize',
          foregroundColor: isDark ? '#f8fafc' : '#0f172a',
        });
        block.dataset.rendered = 'true';
      } catch (err: any) {
        block.innerHTML = `
          <div class="render-error">
            <div class="render-error-title">Music Notation Error</div>
            <div class="render-error-message">${err?.message || 'Failed to render ABC notation'}</div>
          </div>
        `;
        block.dataset.rendered = 'true';
      }
    }
  } catch (err: any) {
    console.error('Failed to load abcjs:', err);
    blocks.forEach((block) => {
      block.innerHTML = `
        <div class="render-error">
          <div class="render-error-title">ABCJS Module Error</div>
          <div class="render-error-message">${err?.message || 'Failed to initialize music renderer'}</div>
        </div>
      `;
    });
  }
}
