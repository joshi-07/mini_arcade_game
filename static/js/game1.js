// Modern Reaction Speed game with simple confetti
// Make sure this script is included at the end of the body.

const box = document.getElementById('gameBox');
const boxText = document.getElementById('boxText');
const countdownEl = document.getElementById('countdown');
const result = document.getElementById('result');
const hint = document.getElementById('hint');
const nameInput = document.getElementById('playerName');
const restartBtn = document.getElementById('restartBtn');
const confettiCanvas = document.getElementById('confettiCanvas');

let startTime = 0;
let timeoutId = null;
let counting = false;
let currentScore = 0;
let bestScore = localStorage.getItem('reactionBest') || 0;

// Ensure canvas fills screen
function resizeCanvas() {
  if (!confettiCanvas) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Tiny confetti system (no libs)
function spawnConfetti(x, y, count = 40) {
  if (!confettiCanvas) return;
  const ctx = confettiCanvas.getContext('2d');
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * -6 - 2,
      size: Math.random() * 7 + 4,
      color: ['#ff7aa2','#ffd166','#4dd0e1','#b28bff'][Math.floor(Math.random() * 4)],
      life: Math.random() * 60 + 40
    });
  }
  let frame = 0;
  const draw = () => {
    frame++;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (let p of particles) {
      if (p.life <= 0) continue;
      p.x += p.vx;
      p.vy += 0.18; // gravity
      p.y += p.vy;
      p.life -= 1;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size * 0.6, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (particles.some(p => p.life > 0)) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  };
  requestAnimationFrame(draw);
}

// visuals helpers
function setBoxState(color, text) {
  box.style.background = color;
  boxText.innerText = text;
}

// a smooth 3-2-1 animated countdown then immediate green
function startRound() {
  // clear previous
  clearTimeout(timeoutId);
  result.innerText = '';
  hint.innerText = 'Get ready...';
  setBoxState('linear-gradient(180deg,#ffd0d6,#ffb3b3)', 'Wait...');
  box.style.cursor = 'default';
  counting = true;

  let count = 3;
  countdownEl.innerText = count;
  const countInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownEl.innerText = count;
    } else {
      clearInterval(countInterval);
      countdownEl.innerText = '';
      startTime = performance.now();
      setBoxState('linear-gradient(180deg,#4CAF50,#45a049)', 'CLICK NOW!');
      hint.innerText = 'Click as fast as you can!';
      box.style.cursor = 'pointer';
    }
  }, 1000);
}

// click handler
  box.addEventListener('click', () => {

  if (counting && !waiting) {
    // clicked too early during countdown
    clearTimeout(timeoutId);
    result.innerText = 'Too soon! Wait for the countdown.';
    hint.innerText = 'Press Restart to try again.';
    waiting = false;
    counting = false;
    setBoxState('linear-gradient(180deg,#ffb3b3,#ffb3b3)', 'Too Soon!');

    // Show error modal
    setTimeout(() => {
      showFeedbackModal('Too Soon!', 'You clicked before the countdown finished. Try again!');
    }, 1000);
  } else if (waiting) {
    // clicked during wait - too soon
    clearTimeout(timeoutId);
    const timeSec = 0;
    const score = 0;
    result.innerText = `Too soon!`;
    hint.innerText = 'Press Restart to try again.';
    waiting = false;
    counting = false;
    setBoxState('linear-gradient(180deg,#ffb3b3,#ffb3b3)', 'Too Soon!');

    // Show error modal
    setTimeout(() => {
      showFeedbackModal('Too Soon!', 'You clicked before the box turned green. Try again!');
    }, 1000);
  } else if (startTime > 0) {
    // valid click
    const endTime = performance.now();
    const timeMs = endTime - startTime;
    const timeSec = timeMs / 1000;
    const score = Math.max(0, Math.round(1000 - timeMs));

    animateResult(timeSec, score);

    // Update progress bar
    const progressFill = document.getElementById('scoreProgress');
    const maxScore = 1000;
    const progressPercent = Math.min((score / maxScore) * 100, 100);
    progressFill.style.width = `${progressPercent}%`;

    // submit score
    const name = nameInput.value.trim() || 'Anonymous';
    let scores = JSON.parse(localStorage.getItem('scores') || '[]');
    scores.push({name, score, game: 'reaction', ts: new Date().toISOString()});
    scores.sort((a,b) => b.score - a.score);
    scores = scores.slice(0,100); // keep top 100
    localStorage.setItem('scores', JSON.stringify(scores));

    // confetti
    const rect = box.getBoundingClientRect();
    spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);

    hint.innerText = 'Great job! Press Restart for another round.';
    setBoxState('linear-gradient(180deg,#4CAF50,#45a049)', 'Well done!');
    startTime = 0;

    // Show success modal
    setTimeout(() => {
      showFeedbackModal('Great Score!', `You scored ${score} points in ${timeSec.toFixed(3)}s!`);
    }, 1000);
  } else {
    // start new round
    startRound();
  }
});

// keyboard accessibility (space/enter to click)
box.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    box.click();
  }
});

// small animated score update
function animateResult(timeSec, score) {
  result.innerText = `⏱️ Time: ${timeSec.toFixed(3)}s — 0 pts`;
  const duration = 600;
  const start = performance.now();
  const startScore = 0;
  const endScore = score;
  function step(ts) {
    const t = Math.min(1, (ts - start) / duration);
    const current = Math.round(startScore + (endScore - startScore) * easeOutCubic(t));
    result.innerText = `⏱️ Time: ${timeSec.toFixed(3)}s — ${current} pts`;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

// restart handler
restartBtn.addEventListener('click', resetRound);



function resetRound() {
  clearTimeout(timeoutId);
  waiting = false;
  startTime = 0;
  counting = false;
  result.innerText = '';
  hint.innerText = 'Click the box to start!';
  setBoxState('linear-gradient(180deg,#ffb3b3,#ffb3b3)', 'Click to start');
  countdownEl.innerText = '';
  box.style.cursor = 'pointer';
}

// Modal functions for feedback
function showFeedbackModal(title, message) {
  const modal = document.getElementById('feedbackModal');
  const titleEl = document.getElementById('feedbackTitle');
  const messageEl = document.getElementById('feedbackMessage');
  titleEl.innerText = title;
  messageEl.innerText = message;
  modal.style.display = 'block';
}

function closeFeedbackModal() {
  document.getElementById('feedbackModal').style.display = 'none';
}

// Close modal on click outside or close button
document.querySelector('#feedbackModal .close').onclick = closeFeedbackModal;
window.onclick = function(event) {
  const modal = document.getElementById('feedbackModal');
  if (event.target == modal) {
    closeFeedbackModal();
  }
}

// initialize
resetRound();
