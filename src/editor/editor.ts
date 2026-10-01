import { setupKeyboardShortcuts } from './shortcuts';
import { appState } from '../state';

export class MarkdownEditor {
  private textarea: HTMLTextAreaElement;
  private lineNumbers: HTMLElement;
  private previewContainer: HTMLElement;
  private isSyncingScroll = false;

  constructor(
    textarea: HTMLTextAreaElement,
    lineNumbers: HTMLElement,
    previewContainer: HTMLElement,
    onContentChange: (content: string) => void,
    onExport: () => void,
    onZenToggle: () => void
  ) {
    this.textarea = textarea;
    this.lineNumbers = lineNumbers;
    this.previewContainer = previewContainer;

    this.init(onContentChange, onExport, onZenToggle);
  }

  private init(
    onContentChange: (content: string) => void,
    onExport: () => void,
    onZenToggle: () => void
  ): void {
    // Initial content
    this.textarea.value = appState.getState().content;
    this.updateLineNumbers();
    this.updateCursorStats();

    // Input listener
    this.textarea.addEventListener('input', () => {
      this.updateLineNumbers();
      this.updateCursorStats();
      onContentChange(this.textarea.value);
    });

    // Cursor position listeners
    this.textarea.addEventListener('keyup', () => this.updateCursorStats());
    this.textarea.addEventListener('click', () => this.updateCursorStats());
    this.textarea.addEventListener('select', () => this.updateCursorStats());

    // Synchronize line numbers scroll with textarea
    this.textarea.addEventListener('scroll', () => {
      this.lineNumbers.scrollTop = this.textarea.scrollTop;
      this.syncEditorToPreview();
    });

    // Synchronize preview scroll to editor
    this.previewContainer.addEventListener('scroll', () => {
      this.syncPreviewToEditor();
    });

    // Setup shortcuts
    setupKeyboardShortcuts(this.textarea, {
      applyFormat: (format) => this.applyFormat(format),
      exportMarkdown: onExport,
      toggleZenMode: onZenToggle,
      indent: () => this.indent(),
      outdent: () => this.outdent(),
    });
  }

  public setValue(content: string): void {
    this.textarea.value = content;
    this.updateLineNumbers();
    this.updateCursorStats();
  }

  public getValue(): string {
    return this.textarea.value;
  }

  public focus(): void {
    this.textarea.focus();
  }

  public updateLineNumbers(): void {
    const lineCount = this.textarea.value.split('\n').length;
    const lines = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');
    this.lineNumbers.textContent = lines;
  }

  public updateCursorStats(): void {
    const start = this.textarea.selectionStart || 0;
    const textBefore = this.textarea.value.substring(0, start);
    const lines = textBefore.split('\n');
    const lineNum = lines.length;
    const colNum = lines[lines.length - 1].length + 1;

    const elLn = document.getElementById('stat-ln');
    const elCol = document.getElementById('stat-col');
    if (elLn) elLn.textContent = String(lineNum);
    if (elCol) elCol.textContent = String(colNum);
  }

  public toggleWordWrap(): boolean {
    const container = this.textarea.closest('.editor-container');
    if (!container) return true;
    const isNowrap = container.classList.toggle('nowrap');
    return !isNowrap;
  }

  private syncEditorToPreview(): void {
    if (!appState.getState().syncScroll || this.isSyncingScroll) return;

    this.isSyncingScroll = true;
    requestAnimationFrame(() => {
      const editorMax = this.textarea.scrollHeight - this.textarea.clientHeight;
      const previewMax = this.previewContainer.scrollHeight - this.previewContainer.clientHeight;

      if (editorMax <= 0 || previewMax <= 0) {
        this.isSyncingScroll = false;
        return;
      }

      if (this.textarea.scrollTop <= 5) {
        this.previewContainer.scrollTop = 0;
        this.isSyncingScroll = false;
        return;
      }

      if (this.textarea.scrollTop >= editorMax - 5) {
        this.previewContainer.scrollTop = previewMax;
        this.isSyncingScroll = false;
        return;
      }

      // Line-based mapping
      const lines = this.textarea.value.split('\n');
      const lineHeight = this.textarea.scrollHeight / Math.max(1, lines.length);
      const currentLine = Math.min(lines.length, Math.max(1, Math.floor(this.textarea.scrollTop / lineHeight) + 1));

      const elements = Array.from(this.previewContainer.querySelectorAll<HTMLElement>('[data-line-start]'));
      if (elements.length === 0) {
        const percentage = this.textarea.scrollTop / editorMax;
        this.previewContainer.scrollTop = percentage * previewMax;
      } else {
        let prevEl: HTMLElement | null = null;
        let nextEl: HTMLElement | null = null;
        let prevLine = 1;
        let nextLine = lines.length;

        for (const el of elements) {
          const l = parseInt(el.getAttribute('data-line-start') || '0', 10);
          if (l <= currentLine) {
            prevEl = el;
            prevLine = l;
          } else {
            nextEl = el;
            nextLine = l;
            break;
          }
        }

        const previewTopOffset = this.previewContainer.getBoundingClientRect().top;
        if (prevEl && nextEl && nextLine > prevLine) {
          const ratio = (currentLine - prevLine) / (nextLine - prevLine);
          const prevTop = prevEl.getBoundingClientRect().top - previewTopOffset + this.previewContainer.scrollTop;
          const nextTop = nextEl.getBoundingClientRect().top - previewTopOffset + this.previewContainer.scrollTop;
          this.previewContainer.scrollTop = prevTop + ratio * (nextTop - prevTop);
        } else if (prevEl) {
          const prevTop = prevEl.getBoundingClientRect().top - previewTopOffset + this.previewContainer.scrollTop;
          this.previewContainer.scrollTop = prevTop;
        } else {
          const percentage = this.textarea.scrollTop / editorMax;
          this.previewContainer.scrollTop = percentage * previewMax;
        }
      }

      setTimeout(() => {
        this.isSyncingScroll = false;
      }, 50);
    });
  }

  private syncPreviewToEditor(): void {
    if (!appState.getState().syncScroll || this.isSyncingScroll) return;

    this.isSyncingScroll = true;
    requestAnimationFrame(() => {
      const editorMax = this.textarea.scrollHeight - this.textarea.clientHeight;
      const previewMax = this.previewContainer.scrollHeight - this.previewContainer.clientHeight;

      if (editorMax <= 0 || previewMax <= 0) {
        this.isSyncingScroll = false;
        return;
      }

      if (this.previewContainer.scrollTop <= 5) {
        this.textarea.scrollTop = 0;
        this.lineNumbers.scrollTop = 0;
        this.isSyncingScroll = false;
        return;
      }

      if (this.previewContainer.scrollTop >= previewMax - 5) {
        this.textarea.scrollTop = editorMax;
        this.lineNumbers.scrollTop = editorMax;
        this.isSyncingScroll = false;
        return;
      }

      const elements = Array.from(this.previewContainer.querySelectorAll<HTMLElement>('[data-line-start]'));
      if (elements.length === 0) {
        const percentage = this.previewContainer.scrollTop / previewMax;
        this.textarea.scrollTop = percentage * editorMax;
        this.lineNumbers.scrollTop = this.textarea.scrollTop;
      } else {
        const previewTopOffset = this.previewContainer.getBoundingClientRect().top;
        let matchedLine = 1;
        for (const el of elements) {
          const elTop = el.getBoundingClientRect().top - previewTopOffset;
          if (elTop <= 25) {
            matchedLine = parseInt(el.getAttribute('data-line-start') || '1', 10);
          } else {
            break;
          }
        }

        const lines = this.textarea.value.split('\n');
        const lineHeight = this.textarea.scrollHeight / Math.max(1, lines.length);
        this.textarea.scrollTop = Math.max(0, (matchedLine - 1) * lineHeight);
        this.lineNumbers.scrollTop = this.textarea.scrollTop;
      }

      setTimeout(() => {
        this.isSyncingScroll = false;
      }, 50);
    });
  }

  public indent(): void {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const value = this.textarea.value;

    if (start === end) {
      // Insert 2 spaces at cursor
      this.replaceText(start, end, '  ', start + 2);
    } else {
      // Indent multiple lines
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = value.indexOf('\n', end);
      const effectiveEnd = lineEnd === -1 ? value.length : lineEnd;

      const selectedLines = value.substring(lineStart, effectiveEnd).split('\n');
      const indented = selectedLines.map((line) => '  ' + line).join('\n');

      this.replaceText(lineStart, effectiveEnd, indented, start + 2, end + (indented.length - (effectiveEnd - lineStart)));
    }
  }

  public outdent(): void {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const value = this.textarea.value;

    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', end);
    const effectiveEnd = lineEnd === -1 ? value.length : lineEnd;

    const selectedLines = value.substring(lineStart, effectiveEnd).split('\n');
    let removedCharsFirstLine = 0;
    let totalRemoved = 0;

    const outdented = selectedLines
      .map((line, idx) => {
        let removed = 0;
        if (line.startsWith('  ')) {
          removed = 2;
        } else if (line.startsWith(' ') || line.startsWith('\t')) {
          removed = 1;
        }
        if (idx === 0) removedCharsFirstLine = removed;
        totalRemoved += removed;
        return line.slice(removed);
      })
      .join('\n');

    this.replaceText(
      lineStart,
      effectiveEnd,
      outdented,
      Math.max(lineStart, start - removedCharsFirstLine),
      Math.max(lineStart, end - totalRemoved)
    );
  }

  public insertRaw(text: string): void {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const value = this.textarea.value;
    // Ensure we start on a new line if not already
    const prefix = start > 0 && value[start - 1] !== '\n' ? '\n' : '';
    const suffix = '\n';
    this.replaceText(start, end, prefix + text + suffix, start + prefix.length + text.length + suffix.length);
  }

  public applyFormat(format: string): void {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const value = this.textarea.value;
    const selected = value.substring(start, end);

    switch (format) {
      case 'bold':
        this.wrapSelection('**', '**', selected || 'bold text');
        break;
      case 'italic':
        this.wrapSelection('*', '*', selected || 'italic text');
        break;
      case 'strikethrough':
        this.wrapSelection('~~', '~~', selected || 'strikethrough text');
        break;
      case 'heading':
        this.prefixLine('## ');
        break;
      case 'quote':
        this.prefixLine('> ');
        break;
      case 'ul':
        this.prefixLine('- ');
        break;
      case 'ol':
        this.prefixLine('1. ');
        break;
      case 'task':
        this.prefixLine('- [ ] ');
        break;
      case 'code':
        if (selected.includes('\n')) {
          this.wrapSelection('```\n', '\n```', selected || 'code');
        } else {
          this.wrapSelection('`', '`', selected || 'code');
        }
        break;
      case 'link':
        this.replaceText(
          start,
          end,
          `[${selected || 'link text'}](https://example.com)`,
          start + 1,
          start + (selected ? selected.length + 1 : 10)
        );
        break;
      case 'image':
        this.replaceText(
          start,
          end,
          `![${selected || 'alt text'}](https://images.unsplash.com/photo-1499750310107-5fef28a66643)`,
          start + 2,
          start + (selected ? selected.length + 2 : 10)
        );
        break;
      case 'table': {
        const tableTemplate = `\n| Column 1 | Column 2 | Column 3 |\n| :--- | :---: | ---: |\n| Item 1 | Item 2 | Item 3 |\n| Value A | Value B | Value C |\n`;
        this.replaceText(start, end, tableTemplate, start + tableTemplate.length);
        break;
      }
      case 'hr': {
        const hr = `\n\n---\n\n`;
        this.replaceText(start, end, hr, start + hr.length);
        break;
      }
      case 'math': {
        if (selected && !selected.includes('\n')) {
          this.wrapSelection('$', '$', selected);
        } else {
          const mathTemplate = `\n$$\n${selected || 'E = mc^2'}\n$$\n`;
          this.replaceText(start, end, mathTemplate, start + mathTemplate.length);
        }
        break;
      }
      case 'mermaid': {
        const mermaidTemplate = `\n\`\`\`mermaid\nflowchart TD\n    A[Start] --> B{Is it working?}\n    B -->|Yes| C[Great!]\n    B -->|No| D[Debug]\n\`\`\`\n`;
        this.replaceText(start, end, mermaidTemplate, start + mermaidTemplate.length);
        break;
      }
      case 'chart': {
        const chartTemplate = `\n\`\`\`chart\n{\n  "type": "bar",\n  "data": {\n    "labels": ["Red", "Blue", "Yellow", "Green"],\n    "datasets": [{\n      "label": "Votes",\n      "data": [12, 19, 3, 5],\n      "backgroundColor": "rgba(56, 189, 248, 0.6)"\n    }]\n  }\n}\n\`\`\`\n`;
        this.replaceText(start, end, chartTemplate, start + chartTemplate.length);
        break;
      }
    }
  }

  private wrapSelection(before: string, after: string, fallback: string): void {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const value = this.textarea.value;
    const selected = value.substring(start, end);
    const textToInsert = before + (selected || fallback) + after;

    this.replaceText(
      start,
      end,
      textToInsert,
      start + before.length,
      start + before.length + (selected ? selected.length : fallback.length)
    );
  }

  private prefixLine(prefix: string): void {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const value = this.textarea.value;

    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', end);
    const effectiveEnd = lineEnd === -1 ? value.length : lineEnd;

    const lines = value.substring(lineStart, effectiveEnd).split('\n');
    const prefixed = lines.map((l) => prefix + l).join('\n');

    this.replaceText(
      lineStart,
      effectiveEnd,
      prefixed,
      start + prefix.length,
      end + prefix.length * lines.length
    );
  }

  private replaceText(
    start: number,
    end: number,
    text: string,
    selectStart: number,
    selectEnd = selectStart
  ): void {
    this.textarea.setRangeText(text, start, end, 'end');
    this.textarea.setSelectionRange(selectStart, selectEnd);
    this.textarea.focus();
    this.updateLineNumbers();
    this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

