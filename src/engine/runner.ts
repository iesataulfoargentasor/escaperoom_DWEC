import workerSource from './student-worker.js?raw';
import type { Json, Result, Room } from '../types';
import { equal } from './compare';

// The broker never evaluates student code. Only the worker does so.
const broker = `
let worker, timer, used = false;
function finish(data) {
  clearTimeout(timer);
  if (worker) worker.terminate();
  parent.postMessage({ kind: 'result', data }, '*');
}
addEventListener('message', event => {
  if (event.source !== parent) return;
  if (event.data?.kind === 'stop') { clearTimeout(timer); if(worker) worker.terminate(); return; }
  if (used || event.data?.kind !== 'run') return;
  used = true;
  try {
    const url = URL.createObjectURL(new Blob([event.data.worker], {type:'text/javascript'}));
    worker = new Worker(url);
    URL.revokeObjectURL(url);
    timer = setTimeout(() => finish(JSON.stringify({error:'Tiempo agotado (2 s). Revisa bucles y recursión.'})), 2000);
    worker.onmessage = e => {
      if(typeof e.data !== 'string' || e.data.length > 100000) finish(JSON.stringify({error:'Salida inválida o demasiado grande.'}));
      else finish(e.data);
    };
    worker.onerror = e => { e.preventDefault(); finish(JSON.stringify({error:'El motor no pudo ejecutar el código. Revisa la sintaxis o la política del navegador.'})); };
    worker.postMessage(event.data.payload);
  } catch { finish(JSON.stringify({error:'Este navegador o su política de seguridad no permite el motor aislado.'})); }
});
parent.postMessage({kind:'ready'}, '*');
`;

export function runCode(code: string, room: Room, signal: AbortSignal): Promise<Result[]> {
  if (code.length > 20000) return Promise.reject(new Error('Máximo: 20.000 caracteres.'));
  if (!/^[A-Za-z_$][\w$]*$/.test(room.fnName)) return Promise.reject(new Error('Nombre de función no válido en la configuración.'));
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.hidden = true;
    frame.title = 'Motor aislado de pruebas';
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.referrerPolicy = 'no-referrer';
    let sent = false, done = false;
    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener('message', receive);
      signal.removeEventListener('abort', abort);
      frame.contentWindow?.postMessage({ kind: 'stop' }, '*');
      frame.remove();
    };
    const fail = (message: string) => {
      if (done) return;
      done = true; cleanup(); reject(new Error(message));
    };
    const abort = () => fail('Ejecución cancelada. Puedes volver a intentarlo.');
    const receive = (event: MessageEvent) => {
      if (done || event.source !== frame.contentWindow || event.origin !== 'null') return;
      if (event.data?.kind === 'ready' && !sent) {
        sent = true;
        frame.contentWindow?.postMessage({ kind: 'run', worker: workerSource,
          payload: { code, fnName: room.fnName, args: room.pruebas.map(p => p.args) } }, '*');
      } else if (event.data?.kind === 'result' && sent) {
        try {
          const raw: unknown = event.data.data;
          if (typeof raw !== 'string' || raw.length > 100000) throw new Error('Respuesta inválida del motor.');
          const data = JSON.parse(raw);
          if (typeof data.error === 'string') { fail(data.error.slice(0, 600)); return; }
          if (!Array.isArray(data.results) || data.results.length !== room.pruebas.length) throw new Error('Respuesta incompleta del motor.');
          const results = data.results.map((r: { value?: Json; error?: string }, i: number): Result => {
            if (!r || typeof r !== 'object') throw new Error('Resultado no válido.');
            if (typeof r.error === 'string') return { pass: false, got: '—', error: r.error.slice(0, 600) };
            if (!Object.hasOwn(r, 'value')) throw new Error('Falta el valor de retorno.');
            return { pass: equal(r.value!, room.pruebas[i].expected), got: JSON.stringify(r.value).slice(0, 4000) };
          });
          done = true; cleanup(); resolve(results);
        } catch { fail('Respuesta no válida del motor. Revisa el código y vuelve a ejecutar.'); }
      }
    };
    const timer = window.setTimeout(() => fail('El motor no respondió (5 s). Recarga la página o prueba un navegador actualizado.'), 5000);
    window.addEventListener('message', receive);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) { abort(); return; }
    // No allow-same-origin: storage/cookies of the app are inaccessible. Blob workers inherit CSP.
    // unsafe-eval is confined to this document; no student code is interpolated into HTML.
    frame.srcdoc = `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"><script>${broker}<\/script>`;
    document.body.append(frame);
  });
}
