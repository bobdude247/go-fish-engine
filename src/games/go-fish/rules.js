export function validPlayerCount(n) {
  return Number.isInteger(n) && n >= 2 && n <= 4;
}

export function nextPlayerIndex(current, totalPlayers) {
  return (current + 1) % totalPlayers;
}

export function normalizeRank(input) {
  const raw = String(input).trim().toUpperCase();
  if (raw === '1') return 'A';
  if (raw === '11') return 'J';
  if (raw === '12') return 'Q';
  if (raw === '13') return 'K';
  return raw;
}

export function isRank(value) {
  return ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].includes(value);
}
