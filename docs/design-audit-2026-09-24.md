# Auditoría visual · 24 de septiembre de 2026

Revisión en navegador, con permiso expreso de Odín para esta tarea: Chrome a 2552 px (su monitor 4K al 150 %), 1440 px y 390 px, en los temas por defecto, amber y realworld. Se conserva la identidad CRT/fósforo.

## Hallazgos y cambios

| Área | Hallazgo | Cambio |
| --- | --- | --- |
| Cabecera | La cabecera `sticky` se desplazaba con la página: `overflow-x: hidden` en `html` y `body` convertía `body` en contenedor de desplazamiento. La barra de progreso y la sección activa nunca se veían. | `body` usa `overflow-x: clip`. Los bloqueos de desplazamiento de los modales pasan a `<html>`. |
| Cascada CSS | `.pill`, `.frame` y `a {}` estaban fuera de capas y anulaban utilidades de Tailwind: «☰ MENU» visible en escritorio, «/ CMD» en móvil, enlaces del menú subrayados y en verde, toast con `position: relative` al principio del documento, modales translúcidos. | `a` en `@layer base`; `.pill` y `.frame` en `@layer components`. El menú queda atenuado y la sección activa se resalta. |
| Nombre | Espacio extra en «ODÍN .» antes del punto del easter egg. | Sin espacio entre la última letra y el botón. |
| Estado | Doble cursor: «DISPONIBLE_» más el cursor parpadeante. | Solo el cursor. |
| 4K | Tamaños en px (13, 11 y 10 px) no escalaban con el escalado por `rem` a partir de 1920 px; la experiencia se veía diminuta. | Conversión a `rem`, idéntica por debajo de 1920 px. |
| Experiencia | Columnas desalineadas entre filas. | Rejilla de columnas fijas en escritorio; el detalle se alinea con el host. |
| Proyectos | Estado desplazado bajo el título cuando la organización es larga; enlaces con URL completa (`login?from=%2F`). | Cabecera flexible con el estado arriba a la derecha; el enlace muestra solo el host. |

## Arcade: ANOMALY

Sustituye a Snake. Juego de supervivencia estilo *Vampire Survivors*: eres la anomalía (`@`); fragmentos de código en katakana, glitches, daemons, agentes y sentinels convergen. Los comandos (`ping`, `fork()`, `firewall`, `grep -r`, `rm -rf`, `| pipe`) disparan solos; los módulos (`overclock`, `sudo`, `ram++`, `cache`, `nice`, `patch`, `threads`) mejoran estadísticas. Objetivo: sobrevivir 10:00, con jefes a 5:00 y 8:00 y una purga final.

- Controles: WASD/flechas, mando, arrastre táctil; Esc/P/Espacio pausa; 1-2-3 elige mejora; modo pantalla completa.
- Se pausa al salir de la vista, cambiar de pestaña, perder el foco o abrir otro overlay. Movimiento reducido: sin vibración ni destellos.
- Validación: simulación sin interfaz (`node scripts/anomaly-sim.ts`) en varias semillas y niveles de habilidad, más partidas guiadas en Chrome (escritorio, móvil, inglés, realworld).
