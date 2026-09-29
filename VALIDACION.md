# Validación de la entrega

Comprobaciones realizadas entre el 29 y el 30 de septiembre de 2026 en Windows, Node 22.12.0, npm 10.9.0 y Chrome 154.0.8037.59. La guía recomienda Node 24 LTS para nuevas instalaciones. Posteriormente se ha configurado la publicación real en GitHub Pages desde la rama `gh-pages`; consulta la URL y configuración al principio del README.

| Comprobación | Resultado |
|---|---|
| Instalación limpia con `npm ci` y el lockfile entregado | Correcta |
| Auditoría de dependencias tras la instalación | 0 vulnerabilidades conocidas notificadas |
| Tests unitarios, `npm run test` | 16 correctos |
| Tipos estrictos y build, `npm run build` | Correctos |
| Tests E2E en Chrome, `npm run test:e2e` con `PW_CHANNEL=chrome` | 8 correctos |
| Recorrido completo de las seis salas | Las 34 pruebas didácticas pasan con soluciones de referencia |
| Producción servida desde `/laboratorio/`, simulando una subcarpeta Pages | Carga y primera sala correctas |
| Vista de producción a 1440 px y 360 px | Revisada visualmente; sin desbordamiento horizontal a 360 px |
| Errores JavaScript de página durante el recorrido breve de producción | Ninguno |
| Contraseña original y solución completa de la sala 1 en el bundle | No presentes |

Los E2E verifican errores de sintaxis, función ausente, retornos undefined/circulares, bucle infinito y recuperación, cancelación, limpieza del iframe, invalidación de resultados al editar, congelación del final tras recargar, exportación/importación, rechazo de archivos inválidos, reinicio confirmado, guardado corrupto/bloqueado, persistencia de borradores y navegación con Tab. La prueba del motor comprueba ausencia de DOM/almacenamiento de ventana y rechazo de una petición XHR desde el Worker.

Versiones resueltas por `package-lock.json`: React/React DOM 19.3.0, Vite 7.3.6, TypeScript 5.9.3, Tailwind 4.3.3, Vitest 4.1.11 y Playwright 1.63.0. Se sustituyó una versión anterior de Vitest tras detectar un aviso de seguridad. El instalador npm 10 falló al resolver esa actualización; se generó el lock con npm 11 y después se verificó `npm ci` correctamente con npm 10.9.0.

Estas comprobaciones no son una auditoría de seguridad ni certifican WCAG. No se ha verificado manualmente con Safari, Firefox, lectores de pantalla ni dispositivos móviles físicos; la vista móvil se probó en Chrome con viewport de 360 px. No se ha ejecutado el workflow personalizado de pruebas en GitHub ni se ha desplegado en Vercel/Netlify. La publicación de GitHub Pages utiliza el proceso de Pages asociado a la rama `gh-pages`.

Para repetir las pruebas:

```sh
npm ci
npm run check
npx playwright install chromium
npm run test:e2e
```
