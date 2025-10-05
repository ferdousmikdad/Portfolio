// Pac-Man Game Controller

// Game Configuration
const GRID_SIZE = 15;
const GRID_ROWS = 10;
const GAME_SPEED = 100; // Movement delay in milliseconds (higher = slower)

// Game State for Home Page
let pacmanPos = { x: 0, y: 7 };
let direction = 'right';
let dots = [];
let dotsEaten = 0;
let gameStarted = false;
let currentProject = 0;
let totalDots = 0;
let lastMoveTime = 0;
let visitedCells = []; // Track cells Pac-Man has visited

// Game State for Work Page
let pacmanPos2 = { x: 0, y: 7 };
let direction2 = 'right';
let dots2 = [];
let dotsEaten2 = 0;
let gameStarted2 = false;
let currentProject2 = 0;
let totalDots2 = 0;
let lastMoveTime2 = 0;
let visitedCells2 = []; // Track cells Pac-Man has visited

// DOM Elements for Home Page
let gameGrid, startOverlay, startGame, projectImg, projectTitle, projectDesc, projectInfo, prevProjectBtn, nextProjectBtn;
// DOM Elements for Work Page
let gameGrid2, startOverlay2, startGame2, projectImg2, projectTitle2, projectDesc2, projectInfo2, prevProjectBtn2, nextProjectBtn2;

// Initialize Game
function initGame() {
    // Get DOM elements for Home Page
    gameGrid = document.getElementById('gameGrid');
    startOverlay = document.getElementById('startOverlay');
    startGame = document.getElementById('startGame');
    projectImg = document.getElementById('projectImg');
    projectTitle = document.getElementById('projectTitle');
    projectDesc = document.getElementById('projectDesc');
    projectInfo = document.getElementById('projectInfo');
    prevProjectBtn = document.getElementById('prevProject');
    nextProjectBtn = document.getElementById('nextProject');
    
    // Get DOM elements for Work Page
    gameGrid2 = document.getElementById('gameGrid2');
    startOverlay2 = document.getElementById('startOverlay2');
    startGame2 = document.getElementById('startGame2');
    projectImg2 = document.getElementById('projectImg2');
    projectTitle2 = document.getElementById('projectTitle2');
    projectDesc2 = document.getElementById('projectDesc2');
    projectInfo2 = document.getElementById('projectInfo2');
    prevProjectBtn2 = document.getElementById('prevProject2');
    nextProjectBtn2 = document.getElementById('nextProject2');
    
    // Event listeners for Home Page
    if (startGame) {
        startGame.addEventListener('click', function() {
            // Stop background audio if playing
            SoundManager.stopBackground();
            
            // Play button sound if sound is enabled
            if (SoundManager.isEnabled()) {
                SoundManager.play('button');
            }
            startGameHandler();
        });
    }
    if (prevProjectBtn) {
        prevProjectBtn.addEventListener('click', function() {
            // Stop background audio if playing
            SoundManager.stopBackground();
            prevProjectHandler();
        });
    }
    if (nextProjectBtn) {
        nextProjectBtn.addEventListener('click', function() {
            // Stop background audio if playing
            SoundManager.stopBackground();
            nextProjectHandler();
        });
    }
    
    // Event listeners for Work Page
    if (startGame2) {
        startGame2.addEventListener('click', function() {
            // Stop background audio if playing
            SoundManager.stopBackground();
            
            // Play button sound if sound is enabled
            if (SoundManager.isEnabled()) {
                SoundManager.play('button');
            }
            startGameHandler2();
        });
    }
    if (prevProjectBtn2) {
        prevProjectBtn2.addEventListener('click', function() {
            // Stop background audio if playing
            SoundManager.stopBackground();
            prevProjectHandler2();
        });
    }
    if (nextProjectBtn2) {
        nextProjectBtn2.addEventListener('click', function() {
            // Stop background audio if playing
            SoundManager.stopBackground();
            nextProjectHandler2();
        });
    }
    
    const startExploring = document.getElementById('startExploring');
    if (startExploring) {
        startExploring.addEventListener('click', function() {
            // Stop background audio if playing
            SoundManager.stopBackground();
            
            // Play button sound if sound is enabled
            if (SoundManager.isEnabled()) {
                SoundManager.play('button');
            }
            
            navigateTo('work');
        });
    }
    
    // Keyboard controls
    window.addEventListener('keydown', handleKeyPress);
    
    // Load first project
    updateProject();
    updateProject2();
    
    // Initialize and show the grid on page load for Home Page
    initializeGridOnly();
    
    // Initialize and show the grid on page load for Work Page
    initializeGridOnly2();
}

// Start Game Handler for Home Page
function startGameHandler() {
    if (!gameStarted) {
        // First time starting the game
        gameStarted = true;
        startOverlay.classList.add('hidden');
        initializeDots();
        
        // Change bottom navigation button text to "Reset Game"
        const playGameBtn = document.getElementById('playGameBtn');
        if (playGameBtn) {
            playGameBtn.textContent = 'reset game';
        }
        
        // Play background music if sound is enabled
        if (SoundManager.isEnabled()) {
            SoundManager.setUserInteracted(); // Ensure user interaction is set
            // Note: We don't directly play background audio here as it's handled by the SoundManager
        }
    } else {
        // Game is already started, reset it
        resetGame();
    }
}

// Start Game Handler for Work Page
function startGameHandler2() {
    if (!gameStarted2) {
        // First time starting the game
        gameStarted2 = true;
        startOverlay2.classList.add('hidden');
        initializeDots2();
        
        // Change bottom navigation button text to "Reset Game"
        const playGameBtn = document.getElementById('playGameBtn');
        if (playGameBtn) {
            playGameBtn.textContent = 'reset game';
        }
        
        // Play background music if sound is enabled
        if (SoundManager.isEnabled()) {
            SoundManager.setUserInteracted(); // Ensure user interaction is set
            // Note: We don't directly play background audio here as it's handled by the SoundManager
        }
    } else {
        // Game is already started, reset it
        resetGame2();
    }
}

// Initialize Dots in Rows for Home Page
function initializeDots() {
    dots = [];
    totalDots = 0;
    
    // Create dots in a grid pattern (rows)
    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            // Skip starting position
            if (x === 0 && y === 7) continue;
            
            dots.push({ x, y, eaten: false });
            totalDots++;
        }
    }
    
    dotsEaten = 0;
    pacmanPos = { x: 0, y: 7 };
    direction = 'right';
    lastMoveTime = 0;
    visitedCells = [{ x: 0, y: 7 }]; // Initialize with starting position
    
    
    renderGame();
    updateProjectOpacity();
}

// Initialize Dots in Rows for Work Page
function initializeDots2() {
    dots2 = [];
    totalDots2 = 0;
    
    // Create dots in a grid pattern (rows)
    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            // Skip starting position
            if (x === 0 && y === 7) continue;
            
            dots2.push({ x, y, eaten: false });
            totalDots2++;
        }
    }
    
    dotsEaten2 = 0;
    pacmanPos2 = { x: 0, y: 7 };
    direction2 = 'right';
    lastMoveTime2 = 0;
    visitedCells2 = [{ x: 0, y: 7 }]; // Initialize with starting position
    
    
    renderGame2();
    updateProjectOpacity2();
}

// Initialize Grid Only for Home Page (show grid without starting game)
function initializeGridOnly() {
    gameGrid.innerHTML = '';
    gameGrid.style.display = 'grid';
    gameGrid.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
    gameGrid.style.gridTemplateRows = `repeat(${GRID_ROWS}, 1fr)`;
    gameGrid.style.gap = '0'; /* Remove gap between cells */

    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            
            // Create a container for the background image portion
            const bgContainer = document.createElement('div');
            bgContainer.className = 'cell-background';
            
            
            cell.appendChild(bgContainer);
            
            // Add dots to all cells except the starting position
            if (!(x === 0 && y === 7)) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                cell.appendChild(dot);
            }
            
            // Add Pac-Man at the starting position
            if (x === 0 && y === 7) {
                const pacman = document.createElement('img');
                pacman.src = 'assets/images/pacman.svg';
                pacman.className = 'pacman-img right';
                cell.appendChild(pacman);
            }
            
            gameGrid.appendChild(cell);
        }
    }
}

// Initialize Grid Only for Work Page (show grid without starting game)
function initializeGridOnly2() {
    gameGrid2.innerHTML = '';
    gameGrid2.style.display = 'grid';
    gameGrid2.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
    gameGrid2.style.gridTemplateRows = `repeat(${GRID_ROWS}, 1fr)`;
    gameGrid2.style.gap = '0'; /* Remove gap between cells */

    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            
            // Create a container for the background image portion
            const bgContainer = document.createElement('div');
            bgContainer.className = 'cell-background';
            
            
            cell.appendChild(bgContainer);
            
            // Add dots to all cells except the starting position
            if (!(x === 0 && y === 7)) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                cell.appendChild(dot);
            }
            
            // Add Pac-Man at the starting position
            if (x === 0 && y === 7) {
                const pacman = document.createElement('img');
                pacman.src = 'assets/images/pacman.svg';
                pacman.className = 'pacman-img right';
                cell.appendChild(pacman);
            }
            
            gameGrid2.appendChild(cell);
        }
    }
}

// Render Game for Home Page
function renderGame() {
    gameGrid.innerHTML = '';
    gameGrid.style.display = 'grid';
    gameGrid.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
    gameGrid.style.gridTemplateRows = `repeat(${GRID_ROWS}, 1fr)`;
    gameGrid.style.gap = '0'; /* Remove gap between cells */

    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';

            const isPacman = pacmanPos.x === x && pacmanPos.y === y;
            const dot = dots.find(d => d.x === x && d.y === y);

            // Check if this cell has been visited by Pac-Man
            const isVisited = visitedCells.some(cell => cell.x === x && cell.y === y);
            // Check if this cell has an eaten dot
            const hasEatenDot = dot && dot.eaten;

            // Show image in visited cells or cells with eaten dots
            if (isVisited || hasEatenDot) {
                // Create a container for the background image portion
                const bgContainer = document.createElement('div');
                bgContainer.className = 'cell-background';
                
                // Ensure the image URL is valid and not empty
                const imageUrl = projectImg && projectImg.src ? projectImg.src : '';
                if (imageUrl) {
                    bgContainer.style.backgroundImage = `url('${imageUrl}')`;
                    bgContainer.style.backgroundSize = `${GRID_SIZE * 100}% ${GRID_ROWS * 100}%`;
                    bgContainer.style.backgroundPosition = `${(x / (GRID_SIZE - 1)) * 100}% ${(y / (GRID_ROWS - 1)) * 100}%`;
                    bgContainer.style.backgroundRepeat = 'no-repeat';
                    bgContainer.style.backgroundColor = 'transparent'; // Ensure no black background
                }
                
                cell.appendChild(bgContainer);
            }

            if (isPacman) {
                const pacman = document.createElement('img');
                pacman.src = 'assets/images/pacman.svg';
                pacman.className = `pacman-img ${direction}`;
                cell.appendChild(pacman);
            } else if (dot && !dot.eaten) {
                const dotEl = document.createElement('div');
                dotEl.className = 'dot';
                cell.appendChild(dotEl);
            }

            gameGrid.appendChild(cell);
        }
    }

    // Check if all dots are eaten
    if (dotsEaten === totalDots) {
        prevProjectBtn.classList.remove('hidden');
        nextProjectBtn.classList.remove('hidden');
        
        // Hide Pacman after eating all dots
        const pacmanElements = document.querySelectorAll('.pacman-img');
        pacmanElements.forEach(pacman => {
            pacman.style.display = 'none';
        });
    }
}

// Render Game for Work Page
function renderGame2() {
    gameGrid2.innerHTML = '';
    gameGrid2.style.display = 'grid';
    gameGrid2.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
    gameGrid2.style.gridTemplateRows = `repeat(${GRID_ROWS}, 1fr)`;
    gameGrid2.style.gap = '0'; /* Remove gap between cells */

    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';

            const isPacman = pacmanPos2.x === x && pacmanPos2.y === y;
            const dot = dots2.find(d => d.x === x && d.y === y);

            // Check if this cell has been visited by Pac-Man
            const isVisited = visitedCells2.some(cell => cell.x === x && cell.y === y);
            // Check if this cell has an eaten dot
            const hasEatenDot = dot && dot.eaten;

            // Show image in visited cells or cells with eaten dots
            if (isVisited || hasEatenDot) {
                // Create a container for the background image portion
                const bgContainer = document.createElement('div');
                bgContainer.className = 'cell-background';
                
                // Ensure the image URL is valid and not empty
                const imageUrl = projectImg2 && projectImg2.src ? projectImg2.src : '';
                if (imageUrl) {
                    bgContainer.style.backgroundImage = `url('${imageUrl}')`;
                    bgContainer.style.backgroundSize = `${GRID_SIZE * 100}% ${GRID_ROWS * 100}%`;
                    bgContainer.style.backgroundPosition = `${(x / (GRID_SIZE - 1)) * 100}% ${(y / (GRID_ROWS - 1)) * 100}%`;
                    bgContainer.style.backgroundRepeat = 'no-repeat';
                    bgContainer.style.backgroundColor = 'transparent'; // Ensure no black background
                }
                
                cell.appendChild(bgContainer);
            }

            if (isPacman) {
                const pacman = document.createElement('img');
                pacman.src = 'assets/images/pacman.svg';
                pacman.className = `pacman-img ${direction2}`;
                cell.appendChild(pacman);
            } else if (dot && !dot.eaten) {
                const dotEl = document.createElement('div');
                dotEl.className = 'dot';
                cell.appendChild(dotEl);
            }

            gameGrid2.appendChild(cell);
        }
    }

    // Check if all dots are eaten
    if (dotsEaten2 === totalDots2) {
        prevProjectBtn2.classList.remove('hidden');
        nextProjectBtn2.classList.remove('hidden');
        
        // Hide Pacman after eating all dots
        const pacmanElements = document.querySelectorAll('.pacman-img');
        pacmanElements.forEach(pacman => {
            pacman.style.display = 'none';
        });
    }
}

// Handle Keyboard Input - All 4 Directions
function handleKeyPress(e) {
    // Handle Home Page Game
    if (gameStarted && dotsEaten < totalDots) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            
            // Check if enough time has passed since the last move
            const currentTime = Date.now();
            if (currentTime - lastMoveTime < GAME_SPEED) {
                return; // Skip this move if not enough time has passed
            }
            
            let newX = pacmanPos.x;
            let newY = pacmanPos.y;
            
            // Update direction and position
            if (e.key === 'ArrowLeft') {
                direction = 'left';
                if (pacmanPos.x > 0) newX = pacmanPos.x - 1;
            } else if (e.key === 'ArrowRight') {
                direction = 'right';
                if (pacmanPos.x < GRID_SIZE - 1) newX = pacmanPos.x + 1;
            } else if (e.key === 'ArrowUp') {
                direction = 'up';
                if (pacmanPos.y > 0) newY = pacmanPos.y - 1;
            } else if (e.key === 'ArrowDown') {
                direction = 'down';
                if (pacmanPos.y < GRID_ROWS - 1) newY = pacmanPos.y + 1;
            }

            pacmanPos.x = newX;
            pacmanPos.y = newY;
            lastMoveTime = currentTime; // Update the last move time
            
            // Add current position to visited cells if not already there
            if (!visitedCells.some(cell => cell.x === newX && cell.y === newY)) {
                visitedCells.push({ x: newX, y: newY });
            }

            // Check for dot collision
            dots.forEach(dot => {
                if (dot.x === newX && dot.y === newY && !dot.eaten) {
                    dot.eaten = true;
                    dotsEaten++;
                    // Play eat sound if sound is enabled
                    if (SoundManager.isEnabled()) {
                        SoundManager.play('pacmanEat');
                    }
                    updateProjectOpacity();
                }
            });

            renderGame();
        }
    }
    
    // Handle Work Page Game
    if (gameStarted2 && dotsEaten2 < totalDots2) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            
            // Check if enough time has passed since the last move
            const currentTime = Date.now();
            if (currentTime - lastMoveTime2 < GAME_SPEED) {
                return; // Skip this move if not enough time has passed
            }
            
            let newX = pacmanPos2.x;
            let newY = pacmanPos2.y;
            
            // Update direction and position
            if (e.key === 'ArrowLeft') {
                direction2 = 'left';
                if (pacmanPos2.x > 0) newX = pacmanPos2.x - 1;
            } else if (e.key === 'ArrowRight') {
                direction2 = 'right';
                if (pacmanPos2.x < GRID_SIZE - 1) newX = pacmanPos2.x + 1;
            } else if (e.key === 'ArrowUp') {
                direction2 = 'up';
                if (pacmanPos2.y > 0) newY = pacmanPos2.y - 1;
            } else if (e.key === 'ArrowDown') {
                direction2 = 'down';
                if (pacmanPos2.y < GRID_ROWS - 1) newY = pacmanPos2.y + 1;
            }

            pacmanPos2.x = newX;
            pacmanPos2.y = newY;
            lastMoveTime2 = currentTime; // Update the last move time
            
            // Add current position to visited cells if not already there
            if (!visitedCells2.some(cell => cell.x === newX && cell.y === newY)) {
                visitedCells2.push({ x: newX, y: newY });
            }

            // Check for dot collision
            dots2.forEach(dot => {
                if (dot.x === newX && dot.y === newY && !dot.eaten) {
                    dot.eaten = true;
                    dotsEaten2++;
                    // Play eat sound if sound is enabled
                    if (SoundManager.isEnabled()) {
                        SoundManager.play('pacmanEat');
                    }
                    updateProjectOpacity2();
                }
            });

            renderGame2();
        }
    }
}

// Update Project Display for Home Page
function updateProject() {
    const project = window.projects[currentProject];
    // Use preload function for better user experience
    if (window.preloadProjectImage) {
        window.preloadProjectImage(projectImg, project.image);
    } else {
        projectImg.src = project.image;
    }
    projectImg.alt = project.title;
    projectTitle.textContent = project.title;
    projectDesc.textContent = project.description;
    updateProjectOpacity();
}

// Update Project Display for Work Page
function updateProject2() {
    const project = window.projects[currentProject2];
    // Use preload function for better user experience
    if (window.preloadProjectImage) {
        window.preloadProjectImage(projectImg2, project.image);
    } else {
        projectImg2.src = project.image;
    }
    projectImg2.alt = project.title;
    projectTitle2.textContent = project.title;
    projectDesc2.textContent = project.description;
    updateProjectOpacity2();
}

// Update Project Opacity for Home Page
function updateProjectOpacity() {
    // Keep the full project image hidden
    projectImg.style.opacity = 0;
    projectInfo.style.opacity = 0;
    
}

// Update Project Opacity for Work Page
function updateProjectOpacity2() {
    // Keep the full project image hidden
    projectImg2.style.opacity = 0;
    projectInfo2.style.opacity = 0;
    
}

// Reset Game for Home Page
function resetGame() {
    gameStarted = false;
    startOverlay.classList.remove('hidden');
    dotsEaten = 0;
    pacmanPos = { x: 0, y: 7 };
    direction = 'right';
    dots = [];
    lastMoveTime = 0;
    visitedCells = []; // Reset visited cells
    
    // Reinitialize the grid to show grid cells and Pacman
    initializeGridOnly();
    
    // Change bottom navigation button text back to "play game"
    const playGameBtn = document.getElementById('playGameBtn');
    if (playGameBtn) {
        playGameBtn.textContent = 'play game';
    }
    
    
    updateProjectOpacity();
}

// Reset Game for Work Page
function resetGame2() {
    gameStarted2 = false;
    startOverlay2.classList.remove('hidden');
    dotsEaten2 = 0;
    pacmanPos2 = { x: 0, y: 7 };
    direction2 = 'right';
    dots2 = [];
    lastMoveTime2 = 0;
    visitedCells2 = []; // Reset visited cells
    
    // Reinitialize the grid to show grid cells and Pacman
    initializeGridOnly2();
    
    // Change bottom navigation button text back to "play game"
    const playGameBtn = document.getElementById('playGameBtn');
    if (playGameBtn) {
        playGameBtn.textContent = 'play game';
    }
    
    
    updateProjectOpacity2();
}

// Previous Project Handler for Home Page
function prevProjectHandler() {
    // Play button sound if sound is enabled
    if (window.soundOn && window.buttonAudio) {
        try {
            window.buttonAudio.currentTime = 0; // Reset to beginning
            window.buttonAudio.play().catch(e => console.log('Button audio play failed:', e));
        } catch (error) {
            console.error('Error playing button sound:', error);
        }
    }
    
    currentProject = (currentProject - 1 + window.projects.length) % window.projects.length;
    updateProject();
    resetGame();
}

// Next Project Handler for Home Page
function nextProjectHandler() {
    // Play button sound if sound is enabled
    if (window.soundOn && window.buttonAudio) {
        try {
            window.buttonAudio.currentTime = 0; // Reset to beginning
            window.buttonAudio.play().catch(e => console.log('Button audio play failed:', e));
        } catch (error) {
            console.error('Error playing button sound:', error);
        }
    }
    
    currentProject = (currentProject + 1) % window.projects.length;
    updateProject();
    resetGame();
}

// Previous Project Handler for Work Page
function prevProjectHandler2() {
    // Play button sound if sound is enabled
    if (SoundManager.isEnabled()) {
        SoundManager.play('button');
    }
    
    currentProject2 = (currentProject2 - 1 + window.projects.length) % window.projects.length;
    updateProject2();
    resetGame2();
}

// Next Project Handler for Work Page
function nextProjectHandler2() {
    // Play button sound if sound is enabled
    if (window.soundOn && window.buttonAudio) {
        try {
            window.buttonAudio.currentTime = 0; // Reset to beginning
            window.buttonAudio.play().catch(e => console.log('Button audio play failed:', e));
        } catch (error) {
            console.error('Error playing button sound:', error);
        }
    }
    
    currentProject2 = (currentProject2 + 1) % window.projects.length;
    updateProject2();
    resetGame2();
}

// Export for use in other modules
window.initGame = initGame;
window.startGameHandler = startGameHandler;
window.startGameHandler2 = startGameHandler2;
window.initializeDots = initializeDots;
window.initializeDots2 = initializeDots2;
window.initializeGridOnly = initializeGridOnly;
window.initializeGridOnly2 = initializeGridOnly2;
window.renderGame = renderGame;
window.renderGame2 = renderGame2;
window.handleKeyPress = handleKeyPress;
window.updateProject = updateProject;
window.updateProject2 = updateProject2;
window.updateProjectOpacity = updateProjectOpacity;
window.updateProjectOpacity2 = updateProjectOpacity2;
window.resetGame = resetGame;
window.resetGame2 = resetGame2;
window.prevProjectHandler = prevProjectHandler;
window.nextProjectHandler = nextProjectHandler;
window.prevProjectHandler2 = prevProjectHandler2;
window.nextProjectHandler2 = nextProjectHandler2;

// Export game state variables
window.gameStarted = gameStarted;
window.gameStarted2 = gameStarted2;