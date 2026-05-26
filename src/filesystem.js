export const fileSystem = {
    "root": {
        type: "folder",
        name: "Inicio",
        nameEn: "Home",
        children: ["about", "projects", "skills", "contact", "arcade"]
    },

    // ==========================================
    // About Section
    // ==========================================
    "about": {
        type: "folder",
        name: "Sobre Mí",
        nameEn: "About Me",
        icon: "person",
        children: ["bio.txt", "education.txt", "experience.txt"]
    },
    "bio.txt": {
        type: "file",
        name: "Perfil",
        nameEn: "Profile",
        icon: "description",
        content: `
            <h3>Carlos Malagón Tenorio</h3>
            <p><strong>Ubicación:</strong> Pinto (Madrid), España</p>
            <p>Estudiante de <strong>Ingeniería de Sistemas Audiovisuales y Multimedia</strong> con base técnica en desarrollo (Python / web) y conocimientos de <strong>redes y telecomunicaciones</strong>.</p>
            <p>Experiencia docente diseñando e impartiendo formación para niños con metodología práctica e interactiva.</p>
        `,
        contentEn: `
            <h3>Carlos Malagón Tenorio</h3>
            <p><strong>Location:</strong> Pinto (Madrid), Spain</p>
            <p><strong>Audiovisual Systems and Multimedia Engineering</strong> student with a technical background in development (Python / web) and knowledge of <strong>networks and telecommunications</strong>.</p>
            <p>Teaching experience designing and delivering training for children using practical and interactive methodologies.</p>
        `
    },
    "education.txt": {
        type: "file",
        name: "Formación",
        nameEn: "Education",
        icon: "school",
        content: `
            <h3>Ingeniería de Sistemas Audiovisuales y Multimedia</h3>
            <p><strong>Universidad Rey Juan Carlos (URJC)</strong><br>
            2021 – Actualidad · Fuenlabrada, Madrid<br>
            <em>EQF 6</em></p>
            <hr>
            <h3>Bachillerato de Ciencias</h3>
            <p><strong>IES Calderón de la Barca</strong><br>
            2019 – 2021 · Pinto, Madrid<br>
            <em>EQF 4</em></p>
        `,
        contentEn: `
            <h3>Audiovisual Systems and Multimedia Engineering</h3>
            <p><strong>Rey Juan Carlos University (URJC)</strong><br>
            2021 – Present · Fuenlabrada, Madrid<br>
            <em>EQF 6</em></p>
            <hr>
            <h3>Science Baccalaureate</h3>
            <p><strong>IES Calderón de la Barca</strong><br>
            2019 – 2021 · Pinto, Madrid<br>
            <em>EQF 4</em></p>
        `
    },
    "experience.txt": {
        type: "file",
        name: "Experiencia",
        nameEn: "Experience",
        icon: "work_history",
        content: `
            <h3>Profesor de ajedrez — Playedu</h3>
            <p><strong>16/09/2025 – 16/12/2025</strong> · Pinto, Madrid</p>
            <ul>
                <li>Diseño e implementación de un currículo de ajedrez por niveles (6 a 12 años).</li>
                <li>Enseñanza de reglas, táctica básica y finales.</li>
                <li>Metodologías dinámicas: storytelling, apoyos visuales y gamificación ("Make Chess Fun").</li>
                <li>Adaptación a distintos ritmos y niveles ("Be Patient").</li>
            </ul>
        `,
        contentEn: `
            <h3>Chess Teacher — Playedu</h3>
            <p><strong>16/09/2025 – 16/12/2025</strong> · Pinto, Madrid</p>
            <ul>
                <li>Design and implementation of a chess curriculum by levels (6 to 12 years old).</li>
                <li>Teaching of rules, basic tactics, and endgames.</li>
                <li>Dynamic methodologies: storytelling, visual aids, and gamification ("Make Chess Fun").</li>
                <li>Adaptation to different rhythms and levels ("Be Patient").</li>
            </ul>
        `
    },

    // ==========================================
    // Projects Section
    // ==========================================
    "projects": {
        type: "folder",
        name: "Proyectos",
        nameEn: "Projects",
        icon: "folder_open",
        children: ["commander_mtg", "portfolio_vr", "curiosities"]
    },
    "commander_mtg": {
        type: "file",
        name: "Commander MTG",
        nameEn: "Commander MTG",
        icon: "style",
        content: `
            <h3>Commander - Deck Forge</h3>
            <p><strong>Tecnologías:</strong> Python, Django, HTML/CSS, JavaScript</p>
            <p>Red social completa diseñada para jugadores de Magic: The Gathering (formato Commander). Incluye un constructor de mazos avanzado con validación de reglas en tiempo real mediante la API de Scryfall, creación de grupos sociales privados/públicos y perfiles dinámicos.</p>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
                <a href="https://mtcarlos.pythonanywhere.com/" target="_blank" style="color: var(--mac-accent); text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;">
                    <span class="material-symbols-outlined" style="font-size: 1.1rem;">public</span> Ver Proyecto en Vivo
                </a>
                <a href="https://gitlab.eif.urjc.es/carlosmt/final-ltaw" target="_blank" style="color: var(--mac-accent); text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;">
                    <span class="material-symbols-outlined" style="font-size: 1.1rem;">code</span> Repositorio en GitLab
                </a>
            </div>
        `,
        contentEn: `
            <h3>Commander - Deck Forge</h3>
            <p><strong>Technologies:</strong> Python, Django, HTML/CSS, JavaScript</p>
            <p>A full-fledged social network designed for Magic: The Gathering players (Commander format). Features an advanced deck builder with real-time rule validation using the Scryfall API, public/private social groups, and dynamic player profiles.</p>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
                <a href="https://mtcarlos.pythonanywhere.com/" target="_blank" style="color: var(--mac-accent); text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;">
                    <span class="material-symbols-outlined" style="font-size: 1.1rem;">public</span> View Live Project
                </a>
                <a href="https://gitlab.eif.urjc.es/carlosmt/final-ltaw" target="_blank" style="color: var(--mac-accent); text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;">
                    <span class="material-symbols-outlined" style="font-size: 1.1rem;">code</span> GitLab Repository
                </a>
            </div>
        `
    },
    "portfolio_vr": {
        type: "file",
        name: "Este Portfolio 3D",
        nameEn: "This 3D Portfolio",
        icon: "view_in_ar",
        content: `
            <h3>Portfolio Interactivo 3D</h3>
            <p><strong>Tecnologías:</strong> A-Frame, Three.js, JavaScript</p>
            <p>Una experiencia inmersiva diseñada para mostrar mi perfil profesional como un entorno explorable.</p>
            <p>Implementa sistemas de archivos virtuales, interacción con objetos 3D y diseño responsivo.</p>
        `,
        contentEn: `
            <h3>Interactive 3D Portfolio</h3>
            <p><strong>Technologies:</strong> A-Frame, Three.js, JavaScript</p>
            <p>An immersive experience designed to showcase my professional profile as an explorable environment.</p>
            <p>Implements virtual file systems, interaction with 3D objects, and responsive design.</p>
        `,
        previewImage: "assets/preview_portfolio.jpg"
    },

    // Curiosities — Fun facts about building this portfolio
    "curiosities": {
        type: "file",
        name: "Curiosidades",
        nameEn: "Curiosities",
        icon: "emoji_objects",
        content: `
            <div class="info-section">
                <h4>Sobre esta aplicación</h4>
                <p>Este portfolio es una aplicación web inmersiva que simula un sistema operativo virtual dentro de un entorno 3D explorable.</p>
            </div>

            <div class="curiosity-card">
                <h4><span class="material-symbols-outlined">palette</span> Sin frameworks CSS</h4>
                <p>Toda la interfaz macOS que estás viendo está construida con CSS puro (Vanilla CSS). Glassmorphism, animaciones y micro-interacciones, todo sin Tailwind ni Bootstrap.</p>
            </div>

            <div class="curiosity-card">
                <h4><span class="material-symbols-outlined">view_in_ar</span> Escena 3D en el navegador</h4>
                <p>El entorno 3D funciona con A-Frame + Three.js sobre WebGL. Todo se renderiza en tiempo real directamente en tu navegador, sin plugins.</p>
            </div>

            <div class="curiosity-card">
                <h4><span class="material-symbols-outlined">sports_esports</span> Easter Egg</h4>
                <p>¿Ya encontraste la carpeta Arcade? Hay un juego Snake jugable dentro de este mismo Finder. Porque un buen desarrollador también sabe divertirse.</p>
            </div>

            <div class="curiosity-card">
                <h4><span class="material-symbols-outlined">translate</span> Bilingüe en tiempo real</h4>
                <p>Pulsa el botón ES/EN en la barra de título. Todo el contenido cambia al instante sin recargar la página — enrutamiento lógico puro en JavaScript.</p>
            </div>

            <div class="curiosity-card">
                <h4><span class="material-symbols-outlined">inventory_2</span> Zero Dependencies</h4>
                <p>El sistema de archivos virtual, las ventanas arrastrables, el dock animado y las notificaciones... todo construido desde cero con Vanilla JS.</p>
            </div>
        `,
        contentEn: `
            <div class="info-section">
                <h4>About this app</h4>
                <p>This portfolio is an immersive web application that simulates a virtual operating system inside an explorable 3D environment.</p>
            </div>

            <div class="curiosity-card">
                <h4><span class="material-symbols-outlined">palette</span> No CSS frameworks</h4>
                <p>The entire macOS interface you're seeing is built with pure Vanilla CSS. Glassmorphism, animations, and micro-interactions — all without Tailwind or Bootstrap.</p>
            </div>

            <div class="curiosity-card">
                <h4><span class="material-symbols-outlined">view_in_ar</span> 3D Scene in the browser</h4>
                <p>The 3D environment runs on A-Frame + Three.js over WebGL. Everything renders in real-time directly in your browser, no plugins required.</p>
            </div>

            <div class="curiosity-card">
                <h4><span class="material-symbols-outlined">sports_esports</span> Easter Egg</h4>
                <p>Did you find the Arcade folder? There's a playable Snake game right inside this Finder. Because a good developer also knows how to have fun.</p>
            </div>

            <div class="curiosity-card">
                <h4><span class="material-symbols-outlined">translate</span> Real-time bilingual</h4>
                <p>Press the ES/EN button in the title bar. All content switches instantly with no page reload — pure JavaScript logical routing.</p>
            </div>

            <div class="curiosity-card">
                <h4><span class="material-symbols-outlined">inventory_2</span> Zero Dependencies</h4>
                <p>The virtual file system, draggable windows, animated dock, and notifications... all built from scratch with Vanilla JS.</p>
            </div>
        `
    },

    // ==========================================
    // Skills Section
    // ==========================================
    "skills": {
        type: "folder",
        name: "Habilidades",
        nameEn: "Skills",
        icon: "school",
        children: ["tech", "languages", "other"]
    },
    "tech": {
        type: "file",
        name: "Programación",
        nameEn: "Programming",
        icon: "code",
        content: `
            <div class="skills-grid">
                <span class="skill-tag">Python (Básico)</span>
                <span class="skill-tag">Django</span>
                <span class="skill-tag">JavaScript</span>
                <span class="skill-tag">HTML5</span>
                <span class="skill-tag">CSS3</span>
                <span class="skill-tag">Node.js</span>
            </div>
        `,
        contentEn: `
            <div class="skills-grid">
                <span class="skill-tag">Python (Basic)</span>
                <span class="skill-tag">Django</span>
                <span class="skill-tag">JavaScript</span>
                <span class="skill-tag">HTML5</span>
                <span class="skill-tag">CSS3</span>
                <span class="skill-tag">Node.js</span>
            </div>
        `
    },
    "languages": {
        type: "file",
        name: "Idiomas",
        nameEn: "Languages",
        icon: "language",
        content: `
             <div class="skills-grid">
                <span class="skill-tag">Español (Nativo)</span>
                <span class="skill-tag">Inglés (C1)</span>
            </div>
        `,
        contentEn: `
             <div class="skills-grid">
                <span class="skill-tag">Spanish (Native)</span>
                <span class="skill-tag">English (C1)</span>
            </div>
        `
    },
    "other": {
        type: "file",
        name: "Otras",
        nameEn: "Other",
        icon: "extension",
        content: `
             <div class="skills-grid">
                <span class="skill-tag">Microsoft Office</span>
                <span class="skill-tag">Redes y Telecomunicaciones</span>
            </div>
        `,
        contentEn: `
             <div class="skills-grid">
                <span class="skill-tag">Microsoft Office</span>
                <span class="skill-tag">Networks and Telecommunications</span>
            </div>
        `
    },

    // ==========================================
    // Contact Section
    // ==========================================
    "contact": {
        type: "folder",
        name: "Contacto",
        nameEn: "Contact",
        icon: "mail",
        children: ["email", "socials"]
    },
    "email": {
        type: "file",
        name: "Email",
        nameEn: "Email",
        icon: "alternate_email",
        content: `<p>Escríbeme a: <a href="mailto:mtcarlos2003@gmail.com">mtcarlos2003@gmail.com</a></p>`,
        contentEn: `<p>Email me at: <a href="mailto:mtcarlos2003@gmail.com">mtcarlos2003@gmail.com</a></p>`
    },
    "socials": {
        type: "file",
        name: "Redes",
        nameEn: "Socials",
        icon: "share",
        content: `
            <div class="social-buttons-container">
                <a href="https://www.linkedin.com/in/carlos-malagon-tenorio" target="_blank" class="social-btn linkedin-btn">
                    <svg class="social-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    LinkedIn
                </a>
                <a href="https://github.com/mtcarlos" target="_blank" class="social-btn github-btn">
                    <svg class="social-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    GitHub
                </a>
            </div>
        `,
        contentEn: `
            <div class="social-buttons-container">
                <a href="https://www.linkedin.com/in/carlos-malagon-tenorio" target="_blank" class="social-btn linkedin-btn">
                    <svg class="social-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    LinkedIn
                </a>
                <a href="https://github.com/mtcarlos" target="_blank" class="social-btn github-btn">
                    <svg class="social-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    GitHub
                </a>
            </div>
        `
    },

    // ==========================================
    // Arcade — Easter Egg Section
    // ==========================================
    "arcade": {
        type: "folder",
        name: "Arcade",
        nameEn: "Arcade",
        icon: "stadia_controller",
        children: ["snake_game"]
    },
    "snake_game": {
        type: "game",
        name: "Snake",
        nameEn: "Snake",
        icon: "sports_esports",
        gameId: "snake",
        content: `<p>Un clásico reinventado con estética minimalista.</p>`,
        contentEn: `<p>A classic reinvented with minimalist aesthetics.</p>`
    }
};

export const getFolderContents = (pathId) => {
    const node = fileSystem[pathId];
    if (!node || node.type !== 'folder') return [];

    return node.children.map(childId => {
        return {
            id: childId,
            ...fileSystem[childId]
        };
    });
};

export const getFileContent = (fileId) => {
    return fileSystem[fileId] || null;
};
