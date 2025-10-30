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
  if (nameInput.value.trim() === '') {
    alert('Please enter your name to start the game!');
    hint.textContent = 'Please enter your name to start the game!';
    return;
  }

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

  // Submit score
  const name = nameInput.value.trim() || 'Anonymous';
  let scores = JSON.parse(localStorage.getItem('scores') || '[]');
  scores.push({name, score, game: 'puzzle', ts: new Date().toISOString()});
  scores.sort((a,b) => b.score - a.score);
  scores = scores.slice(0,100); // keep top 100
  localStorage.setItem('scores', JSON.stringify(scores));

  hint.textContent = 'Congratulations! Press New Puzzle for another challenge.';
}

// Event listeners
restartBtn.addEventListener('click', startGame);

// Initialize
// Do not start game automatically
