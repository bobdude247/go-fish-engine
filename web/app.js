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

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

function cardColorClass(suit) {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

function renderHand(player) {
  if (player.hand.length === 0) {
    return '<div class="cards cards-empty">(empty)</div>';
  }

  const cards = player.hand
    .map((card, index) => {
      const symbol = suitSymbols[card.suit] ?? '?';
      const colorClass = cardColorClass(card.suit);
      return `
        <div class="playing-card ${colorClass}" style="--card-index:${index};" aria-label="${card.rank} of ${card.suit}">
          <span class="corner top">${card.rank}${symbol}</span>
          <span class="center">${symbol}</span>
          <span class="corner bottom">${card.rank}${symbol}</span>
        </div>
      `;
    })
    .join('');

  return `<div class="cards">${cards}</div>`;
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
      ${renderHand(p)}
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

  const pileCount = state.drawPile.length;
  const visibleBacks = Math.min(3, pileCount);
  const stack = Array.from({ length: visibleBacks }, (_, idx) => `<div class="pile-card card-back card-back-${idx + 1}" aria-hidden="true"></div>`).join('');
  drawPileEl.innerHTML = `
    <div class="draw-pile-wrap" aria-label="Draw pile has ${pileCount} cards">
      <div class="draw-pile-stack">${stack}</div>
      <div class="draw-pile-count">Draw pile: ${pileCount}</div>
    </div>
  `;
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
