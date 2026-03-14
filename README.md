# go-fish-engine

Reusable card/deck engine plus a Go Fish implementation.

## Current scope
- Local playable Go Fish for **2 to 4 players**.
- Standard 52-card deck.
- **7 cards per player** are dealt at start.
- Remaining cards stay in a draw pile for normal “Go Fish” draws.
- Engine logic separated from adapters (CLI + web UI).

## Project structure
- `src/engine/cards`: reusable card + deck primitives.
- `src/games/go-fish`: rules + state machine.
- `src/games/go-fish/cli-local.js`: terminal adapter.
- `web/`: basic browser UI adapter.
- `tests/`: node test suite.

## Run locally
### 1) Run tests
```bash
npm test
```

### 2) Play in terminal
```bash
node src/games/go-fish/cli-local.js
```

### 3) Play in browser (graphical)
```bash
python3 -m http.server 8090
```
Open:
```text
http://localhost:8090/web/
```

## Current UI limitation
- In local same-screen mode, all players' cards are visible.
- This is expected for local prototype testing.

## Future roadmap
- 1-player mode with NPC opponent.
- Optional upper-limit expansion beyond 4 players.
- Online multiplayer mode where each player only sees their own hand.
