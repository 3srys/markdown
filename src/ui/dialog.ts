/**
 * Custom dialog system — drop-in replacements for window.confirm() and window.alert().
 * Both return Promises so callers can await them just like a normal confirm/alert.
 */

function getOrCreateDialogEl(): HTMLElement {
  let el = document.getElementById('custom-dialog-backdrop');
  if (el) return el;

  el = document.createElement('div');
  el.id = 'custom-dialog-backdrop';
  el.className = 'custom-dialog-backdrop';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.innerHTML = `
    <div class="custom-dialog-card" id="custom-dialog-card">
      <div class="custom-dialog-icon" id="custom-dialog-icon"></div>
      <div class="custom-dialog-body">
        <p class="custom-dialog-title" id="custom-dialog-title"></p>
        <p class="custom-dialog-message" id="custom-dialog-message"></p>
      </div>
      <div class="custom-dialog-actions" id="custom-dialog-actions"></div>
    </div>
  `;
  document.body.appendChild(el);
  return el;
}

function showDialog(opts: {
  type: 'confirm' | 'alert' | 'danger';
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}): Promise<boolean> {
  return new Promise((resolve) => {
    const backdrop = getOrCreateDialogEl();
    const card = document.getElementById('custom-dialog-card')!;
    const iconEl = document.getElementById('custom-dialog-icon')!;
    const titleEl = document.getElementById('custom-dialog-title')!;
    const msgEl = document.getElementById('custom-dialog-message')!;
    const actionsEl = document.getElementById('custom-dialog-actions')!;

    // Set content
    titleEl.textContent = opts.title;
    msgEl.textContent = opts.message;
    actionsEl.innerHTML = '';

    // Icon
    const icons: Record<string, string> = {
      confirm: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>`,
      alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>`,
      danger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></svg>`,
    };
    iconEl.innerHTML = icons[opts.type] || icons.confirm;
    iconEl.className = `custom-dialog-icon custom-dialog-icon--${opts.type}`;

    // Always add Cancel for confirm/danger
    if (opts.type !== 'alert') {
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'custom-dialog-btn custom-dialog-btn--cancel';
      cancelBtn.textContent = opts.cancelLabel ?? 'Cancel';
      cancelBtn.addEventListener('click', () => close(false));
      actionsEl.appendChild(cancelBtn);
    }

    // Confirm / OK button
    const confirmBtn = document.createElement('button');
    confirmBtn.className = `custom-dialog-btn custom-dialog-btn--${opts.type === 'danger' ? 'danger' : opts.type === 'alert' ? 'ok' : 'confirm'}`;
    confirmBtn.textContent = opts.confirmLabel ?? (opts.type === 'alert' ? 'OK' : 'Confirm');
    confirmBtn.addEventListener('click', () => close(true));
    actionsEl.appendChild(confirmBtn);

    // Keyboard support
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    };
    document.addEventListener('keydown', onKey);

    function close(result: boolean) {
      document.removeEventListener('keydown', onKey);
      card.classList.remove('custom-dialog-card--enter');
      card.classList.add('custom-dialog-card--exit');
      backdrop.classList.remove('custom-dialog-backdrop--show');

      setTimeout(() => {
        backdrop.classList.remove('custom-dialog-backdrop--visible');
        card.classList.remove('custom-dialog-card--exit');
        resolve(result);
      }, 200);
    }

    // Show with animation
    backdrop.classList.add('custom-dialog-backdrop--visible');
    requestAnimationFrame(() => {
      backdrop.classList.add('custom-dialog-backdrop--show');
      card.classList.add('custom-dialog-card--enter');
    });

    // Focus the confirm button
    setTimeout(() => confirmBtn.focus(), 50);
  });
}

/** Drop-in async replacement for window.confirm() */
export async function showConfirm(message: string, title = 'Confirm'): Promise<boolean> {
  return showDialog({ type: 'confirm', title, message, confirmLabel: 'Confirm', cancelLabel: 'Cancel' });
}

/** Destructive confirm — red confirm button */
export async function showDangerConfirm(message: string, title = 'Are you sure?', confirmLabel = 'Yes, proceed'): Promise<boolean> {
  return showDialog({ type: 'danger', title, message, confirmLabel, cancelLabel: 'Cancel' });
}

/** Drop-in async replacement for window.alert() */
export async function showAlert(message: string, title = 'Notice'): Promise<void> {
  await showDialog({ type: 'alert', title, message, confirmLabel: 'OK' });
}
