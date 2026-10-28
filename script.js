const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreValEl = document.getElementById('score-val');
const highScoreValEl = document.getElementById('high-score-val');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const gridSize = 20;
const tileCount = 20;

let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('cyber_snake_highscore') || 0;
let gameInterval = null;
let gameSpeed = 120;
let changingDirection = false;
let gameStarted = false;

highScoreValEl.innerText = highScore;

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  dx = 0;
  dy = 0;
  gameStarted = false;
  score = 0;
  gameSpeed = 120;
  scoreValEl.innerText = score;
  spawnFood();
}

function spawnFood() {
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
    type: Math.random() < 0.15 ? 'gold' : (Math.random() < 0.25 ? 'slow' : 'normal')
  };

  for (let part of snake) {
    if (part.x === food.x && part.y === food.y) {
      spawnFood();
      break;
    }
  }
}

function main() {
  if (hasGameEnded()) {
    endGame();
    return;
  }

  changingDirection = false;
  clearCanvas();
  drawFood();
  
  if (gameStarted) {
    moveSnake();
  }
  
  drawSnake();
}

function clearCanvas() {
  ctx.fillStyle = '#020208';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.03)';
  ctx.lineWidth = 1;
  for (let i = 0; i < tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? '#00f2fe' : '#4facfe';
    ctx.shadowBlur = index === 0 ? 15 : 5;
    ctx.shadowColor = '#00f2fe';
    ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
  });
  ctx.shadowBlur = 0;
}

function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    if (food.type === 'gold') {
      score += 50;
    } else if (food.type === 'slow') {
      score += 20;
      gameSpeed += 20;
      clearInterval(gameInterval);
      gameInterval = setInterval(main, gameSpeed);
    } else {
      score += 10;
    }

    scoreValEl.innerText = score;
    if (score > highScore) {
      highScore = score;
      highScoreValEl.innerText = highScore;
      localStorage.setItem('cyber_snake_highscore', highScore);
    }
    spawnFood();
  } else {
    snake.pop();
  }
}

function drawFood() {
  ctx.beginPath();
  const fx = food.x * gridSize + gridSize / 2;
  const fy = food.y * gridSize + gridSize / 2;
  
  if (food.type === 'gold') {
    ctx.fillStyle = '#ffcc00';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffcc00';
  } else if (food.type === 'slow') {
    ctx.fillStyle = '#3b82f6';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#3b82f6';
  } else {
    ctx.fillStyle = '#ff416c';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff416c';
  }

  ctx.arc(fx, fy, gridSize / 2 - 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function hasGameEnded() {
  if (!gameStarted) return false;
  const head = snake[0];

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    return true;
  }

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) return true;
  }
  return false;
}

function changeDirection(newDx, newDy) {
  if (changingDirection) return;
  
  if (!gameStarted) {
    gameStarted = true;
    dx = newDx;
    dy = newDy;
    changingDirection = true;
    return;
  }

  if (newDx === -dx && newDy === -dy) return;

  dx = newDx;
  dy = newDy;
  changingDirection = true;
}

// ربط أزرار الشاشة باللمس وبالماوس
const bindBtn = (id, newDx, newDy) => {
  const el = document.getElementById(id);
  
  const handler = (e) => {
    if (e.cancelable) e.preventDefault();
    changeDirection(newDx, newDy);
  };

  el.addEventListener('touchstart', handler, { passive: false });
  el.addEventListener('click', handler);
};

bindBtn('btn-up', 0, -1);
bindBtn('btn-down', 0, 1);
bindBtn('btn-left', -1, 0);
bindBtn('btn-right', 1, 0);

// ربط لوحة المفاتيح للكمبيوتر
window.addEventListener('keydown', e => {
  const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D'];
  if (keys.includes(e.key)) {
    e.preventDefault();
  }

  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') changeDirection(0, -1);
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') changeDirection(0, 1);
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') changeDirection(-1, 0);
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') changeDirection(1, 0);
});

function startGame() {
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  resetGame();
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(main, gameSpeed);
  clearCanvas();
  drawFood();
  drawSnake();
}

function endGame() {
  clearInterval(gameInterval);
  finalScoreEl.innerText = 'النتيجة النهائية: ' + score;
  gameOverScreen.classList.remove('hidden');
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
