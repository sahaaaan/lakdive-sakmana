// Chapter II: Hiriketiya. Pure level logic (no rendering), shared with the solver.
// Area 1: the horseshoe bay at golden hour (tide). Area 2: the main street after sunset (power cut).

const V3 = (x, y, z) => [x, y, z];
const pol = (r, d, y = 0, c = [0, 0, 0]) => { const a = d * Math.PI / 180; return V3(c[0] + r * Math.sin(a), y, c[2] + r * Math.cos(a)); };

// ---- area 1: the bay. The bay's water is a circle; the beach curves round it.
export const BAY_C = pol(3, 45);       // centre of the bay water
export const BAY_R = 5.2;              // water radius
const bp = (a, r = 6.1, y = 0.06) => pol(r, a, y, BAY_C);
// ---- area 2: the street island; the road runs along local x
export const ST_C = V3(-16, 0, 18.5);   // the street island sits to the left of the bay on screen
export const ST_ROT = Math.PI / 4;     // turned so the road runs straight across the screen; local +x (east end) faces the bay
export const sp = (x, z, y = 0.06) => { const c = Math.cos(ST_ROT), n = Math.sin(ST_ROT); return V3(ST_C[0] + c * x + n * z, y, ST_C[2] - n * x + c * z); };
const LOC = {};
const lp = (id, x, z, y = 0.06) => { LOC[id] = [x, y, z]; return sp(x, z, y); };

export const NODES = {
  // beach
  B_cafe: bp(300), B_start: bp(255), B_mid: bp(212), B_palm: bp(170), B_east: bp(132),
  B_dial: bp(103, 6.3, 0.42),
  B_reef: pol(5.0, 78, -0.2, BAY_C), B_pool: pol(5.0, 52, -0.12, BAY_C),
  B_point: pol(6.4, 8, 0.5, BAY_C),     // surf point on the far horn (only by surfing)
  // street
  S_enter: lp('S_enter', 9.4, 3.0), S_kerbN: lp('S_kerbN', -1.6, 1.9), S_gen: lp('S_gen', -5.4, 4.5), S_j2: lp('S_j2', 3.9, 2.6),
  S_kerbF: lp('S_kerbF', -1.6, -1.9), S_cafe: lp('S_cafe', -1.9, -3.4), S_stair: lp('S_stair', -6.9, -3.4), S_balc: lp('S_balc', -2.4, -4.9, 2.66),
  S_pole: lp('S_pole', 1.7, -2.6, 2.66), S_shop: lp('S_shop', 4.9, -3.4),
};
export const LOCAL = LOC;
export const areaOf = (id) => (id[0] === 'S' ? 2 : 1);

export function initialState() {
  return {
    player: 'B_start',
    tideLow: false, floats: 0, floatTaken: [false, false, false, false], palm1: false,
    hasPaddle: false, fisherOk: false, boardBack: false, hasBoard: false,
    bulbs: 0, bulbTaken: [false, false, false, false], palm2: false, bulbsIn: false,
    J: [0, 0, 0], awning: false, won: false, has: { leaf: false },
  };
}
export const J_GOAL = [2, 1, 3];
export const wired = (s) => s.J.every((v, i) => v === J_GOAL[i]);

export function edges(s) {
  const E = [];
  const line = (a, b, extra = {}) => E.push({ a, b, kind: 'line', ...extra });
  line('B_cafe', 'B_start'); line('B_start', 'B_mid'); line('B_mid', 'B_palm'); line('B_palm', 'B_east');
  line('B_east', 'B_dial', { via: [bp(118, 6.5, 0.2)] });
  if (s.tideLow) { line('B_dial', 'B_reef', { via: [pol(5.7, 92, -0.05, BAY_C)] }); line('B_reef', 'B_pool', { via: [pol(4.9, 65, -0.2, BAY_C)] }); }
  if (s.hasBoard && !s.tideLow) E.push({ a: 'B_mid', b: 'B_point', kind: 'surf', ride: true, speed: 4.2 }); // ride a wave across the bay
  E.push({ a: 'B_point', b: 'S_enter', kind: 'tuk', ride: true, speed: 5 });                              // a tuk-tuk up the red road
  line('S_enter', 'S_kerbN', { via: [sp(5.8, 2.5), sp(1.0, 2.4)] }); line('S_kerbN', 'S_gen', { via: [sp(-4.6, 2.7)] }); line('S_kerbN', 'S_j2', { via: [sp(1.0, 2.4)] });
  E.push({ a: 'S_kerbN', b: 'S_kerbF', kind: 'cross' });                                                   // timed road crossing
  line('S_kerbF', 'S_cafe'); line('S_cafe', 'S_stair'); line('S_cafe', 'S_shop', { via: [sp(1.0, -3.6)] });
  line('S_stair', 'S_balc', { via: [sp(-6.9, -4.9, 0.06), sp(-5.0, -4.9, 2.66)] });
  if (s.awning) line('S_balc', 'S_pole', { via: [sp(0.3, -4.9, 2.66)] });
  return E;
}
export function adjacency(s) {
  const m = new Map();
  for (const e of edges(s)) { for (const [x, y] of [[e.a, e.b], [e.b, e.a]]) { if (!m.has(x)) m.set(x, []); m.get(x).push({ to: y, e }); } }
  return m;
}
export function findPath(s, from, to) {
  if (from === to) return [from];
  const adj = adjacency(s), prev = new Map([[from, null]]), q = [from];
  while (q.length) { const n = q.shift(); for (const { to: t } of adj.get(n) || []) if (!prev.has(t)) { prev.set(t, n); if (t === to) { const p = [t]; let c = n; while (c) { p.unshift(c); c = prev.get(c); } return p; } q.push(t); } }
  return null;
}

// where she stands to use each thing (null = usable from anywhere)
export const SPOTS = { dial: 'B_dial', paddle: 'B_pool', fisher: 'B_mid', board: 'B_mid', owner: 'S_cafe', j1: 'S_pole', j2: 'S_j2', j3: 'S_shop', gen: 'S_gen' };
export const PLATES = { S_balc: 'awning' };
export function stepOn(s, node) { const k = PLATES[node]; if (!k) return null; s[k] = !s[k]; return { k, on: s[k] }; } // reversible

// hidden things you tap from wherever you are (if they can be seen)
export function canTap(s, k) {
  if (k === 'palm1') return !s.palm1;
  if (k === 'palm2') return !s.palm2;
  if (k === 'leaf') return !s.has.leaf;
  const [kind, i] = [k[0], +k.slice(1)];
  if (kind === 'f') return !s.floatTaken[i] && (i !== 2 || s.palm1) && (i !== 3 || s.tideLow);
  if (kind === 'b') return !s.bulbTaken[i] && (i !== 3 || s.palm2);
  return false;
}
export function tap(s, k) {
  if (!canTap(s, k)) return null;
  if (k === 'palm1') { s.palm1 = true; return 'palmDrop'; }
  if (k === 'palm2') { s.palm2 = true; return 'palmDrop'; }
  if (k === 'leaf') { s.has.leaf = true; return 'leaf'; }
  const i = +k.slice(1);
  if (k[0] === 'f') { s.floatTaken[i] = true; s.floats++; return 'float'; }
  s.bulbTaken[i] = true; s.bulbs++; return 'bulb';
}

export function interact(s, what) {
  switch (what) {
    case 'dial':
      s.tideLow = !s.tideLow;
      if (!s.tideLow && s.fisherOk && !s.boardBack) { s.boardBack = true; return 'tideHighBoard'; }
      return s.tideLow ? 'tideLow' : 'tideHigh';
    case 'paddle': if (s.hasPaddle || s.fisherOk) return 'nothing'; s.hasPaddle = true; return 'gotPaddle';
    case 'fisher':
      if (s.fisherOk) return s.boardBack ? 'nothing' : 'fisherWaits';
      if (!s.hasPaddle || s.floats < 4) return 'fisherNeeds';
      s.fisherOk = true; s.hasPaddle = false;
      if (!s.tideLow) { s.boardBack = true; return 'fisherGoes'; }
      return 'fisherWaits';
    case 'board': if (!s.boardBack || s.hasBoard) return 'nothing'; s.hasBoard = true; return 'gotBoard';
    case 'owner': if (s.bulbsIn) return 'nothing'; if (s.bulbs < 4) return 'needBulbs'; s.bulbsIn = true; return 'bulbsIn';
    case 'j1': case 'j2': case 'j3': { const i = +what[1] - 1; s.J[i] = (s.J[i] + 1) % 4; return wired(s) ? 'wired' : 'turned'; }
    case 'gen':
      if (s.won) return 'nothing';
      if (!s.bulbsIn) return 'genNoBulbs';
      if (!wired(s)) return 'genNoWire';
      s.won = true; return 'win';
  }
  return 'nothing';
}

export function objective(s) {
  if (s.won) return 'The street is alight. Take a seat and watch the evening.';
  if (s.player === 'B_point') return 'Tap the tuk-tuk to ride up the red road to the main street.';
  if (areaOf(s.player) === 1) {
    if (s.hasBoard) return s.tideLow ? 'Bring the tide back in (moon-stone dial), then tap the wave to surf.' : 'Tap the glowing wave in the bay to paddle out and surf it to the surf point.';
    if (s.boardBack) return 'Your surfboard is back on the sand. Pick it up.';
    if (s.fisherOk) return 'The fisherman is ready. He needs the tide in to float his canoe.';
    const parts = [];
    if (s.floats < 4) parts.push(`find the fisherman's orange net floats (${s.floats}/4)`);
    if (!s.hasPaddle) parts.push('find his lost paddle');
    if (!parts.length) return 'Take the paddle and floats back to the fisherman.';
    const t = parts.join(', and '); return t[0].toUpperCase() + t.slice(1) + '.';
  }
  if (s.player === 'B_point') return 'Tap the tuk-tuk to ride up the red road to the main street.';
  const parts = [];
  if (!s.bulbsIn) parts.push(s.bulbs < 4 ? `find bulbs for the café's string lights (${s.bulbs}/4)` : 'give the bulbs to the café owner');
  if (!wired(s)) parts.push('turn the three junction boxes so the cable runs to every café');
  if (!parts.length) return 'Pull the generator cord.';
  const t = 'Power cut! ' + parts.join(', and '); return t + '.';
}
