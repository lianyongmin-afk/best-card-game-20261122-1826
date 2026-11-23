// Lantern Duel — game state and turn rules.
// Both duelists start at 30 life with 3 energy a turn and a hand of 5.
// Playing two cards of the same element in one turn lights a Chain: +2 to the second card.
// Shield absorbs damage first. A win is the foe at 0 life; a loss is you at 0.
import { buildDeck, seededRandom } from './deck.js';

export const MAX_LIFE = 30;
export const HAND_SIZE = 5;
export const ENERGY_PER_TURN = 3;
export const CHAIN_BONUS = 2;

export function createFighter(name, title) {
  return { name, title, life: MAX_LIFE, shield: 0, deck: [], hand: [], discard: [], weak: 0 };
}

export function createGame(seed) {
  const random = seededRandom(seed ?? 20261123);
  const game = {
    seed: seed ?? 20261123,
    screen: 'title',
    round: 1,
    turn: 'player',
    energy: ENERGY_PER_TURN,
    energyMax: ENERGY_PER_TURN,
    player: createFighter('You', 'Lantern Keeper'),
    foe: createFighter('Rook', 'the Wisp Thief'),
    playedThisTurn: [],
    log: ['The lanterns are lit. Your move, Keeper.'],
    score: 0,
    damageDealt: 0,
    result: null,
    winner: null,
  };
  game.player.deck = buildDeck(random);
  game.foe.deck = buildDeck(random);
  drawCards(game.player, HAND_SIZE);
  drawCards(game.foe, HAND_SIZE);
  return game;
}

export function drawCards(fighter, count) {
  for (let i = 0; i < count; i += 1) {
    if (fighter.deck.length === 0) {
      fighter.deck = fighter.discard;
      fighter.discard = [];
      // Reshuffle the discard pile back into the deck.
      for (let j = fighter.deck.length - 1; j > 0; j -= 1) {
        const k = Math.floor(Math.random() * (j + 1));
        [fighter.deck[j], fighter.deck[k]] = [fighter.deck[k], fighter.deck[j]];
      }
      if (fighter.deck.length === 0) return;
    }
    fighter.hand.push(fighter.deck.pop());
  }
}

export function chainBonus(game, card) {
  return game.playedThisTurn.includes(card.element) ? CHAIN_BONUS : 0;
}

export function canPlay(game, card) {
  return game.screen === 'play' && game.turn === 'player' && card.cost <= game.energy;
}

// Apply one card. Returns a short line for the battle log.
// The chain bonus is read from playedThisTurn BEFORE the current card is
// pushed there, so only a second card of an element in the same turn gets +2.
export function playCard(game, actor, target, card) {
  const bonus = chainBonus(game, card);
  const lines = [];
  if (card.kind === 'strike' || card.kind === 'surge' || card.kind === 'snare') {
    let dmg = card.power + bonus;
    if (actor.weak > 0) dmg = Math.max(0, dmg - actor.weak);
    const absorbed = Math.min(target.shield, dmg);
    target.shield -= absorbed;
    target.life = Math.max(0, target.life - (dmg - absorbed));
    if (actor === game.player) game.damageDealt += dmg - absorbed;
    lines.push(`${card.name} hits for ${dmg}${bonus ? ` (+${bonus} chain)` : ''}${absorbed ? `, ${absorbed} soaked by shield` : ''}.`);
  }
  if (card.kind === 'guard') {
    actor.shield += card.power + bonus;
    lines.push(`${card.name} raises ${card.power + bonus} shield.`);
  }
  if (card.kind === 'mend') {
    const healed = Math.min(MAX_LIFE - actor.life, card.power + bonus);
    actor.life += healed;
    lines.push(`${card.name} restores ${healed} life.`);
  }
  if (card.kind === 'surge') {
    drawCards(actor, 1);
    lines.push(`${actor.name} draws a card.`);
  }
  if (card.kind === 'snare') {
    target.weak = 2;
    lines.push(`${target.name} is weakened (-2 next turn).`);
  }
  if (card.kind === 'strike' && card.id === 'pebble') {
    actor.shield += 2;
    lines.push(`${card.name} also raises 2 shield.`);
  }
  if (card.kind === 'guard' && card.id === 'mountain') {
    const dmg = 4 + bonus;
    const absorbed = Math.min(target.shield, dmg);
    target.shield -= absorbed;
    target.life = Math.max(0, target.life - (dmg - absorbed));
    if (actor === game.player) game.damageDealt += dmg - absorbed;
    lines.push(`Mountain also deals ${dmg} damage.`);
  }
  return lines.join(' ');
}

export function playerPlayCard(game, uid) {
  const index = game.player.hand.findIndex((c) => c.uid === uid);
  if (index < 0) return false;
  const card = game.player.hand[index];
  if (!canPlay(game, card)) return false;
  game.energy -= card.cost;
  game.player.hand.splice(index, 1);
  game.player.discard.push(card);
  const line = playCard(game, game.player, game.foe, card);
  game.playedThisTurn.push(card.element);
  game.log.push(`You play ${card.name}. ${line}`);
  game.score += card.power;
  checkEnd(game);
  return true;
}

export function endPlayerTurn(game) {
  if (game.screen !== 'play' || game.turn !== 'player') return;
  game.turn = 'foe';
  game.log.push('Rook takes the table…');
}

export function startPlayerTurn(game) {
  game.round += 1;
  game.turn = 'player';
  game.energy = game.energyMax;
  game.playedThisTurn = [];
  game.player.weak = 0;
  drawCards(game.player, 2);
  while (game.player.hand.length > 7) game.player.discard.push(game.player.hand.pop());
  game.log.push(`Round ${game.round} — your turn. Draw 2, energy refilled.`);
}

export function startFoeTurn(game) {
  game.foe.weak = 0;
  game.energy = game.energyMax;
  game.playedThisTurn = [];
}

export function checkEnd(game) {
  if (game.foe.life <= 0) {
    game.screen = 'win';
    game.result = 'win';
    game.winner = game.player.name;
    game.score += 100 + game.player.life * 2;
    game.log.push('Rook’s lantern goes out. You win!');
  } else if (game.player.life <= 0) {
    game.screen = 'loss';
    game.result = 'loss';
    game.winner = game.foe.name;
    game.log.push('Your lantern goes out. Rook wins.');
  }
}

export function startGame(game) {
  game.screen = 'play';
  game.log.push('Round 1 — your turn.');
}
