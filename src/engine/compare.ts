import type { Json } from '../types';

// Arrays preserve order; object key order is irrelevant. No implicit coercion.
export function equal(a: Json, b: Json): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ak = Object.keys(a), bk = Object.keys(b);
  return ak.length === bk.length && ak.every(k => Object.hasOwn(b, k) &&
    equal((a as Record<string, Json>)[k], (b as Record<string, Json>)[k]));
}
