import test from 'node:test';
import assert from 'node:assert/strict';
import { createStandardDeck } from '../src/engine/cards/deck.js';
import { validPlayerCount } from '../src/games/go-fish/rules.js';
import { createPlayers, dealInitialHands, createGame, takeTurn } from '../src/games/go-fish/engine.js';

test('validPlayerCount supports only 2-4', () => {
  assert.equal(validPlayerCount(1), false);
  assert.equal(validPlayerCount(2), true);
  assert.equal(validPlayerCount(3), true);
  assert.equal(validPlayerCount(4), true);
  assert.equal(validPlayerCount(5), false);
});

test('dealInitialHands deals 7 each and leaves draw pile', () => {
  const players = createPlayers(['A', 'B', 'C']);
  const drawPile = dealInitialHands(players, createStandardDeck(), 7, 0);

  assert.deepEqual(players.map((p) => p.hand.length), [7, 7, 7]);
  assert.equal(drawPile.length, 31);
});

test('createGame uses 7-card deal for 2-4 players', () => {
  const g2 = createGame({ playerNames: ['A', 'B'] });
  assert.deepEqual(g2.players.map((p) => p.hand.length), [7, 7]);
  assert.equal(g2.drawPile.length, 38);

  const g4 = createGame({ playerNames: ['A', 'B', 'C', 'D'] });
  assert.deepEqual(g4.players.map((p) => p.hand.length), [7, 7, 7, 7]);
  assert.equal(g4.drawPile.length, 24);
});

test('Go Fish miss draws from pile and can pass turn', () => {
  const state = {
    phase: 'active',
    players: [
      { id: 0, name: 'P1', hand: [{ suit: 'hearts', rank: 'A' }], books: [] },
      { id: 1, name: 'P2', hand: [{ suit: 'clubs', rank: 'K' }], books: [] }
    ],
    currentPlayerIndex: 0,
    drawPile: [{ suit: 'spades', rank: '2' }],
    turnCount: 1,
    lastAction: null,
    config: { initialHandSize: 7 }
  };

  takeTurn(state, { targetPlayerIndex: 1, rank: 'A' });
  assert.equal(state.drawPile.length, 0);
  assert.equal(state.currentPlayerIndex, 1);
  assert.equal(state.turnCount, 2);
});
