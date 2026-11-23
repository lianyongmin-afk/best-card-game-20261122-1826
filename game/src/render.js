// Lantern Duel — DOM rendering for every screen.
// The table always shows: foe hand (face down), both life totals and shields,
// the player's hand with readable cost / power / element, energy, round and score.
import { ELEMENTS } from './deck.js';
import { MAX_LIFE, CHAIN_BONUS, chainBonus } from './state.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_LOSS = 'loss';

const KIND_LABEL = { strike: 'Strike', guard: 'Guard', mend: 'Mend', surge: 'Surge', snare: 'Snare' };

function hpBar(fighter) {
  const pct = Math.max(0, Math.round((fighter.life / MAX_LIFE) * 100));
  const shield = fighter.shield > 0 ? ` <span class="shield">🛡 ${fighter.shield}</span>` : '';
  return `<div class="hp"><div class="hp-fill" style="width:${pct}%"></div></div>
    <div class="hp-num">${fighter.life} / ${MAX_LIFE} life${shield}</div>`;
}

function cardHtml(game, card, opts = {}) {
  const el = ELEMENTS[card.element];
  const playable = opts.playable && game.energy >= card.cost;
  const chain = opts.playable ? chainBonus(game, card) : 0;
  const bonus = chain ? `<span class="chain">chain +${chain}</span>` : '';
  return `<button class="card el-${card.element}${playable ? ' playable' : ''}${opts.selected ? ' selected' : ''}"
      data-uid="${card.uid}" ${opts.playable ? '' : 'disabled'} style="--el:${el.color};--eld:${el.dark}">
    <span class="cost">${card.cost}◆</span>
    <span class="glyph">${el.glyph}</span>
    <span class="cname">${card.name}</span>
    <span class="ckind">${KIND_LABEL[card.kind]} ${card.power}</span>
    <span class="ctext">${card.text}</span>${bonus}
  </button>`;
}

function foeCardBack(index) {
  return `<div class="card back" style="--el:#5b4a8a;--eld:#2e2350"><span class="glyph">🏮</span><span class="cname">Rook</span><span class="ctext">face down</span></div>`;
}

export function render(game, root, selectedUid) {
  if (game.screen === SCREEN_TITLE) {
    root.innerHTML = `<div class="screen title-screen">
      <div class="lantern">🏮</div>
      <h1>LANTERN DUEL</h1>
      <p class="tagline">A duel of ember, tide, leaf and stone.<br>Outlast Rook the Wisp Thief — first lantern out loses.</p>
      <div class="rules">
        <p>♥ Both duelists: <b>30 life</b> · <b>3 energy</b> a turn · draw 2</p>
        <p>◆ Play a card by clicking it (or keys <b>1–5</b>, <b>Enter</b> to play)</p>
        <p>⛓ Two cards of one element in a turn: the second gets <b>+${CHAIN_BONUS} chain</b></p>
        <p>🛡 Shield soaks damage first · <b>E</b> ends your turn · <b>R</b> restarts</p>
      </div>
      <button id="start-btn" class="big-btn">▶ &nbsp;Light the Lanterns</button>
      <p class="foot">An original game — no borrowed names, art or music.</p>
    </div>`;
    return;
  }

  if (game.screen === SCREEN_WIN || game.screen === SCREEN_LOSS) {
    const won = game.screen === SCREEN_WIN;
    root.innerHTML = `<div class="screen end-screen ${won ? 'win' : 'loss'}">
      <div class="lantern">${won ? '🏮✨' : '🕯️'}</div>
      <h1>${won ? 'VICTORY!' : 'DEFEAT'}</h1>
      <p class="tagline">${won ? 'Rook’s lantern goes out. The vale is yours, Keeper.' : 'Your lantern goes out. Rook slips away into the dark.'}</p>
      <div class="final-stats">
        <div><span>Score</span><b>${game.score}</b></div>
        <div><span>Damage dealt</span><b>${game.damageDealt}</b></div>
        <div><span>Rounds</span><b>${game.round}</b></div>
        <div><span>Your life</span><b>${game.player.life} / ${MAX_LIFE}</b></div>
        <div><span>Rook’s life</span><b>${game.foe.life} / ${MAX_LIFE}</b></div>
      </div>
      <button id="again-btn" class="big-btn">↻ &nbsp;Duel Again</button>
      <p class="foot">Press R or click to play again.</p>
    </div>`;
    return;
  }

  // Play screen.
  const foeBacks = game.foe.hand.map((_, i) => foeCardBack(i)).join('');
  const hand = game.player.hand.map((card) =>
    cardHtml(game, card, { playable: game.turn === 'player', selected: card.uid === selectedUid }),
  ).join('');
  const log = game.log.slice(-5).map((line) => `<li>${line}</li>`).join('');
  root.innerHTML = `<div class="screen table">
    <header class="topbar">
      <div class="brand">🏮 LANTERN DUEL</div>
      <div class="meta">Round <b>${game.round}</b> · Score <b>${game.score}</b> · Deck <b>${game.player.deck.length}</b></div>
      <div class="energy">Energy <b>${game.energy} / ${game.energyMax}</b> ${'●'.repeat(game.energy)}${'○'.repeat(game.energyMax - game.energy)}</div>
    </header>
    <section class="foe-row">
      <div class="fighter foe">
        <div class="fname">🧞 Rook <span class="ftitle">the Wisp Thief</span></div>
        ${hpBar(game.foe)}
      </div>
      <div class="hand foe-hand">${foeBacks}</div>
    </section>
    <section class="middle">
      <div class="table-centre">🕯️<span>${game.turn === 'player' ? 'Your turn — play a card or end the turn' : 'Rook is thinking…'}</span></div>
      <button id="end-btn" class="end-btn" ${game.turn === 'player' ? '' : 'disabled'}>End Turn (E)</button>
    </section>
    <section class="player-row">
      <div class="fighter you">
        <div class="fname">🧑‍🌾 You <span class="ftitle">Lantern Keeper</span></div>
        ${hpBar(game.player)}
      </div>
      <div class="hand your-hand">${hand || '<p class="empty-hand">No cards — end the turn to draw.</p>'}</div>
    </section>
    <ul class="log">${log}</ul>
    <p class="hint">Click a card to play it · keys 1–${Math.min(9, game.player.hand.length)} select · Enter plays · E ends turn · R restarts</p>
  </div>`;
}
