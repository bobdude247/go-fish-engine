import { createStandardDeck, shuffle } from '../../engine/cards/deck.js';
import { validPlayerCount, nextPlayerIndex, normalizeRank, isRank } from './rules.js';

const DEFAULT_INITIAL_HAND_SIZE = 7;

function makePlayer(name, id) {
  return {
    id,
    name,
    hand: [],
    books: []
  };
}

export function createPlayers(names) {
  if (!Array.isArray(names)) throw new Error('names must be an array');
  if (!validPlayerCount(names.length)) throw new Error('Go Fish currently supports 2-4 players');
  return names.map((name, index) => makePlayer(name, index));
}

export function dealInitialHands(players, deck, cardsPerPlayer = DEFAULT_INITIAL_HAND_SIZE, startPlayerIndex = 0) {
  if (!Array.isArray(players) || players.length === 0) throw new Error('players required');
  if (!Array.isArray(deck)) throw new Error('deck must be array');
  if (startPlayerIndex < 0 || startPlayerIndex >= players.length) throw new Error('invalid startPlayerIndex');

  const drawPile = [...deck];
  let turn = startPlayerIndex;

  for (let round = 0; round < cardsPerPlayer; round++) {
    for (let i = 0; i < players.length; i++) {
      const card = drawPile.shift();
      if (!card) break;
      players[turn].hand.push(card);
      turn = nextPlayerIndex(turn, players.length);
    }
  }

  return drawPile;
}

export function groupHandByRank(hand) {
  const map = new Map();
  for (const card of hand) {
    if (!map.has(card.rank)) map.set(card.rank, []);
    map.get(card.rank).push(card);
  }
  return map;
}

export function collectCompletedBooks(player) {
  const rankMap = groupHandByRank(player.hand);
  const keep = [];
  for (const [rank, cards] of rankMap.entries()) {
    if (cards.length === 4) {
      if (!player.books.includes(rank)) player.books.push(rank);
    } else {
      keep.push(...cards);
    }
  }
  player.hand = keep;
}

export function transferRankCards(fromPlayer, toPlayer, rank) {
  const taken = fromPlayer.hand.filter((c) => c.rank === rank);
  if (taken.length === 0) return 0;

  fromPlayer.hand = fromPlayer.hand.filter((c) => c.rank !== rank);
  toPlayer.hand.push(...taken);
  return taken.length;
}

export function drawTopCard(drawPile) {
  return drawPile.length > 0 ? drawPile.shift() : null;
}

export function handHasRank(player, rank) {
  return player.hand.some((c) => c.rank === rank);
}

function maybeDrawWhenEmpty(player, drawPile) {
  if (player.hand.length === 0) {
    const card = drawTopCard(drawPile);
    if (card) player.hand.push(card);
  }
}

function allBooksCollected(players) {
  const totalBooks = players.reduce((sum, p) => sum + p.books.length, 0);
  return totalBooks === 13;
}

function maybeFinishGame(state) {
  const noCardsLeft = state.drawPile.length === 0 && state.players.every((p) => p.hand.length === 0);
  if (noCardsLeft || allBooksCollected(state.players)) {
    state.phase = 'finished';
  }
}

export function createGame({ playerNames, rng = Math.random, startingPlayer = 0, initialHandSize = DEFAULT_INITIAL_HAND_SIZE }) {
  const players = createPlayers(playerNames);
  const deck = shuffle(createStandardDeck(), rng);
  const drawPile = dealInitialHands(players, deck, initialHandSize, startingPlayer);

  players.forEach(collectCompletedBooks);

  return {
    phase: 'active',
    players,
    currentPlayerIndex: startingPlayer,
    drawPile,
    turnCount: 1,
    lastAction: null,
    config: {
      initialHandSize
    }
  };
}

export function listLegalRanksForPlayer(player) {
  return [...new Set(player.hand.map((c) => c.rank))];
}

export function takeTurn(state, { targetPlayerIndex, rank }) {
  if (state.phase !== 'active') throw new Error('game already over');

  const current = state.players[state.currentPlayerIndex];
  maybeDrawWhenEmpty(current, state.drawPile);

  const askedRank = normalizeRank(rank);
  if (!isRank(askedRank)) throw new Error('invalid rank');
  if (targetPlayerIndex === state.currentPlayerIndex) throw new Error('cannot ask yourself');
  if (!handHasRank(current, askedRank)) throw new Error('must ask for a rank in your own hand');

  const target = state.players[targetPlayerIndex];
  const moved = transferRankCards(target, current, askedRank);

  if (moved > 0) {
    collectCompletedBooks(current);
    state.lastAction = `${current.name} took ${moved} ${askedRank} card(s) from ${target.name}`;
  } else {
    const drawn = drawTopCard(state.drawPile);
    if (drawn) {
      current.hand.push(drawn);
      collectCompletedBooks(current);
      if (drawn.rank === askedRank) {
        state.lastAction = `${current.name} asked ${target.name} for ${askedRank}: Go Fish! Drew ${drawn.rank} and goes again.`;
      } else {
        state.lastAction = `${current.name} asked ${target.name} for ${askedRank}: Go Fish! Drew ${drawn.rank}. Turn passes.`;
        state.currentPlayerIndex = nextPlayerIndex(state.currentPlayerIndex, state.players.length);
        state.turnCount += 1;
      }
    } else {
      state.lastAction = `${current.name} asked ${target.name} for ${askedRank}: Go Fish! Draw pile empty, turn passes.`;
      state.currentPlayerIndex = nextPlayerIndex(state.currentPlayerIndex, state.players.length);
      state.turnCount += 1;
    }
  }

  maybeFinishGame(state);
  return state;
}

export function getWinners(state) {
  const best = Math.max(...state.players.map((p) => p.books.length));
  return state.players.filter((p) => p.books.length === best);
}
