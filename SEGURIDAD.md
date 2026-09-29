# Seguridad y límites del motor

## Objetivo

Hacer más robusta una actividad de práctica en el navegador y proteger la interfaz de errores habituales. No es un servicio de ejecución para adversarios ni una plataforma de evaluación verificable.

## Capas implementadas

1. React presenta el editor y las pruebas; no evalúa el código del alumno en su ventana.
2. Cada ejecución crea un iframe `srcdoc` con `sandbox="allow-scripts"`. No se habilitan origen compartido, formularios, popups, descargas ni navegación superior.
3. El iframe tiene origen opaco. Su broker crea un Worker de una URL blob y envía el código como datos, sin insertarlo en HTML.
4. La CSP del iframe usa `default-src 'none'`, `connect-src 'none'`, `worker-src blob:` y permite únicamente lo necesario para el arranque y la compilación dinámica. Los Workers blob heredan la política de su documento propietario en los navegadores compatibles.
5. `new Function` solo aparece en el Worker. No tiene DOM ni `localStorage` de la aplicación. Los argumentos se clonan antes de cada prueba.
6. El broker termina el Worker al recibir su respuesta, en caso de error o tras 2 segundos. La ventana principal tiene una guardia de 5 segundos y cancelación. Se retira el iframe y se eliminan listeners/timers. Un fallo del sandbox no activa una ejecución alternativa en el hilo principal.
7. La ventana comprueba fuente (`event.source`), origen opaco, fase del protocolo, tamaño, forma y número de resultados. Los valores esperados permanecen en la ventana principal; esta calcula la comparación.
8. Se limita código a 20.000 caracteres; retornos a 1.000 nodos, profundidad 12, arrays de 500 elementos, objetos de 100 propiedades, strings de 4.000 caracteres y serialización de 12.000 caracteres por caso. El protocolo acepta hasta 100.000 caracteres. Se rechazan tipos no JSON y números no finitos.
9. React representa los mensajes como texto, sin `dangerouslySetInnerHTML`. Una salida que contenga HTML no se interpreta como marcado.

`postMessage` utiliza `'*'` hacia el iframe porque su origen es opaco. No se confía solo en el contenido del mensaje: se comprueba también la ventana de procedencia. El broker acepta mensajes únicamente de `parent`.

## Lo que NO garantiza

- **No evita trampas.** Pruebas, código de cliente, llaves y almacenamiento son inspeccionables. El usuario puede falsear resultados o modificar el progreso.
- **No es un compartimento JavaScript seguro dentro del Worker.** Alumno y evaluador comparten globales/prototipos del Worker. Código deliberado puede alterar APIs, generar mensajes o perturbar la normalización. Comparar en la ventana reduce accidentes, pero no proporciona integridad frente al propietario del navegador.
- **No limita duramente la memoria.** Un Worker puede solicitar mucha memoria o crear trabajo antes de ser cancelado; el navegador puede ralentizarse o cerrarse. Los límites de salida operan después de que exista el valor y no impiden su asignación previa.
- **No constituye una garantía universal de bloqueo de red.** La CSP bloquea las vías estándar en navegadores compatibles; no debe tratarse como una barrera suficiente contra todos los canales, fallos del navegador o extensiones. No ejecutar código hostil junto a secretos.
- El plazo mide tiempo de pared y cubre la ejecución completa, no cada prueba. Pestañas suspendidas, dispositivos lentos o políticas del centro pueden retrasar eventos y provocar falsos timeouts.
- No se implementan autenticación, autorización, anticopia, servidor de entregas, supervisión del grupo ni protección de los tests de un repositorio público.
- No se guardan credenciales en variables `VITE_*`: esas variables son públicas en una compilación de cliente.

## Despliegue

Publica únicamente `dist` por HTTPS en un sitio dedicado a esta actividad. No copies `docente`, tests, archivos personales ni claves a `public`. No incorpores login sensible, tokens o información personal al motor de práctica.

La aplicación no envía entregas ni incorpora analítica. El alojamiento puede registrar accesos HTTP. El progreso se almacena en el dispositivo; informa al alumnado sobre equipos compartidos y exportación.

Si el centro aplica una CSP a toda la página, prueba su interacción con `srcdoc` y el Worker. Una CSP heredada más restrictiva puede impedir el arranque: añadir una segunda política no relaja la primera. No resuelvas ese caso añadiendo `allow-same-origin`, evaluando código en React o deshabilitando toda la protección. Para políticas institucionales estrictas, sirve un ejecutor dedicado en un origen separado y revisa su diseño de seguridad.

## Para evaluación real

Usa autenticación y autorización en servidor, soluciones/pruebas privadas y un ejecutor separado del servidor de la aplicación. Aísla cada trabajo con límites efectivos de CPU, memoria, procesos, tiempo y red, sin credenciales de infraestructura y con almacenamiento efímero. Añade cuotas, auditoría, mantenimiento y revisión especializada. Un contenedor por sí solo no completa esas garantías.

## Referencias

- [MDN: iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe).
- [MDN: CSP y Workers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy).
- [MDN: política de mismo origen](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy).

No se afirma una certificación de seguridad ni conformidad formal de accesibilidad.
