# Escape Room JavaScript · Laboratorio DWEC

**Actividad publicada:** https://iesataulfoargentasor.github.io/escaperoom_DWEC/

**Repositorio:** https://github.com/iesataulfoargentasor/escaperoom_DWEC

### Configuración de esta publicación

Este repositorio ya tiene GitHub Pages configurado desde la rama `gh-pages`, carpeta raíz. `main` contiene el código fuente y `gh-pages` contiene únicamente la aplicación compilada. No cambies Pages a GitHub Actions siguiendo el ejemplo genérico de la sección 7: la sesión utilizada para publicar no dispone de permiso para añadir workflows personalizados. El ejemplo se conserva en `docs/pages-workflow.yml.example`, sin activarlo.

Los cambios en `main` **no publican automáticamente** una nueva versión: ejecuta `npm ci` y `npm run build` y actualiza en `gh-pages` el contenido de `dist` (no la carpeta `dist` anidada), conservando `.nojekyll`. Puedes hacerlo desde GitHub, seleccionando `gh-pages` y usando **Add file → Upload files**. GitHub Pages vuelve a desplegar al confirmar esos cambios; verifica el resultado en Actions y en la URL publicada. Si más adelante habilitas permisos de workflows, podrás activar la alternativa automática explicada en la sección 7.

El material docente sigue en la entrega local/ZIP, excluido de este repositorio. Los tests públicos sí contienen soluciones de referencia.

Proyecto completo en **Vite + React + TypeScript + Tailwind CSS**, basado en las seis salas del TSX original. El alumnado escribe JavaScript; TypeScript se utiliza para desarrollar la aplicación.

No necesitas construir el proyecto desde una plantilla: este directorio ya contiene todos los archivos. Descomprime el ZIP completo antes de ejecutar comandos. No abras `index.html` con doble clic: hay que usar un servidor local o un alojamiento web.

## 1. Qué se entrega

- Aplicación responsive con seis retos, pistas, resultados por prueba, llaves y puntos de progreso.
- Código organizado por responsabilidades y comprobación estricta de TypeScript.
- Motor ejecutado en un Worker desechable dentro de un iframe de origen opaco.
- Guardado local, exportación/importación JSON validada y recuperación de borradores de la versión original.
- Pruebas unitarias, pruebas en navegador y workflow para GitHub Pages.
- `docente/GUIA-DOCENTE.md` y `docente/soluciones.json`: material para el profesor, fuera de la compilación.
- `REVISION.md`: hallazgos del original y decisiones de mejora.
- `SEGURIDAD.md`: límites del aislamiento y recomendaciones para una futura evaluación con servidor.

La carpeta `dist/`, generada al compilar, es lo único que se publica. El ZIP del proyecto completo es para ti; **no lo distribuyas al alumnado si quieres reservar las soluciones**. Los tests E2E también contienen soluciones de referencia. `.gitignore` excluye `docente/`, pero no los tests: un repositorio público hará públicos esos tests. Para reservar todo el material, usa un repositorio privado y un alojamiento compatible con tu cuenta.

## 2. Instalar Node.js desde cero

1. Abre [la página oficial de Node.js](https://nodejs.org/en/download).
2. Instala la versión **LTS** adecuada para tu sistema; recomendamos Node **24 LTS**. En Windows utiliza el instalador `.msi`; en macOS, el instalador `.pkg`. En Linux sigue las opciones oficiales para tu distribución o gestor de versiones.
3. Conserva la opción de añadir Node al `PATH`. npm viene incluido.
4. Cierra y vuelve a abrir PowerShell, Terminal o la terminal de VS Code.
5. Comprueba:

```sh
node --version
npm --version
```

Este proyecto requiere Node 22.12 o superior; usa una rama LTS mantenida. `.nvmrc` indica 24 si utilizas un gestor compatible. No es necesario instalar React, TypeScript, Vite ni Tailwind globalmente.

Si PowerShell dice que no puede ejecutar `npm.ps1`, utiliza `npm.cmd` en los comandos de esta guía o abre Símbolo del sistema. No necesitas desactivar globalmente la política de seguridad de PowerShell.

## 3. Instalar y ejecutar el proyecto incluido

1. Extrae el ZIP en una carpeta normal, por ejemplo `Documentos/escape-room-dwec`.
2. Abre una terminal **dentro de la carpeta que contiene `package.json`**. En VS Code: Archivo → Abrir carpeta; después Terminal → Nueva terminal.
3. Instala exactamente las versiones del archivo de bloqueo:

```sh
npm ci
```

4. Inicia el servidor:

```sh
npm run dev
```

5. Abre la dirección que aparezca, normalmente `http://127.0.0.1:5173`. Para detenerlo, pulsa Ctrl+C en la terminal. Los cambios en `src` se reflejan automáticamente.

La primera instalación necesita conexión a Internet. Después, la aplicación no depende de CDN, fuentes remotas, cuentas ni servicios de evaluación. `node_modules` no viene en el ZIP y se genera con `npm ci`.

Si no tienes `package-lock.json` porque has creado un proyecto nuevo a partir de los fuentes, ejecuta `npm install` una vez y conserva el archivo de bloqueo generado. En la entrega completa usa `npm ci`.

**Crear un proyecto equivalente manualmente, solo como referencia:**

```sh
npm create vite@latest mi-laboratorio -- --template react-ts
cd mi-laboratorio
npm install
npm install tailwindcss @tailwindcss/vite
```

Eso crea una plantilla vacía, no este escape room. Para usar esta entrega no hagas ese paso ni superpongas dos plantillas: abre directamente la carpeta incluida. La integración de Tailwind ya está configurada en `vite.config.ts` y `src/styles.css`.

## 4. Uso en clase

1. Pulsa **Empezar la fuga**.
2. Lee la misión y los casos de prueba. Mantén el nombre de la función.
3. Escribe JavaScript y devuelve el resultado con `return`; `console.log` no sustituye a `return`.
4. Pulsa **Ejecutar pruebas** o Ctrl/⌘ + Enter.
5. Consulta las diferencias entre entrada, salida esperada y salida obtenida. Corrige y vuelve a probar.
6. Consigue las seis llaves para formar `ESCAPA`.

| Sala | Función | Contenidos y casos límite |
|---|---|---|
| Panel de energía | `energiaMedia(a,b,c)` | Media, precedencia y `Math.floor`, incluso con negativos |
| Mensaje cifrado | `invertir(texto)` | Cadenas, arrays, cadena vacía y puntos de código Unicode |
| Cerradura | `abrirCerradura(n)` | Condiciones, módulo, prioridad del caso 3 y 5; 0 y negativos |
| Sensores | `contarAlertas(valores)` | Recorrido, contador y límite estricto `> 100` |
| Inventario | `objetosMagicos(items)` | Filtrado, proyección y `esMagico === true` |
| Puerta final | `exploradoresConLlave(exploradores)` | Composición `filter/map/join` y `tieneLlave === true` |

Se admiten funciones síncronas y valores JSON finitos de tamaño acotado. No hay DOM, imports de paquetes, entrada interactiva ni pruebas de funciones async. En la segunda sala se invierten puntos de código, no grafemas completos: un emoji compuesto o una letra con marca combinante puede separarse. El contrato lo indica explícitamente.

Cada sala suma 100 puntos una sola vez. Pedir pistas e intentar de nuevo no resta puntos. Las llaves reconocen una solución que pasó anteriormente: editarla invalida el feedback mostrado, pero no borra una llave ya ganada. Se puede repasar libremente lo desbloqueado. No se atribuye un nivel profesional por acabar el juego.

## 5. Guardado y traslado del progreso

- Se guarda el código y el progreso en `localStorage`, con la clave `escape-room-dwec-v2`.
- **Exportar progreso** descarga `mi-escape-dwec.json`; **Importar progreso** lo valida y pide confirmar antes de sustituir el actual.
- Límites: 20.000 caracteres por sala, archivo importado de hasta 1 MB, IDs y campos reconocidos, contadores y fechas válidos, progresión sin saltos.
- La versión original usaba `escape-room-dwec-v1`. Si no existe un guardado v2 se recuperan sus borradores; hay que volver a superar las pruebas ampliadas. La clave antigua no se elimina.
- La migración solo es posible en el mismo origen web y navegador. `localhost`, `127.0.0.1`, GitHub Pages y Vercel tienen almacenes distintos.
- El tiempo transcurrido incluye pausas y cierres de página. Se congela al superar la última sala y no cambia al recargar. Se puede ocultar. No interviene en los puntos.
- Si se bloquea o llena el almacenamiento, aparece un aviso; la sesión sigue en memoria. Exporta antes de cerrar.
- Al reiniciar o restaurar una plantilla se pide confirmación. Reiniciar borra el progreso v2 de esta aplicación, no todo el almacenamiento del navegador.
- Usa una sola pestaña: se avisa si otra escribe, pero no hay fusión automática ni bloqueo entre pestañas.
- El modo privado, borrar datos del navegador o cambiar de equipo puede hacer perder el guardado. No hay copia en la nube.

No importes una copia como prueba de calificación: se puede modificar a mano. En equipos compartidos, exporta y reinicia antes de cambiar de alumno. Si aloja varios laboratorios bajo el mismo dominio/origen, cambia `STORAGE_KEY` en cada proyecto para evitar colisiones.

## 6. Comprobar y construir para producción

```sh
npm run check
```

Ejecuta pruebas unitarias, comprobación de tipos y compilación. Para pruebas completas en un navegador:

```sh
npx playwright install chromium
npm run test:e2e
```

En Linux/CI puede ser necesario `npx playwright install --with-deps chromium`. Playwright es una dependencia de desarrollo; no se descarga en los navegadores de los alumnos. También puedes usar Chrome ya instalado, en PowerShell:

```powershell
$env:PW_CHANNEL = "chrome"
npm run test:e2e
```

Para compilar y previsualizar:

```sh
npm run build
npm run preview
```

Se crea `dist/` con HTML, CSS y JavaScript. Abre la URL indicada, normalmente `http://127.0.0.1:4173`. `preview` sirve para verificar el resultado; no es el servidor recomendado de producción.

El sitio no utiliza rutas de SPA ni un enrutador. `base: './'` hace que los recursos compilados funcionen tanto en la raíz de un dominio como en una subcarpeta de GitHub Pages. Si añades rutas en el futuro tendrás que revisar base y reglas de fallback.

## 7. Desplegar en GitHub Pages

Necesitas una cuenta de GitHub y, si utilizas la terminal para subir código, [Git](https://git-scm.com/downloads). La disponibilidad de Pages en repositorios privados depende del plan y de la organización; consulta [la documentación de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages).

1. Crea un repositorio vacío, por ejemplo `escape-room-dwec`. Decide su visibilidad: uno público también expone el código y las soluciones presentes en los tests. No incluyas material reservado.
2. Desde la carpeta del proyecto, ejecuta (sustituye `TU_USUARIO`):

```sh
git init
git add .
git commit -m "Preparar laboratorio DWEC"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/escape-room-dwec.git
git push -u origin main
```

Si ya existe un repositorio, conserva su historial y remoto; no repitas `git init` ni cambies `origin` a ciegas. Puedes usar GitHub Desktop como alternativa para publicar la carpeta existente. Asegúrate de incluir `.github/workflows/pages.yml`, `package-lock.json` y los archivos de configuración ocultos. `node_modules`, `dist` y `docente` quedan excluidos por `.gitignore`.

3. En GitHub abre **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Abre **Actions**, selecciona “Publicar laboratorio en GitHub Pages” y ejecútalo con **Run workflow** si el primer push ocurrió antes de habilitar Pages.
5. El workflow instala con `npm ci`, ejecuta comprobaciones y tests de navegador, compila y publica **solo `dist`**.
6. Cuando termine en verde, Pages mostrará la dirección final, habitualmente:

```text
https://TU_USUARIO.github.io/escape-room-dwec/
```

7. Abre esa URL en una ventana privada y completa al menos la primera sala. Comparte con los alumnos la URL del sitio, no el enlace del repositorio.

Cada nuevo push a `main` actualiza el sitio. La carpeta del proyecto debe estar en la raíz del repositorio; si la colocas en una subcarpeta, ajusta `working-directory`, `cache-dependency-path` y la ruta del artefacto en el workflow.

**Si falla:** revisa los logs de Actions, comprueba que Pages esté habilitado y permitido por tu organización y que la rama sea `main`. Un 404 de recursos suele indicar que se ha publicado el código fuente o una carpeta equivocada, en lugar del contenido de `dist`.

## 8. Alternativa sencilla: Vercel

1. Sube el proyecto a un repositorio de GitHub, preferiblemente privado si deseas reservar los tests con soluciones.
2. En [Vercel](https://vercel.com/) inicia sesión y selecciona **Add New → Project**.
3. Importa el repositorio y concede los permisos necesarios sobre él.
4. Selecciona **Vite** como framework. La raíz debe ser la carpeta de `package.json`.
5. Comprueba: instalación `npm ci`, construcción `npm run build`, carpeta de salida `dist`; selecciona Node 24 si el panel permite elegir la versión.
6. Pulsa **Deploy** y abre la URL que devuelve Vercel, normalmente un subdominio `*.vercel.app`.
7. Revisa si tu cuenta o equipo tiene protección de despliegues activada. Prueba la URL de producción en una ventana privada antes de enviarla al alumnado; ajusta el acceso según la política de tu centro.

No hacen falta variables de entorno ni base de datos. Los pushes posteriores generan nuevas versiones. Consulta los límites y condiciones del plan elegido antes de usarlo en tu centro. [Guía oficial de Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite).

## 9. Alternativa sin Git: Netlify Drop

1. Ejecuta `npm ci` y `npm run build`, o utiliza el ZIP compilado que acompaña la entrega y extráelo.
2. Abre [Netlify Drop](https://app.netlify.com/drop) e inicia sesión para gestionar el sitio.
3. Arrastra **la carpeta que contiene el `index.html` compilado y `assets/`**, es decir, `dist`. No arrastres la carpeta del código fuente ni `docente`.
4. Netlify facilitará una URL del sitio. Comprueba la visibilidad del proyecto: algunas configuraciones de equipo crean sitios privados. Habilita el acceso previsto y prueba la URL en una ventana privada.
5. Para actualizarlo, compila de nuevo y carga el nuevo `dist` en los despliegues del mismo sitio.

Es una publicación manual: los cambios locales no se suben automáticamente. [Documentación de despliegue manual de Netlify](https://docs.netlify.com/deploy/create-deploys/#deploy-with-drag-and-drop).

## 10. Profesorado y seguridad

Se ha eliminado `PROF_PASSWORD`: una contraseña incrustada en JavaScript no protege nada frente a quien inspeccione el código. Tampoco se ha sustituido por una variable `VITE_PASSWORD`, porque acabaría en la compilación pública.

La información docente de la interfaz describe únicamente el progreso de ese navegador. Las soluciones orientativas están en `docente/` y en los tests de desarrollo, nunca importadas en la aplicación. Esto evita enviarlas en `dist`, pero no equivale a un sistema de autenticación. Un repositorio público o el ZIP completo sí permite consultarlas.

El motor separa la interfaz del código del alumno, limita el tiempo y utiliza una política CSP para bloquear conexiones. **No garantiza aislamiento frente a código hostil ni evaluación antifraude**: el alumno controla su navegador, las pruebas y el almacenamiento son visibles, y el Worker comparte su entorno JavaScript con el código que evalúa. No hay cuota dura de memoria. Lee `SEGURIDAD.md` antes de ampliar su uso.

Para un modo profesor realmente privado se necesita un backend con autenticación y autorización de servidor; para calificar código no confiable, un ejecutor aislado del servidor web, con límites de CPU/memoria/red y pruebas privadas. Esa infraestructura no se simula con una pantalla de contraseña.

## 11. Arquitectura y mantenimiento

```text
src/
  App.tsx                  Flujo, coordinación y presentación del juego
  types.ts                 Contratos TypeScript
  persistence.ts           Esquema, migración, validación e intercambio JSON
  data/rooms.ts            Retos, plantillas, pistas y pruebas públicas
  engine/runner.ts         Iframe, broker, protocolo, cancelación y plazo exterior
  engine/student-worker.js Evaluación aislada y normalización de retornos
  engine/compare.ts        Comparación estructural sin coerciones
  components/Results.tsx   Resultados accesibles
  components/Boundary.tsx  Pantalla de recuperación ante fallo React
  styles.css               Tailwind y estilos del laboratorio
tests/                     Pruebas unitarias y E2E; no van a dist
docente/                   Guía y soluciones privadas por distribución
.github/workflows/        Construcción y publicación
```

Para modificar un reto edita `rooms.ts`: conserva un ID estable, un nombre de función válido, argumentos JSON y resultado esperado. Actualiza plantilla, enunciado, pista, soluciones docentes y tests. Si cambia el contrato, aumenta la versión de persistencia o prepara una migración; no des por válidas las llaves de un reto distinto. La interfaz está pensada expresamente para seis salas; para cambiar su número revisa textos, puntos, validación y pantalla final.

Solo React y React DOM son dependencias de ejecución. Vite, Tailwind, TypeScript, Vitest y Playwright se utilizan en desarrollo. Se han eliminado Framer Motion, Nucleo y los componentes/alias de shadcn que faltaban en el archivo original.

Conserva `package-lock.json`. Revisa actualizaciones de manera deliberada, ejecuta las pruebas y vuelve a comprobar la producción antes de publicar. No uses `npm audit fix --force` sin revisar cambios incompatibles. No cambies la política del iframe para “arreglar” un error de seguridad: consulta primero `SEGURIDAD.md`.

## 12. Solución de problemas

| Síntoma | Qué comprobar |
|---|---|
| `node`/`npm` no se reconoce | Instalar Node LTS, reabrir terminal y comprobar PATH |
| `ENOENT package.json` | Abrir terminal en la carpeta correcta; extraer el ZIP |
| `npm ci` no coincide con el bloqueo | Usar el lock incluido; después de editar dependencias ejecutar `npm install` |
| npm 10 antiguo falla con `edgesOut` | Actualizar a Node 24 LTS y su npm; no ejecutar el juego con una instalación incompleta |
| Página vacía por `file://` | Usar `npm run dev`, `preview` o una URL HTTP(S) |
| Puerto ocupado | Usar el puerto que indique Vite o `npm run dev -- --port 5174` |
| El editor no encuentra la función | Mantener el nombre, no escribir TypeScript/imports ni `export` |
| Pruebas devuelven `undefined` | Comprobar `return`, no solo `console.log` |
| Tiempo agotado | Revisar condición de salida de bucles y recursión |
| Motor bloqueado | Navegador moderno, HTTP(S), extensiones/políticas del centro y CSP del alojamiento |
| No guarda | No usar modo privado; permitir almacenamiento o exportar JSON |
| El alumno ve la versión antigua | Esperar el despliegue, recargar y verificar la URL publicada |

## Referencias oficiales

Guías consultadas el 29/09/2026; los paneles y planes de alojamiento pueden cambiar:

- [Vite: instalación y requisitos](https://vite.dev/guide/).
- [Vite: despliegue estático, GitHub Pages, Vercel y Netlify](https://vite.dev/guide/static-deploy).
- [Tailwind: integración con Vite](https://tailwindcss.com/docs/installation/using-vite).
- [MDN: iframe y sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe).
- [MDN: Content Security Policy y herencia en Workers blob](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy).
