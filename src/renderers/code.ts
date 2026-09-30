import type { HighlighterCore } from 'shiki';

let highlighterPromise: Promise<HighlighterCore> | null = null;

async function getHighlighterInstance(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const shiki = await import('shiki/bundle/web');
      return await shiki.createHighlighter({
        themes: ['github-light', 'github-dark'],
        langs: [
          'javascript',
          'typescript',
          'html',
          'css',
          'json',
          'markdown',
          'python',
          'bash',
          'sql',
          'yaml',
          'xml',
          'c',
          'cpp',
          'java',
        ],
      });
    })();
  }
  return highlighterPromise;
}

export async function renderCodeBlocks(container: HTMLElement, isDark: boolean): Promise<void> {
  const codeBlocks = container.querySelectorAll<HTMLElement>('.code-block-wrapper:not([data-rendered="true"])');
  if (codeBlocks.length === 0) return;

  // Add click handlers for copy buttons immediately
  codeBlocks.forEach((wrapper) => {
    const copyBtn = wrapper.querySelector<HTMLButtonElement>('.code-copy-btn');
    if (copyBtn && !copyBtn.dataset.bound) {
      copyBtn.dataset.bound = 'true';
      copyBtn.addEventListener('click', async () => {
        const rawCode = wrapper.getAttribute('data-code') || '';
        try {
          await navigator.clipboard.writeText(rawCode);
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
          }, 2000);
        } catch {
          copyBtn.textContent = 'Failed';
        }
      });
    }
  });

  try {
    const highlighter = await getHighlighterInstance();
    const shiki = await import('shiki/bundle/web');
    const themeName = isDark ? 'github-dark' : 'github-light';

    for (const wrapper of codeBlocks) {
      const lang = (wrapper.getAttribute('data-lang') || '').toLowerCase().trim();
      const code = wrapper.getAttribute('data-code') || '';

      if (!lang) {
        wrapper.dataset.rendered = 'true';
        continue;
      }

      const loadedLangs = highlighter.getLoadedLanguages();
      if (!loadedLangs.includes(lang)) {
        // Try to dynamically load if available in bundledLanguages
        if (shiki.bundledLanguages && shiki.bundledLanguages[lang as keyof typeof shiki.bundledLanguages]) {
          try {
            await highlighter.loadLanguage(lang as any);
          } catch {
            wrapper.dataset.rendered = 'true';
            continue;
          }
        } else {
          wrapper.dataset.rendered = 'true';
          continue;
        }
      }

      try {
        const highlightedHtml = highlighter.codeToHtml(code, {
          lang,
          theme: themeName,
        });

        // Replace pre in wrapper while keeping the copy button
        const oldPre = wrapper.querySelector('pre');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = highlightedHtml;
        const newPre = tempDiv.querySelector('pre');

        if (oldPre && newPre) {
          wrapper.replaceChild(newPre, oldPre);
        }
        wrapper.dataset.rendered = 'true';
      } catch (err) {
        console.warn(`Failed highlighting language "${lang}":`, err);
        wrapper.dataset.rendered = 'true';
      }
    }
  } catch (err) {
    console.error('Failed to initialize Shiki highlighter:', err);
  }
}

