Actúa como un Senior Creative Technologist y Diseñador UI especializado en estética retro-tecnológica de consolas de sexta generación (principios de los 2000 / era PlayStation 2).

Tu objetivo es refactorizar por completo la página de bienvenida (`index.html` y sus estilos/scripts asociados) para convertirla en una antesala inmersiva tipo "Title Screen / System Configuration Menu" de PS2, que sirva como puerta de entrada a mi experiencia 3D principal.

---

### 1. Dirección de Arte & Estética Visual

- **Referencia conceptual:** La sobriedad técnica del menú de arranque de PS2, la interfaz del navegador de Memory Card y la arquitectura de interfaces japonesas de hardware de 2000-2003 (estilo industrial, dither sutil, minimalismo funcional).
- **Paleta de Colores (Estricta):**
  - Fondo primario: Negro mate profundo (`#020408` a `#050811`).
  - Capas intermedias: Azul marino oscuro / Medianoche desaturado (`#0B1320`, `#111C2E`).
  - Detalles estructurales y bordes: Acero frío / Pizarra oscuro (`#1E293B`, `#334155`).
  - Tipografía activa: Blanco neutro (`#F8FAFC`) con fondos de selección en bloque sólido.
  - Tipografía secundaria / inactiva: Gris técnico (`#64748B`).
- **PROHIBICIÓN ESTRICTA (Anti-estética):**
  - CERO colores neón (nada de cian chillón, magenta, fucsia o verde fosforito).
  - CERO sombras luminiscentes (`box-shadow: 0 0 20px #cyan`), efectos de bloom exagerado o aberración cromática agresiva.
  - Evitar clichés "synthwave" u "80s retro arcade". La textura debe ser fría, industrial, digital y limpia.

---

### 2. Estructura y Componentes de la Pantalla (Layout)

1. **Header Técnico (Top Bar):**
   - Discreto y alineado a los bordes con espaciado técnico.
   - Datos simulados de sistema en tipografía monoespaciada pequeña: versión del sistema, reloj UTC dinámico, y estado de conexión/memoria (ej. `SYS.CONFIG // PORTFOLIO_BUILD_2026 // READY`).

2. **Visor Central 3D (Character Turntable):**
   - Un contenedor WebGL centrado o en split-view (60% modelo / 40% menú) con fondo transparente integrado sobre el azul marino.
   - Configuración Three.js: Cargar el modelo del personaje (`.glb`/`.gltf`) centrado sobre un pedestal geométrico circular o hexagonal plano de tono grafito oscuro.
   - Iluminación: Luz principal direccional fría (3-point lighting sobrio), luz de rebote muy tenue en azul marino oscuro para recortar la silueta, sin bloom ni reflejos especulares deslumbrantes.
   - Animación: Rotación suave y continua sobre el eje Y (turntable interactivo, arrastrable con ratón).

3. **Menú de Opciones (Console Navigation Menu):**
   - Menú vertical con navegación tanto por teclado (Flechas Arriba/Abajo + Enter/Espacio) como por ratón.
   - Opciones:
     - `[ START EXPERIENCE ]` -> Redirige a la sala 3D principal.
     - `[ CONTROLS / GUIDE ]` -> Despliega un panel lateral técnico con el mapeo de teclas (WASD / Flechas / Click).
     - `[ ARCHIVE / ABOUT ]` -> Resumen breve de perfil técnico en formato de ficha de datos de consola.
   - Indicador de selección: Cursor geométrico plano (ej. un bloque sólido que rodea el texto o un cursor cuadrado `■` / `▶` que no parpadea con neón, sino con un pulso discreto de opacidad).
   - Efectos sonoros opcionales: Hooks preparados para disparar sonidos sutiles de interfaz tipo "clic seco / blip de consola" (sin sintetizadores estridentes).

4. **Footer Técnico:**
   - Mapeo de botones de ayuda en la esquina inferior (ej. `[ENTER] SELECT  |  [ARROWS] NAVIGATE  |  [DRAG] ROTATE MODEL`).

---

### 3. Tipografía y Microdetalles Visuales

- Fuentes recomendadas (Google Fonts o web-safe): Monospace o Sans geométrica técnica tipo *Space Grotesk*, *Chakra Petch*, *Share Tech Mono* o *Rajdhani*.
- Capa de textura ambiental opcional: Un sutil filtro overlay en CSS con patrón de rejilla técnica milimétrica o dither suave al 2-3% de opacidad para romper el degradado plano y evocar monitores CRT/LCD tempranos sin ensuciar la legibilidad.

---

### 4. Requisitos de Código

- Código limpio, semántico, modular y responsive.
- Mantén la carga del modelo 3D optimizada con un loader discreto que muestre el porcentaje estilo barra de progreso de BIOS de sistema.
- Genera el código completo de los archivos modificados con comentarios explicativos.
