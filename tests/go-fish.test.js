import test from 'node:test';
import assert from 'node:assert/strict';
import { createStandardDeck } from '../src/engine/cards/deck.js';
import { validPlayerCount } from '../src/games/go-fish/rules.js';
import { createPlayers, dealAllCards } from '../src/games/go-fish/engine.js';

test('validPlayerCount supports only 2-4', () => {
  assert.equal(validPlayerCount(1), false);
  assert.equal(validPlayerCount(2), true);
  assert.equal(validPlayerCount(3), true);
  assert.equal(validPlayerCount(4), true);
  assert.equal(validPlayerCount(5), false);
});

test('dealAllCards distributes all 52 cards and keeps counts near-even', () => {
  const players = createPlayers(['A', 'B', 'C']);
  dealAllCards(players, createStandardDeck(), 0);

  const counts = players.map((p) => p.hand.length);
  const total = counts.reduce((a, b) => a + b, 0);
  const max = Math.max(...counts);
  const min = Math.min(...counts);

  assert.equal(total, 52);
  assert.ok(max - min <= 1);
});

test('deal order gives extra card(s) to earliest players from start index', () => {
  const players = createPlayers(['A', 'B', 'C', 'D']);
  dealAllCards(players, createStandardDeck(), 2);

  // 52 / 4 is even, all should be 13 in this case.
  assert.deepEqual(players.map((p) => p.hand.length), [13, 13, 13, 13]);

  const playersThree = createPlayers(['A', 'B', 'C']);
  dealAllCards(playersThree, createStandardDeck(), 1);
  // For 3 players: 18,17,17 with player index 1 receiving first extra card.
  assert.deepEqual(playersThree.map((p) => p.hand.length), [17, 18, 17]);
});
