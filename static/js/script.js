// NEO ARCADE — Unified Game Logic & UI Controller

// Global Variables
let currentGame = null;
let currentSection = 'home';
let theme = localStorage.getItem('theme') || 'dark';
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

// DOM Elements
const mainContainer = document.getElementById('mainContainer');
const loader = document.getElementById('loader');
const welcomeModal = document.getElementById('welcomeModal');
const gameOverModal = document.getElementById('gameOverModal');
const themeToggle = document.getElementById('themeToggle');
const soundToggle = document.getElementById('soundToggle');

// Sound Function
function playSound(frequency, volume, type) {
  if (!soundEnabled) return;
  if (typeof window.AudioContext !== 'undefined' || typeof window.webkitAudioContext !== 'undefined') {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type || 'sine';

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initTheme();
  initNavigation();
  initModals();
  loadStats();
  showWelcomeModal();

  // Hide loader after initialization
  setTimeout(() => {
    loader.style.display = 'none';
  }, 3000);
});

// Particle Background
function initParticles() {
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: ['#00ffff', '#ff00ff', '#0080ff', '#00ff80'] },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#ffffff',
          opacity: 0.1,
          width: 1
        },
        move: {
          enable: true,
          speed: 2,
          direction: 'none',
          random: true,
          straight: false,
          out_mode: 'out',
          bounce: false
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'repulse' },
          onclick: { enable: true, mode: 'push' },
          resize: true
        }
      },
      retina_detect: true
    });
  }
}

// Theme Management
function initTheme() {
  document.documentElement.setAttribute('data-theme', 'dark');
  if (themeToggle) {
    themeToggle.querySelector('.theme-icon').textContent = '🌙';
    // Theme toggle disabled for dark theme only
  }
  if (soundToggle) {
    soundToggle.querySelector('.sound-icon').textContent = soundEnabled ? '🔊' : '🔇';

    soundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('soundEnabled', soundEnabled);
      soundToggle.querySelector('.sound-icon').textContent = soundEnabled ? '🔊' : '🔇';
      playSound(600, 0.1, 'sine');
    });
  }
}

// Navigation
function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      switchSection(section);
    });
  });
}

function switchSection(sectionName) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });

  // Show target section
  document.getElementById(sectionName + 'Section').classList.add('active');

  // Update navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

  // Animate transition
  gsap.from(`#${sectionName}Section`, {
    opacity: 0,
    y: 30,
    duration: 0.5,
    ease: 'power2.out'
  });

  currentSection = sectionName;
  playSound(600, 0.15, 'sine');
}

// Modal Management
function initModals() {
  // Welcome modal
  if (!localStorage.getItem('welcomeShown')) {
    setTimeout(() => {
      welcomeModal.style.display = 'block';
      localStorage.setItem('welcomeShown', 'true');
    }, 1000);
  }

  // Close modals
  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', closeModal);
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeModal();
    }
  });
}

function closeModal() {
  welcomeModal.style.display = 'none';
  gameOverModal.style.display = 'none';
}

function showGameOverModal(title, message) {
  document.getElementById('gameOverTitle').textContent = title;
  document.getElementById('gameOverMessage').textContent = message;
  gameOverModal.style.display = 'block';
}

// Stats Loading
function loadStats() {
  const scores = JSON.parse(localStorage.getItem('scores') || '[]');
  const totalPlayers = new Set(scores.map(s => s.name)).size;
  const totalScores = scores.length;

  document.getElementById('totalPlayers').textContent = totalPlayers;
  document.getElementById('totalScores').textContent = totalScores;
}

// Game Management
function startGame(gameType) {
  currentGame = gameType;
  document.getElementById('currentGameTitle').textContent = getGameTitle(gameType);
  switchSection('game');

  // Clear previous game
  document.getElementById('gameArea').innerHTML = '';

  // Initialize game
  setTimeout(() => {
    initGame(gameType);
  }, 500);
}

function getGameTitle(gameType) {
  const titles = {
    reaction: 'REACTION SPEED',
    memory: 'MEMORY MATRIX',
    puzzle: 'SLIDER PUZZLE',
    trivia: 'TRIVIA ENGINE',
    snake: 'NEURAL SNAKE',
    whackamole: 'MOLE ELIMINATOR',
    2048: 'POWER GRID'
  };
  return titles[gameType] || 'UNKNOWN GAME';
}

// Game Initialization
function initGame(gameType) {
  const gameArea = document.getElementById('gameArea');
  const playerName = document.getElementById('playerName').value.trim() || 'Anonymous';

  switch (gameType) {
    case 'reaction':
      initReactionGame(gameArea, playerName);
      break;
    case 'memory':
      initMemoryGame(gameArea, playerName);
      break;
    case 'puzzle':
      initPuzzleGame(gameArea, playerName);
      break;
    case 'trivia':
      initTriviaGame(gameArea, playerName);
      break;
    case 'snake':
      initSnakeGame(gameArea, playerName);
      break;
    case 'whackamole':
      initWhackAMoleGame(gameArea, playerName);
      break;
    case '2048':
      init2048Game(gameArea, playerName);
      break;
  }

  updateGameLeaderboard(gameType);
}

// Reaction Speed Game
function initReactionGame(container, playerName) {
  let waiting = false;
  let startTime = 0;
  let timeoutId = null;
  let currentScore = 0;

  container.innerHTML = `
    <div id="reactionBox" class="reaction-box">
      <div class="reaction-inner">
        <div id="countdown" class="countdown"></div>
        <div id="boxText" class="box-text">TAP TO START</div>
      </div>
    </div>
  `;

  const box = document.getElementById('reactionBox');
  const boxText = document.getElementById('boxText');
  const countdownEl = document.getElementById('countdown');

  function setBoxState(color, text) {
    box.style.background = color;
    boxText.textContent = text;
  }

  function startRound() {
    clearTimeout(timeoutId);
    document.getElementById('gameResult').textContent = '';
    document.getElementById('gameHint').textContent = 'Get ready...';
    setBoxState('linear-gradient(180deg, #666, #333)', 'Wait...');
    waiting = false;

    let count = 3;
    countdownEl.textContent = count;
    const countInterval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownEl.textContent = count;
        playSound(400 + count * 100, 0.1);
      } else {
        clearInterval(countInterval);
        countdownEl.textContent = '';
        waiting = true;
        setBoxState('linear-gradient(180deg, #666, #333)', 'Wait for GREEN!');
        document.getElementById('gameHint').textContent = 'Wait for green, then tap!';
        box.style.cursor = 'pointer';

        const delay = Math.random() * 3000 + 1000;
        timeoutId = setTimeout(() => {
          if (waiting) {
            startTime = performance.now();
            setBoxState('linear-gradient(180deg, #4CAF50, #45a049)', 'TAP NOW!');
            document.getElementById('gameHint').textContent = 'Tap as fast as you can!';
            playSound(800, 0.2);
          }
        }, delay);
      }
    }, 1000);
  }

  box.addEventListener('click', () => {
    if (waiting) {
      clearTimeout(timeoutId);
      const timeMs = performance.now() - startTime;
      const score = Math.max(0, Math.round(1000 - timeMs));
      currentScore = score;

      document.getElementById('gameResult').textContent = `Time: ${(timeMs / 1000).toFixed(3)}s — Score: ${score}`;
      document.getElementById('scoreProgress').style.width = Math.min((score / 1000) * 100, 100) + '%';
      document.getElementById('gameHint').textContent = 'Great job! Tap to play again.';

      setBoxState('linear-gradient(180deg, #4CAF50, #45a049)', 'Well done!');
      waiting = false;

      // Save score
      saveScore(playerName, score, 'reaction');
      updateGameLeaderboard('reaction');

      playSound(1000, 0.3);
      setTimeout(() => {
        showGameOverModal('REACTION COMPLETE', `Score: ${score} points`);
      }, 1000);
    } else {
      startRound();
    }
  });

  startRound();
}

// Memory Game
function initMemoryGame(container, playerName) {
  let cards = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let attempts = 0;
  let startTime = 0;
  let gameSize = 16;

  container.innerHTML = `
    <div class="difficulty-selector">
      <button class="diff-btn active" data-size="16">EASY (4x4)</button>
      <button class="diff-btn" data-size="36">HARD (6x6)</button>
    </div>
    <div id="memoryBoard" class="memory-board"></div>
  `;

  const board = document.getElementById('memoryBoard');

  function createBoard() {
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${Math.sqrt(gameSize)}, 1fr)`;
    cards = [];

    const symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🐔', '🐧', '🐦', '🐙', '🦋'];
    const gameSymbols = symbols.slice(0, gameSize / 2);
    const cardSymbols = [...gameSymbols, ...gameSymbols].sort(() => Math.random() - 0.5);

    cardSymbols.forEach((symbol, index) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.symbol = symbol;
      card.dataset.index = index;
      card.addEventListener('click', flipCard);
      board.appendChild(card);
      cards.push(card);
    });
  }

  function flipCard() {
    if (flippedCards.length >= 2 || this.classList.contains('flipped') || this.classList.contains('matched')) {
      return;
    }

    this.classList.add('flipped');
    this.textContent = this.dataset.symbol;
    flippedCards.push(this);
    playSound(300, 0.1);

    if (flippedCards.length === 2) {
      attempts++;
      setTimeout(checkMatch, 1000);
    }
  }

  function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.symbol === card2.dataset.symbol) {
      card1.classList.add('matched');
      card2.classList.add('matched');
      matchedPairs++;
      playSound(600, 0.2);

      if (matchedPairs === gameSize / 2) {
        endGame();
      }
    } else {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      card1.textContent = '';
      card2.textContent = '';
      playSound(200, 0.2);
    }

    flippedCards = [];
  }

  function endGame() {
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    const score = Math.max(0, Math.round(1000 - (attempts * 10) - (timeTaken * 5)));

    document.getElementById('gameResult').textContent = `Completed in ${timeTaken.toFixed(1)}s with ${attempts} attempts! Score: ${score}`;
    document.getElementById('scoreProgress').style.width = Math.min((score / 1000) * 100, 100) + '%';
    document.getElementById('gameHint').textContent = 'Congratulations! Select difficulty to play again.';

    saveScore(playerName, score, 'memory');
    updateGameLeaderboard('memory');

    setTimeout(() => {
      showGameOverModal('MEMORY COMPLETE', `Score: ${score} points`);
    }, 1000);
  }

  function setDifficulty(size) {
    gameSize = size;
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.size == size);
    });
    startGame();
  }

  function startGame() {
    matchedPairs = 0;
    attempts = 0;
    startTime = Date.now();
    document.getElementById('gameResult').textContent = '';
    document.getElementById('gameHint').textContent = 'Click cards to flip them!';
    createBoard();
  }

  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => setDifficulty(btn.dataset.size));
  });

  startGame();
}

// Puzzle Game
function initPuzzleGame(container, playerName) {
  let tiles = [];
  let emptyIndex = 15;
  let moves = 0;
  let startTime = 0;

  container.innerHTML = `
    <div id="puzzleBoard" class="puzzle-board"></div>
  `;

  const board = document.getElementById('puzzleBoard');

  function createBoard() {
    board.innerHTML = '';
    tiles = [];
    emptyIndex = 15;
    moves = 0;

    for (let i = 0; i < 16; i++) {
      const tile = document.createElement('div');
      tile.className = 'puzzle-tile';
      if (i === 15) {
        tile.classList.add('empty');
      } else {
        tile.textContent = i + 1;
        tile.dataset.number = i + 1;
      }
      tile.dataset.index = i;
      tile.addEventListener('click', moveTile);
      board.appendChild(tile);
      tiles.push(tile);
    }
  }

  function shuffleBoard() {
    for (let i = 0; i < 1000; i++) {
      const validMoves = getValidMoves();
      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        moveTileIndex(randomMove);
      }
    }
    moves = 0;
  }

  function getValidMoves() {
    const validMoves = [];
    const row = Math.floor(emptyIndex / 4);
    const col = emptyIndex % 4;

    if (row > 0) validMoves.push(emptyIndex - 4);
    if (row < 3) validMoves.push(emptyIndex + 4);
    if (col > 0) validMoves.push(emptyIndex - 1);
    if (col < 3) validMoves.push(emptyIndex + 1);

    return validMoves;
  }

  function moveTile() {
    const tileIndex = parseInt(this.dataset.index);
    if (getValidMoves().includes(tileIndex)) {
      moveTileIndex(tileIndex);
      moves++;
      playSound(400, 0.1);

      if (isSolved()) {
        endGame();
      }
    }
  }

  function moveTileIndex(tileIndex) {
    const tile = tiles[tileIndex];
    const emptyTile = tiles[emptyIndex];

    const tempContent = tile.textContent;
    const tempNumber = tile.dataset.number;

    tile.textContent = emptyTile.textContent;
    tile.dataset.number = emptyTile.dataset.number;
    tile.classList.toggle('empty');

    emptyTile.textContent = tempContent;
    emptyTile.dataset.number = tempNumber;
    emptyTile.classList.toggle('empty');

    emptyIndex = tileIndex;
  }

  function isSolved() {
    for (let i = 0; i < 15; i++) {
      if (parseInt(tiles[i].dataset.number) !== i + 1) {
        return false;
      }
    }
    return tiles[15].classList.contains('empty');
  }

  function endGame() {
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    const score = Math.max(0, Math.round(1000 - (moves * 10) - (timeTaken * 2)));

    document.getElementById('gameResult').textContent = `Solved in ${moves} moves and ${timeTaken.toFixed(1)}s! Score: ${score}`;
    document.getElementById('scoreProgress').style.width = Math.min((score / 1000) * 100, 100) + '%';
    document.getElementById('gameHint').textContent = 'Congratulations! Click New Puzzle to play again.';

    saveScore(playerName, score, 'puzzle');
    updateGameLeaderboard('puzzle');

    setTimeout(() => {
      showGameOverModal('PUZZLE COMPLETE', `Score: ${score} points`);
    }, 1000);
  }

  function startGame() {
    startTime = Date.now();
    document.getElementById('gameResult').textContent = '';
    document.getElementById('gameHint').textContent = 'Click tiles to slide them!';
    createBoard();
    shuffleBoard();
  }

  startGame();
}

// Trivia Game
function initTriviaGame(container, playerName) {
  let currentQuestion = 0;
  let score = 0;
  let questions = [];

  const sampleQuestions = [
    { question: "What is the capital of France?", answers: ["London", "Berlin", "Paris", "Madrid"], correct: 2 },
    { question: "Which planet is known as the Red Planet?", answers: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1 },
    { question: "What is 2 + 2?", answers: ["3", "4", "5", "6"], correct: 1 },
    { question: "Who painted the Mona Lisa?", answers: ["Van Gogh", "Da Vinci", "Picasso", "Rembrandt"], correct: 1 },
    { question: "What is the largest ocean on Earth?", answers: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 }
  ];

  container.innerHTML = `
    <div id="questionContainer" class="question-container">
      <h3 id="question" class="question"></h3>
      <div id="answers" class="answers"></div>
    </div>
  `;

  function loadQuestions() {
    questions = [...sampleQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
  }

  function displayQuestion() {
    if (currentQuestion >= questions.length) {
      endGame();
      return;
    }

    const q = questions[currentQuestion];
    document.getElementById('question').textContent = q.question;
    const answersEl = document.getElementById('answers');
    answersEl.innerHTML = '';

    q.answers.forEach((answer, index) => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = answer;
      btn.addEventListener('click', () => selectAnswer(index));
      answersEl.appendChild(btn);
    });
  }

  function selectAnswer(selectedIndex) {
    const q = questions[currentQuestion];
    const buttons = document.querySelectorAll('.answer-btn');

    buttons.forEach(btn => btn.disabled = true);

    if (selectedIndex === q.correct) {
      buttons[selectedIndex].classList.add('correct');
      score += 100;
      playSound(600, 0.2);
    } else {
      buttons[selectedIndex].classList.add('wrong');
      buttons[q.correct].classList.add('correct');
      score += 10;
      playSound(300, 0.2);
    }

    currentQuestion++;
    setTimeout(displayQuestion, 2000);
  }

  function endGame() {
    document.getElementById('gameResult').textContent = `Quiz completed! Final score: ${score}`;
    document.getElementById('scoreProgress').style.width = Math.min((score / 500) * 100, 100) + '%';
    document.getElementById('gameHint').textContent = 'Great job! Click Start Quiz to play again.';

    saveScore(playerName, score, 'trivia');
    updateGameLeaderboard('trivia');

    setTimeout(() => {
      showGameOverModal('TRIVIA COMPLETE', `Score: ${score} points`);
    }, 1000);
  }

  function startGame() {
    currentQuestion = 0;
    score = 0;
    document.getElementById('gameResult').textContent = '';
    document.getElementById('gameHint').textContent = 'Answer as quickly as possible!';
    loadQuestions();
    displayQuestion();
  }

  startGame();
}

// Snake Game
function initSnakeGame(container, playerName) {
  let snake = [{x: 10, y: 10}];
  let direction = {x: 0, y: 0};
  let food = {};
  let score = 0;
  let gameRunning = false;
  let gameInterval;

  container.innerHTML = `
    <div id="snakeBoard" class="snake-board"></div>
  `;

  const board = document.getElementById('snakeBoard');
  const boardSize = 20;
  const cellSize = 15;
  board.style.width = boardSize * cellSize + 'px';
  board.style.height = boardSize * cellSize + 'px';
  board.style.position = 'relative';
  board.style.border = '2px solid var(--border-color)';

  function createCell(x, y, className) {
    const cell = document.createElement('div');
    cell.className = className;
    cell.style.position = 'absolute';
    cell.style.width = cellSize + 'px';
    cell.style.height = cellSize + 'px';
    cell.style.left = x * cellSize + 'px';
    cell.style.top = y * cellSize + 'px';
    return cell;
  }

  function drawBoard() {
    board.innerHTML = '';
    snake.forEach(segment => {
      const snakeCell = createCell(segment.x, segment.y, 'snake-cell');
      snakeCell.style.backgroundColor = '#4CAF50';
      board.appendChild(snakeCell);
    });

    const foodCell = createCell(food.x, food.y, 'food-cell');
    foodCell.style.backgroundColor = '#FF5722';
    foodCell.style.borderRadius = '50%';
    board.appendChild(foodCell);
  }

  function generateFood() {
    do {
      food.x = Math.floor(Math.random() * boardSize);
      food.y = Math.floor(Math.random() * boardSize);
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  }

  function moveSnake() {
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

    if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
      gameOver();
      return;
    }

    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 10;
      generateFood();
      playSound(500, 0.1);
    } else {
      snake.pop();
    }

    drawBoard();
    updateScore();
  }

  function updateScore() {
    document.getElementById('gameResult').textContent = `Score: ${score}`;
    document.getElementById('scoreProgress').style.width = Math.min(score / 100 * 100, 100) + '%';
  }

  function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    document.getElementById('gameHint').textContent = 'Game Over! Click Restart to play again.';

    saveScore(playerName, score, 'snake');
    updateGameLeaderboard('snake');

    setTimeout(() => {
      showGameOverModal('SNAKE COMPLETE', `Score: ${score} points`);
    }, 1000);
  }

  function startGame() {
    snake = [{x: 10, y: 10}];
    direction = {x: 0, y: 0};
    score = 0;
    gameRunning = true;
    generateFood();
    drawBoard();
    updateScore();
    document.getElementById('gameHint').textContent = 'Use arrow keys or WASD to move!';
    gameInterval = setInterval(moveSnake, 150);
  }

  document.addEventListener('keydown', function(e) {
    if (!gameRunning) return;
    switch(e.key) {
      case 'ArrowUp': case 'w': case 'W':
        if (direction.y === 0) direction = {x: 0, y: -1};
        break;
      case 'ArrowDown': case 's': case 'S':
        if (direction.y === 0) direction = {x: 0, y: 1};
        break;
      case 'ArrowLeft': case 'a': case 'A':
        if (direction.x === 0) direction = {x: -1, y: 0};
        break;
      case 'ArrowRight': case 'd': case 'D':
        if (direction.x === 0) direction = {x: 1, y: 0};
        break;
    }
  });

  startGame();
}

// Whack-a-Mole Game
function initWhackAMoleGame(container, playerName) {
  let score = 0;
  let timeLeft = 30;
  let gameRunning = false;
  let moleInterval;
  let timeInterval;
  let currentMole = null;

  container.innerHTML = `
    <div id="whackBoard" class="whack-board"></div>
  `;

  const board = document.getElementById('whackBoard');

  for (let i = 0; i < 9; i++) {
    const hole = document.createElement('div');
    hole.className = 'hole';
    hole.style.width = '80px';
    hole.style.height = '80px';
    hole.style.backgroundColor = '#8B4513';
    hole.style.borderRadius = '50%';
    hole.style.position = 'relative';
    hole.style.display = 'inline-block';
    hole.style.margin = '10px';
    hole.style.cursor = 'pointer';

    const mole = document.createElement('div');
    mole.className = 'mole';
    mole.style.width = '60px';
    mole.style.height = '60px';
    mole.style.backgroundColor = '#654321';
    mole.style.borderRadius = '50%';
    mole.style.position = 'absolute';
    mole.style.bottom = '0';
    mole.style.left = '10px';
    mole.style.display = 'none';
    mole.style.cursor = 'pointer';

    hole.appendChild(mole);
    hole.addEventListener('click', whackMole);
    mole.addEventListener('click', whackMole);
    board.appendChild(hole);
  }

  const allHoles = document.querySelectorAll('.hole');
  const allMoles = document.querySelectorAll('.mole');

  function randomHole() {
    const index = Math.floor(Math.random() * 9);
    return allHoles[index];
  }

  function showMole() {
    if (!gameRunning) return;
    if (currentMole) {
      currentMole.style.display = 'none';
    }
    const hole = randomHole();
    const mole = hole.querySelector('.mole');
    mole.style.display = 'block';
    currentMole = mole;
    setTimeout(() => {
      if (mole === currentMole) {
        mole.style.display = 'none';
        currentMole = null;
        score = Math.max(0, score - 5);
        updateScore();
      }
    }, 1000);
  }

  function whackMole(e) {
    if (!gameRunning) return;
    const mole = e.target.classList.contains('mole') ? e.target : e.target.querySelector('.mole');
    if (mole && mole.style.display === 'block') {
      mole.style.display = 'none';
      currentMole = null;
      score += 10;
      updateScore();
      playSound(400, 0.1);
    }
  }

  function updateScore() {
    document.getElementById('gameResult').textContent = `Score: ${score} | Time: ${timeLeft}s`;
    document.getElementById('scoreProgress').style.width = Math.min(score / 100 * 100, 100) + '%';
  }

  function startGame() {
    score = 0;
    timeLeft = 30;
    gameRunning = true;
    updateScore();
    document.getElementById('gameHint').textContent = 'Whack the moles!';
    moleInterval = setInterval(showMole, 1500);
    timeInterval = setInterval(() => {
      timeLeft--;
      updateScore();
      if (timeLeft <= 0) {
        gameOver();
      }
    }, 1000);
  }

  function gameOver() {
    clearInterval(moleInterval);
    clearInterval(timeInterval);
    gameRunning = false;
    if (currentMole) {
      currentMole.style.display = 'none';
      currentMole = null;
    }
    document.getElementById('gameHint').textContent = 'Game Over! Click Restart to play again.';

    saveScore(playerName, score, 'whackamole');
    updateGameLeaderboard('whackamole');

    setTimeout(() => {
      showGameOverModal('WHACK COMPLETE', `Score: ${score} points`);
    }, 1000);
  }

  startGame();
}

// 2048 Game
function init2048Game(container, playerName) {
  let board = [];
  let score = 0;
  let gameOverFlag = false;
  const size = 4;

  container.innerHTML = `
    <div id="tileBoard" class="tile-board"></div>
  `;

  const gameBoard = document.getElementById('tileBoard');

  function initBoard() {
    board = Array(size).fill().map(() => Array(size).fill(0));
    score = 0;
    gameOverFlag = false;
    addRandomTile();
    addRandomTile();
    drawBoard();
    updateScore();
  }

  function addRandomTile() {
    const emptyCells = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i][j] === 0) emptyCells.push({i, j});
      }
    }
    if (emptyCells.length > 0) {
      const {i, j} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  function drawBoard() {
    gameBoard.innerHTML = '';
    gameBoard.style.display = 'grid';
    gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gameBoard.style.gap = '5px';
    gameBoard.style.width = '300px';
    gameBoard.style.height = '300px';

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const cell = document.createElement('div');
        cell.className = 'tile';
        cell.style.width = '70px';
        cell.style.height = '70px';
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.fontSize = '24px';
        cell.style.fontWeight = 'bold';
        cell.style.borderRadius = '5px';
        cell.style.backgroundColor = board[i][j] === 0 ? '#CDC1B4' : getTileColor(board[i][j]);
        cell.style.color = board[i][j] > 4 ? '#F9F6F2' : '#776E65';
        cell.textContent = board[i][j] === 0 ? '' : board[i][j];
        gameBoard.appendChild(cell);
      }
    }
  }

  function getTileColor(value) {
    const colors = {
      2: '#EEE4DA', 4: '#EDE0C8', 8: '#F2B179', 16: '#F59563',
      32: '#F67C5F', 64: '#F65E3B', 128: '#EDCF72', 256: '#EDCC61',
      512: '#EDC850', 1024: '#EDC53F', 2048: '#EDC22E'
    };
    return colors[value] || '#3C3A32';
  }

  function move(direction) {
    if (gameOverFlag) return;
    let moved = false;
    const newBoard = board.map(row => [...row]);

    // Simplified move logic (left only for demo)
    if (direction === 'left') {
      for (let i = 0; i < size; i++) {
        const row = newBoard[i].filter(val => val !== 0);
        for (let j = 0; j < row.length - 1; j++) {
          if (row[j] === row[j + 1]) {
            row[j] *= 2;
            score += row[j];
            row[j + 1] = 0;
          }
        }
        const newRow = row.filter(val => val !== 0);
        while (newRow.length < size) newRow.push(0);
        if (JSON.stringify(newBoard[i]) !== JSON.stringify(newRow)) moved = true;
        newBoard[i] = newRow;
      }
    }

    if (moved) {
      board = newBoard;
      addRandomTile();
      drawBoard();
      updateScore();
      if (isGameOver()) {
        gameOver();
      }
    }
  }

  function isGameOver() {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i][j] === 0) return false;
      }
    }
    return true;
  }

  function gameOver() {
    gameOverFlag = true;
    document.getElementById('gameHint').textContent = 'Game Over! Click New Game to try again.';

    saveScore(playerName, score, '2048');
    updateGameLeaderboard('2048');

    setTimeout(() => {
      showGameOverModal('2048 COMPLETE', `Score: ${score} points`);
    }, 1000);
  }

  function updateScore() {
    document.getElementById('gameResult').textContent = `Score: ${score}`;
    document.getElementById('scoreProgress').style.width = Math.min(score / 10000 * 100, 100) + '%';
  }

  document.addEventListener('keydown', function(e) {
    switch(e.key) {
      case 'ArrowLeft':
        move('left');
        break;
    }
  });

  initBoard();
}

// Utility Functions
function saveScore(name, score, game) {
  const scores = JSON.parse(localStorage.getItem('scores') || '[]');
  scores.push({name, score, game, ts: new Date().toISOString()});
  scores.sort((a,b) => b.score - a.score);
  scores.splice(100); // Keep top 100
  localStorage.setItem('scores', JSON.stringify(scores));
  loadStats();
}

function updateGameLeaderboard(gameType) {
  const scores = JSON.parse(localStorage.getItem('scores') || '[]');
  const gameScores = scores.filter(s => s.game === gameType).sort((a,b) => b.score - a.score).slice(0, 10);
  const list = document.getElementById('gameLeaderboard');
  list.innerHTML = gameScores.map(s => `<li><strong>${s.name}</strong><span class="muted"> — ${s.score} pts</span></li>`).join('');
  if (gameScores.length === 0) {
    document.getElementById('noScoresMsg').style.display = 'block';
  } else {
    document.getElementById('noScoresMsg').style.display = 'none';
  }
}

// Leaderboard section functions
function initLeaderboardSection() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const game = btn.dataset.game;
      populateGlobalLeaderboard(game);
    });
  });

  populateGlobalLeaderboard('reaction');
}

function populateGlobalLeaderboard(game) {
  const scores = JSON.parse(localStorage.getItem('scores') || '[]');
  const gameScores = scores.filter(s => s.game === game).sort((a,b) => b.score - a.score).slice(0, 10);
  const list = document.getElementById('globalLeaderboard');
  list.innerHTML = gameScores.map(s => `<li><strong>${s.name}</strong><span class="muted"> — ${s.score} pts</span></li>`).join('');
}

// Show welcome modal
function showWelcomeModal() {
  if (!localStorage.getItem('welcomeShown')) {
    setTimeout(() => {
      document.getElementById('welcomeModal').style.display = 'block';
      localStorage.setItem('welcomeShown', 'true');
    }, 1000);
  }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initTheme();
  initNavigation();
  initModals();
  initLeaderboardSection();
  loadStats();
  showWelcomeModal();

  // Hide loader after initialization
  setTimeout(() => {
    document.getElementById('loader').style.display = 'none';
  }, 3000);
});
