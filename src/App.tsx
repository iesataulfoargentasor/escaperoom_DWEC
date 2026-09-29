import { useEffect, useRef, useState } from 'react';
import { rooms } from './data/rooms';
import { downloadProgress, fresh, load, MAX_FILE, parseProgress, save, STORAGE_KEY } from './persistence';
import { runCode } from './engine/runner';
import { Results } from './components/Results';
import type { Progress, Result } from './types';

function initial() {
  try { return load(window.localStorage); }
  catch { return { progress: fresh(), notice: 'El almacenamiento está bloqueado. Exporta tu progreso antes de cerrar.' }; }
}
function elapsed(p: Progress, now: number) {
  const seconds = p.startedAt ? Math.floor(Math.max(0, (p.finishedAt ?? now) - p.startedAt) / 1000) : 0;
  return `${Math.floor(seconds / 3600).toString().padStart(2, '0')}:${Math.floor(seconds / 60 % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export default function App() {
  const [loaded] = useState(initial);
  const [progress, setProgress] = useState(loaded.progress);
  const [notice, setNotice] = useState(loaded.notice);
  const [storageOk, setStorageOk] = useState(true);
  const [screen, setScreen] = useState<'intro' | 'game' | 'finish'>('intro');
  const [results, setResults] = useState<Record<string, Result[]>>({});
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [hideClock, setHideClock] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const room = rooms[progress.current];
  const complete = progress.solved.length === rooms.length;
  const attempts = Object.values(progress.attempts).reduce((a, b) => a + b, 0);

  useEffect(() => {
    try { setStorageOk(save(localStorage, progress)); } catch { setStorageOk(false); }
  }, [progress]);
  useEffect(() => {
    if (!progress.startedAt || progress.finishedAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [progress.startedAt, progress.finishedAt]);
  useEffect(() => { heading.current?.focus(); }, [screen, progress.current]);
  useEffect(() => () => { controller.current?.abort(); }, []);
  useEffect(() => {
    const changed = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setNotice('El progreso cambió en otra pestaña. Usa una sola pestaña para evitar sobrescrituras; exporta antes de recargar.');
    };
    addEventListener('storage', changed);
    return () => removeEventListener('storage', changed);
  }, []);

  function edit(code: string) {
    setProgress(p => ({ ...p, codes: { ...p.codes, [room.id]: code } }));
    setResults(r => { const next = { ...r }; delete next[room.id]; return next; });
    setError(''); setStatus('Código modificado. Ejecuta las pruebas para comprobar esta versión.');
  }
  async function execute() {
    if (controller.current) return;
    const aborter = new AbortController(); controller.current = aborter;
    setBusy(true); setError(''); setStatus('Ejecutando pruebas…');
    setResults(r => { const next = { ...r }; delete next[room.id]; return next; });
    setProgress(p => ({ ...p, attempts: { ...p.attempts, [room.id]: Math.min(1000000, (p.attempts[room.id] ?? 0) + 1) } }));
    try {
      const output = await runCode(progress.codes[room.id], room, aborter.signal);
      setResults(r => ({ ...r, [room.id]: output }));
      const passed = output.filter(r => r.pass).length;
      if (passed === room.pruebas.length) {
        setProgress(p => {
          const solved = p.solved.includes(room.id) ? p.solved : [...p.solved, room.id];
          return { ...p, solved, finishedAt: solved.length === rooms.length ? p.finishedAt ?? Date.now() : null };
        });
        setStatus(`¡Sala superada! Llave ${room.clave} conseguida. ${passed} pruebas correctas.`);
      } else setStatus(`${passed} de ${output.length} pruebas correctas. Abre los resultados y revisa las diferencias.`);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo ejecutar.'); setStatus(''); }
    finally { controller.current = null; setBusy(false); }
  }
  function choose(index: number) {
    if (busy || index > progress.solved.length) return;
    setProgress(p => ({ ...p, current: index })); setStatus(''); setError('');
  }
  function start() {
    setProgress(p => ({ ...p, startedAt: p.startedAt ?? Date.now() }));
    setScreen(complete ? 'finish' : 'game');
  }
  function reset() {
    if (!window.confirm('¿Borrar todo el progreso de esta aventura? Exporta una copia antes si quieres conservarlo.')) return;
    setProgress(fresh()); setResults({}); setError(''); setStatus(''); setNotice(''); setScreen('intro');
  }
  async function importFile(selected?: File) {
    if (!selected) return;
    try {
      if (selected.size > MAX_FILE) throw new Error('Archivo demasiado grande. Máximo: 1 MB.');
      const imported = parseProgress(await selected.text());
      if (!window.confirm('¿Sustituir el progreso actual por el archivo importado?')) return;
      setProgress(imported); setResults({}); setError(''); setStatus(''); setScreen('intro');
      setNotice('Progreso importado. Los resultados de las pruebas se recalculan al ejecutar.');
    } catch (e) { setNotice(`No se importó: ${e instanceof Error ? e.message : 'archivo no válido'}`); }
    finally { if (file.current) file.current.value = ''; }
  }

  return <>
    <a className="skip" href="#main">Saltar al contenido</a>
    <div className="shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={e => { e.preventDefault(); if (!busy) setScreen('intro'); }} aria-label="Inicio del laboratorio">{'{ JS }'} <span>LABORATORIO <b>DWEC</b></span></a>
        <span className="tag">MISIÓN 06 · JAVASCRIPT</span>
      </header>
      <div className="notices" aria-live="polite">
        {!storageOk && <p className="warning">No se puede guardar en este navegador. Exporta tu progreso antes de cerrar.</p>}
        {notice && <p className="warning">{notice} <button className="small" onClick={() => setNotice('')}>Cerrar aviso</button></p>}
      </div>
      <main id="main">
        {screen === 'intro' && <section className="intro">
          <p className="eyebrow">APRENDE · PRUEBA · ESCAPA</p>
          <h1 ref={heading} tabIndex={-1}>Seis puertas.<br /><span>Tu código es la llave.</span></h1>
          <p className="lead">El instituto ha cerrado. El laboratorio sigue encendido.<br />Resuelve seis retos de JavaScript y abre la salida, a tu ritmo.</p>
          <div className="actions"><button className="primary" onClick={start}>{complete ? 'Ver mi escape' : progress.startedAt ? 'Continuar la fuga →' : 'Empezar la fuga →'}</button><span>{progress.solved.length}/6 llaves recuperadas</span></div>
          <div className="intro-grid">
            {[['01', 'Escribe JavaScript', 'Funciones pequeñas, conceptos claros y ejemplos visibles.'], ['02', 'Aprende probando', 'Compara resultados. Usa pistas siempre que las necesites.'], ['03', 'Abre las seis puertas', 'Cada sala superada suma una llave y 100 puntos de progreso.']].map(([n, title, text]) => <article className="panel" key={n}><span className="number">{n}</span><h2>{title}</h2><p>{text}</p></article>)}
          </div>
          <p className="muted">Sin registro · Guardado en este navegador · Sin cuenta atrás ni penalización por pistas</p>
        </section>}

        {screen === 'game' && <>
          <div className="mission-header"><div><p className="eyebrow">OPERACIÓN: SALIR DEL LABORATORIO</p><h1 ref={heading} tabIndex={-1}>Tu ruta de escape</h1></div>
            <div className="stats"><span>{progress.solved.length}/6 llaves</span><span>{progress.solved.length * 100} puntos</span>{!hideClock && <span>Tiempo: {elapsed(progress, now)}</span>}<button className="small" onClick={() => setHideClock(!hideClock)}>{hideClock ? 'Mostrar tiempo' : 'Ocultar tiempo'}</button></div>
          </div>
          <progress value={progress.solved.length} max={6} aria-label="Salas superadas" />
          <nav className="room-map" aria-label="Salas del laboratorio">
            {rooms.map((r, i) => <button key={r.id} disabled={busy || i > progress.solved.length} aria-current={i === progress.current ? 'step' : undefined} onClick={() => choose(i)}><span className="room-number">{String(i + 1).padStart(2, '0')}</span><span>{r.nombre.replace(/^(El |La )/, '')}<small>{progress.solved.includes(r.id) ? `Superada · ${r.clave}` : i > progress.solved.length ? 'Bloqueada' : 'Disponible'}</small></span></button>)}
          </nav>
          <div className="workspace">
            <section className="panel brief" aria-labelledby="room-title"><p className="eyebrow">SALA {progress.current + 1} / 6</p><h2 id="room-title">{room.nombre}</h2><span className="tag">{room.concepto}</span><p>{room.historia}</p><div className="task"><h3>Tu misión</h3><p>{room.enunciado}</p></div>
              <p className="muted">Recibirás entradas del tipo mostrado en las pruebas. No necesitas pedir datos ni usar el DOM.</p>
              <button disabled={progress.hints.includes(room.id)} onClick={() => setProgress(p => ({ ...p, hints: [...p.hints, room.id] }))}>{progress.hints.includes(room.id) ? 'Pista abierta' : 'Dame una pista'}</button>
              {progress.hints.includes(room.id) && <p className="hint">{room.pista}</p>}
            </section>
            <section className="panel editor-panel" aria-labelledby="editor-title">
              <div className="editor-head"><h2 id="editor-title"><label htmlFor="code">Tu código JavaScript</label></h2><span className="tag">editor.js</span></div>
              <textarea id="code" aria-describedby="editor-help" value={progress.codes[room.id]} onChange={e => edit(e.target.value)} readOnly={busy} maxLength={20000} spellCheck={false} autoCapitalize="off" autoCorrect="off" onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); if (!busy) void execute(); } }} />
              <p id="editor-help" className="muted">Ctrl/⌘ + Enter: ejecutar. Tab: ir al siguiente control. Máximo 20.000 caracteres.</p>
              <div className="actions"><button className="primary" disabled={busy} onClick={() => void execute()}>{busy ? 'Ejecutando…' : 'Ejecutar pruebas →'}</button>{busy && <button onClick={() => controller.current?.abort()}>Cancelar</button>}<button disabled={busy} onClick={() => { if (window.confirm('¿Restablecer la plantilla de esta sala? Se borrará su código actual.')) edit(room.plantilla); }}>Restablecer código</button></div>
              <div role="status" className="feedback">{status}</div>
              {error && <p role="alert" className="warning">{error}</p>}
              {progress.solved.includes(room.id) && <div className="earned"><strong>Llave {room.clave} en tu inventario</strong><p>La llave reconoce una solución anterior. Si has cambiado el código, vuelve a comprobarlo.</p><button disabled={busy} onClick={() => { if (progress.current === rooms.length - 1) setScreen('finish'); else choose(progress.current + 1); }}>{progress.current === rooms.length - 1 ? 'Abrir la salida →' : 'Siguiente sala →'}</button></div>}
            </section>
          </div>
          <div className="panel results"><Results room={room} results={results[room.id]} /></div>
        </>}

        {screen === 'finish' && <section className="intro finish"><p className="eyebrow">MISIÓN COMPLETADA</p><h1 ref={heading} tabIndex={-1}>¡El laboratorio está abierto!</h1><p className="escape-code">{rooms.map(r => r.clave).join('')}</p><p className="lead">Has practicado variables, cadenas, condicionales, arrays, objetos y funciones.</p><div className="stats"><span>600 puntos</span><span>6 llaves</span><span>{attempts} ejecuciones</span><span>{progress.hints.length} pistas</span><span>Tiempo: {elapsed(progress, now)}</span></div><p>Probar, equivocarse y pedir ayuda también es programar. El siguiente reto: explica tu solución y propón una prueba nueva.</p><div className="actions"><button className="primary" onClick={() => downloadProgress(progress)}>Guardar mi aventura</button><button onClick={() => setScreen('game')}>Repasar las salas</button></div></section>}
      </main>
      <footer>
        <div className="actions"><button disabled={busy} onClick={() => downloadProgress(progress)}>Exportar progreso</button><button disabled={busy} onClick={() => file.current?.click()}>Importar progreso</button><button disabled={busy} onClick={reset}>Reiniciar aventura</button></div>
        <input ref={file} type="file" accept=".json,application/json" hidden onChange={e => void importFile(e.target.files?.[0])} />
        <details className="teacher"><summary>Información para el profesorado y privacidad</summary><p>Este resumen es local: {progress.solved.length} salas, {attempts} ejecuciones y {progress.hints.length} pistas. No representa al grupo ni acredita una evaluación.</p><p>El código y el progreso se guardan en este navegador. No se envían a un servidor de evaluación. El alojamiento puede registrar las visitas. No escribas datos personales ni secretos.</p><p>Las soluciones y la guía docente se entregan aparte al profesor. Una contraseña dentro de una web estática no protege material privado.</p><p>El motor usa un entorno separado y limita el tiempo. Es una herramienta de práctica; no un juez seguro frente a código hostil. El tiempo incluye pausas y cierres del navegador y se congela al completar las seis salas.</p></details>
        <p className="muted">Laboratorio DWEC · Aprende a tu ritmo. Si compartes equipo, exporta y reinicia al terminar.</p>
      </footer>
    </div>
  </>;
}
