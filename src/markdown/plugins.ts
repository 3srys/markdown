import MarkdownIt from 'markdown-it';
// @ts-expect-error markdown-it plugin types
import footnotePlugin from 'markdown-it-footnote';
// @ts-expect-error markdown-it plugin types
import subPlugin from 'markdown-it-sub';
// @ts-expect-error markdown-it plugin types
import supPlugin from 'markdown-it-sup';
// @ts-expect-error markdown-it plugin types
import taskListsPlugin from 'markdown-it-task-lists';

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function stripFrontMatter(markdown: string): string {
  return markdown.replace(/^---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/, '');
}

const CALLOUT_ICONS: Record<string, string> = {
  note: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
  tip: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`,
  warning: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  important: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
  caution: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
};

export function setupPlugins(md: MarkdownIt): void {
  // GFM / Common extended plugins
  md.use(footnotePlugin);
  md.use(subPlugin);
  md.use(supPlugin);
  md.use(taskListsPlugin, { enabled: true });

  // GitHub-style Callouts: > [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT], > [!CAUTION]
  md.core.ruler.after('block', 'callouts', (state) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === 'blockquote_open') {
        const pOpen = tokens[i + 1];
        const inline = tokens[i + 2];
        if (pOpen && pOpen.type === 'paragraph_open' && inline && inline.type === 'inline') {
          const match = inline.content.match(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\](?:\s*\n?([\s\S]*))?/i);
          if (match) {
            const type = match[1].toLowerCase();
            tokens[i].tag = 'div';
            tokens[i].attrSet('class', `callout callout-${type}`);

            // Find matching blockquote_close
            let depth = 1;
            for (let j = i + 1; j < tokens.length; j++) {
              if (tokens[j].type === 'blockquote_open') depth++;
              else if (tokens[j].type === 'blockquote_close') {
                depth--;
                if (depth === 0) {
                  tokens[j].tag = 'div';
                  break;
                }
              }
            }

            // Remove the [!TYPE] marker from the inline content
            const rest = match[2] || '';
            inline.content = rest.trim();
            if (inline.children && inline.children.length > 0) {
              const firstChild = inline.children[0];
              if (firstChild.type === 'text') {
                firstChild.content = firstChild.content.replace(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*/i, '');
              }
            }

            // Insert callout title
            const iconSvg = CALLOUT_ICONS[type] || CALLOUT_ICONS.note;
            const titleToken = new state.Token('html_block', '', 0);
            titleToken.content = `<div class="callout-title">${iconSvg}<span>${type.toUpperCase()}</span></div>`;
            tokens.splice(i + 1, 0, titleToken);
            i++;
          }
        }
      }
    }
  });

  // Source line mapping for pixel-perfect synchronized scrolling
  md.core.ruler.push('source_lines', (state) => {
    for (const token of state.tokens) {
      if (token.map && (token.type.endsWith('_open') || token.type === 'hr')) {
        token.attrSet('data-line-start', String(token.map[0] + 1));
        token.attrSet('data-line-end', String(token.map[1]));
      }
    }
  });

  // Inline Math: $...$
  md.inline.ruler.before('escape', 'math_inline', (state, silent) => {
    if (state.src.charCodeAt(state.pos) !== 0x24 /* $ */) return false;
    if (state.src.charCodeAt(state.pos + 1) === 0x24) return false; // ignore $$
    // Don't match if preceded by a digit (like $10) or space right after $
    if (state.pos > 0 && /\d/.test(state.src[state.pos - 1])) return false;
    if (state.src[state.pos + 1] === ' ' || state.src[state.pos + 1] === '\t') return false;

    const match = state.src.slice(state.pos).match(/^\$([^\$\n\r]+?)\$/);
    if (!match) return false;
    if (!silent) {
      const token = state.push('math_inline', 'span', 0);
      token.content = match[1];
    }
    state.pos += match[0].length;
    return true;
  });

  // Block Math: $$ ... $$
  md.block.ruler.before('fence', 'math_block', (state, startLine, endLine, silent) => {
    const startPos = state.bMarks[startLine] + state.tShift[startLine];
    const maxPos = state.eMarks[startLine];
    const lineText = state.src.slice(startPos, maxPos).trim();

    // Check single-line $$ formula $$
    const singleLineMatch = lineText.match(/^\$\$([\s\S]+?)\$\$$/);
    if (singleLineMatch) {
      if (silent) return true;
      const token = state.push('math_block', 'div', 0);
      token.block = true;
      token.content = singleLineMatch[1].trim();
      token.map = [startLine, startLine + 1];
      state.line = startLine + 1;
      return true;
    }

    if (lineText !== '$$') return false;

    let nextLine = startLine + 1;
    let found = false;
    while (nextLine < endLine) {
      const p = state.bMarks[nextLine] + state.tShift[nextLine];
      const m = state.eMarks[nextLine];
      if (state.src.slice(p, m).trim() === '$$') {
        found = true;
        break;
      }
      nextLine++;
    }

    if (!found) return false;
    if (silent) return true;

    const content = state.getLines(startLine + 1, nextLine, state.tShift[startLine], false);
    const token = state.push('math_block', 'div', 0);
    token.block = true;
    token.content = content.trim();
    token.map = [startLine, nextLine + 1];
    state.line = nextLine + 1;
    return true;
  });

  // Renderer for math inline
  md.renderer.rules.math_inline = (tokens, idx) => {
    return `<span class="math-inline" data-math="${escapeHtml(tokens[idx].content)}"><span class="math-raw" style="display:none;">${escapeHtml(tokens[idx].content)}</span></span>`;
  };

  // Renderer for math block with loading state
  md.renderer.rules.math_block = (tokens, idx) => {
    const token = tokens[idx];
    const lineStart = token.map ? token.map[0] + 1 : '';
    const lineEnd = token.map ? token.map[1] : '';
    const lineAttrs = lineStart ? ` data-line-start="${lineStart}" data-line-end="${lineEnd}"` : '';
    return `<div class="math-block"${lineAttrs} data-math="${escapeHtml(token.content)}"><span class="math-raw" style="display:none;">${escapeHtml(token.content)}</span><div class="math-loading"><span class="loader-spinner-sm"></span><span class="math-preview-text">$$ ${escapeHtml(token.content)} $$</span></div></div>`;
  };

  // Fenced blocks renderer: mermaid, chart, math, katex, or code blocks
  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    const info = token.info ? token.info.trim() : '';
    const content = token.content;
    const lineStart = token.map ? token.map[0] + 1 : '';
    const lineEnd = token.map ? token.map[1] : '';
    const lineAttrs = lineStart ? ` data-line-start="${lineStart}" data-line-end="${lineEnd}"` : '';

    if (info === 'mermaid') {
      return `<div class="mermaid-container"${lineAttrs} data-mermaid="${escapeHtml(content)}"><pre class="mermaid-raw" style="display:none;">${escapeHtml(content)}</pre><div class="block-loader mermaid-loading"><span class="loader-spinner"></span><span>Rendering Diagram...</span></div></div>`;
    }

    if (info === 'chart') {
      return `<div class="chart-container"${lineAttrs} data-chart="${escapeHtml(content)}"><pre class="chart-raw" style="display:none;">${escapeHtml(content)}</pre><div class="block-loader chart-loading"><span class="loader-spinner"></span><span>Rendering Chart...</span></div><canvas style="display:none;"></canvas></div>`;
    }

    if (info === 'math' || info === 'katex') {
      return `<div class="math-block"${lineAttrs} data-math="${escapeHtml(content)}"><span class="math-raw" style="display:none;">${escapeHtml(content)}</span><div class="math-loading"><span class="loader-spinner-sm"></span><span class="math-preview-text">$$ ${escapeHtml(content)} $$</span></div></div>`;
    }

    const langClass = info ? `language-${escapeHtml(info)}` : '';
    return `<div class="code-block-wrapper"${lineAttrs} data-code="${escapeHtml(content)}" data-lang="${escapeHtml(info)}"><button class="code-copy-btn" title="Copy code" aria-label="Copy code">Copy</button><pre><code class="${langClass}">${escapeHtml(content)}</code></pre></div>`;
  };
}

