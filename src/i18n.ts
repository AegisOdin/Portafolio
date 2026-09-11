// Bilingual strings. Values can contain HTML — applied via innerHTML.
// Keys mirror the data-i18n attribute on each element.

export type Lang = "es" | "en";

export const i18n: Record<Lang, Record<string, string>> = {
  es: {
    "matrix.close": "Cerrar escena",
    "matrix.channel": "Morpheus tiene una pregunta.",
    "matrix.title": "¿Hasta dónde quieres llegar?",
    "matrix.description": "Dos formas de ver el mismo mundo. Elige la tuya.",
    "matrix.blueMode": "La simulación",
    "matrix.redMode": "El mundo real",
    "matrix.blue": "Píldora azul",
    "matrix.red": "Píldora roja",
    "matrix.blueStay": "Quédate en la terminal. Todo sigue como lo conoces.",
    "matrix.blueReturn": "Regresa a la terminal. Vuelve al verde fósforo.",
    "matrix.redEnter": "Sal de la simulación. Descubre el otro lado del portafolio.",
    "matrix.redStay": "Quédate en el mundo real. Sigue explorando este lado.",
    "matrix.blueAction": "Elegir azul ↗",
    "matrix.redAction": "Elegir roja ↗",
    "matrix.return": "Siempre puedes volver a elegir.",
    "matrix.hint": "Elige una píldora o usa ← / →",
    "matrix.blueSelected": "Azul elegida. Entrando en la simulación…",
    "matrix.redSelected": "Roja elegida. Entrando en el mundo real…",
    "hero.statement": "De la primera interfaz al último despliegue. Construyo aplicaciones que ya están en uso.",
    "hero.explore": "Explora el portafolio",
    "projects.architecture": "Así se conecta el proyecto",
    "projects.interface": "Interfaz",
    "projects.data": "Datos y archivos",
    "arcade.heading": "Fuera del código",
    "arcade.lead": "Un descanso. Una partida.",
    "arcade.description": "También hay espacio para jugar. Lleva la señal hasta el siguiente paquete, crece y evita cruzarte contigo mismo. El clásico Snake, en fósforo.",
    "arcade.instructions": "Usa las flechas, WASD o los controles en pantalla. Tu récord se guarda en este navegador. Al salir del juego, la partida se pausa.",
    "arcade.contact": "¿Seguimos con tu proyecto?",
    "contact.intro": "¿Tienes un proyecto en mente o un equipo al que podría sumarme? Cuéntame qué estás construyendo.",
    "contact.from": "Tu correo",
    "contact.subject": "Asunto",
    "contact.message": "Mensaje",
    "contact.challenge": "Resuelve la operación",
    "contact.refresh": "↻ Cambiar",
    "contact.tooFast": "Espera unos segundos y vuelve a enviar.",
    "contact.wrong": "La respuesta no coincide. Prueba con esta nueva operación.",
    "nav.cmd": "/ cmd",
    "hero.tag": "⟶ INIT_PROFILE · v2026",
    "hero.subtitle":
      '<span class="sigil">&gt;</span> Desarrollador Full Stack. Morelia, MX. Estado: <span class="text-[var(--color-phosphor)] glow caret" data-i18n="hero.status">DISPONIBLE_</span>',
    "hero.status": "DISPONIBLE_",
    "hero.btnProjects": "▸ ls proyectos",
    "hero.btnCv": "▼ descargar cv.pdf",
    "hero.btnHire": "$ sudo contrátame",
    "hero.scroll": 'desplaza ↓ &nbsp;o pulsa <kbd class="pill !py-[1px]">/</kbd>',

    "about.heading": "Sobre mí",
    "projects.heading": "Proyectos",
    "experience.heading": "Experiencia",
    "skills.heading": "Habilidades",
    "contact.heading": "Contacto",

    "about.label": "/etc/identidad",
    "about.p1":
      'Desarrollador <strong class="text-[var(--color-phosphor)] glow-soft">Full Stack</strong> con experiencia construyendo aplicaciones web de extremo a extremo — desde la interfaz hasta la infraestructura. Estudiante de <em>Ingeniería en Sistemas Computacionales</em> en el Instituto Tecnológico de Morelia (2021–2026).',
    "about.p2":
      'Bases sólidas en <span class="pill">JavaScript</span> <span class="pill">TypeScript</span>, ecosistemas <span class="pill">Vue · Nuxt</span>, <span class="pill">Next.js</span> y <span class="pill">Laravel · Node</span>. Cómodo en entornos híbridos y remotos, trabajando con equipos distribuidos.',
    "about.p3":
      "// actualmente en Tekniu · Spa Be Perfect en producción · una promesa: enviar código que funcione.",

    "projects.label": "3 ítems",

    "proj-0-role": "Full Stack · autónomo",
    "proj-0-period": "nov 2025 — ago 2026",
    "proj-0-summary":
      "App de gestión operativa para clínica de medicina estética. Frontend Nuxt/Vue, backend Strapi v5/TS, tiempo real con Socket.io, almacenamiento en AWS S3 y MySQL.",

    "proj-1-role": "Full Stack · remoto",
    "proj-1-period": "ene 2026 — jun 2026",
    "proj-1-summary":
      "Sistema institucional para centralizar inscripciones, gestión de grupos y seguimiento de alumnos del Centro de Lenguas. Frontend reactivo con Livewire y backend en Laravel.",

    "proj-2-role": "Becario Dev · híbrido",
    "proj-2-period": "mar 2026 — actualidad",
    "proj-2-summary":
      "Sitio interno para consultar la documentación de los repositorios de Tekniu. Frontend y backend desarrollados en TypeScript, con Next.js en el frontend.",

    "experience.label": "3 entradas",

    "exp-tekniu-date": "[mar 2026 — actualidad]",
    "exp-tekniu-mode": "Híbrido · Jornada parcial",
    "exp-tekniu-title": "Becario de Desarrollo Web",
    "exp-tekniu-b0":
      "Soluciones full stack en consultora especializada en Odoo ERP para PyMEs mexicanas e internacionales.",
    "exp-tekniu-b1":
      "Desarrollo de Wiki Tekniu para consultar la documentación de los repositorios de la empresa, con TypeScript en frontend y backend y Next.js en el frontend.",
    "exp-tekniu-b2":
      "Implementación y personalización de módulos ERP, integración con servicios externos y mantenimiento de infraestructura Linux.",

    "exp-itm-date": "[ene 2026 — jun 2026]",
    "exp-itm-mode": "Remoto · Temporal",
    "exp-itm-title": "Programador Full Stack",
    "exp-itm-b0":
      "Desarrollo del sistema SIM-CLE para el Depto. de Idiomas, frontend y backend.",
    "exp-itm-b1":
      "Centralización del control de inscripciones, grupos y seguimiento de alumnos.",

    "exp-flama-date": "[nov 2025 — ago 2026]",
    "exp-flama-mode": "Remoto · Autónomo",
    "exp-flama-title": "Programador Full Stack",
    "exp-flama-b0":
      "Desarrollo integral de webapp de gestión operativa para Spa Be Perfect (medicina estética).",
    "exp-flama-b1":
      "Frontend Nuxt/Vue, backend Strapi v5/TS, integración AWS S3, tiempo real con Socket.io y base de datos MySQL.",
    "exp-flama-b2": "Proyecto en producción: appbeperfect.com",

    "skills.Frontend": "Frontend",
    "skills.Backend": "Backend",
    "skills.Databases": "Bases de datos",
    "skills.DevOps": "DevOps / Cloud",
    "skills.Vcs": "Control de versiones",
    "skills.Other": "Otros",

    "contact.bodyPlaceholder": "// escribe tu mensaje — pulsa enviar",
    "contact.subjectPlaceholder": "re: rol full-stack",
    "contact.send": "▶ Enviar mensaje",
    "contact.cvLabel": "currículum",
    "contact.cvMeta": "54 KB · PDF · ES",
    "contact.locked": "// bloqueado",

    "footer.built": "construido con astro + tailwind",
    "lang.toggle": "EN",
  },
  en: {
    "matrix.close": "Close scene",
    "matrix.channel": "Morpheus has a question.",
    "matrix.title": "How far do you want to go?",
    "matrix.description": "Two ways to see the same world. Choose yours.",
    "matrix.blueMode": "The simulation",
    "matrix.redMode": "The real world",
    "matrix.blue": "Blue pill",
    "matrix.red": "Red pill",
    "matrix.blueStay": "Stay in the terminal. Everything remains as you know it.",
    "matrix.blueReturn": "Return to the terminal. Back to phosphor green.",
    "matrix.redEnter": "Leave the simulation. Discover the other side of the portfolio.",
    "matrix.redStay": "Stay in the real world. Keep exploring this side.",
    "matrix.blueAction": "Choose blue ↗",
    "matrix.redAction": "Choose red ↗",
    "matrix.return": "You can always choose again.",
    "matrix.hint": "Choose a pill or press ← / →",
    "matrix.blueSelected": "Blue selected. Entering the simulation…",
    "matrix.redSelected": "Red selected. Entering the real world…",
    "hero.statement": "From the first interface to the last deployment. I build applications people already use.",
    "hero.explore": "Explore the portfolio",
    "projects.architecture": "How the project connects",
    "projects.interface": "Interface",
    "projects.data": "Data and files",
    "arcade.heading": "Beyond the code",
    "arcade.lead": "Take a break. Play a round.",
    "arcade.description": "There is room to play, too. Guide the signal to the next packet, grow and avoid crossing your own path. Classic Snake, in phosphor.",
    "arcade.instructions": "Use the arrows, WASD or the on-screen controls. Your record stays in this browser. The game pauses when you leave it.",
    "arcade.contact": "Shall we talk about your project?",
    "contact.intro": "Have a project in mind or a team I could join? Tell me what you are building.",
    "contact.from": "Your email",
    "contact.subject": "Subject",
    "contact.message": "Message",
    "contact.challenge": "Solve the calculation",
    "contact.refresh": "↻ Change",
    "contact.tooFast": "Wait a few seconds and send again.",
    "contact.wrong": "That answer does not match. Try this new calculation.",
    "nav.cmd": "/ cmd",
    "hero.tag": "⟶ INIT_PROFILE · v2026",
    "hero.subtitle":
      '<span class="sigil">&gt;</span> Full Stack developer. Morelia, MX. Status: <span class="text-[var(--color-phosphor)] glow caret" data-i18n="hero.status">AVAILABLE_</span>',
    "hero.status": "AVAILABLE_",
    "hero.btnProjects": "▸ ls projects",
    "hero.btnCv": "▼ download cv.pdf",
    "hero.btnHire": "$ sudo hire-me",
    "hero.scroll": 'scroll ↓ &nbsp;or press <kbd class="pill !py-[1px]">/</kbd>',

    "about.heading": "About",
    "projects.heading": "Projects",
    "experience.heading": "Experience",
    "skills.heading": "Skills",
    "contact.heading": "Contact",

    "about.label": "/etc/identity",
    "about.p1":
      '<strong class="text-[var(--color-phosphor)] glow-soft">Full Stack</strong> developer building end-to-end web applications — from interface to infrastructure. <em>Computer Systems Engineering</em> student at Instituto Tecnológico de Morelia (2021–2026).',
    "about.p2":
      'Strong foundations in <span class="pill">JavaScript</span> <span class="pill">TypeScript</span>, <span class="pill">Vue · Nuxt</span>, <span class="pill">Next.js</span> and <span class="pill">Laravel · Node</span> ecosystems. Comfortable in hybrid and remote setups with distributed teams.',
    "about.p3":
      "// currently at Tekniu · Spa Be Perfect in production · one promise: ship code that works.",

    "projects.label": "3 items",

    "proj-0-role": "Full Stack · freelance",
    "proj-0-period": "Nov 2025 — Aug 2026",
    "proj-0-summary":
      "Operations management app for an aesthetic medicine clinic. Nuxt/Vue frontend, Strapi v5/TS backend, real-time via Socket.io, AWS S3 storage and MySQL.",

    "proj-1-role": "Full Stack · remote",
    "proj-1-period": "Jan 2026 — Jun 2026",
    "proj-1-summary":
      "Institutional system to centralize enrollment, group management and student tracking for the Language Center. Reactive frontend with Livewire and a Laravel backend.",

    "proj-2-role": "Dev Intern · hybrid",
    "proj-2-period": "Mar 2026 — present",
    "proj-2-summary":
      "Internal site for consulting documentation for Tekniu repositories. Frontend and backend developed in TypeScript, with Next.js on the frontend.",

    "experience.label": "3 entries",

    "exp-tekniu-date": "[Mar 2026 — present]",
    "exp-tekniu-mode": "Hybrid · Part-time",
    "exp-tekniu-title": "Web Development Intern",
    "exp-tekniu-b0":
      "Full stack solutions at a consultancy specialized in Odoo ERP for Mexican and international SMBs.",
    "exp-tekniu-b1":
      "Development of Wiki Tekniu for consulting documentation for company repositories, with TypeScript on the frontend and backend and Next.js on the frontend.",
    "exp-tekniu-b2":
      "Implementation and customization of ERP modules, integration with external services and Linux infrastructure maintenance.",

    "exp-itm-date": "[Jan 2026 — Jun 2026]",
    "exp-itm-mode": "Remote · Temporary",
    "exp-itm-title": "Full Stack Developer",
    "exp-itm-b0":
      "Built the SIM-CLE system for the Languages Department — frontend and backend.",
    "exp-itm-b1":
      "Centralized enrollment, group management and student tracking.",

    "exp-flama-date": "[Nov 2025 — Aug 2026]",
    "exp-flama-mode": "Remote · Freelance",
    "exp-flama-title": "Full Stack Developer",
    "exp-flama-b0":
      "End-to-end webapp development for Spa Be Perfect operations (aesthetic medicine).",
    "exp-flama-b1":
      "Nuxt/Vue frontend, Strapi v5/TS backend, AWS S3 integration, real-time via Socket.io and a MySQL database.",
    "exp-flama-b2": "In production: appbeperfect.com",

    "skills.Frontend": "Frontend",
    "skills.Backend": "Backend",
    "skills.Databases": "Databases",
    "skills.DevOps": "DevOps / Cloud",
    "skills.Vcs": "Version control",
    "skills.Other": "Other",

    "contact.bodyPlaceholder": "// write your message — hit send",
    "contact.subjectPlaceholder": "re: full-stack role",
    "contact.send": "▶ Send message",
    "contact.cvLabel": "resume",
    "contact.cvMeta": "54 KB · PDF · Spanish",
    "contact.locked": "// locked",

    "footer.built": "built with astro + tailwind",
    "lang.toggle": "ES",
  },
};
