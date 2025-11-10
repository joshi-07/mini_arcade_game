document.addEventListener('DOMContentLoaded', function() {
  const gameBoard = document.getElementById('gameBoard');
  const playerNameInput = document.getElementById('playerName');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const hint = document.getElementById('hint');
  const result = document.getElementById('result');
  const scoreProgress = document.getElementById('scoreProgress');

  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  canvas.style.border = '2px solid var(--border-color)';
  canvas.style.borderRadius = 'var(--radius)';
  canvas.style.background = 'var(--bg-secondary)';
  gameBoard.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  let paddle = { x: canvas.width / 2 - 50, y: canvas.height - 20, width: 100, height: 10 };
  let ball = { x: canvas.width / 2, y: canvas.height - 30, dx: 1.5, dy: -1.5, radius: 8 };
  let bricks = [];
  let score = 0;
  let lives = 3;
  let gameRunning = false;
  let rightPressed = false;
  let leftPressed = false;

  const brickRowCount = 5;
  const brickColumnCount = 8;
  const brickWidth = 40;
  const brickHeight = 20;
  const brickPadding = 5;
  const brickOffsetTop = 30;
  const brickOffsetLeft = 20;

  // Initialize bricks
  function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
  }

  // Draw bricks
  function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].status === 1) {
          const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
          const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, brickWidth, brickHeight);
          ctx.fillStyle = '#0095DD';
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  }

  // Draw paddle
  function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
  }

  // Draw ball
  function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
  }

  // Draw score and lives
  function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('Score: ' + score, 8, 20);
    ctx.fillText('Lives: ' + lives, canvas.width - 65, 20);
  }

  // Collision detection
  function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const b = bricks[c][r];
        if (b.status === 1) {
          if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
            ball.dy = -ball.dy;
            b.status = 0;
            score += 10;
            updateScore();
            if (score === brickRowCount * brickColumnCount * 10) {
              gameOver(true);
            }
          }
        }
      }
    }
  }

  // Update score display
  function updateScore() {
    result.textContent = `Score: ${score} | Lives: ${lives}`;
    scoreProgress.style.width = Math.min(score / 400 * 100, 100) + '%';
  }

  // Draw everything
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();

    // Paddle movement
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
      paddle.x += 5;
    } else if (leftPressed && paddle.x > 0) {
      paddle.x -= 5;
    }

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
      ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
      ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
      if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.dy;
      } else {
        lives--;
        if (!lives) {
          gameOver(false);
        } else {
          ball.x = canvas.width / 2;
          ball.y = canvas.height - 30;
          ball.dx = 1.5;
          ball.dy = -1.5;
          paddle.x = (canvas.width - paddle.width) / 2;
        }
      }
    }

    if (gameRunning) {
      requestAnimationFrame(draw);
    }
  }

  // Mouse movement
  function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
      paddle.x = relativeX - paddle.width / 2;
    }
  }

  // Keyboard controls
  function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
      rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
      leftPressed = true;
    }
  }

  function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
      rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
      leftPressed = false;
    }
  }

  // Touch controls
  function touchMoveHandler(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const relativeX = touch.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
      paddle.x = relativeX - paddle.width / 2;
    }
  }

  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup', keyUpHandler);
  document.addEventListener('mousemove', mouseMoveHandler);
  canvas.addEventListener('touchmove', touchMoveHandler);

  function startGame() {
    score = 0;
    lives = 3;
    initBricks();
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 30;
    ball.dx = 1.5;
    ball.dy = -1.5;
    paddle.x = (canvas.width - paddle.width) / 2;
    gameRunning = true;
    updateScore();
    hint.textContent = 'Move the paddle to bounce the ball!';
    startBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    draw();
  }

  function gameOver(win) {
    gameRunning = false;
    if (win) {
      hint.textContent = 'You win! Press Restart to play again.';
    } else {
      hint.textContent = 'Game Over! Press Restart to play again.';
    }
    startBtn.style.display = 'none';
    restartBtn.style.display = 'inline-block';

    // Save score
    const playerName = playerNameInput.value.trim() || 'Anonymous';
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    scores.push({name: playerName, score: score, game: 'breakout'});
    localStorage.setItem('scores', JSON.stringify(scores));
    populateLeaderboard();
  }

  function restartGame() {
    gameOver(false);
    startGame();
  }

  // Virtual control buttons
  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');

  leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    leftPressed = true;
  });
  leftBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    leftPressed = false;
  });
  leftBtn.addEventListener('mousedown', () => {
    leftPressed = true;
  });
  leftBtn.addEventListener('mouseup', () => {
    leftPressed = false;
  });
  leftBtn.addEventListener('mouseleave', () => {
    leftPressed = false;
  });

  rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    rightPressed = true;
  });
  rightBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    rightPressed = false;
  });
  rightBtn.addEventListener('mousedown', () => {
    rightPressed = true;
  });
  rightBtn.addEventListener('mouseup', () => {
    rightPressed = false;
  });
  rightBtn.addEventListener('mouseleave', () => {
    rightPressed = false;
  });

  // Event listeners
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', restartGame);

  function populateLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    const breakoutScores = scores.filter(s => s.game === 'breakout').sort((a,b) => b.score - a.score).slice(0, 10);
    const list = document.getElementById('leaderList');
    list.innerHTML = breakoutScores.map(s => `<li><strong>${s.name}</strong><span class="muted"> — ${s.score} pts</span></li>`).join('');
  }
});
