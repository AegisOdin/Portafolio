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
    "hero.statement": "Desarrollo aplicaciones de extremo a extremo para automatizar procesos de negocio: interfaces, APIs, datos y despliegue.",
    "hero.explore": "Explora el portafolio",
    "projects.architecture": "Así se conecta el proyecto",
    "projects.interface": "Interfaz",
    "projects.data": "Datos y archivos",
    "arcade.heading": "Fuera del código",
    "arcade.lead": "Un descanso. Una partida.",
    "arcade.description": "Eres la anomalía y el sistema quiere corregirte. Fragmentos de código, glitches, agentes y sentinels llegan desde todos lados; tus comandos (ping, fork(), grep, rm -rf) se ejecutan solos. Tú decides hacia dónde moverte y qué instalar.",
    "arcade.instructions": "Muévete con WASD, las flechas, un mando o arrastrando en pantallas táctiles. Recoge bits para subir de nivel y elige una mejora cada vez. Sobrevive 10:00. La partida se pausa al salir y tu récord se guarda en este navegador.",
    "arcade.contact": "¿Seguimos con tu proyecto?",
    "contact.intro": "Busco prácticas, oportunidades junior en ingeniería de software, full stack o backend, y proyectos freelance. Cuéntame sobre tu equipo o tu proyecto.",
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
      '<span class="sigil">&gt;</span> Desarrollador Full Stack. Morelia, MX. Estado: <span class="text-[var(--color-phosphor)] glow caret" data-i18n="hero.status">DISPONIBLE</span>',
    "hero.status": "DISPONIBLE",
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
      "Desarrollador <strong class=\"text-[var(--color-phosphor)] glow-soft\">Full Stack</strong> y estudiante de <em>Ingeniería en Sistemas Computacionales</em> en el Instituto Tecnológico de Morelia (2021–2027). Experiencia en diseño de bases de datos y APIs, interfaces, autenticación, integraciones y comunicación en tiempo real.",
    "about.p2":
      "Trabajo con <span class=\"pill\">TypeScript · Node.js</span>, <span class=\"pill\">React · Next.js</span>, <span class=\"pill\">Vue · Nuxt</span> y <span class=\"pill\">NestJS · Laravel · Strapi</span>, además de PostgreSQL, MySQL, Docker y servicios cloud, con experiencia en Microsoft Azure. Me interesa convertir necesidades de negocio en software mantenible y escalable.",
    "about.p3":
      "// Full Stack en Tekniu · interés en ingeniería de software y backend · abierto a prácticas, puestos junior y proyectos freelance.",

    "projects.label": "3 ítems",

    "proj-0-role": "Full Stack · autónomo",
    "proj-0-period": "nov 2025 — ago 2026",
    "proj-0-summary":
      "Plataforma de gestión para medicina estética: expedientes clínicos, agenda con detección de conflictos de salas y personal, paquetes de tratamientos y pagos. Incluye firma digital desde el dispositivo del paciente, confirmación en tiempo real y almacenamiento en AWS S3.",

    "proj-1-role": "Full Stack · remoto",
    "proj-1-period": "ene 2026 — jun 2026",
    "proj-1-summary":
      "Sistema institucional para centralizar inscripciones, gestión de grupos y seguimiento de alumnos del Centro de Lenguas. Frontend reactivo con Livewire y backend en Laravel.",

    "proj-2-role": "Full Stack · híbrido",
    "proj-2-period": "mar 2026 — actualidad",
    "proj-2-summary":
      "Sitio interno para consultar la documentación de los repositorios de Tekniu. Frontend y backend desarrollados en TypeScript, con Next.js en el frontend.",

    "experience.label": "3 entradas",

    "exp-tekniu-date": "[mar 2026 — actualidad]",
    "exp-tekniu-mode": "Híbrido · Equipo ágil",
    "exp-tekniu-title": "Desarrollador Full Stack",
    "exp-tekniu-b0":
      "Desarrollo full stack en una consultora especializada en soluciones Odoo ERP para PyMEs mexicanas e internacionales.",
    "exp-tekniu-b1":
      "Desarrollo de APIs REST con NestJS y TypeScript, con arquitectura modular y buenas prácticas de backend.",
    "exp-tekniu-b2":
      "Interfaces adaptables con Next.js, integración de APIs REST, gestión de estado y componentes reutilizables.",

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
      "Desarrollo integral de una aplicación de gestión para medicina estética con Nuxt.js/Vue.js y Strapi v5/TypeScript: expedientes de pacientes, tratamientos, medicamentos y alergias.",
    "exp-flama-b1":
      "Agenda con detección automática de conflictos de salas y personal, validación de disponibilidad y duración dinámica; paquetes por procedimiento o tiempo y flujos de pagos y cierre de citas.",
    "exp-flama-b2": "Firma digital desde el dispositivo del paciente mediante WebSockets/Socket.IO y autenticación JWT, con carga a AWS S3 y confirmación al personal en tiempo real.",

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
    "contact.cvMeta": "86 KB · PDF · ES",
    "contact.locked": "// bloqueado",

    "footer.built": "construido con astro + tailwind",
    "lang.toggle": "EN",
    "exp-tekniu-b3": "Implementación y personalización de Odoo: configuración de módulos, adaptación de procesos de negocio y requerimientos de clientes, en colaboración con un equipo ágil.",
    "exp-flama-b3": "APIs REST para disponibilidad diaria y mensual, resolución de tipos de pago, gestión de citas y estadísticas de productividad por colaborador y área.",
    "exp-flama-b4": "Hooks de ciclo de vida, servicios, controladores y lógica de negocio en Strapi para aplicar reglas de agenda, automatizar procesos y mantener la consistencia de los datos.",
    "about.languages": "[\"es-nativo\", \"en-profesional\"]",
    "about.certification": "Certificación",
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
    "hero.statement": "I build end-to-end applications to automate business processes: interfaces, APIs, data and deployment.",
    "hero.explore": "Explore the portfolio",
    "projects.architecture": "How the project connects",
    "projects.interface": "Interface",
    "projects.data": "Data and files",
    "arcade.heading": "Beyond the code",
    "arcade.lead": "Take a break. Play a round.",
    "arcade.description": "You are the anomaly, and the system wants you corrected. Code fragments, glitches, agents and sentinels close in from every side; your commands (ping, fork(), grep, rm -rf) run on their own. You choose where to move and what to install.",
    "arcade.instructions": "Move with WASD, the arrow keys, a gamepad or by dragging on touch screens. Collect bits to level up and pick an upgrade each time. Survive 10:00. The game pauses when you leave, and your record stays in this browser.",
    "arcade.contact": "Shall we talk about your project?",
    "contact.intro": "I am open to internships, junior software engineering, full stack or backend roles, and freelance projects. Tell me about your team or project.",
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
      '<span class="sigil">&gt;</span> Full Stack developer. Morelia, MX. Status: <span class="text-[var(--color-phosphor)] glow caret" data-i18n="hero.status">AVAILABLE</span>',
    "hero.status": "AVAILABLE",
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
      "<strong class=\"text-[var(--color-phosphor)] glow-soft\">Full Stack</strong> developer and <em>Computer Systems Engineering</em> student at Instituto Tecnológico de Morelia (2021–2027). Experience with database and API design, interfaces, authentication, integrations and real-time communication.",
    "about.p2":
      "I work with <span class=\"pill\">TypeScript · Node.js</span>, <span class=\"pill\">React · Next.js</span>, <span class=\"pill\">Vue · Nuxt</span> and <span class=\"pill\">NestJS · Laravel · Strapi</span>, alongside PostgreSQL, MySQL, Docker and cloud services, including experience with Microsoft Azure. I turn business requirements into maintainable, scalable software.",
    "about.p3":
      "// Full Stack at Tekniu · interested in software engineering and backend development · open to internships, junior roles and freelance projects.",

    "projects.label": "3 items",

    "proj-0-role": "Full Stack · freelance",
    "proj-0-period": "Nov 2025 — Aug 2026",
    "proj-0-summary":
      "Management platform for an aesthetic medicine spa: clinical records, scheduling with room and staff conflict detection, treatment packages and payments. Includes digital signatures from patients’ own devices, real-time confirmation and AWS S3 storage.",

    "proj-1-role": "Full Stack · remote",
    "proj-1-period": "Jan 2026 — Jun 2026",
    "proj-1-summary":
      "Institutional system to centralize enrollment, group management and student tracking for the Language Center. Reactive frontend with Livewire and a Laravel backend.",

    "proj-2-role": "Full Stack · hybrid",
    "proj-2-period": "Mar 2026 — present",
    "proj-2-summary":
      "Internal site for consulting documentation for Tekniu repositories. Frontend and backend developed in TypeScript, with Next.js on the frontend.",

    "experience.label": "3 entries",

    "exp-tekniu-date": "[Mar 2026 — present]",
    "exp-tekniu-mode": "Hybrid · Agile team",
    "exp-tekniu-title": "Full Stack Developer",
    "exp-tekniu-b0":
      "Full-stack development at a consultancy specializing in Odoo ERP solutions for Mexican and international SMEs.",
    "exp-tekniu-b1":
      "Developed REST APIs with NestJS and TypeScript, following modular architecture principles and backend best practices.",
    "exp-tekniu-b2":
      "Built responsive Next.js interfaces with REST API integration, state management and reusable components.",

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
      "Built an end-to-end management application for an aesthetic medicine spa with Nuxt.js/Vue.js and Strapi v5/TypeScript: patient records, treatments, medications and allergies.",
    "exp-flama-b1":
      "Implemented scheduling with automatic room and staff conflict detection, availability validation and dynamic durations; procedure- and time-based packages, payment and appointment completion workflows.",
    "exp-flama-b2": "Built digital signing from patients’ own devices via WebSockets/Socket.IO and JWT authentication, with AWS S3 uploads and real-time staff confirmation.",

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
    "contact.cvMeta": "86 KB · PDF · Spanish",
    "contact.locked": "// locked",

    "footer.built": "built with astro + tailwind",
    "lang.toggle": "ES",
    "exp-tekniu-b3": "Contributed to Odoo implementation and customization: module configuration, business-process adaptations and client requirements, working with an agile team.",
    "exp-flama-b3": "Designed REST APIs for daily and monthly availability, payment-type resolution, appointment management and productivity statistics by staff member and treatment area.",
    "exp-flama-b4": "Developed custom Strapi lifecycle hooks, services, controllers and business logic to enforce scheduling rules, automate processes and maintain data consistency.",
    "about.languages": "[\"es-native\", \"en-professional\"]",
    "about.certification": "Certification",
  },
};
