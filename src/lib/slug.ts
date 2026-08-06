const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function randomSlug(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let slug = '';
  for (const byte of bytes) {
    slug += ALPHABET[byte % ALPHABET.length];
  }
  return slug;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-zA-Z0-9]{1,32}$/.test(slug);
}

export function normalizeUrl(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  let candidate = value;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname) return null;
    return url.toString();
  } catch {
    return null;
  }
}
