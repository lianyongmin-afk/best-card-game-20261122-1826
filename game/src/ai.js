// Lantern Duel — the foe's brain.
// Rook is greedy but readable: it spends its energy on the biggest hit it can afford,
// guards when hurt, mends only when low, and chains one element when it can.
// A weakened Rook (snared last turn) hits softer, which the player can plan around.
import { drawCards, playCard, startPlayerTurn } from './state.js';

function cardScore(game, card) {
  if (card.kind === 'mend' && game.foe.life <= 12) return 100 + card.power;
  if (card.kind === 'guard' && game.foe.life <= 18) return 80 + card.power;
  if (card.kind === 'strike' || card.kind === 'surge' || card.kind === 'snare') return 50 + card.power;
  if (card.kind === 'guard') return 20 + card.power;
  return card.power;
}

export function foeTakeTurn(game, render) {
  if (game.screen !== 'play' || game.turn !== 'foe') return;
  drawCards(game.foe, 2);
  render();
  let energy = game.energyMax;
  const ranked = [...game.foe.hand].sort((a, b) => cardScore(game, b) - cardScore(game, a));
  const played = new Set();
  let step = 0;
  const playNext = () => {
    if (game.screen !== 'play') { render(); return; }
    if (step >= ranked.length) {
      game.foe.hand = game.foe.hand.filter((c) => !played.has(c.uid));
      game.log.push('Rook ends its turn.');
      startPlayerTurn(game);
      render();
      return;
    }
    const card = ranked[step];
    step += 1;
    if (card.cost > energy) { playNext(); return; }
    energy -= card.cost;
    played.add(card.uid);
    game.foe.discard.push(card);
    const line = playCard(game, game.foe, game.player, card);
    game.playedThisTurn.push(card.element);
    game.log.push(`Rook plays ${card.name}. ${line}`);
    render();
    if (game.screen !== 'play') return;
    setTimeout(playNext, 650);
  };
  setTimeout(playNext, 600);
}
