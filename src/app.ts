import { MarkdownEditor } from './editor/editor';
import { calculateDocumentStats, parseMarkdown } from './markdown/parser';
import { renderCodeBlocks } from './renderers/code';
import { renderMathBlocks } from './renderers/math';
import { renderMermaidDiagrams } from './renderers/mermaid';
import { renderCharts } from './renderers/chart';
import { appState } from './state';
import { setupToolbar, initializeIcons } from './ui/toolbar';
import { isCurrentThemeDark, setupTheme } from './ui/theme';
import { setupLayout, toggleZenMode } from './ui/layout';
import { setupFileHandlers, exportMarkdownFile } from './files/files';

export class App {
  private editor!: MarkdownEditor;
  private previewEl!: HTMLElement;
  private statWords!: HTMLElement;
  private statChars!: HTMLElement;
  private statRead!: HTMLElement;
  private btnSyncScroll!: HTMLButtonElement;
  private renderTimer: number | null = null;
  private lastRenderedContent = '';

  public init(): void {
    const textarea = document.getElementById('editor') as HTMLTextAreaElement | null;
    const lineNumbers = document.getElementById('line-numbers') as HTMLElement | null;
    const previewContainer = document.getElementById('preview-container') as HTMLElement | null;
    const preview = document.getElementById('preview') as HTMLElement | null;

    if (!textarea || !lineNumbers || !previewContainer || !preview) {
      console.error('Core DOM elements missing');
      return;
    }

    this.previewEl = preview;
    this.statWords = document.getElementById('stat-words')!;
    this.statChars = document.getElementById('stat-chars')!;
    this.statRead = document.getElementById('stat-read')!;
    this.btnSyncScroll = document.getElementById('btn-sync-scroll') as HTMLButtonElement;

    // 1. Initialize Editor
    this.editor = new MarkdownEditor(
      textarea,
      lineNumbers,
      previewContainer,
      (content) => this.onContentChange(content),
      () => exportMarkdownFile(this.editor.getValue()),
      () => toggleZenMode()
    );

    // 2. Setup UI & Theme
    setupTheme(() => this.onThemeChanged());
    setupToolbar(this.editor);
    setupLayout();
    setupFileHandlers(this.editor, () => this.previewEl.innerHTML);
    this.setupSyncScrollButton();
    this.setupWordWrapButton();

    // 3. Initial Icons Render
    initializeIcons();

    // 4. Initial Render
    this.renderNow(appState.getState().content, true);
  }

  private onContentChange(content: string): void {
    appState.setContent(content);
    this.updateStats(content);

    // Debounce preview rendering for typing performance (100ms)
    if (this.renderTimer !== null) {
      window.clearTimeout(this.renderTimer);
    }
    this.renderTimer = window.setTimeout(() => {
      this.renderNow(content);
      this.renderTimer = null;
    }, 100);
  }

  private updateStats(content: string): void {
    const stats = calculateDocumentStats(content);
    if (this.statWords) this.statWords.textContent = stats.words.toLocaleString();
    if (this.statChars) this.statChars.textContent = stats.characters.toLocaleString();
    if (this.statRead) this.statRead.textContent = stats.readingTimeMinutes.toString();
  }

  private async renderNow(content: string, isInitial = false): Promise<void> {
    if (content === this.lastRenderedContent) return;
    this.lastRenderedContent = content;

    this.updateStats(content);

    // Fast synchronous Markdown-it + DOMPurify pipeline
    const html = parseMarkdown(content);

    // Cache already-rendered widgets from current preview to avoid flicker & re-computation
    const oldMermaids = new Map<string, HTMLElement>();
    this.previewEl.querySelectorAll<HTMLElement>('.mermaid-container[data-rendered="true"]').forEach((el) => {
      const code = el.getAttribute('data-mermaid');
      if (code && el.querySelector('svg')) {
        oldMermaids.set(code, el);
      }
    });

    const oldCharts = new Map<string, HTMLElement>();
    this.previewEl.querySelectorAll<HTMLElement>('.chart-container[data-rendered="true"]').forEach((el) => {
      const code = el.getAttribute('data-chart');
      if (code && el.querySelector('canvas')) {
        oldCharts.set(code, el);
      }
    });

    const oldMath = new Map<string, string>();
    this.previewEl.querySelectorAll<HTMLElement>('.math-block[data-rendered="true"], .math-inline[data-rendered="true"]').forEach((el) => {
      const formula = el.getAttribute('data-math');
      if (formula && el.querySelector('.katex')) {
        oldMath.set(formula, el.innerHTML);
      }
    });

    const oldCode = new Map<string, string>();
    this.previewEl.querySelectorAll<HTMLElement>('.code-block-wrapper[data-rendered="true"]').forEach((el) => {
      const code = el.getAttribute('data-code');
      const lang = el.getAttribute('data-lang') || '';
      const key = `${lang}:${code}`;
      if (code && el.querySelector('pre code span')) {
        oldCode.set(key, el.innerHTML);
      }
    });

    // Parse new content into a document fragment
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Re-attach cached widgets
    temp.querySelectorAll<HTMLElement>('.mermaid-container').forEach((el) => {
      const code = el.getAttribute('data-mermaid');
      if (code && oldMermaids.has(code)) {
        el.innerHTML = oldMermaids.get(code)!.innerHTML;
        el.dataset.rendered = 'true';
      }
    });

    temp.querySelectorAll<HTMLElement>('.chart-container').forEach((el) => {
      const code = el.getAttribute('data-chart');
      if (code && oldCharts.has(code)) {
        const oldEl = oldCharts.get(code)!;
        el.replaceWith(oldEl);
        oldEl.dataset.rendered = 'true';
      }
    });

    temp.querySelectorAll<HTMLElement>('.math-block, .math-inline').forEach((el) => {
      const formula = el.getAttribute('data-math');
      if (formula && oldMath.has(formula)) {
        el.innerHTML = oldMath.get(formula)!;
        el.dataset.rendered = 'true';
      }
    });

    temp.querySelectorAll<HTMLElement>('.code-block-wrapper').forEach((el) => {
      const code = el.getAttribute('data-code');
      const lang = el.getAttribute('data-lang') || '';
      const key = `${lang}:${code}`;
      if (code && oldCode.has(key)) {
        el.innerHTML = oldCode.get(key)!;
        el.dataset.rendered = 'true';
      }
    });

    // Swap DOM children cleanly
    this.previewEl.replaceChildren(...Array.from(temp.childNodes));

    // Detect special blocks
    const special = appState.detectSpecialBlocks();
    const isDark = isCurrentThemeDark();

    // Update status to show rendering
    this.setRenderStatus('rendering');

    // Run renderers in parallel for maximum speed on refresh / edit
    const runAsyncRenderers = async () => {
      try {
        await Promise.all([
          special.hasMath ? renderMathBlocks(this.previewEl) : Promise.resolve(),
          special.hasMermaid ? renderMermaidDiagrams(this.previewEl, isDark) : Promise.resolve(),
          special.hasChart ? renderCharts(this.previewEl, isDark) : Promise.resolve(),
          special.hasCode ? renderCodeBlocks(this.previewEl, isDark) : Promise.resolve(),
        ]);
      } finally {
        this.setRenderStatus('ready');
      }
    };

    if (isInitial) {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => runAsyncRenderers(), { timeout: 1200 });
      } else {
        setTimeout(runAsyncRenderers, 100);
      }
    } else {
      await runAsyncRenderers();
    }
  }

  private async onThemeChanged(): Promise<void> {
    // Clear data-rendered on theme-dependent blocks so they adapt to light/dark
    this.previewEl.querySelectorAll<HTMLElement>('.mermaid-container, .chart-container, .code-block-wrapper').forEach((el) => {
      delete el.dataset.rendered;
    });

    const special = appState.detectSpecialBlocks();
    const isDark = isCurrentThemeDark();

    // Re-render theme-dependent elements in parallel
    await Promise.all([
      special.hasMermaid ? renderMermaidDiagrams(this.previewEl, isDark) : Promise.resolve(),
      special.hasChart ? renderCharts(this.previewEl, isDark) : Promise.resolve(),
      special.hasCode ? renderCodeBlocks(this.previewEl, isDark) : Promise.resolve(),
    ]);
  }

  private setRenderStatus(status: 'rendering' | 'ready'): void {
    const badge = document.querySelector('.status-badge');
    if (!badge) return;
    if (status === 'rendering') {
      badge.className = 'status-badge status-rendering';
      badge.innerHTML = `<span class="spinner-dot"></span> Rendering`;
    } else {
      badge.className = 'status-badge live-pulse';
      badge.innerHTML = `<span class="pulse-dot"></span> Local`;
    }
  }

  private setupSyncScrollButton(): void {
    if (!this.btnSyncScroll) return;

    const updateLabel = (enabled: boolean) => {
      this.btnSyncScroll.innerHTML = `<span class="sync-dot"></span> Sync Scroll: ${enabled ? 'On' : 'Off'}`;
      this.btnSyncScroll.setAttribute('aria-pressed', enabled.toString());
      this.btnSyncScroll.classList.toggle('active', enabled);
    };

    updateLabel(appState.getState().syncScroll);

    this.btnSyncScroll.addEventListener('click', (e) => {
      e.preventDefault();
      const current = appState.getState().syncScroll;
      const next = !current;
      appState.setSyncScroll(next);
      updateLabel(next);
    });
  }

  private setupWordWrapButton(): void {
    const btnWrap = document.getElementById('btn-wrap') as HTMLButtonElement | null;
    if (!btnWrap) return;

    btnWrap.addEventListener('click', (e) => {
      e.preventDefault();
      const enabled = this.editor.toggleWordWrap();
      btnWrap.textContent = `Wrap: ${enabled ? 'On' : 'Off'}`;
      btnWrap.setAttribute('aria-pressed', enabled.toString());
      btnWrap.classList.toggle('active', enabled);
    });
  }
}

