// Bilingual strings. Values can contain HTML — applied via innerHTML.
// Keys mirror the data-i18n attribute on each element.

export type Lang = "es" | "en";

export const i18n: Record<Lang, Record<string, string>> = {
  es: {
    "nav.cmd": "/ cmd",
    "hero.tag": "⟶ INIT_PROFILE · v2026",
    "hero.subtitle":
      '<span class="sigil">&gt;</span> Ingeniero Full Stack. Morelia, MX. Estado: <span class="text-[var(--color-phosphor)] glow caret" data-i18n="hero.status">DISPONIBLE_</span>',
    "hero.status": "DISPONIBLE_",
    "hero.btnProjects": "▸ ls proyectos",
    "hero.btnCv": "▼ descargar cv.pdf",
    "hero.btnHire": "$ sudo contrátame",
    "hero.scroll": 'desplaza ↓ &nbsp;o pulsa <kbd class="pill !py-[1px]">/</kbd>',

    "about.label": "/etc/identidad",
    "about.p1":
      'Desarrollador <strong class="text-[var(--color-phosphor)] glow-soft">Full Stack</strong> con experiencia construyendo aplicaciones web de extremo a extremo — desde la interfaz hasta la infraestructura. Estudiante de <em>Ingeniería en Sistemas Computacionales</em> en el Instituto Tecnológico de Morelia (egreso 2026).',
    "about.p2":
      'Bases sólidas en <span class="pill">JavaScript</span> <span class="pill">TypeScript</span>, ecosistemas <span class="pill">Vue · Nuxt</span> y <span class="pill">Laravel · Node</span>. Cómodo en entornos híbridos y remotos, trabajando con equipos distribuidos.',
    "about.p3":
      "// tres roles activos en paralelo · una webapp en producción · una promesa: enviar código que funcione.",

    "projects.label": "3 ítems",

    "proj-0-role": "Full Stack · autónomo",
    "proj-0-period": "nov 2025 — actualidad",
    "proj-0-summary":
      "App de gestión operativa para clínica de medicina estética. Frontend Nuxt/Vue, backend Strapi v5/TS, tiempo real con Socket.io, almacenamiento en AWS S3 y MySQL gestionado.",

    "proj-1-role": "Full Stack · remoto",
    "proj-1-period": "ene 2026 — actualidad",
    "proj-1-summary":
      "Sistema institucional para centralizar inscripciones, gestión de grupos y seguimiento de alumnos del Centro de Lenguas. Frontend reactivo con Livewire y API REST en Laravel.",

    "proj-2-role": "Becario Dev · híbrido",
    "proj-2-period": "mar 2026 — actualidad",
    "proj-2-summary":
      "Desarrollo e implementación de módulos Odoo para PyMEs locales e internacionales. Integraciones con servicios externos, mantenimiento de servidores Linux y dockerización de entornos cliente.",

    "experience.label": "3 entradas",

    "exp-tekniu-mode": "Híbrido · Jornada parcial",
    "exp-tekniu-title": "Becario de Desarrollo Web",
    "exp-tekniu-b0":
      "Soluciones full stack en consultora especializada en Odoo ERP para PyMEs mexicanas e internacionales.",
    "exp-tekniu-b1":
      "Implementación y personalización de módulos ERP, integración con servicios externos.",
    "exp-tekniu-b2":
      "Mantenimiento de infraestructura Linux, despliegues con Docker.",

    "exp-itm-mode": "Remoto · Temporal",
    "exp-itm-title": "Programador Full Stack",
    "exp-itm-b0":
      "Desarrollo del sistema SIM-CLE para el Depto. de Idiomas, frontend y backend.",
    "exp-itm-b1":
      "Centralización del control de inscripciones, grupos y seguimiento de alumnos.",

    "exp-flama-mode": "Remoto · Autónomo",
    "exp-flama-title": "Programador Full Stack",
    "exp-flama-b0":
      "Desarrollo integral de webapp de gestión operativa para Spa Be Perfect (medicina estética).",
    "exp-flama-b1":
      "Frontend Nuxt/Vue, backend Strapi v5/TS, integración AWS S3, tiempo real con Socket.io.",
    "exp-flama-b2": "Proyecto en producción: appbeperfect.com",

    "skills.Frontend": "Frontend",
    "skills.Backend": "Backend",
    "skills.Databases": "Bases de datos",
    "skills.DevOps": "DevOps / Cloud",
    "skills.Vcs": "Control de versiones",
    "skills.Other": "Otros",

    "contact.bodyPlaceholder": "// escribe tu mensaje — pulsa enviar",
    "contact.subjectPlaceholder": "re: rol full-stack",
    "contact.send": "▶ enviar · ENTER",
    "contact.cvLabel": "currículum",
    "contact.cvMeta": "254 KB · ES · actualizado 2026-05",
    "contact.locked": "// bloqueado",

    "footer.built": "construido con astro + tailwind",
    "lang.toggle": "EN",
  },
  en: {
    "nav.cmd": "/ cmd",
    "hero.tag": "⟶ INIT_PROFILE · v2026",
    "hero.subtitle":
      '<span class="sigil">&gt;</span> Full Stack engineer. Morelia, MX. Status: <span class="text-[var(--color-phosphor)] glow caret" data-i18n="hero.status">AVAILABLE_</span>',
    "hero.status": "AVAILABLE_",
    "hero.btnProjects": "▸ ls projects",
    "hero.btnCv": "▼ download cv.pdf",
    "hero.btnHire": "$ sudo hire-me",
    "hero.scroll": 'scroll ↓ &nbsp;or press <kbd class="pill !py-[1px]">/</kbd>',

    "about.label": "/etc/identity",
    "about.p1":
      '<strong class="text-[var(--color-phosphor)] glow-soft">Full Stack</strong> developer building end-to-end web applications — from interface to infrastructure. <em>Computer Systems Engineering</em> student at Instituto Tecnológico de Morelia (graduating 2026).',
    "about.p2":
      'Strong foundations in <span class="pill">JavaScript</span> <span class="pill">TypeScript</span>, <span class="pill">Vue · Nuxt</span> and <span class="pill">Laravel · Node</span> ecosystems. Comfortable in hybrid and remote setups with distributed teams.',
    "about.p3":
      "// three active roles in parallel · one webapp in production · one promise: ship code that works.",

    "projects.label": "3 items",

    "proj-0-role": "Full Stack · freelance",
    "proj-0-period": "Nov 2025 — present",
    "proj-0-summary":
      "Operations management app for an aesthetic medicine clinic. Nuxt/Vue frontend, Strapi v5/TS backend, real-time via Socket.io, AWS S3 storage and managed MySQL.",

    "proj-1-role": "Full Stack · remote",
    "proj-1-period": "Jan 2026 — present",
    "proj-1-summary":
      "Institutional system to centralize enrollment, group management and student tracking for the Language Center. Reactive frontend with Livewire and Laravel REST API.",

    "proj-2-role": "Dev Intern · hybrid",
    "proj-2-period": "Mar 2026 — present",
    "proj-2-summary":
      "Building and deploying Odoo modules for local and international SMBs. External service integrations, Linux server maintenance and Dockerized client environments.",

    "experience.label": "3 entries",

    "exp-tekniu-mode": "Hybrid · Part-time",
    "exp-tekniu-title": "Web Development Intern",
    "exp-tekniu-b0":
      "Full stack solutions at a consultancy specialized in Odoo ERP for Mexican and international SMBs.",
    "exp-tekniu-b1":
      "Implementation and customization of ERP modules, integration with external services.",
    "exp-tekniu-b2":
      "Linux infrastructure maintenance, Docker-based deployments.",

    "exp-itm-mode": "Remote · Temporary",
    "exp-itm-title": "Full Stack Developer",
    "exp-itm-b0":
      "Built the SIM-CLE system for the Languages Department — frontend and backend.",
    "exp-itm-b1":
      "Centralized enrollment, group management and student tracking.",

    "exp-flama-mode": "Remote · Freelance",
    "exp-flama-title": "Full Stack Developer",
    "exp-flama-b0":
      "End-to-end webapp development for Spa Be Perfect operations (aesthetic medicine).",
    "exp-flama-b1":
      "Nuxt/Vue frontend, Strapi v5/TS backend, AWS S3 integration, real-time via Socket.io.",
    "exp-flama-b2": "In production: appbeperfect.com",

    "skills.Frontend": "Frontend",
    "skills.Backend": "Backend",
    "skills.Databases": "Databases",
    "skills.DevOps": "DevOps / Cloud",
    "skills.Vcs": "Version control",
    "skills.Other": "Other",

    "contact.bodyPlaceholder": "// write your message — hit send",
    "contact.subjectPlaceholder": "re: full-stack role",
    "contact.send": "▶ send · ENTER",
    "contact.cvLabel": "resume",
    "contact.cvMeta": "254 KB · ES · updated 2026-05",
    "contact.locked": "// locked",

    "footer.built": "built with astro + tailwind",
    "lang.toggle": "ES",
  },
};
