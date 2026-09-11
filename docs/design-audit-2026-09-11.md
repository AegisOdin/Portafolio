# Auditoría de diseño · 11 de septiembre de 2026

Auditoría realizada mediante lectura de páginas, estilos y componentes. La revisión visual en el navegador la realiza Odín, por petición expresa. No se abrieron navegadores ni se tomaron capturas.

## Dirección

Conservar la terminal CRT y hacer que el contenido profesional sea más fácil de recorrer. El elemento protagonista es un núcleo geométrico 3D; el resto de la página reduce la decoración para darle espacio.

- Paleta: fondo `#0a0e0a`, superficie `#0f140f`, fósforo `#39ff14`, ámbar `#ffb000`, texto `#c8ffb6`, secundario `#8a9e83`.
- Tipografía: VT323 para nombre y títulos; JetBrains Mono para contenido y controles. Se conserva el cambio tipográfico del tema realworld.
- Composición: presentación a la izquierda y núcleo 3D a la derecha; en móvil, lectura vertical. Proyecto destacado con esquema de arquitectura, experiencia desplegable, habilidades sin marcos repetidos y una pausa arcade antes del contacto.
- Movimiento: respuesta al scroll y al puntero; capas de fondo con velocidades distintas. El juego empieza con una acción del visitante. Se conserva una vista estática con movimiento reducido.

## Hallazgos y cambios

| Área | Hallazgo en el código | Cambio aplicado |
| --- | --- | --- |
| Presentación | El nombre reservaba espacio para un modelo que ya no se renderizaba; la descripción podía recortarse con nowrap. | Composición en columnas con núcleo CSS 3D propio, nombre ajustado a su columna y descripción que admite saltos. |
| Jerarquía | Los h2 existían únicamente para lectores de pantalla; los visitantes veían comandos pequeños. | Títulos de sección visibles y comandos como contexto secundario. |
| Ritmo | Márgenes amplios idénticos y marcos luminosos en casi todos los bloques. | Espaciado más compacto, sombras suaves y categorías de habilidades abiertas. |
| Proyectos | El primer proyecto solo se diferenciaba por su ancho. | Composición destacada con esquema Nuxt/Vue → Strapi/Socket.io → MySQL/S3 basado en el stack existente. |
| Experiencia | Todos los detalles estaban cerrados inicialmente. | Primera experiencia abierta, áreas de interacción más amplias y listas más legibles. |
| Temas | Amber/magenta cambiaban el acento pero dejaban títulos y botones verdes. El texto secundario realworld era demasiado oscuro. | Color fósforo coherente con el tema y mayor contraste secundario. |
| Navegación | La cabecera tenía poco margen en tablet y controles pequeños. | Menú compacto hasta escritorio, marca abreviada en móvil, controles de 44 px, sección activa y progreso de lectura. |
| Profundidad | No había una pieza 3D activa en la página. | Cubo de seis caras y núcleo interno, órbitas y suelo en perspectiva, giro con scroll y paralaje de fondo. Sin nuevas dependencias. |
| Juego | No existía una experiencia jugable visible. | Snake en SVG con teclado y controles táctiles, puntuación, récord local opcional, dificultad progresiva y pausa automática. |
| Contacto | Captcha sin etiqueta asociada; patrón con escape duplicado y error borrado inmediatamente; campos pequeños en móvil. | Etiqueta, patrón corregido, error anunciado y persistente, texto en español/inglés, campos de 16 px y textarea ajustable. |
| Ventanas | Foco sin contener; controles Matrix con demora y contenido móvil recortable. | Diálogos con foco/restauración, fondo inerte, desplazamiento móvil y controles disponibles inmediatamente. |
| Acceso a proyectos | Cuenta regresiva obligatoria y posible navegación duplicada al abrir con noopener. | Enlace nativo inmediato a otra pestaña; la secuencia visual queda como acompañamiento. |
| Movimiento y robustez | Parpadeo continuo de toda la pantalla; boot/overlays con temporizadores y almacenamiento sin protección completa. | Textura CRT estática, movimiento reducido respetado, almacenamiento protegido y pausa/limpieza de animaciones. |
| Impresión y 404 | Elementos interactivos imprimibles y enlace de salto sin destino en 404. | Decoración/juego/formulario excluidos de impresión; destino del enlace de salto corregido. |

## Entrega y validación

Se conservan los datos profesionales, enlaces, CV, formulario FormSubmit, idiomas y easter eggs. Se respetan las modificaciones locales previas y el escalado a pantallas grandes.

La validación técnica comprende `pnpm build`, `pnpm lint` y comprobación TypeScript estricta de los scripts cliente extraídos en memoria (sin instalar dependencias ni escribir archivos generados). No constituye una validación visual ni una partida probada en un navegador. La preferencia de revisión manual queda guardada en `agents.md`.

## Ajustes a partir de las capturas de Odín

- Matrix: se sustituyen el retrato ASCII y el diálogo largo por una pregunta central y dos elecciones con imágenes generadas, descripciones, atajos y estados ES/EN. Se conserva el cambio entre simulación y realworld, la lluvia de código tenue, Escape y la gestión del foco.
- Imágenes: originales en `src/assets/pill-blue.png` y `src/assets/pill-red.png`. Prompts completos y procedencia en `docs/matrix-image-prompts.json`. Se usó la herramienta integrada image_gen, que no expone selección ni confirmación de versión del modelo. Astro genera derivados WebP de distintos tamaños; se añadió Sharp para ello.
- Spa Be Perfect en móvil: `.project-copy` tenía `height: 100%`, por lo que el esquema siguiente desbordaba la tarjeta. Se elimina esa altura y se utiliza una cuadrícula de una columna, con dos columnas solo en escritorio.
- Skills: listas semánticas con dos columnas internas constantes. Ya no heredan los estilos de `.pill` del tema realworld. Se ajustan también títulos y superficies del tema alternativo.
- Cubo: escucha `pointermove` y `pointerleave` en todo `#hero`, conservando las restricciones de puntero fino, movimiento reducido y visibilidad.

Validación de esta revisión: compilación con derivados WebP, lint y diez scripts cliente comprobados con TypeScript estricto. Revisión visual pendiente del usuario; no se abrió el navegador.

## Centinela 3D de la página alternativa

- Modelo procedural con Three.js: carcasa segmentada, respiraderos, 13 lentes rojas y diez tentáculos con 480 anillos instanciados y pinzas. Código en `src/lib/sentinel.ts`.
- Aparece en `realworld` (píldora roja), en el espacio del cubo y detrás del contenido. Emerge al entrar, orienta el cuerpo según el cursor y se aleja en profundidad al recorrer la página; los tentáculos acompañan el desplazamiento. El cubo se conserva en la simulación y como alternativa si WebGL falla.
- Carga diferida de Three.js, resolución limitada, menor presencia en móvil, animación por demanda y pausa al ocultar la pestaña. Movimiento reducido muestra una composición estática. Sin interceptar clics ni desplazar el contenido.
- Validación: lint, compilación de producción, once scripts cliente y sus módulos con TypeScript estricto sin diagnósticos; geometría finita y articulación en quince combinaciones de scroll/cursor. La apariencia y la interacción en navegador quedan pendientes de la revisión del usuario.
