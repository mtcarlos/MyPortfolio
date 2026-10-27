import"./modulepreload-polyfill-B5Qt9EMX.js";class Ne{constructor(){this.sounds={},this.enabled=!0,this.volume=.5,this.init()}init(){this.loadSound("hover","https://cdn.freesound.org/previews/240/240776_4107740-lq.mp3"),this.loadSound("click","https://cdn.freesound.org/previews/256/256116_3263906-lq.mp3"),this.loadSound("open","https://cdn.freesound.org/previews/171/171671_2437358-lq.mp3"),this.loadSound("step","assets/music/pasos.mp3")}loadSound(t,i){const s=new Audio(i);s.preload="auto",this.sounds[t]=s}play(t,i={}){if(!this.enabled)return;const s=this.sounds[t];if(!s)return;const p=s.cloneNode(),y=i.volume||this.volume,g=i.variation||0;p.volume=Math.max(0,Math.min(1,y+(Math.random()*g-g/2))),p.play().catch(b=>{})}toggleMute(){if(this.enabled=!this.enabled,!this.enabled)for(const t in this.sounds){const i=this.sounds[t];i&&!i.paused&&i.loop&&i.pause()}return this.enabled}startLoop(t,i={}){if(!this.enabled)return;const s=this.sounds[t];s&&(s.loop=!0,s.volume=i.volume||this.volume,s.paused&&s.play().catch(p=>{}))}stopLoop(t){const i=this.sounds[t];i&&(i.pause(),i.currentTime=0)}}const h=new Ne;function Ge(){AFRAME.registerComponent("character-controller",{schema:{speed:{type:"number",default:.1},rotationSpeed:{type:"number",default:.1}},init:function(){this.keys={KeyW:!1,KeyA:!1,KeyS:!1,KeyD:!1,ArrowUp:!1,ArrowLeft:!1,ArrowDown:!1,ArrowRight:!1},this.isMoving=!1,this.currentRotation=180*(Math.PI/180),this.targetRotation=this.currentRotation,this.stepTimer=0,this.stepInterval=500,this.onKeyDown=this.onKeyDown.bind(this),this.onKeyUp=this.onKeyUp.bind(this),window.addEventListener("keydown",this.onKeyDown),window.addEventListener("keyup",this.onKeyUp),this.model=this.el.querySelector("#character")},remove:function(){window.removeEventListener("keydown",this.onKeyDown),window.removeEventListener("keyup",this.onKeyUp)},onKeyDown:function(l){Object.keys(this.keys).includes(l.code)&&(this.keys[l.code]=!0)},onKeyUp:function(l){Object.keys(this.keys).includes(l.code)&&(this.keys[l.code]=!1)},tick:function(l,t){if(this.enabled===!1)return;let i=0,s=0;if((this.keys.KeyW||this.keys.ArrowUp)&&(s-=1),(this.keys.KeyA||this.keys.ArrowLeft)&&(i-=1),(this.keys.KeyS||this.keys.ArrowDown)&&(s+=1),(this.keys.KeyD||this.keys.ArrowRight)&&(i+=1),Math.abs(i)>.1||Math.abs(s)>.1){this.isMoving||(this.model.setAttribute("animation-mixer","clip: Walking; crossFadeDuration: 0.2; loop: repeat"),this.isMoving=!0,h.startLoop("step",{volume:.4}));const y=this.el.sceneEl.querySelector("[camera]");if(!y)return;const g=new THREE.Quaternion;y.object3D.getWorldQuaternion(g);const b=new THREE.Vector3(0,0,-1);b.applyQuaternion(g),b.y=0,b.normalize();const f=new THREE.Vector3(1,0,0);f.applyQuaternion(g),f.y=0,f.normalize();const E=new THREE.Vector3;if(E.addScaledVector(b,-s),E.addScaledVector(f,i),E.lengthSq()>0){E.normalize(),this.targetRotation=Math.atan2(E.x,E.z);const v=2.5;if(this.el.body)this.el.body.velocity.x=E.x*v,this.el.body.velocity.z=E.z*v;else{const w=this.el.object3D.position,q=v*(t/1e3);w.x+=E.x*q,w.z+=E.z*q}}if(this.model){let v=this.model.object3D.rotation.y,w=this.targetRotation-v;for(;w>Math.PI;)w-=2*Math.PI;for(;w<-Math.PI;)w+=2*Math.PI;Math.abs(w)>.001&&(this.model.object3D.rotation.y+=w*this.data.rotationSpeed)}}else this.isMoving&&(this.model.setAttribute("animation-mixer","clip: Idle; crossFadeDuration: 0.2; loop: repeat"),this.isMoving=!1,h.stopLoop("step")),this.el.body&&(this.el.body.velocity.x=0,this.el.body.velocity.z=0)}})}function Oe(){AFRAME.registerComponent("smart-camera",{schema:{target:{type:"selector"},distance:{type:"number",default:2.5},height:{type:"number",default:1.7}},init:function(){this.cameraEl=this.el.querySelector("[camera]"),this.cameraBoom=this.el.querySelector("#camera-boom"),this.raycaster=new THREE.Raycaster,this.direction=new THREE.Vector3,this.targetPos=new THREE.Vector3},tick:function(){if(!this.data.target||!this.cameraEl)return;this.data.target.object3D.getWorldPosition(this.targetPos),this.targetPos.y+=1.4;const l=new THREE.Vector3;this.cameraEl.object3D.getWorldPosition(l),this.direction.subVectors(l,this.targetPos).normalize(),this.targetPos.distanceTo(l),this.raycaster.set(this.targetPos,this.direction);const t=document.querySelectorAll(".collidable, [static-body], a-plane, a-box[static-body]"),i=Array.from(t).map(f=>f.object3D),s=this.raycaster.intersectObjects(i,!0),p=.5,y=this.data.distance;let g=y;if(s.length>0){const f=s[0].distance;f<y&&(g=Math.max(p,f-.2))}const b=this.cameraEl.object3D.position.z;this.cameraEl.object3D.position.z+=(g-b)*.1}})}const _={root:{type:"folder",name:"Inicio",nameEn:"Home",children:["about","projects","skills","contact","arcade"]},about:{type:"folder",name:"Sobre Mí",nameEn:"About Me",icon:"person",children:["bio.txt","education.txt","experience.txt"]},"bio.txt":{type:"file",name:"Perfil",nameEn:"Profile",icon:"description",content:`
            <h3>Carlos Malagón Tenorio</h3>
            <p><strong>Ubicación:</strong> Pinto (Madrid), España</p>
            <p>Estudiante de <strong>Ingeniería de Sistemas Audiovisuales y Multimedia</strong> con base técnica en desarrollo (Python / web) y conocimientos de <strong>redes y telecomunicaciones</strong>.</p>
            <p>Experiencia docente diseñando e impartiendo formación para niños con metodología práctica e interactiva.</p>
        `,contentEn:`
            <h3>Carlos Malagón Tenorio</h3>
            <p><strong>Location:</strong> Pinto (Madrid), Spain</p>
            <p><strong>Audiovisual Systems and Multimedia Engineering</strong> student with a technical background in development (Python / web) and knowledge of <strong>networks and telecommunications</strong>.</p>
            <p>Teaching experience designing and delivering training for children using practical and interactive methodologies.</p>
        `},"education.txt":{type:"file",name:"Formación",nameEn:"Education",icon:"school",content:`
            <h3>Ingeniería de Sistemas Audiovisuales y Multimedia</h3>
            <p><strong>Universidad Rey Juan Carlos (URJC)</strong><br>
            2021 – 2026 · Fuenlabrada, Madrid<br>
            <em>EQF 6</em></p>
            <hr>
            <h3>Bachillerato de Ciencias</h3>
            <p><strong>IES Calderón de la Barca</strong><br>
            2019 – 2021 · Pinto, Madrid<br>
            <em>EQF 4</em></p>
        `,contentEn:`
            <h3>Audiovisual Systems and Multimedia Engineering</h3>
            <p><strong>Rey Juan Carlos University (URJC)</strong><br>
            2021 – 2026 · Fuenlabrada, Madrid<br>
            <em>EQF 6</em></p>
            <hr>
            <h3>Science Baccalaureate</h3>
            <p><strong>IES Calderón de la Barca</strong><br>
            2019 – 2021 · Pinto, Madrid<br>
            <em>EQF 4</em></p>
        `},"experience.txt":{type:"file",name:"Experiencia",nameEn:"Experience",icon:"work_history",content:`
            <h3>Profesor de ajedrez — Playedu</h3>
            <p><strong>16/09/2025 – 16/12/2025</strong> · Pinto, Madrid</p>
            <ul>
                <li>Diseño e implementación de un currículo de ajedrez por niveles (6 a 12 años).</li>
                <li>Enseñanza de reglas, táctica básica y finales.</li>
                <li>Metodologías dinámicas: storytelling, apoyos visuales y gamificación ("Make Chess Fun").</li>
                <li>Adaptación a distintos ritmos y niveles ("Be Patient").</li>
            </ul>
        `,contentEn:`
            <h3>Chess Teacher — Playedu</h3>
            <p><strong>16/09/2025 – 16/12/2025</strong> · Pinto, Madrid</p>
            <ul>
                <li>Design and implementation of a chess curriculum by levels (6 to 12 years old).</li>
                <li>Teaching of rules, basic tactics, and endgames.</li>
                <li>Dynamic methodologies: storytelling, visual aids, and gamification ("Make Chess Fun").</li>
                <li>Adaptation to different rhythms and levels ("Be Patient").</li>
            </ul>
        `},projects:{type:"folder",name:"Proyectos",nameEn:"Projects",icon:"folder_open",children:["commander_mtg","portfolio_vr","curiosities"]},commander_mtg:{type:"file",name:"Commander MTG",nameEn:"Commander MTG",icon:"style",content:`
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
        `,contentEn:`
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
        `},portfolio_vr:{type:"file",name:"Este Portfolio 3D",nameEn:"This 3D Portfolio",icon:"view_in_ar",content:`
            <h3>Portfolio Interactivo 3D</h3>
            <p><strong>Tecnologías:</strong> A-Frame, Three.js, JavaScript</p>
            <p>Una experiencia inmersiva diseñada para mostrar mi perfil profesional como un entorno explorable.</p>
            <p>Implementa sistemas de archivos virtuales, interacción con objetos 3D y diseño responsivo.</p>
        `,contentEn:`
            <h3>Interactive 3D Portfolio</h3>
            <p><strong>Technologies:</strong> A-Frame, Three.js, JavaScript</p>
            <p>An immersive experience designed to showcase my professional profile as an explorable environment.</p>
            <p>Implements virtual file systems, interaction with 3D objects, and responsive design.</p>
        `,previewImage:"assets/preview_portfolio.jpg"},curiosities:{type:"file",name:"Curiosidades",nameEn:"Curiosities",icon:"emoji_objects",content:`
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
        `,contentEn:`
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
        `},skills:{type:"folder",name:"Habilidades",nameEn:"Skills",icon:"school",children:["tech","languages","other"]},tech:{type:"file",name:"Programación",nameEn:"Programming",icon:"code",content:`
            <div class="skills-grid">
                <span class="skill-tag">Python (Básico)</span>
                <span class="skill-tag">Django</span>
                <span class="skill-tag">JavaScript</span>
                <span class="skill-tag">HTML5</span>
                <span class="skill-tag">CSS3</span>
                <span class="skill-tag">Node.js</span>
            </div>
        `,contentEn:`
            <div class="skills-grid">
                <span class="skill-tag">Python (Basic)</span>
                <span class="skill-tag">Django</span>
                <span class="skill-tag">JavaScript</span>
                <span class="skill-tag">HTML5</span>
                <span class="skill-tag">CSS3</span>
                <span class="skill-tag">Node.js</span>
            </div>
        `},languages:{type:"file",name:"Idiomas",nameEn:"Languages",icon:"language",content:`
             <div class="skills-grid">
                <span class="skill-tag">Español (Nativo)</span>
                <span class="skill-tag">Inglés (C1)</span>
            </div>
        `,contentEn:`
             <div class="skills-grid">
                <span class="skill-tag">Spanish (Native)</span>
                <span class="skill-tag">English (C1)</span>
            </div>
        `},other:{type:"file",name:"Otras",nameEn:"Other",icon:"extension",content:`
             <div class="skills-grid">
                <span class="skill-tag">Microsoft Office</span>
                <span class="skill-tag">Redes y Telecomunicaciones</span>
            </div>
        `,contentEn:`
             <div class="skills-grid">
                <span class="skill-tag">Microsoft Office</span>
                <span class="skill-tag">Networks and Telecommunications</span>
            </div>
        `},contact:{type:"folder",name:"Contacto",nameEn:"Contact",icon:"mail",children:["email","socials"]},email:{type:"file",name:"Email",nameEn:"Email",icon:"alternate_email",content:'<p>Escríbeme a: <a href="mailto:mtcarlos2003@gmail.com">mtcarlos2003@gmail.com</a></p>',contentEn:'<p>Email me at: <a href="mailto:mtcarlos2003@gmail.com">mtcarlos2003@gmail.com</a></p>'},socials:{type:"file",name:"Redes",nameEn:"Socials",icon:"share",content:`
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
        `,contentEn:`
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
        `},arcade:{type:"folder",name:"Arcade",nameEn:"Arcade",icon:"stadia_controller",children:["snake_game"]},snake_game:{type:"game",name:"Snake",nameEn:"Snake",icon:"sports_esports",gameId:"snake",content:"<p>Un clásico reinventado con estética minimalista.</p>",contentEn:"<p>A classic reinvented with minimalist aesthetics.</p>"}},Ke=l=>{const t=_[l];return!t||t.type!=="folder"?[]:t.children.map(i=>({id:i,..._[i]}))},Ue=l=>_[l]||null,d=12,j=18,F=18,M=j*d,I=F*d,$e=110,P={bg:"rgba(0, 0, 0, 0.25)",grid:"rgba(255, 255, 255, 0.03)",snake:"rgba(255, 255, 255, 0.85)",food:"#007AFF",foodGlow:"rgba(0, 122, 255, 0.25)",textDim:"rgba(255, 255, 255, 0.25)"};class Ye{constructor(){this.canvas=null,this.ctx=null,this.container=null,this.interval=null,this.score=0,this.highScore=0,this.state="idle",this.snake=[],this.dir={x:1,y:0},this.nextDir={x:1,y:0},this.food={x:0,y:0},this.deathFrame=0,this._onKey=this._handleKey.bind(this)}mount(t){this.destroy(),this.container=document.createElement("div"),this.container.className="snake-container",this.container.innerHTML=`
            <div class="snake-header">
                <span class="snake-score">Score: <span id="snake-score-val">0</span></span>
                <span class="snake-score">Best: <span id="snake-high-val">0</span></span>
            </div>
        `,this.canvas=document.createElement("canvas"),this.canvas.className="snake-canvas",this.canvas.width=M,this.canvas.height=I,this.container.appendChild(this.canvas);const i=document.createElement("div");i.className="snake-controls-hint",i.textContent="← ↑ ↓ → to move · Enter to start",this.container.appendChild(i);const s=document.createElement("button");s.className="snake-btn",s.textContent="▶  Play",s.id="snake-play-btn",s.addEventListener("click",()=>this.startGame()),this.container.appendChild(s),t.appendChild(this.container),this.ctx=this.canvas.getContext("2d"),this.scoreEl=this.container.querySelector("#snake-score-val"),this.highEl=this.container.querySelector("#snake-high-val"),this.btnEl=s,this.hintEl=i,this._drawIdle(),document.addEventListener("keydown",this._onKey)}destroy(){this.interval&&clearInterval(this.interval),this.interval=null,document.removeEventListener("keydown",this._onKey),this.container&&this.container.parentNode&&this.container.parentNode.removeChild(this.container),this.container=null,this.canvas=null,this.ctx=null,this.state="idle"}startGame(){this.score=0,this.state="playing",this.dir={x:1,y:0},this.nextDir={x:1,y:0};const t=Math.floor(j/2),i=Math.floor(F/2);this.snake=[{x:t,y:i},{x:t-1,y:i},{x:t-2,y:i}],this._spawnFood(),this._updateUI(),this.btnEl&&(this.btnEl.textContent="⟳  Restart"),this.hintEl&&(this.hintEl.textContent="← ↑ ↓ → to move"),this.interval&&clearInterval(this.interval),this.interval=setInterval(()=>this._tick(),$e)}_handleKey(t){if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(t.key)&&this.state==="playing"&&t.preventDefault(),t.key==="Enter"){this.startGame();return}const s={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},w:{x:0,y:-1},s:{x:0,y:1},a:{x:-1,y:0},d:{x:1,y:0}}[t.key];s&&this.state==="playing"&&(s.x!==-this.dir.x||s.y!==-this.dir.y)&&(this.nextDir=s)}_tick(){if(this.state!=="playing")return;this.dir={...this.nextDir};const t=this.snake[0],i=t.x+this.dir.x,s=t.y+this.dir.y;if(i<0||i>=j||s<0||s>=F){this._die();return}if(this.snake.some(p=>p.x===i&&p.y===s)){this._die();return}this.snake.unshift({x:i,y:s}),i===this.food.x&&s===this.food.y?(this.score++,this._spawnFood()):this.snake.pop(),this._updateUI(),this._draw()}_die(){this.state="dead",this.score>this.highScore&&(this.highScore=this.score),clearInterval(this.interval),this.interval=null,this._updateUI(),this._animateDeath()}_animateDeath(){let t=0;const i=this.snake.length,s=setInterval(()=>{if(t>=i){clearInterval(s),this.btnEl&&(this.btnEl.textContent="▶  Play Again"),this.hintEl&&(this.hintEl.textContent=`Game Over — Score: ${this.score} · Enter to retry`);return}this.snake.pop(),this._draw(),t++},35)}_spawnFood(){let t;do t={x:Math.floor(Math.random()*j),y:Math.floor(Math.random()*F)};while(this.snake.some(i=>i.x===t.x&&i.y===t.y));this.food=t}_updateUI(){this.scoreEl&&(this.scoreEl.textContent=this.score),this.highEl&&(this.highEl.textContent=this.highScore)}_drawIdle(){if(!this.ctx)return;const t=this.ctx;t.clearRect(0,0,M,I),t.fillStyle=P.bg,t.fillRect(0,0,M,I),this._drawGrid(),t.fillStyle=P.textDim,t.font="500 11px -apple-system, sans-serif",t.textAlign="center",t.fillText("Press Play or Enter",M/2,I/2)}_draw(){if(!this.ctx)return;const t=this.ctx;t.clearRect(0,0,M,I),t.fillStyle=P.bg,t.fillRect(0,0,M,I),this._drawGrid();const i=this.food.x*d+d/2,s=this.food.y*d+d/2,p=t.createRadialGradient(i,s,0,i,s,d*2);p.addColorStop(0,P.foodGlow),p.addColorStop(1,"transparent"),t.fillStyle=p,t.fillRect(i-d*2,s-d*2,d*4,d*4),t.fillStyle=P.food,t.beginPath(),t.roundRect(this.food.x*d+1,this.food.y*d+1,d-2,d-2,3),t.fill(),this.snake.forEach((y,g)=>{const b=1-g/this.snake.length*.6;t.fillStyle=g===0?P.snake:`rgba(255, 255, 255, ${.25+b*.55})`,t.beginPath(),t.roundRect(y.x*d+1,y.y*d+1,d-2,d-2,g===0?4:3),t.fill()})}_drawGrid(){const t=this.ctx;t.strokeStyle=P.grid,t.lineWidth=.5;for(let i=0;i<=j;i++)t.beginPath(),t.moveTo(i*d,0),t.lineTo(i*d,I),t.stroke();for(let i=0;i<=F;i++)t.beginPath(),t.moveTo(0,i*d),t.lineTo(M,i*d),t.stroke()}}const Se=new Ye;Ge();Oe();document.addEventListener("DOMContentLoaded",()=>{const l=document.getElementById("ui-layer"),t=document.getElementById("loading-screen"),i=document.getElementById("finder-content"),s=document.getElementById("preview-pane"),p=document.getElementById("settings-modal"),y=document.getElementById("close-settings"),g=document.getElementById("mute-toggle"),b=document.querySelector(".window-title"),f=document.getElementById("nav-back"),E=document.querySelectorAll(".sidebar-item"),v=document.querySelector(".mac-window"),w=document.querySelector(".maximize-btn"),q=document.querySelector(".minimize-btn"),R=document.querySelector(".title-bar");let S="root",x=[],H=null,N=null,T=!1,J=!1,Q=0,Z=0,D=0,B=0,k="es";const C=document.getElementById("lang-toggle"),ue=document.querySelector("a-scene");ue&&ue.addEventListener("loaded",()=>{setTimeout(()=>{t.classList.add("fade-out"),setTimeout(()=>{t.style.display="none"},500)},1e3)});function pe(e,n){A(),e==="snake"&&(Se.mount(n),N=Se)}function A(){N&&(N.destroy(),N=null)}function G(e,n=null){if(e!=="settings"){if(l.classList.remove("active"),v.classList.remove("active"),n){const a=n.getBoundingClientRect(),r=a.left+a.width/2,o=a.top+a.height/2,m=window.innerWidth/2,c=window.innerHeight/2,de=m-410,me=c-260,he=r-de,He=o-me;v.style.transformOrigin=`${he}px ${He}px`}else v.style.transformOrigin="center center";requestAnimationFrame(()=>{if(l.classList.add("active"),v.classList.add("active"),ne(e),document.pointerLockElement&&document.exitPointerLock(),!localStorage.getItem("langHintSeen")){const a=document.getElementById("lang-hint");a&&C&&setTimeout(()=>{a.classList.add("show"),C.classList.add("highlight")},600)}}),D=0,B=0,te(0,0,v)}}function ge(){h.play("click",{volume:.4}),l.classList.remove("active"),v.classList.remove("active"),s.classList.remove("active"),A(),T&&ee();const e=document.querySelector("a-scene");e&&e.canvas.requestPointerLock()}document.getElementById("close-window").addEventListener("click",ge),l.addEventListener("click",e=>{e.target===l&&ge()}),w.addEventListener("click",e=>{e.stopPropagation(),ee()});function ee(){T?(v.classList.remove("maximized"),T=!1,te(D,B,v)):(v.classList.add("maximized"),T=!0)}q.addEventListener("click",e=>{e.stopPropagation(),T&&ee()}),C&&C.addEventListener("click",()=>{k=k==="es"?"en":"es",C.textContent=k.toUpperCase(),ie(S),O(S),s.classList.contains("active")&&H&&ae(H);const e=document.getElementById("lang-hint");e&&(e.classList.remove("show"),C.classList.remove("highlight"),localStorage.setItem("langHintSeen","true"))});const ve=document.getElementById("close-lang-hint");ve&&ve.addEventListener("click",()=>{const e=document.getElementById("lang-hint");e&&(e.classList.remove("show"),C.classList.remove("highlight"),localStorage.setItem("langHintSeen","true"))}),R.addEventListener("mousedown",Ce),document.addEventListener("mouseup",Ae),document.addEventListener("mousemove",Me);function Ce(e){T||e.target.closest(".control-btn")||e.target.closest(".nav-btn")||(Q=e.clientX-D,Z=e.clientY-B,(e.target===R||R.contains(e.target))&&(J=!0,R.style.cursor="grabbing"))}function Ae(e){Q=D,Z=B,J=!1,R.style.cursor="grab"}function Me(e){J&&(e.preventDefault(),D=e.clientX-Q,B=e.clientY-Z,te(D,B,v))}function te(e,n,a){a.style.transform=`translate(${e}px, ${n}px) scale(1)`}function ne(e){const n=_[e];if(!n){console.error("Path not found:",e);return}n.type==="folder"?(S!==e&&x[x.length-1]!==S&&x.push(S),S=e,A(),O(e),ie(e),f.style.opacity=x.length>0?"1":"0.3",f.style.pointerEvents=x.length>0?"auto":"none"):(n.type==="file"||n.type==="game")&&(h.play("click",{volume:.3}),ae(e))}function Ie(){if(x.length===0)return;const e=x.pop();S=e,A(),O(e),ie(e),f.style.opacity=x.length>0?"1":"0.3",f.style.pointerEvents=x.length>0?"auto":"none",s.classList.remove("active")}f.addEventListener("click",Ie),E.forEach(e=>{e.addEventListener("click",()=>{const n=e.getAttribute("data-path");x.push(S),ne(n)})});function O(e){const n=Ke(e),a=_[e],r=k==="en"&&a.nameEn?a.nameEn:a.name;b.textContent=`Finder — ${r}`,i.innerHTML="",s.classList.remove("active"),H=null,A(),n.forEach(o=>{const m=document.createElement("div");m.className="file-item";const c=k==="en"&&o.nameEn?o.nameEn:o.name,de=o.type==="game"?"file":o.type;m.innerHTML=`
                <div class="material-symbols-outlined file-icon ${de}">
                    ${o.icon||(o.type==="folder"?"folder":"description")}
                </div>
                <div class="file-name">${c}</div>
            `,m.addEventListener("mouseenter",()=>{h.play("hover",{volume:.2})}),m.addEventListener("click",me=>{me.stopPropagation(),document.querySelectorAll(".file-item").forEach(he=>he.classList.remove("selected")),m.classList.add("selected"),(o.type==="file"||o.type==="game")&&ae(o.id)}),m.addEventListener("dblclick",()=>{o.type==="folder"&&ne(o.id)}),i.appendChild(m)})}function ie(e){E.forEach(n=>{const a=n.getAttribute("data-path"),r=_[a];if(r){const o=k==="en"&&r.nameEn?r.nameEn:r.name,m=n.querySelector(".material-symbols-outlined").outerHTML;n.innerHTML=`${m} ${o}`}a===e?n.classList.add("active"):n.classList.remove("active")})}function ae(e){const n=Ue(e);if(!n)return;A(),H=e,s.classList.add("active");const a=k==="en"&&n.nameEn?n.nameEn:n.name,r=k==="en"&&n.contentEn?n.contentEn:n.content;document.getElementById("preview-icon").textContent=n.icon||"description",document.getElementById("preview-title").textContent=a;const o=document.getElementById("preview-meta");if(o){const c=n.type==="game"?k==="en"?"Interactive Game":"Juego Interactivo":n.type==="folder"?k==="en"?"Folder":"Carpeta":k==="en"?"Document":"Documento";o.textContent=c}const m=document.getElementById("preview-content");m.innerHTML=r,n.type==="game"&&n.gameId&&pe(n.gameId,m)}const K=document.getElementById("crosshair");document.querySelectorAll(".clickable").forEach(e=>{e.addEventListener("click",function(n){const a=this.getAttribute("data-path");if(a&&a!=="settings")if(a==="music-player")_e();else if(a==="arcade-system")Fe();else if(a==="forest-world"){h.play("click");const r=document.createElement("div");r.style.cssText="position:fixed;inset:0;background:#020818;z-index:10000;opacity:0;transition:opacity 0.8s ease;",document.body.appendChild(r),requestAnimationFrame(()=>{r.style.opacity="1"}),setTimeout(()=>{window.location.href="forest.html"},900)}else{const r=this.getAttribute("data-anchor");if(r){const o=document.getElementById(r);if(o){const m=o.getAttribute("position"),c=o.getAttribute("rotation");moveCameraTo(m,c,()=>{G(a)})}else G(a)}else G(a)}}),e.addEventListener("mouseenter",function(){h.play("hover",{volume:.3});const n=this.getAttribute("data-label");if(n){const a=document.getElementById(n);a&&a.setAttribute("visible",!0)}this.classList.contains("poster")||(this.components.material?this.setAttribute("material","emissive","#333"):this.object3D.traverse(a=>{a.isMesh&&(a.userData.originalEmissive=a.userData.originalEmissive||a.material.emissive.clone(),a.material.emissive.setHex(3355443))})),K&&K.classList.add("active-hover")}),e.addEventListener("mouseleave",function(){const n=this.getAttribute("data-label");if(n){const a=document.getElementById(n);a&&a.setAttribute("visible",!1)}this.classList.contains("poster")||(this.components.material?this.setAttribute("material","emissive","#000"):this.object3D.traverse(a=>{a.isMesh&&a.userData.originalEmissive&&a.material.emissive.copy(a.userData.originalEmissive)})),K&&K.classList.remove("active-hover")})}),document.querySelectorAll(".dock-item").forEach(e=>{e.addEventListener("mouseenter",()=>{h.play("hover",{volume:.3,variation:.1})}),e.addEventListener("click",function(){const n=this.getAttribute("data-path");n&&(n==="settings"?(Pe(),h.play("click")):G(n,this))})});function Pe(){l.classList.add("active"),p.classList.add("active")}function Te(){p.classList.remove("active"),l.classList.remove("active")}y&&y.addEventListener("click",Te),g&&g.addEventListener("change",e=>{h.toggleMute(),h.enabled&&h.play("click")});function De(e,n,a="info"){const r=document.getElementById("notification-area"),o=document.createElement("div");o.className="toast",o.innerHTML=`
            <div class="toast-icon">
                <span class="material-symbols-outlined">${a}</span>
            </div>
            <div class="toast-content">
                <div class="toast-title">${e}</div>
                <div class="toast-message">${n}</div>
            </div>
        `,o.addEventListener("click",()=>{o.classList.add("hiding"),setTimeout(()=>o.remove(),400)}),r.appendChild(o),setTimeout(()=>{o.isConnected&&(o.classList.add("hiding"),setTimeout(()=>o.remove(),400))},5e3)}setTimeout(()=>{De("Bienvenido","Explora mi portfolio.","handshake")},2e3),O("root");const z=document.getElementById("music-player-overlay"),u=document.getElementById("music-audio"),fe=document.getElementById("music-play-pause"),se=document.getElementById("music-play-icon"),ye=document.getElementById("music-progress-fill"),oe=document.getElementById("music-progress-bar"),Ee=document.getElementById("music-current-time"),Be=document.getElementById("music-duration"),be=document.getElementById("close-music-player");function we(e){if(isNaN(e))return"0:00";const n=Math.floor(e/60),a=Math.floor(e%60);return`${n}:${a.toString().padStart(2,"0")}`}function _e(){z.classList.add("active"),document.pointerLockElement&&document.exitPointerLock()}function ke(){h.play("click",{volume:.4}),z.classList.remove("active");const e=document.querySelector("a-scene");e&&e.canvas.requestPointerLock()}be&&be.addEventListener("click",ke),z&&z.addEventListener("click",e=>{e.target===z&&ke()});const U=document.getElementById("arcade-ui-layer"),re=document.getElementById("arcade-content"),xe=document.getElementById("close-arcade");let $=null;function Re(){const e=document.getElementById("arcade-particles-canvas");if(!e)return;const n=e.getContext("2d"),a=[],r=60;function o(){e.width=e.offsetWidth,e.height=e.offsetHeight}o(),window.addEventListener("resize",o);for(let c=0;c<r;c++)a.push({x:Math.random()*e.width,y:Math.random()*e.height,r:Math.random()*1.5+.3,dx:(Math.random()-.5)*.3,dy:-(Math.random()*.4+.1),hue:[340,50,190,270][Math.floor(Math.random()*4)],alpha:Math.random()*.5+.2});function m(){n.clearRect(0,0,e.width,e.height);for(const c of a)n.beginPath(),n.arc(c.x,c.y,c.r,0,Math.PI*2),n.fillStyle=`hsla(${c.hue}, 100%, 70%, ${c.alpha})`,n.shadowBlur=8,n.shadowColor=`hsla(${c.hue}, 100%, 60%, 0.4)`,n.fill(),c.x+=c.dx,c.y+=c.dy,c.y<-5&&(c.y=e.height+5,c.x=Math.random()*e.width),(c.x<-5||c.x>e.width+5)&&(c.x=Math.random()*e.width);$=requestAnimationFrame(m)}m()}function ze(){$&&(cancelAnimationFrame($),$=null)}function je(){re.innerHTML=`
            <div class="arcade-menu">
                <div class="arcade-menu-kanji">ゲームセンター</div>
                <div class="arcade-menu-title" data-text="ARCADE ZONE">ARCADE ZONE</div>
                <div class="arcade-menu-subtitle">── SELECT YOUR GAME ──</div>
                <div class="arcade-menu-divider"></div>
                
                <div class="arcade-carousel-container">
                    <div class="arcade-nav-hint arcade-nav-left" id="arcade-nav-left">❮</div>
                    
                    <div class="arcade-carousel" id="arcade-carousel">
                        <div class="arcade-carousel-item" data-index="0" id="play-snake-card">
                            <div class="arcade-game-icon">🐍</div>
                            <div class="arcade-game-name">SNAKE</div>
                            <div class="arcade-game-desc">Classic retro survival — eat & grow</div>
                            <span class="arcade-game-tag playable">PLAY</span>
                        </div>
                        <div class="arcade-carousel-item" data-index="1" id="play-coming-soon-1">
                            <div class="arcade-game-icon">👾</div>
                            <div class="arcade-game-name">SPACE RAIDERS</div>
                            <div class="arcade-game-desc">Defend Earth from pixel invaders</div>
                            <span class="arcade-game-tag soon">SOON</span>
                        </div>
                        <div class="arcade-carousel-item" data-index="2" id="play-coming-soon-2">
                            <div class="arcade-game-icon">🏎️</div>
                            <div class="arcade-game-name">NEON DRIFT</div>
                            <div class="arcade-game-desc">Synthwave racing through the grid</div>
                            <span class="arcade-game-tag soon">SOON</span>
                        </div>
                    </div>
                    
                    <div class="arcade-nav-hint arcade-nav-right" id="arcade-nav-right">❯</div>
                </div>
            </div>
        `;const e=document.querySelectorAll(".arcade-carousel-item");let n=0;function a(){e.forEach((r,o)=>{r.className="arcade-carousel-item",o===n?r.classList.add("active"):o===(n-1+e.length)%e.length?r.classList.add("prev"):o===(n+1)%e.length&&r.classList.add("next")})}a(),document.getElementById("arcade-nav-left").addEventListener("click",()=>{n=(n-1+e.length)%e.length,h.play("click",{volume:.2}),a()}),document.getElementById("arcade-nav-right").addEventListener("click",()=>{n=(n+1)%e.length,h.play("click",{volume:.2}),a()}),e.forEach((r,o)=>{r.addEventListener("click",()=>{o===n?r.id==="play-snake-card"?(h.play("click",{volume:.4}),re.innerHTML="",pe("snake",re)):h.play("error",{volume:.2}):(n=o,h.play("click",{volume:.2}),a())})})}function Fe(){U&&(window.arcadeCurrentX=0,window.arcadeCurrentY=0,Y&&(Y.style.transform="translate(0px, 0px)"),U.classList.add("active"),document.pointerLockElement&&document.exitPointerLock(),je(),Re())}function qe(){h.play("click",{volume:.4}),U&&U.classList.remove("active"),A(),ze();const e=document.querySelector("a-scene");e&&e.canvas.requestPointerLock()}xe&&xe.addEventListener("click",qe);const Le=document.querySelector(".arcade-header"),Y=document.querySelector(".arcade-screen-container");let V=!1,ce=0,le=0;window.arcadeCurrentX=window.arcadeCurrentX||0,window.arcadeCurrentY=window.arcadeCurrentY||0,Le&&Y&&(Le.addEventListener("mousedown",e=>{e.target.closest(".control-btn")||(ce=e.clientX-window.arcadeCurrentX,le=e.clientY-window.arcadeCurrentY,V=!0)}),document.addEventListener("mouseup",()=>{V&&(ce=window.arcadeCurrentX,le=window.arcadeCurrentY,V=!1)}),document.addEventListener("mousemove",e=>{V&&(e.preventDefault(),window.arcadeCurrentX=e.clientX-ce,window.arcadeCurrentY=e.clientY-le,Y.style.transform=`translate(${window.arcadeCurrentX}px, ${window.arcadeCurrentY}px)`)})),fe&&u&&fe.addEventListener("click",()=>{u.paused?(u.play(),se.textContent="pause"):(u.pause(),se.textContent="play_arrow")}),u&&(u.addEventListener("loadedmetadata",()=>{Be.textContent=we(u.duration)}),u.addEventListener("timeupdate",()=>{if(u.duration){const e=u.currentTime/u.duration*100;ye.style.width=e+"%",Ee.textContent=we(u.currentTime)}}),u.addEventListener("ended",()=>{se.textContent="play_arrow",ye.style.width="0%",Ee.textContent="0:00"})),oe&&u&&oe.addEventListener("click",e=>{const n=oe.getBoundingClientRect(),a=(e.clientX-n.left)/n.width;u.duration&&(u.currentTime=a*u.duration)});const L=document.getElementById("ambient-audio");let W=!1;L&&(L.volume=.3),document.addEventListener("keydown",e=>{e.key.toLowerCase()==="m"&&L&&(L.paused?(L.play().catch(n=>console.log("Audio play failed:",n)),W=!0):(L.pause(),W=!1))});const X=()=>{L&&!W&&L.paused&&L.play().then(()=>{W=!0}).catch(e=>console.log("Audio autoplay prevented")),document.removeEventListener("click",X),document.removeEventListener("keydown",X)};document.addEventListener("click",X),document.addEventListener("keydown",X)});
