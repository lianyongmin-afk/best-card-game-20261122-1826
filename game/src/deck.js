// Lantern Duel — card definitions and deck building.
// Four original elements, each told apart by colour AND shape, never by text alone:
// Ember (red diamond), Tide (blue circle), Leaf (green triangle), Stone (amber square).
export const ELEMENTS = {
  ember: { name: 'Ember', color: '#e5484d', dark: '#8f1d22', glyph: '◆', word: 'burn' },
  tide: { name: 'Tide', color: '#3e8fe8', dark: '#174a80', glyph: '●', word: 'flow' },
  leaf: { name: 'Leaf', color: '#46a758', dark: '#1d5c2e', glyph: '▲', word: 'grow' },
  stone: { name: 'Stone', color: '#e5a13e', dark: '#7a5200', glyph: '■', word: 'hold' },
};

// Every card: id, element, cost (energy), power, kind, and a one-line rule.
// kind: strike (damage), guard (shield), mend (heal), surge (damage + draw), snare (damage + weaken foe).
export const CARD_DEFS = [
  { id: 'spark', name: 'Spark', element: 'ember', cost: 1, power: 3, kind: 'strike', text: 'Deal 3 damage.' },
  { id: 'flare', name: 'Flare', element: 'ember', cost: 2, power: 6, kind: 'strike', text: 'Deal 6 damage.' },
  { id: 'wildfire', name: 'Wildfire', element: 'ember', cost: 3, power: 10, kind: 'strike', text: 'Deal 10 damage.' },
  { id: 'douser', name: 'Douser', element: 'tide', cost: 1, power: 4, kind: 'guard', text: 'Gain 4 shield.' },
  { id: 'undertow', name: 'Undertow', element: 'tide', cost: 2, power: 3, kind: 'surge', text: 'Deal 3 damage. Draw a card.' },
  { id: 'high-tide', name: 'High Tide', element: 'tide', cost: 3, power: 9, kind: 'guard', text: 'Gain 9 shield.' },
  { id: 'sprout', name: 'Sprout', element: 'leaf', cost: 1, power: 4, kind: 'mend', text: 'Restore 4 life.' },
  { id: 'bramble', name: 'Bramble', element: 'leaf', cost: 2, power: 5, kind: 'snare', text: 'Deal 5 damage. Foe loses 2 next turn.' },
  { id: 'old-oak', name: 'Old Oak', element: 'leaf', cost: 3, power: 8, kind: 'mend', text: 'Restore 8 life.' },
  { id: 'pebble', name: 'Pebble', element: 'stone', cost: 1, power: 2, kind: 'strike', text: 'Deal 2 damage. Gain 2 shield.' },
  { id: 'boulder', name: 'Boulder', element: 'stone', cost: 2, power: 5, kind: 'strike', text: 'Deal 5 damage.' },
  { id: 'mountain', name: 'Mountain', element: 'stone', cost: 3, power: 7, kind: 'guard', text: 'Deal 4 damage. Gain 7 shield.' },
];

export function cardById(id) {
  return CARD_DEFS.find((c) => c.id === id);
}

// A 24-card deck: two copies of every card, shuffled with the given random source.
export function buildDeck(random) {
  const deck = [];
  for (const def of CARD_DEFS) {
    deck.push({ ...def, uid: `${def.id}-a` });
    deck.push({ ...def, uid: `${def.id}-b` });
  }
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Tiny seeded random so screenshot scenes are deterministic.
export function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
