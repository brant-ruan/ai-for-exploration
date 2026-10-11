export function validateDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) {
    throw new Error('Invalid date (expected YYYY-MM-DD): ' + value);
  }
  const date = new Date(value + 'T00:00:00Z');
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('Invalid calendar date: ' + value);
  }
  return value;
}

const text = (value) => String(value ?? '')
  .replace(/\\/g, '\\\\').replace(/\|/g, '\\|')
  .replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/[\r\n]+/g, ' ');

export function renderTopicTable(site, topics) {
  const origin = new URL(site.url);
  if (!['https:', 'http:'].includes(origin.protocol)) throw new Error('Invalid site URL');
  const base = String(site.basePath ?? '').replace(/\/$/, '');
  if (base && !/^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+$/.test(base)) {
    throw new Error('Invalid site basePath');
  }
  const siteRoot = origin.href.replace(/\/$/, '') + base;
  const rows = [...topics].sort((a, b) =>
    b.updated.localeCompare(a.updated) || a.slug.localeCompare(b.slug)).map((topic) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic.slug)) throw new Error('Invalid topic slug');
    validateDate(topic.created);
    validateDate(topic.updated);
    if (topic.created > topic.updated) throw new Error('created must not exceed updated');
    const expectedMarkdown = topic.slug + '-latest.md';
    const expectedHtml = topic.slug + '-latest.html';
    if (topic.markdown !== expectedMarkdown || topic.html !== expectedHtml) {
      throw new Error('Topic must use stable latest filenames: ' + topic.slug);
    }
    const route = siteRoot + '/' + topic.slug + '/';
    return '| [' + text(topic.title) + '](' + route + 'report/)：' + text(topic.subtitle) +
      ' | ' + topic.created + ' | ' + topic.updated +
      ' | [Markdown](' + topic.slug + '/' + topic.markdown + ') · [交互讲解](' +
      route + topic.html + ') |';
  });
  return ['| 主题 | 创建日期 | 更新日期 | 资料 |', '| --- | --- | --- | --- |', ...rows].join('\n');
}

export function replaceReadmeIndex(readme, site, topics) {
  const start = '<!-- topics:start -->';
  const end = '<!-- topics:end -->';
  if (readme.split(start).length !== 2 || readme.split(end).length !== 2) {
    throw new Error('README must contain exactly one topics:start and topics:end marker');
  }
  const first = readme.indexOf(start);
  const last = readme.indexOf(end);
  if (first > last) throw new Error('README topic markers are out of order');
  return readme.slice(0, first + start.length) + '\n\n' + renderTopicTable(site, topics) +
    '\n\n' + readme.slice(last);
}
