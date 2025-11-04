import React, { useState, useEffect, useRef, useCallback } from 'react';
import soundManager from '../utils/SoundManager';
import { projects, preloadProjectImage } from '../data/projects';

// Game Configuration
const GRID_SIZE = 14;
const GRID_ROWS = 10;
const GAME_SPEED = 100;

const PacmanGame = ({ pageType = 'home' }) => {
    const [pacmanPos, setPacmanPos] = useState({ x: 0, y: 7 });
    const [direction, setDirection] = useState('right');
    const [dots, setDots] = useState([]);
    const [dotsEaten, setDotsEaten] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [currentProject, setCurrentProject] = useState(0);
    const [totalDots, setTotalDots] = useState(0);
    const [visitedCells, setVisitedCells] = useState([{ x: 0, y: 7 }]);
    const [showProjectNav, setShowProjectNav] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    
    const gameGridRef = useRef(null);
    const lastMoveTime = useRef(0);
    const projectImgRef = useRef(null);
    const projectTitleRef = useRef(null);
    const projectDescRef = useRef(null);
    const projectInfoRef = useRef(null);

    const initializeDots = useCallback(() => {
        const newDots = [];
        let dotCount = 0;
        
        for (let y = 0; y < GRID_ROWS; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (x === 0 && y === 7) continue;
                newDots.push({ x, y, eaten: false });
                dotCount++;
            }
        }
        
        setDots(newDots);
        setTotalDots(dotCount);
        setDotsEaten(0);
        setPacmanPos({ x: 0, y: 7 });
        setDirection('right');
        setVisitedCells([{ x: 0, y: 7 }]);
        lastMoveTime.current = 0;
        setShowProjectNav(false);
    }, []);

    const initializeGridOnly = useCallback(() => {
        if (!gameGridRef.current) return;
        
        const container = gameGridRef.current;
        container.innerHTML = '';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(14, 1fr)`;
        container.style.gridTemplateRows = `repeat(${GRID_ROWS}, 1fr)`;
        container.style.gap = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.padding = '0';

        for (let y = 0; y < GRID_ROWS; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                
                if (!(x === 0 && y === 7)) {
                    const dot = document.createElement('div');
                    dot.className = 'dot';
                    dot.style.width = '8px';
                    dot.style.height = '8px';
                    dot.style.backgroundColor = '#B0AA95';
                    dot.style.pointerEvents = 'none';
                    cell.appendChild(dot);
                }
                
                if (x === 0 && y === 7) {
                    const pacman = document.createElement('img');
                    pacman.src = '/images/pacman.svg';
                    pacman.style.width = '80%';
                    pacman.style.height = '80%';
                    pacman.style.objectFit = 'contain';
                    pacman.style.position = 'relative';
                    pacman.style.zIndex = '10';
                    pacman.style.pointerEvents = 'none';
                    cell.appendChild(pacman);
                }
                
                container.appendChild(cell);
            }
        }
        
        setIsInitialized(true);
    }, []);

    const renderGame = useCallback(() => {
        if (!gameGridRef.current) return;
        
        const container = gameGridRef.current;
        container.innerHTML = '';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(14, 1fr)`;
        container.style.gridTemplateRows = `repeat(${GRID_ROWS}, 1fr)`;
        container.style.gap = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.padding = '0';

        const project = projects[currentProject];
        const imageUrl = project ? project.image : '';

        for (let y = 0; y < GRID_ROWS; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';

                const isPacman = pacmanPos.x === x && pacmanPos.y === y;
                const dot = dots.find(d => d.x === x && d.y === y);
                const isVisited = visitedCells.some(cell => cell.x === x && cell.y === y);
                const hasEatenDot = dot && dot.eaten;

                if (isVisited || hasEatenDot) {
                    if (imageUrl) {
                        cell.style.backgroundImage = `url('${imageUrl}')`;
                        cell.style.backgroundSize = `${GRID_SIZE * 100}% ${GRID_ROWS * 100}%`;
                        cell.style.backgroundPosition = `${(x / GRID_SIZE) * 100}% ${(y / GRID_ROWS) * 100}%`;
                        cell.style.backgroundRepeat = 'no-repeat';
                        // Adjust brightness for better visibility when dots are eaten
                        cell.style.filter = 'brightness(1.1)';
                    }
                } else {
                    cell.style.backgroundColor = 'rgba(45, 44, 40, 0.3)';
                }

                if (isPacman) {
                    const pacman = document.createElement('img');
                    pacman.src = '/images/pacman.svg';
                    pacman.style.width = '80%';
                    pacman.style.height = '80%';
                    pacman.style.objectFit = 'contain';
                    pacman.style.position = 'relative';
                    pacman.style.zIndex = '10';
                    pacman.style.pointerEvents = 'none';
                    
                    if (direction === 'left') pacman.style.transform = 'scaleX(-1)';
                    else if (direction === 'up') pacman.style.transform = 'rotate(-90deg)';
                    else if (direction === 'down') pacman.style.transform = 'rotate(90deg)';
                    
                    cell.appendChild(pacman);
                } else if (dot && !dot.eaten) {
                    const dotEl = document.createElement('div');
                    dotEl.style.width = '8px';
                    dotEl.style.height = '8px';
                    dotEl.style.backgroundColor = '#B0AA95';
                    dotEl.style.position = 'relative';
                    dotEl.style.zIndex = '5';
                    dotEl.style.pointerEvents = 'none';
                    cell.appendChild(dotEl);
                }

                container.appendChild(cell);
            }
        }

        if (dotsEaten === totalDots && totalDots > 0) {
            setShowProjectNav(true);
        }
    }, [pacmanPos, direction, dots, visitedCells, currentProject, dotsEaten, totalDots]);

    const handleKeyPress = useCallback((e) => {
        soundManager.setUserInteracted();
        
        if (!gameStarted || dotsEaten >= totalDots) return;
        
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            
            const currentTime = Date.now();
            if (currentTime - lastMoveTime.current < GAME_SPEED) {
                return;
            }
            
            let newX = pacmanPos.x;
            let newY = pacmanPos.y;
            let newDirection = direction;
            
            if (e.key === 'ArrowLeft') {
                newDirection = 'left';
                if (pacmanPos.x > 0) newX = pacmanPos.x - 1;
            } else if (e.key === 'ArrowRight') {
                newDirection = 'right';
                if (pacmanPos.x < GRID_SIZE - 1) newX = pacmanPos.x + 1;
            } else if (e.key === 'ArrowUp') {
                newDirection = 'up';
                if (pacmanPos.y > 0) newY = pacmanPos.y - 1;
            } else if (e.key === 'ArrowDown') {
                newDirection = 'down';
                if (pacmanPos.y < GRID_ROWS - 1) newY = pacmanPos.y + 1;
            }

            setPacmanPos({ x: newX, y: newY });
            setDirection(newDirection);
            lastMoveTime.current = currentTime;
            
            setVisitedCells(prev => {
                const exists = prev.some(cell => cell.x === newX && cell.y === newY);
                if (!exists) {
                    return [...prev, { x: newX, y: newY }];
                }
                return prev;
            });

            setDots(prevDots => {
                const newDots = [...prevDots];
                let ateDot = false;
                
                newDots.forEach(dot => {
                    if (dot.x === newX && dot.y === newY && !dot.eaten) {
                        dot.eaten = true;
                        ateDot = true;
                    }
                });
                
                if (ateDot) {
                    setDotsEaten(prev => prev + 1);
                    if (soundManager.isSoundEnabled()) {
                        soundManager.play('pacmanEat');
                    }
                }
                
                return newDots;
            });
        }
    }, [gameStarted, dotsEaten, totalDots, pacmanPos, direction]);

    const startGameHandler = () => {
        soundManager.setUserInteracted();
        
        if (!gameStarted) {
            setGameStarted(true);
            initializeDots();
        } else {
            resetGame();
        }
    };

    const resetGame = () => {
        setGameStarted(false);
        setDotsEaten(0);
        setPacmanPos({ x: 0, y: 7 });
        setDirection('right');
        setDots([]);
        setVisitedCells([{ x: 0, y: 7 }]);
        setShowProjectNav(false);
        lastMoveTime.current = 0;
        initializeGridOnly();
    };

    const updateProject = useCallback(() => {
        const project = projects[currentProject];
        if (projectImgRef.current) {
            preloadProjectImage(projectImgRef.current, project.image);
        }
        if (projectTitleRef.current) {
            projectTitleRef.current.textContent = project.title;
        }
        if (projectDescRef.current) {
            projectDescRef.current.textContent = project.description;
        }
    }, [currentProject]);

    const prevProjectHandler = () => {
        soundManager.setUserInteracted();
        if (soundManager.isSoundEnabled()) {
            soundManager.play('button');
        }
        setCurrentProject((prev) => (prev - 1 + projects.length) % projects.length);
        resetGame();
    };

    const nextProjectHandler = () => {
        soundManager.setUserInteracted();
        if (soundManager.isSoundEnabled()) {
            soundManager.play('button');
        }
        setCurrentProject((prev) => (prev + 1) % projects.length);
        resetGame();
    };

    useEffect(() => {
        initializeGridOnly();
        updateProject();
        
        window.addEventListener('keydown', handleKeyPress);
        
        const handleStartGameEvent = () => {
            startGameHandler();
        };
        window.addEventListener('startGame', handleStartGameEvent);
        
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('startGame', handleStartGameEvent);
        };
    }, [handleKeyPress]);

    useEffect(() => {
        updateProject();
    }, [currentProject, updateProject]);

    useEffect(() => {
        if (gameStarted) {
            renderGame();
        }
    }, [gameStarted, pacmanPos, dots, visitedCells, renderGame]);

    return (
        <div className="w-full h-full min-h-[400px] max-h-[600px] relative border border-custom rounded-lg overflow-hidden bg-dark">
            <div className=' '>
                <div className="absolute inset-0 z-10">
                    <img
                        ref={projectImgRef}
                        src={projects[currentProject]?.image || ""}
                        alt={projects[currentProject]?.title || "Project"}
                        className="w-full h-full min-h-[400px] max-h-[600px] object-contain"
                        style={{
                            filter: gameStarted ? 'brightness(0.4)' : 'brightness(1)',
                            objectFit: 'contain',
                            width: '100%',
                            height: '100%',
                            display: 'none'
                        }}
                        onError={(e) => {
                            console.error(`Failed to load image: ${e.target.src}`);
                            e.target.style.backgroundColor = '#2D2C28';
                        }}
                    />
                </div>
                {/* Pac-Man Game Grid */}
                <div ref={gameGridRef} className="absolute inset-0 z-20 w-full h-full"></div>
            </div>
            {/* Start Game Overlay */}
            <div className={`absolute inset-0 z-30 ${gameStarted ? 'hidden' : 'flex'} items-center justify-center bg-black/70`}>
                <div className="flex items-center justify-center w-full h-full">
                    <div className="text-center game-play" style={{ backgroundColor: '#070707', borderColor: '#B0AA95', borderWidth: '2px', borderStyle: 'solid' }}>
                        <button
                            onClick={startGameHandler}
                            className="text-3xl title-font bg-transparent text-red play-btn border-none cursor-pointer mb-2 hover:text-title-custom transition-colors"
                            style={{ cursor: 'url("/images/cursor.svg") 3 3, pointer' }}
                        >
                            Play!
                        </button>
                        <p className="text-custom text-lg m-0" style={{ cursor: 'url("/images/cursor.svg") 3 3, text' }}>Reveal the project</p>
                    </div>
                </div>
            </div>
        
        </div>
    );
};

export default PacmanGame;