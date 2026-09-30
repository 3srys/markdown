import DOMPurify from 'dompurify';

if (typeof window !== 'undefined' && !(window as any).DOMPurify) {
  (window as any).DOMPurify = DOMPurify;
}

if (typeof DOMPurify.addHook === 'function') {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      const href = node.getAttribute('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//'))) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    }
  });
}

export function sanitizeHtml(dirtyHtml: string): string {
  if (typeof DOMPurify.sanitize === 'function') {
    return DOMPurify.sanitize(dirtyHtml, {
      USE_PROFILES: { html: true, svg: true, svgFilters: true, mathMl: true },
      ALLOW_DATA_ATTR: true,
      ADD_TAGS: ['canvas'],
      ADD_ATTR: [
        'target',
        'rel',
        'checked',
        'disabled',
        'aria-hidden',
        'aria-label',
        'aria-labelledby',
        'data-code',
        'data-lang',
        'data-index',
        'data-mermaid',
        'data-chart',
        'data-math',
        'data-format',
      ],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'base'],
      FORBID_ATTR: [
        'onerror',
        'onload',
        'onclick',
        'onmouseover',
        'onfocus',
        'onblur',
        'formaction',
      ],
    });
  }
  return dirtyHtml;
}
