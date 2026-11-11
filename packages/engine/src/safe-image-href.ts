/**
 * Allow web, object and relative URLs for an image source (relative URLs use the document base).
 * This does not trust the remote host, validate image bytes, or guarantee an image loads.
 * Callers decide whether the URL and its origin are appropriate for their application.
 */
export function safeImageHref(value?: string): string | undefined {
  if (typeof value !== 'string' || /[\u0000-\u001f\u007f-\u009f]/.test(value)) return undefined;
  const text = value.trim();
  if (!text || text.includes('\\')) return undefined;
  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(text)?.[1]?.toLowerCase();
  if (scheme === 'http' || scheme === 'https') {
    try {
      const url = new URL(text);
      return url.protocol === `${scheme}:` && url.hostname && !url.username && !url.password
        ? text
        : undefined;
    } catch {
      return undefined;
    }
  }
  if (scheme === 'blob') {
    const inner = text.slice(text.indexOf(':') + 1);
    // Object URLs from opaque origins may legitimately start with blob:null/.
    if (/^null\/[^/?#]+(?:[?#].*)?$/i.test(inner)) return text;
    try {
      const url = new URL(inner);
      return (url.protocol === 'http:' || url.protocol === 'https:') &&
        url.hostname &&
        !url.username &&
        !url.password &&
        url.pathname.length > 1
        ? text
        : undefined;
    } catch {
      return undefined;
    }
  }
  if (scheme || text.startsWith('//')) return undefined;
  // A colon in the first segment is ambiguous with a malformed URL scheme.
  if (text.split(/[/?#]/, 1)[0].includes(':')) return undefined;
  return text;
}
