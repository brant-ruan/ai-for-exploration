// Shared enhancement for the static, numbered topic directory.
(() => {
  const links = Array.from(document.querySelectorAll('.sidebar nav a[href^="#"]'));
  const entries = links.map(link => {
    try { return { link, section: document.getElementById(decodeURIComponent(link.hash.slice(1))) }; }
    catch { return { link, section: null }; }
  }).filter(entry => entry.section);
  if (!entries.length) return;
  function setCurrent(current) {
    entries.forEach(entry => {
      const selected = entry === current;
      entry.link.classList.toggle('current', selected);
      if (selected) entry.link.setAttribute('aria-current', 'location');
      else entry.link.removeAttribute('aria-current');
    });
  }
  function update() {
    const header = document.querySelector('.archive-header');
    const offset = (header ? header.getBoundingClientRect().height : 0) + 36;
    let current = entries[0];
    for (const entry of entries) {
      // Native anchor positioning can round a fractional CSS pixel upward.
      if (entry.section.getBoundingClientRect().top <= offset + 1) current = entry;
      else break;
    }
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = entries.at(-1);
    setCurrent(current);
  }
  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', schedule);
  window.addEventListener('load', update, { once: true });
  document.querySelectorAll('[data-archive-print]').forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => window.print());
  });
  update();
})();
