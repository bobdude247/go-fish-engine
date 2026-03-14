import { createCard } from './card.js';

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

export function createStandardDeck() {
  const cards = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) cards.push(createCard(suit, rank));
  }
  return cards;
}

export function shuffle(cards, rng = Math.random) {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
