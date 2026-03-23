// Pac-Man Game Controller

// Configuration
const GRID_SIZE = 15;
const GRID_ROWS = 10;
const GAME_SPEED = 100; // ms between moves

// State
let pacmanPos = { x: 0, y: 7 };
let direction = 'right';
let dots = [];
let dotsEaten = 0;
let gameStarted = false;
let currentProject = 0;
let totalDots = 0;
let lastMoveTime = 0;
let visitedCells = [];

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

    renderGame();
    updateProjectOpacity();
}

function setupGrid(grid) {
    grid.innerHTML = '';
    grid.style.display              = 'grid';
    grid.style.gridTemplateColumns  = `repeat(${GRID_SIZE}, 1fr)`;
    grid.style.gridTemplateRows     = `repeat(${GRID_ROWS}, 1fr)`;
    grid.style.gap                  = '0';
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
            const cell      = document.createElement('div');
            cell.className  = 'grid-cell';

            const isPacman  = pacmanPos.x === x && pacmanPos.y === y;
            const dot       = dots.find(d => d.x === x && d.y === y);
            const isVisited = visitedCells.some(c => c.x === x && c.y === y);

            if (isVisited || (dot && dot.eaten)) {
                cell.appendChild(makeRevealBg(x, y));
            }

            if (isPacman) {
                cell.appendChild(makePacman(direction));
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
    el.className = `pacman-img ${dir}`;
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
    if (now - lastMoveTime < GAME_SPEED) return;

    let { x: newX, y: newY } = pacmanPos;

    if      (e.key === 'ArrowLeft')  { direction = 'left';  if (newX > 0)              newX--; }
    else if (e.key === 'ArrowRight') { direction = 'right'; if (newX < GRID_SIZE - 1)  newX++; }
    else if (e.key === 'ArrowUp')    { direction = 'up';    if (newY > 0)              newY--; }
    else if (e.key === 'ArrowDown')  { direction = 'down';  if (newY < GRID_ROWS - 1) newY++; }

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
    projectImg.alt          = project.title;
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
