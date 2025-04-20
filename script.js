const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const box = 20;
let snake = [{ x: 200, y: 200 }];
let food = spawnFood();
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let direction = 'RIGHT';
let gameLoop;
let isPaused = false;
let skin = 'classic';

document.getElementById('score').innerText = score;
document.getElementById('highScore').innerText = highScore;

const music = document.getElementById('bgMusic');
let musicPlaying = false;

// Movement Control
document.addEventListener('keydown', changeDirection);
document.getElementById('up').onclick = () => setDirection('UP');
document.getElementById('down').onclick = () => setDirection('DOWN');
document.getElementById('left').onclick = () => setDirection('LEFT');
document.getElementById('right').onclick = () => setDirection('RIGHT');
document.getElementById('pause').onclick = togglePause;

// Theme
document.getElementById('toggle-theme').onclick = () => {
  document.body.classList.toggle('dark');
};

// Music Toggle
document.getElementById('musicToggle').onclick = () => {
  if (musicPlaying) {
    music.pause();
  } else {
    music.play();
  }
  musicPlaying = !musicPlaying;
};

// Skin Selector
document.getElementById('skin').onchange = (e) => {
  skin = e.target.value;
};

// Leaderboard
const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');

function updateLeaderboard() {
  leaderboard.push(score);
  leaderboard.sort((a, b) => b - a);
  if (leaderboard.length > 5) leaderboard.length = 5;
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  showLeaderboard();
}

function showLeaderboard() {
  const list = document.getElementById('leaderboardList');
  list.innerHTML = '';
  leaderboard.forEach((s, i) => {
    const li = document.createElement('li');
    li.textContent = `#${i + 1} - ${s}`;
    list.appendChild(li);
  });
  document.getElementById('leaderboardModal').style.display = 'block';
}

function spawnFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box
  };
}

function setDirection(dir) {
  if (
    (dir === 'UP' && direction !== 'DOWN') ||
    (dir === 'DOWN' && direction !== 'UP') ||
    (dir === 'LEFT' && direction !== 'RIGHT') ||
    (dir === 'RIGHT' && direction !== 'LEFT')
  ) {
    direction = dir;
  }
}

function changeDirection(e) {
  const key = e.keyCode;
  if (key === 37) setDirection('LEFT');
  if (key === 38) setDirection('UP');
  if (key === 39) setDirection('RIGHT');
  if (key === 40) setDirection('DOWN');
  if (key === 80) togglePause(); // 'P' for pause
}

function togglePause() {
  isPaused = !isPaused;
}

function drawSkin(cell) {
  switch (skin) {
    case 'rainbow':
      ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
      break;
    case 'pixel':
      ctx.fillStyle = '#fff';
      break;
    default:
      ctx.fillStyle = '#0f0';
  }
  ctx.fillRect(cell.x, cell.y, box, box);
}

function draw() {
  if (isPaused) return;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let cell of snake) {
    drawSkin(cell);
  }

  // Draw food
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x, food.y, box, box);

  // Snake movement
  let head = { ...snake[0] };
  if (direction === 'LEFT') head.x -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'DOWN') head.y += box;

  // Collision
  if (
    head.x < 0 || head.y < 0 ||
    head.x >= canvas.width || head.y >= canvas.height ||
    snake.some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    clearInterval(gameLoop);
    updateLeaderboard();
    alert(`Game Over! Score: ${score}`);
    location.reload();
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById('score').innerText = score;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('highScore', highScore);
      document.getElementById('highScore').innerText = highScore;
    }
    food = spawnFood();
  } else {
    snake.pop();
  }
}

gameLoop = setInterval(draw, 100);
