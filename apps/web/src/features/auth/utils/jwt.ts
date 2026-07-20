/**
 * Minimal JWT decoder — decodes payload without verification.
 * Verification is always done server-side.
 */
export function jwtDecode<T>(token: string): T {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const payload = parts[1];
  if (!payload) throw new Error('Invalid JWT: missing payload');

  // Base64url decode
  const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
  const decoded = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), '='));

  return JSON.parse(decoded) as T;
}
