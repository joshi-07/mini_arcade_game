document.addEventListener('DOMContentLoaded', function() {
  const gameBoard = document.getElementById('gameBoard');
  const playerNameInput = document.getElementById('playerName');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const hint = document.getElementById('hint');
  const result = document.getElementById('result');
  const scoreProgress = document.getElementById('scoreProgress');

  const boardSize = 20;
  const cellSize = 20;
  gameBoard.style.width = boardSize * cellSize + 'px';
  gameBoard.style.height = boardSize * cellSize + 'px';
  gameBoard.style.position = 'relative';
  gameBoard.style.border = '2px solid #333';

  let snake = [{x: 10, y: 10}];
  let direction = {x: 0, y: 0};
  let food = {};
  let score = 0;
  let gameRunning = false;
  let gameInterval;

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
    gameBoard.innerHTML = '';
    // Draw snake
    snake.forEach(segment => {
      const snakeCell = createCell(segment.x, segment.y, 'snake-cell');
      snakeCell.style.backgroundColor = '#4CAF50';
      gameBoard.appendChild(snakeCell);
    });
    // Draw food
    const foodCell = createCell(food.x, food.y, 'food-cell');
    foodCell.style.backgroundColor = '#FF5722';
    foodCell.style.borderRadius = '50%';
    gameBoard.appendChild(foodCell);
  }

  function generateFood() {
    do {
      food.x = Math.floor(Math.random() * boardSize);
      food.y = Math.floor(Math.random() * boardSize);
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  }

  function moveSnake() {
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

    // Check food
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      generateFood();
    } else {
      snake.pop();
    }

    drawBoard();
    updateScore();
  }

  function updateScore() {
    result.textContent = `Score: ${score}`;
    scoreProgress.style.width = Math.min(score / 100 * 100, 100) + '%';
  }

  function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    hint.textContent = 'Game Over! Press Restart to play again.';
    startBtn.style.display = 'none';
    restartBtn.style.display = 'inline-block';

    // Save score
    const playerName = playerNameInput.value.trim() || 'Anonymous';
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    scores.push({name: playerName, score: score, game: 'snake'});
    localStorage.setItem('scores', JSON.stringify(scores));
    populateLeaderboard();
  }

  function startGame() {
    snake = [{x: 10, y: 10}];
    direction = {x: 0, y: 0};
    score = 0;
    gameRunning = true;
    generateFood();
    drawBoard();
    updateScore();
    hint.textContent = 'Use arrow keys or WASD to move!';
    startBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    gameInterval = setInterval(moveSnake, 150);
  }

  function restartGame() {
    clearInterval(gameInterval);
    startGame();
  }

  // Event listeners
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', restartGame);

  // Keyboard controls
  document.addEventListener('keydown', function(e) {
    if (!gameRunning) return;
    switch(e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (direction.y === 0) direction = {x: 0, y: -1};
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (direction.y === 0) direction = {x: 0, y: 1};
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (direction.x === 0) direction = {x: -1, y: 0};
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (direction.x === 0) direction = {x: 1, y: 0};
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
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (diffX > 0 && direction.x === 0) direction = {x: 1, y: 0};
      else if (diffX < 0 && direction.x === 0) direction = {x: -1, y: 0};
    } else {
      // Vertical swipe
      if (diffY > 0 && direction.y === 0) direction = {x: 0, y: 1};
      else if (diffY < 0 && direction.y === 0) direction = {x: 0, y: -1};
    }
  });

  function populateLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    const snakeScores = scores.filter(s => s.game === 'snake').sort((a,b) => b.score - a.score).slice(0, 10);
    const list = document.getElementById('leaderList');
    list.innerHTML = snakeScores.map(s => `<li><strong>${s.name}</strong><span class="muted"> — ${s.score} pts</span></li>`).join('');
  }
});
