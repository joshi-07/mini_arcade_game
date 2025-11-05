// Memory Matching Game
const board = document.getElementById('gameBoard');
const hint = document.getElementById('hint');
const result = document.getElementById('result');
const nameInput = document.getElementById('playerName');
const restartBtn = document.getElementById('restartBtn');
const easyBtn = document.getElementById('easyBtn');
const hardBtn = document.getElementById('hardBtn');

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let attempts = 0;
let startTime = 0;
let gameSize = 16; // 4x4 default
let gameActive = false;
let touchStartX = 0;
let touchStartY = 0;

// Card symbols
const symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🐔', '🐧', '🐦'];

function createBoard() {
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${Math.sqrt(gameSize)}, 1fr)`;
  cards = [];

  // Shuffle symbols
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
  if (!gameActive || flippedCards.length >= 2 || this.classList.contains('flipped') || this.classList.contains('matched')) {
    return;
  }

  this.classList.add('flipped');
  this.textContent = this.dataset.symbol;
  flippedCards.push(this);

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

    if (matchedPairs === gameSize / 2) {
      endGame();
    }
  } else {
    card1.classList.remove('flipped');
    card2.classList.remove('flipped');
    card1.textContent = '';
    card2.textContent = '';
  }

  flippedCards = [];
}

function startGame() {
  if (nameInput.value.trim() === '') {
    alert('Please enter your name to start the game!');
    hint.textContent = 'Please enter your name to start the game!';
    return;
  }

  gameActive = true;
  matchedPairs = 0;
  attempts = 0;
  startTime = Date.now();
  result.textContent = '';
  hint.textContent = 'Click cards to flip them!';
  createBoard();
}

function endGame() {
  gameActive = false;
  const endTime = Date.now();
  const timeTaken = (endTime - startTime) / 1000;
  const score = Math.max(0, Math.round(1000 - (attempts * 10) - (timeTaken * 5)));

  result.textContent = `Completed in ${timeTaken.toFixed(1)}s with ${attempts} attempts! Score: ${score}`;

  // Update progress bar
  const progressFill = document.getElementById('scoreProgress');
  const maxScore = 1000;
  const progressPercent = Math.min((score / maxScore) * 100, 100);
  progressFill.style.width = `${progressPercent}%`;

  // Submit score
  const name = nameInput.value.trim() || 'Anonymous';
  let scores = JSON.parse(localStorage.getItem('scores') || '[]');
  scores.push({name, score, game: 'memory', ts: new Date().toISOString()});
  scores.sort((a,b) => b.score - a.score);
  scores = scores.slice(0,100); // keep top 100
  localStorage.setItem('scores', JSON.stringify(scores));

  hint.textContent = 'Great job! Press Restart for another round.';
}

function setDifficulty(size) {
  gameSize = size;
  easyBtn.classList.toggle('active', size === 16);
  hardBtn.classList.toggle('active', size === 36);
  // Start the game immediately if name is entered
  if (nameInput.value.trim() !== '') {
    startGame();
  } else {
    alert('Please enter your name to start the game!');
    hint.textContent = 'Please enter your name to start the game!';
  }
}

// Touch event handlers for swipe gestures (swipe to flip cards)
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

  // Determine swipe direction and find the card under the swipe
  const minSwipeDistance = 30;
  if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
    const target = e.target;
    if (target.classList.contains('memory-card') && !target.classList.contains('flipped') && !target.classList.contains('matched')) {
      flipCard.call(target);
    }
  }
});

// Event listeners
restartBtn.addEventListener('click', startGame);
easyBtn.addEventListener('click', () => setDifficulty(16));
hardBtn.addEventListener('click', () => setDifficulty(36));

// Initialize
gameSize = 16;
easyBtn.classList.add('active');
hardBtn.classList.remove('active');
