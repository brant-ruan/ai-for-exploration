import { readFile } from 'node:fs/promises';

const headerTemplate = (await readFile(new URL('../templates/shared/header.html', import.meta.url), 'utf8')).trim();
export const headerCss = (await readFile(new URL('../templates/shared/header.css', import.meta.url), 'utf8')).trimEnd();
const footerTemplate = (await readFile(new URL('../templates/shared/footer.html', import.meta.url), 'utf8')).trim();
export const footerCss = (await readFile(new URL('../templates/shared/footer.css', import.meta.url), 'utf8')).trimEnd();
const escapeAttribute = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

function renderTemplate(template, values, name) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!Object.hasOwn(values, key)) throw new Error(`Unknown ${name} template placeholder: ${key}`);
    return values[key];
  });
}

// Callers supply links so generated readers respect BASE_PATH while standalone
// interactive pages can keep their relative, offline-readable navigation.
export function renderHeader({ homeHref, topicsHref, contentHref = '#main', repository, reportHref = null, interactive = false }) {
  for (const [name, value] of Object.entries({ homeHref, topicsHref, contentHref, repository })) {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`Header needs ${name}`);
  }
  if (reportHref !== null && (typeof reportHref !== 'string' || !reportHref.trim())) throw new Error('Header reportHref must be a nonempty link or null');
  return renderTemplate(headerTemplate, {
    skipClasses: interactive ? 'skip-link archive-skip' : 'skip-link',
    headerClasses: interactive ? 'site-header archive-header' : 'site-header',
    innerClasses: interactive ? 'header-inner archive-header-inner' : 'header-inner',
    brandClasses: interactive ? 'brand archive-brand' : 'brand',
    navClasses: interactive ? 'site-nav archive-nav' : 'site-nav',
    homeHref: escapeAttribute(homeHref),
    topicsHref: escapeAttribute(topicsHref),
    contentHref: escapeAttribute(contentHref),
    repository: escapeAttribute(repository),
    reportLink: reportHref === null ? '' : `<a href="${escapeAttribute(reportHref)}">深度报告（最新）</a>`
  }, 'header');
}

// Both generated pages and standalone interactive pages use this template.
// Interactive classes adapt the same structure to the inlined archive CSS.
export function renderFooter({ repository, interactive = false }) {
  if (typeof repository !== 'string' || !repository.trim()) throw new Error('Footer needs the site repository URL');
  const values = {
    footerClasses: interactive ? 'site-footer archive-footer' : 'site-footer',
    innerClasses: interactive ? 'footer-inner archive-footer-inner' : 'footer-inner',
    repository: escapeAttribute(repository)
  };
  return renderTemplate(footerTemplate, values, 'footer');
}
