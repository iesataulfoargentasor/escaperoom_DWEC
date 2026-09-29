import { expect, test } from '@playwright/test';

const solutions = [
  'function energiaMedia(a,b,c){return Math.floor((a+b+c)/3)}',
  'function invertir(texto){return [...texto].reverse().join("")}',
  'function abrirCerradura(n){return n%15===0?"ABRIR":n%3===0?"IZQUIERDA":n%5===0?"DERECHA":"BLOQUEADO"}',
  'function contarAlertas(valores){return valores.filter(v=>v>100).length}',
  'function objetosMagicos(items){return items.filter(i=>i.esMagico===true).map(i=>i.nombre)}',
  'function exploradoresConLlave(exploradores){return exploradores.filter(e=>e.tieneLlave===true).map(e=>e.nombre).join(", ")}',
];
test.beforeEach(async ({page}) => { await page.goto('/'); await page.getByRole('button',{name:'Empezar la fuga'}).click(); });

test('seis salas, persistencia, final estable y separación de material docente', async ({page}) => {
  for (let i=0;i<solutions.length;i++) {
    await page.getByRole('textbox',{name:'Tu código JavaScript'}).fill(solutions[i]);
    await page.getByRole('button',{name:'Ejecutar pruebas'}).click();
    await expect(page.getByRole('status')).toContainText('¡Sala superada!');
    if(i<5) await page.getByRole('button',{name:'Siguiente sala'}).click();
  }
  await page.getByRole('button',{name:'Abrir la salida'}).click();
  await expect(page.getByRole('heading',{name:'¡El laboratorio está abierto!'})).toBeVisible();
  const before = await page.evaluate(()=>JSON.parse(localStorage.getItem('escape-room-dwec-v2')!).finishedAt);
  await page.reload(); await page.getByRole('button',{name:'Ver mi escape'}).click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('escape-room-dwec-v2')!).finishedAt)).toBe(before);
  await expect(page.getByText('600 puntos')).toBeVisible();
});

test('errores, tiempo máximo y recuperación', async ({page}) => {
  const editor = page.getByRole('textbox',{name:'Tu código JavaScript'});
  await editor.fill('function energiaMedia( {');
  await page.getByRole('button',{name:'Ejecutar pruebas'}).click();
  await expect(page.getByRole('alert')).toContainText('preparar');
  await editor.fill('function energiaMedia(){while(true){}}');
  await page.getByRole('button',{name:'Ejecutar pruebas'}).click();
  await expect(page.getByRole('alert')).toContainText('Tiempo agotado');
  await editor.fill(solutions[0]); await page.getByRole('button',{name:'Ejecutar pruebas'}).click();
  await expect(page.getByRole('status')).toContainText('¡Sala superada!');
  await expect(page.locator('iframe')).toHaveCount(0);
});

test('cancelar y descartar resultados antiguos al editar', async ({page}) => {
  await page.getByRole('textbox',{name:'Tu código JavaScript'}).fill('while(true){}');
  await page.getByRole('button',{name:'Ejecutar pruebas'}).click();
  await page.getByRole('button',{name:'Cancelar',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('cancelada');
  await page.getByRole('textbox',{name:'Tu código JavaScript'}).fill(solutions[0]);
  await page.getByRole('button',{name:'Ejecutar pruebas'}).click();
  await expect(page.getByRole('status')).toContainText('¡Sala superada!');
  await page.getByRole('textbox',{name:'Tu código JavaScript'}).fill('function energiaMedia(){return 0}');
  await expect(page.getByText('Prueba 1 · Pendiente')).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Código modificado');
});

test('undefined, ciclos y ausencia de función producen mensajes manejables', async ({page}) => {
  for (const code of ['function energiaMedia(){}','function energiaMedia(){const a=[];a.push(a);return a}']) {
    await page.getByRole('textbox',{name:'Tu código JavaScript'}).fill(code);
    await page.getByRole('button',{name:'Ejecutar pruebas'}).click();
    await expect(page.getByRole('status')).toContainText('0 de');
    await expect(page.getByText('Prueba 1 · Por revisar')).toBeVisible();
  }
  await page.getByRole('textbox',{name:'Tu código JavaScript'}).fill('function otra(){}');
  await page.getByRole('button',{name:'Ejecutar pruebas'}).click();
  await expect(page.getByRole('alert')).toContainText('No se encuentra');
});

test('worker sin DOM ni almacenamiento de la aplicación y CSP sin red', async ({page}) => {
  const outcome = await page.evaluate(async () => {
    // Test runner via the real browser, not a substitute Node VM.
    const {runCode} = await import('/src/engine/runner.ts' as string);
    const room = {fnName:'probe', pruebas:[{args:[],expected:'undefined|undefined|undefined'}]};
    const safe = await runCode('function probe(){return typeof document+"|"+typeof localStorage+"|"+typeof window}',room,new AbortController().signal);
    const network = await runCode('function probe(){ const x=new XMLHttpRequest(); x.open("GET","https://example.com",false); x.send(); return 1 }', {fnName:'probe',pruebas:[{args:[],expected:1}]},new AbortController().signal);
    return {safe,network};
  });
  expect(outcome.safe[0].pass).toBe(true);
  expect(outcome.network[0].pass).toBe(false);
  expect(outcome.network[0].error).toBeTruthy();
});

test('móvil, teclado, confirmación destructiva y conservación tras recarga', async ({page}) => {
  await page.setViewportSize({width:360,height:800});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('textbox',{name:'Tu código JavaScript'}).fill('// mi borrador');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button',{name:'Ejecutar pruebas'})).toBeFocused();
  page.once('dialog',dialog=>dialog.dismiss());
  await page.getByRole('button',{name:'Restablecer código'}).click();
  await expect(page.getByRole('textbox',{name:'Tu código JavaScript'})).toHaveValue('// mi borrador');
  await page.reload(); await page.getByRole('button',{name:'Continuar la fuga'}).click();
  await expect(page.getByRole('textbox',{name:'Tu código JavaScript'})).toHaveValue('// mi borrador');
});

test('exportar, importar, rechazar archivo inválido y reiniciar', async ({page}) => {
  await page.getByRole('textbox',{name:'Tu código JavaScript'}).fill('// copia de seguridad');
  const download = page.waitForEvent('download');
  await page.getByRole('button',{name:'Exportar progreso'}).click();
  expect((await download).suggestedFilename()).toBe('mi-escape-dwec.json');
  const saved = await page.evaluate(()=>localStorage.getItem('escape-room-dwec-v2')!);
  await page.locator('input[type=file]').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"version":99}')});
  await expect(page.getByText(/No se importó/)).toBeVisible();
  await expect(page.getByRole('textbox',{name:'Tu código JavaScript'})).toHaveValue('// copia de seguridad');
  await page.getByRole('textbox',{name:'Tu código JavaScript'}).fill('// otro código');
  page.once('dialog', dialog=>dialog.accept());
  await page.locator('input[type=file]').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(saved)});
  await page.getByRole('button',{name:'Continuar la fuga'}).click();
  await expect(page.getByRole('textbox',{name:'Tu código JavaScript'})).toHaveValue('// copia de seguridad');
  page.once('dialog', dialog=>dialog.accept());
  await page.getByRole('button',{name:'Reiniciar aventura'}).click();
  await page.reload();
  await expect(page.getByRole('button',{name:'Empezar la fuga'})).toBeVisible();
});

test('guardado corrupto y almacenamiento bloqueado no impiden jugar', async ({page}) => {
  await page.evaluate(()=>localStorage.setItem('escape-room-dwec-v2','{"codes":null}'));
  await page.reload();
  await expect(page.getByText(/No se pudo leer el guardado/)).toBeVisible();
  await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Blocked','QuotaExceededError');};});
  await page.reload();
  await expect(page.getByText(/No se puede guardar en este navegador/)).toBeVisible();
  await page.getByRole('button',{name:'Empezar la fuga'}).click();
  await page.getByRole('textbox',{name:'Tu código JavaScript'}).fill(solutions[0]);
  await page.getByRole('button',{name:'Ejecutar pruebas'}).click();
  await expect(page.getByRole('status')).toContainText('¡Sala superada!');
});

