// MEMORY MATCH ELEMENTS
const gridEl = document.getElementById('game-grid');
const restartBtn = document.getElementById('restart-btn');
const flipCountEl = document.getElementById('flip-count');
const matchCountEl = document.getElementById('match-count');
const confettiContainer = document.getElementById('confetti-container');
const successAudio = document.getElementById('success-sound');
const winOverlay = document.getElementById('win-overlay');
const playAgainBtn = document.getElementById('play-again-btn');
const winTitleEl = document.getElementById('win-title');
const winMessageEl = document.getElementById('win-message');

// LAYOUT / NAV
const dashboardEl = document.getElementById('dashboard');
const memoryView = document.getElementById('memory-view');
const reactionView = document.getElementById('reaction-view');
const moleView = document.getElementById('mole-view');
const numbersView = document.getElementById('numbers-view');
const backHomeBtn = document.getElementById('back-home-btn');
const dashButtons = document.querySelectorAll('.dash-play-btn');

// REACTION TAP ELEMENTS
const reactionCircle = document.getElementById('reaction-circle');
const reactionStatus = document.getElementById('reaction-status');
const reactionStartBtn = document.getElementById('reaction-start-btn');
const reactionLastEl = document.getElementById('reaction-last');
const reactionBestEl = document.getElementById('reaction-best');

// MOLE ELEMENTS
const moleGrid = document.getElementById('mole-grid');
const moleCells = moleGrid ? Array.from(moleGrid.querySelectorAll('.mole-cell')) : [];
const moleScoreEl = document.getElementById('mole-score');
const moleTimeEl = document.getElementById('mole-time');

// NUMBER RUSH ELEMENTS
const numbersGrid = document.getElementById('numbers-grid');
const numbersTargetEl = document.getElementById('numbers-target');
const numbersTimeEl = document.getElementById('numbers-time');

const animals = [
  { name: 'Cat', emoji: '🐱' },
  { name: 'Dog', emoji: '🐶' },
  { name: 'Panda', emoji: '🐼' },
  { name: 'Fox', emoji: '🦊' },
  { name: 'Koala', emoji: '🐨' },
  { name: 'Tiger', emoji: '🐯' },
  { name: 'Bunny', emoji: '🐰' },
  { name: 'Owl', emoji: '🦉' }
];

let currentGame = 'dashboard';

// MEMORY STATE
let deck = [];
let flipped = [];
let matchedPairs = 0;
let flipCount = 0;
let lockBoard = false;

// REACTION STATE
let reactionWaiting = false;
let reactionReady = false;
let reactionTimeoutId = null;
let reactionStartTime = 0;
let reactionBest = null;

// MOLE STATE
let moleScore = 0;
let moleTimeLeft = 30;
let moleIntervalId = null;
let moleTimerId = null;
let activeMoleIndex = -1;

// NUMBERS STATE
let numbersOrder = [];
let numbersNext = 1;
let numbersStartTime = 0;
let numbersTimerId = null;

restartBtn.addEventListener('click', () => {
  if (currentGame === 'memory') initMemoryGame();
  else if (currentGame === 'reaction') resetReactionGame();
  else if (currentGame === 'mole') resetMoleGame();
  else if (currentGame === 'numbers') resetNumbersGame();
});

if (playAgainBtn) {
  playAgainBtn.addEventListener('click', () => {
    hideWinOverlay();
    if (currentGame === 'memory') initMemoryGame();
    else if (currentGame === 'reaction') resetReactionGame();
    else if (currentGame === 'mole') resetMoleGame();
    else if (currentGame === 'numbers') resetNumbersGame();
  });
}

if (backHomeBtn) {
  backHomeBtn.addEventListener('click', () => {
    showDashboard();
  });
}

dashButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const game = btn.dataset.game;
    if (game) {
      showGame(game);
    }
  });
});

// MEMORY GAME
function initMemoryGame() {
  deck = shuffle([...animals, ...animals]);
  gridEl.innerHTML = '';
  flipped = [];
  matchedPairs = 0;
  flipCount = 0;
  lockBoard = false;
  flipCountEl.textContent = '0';
  matchCountEl.textContent = `0 / ${animals.length}`;
  successAudio.src = createBeepDataUrl();
  successAudio.load();
  buildGrid();
  hideWinOverlay();
}

function buildGrid() {
  deck.forEach((animal, index) => {
    const card = document.createElement('button');
    card.className = 'card';
    card.setAttribute('aria-label', `${animal.name} card`);
    card.dataset.animal = animal.name;
    card.dataset.index = index;

    const inner = document.createElement('div');
    inner.className = 'card-inner';

    const front = document.createElement('div');
    front.className = 'card-face card-front';
    const img = document.createElement('img');
    img.alt = animal.name;
    img.src = buildAnimalImage(animal.name, animal.emoji);
    front.appendChild(img);

    const back = document.createElement('div');
    back.className = 'card-face card-back';
    back.textContent = 'Flip me';

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    card.addEventListener('click', () => handleFlip(card));
    gridEl.appendChild(card);
  });
}

function handleFlip(card) {
  if (lockBoard) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) {
    return;
  }
  card.classList.add('flipped');
  flipped.push(card);
  flipCount += 1;
  flipCountEl.textContent = flipCount.toString();

  if (flipped.length === 2) {
    checkMatch();
  }
}

function checkMatch() {
  const [first, second] = flipped;
  const isMatch = first.dataset.animal === second.dataset.animal;

  if (isMatch) {
    first.classList.add('matched');
    second.classList.add('matched');
    flipped = [];
    matchedPairs += 1;
    matchCountEl.textContent = `${matchedPairs} / ${animals.length}`;
    successAudio.currentTime = 0;
    successAudio.play().catch(() => {});
    if (matchedPairs === animals.length) {
      triggerWin();
    }
  } else {
    lockBoard = true;
    setTimeout(() => {
      first.classList.remove('flipped');
      second.classList.remove('flipped');
      flipped = [];
      lockBoard = false;
    }, 1000);
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function buildAnimalImage(name, emoji) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
    <defs>
      <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
        <stop stop-color='%23ff7ab6' offset='0'/>
        <stop stop-color='%236be5ff' offset='1'/>
      </linearGradient>
    </defs>
    <rect width='200' height='200' rx='24' fill='url(%23g)'/>
    <text x='50%' y='48%' dominant-baseline='middle' text-anchor='middle' font-size='86'>${emoji}</text>
    <text x='50%' y='78%' dominant-baseline='middle' text-anchor='middle' font-family='Verdana' font-size='28' fill='%23ffffff'>${name}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createBeepDataUrl() {
  const duration = 0.2;
  const sampleRate = 44100;
  const samples = Math.floor(duration * sampleRate);
  const freq = 880;
  const amplitude = 0.3;
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // audio format PCM
  view.setUint16(22, 1, true); // channels
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, samples * 2, true);

  let offset = 44;
  for (let i = 0; i < samples; i += 1) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * freq * t) * amplitude;
    view.setInt16(offset, sample * 0x7fff, true);
    offset += 2;
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return `data:audio/wav;base64,${btoa(binary)}`;
}

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i += 1) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function triggerWin() {
  launchConfetti();
  let title = 'Yeay! Kamu Menang 🎉';
  let message = 'Permainan selesai dengan hasil yang keren!';
  if (currentGame === 'reaction') {
    title = 'Refleks Kamu Keren! ⚡';
    message = `Waktu terbaik: ${reactionBestEl.textContent}. Coba kalahkan lagi!`;
  } else if (currentGame === 'mole') {
    title = 'Waktunya Hitung Skor 🐹';
    message = `Skormu: ${moleScore}. Coba lagi untuk skor lebih tinggi!`;
  } else if (currentGame === 'numbers') {
    title = 'Number Rush Selesai 🔢';
    message = `Waktu: ${numbersTimeEl.textContent}. Bisa lebih cepat lagi?`;
  }
  if (winTitleEl) winTitleEl.textContent = title;
  if (winMessageEl) winMessageEl.textContent = message;
  showWinOverlay();
}

function launchConfetti() {
  const pieces = 80;
  for (let i = 0; i < pieces; i += 1) {
    const confetti = document.createElement('span');
    confetti.className = 'confetti';
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.backgroundColor = randomColor();
    confetti.style.animationDelay = `${Math.random() * 0.2}s`;
    confetti.style.transform = `rotateZ(${Math.random() * 360}deg)`;
    confettiContainer.appendChild(confetti);
  }

  setTimeout(() => {
    confettiContainer.innerHTML = '';
  }, 2400);
}

function showWinOverlay() {
  if (!winOverlay) return;
  winOverlay.classList.add('visible');
  winOverlay.setAttribute('aria-hidden', 'false');
}

function hideWinOverlay() {
  if (!winOverlay) return;
  winOverlay.classList.remove('visible');
  winOverlay.setAttribute('aria-hidden', 'true');
}

function randomColor() {
  const colors = ['#ff7ab6', '#6be5ff', '#ffd166', '#95e06c', '#a28cff'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// VIEW MANAGEMENT
function showDashboard() {
  currentGame = 'dashboard';
  dashboardEl.classList.remove('hidden');
  memoryView.classList.add('hidden');
  reactionView.classList.add('hidden');
  moleView.classList.add('hidden');
  numbersView.classList.add('hidden');
  hideWinOverlay();
  clearReactionTimers();
  stopMoleGame();
  stopNumbersTimer();
}

function showGame(game) {
  currentGame = game;
  dashboardEl.classList.add('hidden');
  memoryView.classList.add('hidden');
  reactionView.classList.add('hidden');
  moleView.classList.add('hidden');
  numbersView.classList.add('hidden');

  if (game === 'memory') {
    memoryView.classList.remove('hidden');
    initMemoryGame();
  } else if (game === 'reaction') {
    reactionView.classList.remove('hidden');
    resetReactionGame();
  } else if (game === 'mole') {
    moleView.classList.remove('hidden');
    resetMoleGame();
  } else if (game === 'numbers') {
    numbersView.classList.remove('hidden');
    resetNumbersGame();
  }
}

// REACTION GAME LOGIC
function resetReactionGame() {
  clearReactionTimers();
  reactionWaiting = false;
  reactionReady = false;
  reactionCircle.classList.remove('ready');
  reactionCircle.classList.add('waiting');
  reactionStatus.textContent = 'Tekan "Mulai", lalu tunggu lingkaran jadi hijau.';
}

function clearReactionTimers() {
  if (reactionTimeoutId) clearTimeout(reactionTimeoutId);
  reactionTimeoutId = null;
}

if (reactionStartBtn) {
  reactionStartBtn.addEventListener('click', () => {
    clearReactionTimers();
    reactionWaiting = true;
    reactionReady = false;
    reactionCircle.classList.remove('ready');
    reactionCircle.classList.add('waiting');
    reactionStatus.textContent = 'Tunggu sampai hijau...';
    const delay = 800 + Math.random() * 2200;
    reactionTimeoutId = setTimeout(() => {
      if (!reactionWaiting) return;
      reactionReady = true;
      reactionCircle.classList.remove('waiting');
      reactionCircle.classList.add('ready');
      reactionStatus.textContent = 'Tap sekarang!';
      reactionStartTime = performance.now();
    }, delay);
  });
}

if (reactionCircle) {
  reactionCircle.addEventListener('click', () => {
    if (currentGame !== 'reaction') return;
    if (!reactionWaiting) return;
    if (!reactionReady) {
      // false start
      reactionStatus.textContent = 'Terlalu cepat! Tekan "Mulai" lagi.';
      clearReactionTimers();
      reactionWaiting = false;
      reactionReady = false;
      reactionCircle.classList.remove('ready');
      reactionCircle.classList.add('waiting');
      return;
    }
    const diff = (performance.now() - reactionStartTime) / 1000;
    const formatted = `${diff.toFixed(3)}s`;
    reactionLastEl.textContent = formatted;
    if (reactionBest === null || diff < reactionBest) {
      reactionBest = diff;
      reactionBestEl.textContent = formatted;
    }
    reactionStatus.textContent = 'Nice! Tekan "Mulai" untuk mencoba lagi.';
    reactionWaiting = false;
    reactionReady = false;
    reactionCircle.classList.remove('ready');
    reactionCircle.classList.add('waiting');
    // kecilkan sedikit confetti + suara
    successAudio.currentTime = 0;
    successAudio.play().catch(() => {});
    launchConfetti();
  });
}

// MOLE GAME LOGIC
function resetMoleGame() {
  stopMoleGame();
  moleScore = 0;
  moleTimeLeft = 30;
  moleScoreEl.textContent = '0';
  moleTimeEl.textContent = '30s';
  moleCells.forEach((cell) => cell.classList.remove('mole-active'));
  startMoleGame();
}

function startMoleGame() {
  moleIntervalId = setInterval(() => {
    const nextIndex = Math.floor(Math.random() * moleCells.length);
    if (activeMoleIndex !== -1) {
      moleCells[activeMoleIndex].classList.remove('mole-active');
    }
    activeMoleIndex = nextIndex;
    moleCells[activeMoleIndex].classList.add('mole-active');
  }, 700);

  moleTimerId = setInterval(() => {
    moleTimeLeft -= 1;
    moleTimeEl.textContent = `${moleTimeLeft}s`;
    if (moleTimeLeft <= 0) {
      stopMoleGame();
      triggerWin();
    }
  }, 1000);
}

function stopMoleGame() {
  if (moleIntervalId) clearInterval(moleIntervalId);
  if (moleTimerId) clearInterval(moleTimerId);
  moleIntervalId = null;
  moleTimerId = null;
  activeMoleIndex = -1;
  moleCells.forEach((cell) => cell.classList.remove('mole-active'));
}

moleCells.forEach((cell, index) => {
  cell.addEventListener('click', () => {
    if (currentGame !== 'mole') return;
    if (index === activeMoleIndex && moleTimeLeft > 0) {
      moleScore += 1;
      moleScoreEl.textContent = String(moleScore);
      cell.classList.remove('mole-active');
      activeMoleIndex = -1;
      successAudio.currentTime = 0;
      successAudio.play().catch(() => {});
    }
  });
});

// NUMBER RUSH LOGIC
function resetNumbersGame() {
  stopNumbersTimer();
  numbersGrid.innerHTML = '';
  numbersOrder = shuffle(Array.from({ length: 16 }, (_, i) => i + 1));
  numbersNext = 1;
  numbersTargetEl.textContent = '1';
  numbersTimeEl.textContent = '0.00s';
  numbersStartTime = 0;

  numbersOrder.forEach((num) => {
    const btn = document.createElement('button');
    btn.className = 'num-cell';
    const span = document.createElement('span');
    span.textContent = String(num);
    btn.appendChild(span);
    btn.addEventListener('click', () => handleNumberClick(btn, num));
    numbersGrid.appendChild(btn);
  });
}

function handleNumberClick(btn, num) {
  if (currentGame !== 'numbers') return;
  if (num !== numbersNext) return;
  if (numbersNext === 1) {
    numbersStartTime = performance.now();
    startNumbersTimer();
  }
  btn.classList.add('correct');
  btn.classList.add('disabled');
  numbersNext += 1;
  if (numbersNext <= 16) {
    numbersTargetEl.textContent = String(numbersNext);
  } else {
    numbersTargetEl.textContent = '-';
    stopNumbersTimer();
    successAudio.currentTime = 0;
    successAudio.play().catch(() => {});
    triggerWin();
  }
}

function startNumbersTimer() {
  stopNumbersTimer();
  numbersTimerId = setInterval(() => {
    const diff = (performance.now() - numbersStartTime) / 1000;
    numbersTimeEl.textContent = `${diff.toFixed(2)}s`;
  }, 60);
}

function stopNumbersTimer() {
  if (numbersTimerId) clearInterval(numbersTimerId);
  numbersTimerId = null;
}

document.addEventListener('DOMContentLoaded', () => {
  showDashboard();
});

