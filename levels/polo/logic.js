// Pure level logic: path graph for the Vatadage level. No rendering here.
export const SLOTS = 8;
export const STEP = Math.PI / 4; // 45 degrees per slot

// Concentric terraces. G = ground (fixed), A = lower terrace, B = pillar terrace.
export const RINGS = {
  G: { r: 7.9, y: 0.0, inner: 6.6, outer: 9.6, rotates: false, broken: [] },
  A: { r: 5.5, y: 1.2, inner: 4.4, outer: 6.6, rotates: true, broken: [2, 5] }, // edges 2-3 and 5-6 collapsed
  B: { r: 3.4, y: 2.4, inner: 2.4, outer: 4.4, rotates: true, broken: [1, 5] }, // edges 1-2 and 5-6 collapsed
};
export const CENTER = { r: 2.05, y: 3.6, slot: 5 }; // altar node at the back of the dagoba

export const RAMP_SLOT = 6;     // fixed guardstone stair from ground to terrace A
export const A_STAIR_LOCAL = 0; // stair carried by terrace A (down to ground)
export const B_STAIR_LOCAL = 0; // stair carried by terrace B (down to terrace A)

export function initialState() {
  return {
    rot: { G: 0, A: 4, B: 1 },
    player: 'P_start',
    // area 1: temple grounds
    flags: 0, boVisited: false, flagsHung: false, sluiceOpen: false, hasPot: false, boWatered: false, gateOpen: false, boStair: false,
    has: { lamp: false, banana: false, oil: false, leaf: false },
    lotus: 0,
    offered: false,  // lotuses placed at flower altar -> terrace A can turn
    monkeyFed: false, // monkey leaves the guardstone stair
    lit: false,
  };
}

// ---------------- Area 1: the temple grounds (Dalada Maluwa) ----------------
// A second floating island in front of the Vatadage. Positions are world coordinates.
export const GROUNDS_C = (() => { const a = Math.PI / 4, r = 24.5; return [r * Math.sin(a), 0, r * Math.cos(a)]; })();
const gp = (r, deg, y = 0) => { const a = (deg * Math.PI) / 180; return [GROUNDS_C[0] + r * Math.sin(a), y, GROUNDS_C[2] + r * Math.cos(a)]; };
const add = (p, q) => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];
export const POND_C = gp(5.3, 135);
export const GN = {
  P_start: gp(7.4, 45), P_x: gp(0, 0), P_flag: gp(4.6, 225), P_gate: gp(7.9, 225),
  P_boFoot: gp(2.5, 315), P_bo: gp(4.35, 315, 0.7),
  P_pondEdge: gp(2.55, 135), P_pad: add(gp(3.95, 135), [0, -0.06, 0]), P_islet: add(gp(5.3, 135), [0, 0.12, 0]),
  P_sluice: add(POND_C, gp(3.35, 45).map((v, i) => v - GROUNDS_C[i])),
};
const sluiceCorner = add(GN.P_pondEdge, gp(2.9, 45).map((v, i) => v - GROUNDS_C[i]));
export function groundEdges(s) {
  const e = [
    { a: 'P_start', b: 'P_x' }, { a: 'P_x', b: 'P_flag' }, { a: 'P_flag', b: 'P_gate' },
    { a: 'P_x', b: 'P_boFoot' },
    { a: 'P_x', b: 'P_pondEdge' }, { a: 'P_pondEdge', b: 'P_sluice', via: [sluiceCorner] },
  ];
  if (s.boStair) e.push({ a: 'P_boFoot', b: 'P_bo', stair: true });
  if (s.sluiceOpen) e.push({ a: 'P_pondEdge', b: 'P_pad' }, { a: 'P_pad', b: 'P_islet' });
  if (s.gateOpen) e.push({ a: 'P_gate', b: 'G1', causeway: true });
  return e.map((x) => ({ ...x, kind: 'line' }));
}

export const ringOf = (id) => (id === 'C' ? 'C' : id[0]);
export const localOf = (id) => (id === 'C' ? 0 : +id.slice(1));
const mod = (n) => ((n % SLOTS) + SLOTS) % SLOTS;
export const worldSlot = (s, id) => (id === 'C' ? CENTER.slot : mod(localOf(id) + s.rot[ringOf(id)]));
export const nodeAtWorld = (s, ring, w) => ring + mod(w - s.rot[ring]);

export function canRotate(s, ring) {
  if (ring === 'A') return s.offered;
  if (ring === 'B') return s.has.oil;
  return false;
}

// Edges: {a, b, kind} where kind is 'arc' | 'stair'. Stairs carry geometry info.
export function edges(s) {
  const out = [];
  for (const R of ['G', 'A', 'B']) {
    for (let i = 0; i < SLOTS; i++) {
      if (RINGS[R].broken.includes(i)) continue;
      out.push({ a: R + i, b: R + mod(i + 1), kind: 'arc' });
    }
  }
  // Terrace A's own stair, down to the ground ring
  const wA = mod(A_STAIR_LOCAL + s.rot.A);
  out.push({ a: 'A' + A_STAIR_LOCAL, b: 'G' + wA, kind: 'stair', upper: 'A', lower: 'G', w: wA });
  // Fixed guardstone stair at RAMP_SLOT (blocked by the monkey until fed)
  if (s.monkeyFed) out.push({ a: nodeAtWorld(s, 'A', RAMP_SLOT), b: 'G' + RAMP_SLOT, kind: 'stair', upper: 'A', lower: 'G', w: RAMP_SLOT });
  // Terrace B's own stair, down to terrace A (folded away until the terrace awakens)
  const wB = mod(B_STAIR_LOCAL + s.rot.B);
  if (s.has.oil) out.push({ a: 'B' + B_STAIR_LOCAL, b: nodeAtWorld(s, 'A', wB), kind: 'stair', upper: 'B', lower: 'A', w: wB });
  // Fixed stair from terrace B up to the dagoba platform
  out.push({ a: 'C', b: nodeAtWorld(s, 'B', CENTER.slot), kind: 'stair', upper: 'C', lower: 'B', w: CENTER.slot });
  out.push(...groundEdges(s));
  return out;
}

export function adjacency(s) {
  const m = new Map();
  const add = (x, y, e) => { if (!m.has(x)) m.set(x, []); m.get(x).push({ to: y, e }); };
  for (const e of edges(s)) { add(e.a, e.b, e); add(e.b, e.a, e); }
  return m;
}

export function findPath(s, from, to) {
  if (from === to) return [from];
  const adj = adjacency(s);
  const prev = new Map([[from, null]]);
  const q = [from];
  while (q.length) {
    const n = q.shift();
    for (const { to: t } of adj.get(n) || []) {
      if (prev.has(t)) continue;
      prev.set(t, n);
      if (t === to) {
        const path = [t];
        let c = n;
        while (c) { path.unshift(c); c = prev.get(c); }
        return path;
      }
      q.push(t);
    }
  }
  return null;
}

export function reachable(s, from = s.player) {
  const adj = adjacency(s);
  const seen = new Set([from]);
  const q = [from];
  while (q.length) for (const { to } of adj.get(q.shift()) || []) if (!seen.has(to)) { seen.add(to); q.push(to); }
  return seen;
}

// Interactable spots the player must walk to (node ids; A-nodes are local, so items ride the terrace)
export const SPOTS = {
  lamp: 'G7',    // clay lamp (pahana) on a stone stand
  altar: 'G3',   // flower altar (mal asanaya)
  monkey: 'G6',  // temple monkey sitting on the guardstone stair
  banana: 'A7',  // bunch of bananas left as an offering
  oil: 'A4',     // clay pot of coconut oil
  dagoba: 'C',   // lamp altar at the dagoba
  sluice: 'P_sluice', pot: 'P_islet', bo: 'P_bo', flagline: 'P_flag',
};

// Apply arriving at a spot. Returns a message key.
// Stand-on switches: arriving at a node can change the world.
export const PLATES = { P_islet: 'boStair' };
// Two of the five flags are caught in the bo tree; they come loose the first time she reaches it (one-way story beat).
export const flagsFree = (s) => (s.boVisited ? 5 : 3);
export function arriveAt(s, node) {
  if (node === 'P_bo' && !s.boVisited) { s.boVisited = true; return 'flagsDrop'; }
  return null;
}
// Plates toggle: step on once to activate, step on again to undo (true for every level).
export function stepOn(s, node) {
  const k = PLATES[node]; if (!k) return null;
  if (s[k]) return null; // once raised, the bo tree stair stays up (visiting the islet again no longer lowers it)
  s[k] = true; return { k, on: true };
}

export function interact(s, what) {
  switch (what) {
    case 'sluice': s.sluiceOpen = !s.sluiceOpen; return s.sluiceOpen ? 'sluiceOpened' : 'sluiceClosed'; // reversible
    case 'pot': if (s.hasPot || s.boWatered) return 'nothing'; s.hasPot = true; return 'gotPot';
    case 'bo':
      if (s.boWatered) return 'nothing';
      if (!s.hasPot) return 'needPot';
      s.hasPot = false; s.boWatered = true; return openGate(s) ? 'wateredGate' : 'watered';
    case 'flagline':
      if (s.flagsHung) return 'nothing';
      if (s.flags < 5) return 'needFlags';
      s.flagsHung = true; return openGate(s) ? 'hungGate' : 'hung';
    case 'lamp': if (s.has.lamp) return 'nothing'; s.has.lamp = true; return 'gotLamp';
    case 'banana': if (s.has.banana || s.monkeyFed) return 'nothing'; s.has.banana = true; return 'gotBanana';
    case 'altar':
      if (s.offered) return 'altarDone';
      if (s.lotus < 3) return 'needLotus';
      s.offered = true; return 'offered';
    case 'monkey':
      if (s.monkeyFed) return 'nothing';
      if (!s.has.banana) return 'monkeyHungry';
      s.has.banana = false; s.monkeyFed = true; return 'monkeyFed';
    case 'oil':
      if (s.has.oil) return 'nothing';
      if (!s.has.lamp) return 'needLamp';
      s.has.oil = true; return 'gotOil';
    case 'dagoba':
      if (s.lit) return 'nothing';
      if (!s.has.lamp) return 'needLampAltar';
      if (!s.has.oil) return 'needOil';
      s.lit = true; return 'win';
  }
  return 'nothing';
}

function openGate(s) { if (s.boWatered && s.flagsHung && !s.gateOpen) { s.gateOpen = true; return true; } return false; }

export function objective(s) {
  if (!s.gateOpen) {
    const parts = [];
    if (!s.flagsHung) parts.push(s.flags < 5 ? (s.flags >= 3 && !s.boVisited ? `find the scattered Buddhist flags (${s.flags}/5): the wind may have caught the last ones up high` : `find the scattered Buddhist flags (${s.flags}/5)`) : 'tie the flags back on the empty line by the gate');
    if (!s.boWatered) parts.push(s.hasPot ? (s.boStair ? 'pour the water at the bo tree (bodhi puja)' : 'find a way up the bo tree terrace') : s.sluiceOpen ? 'cross the lily pads to fetch the water pot' : 'the bo tree is thirsty: find a way to bring it water');
    return cap(parts.join(', and ')) + '.';
  }
  if (ringOf(s.player) === 'P') return 'Cross the causeway to the Stupa House.';
  if (s.lit) return 'The lamp burns at the dagoba. Polonnaruwa is at peace.';
  if (!s.offered) {
    const parts = [];
    if (s.lotus < 3) parts.push(`find the hidden lotus flowers (${s.lotus}/3)`);
    else parts.push('offer the lotuses at the flower altar');
    if (!s.has.lamp) parts.push('pick up the clay lamp');
    return cap(parts.join(', and ')) + '.';
  }
  if (!s.has.lamp) return 'Pick up the clay lamp from its stand.';
  if (!s.has.oil) {
    if (!s.monkeyFed) return s.has.banana ? 'Give the bananas to the monkey on the guardstone stair.' : 'The monkey guards the stair. Find something to tempt it.';
    return 'Turn the lower terrace to reach the pot of coconut oil.';
  }
  return 'Carry the lit lamp to the altar behind the dagoba.';
}
const cap = (t) => t[0].toUpperCase() + t.slice(1);
