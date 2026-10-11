(() => {
  'use strict';
  const key = 'ai-for-exploration-theme';
  const root = document.documentElement;
  const normalize = value => value === 'light' || value === 'dark' ? value : null;
  const media = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const systemTheme = () => media?.matches ? 'dark' : 'light';
  let storage = null;
  let preference = null;
  let buttons = [];
  let currentTheme;
  try {
    storage = window.localStorage;
    preference = normalize(storage.getItem(key));
  } catch {
    // The in-memory preference still works when storage is unavailable.
  }

  function updateButtons() {
    const dark = currentTheme === 'dark';
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(dark));
      button.title = dark ? '切换到浅色模式' : '切换到深色模式';
      button.querySelector('[data-theme-icon="moon"]')?.toggleAttribute('hidden', dark);
      button.querySelector('[data-theme-icon="sun"]')?.toggleAttribute('hidden', !dark);
    }
  }

  function applyTheme(theme) {
    currentTheme = theme;
    root.setAttribute('data-theme', theme);
    updateButtons();
  }

  // This runs synchronously in head, before styles can paint the page.
  applyTheme(preference ?? systemTheme());

  function enhanceButtons() {
    buttons = Array.from(document.querySelectorAll('[data-theme-toggle]'));
    for (const button of buttons) {
      button.hidden = false;
      button.addEventListener('click', () => {
        preference = currentTheme === 'dark' ? 'light' : 'dark';
        try {
          storage?.setItem(key, preference);
        } catch {
          // Do not make storage permission a prerequisite for switching.
        }
        applyTheme(preference);
      });
    }
    updateButtons();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhanceButtons, { once: true });
  else enhanceButtons();

  const followSystem = () => {
    if (preference === null) applyTheme(systemTheme());
  };
  if (media?.addEventListener) media.addEventListener('change', followSystem);
  else if (media?.addListener) media.addListener(followSystem);

  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    if (storage && event.storageArea && event.storageArea !== storage) return;
    preference = normalize(event.newValue);
    applyTheme(preference ?? systemTheme());
  });
})();
