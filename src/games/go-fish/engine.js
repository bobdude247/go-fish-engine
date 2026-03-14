import { createStandardDeck, shuffle } from '../../engine/cards/deck.js';
import { validPlayerCount, nextPlayerIndex, normalizeRank, isRank } from './rules.js';

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

export function dealAllCards(players, deck, startPlayerIndex = 0) {
  if (!Array.isArray(players) || players.length === 0) throw new Error('players required');
  if (!Array.isArray(deck)) throw new Error('deck must be array');
  if (startPlayerIndex < 0 || startPlayerIndex >= players.length) throw new Error('invalid startPlayerIndex');

  let turn = startPlayerIndex;
  const drawPile = [...deck];
  while (drawPile.length > 0) {
    const card = drawPile.shift();
    players[turn].hand.push(card);
    turn = nextPlayerIndex(turn, players.length);
  }
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
      player.books.push(rank);
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

export function createGame({ playerNames, rng = Math.random, startingPlayer = 0 }) {
  const players = createPlayers(playerNames);
  const deck = shuffle(createStandardDeck(), rng);
  dealAllCards(players, deck, startingPlayer);

  players.forEach(collectCompletedBooks);

  return {
    phase: 'active',
    players,
    currentPlayerIndex: startingPlayer,
    drawPile: [],
    turnCount: 1,
    lastAction: null
  };
}

export function listLegalRanksForPlayer(player) {
  return [...new Set(player.hand.map((c) => c.rank))];
}

export function takeTurn(state, { targetPlayerIndex, rank }) {
  if (state.phase !== 'active') throw new Error('game already over');

  const current = state.players[state.currentPlayerIndex];
  const target = state.players[targetPlayerIndex];
  const askedRank = normalizeRank(rank);

  if (!isRank(askedRank)) throw new Error('invalid rank');
  if (targetPlayerIndex === state.currentPlayerIndex) throw new Error('cannot ask yourself');
  if (!handHasRank(current, askedRank)) throw new Error('must ask for a rank in your own hand');

  const moved = transferRankCards(target, current, askedRank);
  if (moved > 0) {
    collectCompletedBooks(current);
    state.lastAction = `${current.name} took ${moved} ${askedRank} card(s) from ${target.name}`;
  } else {
    state.lastAction = `${current.name} asked ${target.name} for ${askedRank}: Go Fish!`;
    // all cards are dealt for this variant; no draw pile after setup.
    state.currentPlayerIndex = nextPlayerIndex(state.currentPlayerIndex, state.players.length);
    state.turnCount += 1;
  }

  if (state.players.every((p) => p.hand.length === 0)) {
    state.phase = 'finished';
  }

  return state;
}

export function getWinners(state) {
  const best = Math.max(...state.players.map((p) => p.books.length));
  return state.players.filter((p) => p.books.length === best);
}
