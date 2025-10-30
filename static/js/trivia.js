// Trivia Quiz Game
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const hint = document.getElementById('hint');
const result = document.getElementById('result');
const nameInput = document.getElementById('playerName');
const startBtn = document.getElementById('startBtn');

let currentQuestion = 0;
let score = 0;
let questions = [];
let startTime = 0;
let gameActive = false;

// Sample questions (in a real app, these would come from an API)
const sampleQuestions = [
  {
    question: "What is the capital of France?",
    answers: ["London", "Berlin", "Paris", "Madrid"],
    correct: 2
  },
  {
    question: "Which planet is known as the Red Planet?",
    answers: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct: 1
  },
  {
    question: "What is 2 + 2?",
    answers: ["3", "4", "5", "6"],
    correct: 1
  },
  {
    question: "Who painted the Mona Lisa?",
    answers: ["Van Gogh", "Da Vinci", "Picasso", "Rembrandt"],
    correct: 1
  },
  {
    question: "What is the largest ocean on Earth?",
    answers: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correct: 3
  }
];

function loadQuestions() {
  // In a real app, fetch from API
  questions = [...sampleQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
}

function displayQuestion() {
  if (currentQuestion >= questions.length) {
    endGame();
    return;
  }

  const q = questions[currentQuestion];
  questionEl.textContent = q.question;
  answersEl.innerHTML = '';

  q.answers.forEach((answer, index) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = answer;
    btn.addEventListener('click', () => selectAnswer(index));
    answersEl.appendChild(btn);
  });

  startTime = Date.now();
}

function selectAnswer(selectedIndex) {
  if (!gameActive) return;

  const q = questions[currentQuestion];
  const buttons = answersEl.querySelectorAll('.answer-btn');
  const timeTaken = (Date.now() - startTime) / 1000;

  // Disable all buttons
  buttons.forEach(btn => btn.disabled = true);

  if (selectedIndex === q.correct) {
    buttons[selectedIndex].classList.add('correct');
    const timeBonus = Math.max(0, 10 - timeTaken);
    score += Math.round(100 + timeBonus);
    result.textContent = `Correct! +${Math.round(100 + timeBonus)} points`;
  } else {
    buttons[selectedIndex].classList.add('wrong');
    buttons[q.correct].classList.add('correct');
    score += 10; // Small points for wrong answer
    result.textContent = `Wrong! The correct answer was: ${q.answers[q.correct]}`;
  }

  currentQuestion++;
  setTimeout(displayQuestion, 2000);
}

function startGame() {
  gameActive = true;
  currentQuestion = 0;
  score = 0;
  result.textContent = '';
  hint.textContent = 'Answer as quickly as possible!';
  loadQuestions();
  displayQuestion();
  startBtn.textContent = 'Playing...';
  startBtn.disabled = true;
}

function endGame() {
  gameActive = false;
  result.textContent = `Quiz completed! Final score: ${score}`;
  hint.textContent = 'Great job! Press Start Quiz to play again.';

  // Submit score
  const name = nameInput.value.trim() || 'Anonymous';
  let scores = JSON.parse(localStorage.getItem('scores') || '[]');
  scores.push({name, score, game: 'trivia', ts: new Date().toISOString()});
  scores.sort((a,b) => b.score - a.score);
  scores = scores.slice(0,100); // keep top 100
  localStorage.setItem('scores', JSON.stringify(scores));

  startBtn.textContent = 'Start Quiz';
  startBtn.disabled = false;
}

// Event listeners
startBtn.addEventListener('click', startGame);

// Initialize
loadQuestions();
