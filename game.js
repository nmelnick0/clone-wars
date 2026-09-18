window.CLONE_WARS_GAME = true;

const DEFAULTS = {
  title: 'Flap Clone',
  fix: 'none',
  canvasWidth: 360,
  canvasHeight: 640,
  gravity: 1400,
  flapStrength: 420,
  birdSize: 34,
  pipeWidth: 64,
  pipeGap: 150,
  pipeSpacing: 260,
  pipeSpeed: 150,
  groundHeight: 80,
  modes: {
    easy: { pipeGap: 190, pipeSpeed: 110 },
    normal: { pipeGap: 150, pipeSpeed: 150 }
  }
};
const CONFIG = Object.assign({}, DEFAULTS, window.GAME_CONFIG || {});

const ART_NAMES = ['drawBackground', 'drawGround', 'drawBird', 'drawPipe'];
const SOUND_NAMES = ['flap', 'score', 'crash'];
const missing = [];
if (!window.GAME_CONFIG) missing.push('settings');
else for (const key of Object.keys(DEFAULTS)) { if (!(key in window.GAME_CONFIG)) missing.push(key); }
if (!window.SPRITES) missing.push('art');
else for (const name of ART_NAMES) { if (typeof window.SPRITES[name] !== 'function') missing.push(name); }
if (!window.SOUNDS) missing.push('sound');
else for (const name of SOUND_NAMES) { if (typeof window.SOUNDS[name] !== 'function') missing.push(name); }
document.getElementById('missing-label').textContent = missing.length ? 'placeholder: ' + missing.join(', ') + ' missing' : '';

function placeholderBackground(ctx, width, height, time) {
  ctx.fillStyle = '#082f49';
  ctx.fillRect(0, 0, width, height);
}
function placeholderGround(ctx, width, height, groundHeight, offset) {
  ctx.fillStyle = '#031923';
  ctx.fillRect(0, height - groundHeight, width, groundHeight);
}
function placeholderBird(ctx, x, y, size, velocity) {
  ctx.fillStyle = '#f4c542';
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
}
function placeholderPipe(ctx, x, gapTop, gapBottom, pipeWidth, height) {
  ctx.fillStyle = '#9ad5e5';
  ctx.fillRect(x, 0, pipeWidth, gapTop);
  ctx.fillRect(x, gapBottom, pipeWidth, height - gapBottom);
}

const drawBackground = (window.SPRITES && typeof window.SPRITES.drawBackground === 'function') ? window.SPRITES.drawBackground : placeholderBackground;
const drawGround = (window.SPRITES && typeof window.SPRITES.drawGround === 'function') ? window.SPRITES.drawGround : placeholderGround;
const drawBird = (window.SPRITES && typeof window.SPRITES.drawBird === 'function') ? window.SPRITES.drawBird : placeholderBird;
const drawPipe = (window.SPRITES && typeof window.SPRITES.drawPipe === 'function') ? window.SPRITES.drawPipe : placeholderPipe;

let muted = false;
function play(name) {
  if (muted) return;
  const sound = window.SOUNDS && window.SOUNDS[name];
  if (typeof sound === 'function') { try { sound(); } catch (error) {} }
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CONFIG.canvasWidth;
canvas.height = CONFIG.canvasHeight;
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');
const fixButtons = document.getElementById('fix-buttons');
const sr = document.getElementById('sr');

let state = 'ready';
let y = CONFIG.canvasHeight / 2;
let velocity = 0;
let pipes = [];
let pipesMade = 0;
let deepFish = [];
let fishMade = 0;
let groundOffset = 0;
let lastGapTop = (CONFIG.canvasHeight - CONFIG.groundHeight - CONFIG.pipeGap) / 2;
let score = 0;
let checkpoint = 0;
let secondsSinceCrash = 0;
let currentMode = 'normal';
let bestScore = 0;
try { bestScore = parseInt(localStorage.getItem('cloneWarsBest'), 10) || 0; } catch (error) {}

function soundLine() {
  return muted ? 'Press M to turn sound on.' : 'Press M to turn sound off.';
}
function showReady() {
  overlayTitle.textContent = CONFIG.title;
  overlayText.textContent = ['Press Space, click or tap to start.', soundLine()].join('\n');
  overlay.hidden = false;
}
function showGameOver() {
  overlayTitle.textContent = 'Game over';
  const lines = ['Score ' + score + '   ·   Best ' + bestScore, 'Press Space, click or tap to play again.', soundLine()];
  if (checkpoint > 0) lines.push('Next game starts at checkpoint ' + checkpoint + '.');
  overlayText.textContent = lines.join('\n');
  overlay.hidden = false;
}
function startGame() {
  state = 'playing';
  y = (CONFIG.canvasHeight - CONFIG.groundHeight) / 2;
  velocity = -CONFIG.flapStrength;
  pipes = [];
  pipesMade = 0;
  deepFish = [];
  fishMade = 0;
  groundOffset = 0;
  lastGapTop = (CONFIG.canvasHeight - CONFIG.groundHeight - CONFIG.pipeGap) / 2;
  score = checkpoint;
  secondsSinceCrash = 0;
  overlay.hidden = true;
  play('flap');
}
function press() {
  if (state === 'ready') startGame();
  else if (state === 'playing') { velocity = -CONFIG.flapStrength; play('flap'); }
  else if (state === 'gameover' && secondsSinceCrash >= 0.4) startGame();
}

window.addEventListener('keydown', (event) => {
  if (event.target && event.target.closest && event.target.closest('button')) return;
  if (event.code === 'Space' || event.code === 'Enter') {
    event.preventDefault();
    press();
  } else if (event.code === 'KeyM') {
    muted = !muted;
    if (state === 'ready') showReady();
    if (state === 'gameover') showGameOver();
  }
});
window.addEventListener('pointerdown', (event) => {
  if (event.target && event.target.closest && event.target.closest('button')) return;
  press();
});

function addPipe(pipeGap) {
  const gap = pipeGap + (CONFIG.fix === 'gentle-start' && pipesMade < 3 ? 70 : 0);
  const lowest = CONFIG.canvasHeight - CONFIG.groundHeight - 60 - gap;
  const gapTop = Math.max(60, Math.min(lowest, lastGapTop + (Math.random() * 360 - 180)));
  const gapBottom = gapTop + gap;
  lastGapTop = gapTop;
  pipes.push({ x: CONFIG.canvasWidth, gapTop: gapTop, gapBottom: gapBottom, scored: false });
  pipesMade += 1;
}
function addDeepFish() {
  const skyBottom = CONFIG.canvasHeight - CONFIG.groundHeight;
  const fishHeight = 42 + (fishMade % 3) * 8;
  const margin = fishHeight / 2 + 18;
  const fishY = margin + Math.random() * (skyBottom - margin * 2);
  deepFish.push({
    x: CONFIG.canvasWidth + 24,
    y: fishY,
    width: 92 + (fishMade % 2) * 18,
    height: fishHeight,
    scored: false
  });
  fishMade += 1;
}
function drawDeepFish(fish) {
  const direction = -1;
  ctx.save();
  ctx.translate(fish.x, fish.y);
  ctx.scale(direction, 1);
  ctx.fillStyle = '#b91c1c';
  ctx.strokeStyle = '#120b18';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(8, 0, fish.width * 0.38, fish.height * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-fish.width * 0.26, 0);
  ctx.lineTo(-fish.width * 0.52, -fish.height * 0.48);
  ctx.lineTo(-fish.width * 0.47, 0);
  ctx.lineTo(-fish.width * 0.52, fish.height * 0.48);
  ctx.closePath();
  ctx.fillStyle = '#7f1d1d';
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.arc(fish.width * 0.22, -fish.height * 0.18, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.arc(fish.width * 0.25, -fish.height * 0.18, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(fish.width * 0.36, fish.height * 0.1);
  ctx.lineTo(fish.width * 0.22, fish.height * 0.29);
  ctx.lineTo(fish.width * 0.08, fish.height * 0.1);
  ctx.closePath();
  ctx.fillStyle = '#fef3c7';
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
function crash() {
  state = 'gameover';
  secondsSinceCrash = 0;
  play('crash');
  if (score > bestScore) bestScore = score;
  try { localStorage.setItem('cloneWarsBest', String(bestScore)); } catch (error) {}
  checkpoint = CONFIG.fix === 'checkpoints' ? Math.floor(score / 10) * 10 : 0;
  sr.textContent = 'Game over. Score ' + score + '. Best ' + bestScore + '.';
  showGameOver();
}

function frame(now) {
  const previous = frame.lastTime || now;
  const seconds = Math.min(0.05, Math.max(0, (now - previous) / 1000));
  frame.lastTime = now;
  const birdX = CONFIG.canvasWidth / 4;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (state === 'playing') {
    velocity += CONFIG.gravity * seconds;
    y += velocity * seconds;
    const mode = CONFIG.fix === 'easy-mode' ? CONFIG.modes[currentMode] : CONFIG;
    const pipeGap = mode.pipeGap;
    const pipeSpeed = mode.pipeSpeed * (CONFIG.fix === 'gentle-start' && score < 3 ? 0.75 : 1);
    groundOffset += pipeSpeed * seconds;
    if (pipes.length === 0) addPipe(pipeGap);
    else if (pipes[pipes.length - 1].x <= CONFIG.canvasWidth - CONFIG.pipeSpacing) addPipe(pipeGap);
    if (CONFIG.fix === 'custom' && (deepFish.length === 0 || deepFish[deepFish.length - 1].x <= CONFIG.canvasWidth - 180)) addDeepFish();
    for (const pipe of pipes) {
      pipe.x -= pipeSpeed * seconds;
      if (!pipe.scored && pipe.x + CONFIG.pipeWidth < birdX) { pipe.scored = true; score += 1; play('score'); }
    }
    pipes = pipes.filter((pipe) => pipe.x + CONFIG.pipeWidth > 0);
    if (CONFIG.fix === 'custom') {
      for (const fish of deepFish) fish.x -= (pipeSpeed * 1.15) * seconds;
      deepFish = deepFish.filter((fish) => fish.x + fish.width / 2 > 0);
    }
    const birdLeft = birdX - CONFIG.birdSize / 2;
    const birdRight = birdX + CONFIG.birdSize / 2;
    const birdTop = y - CONFIG.birdSize / 2;
    const birdBottom = y + CONFIG.birdSize / 2;
    const hitPipe = pipes.some((pipe) => birdRight > pipe.x && birdLeft < pipe.x + CONFIG.pipeWidth && (birdTop < pipe.gapTop || birdBottom > pipe.gapBottom));
    const hitDeepFish = CONFIG.fix === 'custom' && deepFish.some((fish) => {
      const fishLeft = fish.x - fish.width / 2;
      const fishRight = fish.x + fish.width / 2;
      const fishTop = fish.y - fish.height / 2;
      const fishBottom = fish.y + fish.height / 2;
      return birdRight > fishLeft && birdLeft < fishRight && birdBottom > fishTop && birdTop < fishBottom;
    });
    if (birdBottom >= CONFIG.canvasHeight - CONFIG.groundHeight || birdTop <= 0 || hitPipe || hitDeepFish) crash();
  } else if (state === 'gameover') {
    secondsSinceCrash += seconds;
  }

  drawBackground(ctx, CONFIG.canvasWidth, CONFIG.canvasHeight, reduceMotion ? 0 : now / 1000);
  for (const pipe of pipes) drawPipe(ctx, pipe.x, pipe.gapTop, pipe.gapBottom, CONFIG.pipeWidth, CONFIG.canvasHeight - CONFIG.groundHeight);
  if (CONFIG.fix === 'custom') for (const fish of deepFish) drawDeepFish(fish);
  drawGround(ctx, CONFIG.canvasWidth, CONFIG.canvasHeight, CONFIG.groundHeight, groundOffset);
  drawBird(ctx, birdX, y, CONFIG.birdSize, velocity);
  if (state === 'playing') {
    ctx.save();
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#06212f';
    ctx.fillStyle = '#ffffff';
    ctx.strokeText(String(score), CONFIG.canvasWidth / 2, 54);
    ctx.fillText(String(score), CONFIG.canvasWidth / 2, 54);
    ctx.restore();
  }
  requestAnimationFrame(frame);
}

if (CONFIG.fix === 'easy-mode') {
  for (const mode of ['easy', 'normal']) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = mode === 'easy' ? 'Easy' : 'Normal';
    button.setAttribute('aria-pressed', String(mode === currentMode));
    button.addEventListener('click', (event) => {
      currentMode = mode;
      for (const other of fixButtons.querySelectorAll('button')) {
        other.setAttribute('aria-pressed', String(other === event.currentTarget));
      }
      event.currentTarget.blur();
    });
    fixButtons.appendChild(button);
  }
}

showReady();
requestAnimationFrame(frame);
