// Pac-Man Game Controller

// Configuration
const GRID_SIZE = 15;
const GRID_ROWS = 10;
const GAME_SPEED = 100; // ms between moves

// Skill icon definitions
const SKILL_ICONS = [
    { type: 'figma',        src: 'assets/icons/figma-icon.svg',  label: '+ UI/UX Thinking Unlocked' },
    { type: 'ai',           src: 'assets/icons/magic-icon.svg',  label: '+ AI Workflow Activated'   },
    { type: 'aftereffects', src: 'assets/icons/after-effect.svg',label: '+ Motion Design Unlocked'  },
];

// State
let pacmanPos    = { x: 0, y: 7 };
let direction    = 'right';
let dots         = [];
let dotsEaten    = 0;
let gameStarted  = false;
let currentProject = 0;
let totalDots    = 0;
let lastMoveTime = 0;
let visitedCells = [];

// Skill state
let skillIcons   = [];   // { x, y, type, collected }
let magnetMode   = false;
let trailMode    = false;
let aiPowerMode  = false;
let currentSpeed = GAME_SPEED;
let pacmanTrail  = [];   // last positions for motion trail
let effectTimers = [];   // ids for cleanup on reset

// DOM references
let gameGrid, startOverlay, startGame, projectImg, projectTitle, projectDesc, projectInfo, prevProjectBtn, nextProjectBtn;

// ── Initialization ────────────────────────────────────────────────────────────

function initGame() {
    gameGrid       = document.getElementById('gameGrid');
    startOverlay   = document.getElementById('startOverlay');
    startGame      = document.getElementById('startGame');
    projectImg     = document.getElementById('projectImg');
    projectTitle   = document.getElementById('projectTitle');
    projectDesc    = document.getElementById('projectDesc');
    projectInfo    = document.getElementById('projectInfo');
    prevProjectBtn = document.getElementById('prevProject');
    nextProjectBtn = document.getElementById('nextProject');

    if (startGame)      startGame.addEventListener('click', startGameHandler);
    if (prevProjectBtn) prevProjectBtn.addEventListener('click', prevProjectHandler);
    if (nextProjectBtn) nextProjectBtn.addEventListener('click', nextProjectHandler);

    const startExploring = document.getElementById('startExploring');
    if (startExploring) startExploring.addEventListener('click', () => navigateTo('work'));

    window.addEventListener('keydown', handleKeyPress);

    updateProject();
    initializeGridOnly();
}

// ── Game Flow ─────────────────────────────────────────────────────────────────

function startGameHandler() {
    if (!gameStarted) {
        gameStarted = true;
        startOverlay.classList.add('hidden');
        initializeDots();
    } else {
        resetGame();
    }
}

function resetGame() {
    gameStarted  = false;
    dotsEaten    = 0;
    pacmanPos    = { x: 0, y: 7 };
    direction    = 'right';
    dots         = [];
    lastMoveTime = 0;
    visitedCells = [];

    // Reset skill state
    skillIcons   = [];
    magnetMode   = false;
    trailMode    = false;
    aiPowerMode  = false;
    currentSpeed = GAME_SPEED;
    pacmanTrail  = [];
    effectTimers.forEach(clearTimeout);
    effectTimers = [];

    // Remove effect classes
    gameGrid.classList.remove('figma-grid-overlay', 'ai-power-glow');

    startOverlay.classList.remove('hidden');
    initializeGridOnly();
    updateProjectOpacity();
}

// ── Dots & Grid ───────────────────────────────────────────────────────────────

function initializeDots() {
    dots      = [];
    totalDots = 0;

    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (x === 0 && y === 7) continue;
            dots.push({ x, y, eaten: false });
            totalDots++;
        }
    }

    dotsEaten    = 0;
    pacmanPos    = { x: 0, y: 7 };
    direction    = 'right';
    lastMoveTime = 0;
    visitedCells = [{ x: 0, y: 7 }];

    spawnSkillIcons();
    renderGame();
    updateProjectOpacity();
}

function setupGrid(grid) {
    grid.innerHTML = '';
    grid.style.display             = 'grid';
    grid.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
    grid.style.gridTemplateRows    = `repeat(${GRID_ROWS}, 1fr)`;
    grid.style.gap                 = '0';
}

function initializeGridOnly() {
    setupGrid(gameGrid);

    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.appendChild(makeBgContainer());

            if (x === 0 && y === 7) {
                cell.appendChild(makePacman(direction));
            } else {
                cell.appendChild(makeDot());
            }

            gameGrid.appendChild(cell);
        }
    }
}

function renderGame() {
    setupGrid(gameGrid);

    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell     = document.createElement('div');
            cell.className = 'grid-cell';

            const isPacman  = pacmanPos.x === x && pacmanPos.y === y;
            const dot       = dots.find(d => d.x === x && d.y === y);
            const isVisited = visitedCells.some(c => c.x === x && c.y === y);
            const skill     = skillIcons.find(s => s.x === x && s.y === y && !s.collected);

            // Trail cells (After Effects)
            const trailIdx = trailMode ? pacmanTrail.findIndex(t => t.x === x && t.y === y) : -1;

            if (isVisited || (dot && dot.eaten)) {
                cell.appendChild(makeRevealBg(x, y));
            }

            if (isPacman) {
                cell.appendChild(makePacman(direction));
            } else if (trailIdx !== -1) {
                const opacity = 0.15 + (trailIdx / pacmanTrail.length) * 0.25;
                cell.appendChild(makeTrailPacman(direction, opacity));
            } else if (skill) {
                cell.appendChild(makeSkillIcon(skill));
            } else if (dot && !dot.eaten) {
                cell.appendChild(makeDot());
            }

            gameGrid.appendChild(cell);
        }
    }

    if (dotsEaten === totalDots) {
        prevProjectBtn.classList.remove('hidden');
        nextProjectBtn.classList.remove('hidden');
        document.querySelectorAll('.pacman-img').forEach(p => { p.style.display = 'none'; });
    }
}

// ── Skill Icons ───────────────────────────────────────────────────────────────

function spawnSkillIcons() {
    skillIcons = [];
    const occupied = new Set([`0,7`]);
    const candidates = [];

    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (!occupied.has(`${x},${y}`)) candidates.push({ x, y });
        }
    }

    // Shuffle and pick 3 well-spread positions
    shuffle(candidates);
    const spread = spreadPick(candidates, 3, 4);

    SKILL_ICONS.forEach((def, i) => {
        if (spread[i]) {
            skillIcons.push({ x: spread[i].x, y: spread[i].y, type: def.type, collected: false });
        }
    });
}

// Fisher-Yates shuffle (in-place)
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Pick N items spaced at least `minDist` cells apart (Manhattan)
function spreadPick(candidates, n, minDist) {
    const chosen = [];
    for (const c of candidates) {
        if (chosen.length >= n) break;
        const tooClose = chosen.some(p => Math.abs(p.x - c.x) + Math.abs(p.y - c.y) < minDist);
        if (!tooClose) chosen.push(c);
    }
    return chosen;
}

function collectSkillIcon(skill) {
    skill.collected = true;

    showFloatingMessage(skill.type);
    applySkillEffect(skill.type);
}

function applySkillEffect(type) {
    clearPreviousEffect(type);

    if (type === 'figma') {
        gameGrid.classList.add('figma-grid-overlay');
        const t = setTimeout(() => gameGrid.classList.remove('figma-grid-overlay'), 2000);
        effectTimers.push(t);

    } else if (type === 'ai') {
        aiPowerMode  = true;
        magnetMode   = true;
        currentSpeed = 60; // faster
        gameGrid.classList.add('ai-power-glow');

        const t = setTimeout(() => {
            aiPowerMode  = false;
            magnetMode   = false;
            currentSpeed = GAME_SPEED;
            gameGrid.classList.remove('ai-power-glow');
        }, 3000);
        effectTimers.push(t);

    } else if (type === 'aftereffects') {
        trailMode = true; // stays until reset
    }
}

function clearPreviousEffect(type) {
    // nothing to pre-clear; timers cleaned on reset
}

// Magnet: auto-collect skill icons within radius
function applyMagnet(radius) {
    const r = aiPowerMode ? radius + 1 : radius;
    skillIcons.forEach(s => {
        if (s.collected) return;
        const dist = Math.abs(s.x - pacmanPos.x) + Math.abs(s.y - pacmanPos.y);
        if (dist <= r) collectSkillIcon(s);
    });
}

// ── Floating Messages ─────────────────────────────────────────────────────────

function showFloatingMessage(type) {
    const def = SKILL_ICONS.find(d => d.type === type);
    if (!def) return;

    // Find the pacman cell index to position message
    const cellIdx = pacmanPos.y * GRID_SIZE + pacmanPos.x;
    const cells = gameGrid.querySelectorAll('.grid-cell');
    const anchor = cells[cellIdx];
    if (!anchor) return;

    const msg = document.createElement('div');
    msg.className = 'floating-msg';
    msg.textContent = def.label;

    // Position relative to gameGrid
    const gridRect   = gameGrid.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    msg.style.left = (anchorRect.left - gridRect.left + anchorRect.width / 2) + 'px';
    msg.style.top  = (anchorRect.top  - gridRect.top  - 8) + 'px';

    // Color by type
    const colors = { figma: '#a78bfa', ai: '#34d399', aftereffects: '#60a5fa' };
    msg.style.color = colors[type] || '#fff';

    gameGrid.appendChild(msg);
    setTimeout(() => msg.remove(), 1600);
}

// ── DOM Element Factories ─────────────────────────────────────────────────────

function makeBgContainer() {
    const el = document.createElement('div');
    el.className = 'cell-background';
    return el;
}

function makeDot() {
    const el = document.createElement('div');
    el.className = 'dot';
    return el;
}

function makePacman(dir) {
    const el = document.createElement('img');
    el.src       = 'assets/images/pacman.svg';
    el.className = `pacman-img ${dir}${trailMode ? ' trail-pacman' : ''}`;
    return el;
}

function makeTrailPacman(dir, opacity) {
    const el = document.createElement('img');
    el.src       = 'assets/images/pacman.svg';
    el.className = `pacman-img ${dir} trail-ghost`;
    el.style.opacity = opacity;
    return el;
}

function makeSkillIcon(skill) {
    const def = SKILL_ICONS.find(d => d.type === skill.type);
    const el = document.createElement('img');
    el.src       = def.src;
    el.className = 'skill-icon';
    el.alt       = skill.type;
    return el;
}

function makeRevealBg(x, y) {
    const el  = makeBgContainer();
    const url = projectImg?.src || '';
    if (url) {
        el.style.backgroundImage    = `url('${url}')`;
        el.style.backgroundSize     = `${GRID_SIZE * 100}% ${GRID_ROWS * 100}%`;
        el.style.backgroundPosition = `${(x / (GRID_SIZE - 1)) * 100}% ${(y / (GRID_ROWS - 1)) * 100}%`;
        el.style.backgroundRepeat   = 'no-repeat';
    }
    return el;
}

// ── Input Handling ────────────────────────────────────────────────────────────

const ARROW_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

function handleKeyPress(e) {
    if (!gameStarted || dotsEaten >= totalDots) return;
    if (!ARROW_KEYS.has(e.key)) return;

    e.preventDefault();

    const now = Date.now();
    if (now - lastMoveTime < currentSpeed) return;

    let { x: newX, y: newY } = pacmanPos;

    if      (e.key === 'ArrowLeft')  { direction = 'left';  if (newX > 0)             newX--; }
    else if (e.key === 'ArrowRight') { direction = 'right'; if (newX < GRID_SIZE - 1) newX++; }
    else if (e.key === 'ArrowUp')    { direction = 'up';    if (newY > 0)             newY--; }
    else if (e.key === 'ArrowDown')  { direction = 'down';  if (newY < GRID_ROWS - 1) newY++; }

    // Update trail (After Effects)
    if (trailMode) {
        pacmanTrail.unshift({ x: pacmanPos.x, y: pacmanPos.y });
        if (pacmanTrail.length > 4) pacmanTrail.pop();
    }

    pacmanPos    = { x: newX, y: newY };
    lastMoveTime = now;

    if (!visitedCells.some(c => c.x === newX && c.y === newY)) {
        visitedCells.push({ x: newX, y: newY });
    }

    dots.forEach(dot => {
        if (dot.x === newX && dot.y === newY && !dot.eaten) {
            dot.eaten = true;
            dotsEaten++;
            updateProjectOpacity();
        }
    });

    // Check skill icon collision
    skillIcons.forEach(s => {
        if (!s.collected && s.x === newX && s.y === newY) {
            collectSkillIcon(s);
        }
    });

    // Apply magnet if active
    if (magnetMode) applyMagnet(3);

    renderGame();
}

// ── Project Display ───────────────────────────────────────────────────────────

function updateProject() {
    const project = window.projects[currentProject];
    if (window.preloadProjectImage) {
        window.preloadProjectImage(projectImg, project.image);
    } else {
        projectImg.src = project.image;
    }
    projectImg.alt           = project.title;
    projectTitle.textContent = project.title;
    projectDesc.textContent  = project.description;
    updateProjectOpacity();
}

function updateProjectOpacity() {
    projectImg.style.opacity  = 0;
    projectInfo.style.opacity = 0;
}

function prevProjectHandler() {
    currentProject = (currentProject - 1 + window.projects.length) % window.projects.length;
    updateProject();
    resetGame();
}

function nextProjectHandler() {
    currentProject = (currentProject + 1) % window.projects.length;
    updateProject();
    resetGame();
}

// ── Public API ────────────────────────────────────────────────────────────────

window.initGame  = initGame;
window.resetGame = resetGame;
