import { appState } from '../state';
import { initializeIcons } from './toolbar';

export function showToast(message: string, duration = 2500): void {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 200);
  }, duration);
}

export function setupLayout(): void {
  setupSplitGutter();
  setupDesktopViewTabs();
  setupMobileTabs();
  setupZenMode();
  setupShortcutsModal();
  setupExportDropdown();
}

function setupDesktopViewTabs(): void {
  const btnSplit = document.getElementById('view-split') as HTMLButtonElement | null;
  const btnEditor = document.getElementById('view-editor') as HTMLButtonElement | null;
  const btnPreview = document.getElementById('view-preview') as HTMLButtonElement | null;
  const tabEditor = document.getElementById('tab-editor') as HTMLButtonElement | null;
  const tabPreview = document.getElementById('tab-preview') as HTMLButtonElement | null;

  if (!btnSplit || !btnEditor || !btnPreview) return;

  const tabs: Array<{ btn: HTMLButtonElement; mode: 'split' | 'editor' | 'preview' }> = [
    { btn: btnSplit, mode: 'split' },
    { btn: btnEditor, mode: 'editor' },
    { btn: btnPreview, mode: 'preview' },
  ];

  const setDesktopView = (mode: 'split' | 'editor' | 'preview', shouldFocus = false) => {
    document.body.setAttribute('data-view', mode);
    document.body.dataset.userExplicitView = 'true';
    appState.setViewMode(mode);

    tabs.forEach(({ btn, mode: tabMode }) => {
      const isActive = tabMode === mode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
      if (isActive && shouldFocus) {
        btn.focus();
      }
    });

    if (tabEditor && tabPreview) {
      if (mode === 'preview') {
        tabPreview.classList.add('active');
        tabEditor.classList.remove('active');
        tabPreview.setAttribute('aria-selected', 'true');
        tabEditor.setAttribute('aria-selected', 'false');
        tabPreview.setAttribute('tabindex', '0');
        tabEditor.setAttribute('tabindex', '-1');
      } else {
        tabEditor.classList.add('active');
        tabPreview.classList.remove('active');
        tabEditor.setAttribute('aria-selected', 'true');
        tabPreview.setAttribute('aria-selected', 'false');
        tabEditor.setAttribute('tabindex', '0');
        tabPreview.setAttribute('tabindex', '-1');
      }
    }
  };

  tabs.forEach(({ btn, mode }, idx) => {
    btn.addEventListener('click', () => setDesktopView(mode));

    btn.addEventListener('keydown', (e: KeyboardEvent) => {
      let targetIdx = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        targetIdx = (idx + 1) % tabs.length;
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        targetIdx = (idx - 1 + tabs.length) % tabs.length;
        e.preventDefault();
      } else if (e.key === 'Home') {
        targetIdx = 0;
        e.preventDefault();
      } else if (e.key === 'End') {
        targetIdx = tabs.length - 1;
        e.preventDefault();
      }

      if (targetIdx !== -1) {
        setDesktopView(tabs[targetIdx].mode, true);
      }
    });
  });
}

function setupSplitGutter(): void {
  const gutter = document.getElementById('gutter');
  const mainContainer = document.getElementById('main-container');
  const editorPane = document.getElementById('editor-pane');
  const previewPane = document.getElementById('preview-pane');

  if (!gutter || !mainContainer || !editorPane || !previewPane) return;

  // Restore saved pane ratio
  const savedSplit = appState.getState().paneSplit;
  editorPane.style.flex = `0 0 ${savedSplit}%`;
  previewPane.style.flex = `1 1 ${100 - savedSplit}%`;
  gutter.setAttribute('aria-valuenow', Math.round(savedSplit).toString());

  let isDragging = false;

  const onStart = (e: MouseEvent | TouchEvent) => {
    isDragging = true;
    gutter.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  const onMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const rect = mainContainer.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percentage = Math.max(15, Math.min(85, (offsetX / rect.width) * 100));

    editorPane.style.flex = `0 0 ${percentage}%`;
    previewPane.style.flex = `1 1 ${100 - percentage}%`;
    gutter.setAttribute('aria-valuenow', Math.round(percentage).toString());
    appState.setPaneSplit(percentage);
  };

  const onEnd = () => {
    if (isDragging) {
      isDragging = false;
      gutter.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  };

  gutter.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);

  gutter.addEventListener('touchstart', onStart, { passive: false });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onEnd);

  // Keyboard navigation for focusable separator
  gutter.addEventListener('keydown', (e: KeyboardEvent) => {
    const current = appState.getState().paneSplit;
    let next = current;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      next = Math.max(15, current - 5);
      e.preventDefault();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      next = Math.min(85, current + 5);
      e.preventDefault();
    } else if (e.key === 'PageDown') {
      next = Math.max(15, current - 15);
      e.preventDefault();
    } else if (e.key === 'PageUp') {
      next = Math.min(85, current + 15);
      e.preventDefault();
    } else if (e.key === 'Home') {
      next = 15;
      e.preventDefault();
    } else if (e.key === 'End') {
      next = 85;
      e.preventDefault();
    } else if (e.key === 'Enter') {
      next = 50;
      e.preventDefault();
    }

    if (next !== current) {
      editorPane.style.flex = `0 0 ${next}%`;
      previewPane.style.flex = `1 1 ${100 - next}%`;
      gutter.setAttribute('aria-valuenow', Math.round(next).toString());
      appState.setPaneSplit(next);
    }
  });
}

function setupMobileTabs(): void {
  const tabEditor = document.getElementById('tab-editor') as HTMLButtonElement | null;
  const tabPreview = document.getElementById('tab-preview') as HTMLButtonElement | null;
  const btnSplit = document.getElementById('view-split') as HTMLButtonElement | null;
  const btnEditor = document.getElementById('view-editor') as HTMLButtonElement | null;
  const btnPreview = document.getElementById('view-preview') as HTMLButtonElement | null;

  if (!tabEditor || !tabPreview) return;

  const mobileTabs = [
    { btn: tabEditor, mode: 'editor' as const },
    { btn: tabPreview, mode: 'preview' as const },
  ];

  const setView = (mode: 'editor' | 'preview', shouldFocus = false) => {
    document.body.setAttribute('data-view', mode);
    appState.setViewMode(mode);

    mobileTabs.forEach(({ btn, mode: tabMode }) => {
      const isActive = tabMode === mode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
      if (isActive && shouldFocus) {
        btn.focus();
      }
    });

    if (btnEditor && btnPreview && btnSplit) {
      btnEditor.classList.toggle('active', mode === 'editor');
      btnPreview.classList.toggle('active', mode === 'preview');
      btnSplit.classList.remove('active');
      btnEditor.setAttribute('aria-selected', String(mode === 'editor'));
      btnPreview.setAttribute('aria-selected', String(mode === 'preview'));
      btnSplit.setAttribute('aria-selected', 'false');
      btnEditor.setAttribute('tabindex', mode === 'editor' ? '0' : '-1');
      btnPreview.setAttribute('tabindex', mode === 'preview' ? '0' : '-1');
      btnSplit.setAttribute('tabindex', '-1');
    }
  };

  mobileTabs.forEach(({ btn, mode }, idx) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setView(mode);
    });

    btn.addEventListener('keydown', (e: KeyboardEvent) => {
      let targetIdx = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        targetIdx = (idx + 1) % mobileTabs.length;
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        targetIdx = (idx - 1 + mobileTabs.length) % mobileTabs.length;
        e.preventDefault();
      } else if (e.key === 'Home') {
        targetIdx = 0;
        e.preventDefault();
      } else if (e.key === 'End') {
        targetIdx = mobileTabs.length - 1;
        e.preventDefault();
      }

      if (targetIdx !== -1) {
        setView(mobileTabs[targetIdx].mode, true);
      }
    });
  });

  // Handle dynamic screen resize & orientation change
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
    if (e.matches) {
      const currentMode = appState.getState().viewMode;
      if (currentMode === 'preview') {
        setView('preview');
      } else {
        setView('editor');
      }
    } else {
      const currentMode = appState.getState().viewMode;
      if (currentMode === 'editor' && !document.body.dataset.userExplicitView) {
        document.body.setAttribute('data-view', 'split');
        appState.setViewMode('split');
        if (btnSplit && btnEditor && btnPreview) {
          btnSplit.classList.add('active');
          btnEditor.classList.remove('active');
          btnPreview.classList.remove('active');
          btnSplit.setAttribute('aria-selected', 'true');
          btnEditor.setAttribute('aria-selected', 'false');
          btnPreview.setAttribute('aria-selected', 'false');
          btnSplit.setAttribute('tabindex', '0');
          btnEditor.setAttribute('tabindex', '-1');
          btnPreview.setAttribute('tabindex', '-1');
        }
      }
    }
  };

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', handleMediaChange);
  } else if ('addListener' in mediaQuery) {
    (mediaQuery as any).addListener(handleMediaChange);
  }

  // Initial check on load
  if (mediaQuery.matches) {
    setView('editor');
  }
}

export function toggleZenMode(): void {
  const isZen = !document.body.classList.contains('zen-mode');
  document.body.classList.toggle('zen-mode', isZen);
  appState.setZenMode(isZen);

  const btnZen = document.getElementById('btn-zen');
  if (btnZen) {
    btnZen.innerHTML = isZen
      ? '<i data-lucide="minimize-2"></i>'
      : '<i data-lucide="maximize-2"></i>';
    btnZen.setAttribute('title', isZen ? 'Exit Zen Mode (Esc)' : 'Zen Mode (Ctrl+Shift+F)');
    initializeIcons();
  }

  if (isZen) {
    showToast('Zen Mode active. Press Esc to exit.');
  }
}

function setupZenMode(): void {
  const btnZen = document.getElementById('btn-zen');
  if (btnZen) {
    btnZen.addEventListener('click', (e) => {
      e.preventDefault();
      toggleZenMode();
    });
  }
}

function setupShortcutsModal(): void {
  const modal = document.getElementById('shortcuts-modal');
  const btnOpen = document.getElementById('btn-shortcuts');
  const btnClose = document.getElementById('btn-close-modal');

  if (!modal || !btnOpen || !btnClose) return;

  const openModal = () => {
    modal.classList.add('open');
  };

  const closeModal = () => {
    modal.classList.remove('open');
  };

  btnOpen.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });

  btnClose.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

function setupExportDropdown(): void {
  const dropdown = document.getElementById('export-dropdown');
  const toggleBtn = document.getElementById('btn-export-toggle');

  if (!dropdown || !toggleBtn) return;

  const closeDropdown = () => {
    dropdown.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  };

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
    const isOpen = dropdown.classList.contains('open');
    toggleBtn.setAttribute('aria-expanded', isOpen.toString());
  });

  window.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target as Node)) {
      closeDropdown();
    }
  });

  dropdown.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeDropdown();
      toggleBtn.focus();
    }
  });
}

