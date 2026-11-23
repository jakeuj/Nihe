export function encodeJsonToken(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

export function decodeJsonToken(token) {
  const raw = atob(token.replaceAll('-', '+').replaceAll('_', '/'));
  const bytes = Uint8Array.from(raw, character => character.charCodeAt(0));
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}
