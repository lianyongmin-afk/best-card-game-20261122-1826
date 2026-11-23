// Lantern Duel — deterministic screenshot scenes.
// ?shot=title|play|win|loss renders a fixed, real game state through the same
// render() the player sees, so each screenshot is the game itself in a browser.
// No network, no edits: the scenes only set up a game and play real cards.
import { createGame, playerPlayCard, startGame } from './state.js';

// A fixed hand for the play scene: readable costs, powers and all four elements.
const PLAY_HAND = ['wildfire', 'undertow', 'bramble', 'boulder', 'sprout'];

function setHand(game, fighter, ids) {
  const pool = [...fighter.deck, ...fighter.hand];
  fighter.hand = ids.map((id, i) => {
    const found = pool.find((c) => c.id === id);
    const copy = { ...found, uid: `${found.id}-shot-${i}` };
    const at = pool.indexOf(found);
    if (at >= 0) pool.splice(at, 1);
    return copy;
  });
  fighter.deck = pool.filter((c) => !fighter.hand.some((h) => h.uid === c.uid));
}

export function applyShot(game, shot) {
  if (shot === 'title') return game;
  if (shot === 'play') {
    startGame(game);
    setHand(game, game.player, PLAY_HAND);
    setHand(game, game.foe, ['flare', 'douser', 'pebble', 'sprout', 'boulder']);
    game.player.life = 24;
    game.player.shield = 4;
    game.foe.life = 19;
    game.foe.shield = 2;
    game.score = 37;
    game.round = 3;
    game.energy = 2;
    game.log = [
      'Round 3 — your turn. Draw 2, energy refilled.',
      'Rook plays Flare. Flare hits for 6, 4 soaked by shield.',
      'You play Sprout. Sprout restores 4 life.',
      'Two Ember cards in one turn would chain +2.',
    ];
    return game;
  }
  if (shot === 'win') {
    startGame(game);
    setHand(game, game.player, PLAY_HAND);
    game.foe.life = 0;
    game.player.life = 18;
    game.player.shield = 3;
    game.score = 214;
    game.damageDealt = 31;
    game.round = 6;
    game.screen = 'win';
    game.result = 'win';
    game.winner = game.player.name;
    return game;
  }
  if (shot === 'loss') {
    startGame(game);
    setHand(game, game.player, PLAY_HAND);
    game.player.life = 0;
    game.foe.life = 11;
    game.score = 96;
    game.damageDealt = 19;
    game.round = 5;
    game.screen = 'loss';
    game.result = 'loss';
    game.winner = game.foe.name;
    return game;
  }
  return game;
}

// Build a game straight into a shot scene (used by main.js when ?shot= is set).
export function gameForShot(shot, seed) {
  const game = createGame(seed ?? 7);
  return applyShot(game, shot);
}

// Keep the unused import honest: a real play-through helper for tests.
export function demoPlay(game) {
  startGame(game);
  const first = game.player.hand.find((c) => c.cost <= game.energy);
  if (first) playerPlayCard(game, first.uid);
  return game;
}
