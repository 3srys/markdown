import { Theme } from '../types';
import { appState } from '../state';
import { initializeIcons } from './toolbar';

export function isCurrentThemeDark(): boolean {
  const current = appState.getState().theme;
  if (current === 'dark') return true;
  if (current === 'light') return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);

  const themeBtn = document.getElementById('btn-theme');
  if (themeBtn) {
    const isDark = isCurrentThemeDark();
    themeBtn.innerHTML = isDark
      ? '<i data-lucide="moon"></i>'
      : '<i data-lucide="sun"></i>';
    themeBtn.setAttribute('title', `Current Theme: ${theme.toUpperCase()} (Click to toggle)`);
    initializeIcons();
  }
}

export function setupTheme(onThemeChanged?: () => void): void {
  const initialTheme = appState.getState().theme;
  applyTheme(initialTheme);

  const themeBtn = document.getElementById('btn-theme');
  if (themeBtn) {
    themeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Simple toggle: if it currently looks dark, go light. If light, go dark.
      const currentlyDark = isCurrentThemeDark();
      const nextTheme: Theme = currentlyDark ? 'light' : 'dark';

      appState.setTheme(nextTheme);
      applyTheme(nextTheme);
      if (onThemeChanged) {
        onThemeChanged();
      }
    });
  }

  // Listen to system changes
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (appState.getState().theme === 'system') {
        applyTheme('system');
        if (onThemeChanged) {
          onThemeChanged();
        }
      }
    });
  }
}

