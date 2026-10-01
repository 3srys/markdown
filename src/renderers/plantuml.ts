import plantumlEncoder from 'plantuml-encoder';

export async function renderPlantUML(container: HTMLElement, isDark: boolean): Promise<void> {
  const blocks = container.querySelectorAll<HTMLElement>('.plantuml-container:not([data-rendered="true"])');
  if (blocks.length === 0) return;

  for (const block of blocks) {
    const rawEl = block.querySelector<HTMLElement>('.plantuml-raw');
    let code = (rawEl ? rawEl.textContent : null) || block.getAttribute('data-plantuml') || '';
    code = code.trim();
    if (!code) continue;

    try {
      // PlantUML supports theme definitions. We can prepend a theme if isDark is true.
      if (isDark && !code.includes('!theme')) {
        code = `!theme plain\nskinparam backgroundcolor transparent\nskinparam defaultFontColor white\nskinparam classFontColor white\nskinparam arrowColor white\nskinparam linecolor white\n` + code;
      }

      const encoded = plantumlEncoder.encode(code);
      const url = `https://www.plantuml.com/plantuml/svg/${encoded}`;
      
      const img = document.createElement('img');
      img.src = url;
      img.alt = "PlantUML Diagram";
      img.className = "diagram-img";
      
      block.innerHTML = '';
      block.appendChild(img);
      block.dataset.rendered = 'true';
    } catch (err: any) {
      block.innerHTML = `
        <div class="render-error">
          <div class="render-error-title">PlantUML Error</div>
          <div class="render-error-message">${err?.message || 'Failed to render PlantUML diagram'}</div>
        </div>
      `;
      block.dataset.rendered = 'true';
    }
  }
}
