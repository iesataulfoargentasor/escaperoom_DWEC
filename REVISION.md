# Revisión del TSX original y cambios de la versión 2

Se ha leído el archivo `escape-room-javascript-laboratorio-dwec.tsx` recuperado de la conversación de origen. Esta entrega reconstruye su aplicación como proyecto independiente; no es solamente un parche del componente.

| Hallazgo en el original | Cambio implementado | Alcance |
|---|---|---|
| `new Function` se ejecutaba en el hilo de la interfaz | Worker desechable dentro de iframe con `sandbox="allow-scripts"`, sin `allow-same-origin` | La UI sigue operativa ante un bucle infinito ordinario |
| Sin plazo ni cancelación | Límite de 2 s para la ejecución completa, guardia externa de 5 s y botón Cancelar | No es una cuota dura de CPU/memoria |
| Contraseña `profedaw` y soluciones en el bundle | Eliminada la contraseña; soluciones fuera de `src`/`public` | Repositorio/tests y ZIP completo pueden revelar soluciones |
| “Estado del grupo” mostraba solo datos locales | Información docente explícitamente local | Sin seguimiento de alumnos en servidor |
| Dependencias externas y alias no suministrados | Proyecto íntegro con React, Vite, TS y Tailwind; controles HTML nativos | No requiere librerías de iconos ni componentes privados |
| JSON leído mediante un cast de TypeScript | Validación de versión, tipos, límites, IDs, fechas y progresión | Exportaciones manipulables; validación no implica autenticidad |
| Fallos de almacenamiento silenciosos | Aviso visible; exportación/importación con confirmación | No hay sincronización ni copia remota |
| Cronómetro sin final persistente | `finishedAt` persistido al superar la sexta sala | Incluye pausas, no mide atención efectiva |
| Resultados antiguos al cambiar código | Se descartan los resultados de esa sala al editar | Se conserva la llave y se indica que corresponde a un éxito anterior |
| Reinicio sin confirmación | Confirmación nativa para reinicio y restauración de plantilla | Diálogos del navegador accesibles por teclado |
| Editor sin etiqueta | `label`, instrucciones, atajo y tabulación sin trampa de foco | Textarea sencillo, no IDE ni resaltador de sintaxis |
| Éxitos/errores comunicados sobre todo con colores | Texto de estado, `role=status`, alertas, foco al navegar y nombres de controles | No sustituye una auditoría formal con lectores de pantalla |
| Animaciones y capas modales complejas | Feedback en la página, sin sacudidas ni overlays de premio | Compatibilidad con reducción de movimiento |
| Estrellas castigaban pistas e intentos | 100 puntos por sala, sin penalizar la ayuda | Recompensa de progreso; no nota de competencia |
| Comparación parcial de retornos | Igualdad estructural JSON, orden de arrays y tipos estrictos | Números exactos, apropiados para estos retos |
| Retornos arbitrarios/circulares | Normalización y límites de salida dentro del Worker | Salidas no JSON producen mensajes claros |
| Casos de prueba poco variados | Negativos, cero, Unicode, vacíos y booleanos estrictos | 34 pruebas públicas en total |
| Poca reproducibilidad | Lockfile, tests, build y workflow Pages | Guía de despliegue y material docente |

## Decisiones didácticas

Se conservan las seis funciones, la narrativa de laboratorio, las letras `E S C A P A` y el desbloqueo secuencial. La inversión de cadenas se define por puntos de código Unicode. Los objetos mágicos y exploradores requieren `=== true`, coherente con los enunciados. La media redondea hacia menos infinito, no hacia cero.

Los tests muestran argumentos completos y resultados esperados. No son secretos: facilitan comprender el contrato, pero un alumno puede codificar respuestas específicas. La actividad es formativa. Se recomienda añadir explicación oral y nuevas pruebas al evaluar.

## Comprobaciones reproducibles

Consulta `VALIDACION.md` para los resultados ejecutados durante la entrega. Las pruebas de regresión cubren esquema y migración, comparación, resolución de las seis salas, errores y valores no válidos, bucles, cancelación, recarga, teclado, vista móvil y restricciones del Worker. `npm run check` y `npm run test:e2e` permiten repetirlas.

## Extensiones razonables para otro proyecto

Autenticación real del profesorado, gestión de aulas, entregas verificadas, sincronización y ejecución en servidor requieren una arquitectura de backend. No se han añadido servicios o contraseñas ficticias para aparentar esas garantías. Tampoco se incluye un IDE pesado, una clasificación pública ni telemetría innecesaria para el objetivo de DWEC.
