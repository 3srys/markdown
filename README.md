# Markdown Live

An ultra-light, modern, client-only Markdown editor and live preview web application.

Zero backend, zero database, zero external API dependencies. Everything runs locally inside the browser.

---

## ⚡ Features

- **Instant Live Preview**: High-performance debounced rendering while typing.
- **Client-Side Only**: 100% private. Your documents never leave your browser.
- **Rich GFM Markdown**:
  - Headings (H1–H6), paragraphs, blockquotes, horizontal rules.
  - Bold, italic, strikethrough, inline code.
  - Tables with alignment support.
  - Interactive task lists (`- [x]`, `- [ ]`).
  - Footnotes (`[^1]`), subscript (`~sub~`), and superscript (`^sup^`).
  - GitHub-style Callouts (`[!NOTE]`, `[!TIP]`, `[!WARNING]`, `[!IMPORTANT]`, `[!CAUTION]`).
- **Lazy-Loaded Visualizations & Extensions**:
  - **Syntax Highlighting**: Powered by [Shiki](https://shiki.style).
  - **Mathematical Formulas**: Inline (`$...$`) and block (`$$...$$`) via [KaTeX](https://katex.org).
  - **Diagrams**: Flowcharts, sequence diagrams, ER diagrams, and git graphs via [Mermaid](https://mermaid.js.org).
  - **Data Charts**: Responsive charts (bar, line, pie, doughnut, etc.) via [Chart.js](https://www.chartjs.org).
- **Editor Capabilities**:
  - Monospace font with line numbers.
  - Tab indentation & Shift+Tab outdentation.
  - Synchronized scrolling between editor and preview.
  - Fullscreen / Zen mode (`Ctrl/Cmd + Shift + F`, `Esc` to exit).
  - Word count, character count, and estimated reading time.
- **File Management & Storage**:
  - Automatic draft persistence in `localStorage`.
  - Drag-and-drop file import (`.md`, `.markdown`, `.txt`).
  - Export as Markdown (`.md`).
  - Export as self-contained standalone HTML (`.html`).
  - Print / Save as PDF via browser print stylesheet.
  - One-click copy Markdown or rendered HTML to clipboard.
- **Themes & Responsiveness**:
  - Dark mode, light mode, and system preference detection.
  - Draggable split-pane divider.
  - Responsive mobile tab switching between Editor and Preview.

---

## 🛠️ Tech Stack

- **Runtime / Bundler**: Vite + TypeScript
- **Markdown Parser**: `markdown-it` + plugins
- **Sanitizer**: `DOMPurify` (strict sanitization)
- **Icons**: `Lucide` (tree-shaken)
- **Lazy Modules**: `shiki`, `katex`, `mermaid`, `chart.js`

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd markdown-live

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

The production output is generated in `dist/` and can be served statically with any web server, GitHub Pages, Cloudflare Pages, Vercel, or Netlify.

### Preview Build

```bash
npm run preview
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>B</kbd> | Toggle Bold |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>I</kbd> | Toggle Italic |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>K</kbd> | Insert Link |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>S</kbd> | Export / Download Markdown |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd> | Toggle Zen Mode |
| <kbd>Esc</kbd> | Exit Zen Mode |
| <kbd>Tab</kbd> | Indent 2 spaces |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | Outdent |

---

## 🔒 Security

All user markdown is converted to HTML and strictly sanitized through `DOMPurify` before insertion into the DOM. Fenced chart blocks and Mermaid diagrams are treated strictly as declarative data and cannot execute arbitrary scripts.

