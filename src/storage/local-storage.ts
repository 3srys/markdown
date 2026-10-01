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
- **Rich Extensions**: Supports Mermaid, KaTeX, Chart.js, and Shiki code highlighting!

> [!TIP]
> Click the "Reset" button (or type \`\`\`mermaid, \`\`\`chart, etc.) to explore interactive features.
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

