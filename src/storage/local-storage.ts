import { Theme } from '../types';

const STORAGE_KEYS = {
  CONTENT: 'md_live_content',
  THEME: 'md_live_theme',
  PANE_SPLIT: 'md_live_pane_split',
  SYNC_SCROLL: 'md_live_sync_scroll',
} as const;

export const DEFAULT_DOCUMENT = `# Welcome to Markdown Live

An ultra-light, modern, client-only Markdown editor and live preview application.

---

## 🚀 Features at a Glance

- **Fast & Responsive**: Real-time preview with low latency.
- **Client-Side Only**: Runs 100% in your browser without any backend or database.
- **GFM Compliant**: Tables, task lists, strikethrough, footnotes, and sub/superscript.
- **Callouts**: GitHub-style alert callouts.
- **Code Highlighting**: Syntax highlighting powered by Shiki.
- **Mathematical Notation**: Inline and block KaTeX rendering.
- **Interactive Diagrams**: Mermaid flowcharts, sequence diagrams, and more.
- **Data Charts**: Responsive charts powered by Chart.js.

---

## 📝 GitHub-Style Callouts

> [!NOTE]
> This is a helpful note highlighting useful background information.

> [!TIP]
> Use keyboard shortcuts like \`Ctrl+B\` for bold and \`Ctrl+Shift+F\` for Zen mode!

> [!IMPORTANT]
> Everything runs locally in your browser. Your data never leaves your device.

> [!WARNING]
> Please export your documents before clearing your browser cookies/storage.

> [!CAUTION]
> Deleting your document cannot be undone if not saved.

---

## 📊 Data Visualization with Chart.js

\`\`\`chart
{
  "type": "bar",
  "data": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "datasets": [
      {
        "label": "Monthly Output (units)",
        "data": [65, 85, 90, 81, 110, 135],
        "backgroundColor": "rgba(56, 189, 248, 0.6)"
      }
    ]
  },
  "options": {
    "responsive": true,
    "plugins": {
      "title": {
        "display": true,
        "text": "Project Performance"
      }
    }
  }
}
\`\`\`

---

## 🔀 Mermaid Diagrams

\`\`\`mermaid
flowchart LR
    A[Markdown Text] --> B(Markdown-it Parser)
    B --> C{Safe HTML?}
    C -->|Sanitize| D[DOMPurify]
    D --> E[Live Preview]
\`\`\`

---

## 📐 Mathematical Notation

Einstein's mass-energy equivalence is represented as $E = mc^2$.

Gauss's integral formula:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

---

## 💻 Code Highlighting

\`\`\`typescript
interface UserProfile {
  id: string;
  name: string;
  active: boolean;
}

function greet(user: UserProfile): string {
  return \`Hello, \${user.name}!\`;
}
\`\`\`

---

## 📋 Task List & Tables

- [x] Fast client-only architecture
- [x] Split editor & preview
- [x] Dark / Light theme support
- [ ] Offline PWA capability

| Metric | Target | Status |
| :--- | :---: | ---: |
| Startup Time | < 50ms | Exceeded |
| Memory Usage | < 30MB | Met |
| Offline Ready | 100% | Met |

Subscript: H~2~O, Superscript: X^2^, and Footnotes[^1].

[^1]: Footnotes provide additional reference and notes at the bottom of documents.
`;

export function loadSavedContent(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTENT);
    return saved !== null ? saved : DEFAULT_DOCUMENT;
  } catch {
    return DEFAULT_DOCUMENT;
  }
}

export function saveContent(content: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTENT, content);
  } catch {
    // Ignore storage quota or disabled storage errors
  }
}

export function loadSavedTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'system';
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {
    // Ignore
  }
}

export function loadSavedPaneSplit(): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PANE_SPLIT);
    if (saved) {
      const val = parseFloat(saved);
      if (!isNaN(val) && val >= 10 && val <= 90) {
        return val;
      }
    }
  } catch {
    // Ignore
  }
  return 50;
}

export function savePaneSplit(split: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PANE_SPLIT, split.toString());
  } catch {
    // Ignore
  }
}

export function loadSavedSyncScroll(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SYNC_SCROLL);
    if (saved !== null) {
      return saved === 'true';
    }
  } catch {
    // Ignore
  }
  return true;
}

export function saveSyncScroll(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SYNC_SCROLL, enabled.toString());
  } catch {
    // Ignore
  }
}

