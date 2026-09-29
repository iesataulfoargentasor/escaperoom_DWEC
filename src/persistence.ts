import { rooms } from './data/rooms';
import type { Progress } from './types';

export const STORAGE_KEY = 'escape-room-dwec-v2';
const LEGACY_KEY = 'escape-room-dwec-v1';
export const MAX_FILE = 1000000;
export function fresh(): Progress {
  return { version: 2, current: 0, codes: Object.fromEntries(rooms.map(r => [r.id, r.plantilla])),
    solved: [], hints: [], attempts: {}, startedAt: null, finishedAt: null };
}
const record = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const integer = (v: unknown, max: number): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= max;

export function validate(value: unknown): Progress {
  if (!record(value) || value.version !== 2 || !record(value.codes) || !record(value.attempts) ||
      !Array.isArray(value.solved) || !Array.isArray(value.hints)) throw new Error('Formato de progreso no reconocido (se necesita versión 2).');
  const out = fresh();
  const ids = rooms.map(r => r.id);
  for (const key of ['solved', 'hints'] as const) {
    const list = value[key] as unknown[];
    if (list.length > rooms.length || list.some(id => typeof id !== 'string' || !ids.includes(id)) || new Set(list).size !== list.length) throw new Error('Lista de salas no válida.');
    out[key] = ids.filter(id => list.includes(id));
  }
  // Solved rooms must be a contiguous prefix: imported data cannot unlock a gap.
  if (out.solved.some((id, i) => id !== ids[i])) throw new Error('El orden de las salas resueltas no es válido.');
  for (const id of ids) {
    const code = value.codes[id];
    if (typeof code !== 'string' || code.length > 20000) throw new Error('Código ausente o demasiado largo.');
    out.codes[id] = code;
    const n = value.attempts[id] ?? 0;
    if (!integer(n, 1000000)) throw new Error('Número de intentos no válido.');
    out.attempts[id] = n;
  }
  if (!integer(value.current, rooms.length - 1)) throw new Error('Sala actual no válida.');
  out.current = Math.min(value.current, out.solved.length);
  for (const key of ['startedAt', 'finishedAt'] as const) {
    const time = value[key];
    if (time !== null && !integer(time, Date.now() + 60000)) throw new Error('Fecha de progreso no válida.');
    out[key] = time;
  }
  if ((out.solved.length > 0 && out.startedAt === null) || (out.finishedAt !== null &&
      (out.startedAt === null || out.finishedAt < out.startedAt || out.solved.length !== rooms.length))) throw new Error('Fechas y progreso incoherentes.');
  if (out.solved.length === rooms.length && out.finishedAt === null) throw new Error('Falta la fecha de finalización.');
  return out;
}

export function parseProgress(text: string): Progress {
  if (text.length > MAX_FILE) throw new Error('Archivo demasiado grande. Máximo: 1 MB.');
  return validate(JSON.parse(text));
}

export function load(storage: Pick<Storage, 'getItem'>): { progress: Progress; notice: string } {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) return { progress: parseProgress(raw), notice: '' };
    const old = storage.getItem(LEGACY_KEY);
    if (old) {
      if (old.length > MAX_FILE) throw new Error('Guardado anterior demasiado grande.');
      const legacy = JSON.parse(old);
      const p = fresh();
      // Challenges have additional tests: migrate drafts but require revalidation of keys.
      if (!record(legacy) || !record(legacy.codigos)) throw new Error('Guardado anterior no válido.');
      for (const r of rooms) {
        const code = legacy.codigos[r.id];
        if (typeof code === 'string' && code.length <= 20000) p.codes[r.id] = code;
      }
      return { progress: p, notice: 'Se han recuperado tus borradores de la versión anterior. Ejecuta las nuevas pruebas para recuperar las llaves.' };
    }
    return { progress: fresh(), notice: '' };
  } catch {
    return { progress: fresh(), notice: 'No se pudo leer el guardado. Se inicia una sesión nueva; exporta tu trabajo para conservarlo.' };
  }
}

export function save(storage: Pick<Storage, 'setItem'>, progress: Progress): boolean {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(progress)); return true; }
  catch { return false; }
}

export function downloadProgress(progress: Progress) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = 'mi-escape-dwec.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
