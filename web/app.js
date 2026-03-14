import { createGame, takeTurn, listLegalRanksForPlayer, getWinners } from '../src/games/go-fish/engine.js';

let state = null;

const setupEl = document.getElementById('setup');
const boardEl = document.getElementById('board');
const playerCountEl = document.getElementById('playerCount');
const startBtn = document.getElementById('startBtn');
const statusTextEl = document.getElementById('statusText');
const drawPileEl = document.getElementById('drawPile');
const playersEl = document.getElementById('players');
const targetSelectEl = document.getElementById('targetSelect');
const rankSelectEl = document.getElementById('rankSelect');
const askBtn = document.getElementById('askBtn');

function handText(player) {
  return player.hand.map((c) => c.rank).join(' ') || '(empty)';
}

function renderPlayers() {
  playersEl.innerHTML = '';
  state.players.forEach((p, idx) => {
    const div = document.createElement('article');
    div.className = `player${idx === state.currentPlayerIndex ? ' current' : ''}`;
    div.innerHTML = `
      <h3>${p.name}</h3>
      <div>Books: ${p.books.length} (${p.books.join(', ') || 'none'})</div>
      <div>Cards: ${p.hand.length}</div>
      <div class="cards">${handText(p)}</div>
    `;
    playersEl.appendChild(div);
  });
}

function renderControls() {
  const current = state.players[state.currentPlayerIndex];
  const legalRanks = listLegalRanksForPlayer(current);

  targetSelectEl.innerHTML = '';
  state.players.forEach((p, idx) => {
    if (idx === state.currentPlayerIndex) return;
    const opt = document.createElement('option');
    opt.value = String(idx);
    opt.textContent = `[${idx}] ${p.name}`;
    targetSelectEl.appendChild(opt);
  });

  rankSelectEl.innerHTML = '';
  legalRanks.forEach((rank) => {
    const opt = document.createElement('option');
    opt.value = rank;
    opt.textContent = rank;
    rankSelectEl.appendChild(opt);
  });

  askBtn.disabled = state.phase !== 'active' || legalRanks.length === 0;
}

function renderStatus() {
  if (state.phase === 'finished') {
    const winners = getWinners(state);
    statusTextEl.textContent = `Game Over — Winner${winners.length > 1 ? 's' : ''}: ${winners.map((w) => w.name).join(', ')}`;
  } else {
    const current = state.players[state.currentPlayerIndex];
    statusTextEl.textContent = `Turn ${state.turnCount}: ${current.name}${state.lastAction ? ` | ${state.lastAction}` : ''}`;
  }
  drawPileEl.textContent = `Draw pile: ${state.drawPile.length}`;
}

function render() {
  renderStatus();
  renderPlayers();
  renderControls();
}

startBtn.addEventListener('click', () => {
  const n = Math.max(2, Math.min(4, Number(playerCountEl.value) || 2));
  const names = Array.from({ length: n }, (_, i) => `Player ${i + 1}`);
  state = createGame({ playerNames: names, initialHandSize: 7 });

  setupEl.classList.add('hidden');
  boardEl.classList.remove('hidden');
  render();
});

askBtn.addEventListener('click', () => {
  if (!state || state.phase !== 'active') return;
  const target = Number(targetSelectEl.value);
  const rank = rankSelectEl.value;
  try {
    takeTurn(state, { targetPlayerIndex: target, rank });
  } catch (err) {
    state.lastAction = `Invalid move: ${err.message}`;
  }
  render();
});
