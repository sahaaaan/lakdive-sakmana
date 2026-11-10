// Prologue: Galle Face Green, Colombo. A gentle tutorial, one thing at a time:
// walk → pick something up → see what someone needs → find a hidden thing by turning the view → give it →
// stand on a switch (the crossing) → ride away. Pure logic, shared with the solver.

// layout: u runs along the promenade (world x), v runs towards the sea (world -z); the camera looks in diagonally
export const at = (u, v, y = 0.06) => [u, y, -v];

export const NODES = {
  START: at(-7.6, -2.4), LAWN: at(-3, -1.1), CART: at(-3.6, 1.5), PROM: at(0, 3.7), KID: at(3.0, 3.7),
  PLATE: at(5.4, 0.3), FAR: at(9.7, 0.3),
};
export const REEL_AT = at(-4.75, 4.05, 0.12); // rolled behind the vadai cart, out of sight from where you start

export function initialState() {
  return { player: 'START', wade: 0, asked: false, reel: 0, /* 0 lost, 1 carried, 2 given back */ crossing: false, won: false, has: { leaf: false } };
}

export function edges(s) {
  const E = []; const line = (a, b, x = {}) => E.push({ a, b, kind: 'line', ...x });
  line('START', 'LAWN'); line('LAWN', 'CART'); line('CART', 'PROM'); line('PROM', 'KID');
  line('LAWN', 'PLATE', { via: [at(2.2, -0.7)] }); line('KID', 'PLATE', { via: [at(4.6, 2.4)] });
  if (s.crossing) line('PLATE', 'FAR', { kind: 'cross' });
  return E;
}
export function adjacency(s) {
  const m = new Map();
  for (const e of edges(s)) for (const [x, y] of [[e.a, e.b], [e.b, e.a]]) { if (!m.has(x)) m.set(x, []); m.get(x).push({ to: y, e }); }
  return m;
}
export function findPath(s, from, to) {
  if (from === to) return [from];
  const adj = adjacency(s); const prev = new Map([[from, null]]), q = [from];
  while (q.length) { const n = q.shift(); for (const { to: t } of adj.get(n) || []) if (!prev.has(t)) { prev.set(t, n); if (t === to) { const p = [t]; let c = n; while (c) { p.unshift(c); c = prev.get(c); } return p; } q.push(t); } }
  return null;
}

export const SPOTS = { cart: 'CART', kid: 'KID', tuk: 'FAR' };
export const PLATES = { PLATE: 'crossing' };
export function stepOn(s, node) { const k = PLATES[node]; if (!k) return null; s[k] = !s[k]; return { k, on: s[k] }; } // stand again to undo

// the kite reel is tapped wherever you can see it
export function canTap(s, k) { return k === 'reel' && s.reel === 0; }
export function tap(s, k) { if (!canTap(s, k)) return null; s.reel = 1; return 'reel'; }

export function interact(s, what) {
  switch (what) {
    case 'cart': if (s.wade) return 'cartAgain'; s.wade = 1; return 'gotWade';
    case 'kid':
      if (s.reel === 2) return 'kidHappy';
      if (s.reel === 1) { s.reel = 2; return 'gaveReel'; }
      s.asked = true; return 'kidNeeds';
    case 'tuk':
      if (s.won) return 'nothing';
      if (s.reel !== 2) return 'tukWaits';
      if (!s.wade) return 'tukHungry';
      s.wade = 0; s.won = true; return 'win';
  }
  return 'nothing';
}

export function objective(s) {
  if (s.won) return 'Off to Fort station. Your journey begins!';
  return 'Learn how to play: follow the steps at the bottom of the screen.';
  if (!s.wade) return 'Tap the ground to walk. Find something to eat for the journey.';
  if (s.reel === 0 && !s.asked) return 'Someone by the sea wall looks upset. Tap them to see what they need.';
  if (s.reel === 0) return 'Find what the boy lost. Things can hide behind other things.';
  if (s.reel === 1) return 'Take it back to the boy.';
  if (s.player === 'FAR') return 'Hop in: tap the tuk-tuk.';
  if (s.crossing) return 'The traffic has stopped. Cross Galle Road.';
  return 'His father’s tuk-tuk waits across Galle Road. Find a safe way across.';
}
