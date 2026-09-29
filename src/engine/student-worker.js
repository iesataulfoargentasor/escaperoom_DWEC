// Imported as raw text: evaluated ONLY in a disposable worker inside the opaque iframe.
// It is not an anti-cheating boundary. The student controls this worker's JS realm.
const send = self.postMessage.bind(self);
const stringify = JSON.stringify.bind(JSON);
const parse = JSON.parse.bind(JSON);
const clone = self.structuredClone.bind(self);
function message(error) {
  try { return String(error?.message ?? error).slice(0, 500); }
  catch { return 'Error no representable.'; }
}
function normalize(value, depth = 0, budget = { nodes: 0 }) {
  if (++budget.nodes > 1000 || depth > 12) throw new Error('Resultado demasiado grande o profundo.');
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'string' && value.length <= 4000) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (Array.isArray(value) && value.length <= 500) return Array.from(value, v => normalize(v, depth + 1, budget));
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    const keys = Object.keys(value);
    if (keys.length > 100) throw new Error('Demasiadas propiedades.');
    const out = Object.create(null);
    for (const k of keys) out[k] = normalize(value[k], depth + 1, budget);
    return out;
  }
  throw new Error('Devuelve un valor JSON finito: revisa return. No se admiten undefined, funciones, promesas, BigInt ni referencias circulares.');
}
self.onmessage = ({ data }) => {
  const { code, fnName, args } = data;
  let fn;
  try {
    fn = new Function('"use strict";\n' + code + '\n;return typeof ' + fnName + ' === "function" ? ' + fnName + ' : null;')();
    if (typeof fn !== 'function') throw new Error('No se encuentra ' + fnName + '(). Mantén el nombre de la función.');
  } catch (error) {
    send(stringify({ error: 'No se pudo preparar la función: ' + message(error) }));
    return;
  }
  const results = [];
  for (const input of args) {
    try {
      const value = stringify(normalize(fn(...clone(input))));
      if (value.length > 12000) throw new Error('Resultado demasiado largo.');
      results.push({ value: parse(value) });
    } catch (error) { results.push({ error: message(error) }); }
  }
  send(stringify({ results }));
};
