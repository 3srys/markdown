import { MarkdownEditor } from '../editor/editor';
import { appState } from '../state';
import { showToast } from '../ui/layout';
import { DEFAULT_DOCUMENT } from '../storage/local-storage';

export function setupFileHandlers(editor: MarkdownEditor, getRenderedHtml: () => string): void {
  setupNewDocument(editor);
  setupResetDocument(editor);
  setupFileImport(editor);
  setupFileDragDrop(editor);
  setupExportActions(editor, getRenderedHtml);
}

function setupNewDocument(editor: MarkdownEditor): void {
  const btnNew = document.getElementById('btn-new');
  if (!btnNew) return;

  btnNew.addEventListener('click', (e) => {
    e.preventDefault();
    const current = editor.getValue();
    if (current.trim().length > 0) {
      const confirmClear = window.confirm('Start a new document? Unsaved changes will be cleared.');
      if (!confirmClear) return;
    }

    editor.setValue('');
    appState.setContent('');
    const textarea = document.getElementById('editor') as HTMLTextAreaElement | null;
    if (textarea) textarea.dispatchEvent(new Event('input', { bubbles: true }));
    editor.focus();
    showToast('New document created');
  });
}

function setupResetDocument(editor: MarkdownEditor): void {
  const btnReset = document.getElementById('btn-reset');
  if (!btnReset) return;

  btnReset.addEventListener('click', (e) => {
    e.preventDefault();
    const confirmReset = window.confirm(
      'Reset editor to the default sample guide? Any current unsaved changes will be replaced.'
    );
    if (!confirmReset) return;

    editor.setValue(DEFAULT_DOCUMENT);
    appState.setContent(DEFAULT_DOCUMENT);
    const textarea = document.getElementById('editor') as HTMLTextAreaElement | null;
    if (textarea) textarea.dispatchEvent(new Event('input', { bubbles: true }));
    editor.focus();
    showToast('Editor reset to sample document');
  });
}

function setupFileImport(editor: MarkdownEditor): void {
  const btnOpen = document.getElementById('btn-open');
  const fileInput = document.getElementById('file-input') as HTMLInputElement | null;

  if (!btnOpen || !fileInput) return;

  btnOpen.addEventListener('click', (e) => {
    e.preventDefault();
    fileInput.value = '';
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) {
      readFile(file, editor);
    }
  });
}

function setupFileDragDrop(editor: MarkdownEditor): void {
  const editorPane = document.getElementById('editor-pane');
  const dropOverlay = document.getElementById('drop-overlay');

  if (!editorPane || !dropOverlay) return;

  let dragCounter = 0;

  editorPane.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    dropOverlay.classList.add('active');
  });

  editorPane.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      dropOverlay.classList.remove('active');
    }
  });

  editorPane.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  editorPane.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    dropOverlay.classList.remove('active');

    const file = e.dataTransfer?.files?.[0];
    if (file) {
      readFile(file, editor);
    }
  });
}

function readFile(file: File, editor: MarkdownEditor): void {
  const allowedExtensions = ['.md', '.markdown', '.txt'];
  const fileName = file.name.toLowerCase();
  const isAllowed = allowedExtensions.some((ext) => fileName.endsWith(ext));

  if (!isAllowed) {
    showToast('Only .md, .markdown, and .txt files are supported.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    if (typeof content === 'string') {
      editor.setValue(content);
      appState.setContent(content);
      // Trigger preview re-render by dispatching input event
      const textarea = document.getElementById('editor') as HTMLTextAreaElement | null;
      if (textarea) {
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
      showToast(`Imported ${file.name}`);
    }
  };
  reader.onerror = () => {
    showToast('Failed to read file.');
  };
  reader.readAsText(file);
}

export function exportMarkdownFile(content: string, filename = 'document.md'): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Exported ${filename}`);
}

export function exportHtmlFile(renderedHtml: string, filename = 'document.html'): void {
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Document</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      max-width: 860px;
      margin: 40px auto;
      padding: 0 20px;
      color: #1e293b;
      background-color: #ffffff;
    }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; line-height: 1.25; }
    h1 { font-size: 2em; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; }
    p { margin-bottom: 1em; }
    blockquote { border-left: 4px solid #cbd5e1; margin: 1em 0; padding: 0.5em 1em; background: #f8fafc; color: #475569; }
    table { width: 100%; border-collapse: collapse; margin: 1em 0; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
    tr:nth-child(even) { background: #f8fafc; }
    code { font-family: ui-monospace, Menlo, Consolas, monospace; background: #f1f5f9; padding: 0.2em 0.4em; border-radius: 4px; font-size: 85%; }
    pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    .callout { border-left: 4px solid; padding: 12px 16px; margin: 1em 0; border-radius: 0 6px 6px 0; }
    .callout-note { border-color: #0284c7; background: #f0f9ff; }
    .callout-tip { border-color: #10b981; background: #ecfdf5; }
    .callout-warning { border-color: #f59e0b; background: #fffbeb; }
    .callout-important { border-color: #8b5cf6; background: #f5f3ff; }
    .callout-caution { border-color: #ef4444; background: #fef2f2; }
    .callout-title { font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
    ul, ol { padding-left: 2em; margin-bottom: 1em; }
    img { max-width: 100%; height: auto; }
    .mermaid-container, .chart-container { text-align: center; margin: 1.5em 0; }
    @media print {
      body { max-width: 100%; margin: 0; padding: 0; }
    }
  </style>
</head>
<body>
  ${renderedHtml}
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Exported ${filename}`);
}

function setupExportActions(editor: MarkdownEditor, getRenderedHtml: () => string): void {
  // Export .md
  document.getElementById('btn-export-md')?.addEventListener('click', () => {
    exportMarkdownFile(editor.getValue());
  });

  // Export .html
  document.getElementById('btn-export-html')?.addEventListener('click', () => {
    exportHtmlFile(getRenderedHtml());
  });

  // Print / PDF
  document.getElementById('btn-print-pdf')?.addEventListener('click', () => {
    window.print();
  });

  // Copy Markdown
  document.getElementById('btn-copy-md')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(editor.getValue());
      showToast('Markdown copied to clipboard');
    } catch {
      showToast('Failed to copy Markdown');
    }
  });

  // Copy HTML
  document.getElementById('btn-copy-html')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(getRenderedHtml());
      showToast('Rendered HTML copied to clipboard');
    } catch {
      showToast('Failed to copy HTML');
    }
  });
}

