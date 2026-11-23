// Lantern Duel — mouse and keyboard input.
// Click a card to play it; keys 1-9 select, Enter/Space plays the selection,
// E ends the turn, R restarts, and the big buttons handle title / end screens.
import { endPlayerTurn, playerPlayCard, startGame } from './state.js';
import { foeTakeTurn } from './ai.js';

export function bindInput(game, root, render) {
  let selectedUid = null;

  const rerender = () => render(game, root, selectedUid);

  root.addEventListener('click', (event) => {
    const startBtn = event.target.closest('#start-btn');
    if (startBtn) { startGame(game); rerender(); return; }
    const againBtn = event.target.closest('#again-btn');
    if (againBtn) { window.location.reload(); return; }
    const endBtn = event.target.closest('#end-btn');
    if (endBtn) { endPlayerTurn(game); rerender(); foeTakeTurn(game, rerender); return; }
    const cardBtn = event.target.closest('.card.playable');
    if (cardBtn) {
      const uid = cardBtn.dataset.uid;
      if (selectedUid === uid) {
        if (playerPlayCard(game, uid)) { selectedUid = null; rerender(); }
      } else {
        selectedUid = uid;
        rerender();
      }
    }
  });

  document.addEventListener('keydown', (event) => {
    if (game.screen === 'title' && (event.key === 'Enter' || event.key === ' ')) {
      startGame(game); rerender(); return;
    }
    if ((game.screen === 'win' || game.screen === 'loss') && (event.key === 'r' || event.key === 'R' || event.key === 'Enter')) {
      window.location.reload(); return;
    }
    if (game.screen !== 'play') return;
    if (event.key === 'r' || event.key === 'R') { window.location.reload(); return; }
    if ((event.key === 'e' || event.key === 'E') && game.turn === 'player') {
      endPlayerTurn(game); rerender(); foeTakeTurn(game, rerender); return;
    }
    const num = Number.parseInt(event.key, 10);
    if (num >= 1 && num <= game.player.hand.length) {
      selectedUid = game.player.hand[num - 1].uid;
      rerender();
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && selectedUid) {
      if (playerPlayCard(game, selectedUid)) { selectedUid = null; rerender(); }
    }
  });

  return { getSelected: () => selectedUid };
}
