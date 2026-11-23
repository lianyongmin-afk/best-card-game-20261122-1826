# Lantern Duel

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/lianyongmin-afk/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/lianyongmin-afk/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D22.18-brightgreen.svg)](https://nodejs.org)
[![Offline](https://img.shields.io/badge/plays-offline-blue.svg)](game/index.html)

An original turn-based card duelling game for the [best-card-game-20261122-1826 bounty](https://make.fun/bounty/best-card-game-20261122-1826) ($50).

## The game

You are the **Lantern Keeper**. Across the table sits **Rook, the Wisp Thief**.
Both duelists have **30 life**, **3 energy** a turn, and draw 2 cards a turn.
Play cards from your hand of 5; the first lantern to go out loses.

Four original elements, told apart by colour **and** shape:

| Element | Glyph | Colour | Style |
| --- | --- | --- | --- |
| Ember | ◆ | red | raw damage |
| Tide | ● | blue | shield and draw |
| Leaf | ▲ | green | healing and weakening |
| Stone | ■ | amber | heavy hits with shield |

**The Chain rule:** play two cards of the same element in one turn and the
second gets **+2**. Shield soaks damage first. Rook is greedy but readable —
it guards when hurt and mends only when low — so you can plan around it.

## Controls

- **Mouse:** click a card to select it, click again to play; click **End Turn**.
- **Keyboard:** `1–5` select a card, `Enter` plays it, `E` ends the turn,
  `R` restarts, `Enter` starts from the title screen.

## Play it

No build step, no network. Serve `game/` with any static server and open
`game/index.html` in desktop Chrome, e.g.:

```sh
cd game && python3 -m http.server 8080
# open http://localhost:8080
```

## Hand-in

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
to `/output` and writes `/output/dossier.json` with the kit's
`vendor/makefun-game.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots are real renders of the game's own code in a headless browser,
taken through the deterministic `?shot=title|play|win|loss` scenes in
`game/src/shots.js` (see `shots.json`).
