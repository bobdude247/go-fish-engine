import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { createGame, listLegalRanksForPlayer, takeTurn, getWinners } from './engine.js';

function handSummary(player) {
  const ranks = player.hand.map((c) => c.rank).sort((a, b) => String(a).localeCompare(String(b)));
  return ranks.join(' ');
}

async function askInt(rl, prompt, min, max) {
  while (true) {
    const answer = (await rl.question(prompt)).trim();
    const n = Number(answer);
    if (Number.isInteger(n) && n >= min && n <= max) return n;
    console.log(`Please enter a number from ${min} to ${max}.`);
  }
}

async function askName(rl, index) {
  const answer = (await rl.question(`Player ${index + 1} name: `)).trim();
  return answer || `Player ${index + 1}`;
}

async function main() {
  const rl = readline.createInterface({ input, output });
  try {
    console.log('Go Fish (local CLI, 2-4 players, all cards dealt)');
    const playerCount = await askInt(rl, 'How many players (2-4)? ', 2, 4);
    const names = [];
    for (let i = 0; i < playerCount; i++) {
      names.push(await askName(rl, i));
    }

    const state = createGame({ playerNames: names });

    while (state.phase === 'active') {
      const player = state.players[state.currentPlayerIndex];
      console.log('\n----------------------------------------');
      console.log(`Turn ${state.turnCount}: ${player.name}`);
      console.log(`${player.name} hand: ${handSummary(player)}`);
      console.log(`${player.name} books: ${player.books.join(', ') || '(none)'}`);

      const legalRanks = listLegalRanksForPlayer(player);
      if (legalRanks.length === 0) {
        state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
        state.turnCount += 1;
        continue;
      }

      console.log('Opponents:');
      state.players.forEach((p, idx) => {
        if (idx !== state.currentPlayerIndex) {
          console.log(`  [${idx}] ${p.name} (cards: ${p.hand.length}, books: ${p.books.length})`);
        }
      });

      let target = await askInt(rl, 'Choose target player index: ', 0, state.players.length - 1);
      while (target === state.currentPlayerIndex) {
        target = await askInt(rl, 'Cannot choose yourself. Pick another index: ', 0, state.players.length - 1);
      }

      const rank = (await rl.question(`Ask for rank (${legalRanks.join(', ')}): `)).trim();

      try {
        takeTurn(state, { targetPlayerIndex: target, rank });
        console.log(state.lastAction);
      } catch (err) {
        console.log(`Invalid turn: ${err.message}`);
      }
    }

    const winners = getWinners(state);
    console.log('\n=== Game Over ===');
    state.players.forEach((p) => {
      console.log(`${p.name}: ${p.books.length} books`);
    });

    if (winners.length === 1) {
      console.log(`Winner: ${winners[0].name}`);
    } else {
      console.log(`Tie: ${winners.map((w) => w.name).join(', ')}`);
    }
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
