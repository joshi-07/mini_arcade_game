document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const gameBoard = document.getElementById('gameBoard');
  const playerNameInput = document.getElementById('playerName');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const hint = document.getElementById('hint');
  const result = document.getElementById('result');
  const scoreProgress = document.getElementById('scoreProgress');
  const virtualControls = document.getElementById('virtualControls');
  const upBtn = document.getElementById('upBtn');
  const downBtn = document.getElementById('downBtn');
  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');

  // Audio Elements
  const eatSound = document.getElementById('eatSound');
  const gameOverSound = document.getElementById('gameOverSound');
  const bgMusic = document.getElementById('bgMusic');

  // Game Constants
  const boardSize = 20;
  const cellSize = 20;
  const initialSpeed = 300;
  const speedIncrement = 5;
  const maxSpeed = 100;

  // Game State
  let snake = [];
  let direction = {x: 0, y: 0};
  let nextDirection = {x: 0, y: 0};
  let food = {};
  let score = 0;
  let gameRunning = false;
  let gameSpeed = initialSpeed;
  let lastTime = 0;
  let particles = [];
  let soundEnabled = true;
  let musicEnabled = false;

  // Initialize game board
  gameBoard.style.width = boardSize * cellSize + 'px';
  gameBoard.style.height = boardSize * cellSize + 'px';

  // Particle System
  class Particle {
    constructor(x, y, color, life = 30) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = (Math.random() - 0.5) * 4;
      this.color = color;
      this.life = life;
      this.maxLife = life;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life--;
      this.vx *= 0.98;
      this.vy *= 0.98;
    }

    draw(ctx) {
      const alpha = this.life / this.maxLife;
      ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
      ctx.fillRect(this.x, this.y, 2, 2);
    }
  }

  // Sound Management
  function playSound(audioElement) {
    if (soundEnabled && audioElement) {
      audioElement.currentTime = 0;
      audioElement.play().catch(() => {}); // Ignore errors if audio fails
    }
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    if (!soundEnabled) {
      bgMusic.pause();
    } else if (musicEnabled && gameRunning) {
      bgMusic.play().catch(() => {});
    }
  }

  function toggleMusic() {
    musicEnabled = !musicEnabled;
    if (musicEnabled && gameRunning) {
      bgMusic.play().catch(() => {});
    } else {
      bgMusic.pause();
    }
  }

  // Create game cell
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

  // Draw game board with animations
  function drawBoard() {
    gameBoard.innerHTML = '';

    // Draw snake with smooth animations
    snake.forEach((segment, index) => {
      const snakeCell = createCell(segment.x, segment.y, 'snake-cell');
      const opacity = 1 - (index / snake.length) * 0.3;
      snakeCell.style.opacity = opacity;
      gameBoard.appendChild(snakeCell);
    });

    // Draw food with pulsing effect
    const foodCell = createCell(food.x, food.y, 'food-cell');
    gameBoard.appendChild(foodCell);

    // Draw particles
    particles.forEach(particle => {
      const particleCell = createCell(particle.x / cellSize, particle.y / cellSize, '');
      particleCell.style.backgroundColor = particle.color;
      particleCell.style.width = '2px';
      particleCell.style.height = '2px';
      particleCell.style.borderRadius = '50%';
      gameBoard.appendChild(particleCell);
    });
  }

  // Generate food position
  function generateFood() {
    do {
      food.x = Math.floor(Math.random() * boardSize);
      food.y = Math.floor(Math.random() * boardSize);
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  }

  // Move snake with smooth animation
  function moveSnake() {
    direction = nextDirection;
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

    // Check wall collision
    if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
      gameOver();
      return;
    }

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      playSound(eatSound);

      // Create particle effect
      for (let i = 0; i < 10; i++) {
        particles.push(new Particle(
          food.x * cellSize + cellSize / 2,
          food.y * cellSize + cellSize / 2,
          '#FF5722'
        ));
      }

      generateFood();

      // Increase speed
      gameSpeed = Math.max(maxSpeed, gameSpeed - speedIncrement);
    } else {
      snake.pop();
    }

    drawBoard();
    updateScore();
  }

  // Update particles
  function updateParticles() {
    particles = particles.filter(particle => {
      particle.update();
      return particle.life > 0;
    });
  }

  // Update score display with animation
  function updateScore() {
    result.textContent = `Score: ${score}`;
    const progress = Math.min(score / 100 * 100, 100);
    scoreProgress.style.width = progress + '%';

    // Animate score text
    result.style.transform = 'scale(1.1)';
    setTimeout(() => {
      result.style.transform = 'scale(1)';
    }, 100);
  }

  // Game over with animation
  function gameOver() {
    gameRunning = false;
    playSound(gameOverSound);
    bgMusic.pause();

    hint.textContent = 'Game Over! Press Restart to play again.';
    startBtn.style.display = 'none';
    restartBtn.style.display = 'inline-block';

    // Animate game over
    gameBoard.style.animation = 'shake 0.5s ease-in-out';

    // Save score
    const playerName = playerNameInput.value.trim() || 'Anonymous';
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    scores.push({name: playerName, score: score, game: 'snake'});
    localStorage.setItem('scores', JSON.stringify(scores));
    populateLeaderboard();

    setTimeout(() => {
      gameBoard.style.animation = '';
    }, 500);
  }

  // Start game
  function startGame() {
    snake = [{x: 10, y: 10}];
    direction = {x: 0, y: 0};
    nextDirection = {x: 0, y: 0};
    score = 0;
    gameSpeed = initialSpeed;
    particles = [];
    gameRunning = true;
    generateFood();
    drawBoard();
    updateScore();
    hint.textContent = 'Use arrow keys, WASD, or virtual controls to move!';
    startBtn.style.display = 'none';
    restartBtn.style.display = 'none';

    if (musicEnabled) {
      bgMusic.play().catch(() => {});
    }

    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  }

  // Restart game
  function restartGame() {
    gameRunning = false;
    setTimeout(startGame, 100);
  }

  // Main game loop for smooth 60fps animation
  function gameLoop(currentTime) {
    if (!gameRunning) return;

    const deltaTime = currentTime - lastTime;

    if (deltaTime >= gameSpeed && (nextDirection.x !== 0 || nextDirection.y !== 0)) {
      moveSnake();
      lastTime = currentTime;
    }

    updateParticles();
    drawBoard();

    requestAnimationFrame(gameLoop);
  }

  // Change direction
  function changeDirection(newDirection) {
    if (!gameRunning) return;

    // Prevent reverse direction
    if (newDirection.x !== -direction.x || newDirection.y !== -direction.y) {
      nextDirection = newDirection;
    }
  }

  // Event listeners
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', restartGame);

  // Virtual controls
  upBtn.addEventListener('click', () => changeDirection({x: 0, y: -1}));
  downBtn.addEventListener('click', () => changeDirection({x: 0, y: 1}));
  leftBtn.addEventListener('click', () => changeDirection({x: -1, y: 0}));
  rightBtn.addEventListener('click', () => changeDirection({x: 1, y: 0}));

  // Keyboard controls
  document.addEventListener('keydown', function(e) {
    switch(e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        changeDirection({x: 0, y: -1});
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        changeDirection({x: 0, y: 1});
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        changeDirection({x: -1, y: 0});
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        changeDirection({x: 1, y: 0});
        break;
      case 'm':
      case 'M':
        toggleMusic();
        break;
      case 'n':
      case 'N':
        toggleSound();
        break;
    }
  });

  // Touch controls for mobile
  let touchStartX = 0;
  let touchStartY = 0;
  gameBoard.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });
  gameBoard.addEventListener('touchend', function(e) {
    if (!gameRunning) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    const minSwipeDistance = 30;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (Math.abs(diffX) > minSwipeDistance) {
        changeDirection(diffX > 0 ? {x: 1, y: 0} : {x: -1, y: 0});
      }
    } else {
      // Vertical swipe
      if (Math.abs(diffY) > minSwipeDistance) {
        changeDirection(diffY > 0 ? {x: 0, y: 1} : {x: 0, y: -1});
      }
    }
  });

  // Populate leaderboard
  function populateLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    const snakeScores = scores.filter(s => s.game === 'snake').sort((a,b) => b.score - a.score).slice(0, 10);
    const list = document.getElementById('leaderList');
    list.innerHTML = snakeScores.map(s => `<li><strong>${s.name}</strong><span class="muted"> — ${s.score} pts</span></li>`).join('');
  }

  // Initialize
  populateLeaderboard();
});
