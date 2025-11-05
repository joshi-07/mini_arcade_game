document.addEventListener('DOMContentLoaded', function() {
  const gameBoard = document.getElementById('gameBoard');
  const playerNameInput = document.getElementById('playerName');
  const startBtn = document.getElementById('startBtn');
  const hint = document.getElementById('hint');
  const result = document.getElementById('result');
  const scoreProgress = document.getElementById('scoreProgress');

  const size = 4;
  let board = [];
  let score = 0;
  let gameOverFlag = false;

  // Initialize board
  function initBoard() {
    board = Array(size).fill().map(() => Array(size).fill(0));
    score = 0;
    gameOverFlag = false;
    addRandomTile();
    addRandomTile();
    drawBoard();
    updateScore();
  }

  // Add random tile
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

  // Draw board
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

  // Get tile color
  function getTileColor(value) {
    const colors = {
      2: '#EEE4DA', 4: '#EDE0C8', 8: '#F2B179', 16: '#F59563',
      32: '#F67C5F', 64: '#F65E3B', 128: '#EDCF72', 256: '#EDCC61',
      512: '#EDC850', 1024: '#EDC53F', 2048: '#EDC22E'
    };
    return colors[value] || '#3C3A32';
  }

  // Move tiles
  function move(direction) {
    if (gameOverFlag) return;
    let moved = false;
    const newBoard = board.map(row => [...row]);

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
    } else if (direction === 'right') {
      for (let i = 0; i < size; i++) {
        const row = newBoard[i].filter(val => val !== 0).reverse();
        for (let j = 0; j < row.length - 1; j++) {
          if (row[j] === row[j + 1]) {
            row[j] *= 2;
            score += row[j];
            row[j + 1] = 0;
          }
        }
        const newRow = row.filter(val => val !== 0).reverse();
        while (newRow.length < size) newRow.unshift(0);
        if (JSON.stringify(newBoard[i]) !== JSON.stringify(newRow)) moved = true;
        newBoard[i] = newRow;
      }
    } else if (direction === 'up') {
      for (let j = 0; j < size; j++) {
        const col = newBoard.map(row => row[j]).filter(val => val !== 0);
        for (let i = 0; i < col.length - 1; i++) {
          if (col[i] === col[i + 1]) {
            col[i] *= 2;
            score += col[i];
            col[i + 1] = 0;
          }
        }
        const newCol = col.filter(val => val !== 0);
        while (newCol.length < size) newCol.push(0);
        for (let i = 0; i < size; i++) {
          if (newBoard[i][j] !== newCol[i]) moved = true;
          newBoard[i][j] = newCol[i];
        }
      }
    } else if (direction === 'down') {
      for (let j = 0; j < size; j++) {
        const col = newBoard.map(row => row[j]).filter(val => val !== 0).reverse();
        for (let i = 0; i < col.length - 1; i++) {
          if (col[i] === col[i + 1]) {
            col[i] *= 2;
            score += col[i];
            col[i + 1] = 0;
          }
        }
        const newCol = col.filter(val => val !== 0).reverse();
        while (newCol.length < size) newCol.unshift(0);
        for (let i = 0; i < size; i++) {
          if (newBoard[i][j] !== newCol[i]) moved = true;
          newBoard[i][j] = newCol[i];
        }
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

  // Check game over
  function isGameOver() {
    // Check for empty cells
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i][j] === 0) return false;
      }
    }
    // Check for possible merges
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if ((i < size - 1 && board[i][j] === board[i + 1][j]) ||
            (j < size - 1 && board[i][j] === board[i][j + 1])) {
          return false;
        }
      }
    }
    return true;
  }

  // Game over
  function gameOver() {
    gameOverFlag = true;
    hint.textContent = 'Game Over! Press New Game to try again.';
    // Save score
    const playerName = playerNameInput.value.trim() || 'Anonymous';
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    scores.push({name: playerName, score: score, game: '2048'});
    localStorage.setItem('scores', JSON.stringify(scores));
    populateLeaderboard();
  }

  // Update score
  function updateScore() {
    result.textContent = `Score: ${score}`;
    scoreProgress.style.width = Math.min(score / 10000 * 100, 100) + '%';
  }

  // Keyboard controls
  document.addEventListener('keydown', function(e) {
    switch(e.key) {
      case 'ArrowLeft':
        move('left');
        break;
      case 'ArrowRight':
        move('right');
        break;
      case 'ArrowUp':
        move('up');
        break;
      case 'ArrowDown':
        move('down');
        break;
    }
  });

  // Touch controls
  let touchStartX = 0;
  let touchStartY = 0;
  gameBoard.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });
  gameBoard.addEventListener('touchend', function(e) {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 50) move('right');
      else if (diffX < -50) move('left');
    } else {
      if (diffY > 50) move('down');
      else if (diffY < -50) move('up');
    }
  });

  // Start game
  startBtn.addEventListener('click', startGame);

  function startGame() {
    initBoard();
  }

  function populateLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    const tileScores = scores.filter(s => s.game === '2048').sort((a,b) => b.score - a.score).slice(0, 10);
    const list = document.getElementById('leaderList');
    list.innerHTML = tileScores.map(s => `<li><strong>${s.name}</strong><span class="muted"> — ${s.score} pts</span></li>`).join('');
  }

  // Initial setup
  initBoard();
});
