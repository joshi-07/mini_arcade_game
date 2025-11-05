document.addEventListener('DOMContentLoaded', function() {
  const gameBoard = document.getElementById('gameBoard');
  const playerNameInput = document.getElementById('playerName');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const hint = document.getElementById('hint');
  const result = document.getElementById('result');
  const scoreProgress = document.getElementById('scoreProgress');

  const holes = 9;
  const gameTime = 30000; // 30 seconds
  let score = 0;
  let timeLeft = gameTime / 1000;
  let gameRunning = false;
  let moleInterval;
  let timeInterval;
  let currentMole = null;

  // Create holes
  for (let i = 0; i < holes; i++) {
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
    gameBoard.appendChild(hole);
  }

  const allHoles = document.querySelectorAll('.hole');
  const allMoles = document.querySelectorAll('.mole');

  function randomHole() {
    const index = Math.floor(Math.random() * holes);
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
        score = Math.max(0, score - 5); // Penalty for miss
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
    }
  }

  function updateScore() {
    result.textContent = `Score: ${score} | Time: ${timeLeft}s`;
    scoreProgress.style.width = Math.min(score / 100 * 100, 100) + '%';
  }

  function startGame() {
    score = 0;
    timeLeft = gameTime / 1000;
    gameRunning = true;
    updateScore();
    hint.textContent = 'Whack the moles!';
    startBtn.style.display = 'none';
    restartBtn.style.display = 'none';

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
    hint.textContent = 'Game Over! Press Restart to play again.';
    startBtn.style.display = 'none';
    restartBtn.style.display = 'inline-block';

    // Save score
    const playerName = playerNameInput.value.trim() || 'Anonymous';
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    scores.push({name: playerName, score: score, game: 'whackamole'});
    localStorage.setItem('scores', JSON.stringify(scores));
    populateLeaderboard();
  }

  function restartGame() {
    gameOver();
    startGame();
  }

  // Event listeners
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', restartGame);

  // Keyboard support (space to whack if focused)
  document.addEventListener('keydown', function(e) {
    if (e.key === ' ' && gameRunning && currentMole) {
      whackMole({target: currentMole});
    }
  });

  function populateLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    const whackScores = scores.filter(s => s.game === 'whackamole').sort((a,b) => b.score - a.score).slice(0, 10);
    const list = document.getElementById('leaderList');
    list.innerHTML = whackScores.map(s => `<li><strong>${s.name}</strong><span class="muted"> — ${s.score} pts</span></li>`).join('');
  }
});
