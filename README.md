# go-fish-engine

Reusable card/deck engine plus a Go Fish implementation.

## Current scope
- Local playable Go Fish (CLI) for **2 to 4 players**.
- Single 52-card deck.
- **All cards are dealt** at game start using round-robin deal order.
- Deal size auto-adjusts based on player count and starting dealer/seat order.
- Pure game engine logic kept separate from UI/transport layers.

## Project structure
- `src/engine/cards`: reusable card + deck primitives.
- `src/games/go-fish`: game rules/state machine (engine + local CLI adapter).
- `src/ui`: placeholder for future browser/UI layers.
- `tests`: node test suite.

## Run locally
```bash
npm test
node src/games/go-fish/cli-local.js
```

## API examples
```js
import { goFish } from './src/index.js';

const state = goFish.createGame({ playerNames: ['P1', 'P2', 'P3'] });
console.log(state.players.map((p) => p.hand.length));
```

## Future roadmap
- 1-player mode with NPC opponent (configurable AI strategy).
- Optional support for player counts beyond 4 with enforced upper cap.
- Network-ready adapter boundary so same engine can be hosted online later (WebSocket/server authority model).
- Browser UI module that reuses the same engine contract.
