import { showAlert } from './dialog';

export function setupDiagramToolbars(previewEl: HTMLElement) {
  const diagrams = previewEl.querySelectorAll('.diagram-container:not(.has-toolbar)');
  
  diagrams.forEach(container => {
    container.classList.add('has-toolbar');
    
    const toolbar = document.createElement('div');
    toolbar.className = 'diagram-toolbar';
    toolbar.innerHTML = `
      <button class="btn-tool btn-copy" title="Copy Diagram Code" aria-label="Copy Code">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        Copy
      </button>
      <button class="btn-tool btn-png" title="Download as PNG" aria-label="Download PNG">PNG</button>
      <button class="btn-tool btn-svg" title="Download as SVG" aria-label="Download SVG">SVG</button>
    `;
    
    const copyBtn = toolbar.querySelector('.btn-copy');
    copyBtn?.addEventListener('click', () => {
      const rawText = (container.querySelector('pre') as HTMLElement)?.textContent || '';
      navigator.clipboard.writeText(rawText);
      const span = copyBtn.lastChild as Text;
      if (span) span.textContent = ' Copied!';
      setTimeout(() => { if (span) span.textContent = ' Copy'; }, 2000);
    });

    // Note: Full PNG/SVG download implementation would require canvas conversion and svg serialization.
    // Stubbed out for now as per immediate feature parity visuals.
    const pngBtn = toolbar.querySelector('.btn-png');
    pngBtn?.addEventListener('click', () => {
      showAlert('PNG export coming soon! Use the SVG option for now.', 'PNG Export');
    });

    const svgBtn = toolbar.querySelector('.btn-svg');
    svgBtn?.addEventListener('click', () => {
      showAlert('SVG export coming soon!', 'SVG Export');
    });

    container.appendChild(toolbar);
  });
}
