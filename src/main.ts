import '../styles/reset.css';
import '../styles/themes.css';
import '../styles/app.css';
import '../styles/editor.css';
import '../styles/preview.css';

import { inject } from '@vercel/analytics';
import { App } from './app';

// Initialize Vercel Web Analytics
inject();

function bootstrap(): void {
  const app = new App();
  app.init();
  requestAnimationFrame(() => {
    document.documentElement.classList.remove('no-transition-preload');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}


