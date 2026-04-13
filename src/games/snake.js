/**
 * Snake Game — Minimalist Apple-Style Easter Egg
 * Rendered on a <canvas> inside the Finder preview pane.
 * Monochromatic aesthetic, smooth animations, keyboard controls.
 */

const CELL = 12;        // px per grid cell
const COLS = 18;
const ROWS = 18;
const CANVAS_W = COLS * CELL;
const CANVAS_H = ROWS * CELL;
const TICK_MS = 110;    // game speed (ms per frame)

// Colors — monochrome with a single accent
const C = {
    bg:       'rgba(0, 0, 0, 0.25)',
    grid:     'rgba(255, 255, 255, 0.03)',
    snake:    'rgba(255, 255, 255, 0.85)',
    snakeDim: 'rgba(255, 255, 255, 0.35)',
    food:     '#007AFF',
    foodGlow: 'rgba(0, 122, 255, 0.25)',
    text:     'rgba(255, 255, 255, 0.7)',
    textDim:  'rgba(255, 255, 255, 0.25)',
};

class SnakeGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.container = null;
        this.interval = null;
        this.score = 0;
        this.highScore = 0;
        this.state = 'idle'; // 'idle' | 'playing' | 'dead'
        this.snake = [];
        this.dir = { x: 1, y: 0 };
        this.nextDir = { x: 1, y: 0 };
        this.food = { x: 0, y: 0 };
        this.deathFrame = 0;

        // Bind keyboard handler so we can remove it later
        this._onKey = this._handleKey.bind(this);
    }

    /**
     * Mount the game inside a DOM element (the preview-content div).
     * @param {HTMLElement} parentEl
     */
    mount(parentEl) {
        this.destroy(); // clean up any previous instance

        // Build DOM
        this.container = document.createElement('div');
        this.container.className = 'snake-container';
        this.container.innerHTML = `
            <div class="snake-header">
                <span class="snake-score">Score: <span id="snake-score-val">0</span></span>
                <span class="snake-score">Best: <span id="snake-high-val">0</span></span>
            </div>
        `;

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'snake-canvas';
        this.canvas.width = CANVAS_W;
        this.canvas.height = CANVAS_H;
        this.container.appendChild(this.canvas);

        const hint = document.createElement('div');
        hint.className = 'snake-controls-hint';
        hint.textContent = '← ↑ ↓ → to move · Enter to start';
        this.container.appendChild(hint);

        const btn = document.createElement('button');
        btn.className = 'snake-btn';
        btn.textContent = '▶  Play';
        btn.id = 'snake-play-btn';
        btn.addEventListener('click', () => this.startGame());
        this.container.appendChild(btn);

        parentEl.appendChild(this.container);

        this.ctx = this.canvas.getContext('2d');
        this.scoreEl = this.container.querySelector('#snake-score-val');
        this.highEl = this.container.querySelector('#snake-high-val');
        this.btnEl = btn;
        this.hintEl = hint;

        // Draw idle state
        this._drawIdle();

        // Listen for keys
        document.addEventListener('keydown', this._onKey);
    }

    /**
     * Tear down game completely.
     */
    destroy() {
        if (this.interval) clearInterval(this.interval);
        this.interval = null;
        document.removeEventListener('keydown', this._onKey);
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        this.state = 'idle';
    }

    startGame() {
        this.score = 0;
        this.state = 'playing';
        this.dir = { x: 1, y: 0 };
        this.nextDir = { x: 1, y: 0 };

        // Init snake in center
        const cx = Math.floor(COLS / 2);
        const cy = Math.floor(ROWS / 2);
        this.snake = [
            { x: cx, y: cy },
            { x: cx - 1, y: cy },
            { x: cx - 2, y: cy },
        ];

        this._spawnFood();
        this._updateUI();

        if (this.btnEl) {
            this.btnEl.textContent = '⟳  Restart';
        }
        if (this.hintEl) {
            this.hintEl.textContent = '← ↑ ↓ → to move';
        }

        // Start loop
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => this._tick(), TICK_MS);
    }

    // ---- Private methods ----

    _handleKey(e) {
        // Prevent scrolling while playing
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            if (this.state === 'playing') e.preventDefault();
        }

        if (e.key === 'Enter') {
            this.startGame();
            return;
        }

        // Direction — prevent 180° reversal
        const map = {
            ArrowUp:    { x:  0, y: -1 },
            ArrowDown:  { x:  0, y:  1 },
            ArrowLeft:  { x: -1, y:  0 },
            ArrowRight: { x:  1, y:  0 },
            w: { x:  0, y: -1 },
            s: { x:  0, y:  1 },
            a: { x: -1, y:  0 },
            d: { x:  1, y:  0 },
        };

        const nd = map[e.key];
        if (nd && this.state === 'playing') {
            // Prevent 180
            if (nd.x !== -this.dir.x || nd.y !== -this.dir.y) {
                this.nextDir = nd;
            }
        }
    }

    _tick() {
        if (this.state !== 'playing') return;

        this.dir = { ...this.nextDir };

        const head = this.snake[0];
        const nx = head.x + this.dir.x;
        const ny = head.y + this.dir.y;

        // Collision: walls
        if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
            this._die();
            return;
        }

        // Collision: self
        if (this.snake.some(s => s.x === nx && s.y === ny)) {
            this._die();
            return;
        }

        // Move
        this.snake.unshift({ x: nx, y: ny });

        // Eat food?
        if (nx === this.food.x && ny === this.food.y) {
            this.score++;
            this._spawnFood();
        } else {
            this.snake.pop();
        }

        this._updateUI();
        this._draw();
    }

    _die() {
        this.state = 'dead';
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
        clearInterval(this.interval);
        this.interval = null;
        this._updateUI();
        this._animateDeath();
    }

    _animateDeath() {
        let frame = 0;
        const totalFrames = this.snake.length;
        const deathInterval = setInterval(() => {
            if (frame >= totalFrames) {
                clearInterval(deathInterval);
                // Show restart
                if (this.btnEl) this.btnEl.textContent = '▶  Play Again';
                if (this.hintEl) this.hintEl.textContent = `Game Over — Score: ${this.score} · Enter to retry`;
                return;
            }
            // Fade out segments one by one from tail
            this.snake.pop();
            this._draw();
            frame++;
        }, 35);
    }

    _spawnFood() {
        let pos;
        do {
            pos = {
                x: Math.floor(Math.random() * COLS),
                y: Math.floor(Math.random() * ROWS),
            };
        } while (this.snake.some(s => s.x === pos.x && s.y === pos.y));
        this.food = pos;
    }

    _updateUI() {
        if (this.scoreEl) this.scoreEl.textContent = this.score;
        if (this.highEl) this.highEl.textContent = this.highScore;
    }

    _drawIdle() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        // Background
        ctx.fillStyle = C.bg;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Grid
        this._drawGrid();

        // Centered text
        ctx.fillStyle = C.textDim;
        ctx.font = '500 11px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Press Play or Enter', CANVAS_W / 2, CANVAS_H / 2);
    }

    _draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        // Background
        ctx.fillStyle = C.bg;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Grid
        this._drawGrid();

        // Food glow
        const fx = this.food.x * CELL + CELL / 2;
        const fy = this.food.y * CELL + CELL / 2;
        const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, CELL * 2);
        glow.addColorStop(0, C.foodGlow);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(fx - CELL * 2, fy - CELL * 2, CELL * 4, CELL * 4);

        // Food
        ctx.fillStyle = C.food;
        ctx.beginPath();
        ctx.roundRect(this.food.x * CELL + 1, this.food.y * CELL + 1, CELL - 2, CELL - 2, 3);
        ctx.fill();

        // Snake
        this.snake.forEach((seg, i) => {
            const t = 1 - (i / this.snake.length) * 0.6; // gradient from head to tail
            ctx.fillStyle = i === 0 ? C.snake : `rgba(255, 255, 255, ${0.25 + t * 0.55})`;
            ctx.beginPath();
            ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, i === 0 ? 4 : 3);
            ctx.fill();
        });
    }

    _drawGrid() {
        const ctx = this.ctx;
        ctx.strokeStyle = C.grid;
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= COLS; x++) {
            ctx.beginPath();
            ctx.moveTo(x * CELL, 0);
            ctx.lineTo(x * CELL, CANVAS_H);
            ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * CELL);
            ctx.lineTo(CANVAS_W, y * CELL);
            ctx.stroke();
        }
    }
}

// Export singleton instance
export const snakeGame = new SnakeGame();
