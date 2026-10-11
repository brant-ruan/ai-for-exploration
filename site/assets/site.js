// Optional enhancements; navigation and the complete report work without JS.
const search = document.querySelector('#topic-search');
if (search) {
  const cards = [...document.querySelectorAll('.topic-card')];
  const buttons = [...document.querySelectorAll('[data-kind-filter]')];
  let selected = 'all';
  const normalize = (value) => value.normalize('NFKC').toLocaleLowerCase().trim();
  const update = () => {
    const terms = normalize(search.value).split(/\s+/).filter(Boolean);
    let count = 0;
    for (const card of cards) {
      const text = normalize(card.dataset.search);
      const show = (selected === 'all' || card.dataset.kind === selected) && terms.every((term) => text.includes(term));
      card.hidden = !show;
      if (show) count++;
    }
    document.querySelector('#empty-state').hidden = count > 0;
    document.querySelector('#search-status').textContent = `显示 ${count} 个主题`;
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.kindFilter === selected)));
  };
  search.addEventListener('input', update);
  buttons.forEach((button) => button.addEventListener('click', () => { selected = button.dataset.kindFilter; update(); }));
  document.querySelector('#clear-search').addEventListener('click', () => { search.value = ''; selected = 'all'; update(); search.focus(); });
}

document.querySelector('[data-print]')?.addEventListener('click', () => window.print());
for (const button of document.querySelectorAll('.copy-code')) {
  button.addEventListener('click', async () => {
    const code = button.closest('.code-block').querySelector('code');
    let fallback;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code.textContent);
      } else {
        fallback = document.createElement('textarea');
        fallback.value = code.textContent;
        fallback.style.position = 'fixed';
        fallback.style.opacity = '0';
        document.body.append(fallback);
        fallback.select();
        if (!document.execCommand('copy')) throw new Error('Clipboard unavailable');
      }
      button.textContent = '已复制';
    } catch {
      button.textContent = '请选中复制';
    } finally {
      fallback?.remove();
      setTimeout(() => { button.textContent = '复制'; }, 2200);
    }
  });
}

const article = document.querySelector('#report-content');
if (article) {
  const toc = document.querySelector('.toc-shell');
  const narrow = window.matchMedia('(max-width: 780px)');
  const setToc = () => { toc.open = !narrow.matches; };
  setToc();
  narrow.addEventListener('change', setToc);
  const bar = document.querySelector('.reading-progress span');
  const topLink = document.querySelector('.back-top');
  const headings = [...article.querySelectorAll('h2[id], h3[id]')];
  const links = [...document.querySelectorAll('[data-toc-id]')];
  const linkById = new Map(links.map((link) => [link.dataset.tocId, link]));
  let active = null;
  let scheduled = false;
  const updateReading = () => {
    scheduled = false;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${Math.max(0, Math.min(100, total > 0 ? window.scrollY / total * 100 : 0))}%`;
    topLink.hidden = window.scrollY < 600;
    let current = null;
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= 140) current = heading;
      else break;
    }
    if (current?.id === active) return;
    links.forEach((link) => link.removeAttribute('aria-current'));
    active = current?.id ?? null;
    const link = linkById.get(active);
    if (link) {
      link.setAttribute('aria-current', 'location');
      const details = link.closest('.toc-children');
      if (details && !narrow.matches) details.open = true;
    }
  };
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateReading); } };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  updateReading();
}
