export interface FormattingActionHandler {
  applyFormat: (format: string) => void;
  exportMarkdown: () => void;
  toggleZenMode: () => void;
  toggleViewMode?: () => void;
  indent: () => void;
  outdent: () => void;
}

export function setupKeyboardShortcuts(
  textarea: HTMLTextAreaElement,
  handlers: FormattingActionHandler
): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    if (e.key === 'Escape') {
      handlers.toggleZenMode();
      return;
    }

    if (modifier && e.shiftKey && (e.key === 'f' || e.key === 'F')) {
      e.preventDefault();
      handlers.toggleZenMode();
      return;
    }

    if (modifier && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault();
      handlers.applyFormat('bold');
      return;
    }

    if (modifier && (e.key === 'i' || e.key === 'I')) {
      e.preventDefault();
      handlers.applyFormat('italic');
      return;
    }

    if (modifier && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      handlers.applyFormat('link');
      return;
    }

    if (modifier && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      handlers.exportMarkdown();
      return;
    }

    if (modifier && e.key === 'Enter') {
      e.preventDefault();
      if (handlers.toggleViewMode) {
        handlers.toggleViewMode();
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        handlers.outdent();
      } else {
        handlers.indent();
      }
    }
  };

  textarea.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keydown', (e) => {
    // Global shortcut for Zen Mode toggle & escape
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    if (e.key === 'Escape' && document.body.classList.contains('zen-mode')) {
      handlers.toggleZenMode();
    } else if (modifier && e.shiftKey && (e.key === 'f' || e.key === 'F')) {
      e.preventDefault();
      handlers.toggleZenMode();
    }
  });

  return () => {
    textarea.removeEventListener('keydown', handleKeyDown);
  };
}

