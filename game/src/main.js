// Lantern Duel — boot. Reads ?shot= for the deterministic screenshot scenes,
// otherwise starts a fresh game on the title screen.
import { createGame } from './state.js';
import { render } from './render.js';
import { bindInput } from './input.js';
import { gameForShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number.parseInt(params.get('seed') ?? '20261123', 10);

const game = shot ? gameForShot(shot, Number.isNaN(seed) ? 7 : seed) : createGame(seed);
const root = document.getElementById('app');
render(game, root, null);
bindInput(game, root, (g, r, s) => render(g, r, s));

// Expose the live game for play-testing from the console.
window.__lanternDuel = game;
