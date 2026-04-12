export const fileSystem = {
    "root": {
        type: "folder",
        name: "Inicio",
        nameEn: "Home",
        children: ["about", "projects", "skills", "contact"]
    },
    // About Section
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

    // Projects Section
    "projects": {
        type: "folder",
        name: "Proyectos",
        nameEn: "Projects",
        icon: "folder_open",
        children: ["portfolio_vr"]
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

    // Skills Section
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
                <span class="skill-tag">Java (Básico)</span>
                <span class="skill-tag">JavaScript</span>
                <span class="skill-tag">HTML5</span>
                <span class="skill-tag">CSS3</span>
                <span class="skill-tag">Node.js</span>
            </div>
        `,
        contentEn: `
            <div class="skills-grid">
                <span class="skill-tag">Python (Basic)</span>
                <span class="skill-tag">Java (Basic)</span>
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

    // Contact Section
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
            <div class="contact-list">
                <p><strong>LinkedIn:</strong> <a href="#" target="_blank">Tu enlace aquí</a></p>
                <p><strong>GitHub:</strong> <a href="#" target="_blank">Tu enlace aquí</a></p>
            </div>
        `,
        contentEn: `
            <div class="contact-list">
                <p><strong>LinkedIn:</strong> <a href="#" target="_blank">Your link here</a></p>
                <p><strong>GitHub:</strong> <a href="#" target="_blank">Your link here</a></p>
            </div>
        `
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
