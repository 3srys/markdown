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
  const btnSplit = document.getElementById('view-split');
  const btnEditor = document.getElementById('view-editor');
  const btnPreview = document.getElementById('view-preview');
  const tabEditor = document.getElementById('tab-editor');
  const tabPreview = document.getElementById('tab-preview');

  if (!btnSplit || !btnEditor || !btnPreview) return;

  const setDesktopView = (mode: 'split' | 'editor' | 'preview') => {
    document.body.setAttribute('data-view', mode);
    document.body.dataset.userExplicitView = 'true';
    appState.setViewMode(mode);

    btnSplit.classList.toggle('active', mode === 'split');
    btnEditor.classList.toggle('active', mode === 'editor');
    btnPreview.classList.toggle('active', mode === 'preview');

    if (tabEditor && tabPreview) {
      if (mode === 'preview') {
        tabPreview.classList.add('active');
        tabEditor.classList.remove('active');
      } else {
        tabEditor.classList.add('active');
        tabPreview.classList.remove('active');
      }
    }
  };

  btnSplit.addEventListener('click', () => setDesktopView('split'));
  btnEditor.addEventListener('click', () => setDesktopView('editor'));
  btnPreview.addEventListener('click', () => setDesktopView('preview'));
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
}

function setupMobileTabs(): void {
  const tabEditor = document.getElementById('tab-editor');
  const tabPreview = document.getElementById('tab-preview');
  const btnSplit = document.getElementById('view-split');
  const btnEditor = document.getElementById('view-editor');
  const btnPreview = document.getElementById('view-preview');

  if (!tabEditor || !tabPreview) return;

  const setView = (mode: 'editor' | 'preview') => {
    document.body.setAttribute('data-view', mode);
    appState.setViewMode(mode);

    if (mode === 'editor') {
      tabEditor.classList.add('active');
      tabEditor.setAttribute('aria-selected', 'true');
      tabPreview.classList.remove('active');
      tabPreview.setAttribute('aria-selected', 'false');
    } else {
      tabPreview.classList.add('active');
      tabPreview.setAttribute('aria-selected', 'true');
      tabEditor.classList.remove('active');
      tabEditor.setAttribute('aria-selected', 'false');
    }

    if (btnEditor && btnPreview && btnSplit) {
      btnEditor.classList.toggle('active', mode === 'editor');
      btnPreview.classList.toggle('active', mode === 'preview');
      btnSplit.classList.remove('active');
    }
  };

  tabEditor.addEventListener('click', (e) => {
    e.preventDefault();
    setView('editor');
  });

  tabPreview.addEventListener('click', (e) => {
    e.preventDefault();
    setView('preview');
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
        if (btnSplit) btnSplit.classList.add('active');
        if (btnEditor) btnEditor.classList.remove('active');
        if (btnPreview) btnPreview.classList.remove('active');
      }
    }
  };

  if (mediaQuery.matches) {
    setView('editor');
  }

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', handleMediaChange);
  } else if ('addListener' in mediaQuery) {
    (mediaQuery as any).addListener(handleMediaChange);
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

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
    const isOpen = dropdown.classList.contains('open');
    toggleBtn.setAttribute('aria-expanded', isOpen.toString());
  });

  window.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target as Node)) {
      dropdown.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

