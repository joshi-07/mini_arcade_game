// Puzzle Slider Game
const board = document.getElementById('puzzleBoard');
const hint = document.getElementById('hint');
const result = document.getElementById('result');
const nameInput = document.getElementById('playerName');
const restartBtn = document.getElementById('restartBtn');

let tiles = [];
let emptyIndex = 15;
let moves = 0;
let startTime = 0;
let gameActive = false;
let touchStartX = 0;
let touchStartY = 0;

// Create initial solved state
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
  // Perform random valid moves to shuffle
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

  // Check adjacent tiles
  if (row > 0) validMoves.push(emptyIndex - 4); // up
  if (row < 3) validMoves.push(emptyIndex + 4); // down
  if (col > 0) validMoves.push(emptyIndex - 1); // left
  if (col < 3) validMoves.push(emptyIndex + 1); // right

  return validMoves;
}

function moveTile() {
  if (!gameActive) return;

  const tileIndex = parseInt(this.dataset.index);
  if (getValidMoves().includes(tileIndex)) {
    moveTileIndex(tileIndex);
    moves++;

    if (isSolved()) {
      endGame();
    }
  }
}

function moveTileIndex(tileIndex) {
  // Swap tile with empty space
  const tile = tiles[tileIndex];
  const emptyTile = tiles[emptyIndex];

  // Swap content
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

function startGame() {
  gameActive = true;
  startTime = Date.now();
  result.textContent = '';
  hint.textContent = 'Click tiles to slide them!';
  createBoard();
  shuffleBoard();
}

function endGame() {
  gameActive = false;
  const endTime = Date.now();
  const timeTaken = (endTime - startTime) / 1000;
  const score = Math.max(0, Math.round(1000 - (moves * 10) - (timeTaken * 2)));

  result.textContent = `Solved in ${moves} moves and ${timeTaken.toFixed(1)}s! Score: ${score}`;

  // Update progress bar
  const progressFill = document.getElementById('scoreProgress');
  const maxScore = 1000;
  const progressPercent = Math.min((score / maxScore) * 100, 100);
  progressFill.style.width = `${progressPercent}%`;

  // Submit score
  const name = nameInput.value.trim() || 'Anonymous';
  let scores = JSON.parse(localStorage.getItem('scores') || '[]');
  scores.push({name, score, game: 'puzzle', ts: new Date().toISOString()});
  scores.sort((a,b) => b.score - a.score);
  scores = scores.slice(0,100); // keep top 100
  localStorage.setItem('scores', JSON.stringify(scores));

  hint.textContent = 'Congratulations! Press New Puzzle for another challenge.';
}

// Touch event handlers for swipe gestures
board.addEventListener('touchstart', (e) => {
  if (!gameActive) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

board.addEventListener('touchend', (e) => {
  if (!gameActive) return;
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  // Determine swipe direction
  const minSwipeDistance = 50;
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal swipe
    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right - move tile left
        attemptSwipe('right');
      } else {
        // Swipe left - move tile right
        attemptSwipe('left');
      }
    }
  } else {
    // Vertical swipe
    if (Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0) {
        // Swipe down - move tile up
        attemptSwipe('down');
      } else {
        // Swipe up - move tile down
        attemptSwipe('up');
      }
    }
  }
});

function attemptSwipe(direction) {
  const validMoves = getValidMoves();
  let targetIndex = -1;

  switch (direction) {
    case 'up':
      targetIndex = emptyIndex + 4; // Tile above empty
      break;
    case 'down':
      targetIndex = emptyIndex - 4; // Tile below empty
      break;
    case 'left':
      targetIndex = emptyIndex + 1; // Tile to the left of empty
      break;
    case 'right':
      targetIndex = emptyIndex - 1; // Tile to the right of empty
      break;
  }

  if (validMoves.includes(targetIndex)) {
    moveTileIndex(targetIndex);
    moves++;
    if (isSolved()) {
      endGame();
    }
  }
}

// Event listeners
restartBtn.addEventListener('click', startGame);

// Initialize
// Do not start game automatically
