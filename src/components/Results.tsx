import type { Result, Room } from '../types';

export function Results({ room, results }: { room: Room; results?: Result[] }) {
  return <section aria-labelledby="tests-title">
    <h3 id="tests-title">Pruebas de la puerta</h3>
    <p className="muted">Las entradas y salidas esperadas son públicas. Devuelve el valor con <code>return</code>.</p>
    <ol className="tests">
      {room.pruebas.map((p, i) => <li key={i} className={results?.[i] ? (results[i].pass ? 'passed' : 'failed') : ''}>
        <details open={!!results?.[i] && !results[i].pass}>
          <summary>Prueba {i + 1} · {results?.[i] ? (results[i].pass ? 'Correcta ✓' : 'Por revisar') : 'Pendiente'}</summary>
          <p>Entrada: <code>{room.fnName}({p.args.map(a => JSON.stringify(a)).join(', ')})</code></p>
          <p>Esperado: <code>{JSON.stringify(p.expected)}</code></p>
          {results?.[i] && <p>{results[i].error ? 'Error: ' : 'Devuelto: '}<code>{results[i].error ?? results[i].got}</code></p>}
        </details>
      </li>)}
    </ol>
  </section>;
}
