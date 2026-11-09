// Chapter V: Sigiriya, "The Lion Rock". Pure level logic, shared with the solver.
// Area 1, the water gardens (morning): her reflection walks the mirrored half of the garden; both must stand on the
//   twin lotus stones at once to open the sluice house. Four valves set three fountains to the heights on the stone.
// Area 2, the Mirror Wall (midday): two perspective stairways that only join in one view each, the painter's cloth
//   in the fresco pocket, polishing the wall, bronze mirrors that bounce the sun onto the three painted maidens.
// Area 3, the Lion Gate and the summit (golden hour): hornet nests along the climb (wait out the wind), the palace
//   terraces that turn to make both a walk to the throne and a channel for the cistern water, the sluice stone
//   (stand-on), and the flower offering in the order the maidens stand.

const V3 = (x, y, z) => [x, y, z];
export const C2 = V3(15, 6, -15), C3 = V3(30, 12, -30);
const a2 = (x, y, z) => V3(C2[0] + x, C2[1] + y, C2[2] + z);
const a3 = (x, y, z) => V3(C3[0] + x, C3[1] + y, C3[2] + z);

/* ---------- area 1: the mirrored garden ---------- */
export const GC = 4, GR = 5;                         // garden cells: c = 0 by the pool .. 3 outer; r = 0 far (north) .. 4 near
export const cellPos = (c, r, side = -1) => V3(side * (1.5 + c * 1.5), 0.06, -3 + r * 1.5);
export const P_BLOCK = ['1,3', '3,2', '0,1', '2,3'];  // her side: a fallen pillar, a frangipani, a lotus pond, a boulder
export const T_BLOCK = ['3,1', '0,3', '2,3'];         // the reflection's side has different obstacles
export const P_PLATE = [1, 0], T_PLATE = [2, 0], G_START = [1, 4];
export const cellId = (c, r) => `g${c}${r}`;
const isCell = (id) => /^g\d\d$/.test(id);
const cellOf = (id) => [+id[1], +id[2]];

// fountains: four valves, three fountains; the carved stone shows the heights to make
export const VALVES = [[2, 0, 1], [1, 1, 0], [0, 2, 1], [1, 0, 2]];
export const FTARGET = [6, 5, 6];
export const VALVE_MODES = ['shut', 'half', 'full']; // each valve turns shut → half → full → shut
export const fountains = (v) => [0, 1, 2].map((j) => VALVES.reduce((a, row, i) => a + v[i] * row[j], 0));
export const fountainsOk = (s) => fountains(s.V).every((h, j) => h === FTARGET[j]);

/* ---------- area 2: the Mirror Wall ---------- */
export const LW = 8, LH = 5;                       // light grid: gy 0 = under the frescoes, gy 4 = the Mirror Wall
export const lightPos = (gx, gy, y = 0) => a2((gx - 3.5) * 1.3, y, (gy - 2) * 1.3);
export const SUN = [8, 3, -1, 0];                  // the beam enters from the east along row 3
export const MAIDENS = [[6, 0], [3, 0], [1, 0]];   // east to west
export const FLOWERS = ['jasmine', 'lotus', 'lily']; // what each maiden holds (index = maiden)
export const MIRRORS = [[6, 3], [4, 3], [2, 3], [3, 3]];   // bronze mirrors: 0 '/', 1 '\', 2 edge-on (the beam passes)
export const WALLS = [[6, 4, '/'], [3, 4, '\\'], [2, 4, '/'], [1, 4, '\\']]; // Mirror Wall panels (must be polished)
export const ROCKS = [[2, 1], [5, 3]];
const refl = (t, dx, dy) => (t === '/' ? [-dy, -dx] : t === '\\' ? [dy, dx] : [dx, dy]);
export function trace(s) {
  let [x, y, dx, dy] = SUN; const path = [[x, y]];
  for (let n = 0; n < 60; n++) {
    x += dx; y += dy; if (x < 0 || x >= LW || y < 0 || y >= LH) { path.push([x, y]); return { lit: null, path }; }
    path.push([x, y]);
    const m = MAIDENS.findIndex((p) => p[0] === x && p[1] === y); if (m >= 0) return { lit: m, path };
    if (ROCKS.some((p) => p[0] === x && p[1] === y)) return { lit: null, path, stop: 'rock' };
    const mi = MIRRORS.findIndex((p) => p[0] === x && p[1] === y); if (mi >= 0) { [dx, dy] = refl(['/', '\\', '|'][s.M[mi]], dx, dy); continue; }
    const wi = WALLS.findIndex((p) => p[0] === x && p[1] === y); if (wi >= 0) { if (!s.pol[wi]) return { lit: null, path, stop: 'dull' }; [dx, dy] = refl(WALLS[wi][2], dx, dy); continue; }
  }
  return { lit: null, path };
}
// views: 0 is the opening view; the camera turns in quarter steps. Two stairways only meet in one view each.
export const V_UP = 1, V_DOWN = 2;

/* ---------- area 3: the summit terraces ---------- */
// sides: N 1, E 2, S 4, W 8 (north = towards the throne). Masks are in the solved orientation; a turn is 90° clockwise.
export const rotMask = (m, r) => { r = ((r % 4) + 4) % 4; return ((m << r) | (m >> (4 - r))) & 15; };
export const TILES = [ // [col, row, path, channel, turns, startTurn]
  [0, 0, 0, 0, false, 0], [1, 0, 5, 0, true, 1], [2, 0, 0, 6, true, 2],
  [0, 1, 0, 6, true, 1], [1, 1, 5, 10, true, 1], [2, 1, 0, 9, true, 3],
  [0, 2, 0, 9, true, 2], [1, 2, 5, 0, true, 1], [2, 2, 0, 0, false, 0],
];
export const tilePos = (i, j) => a3((i - 1) * 2.4, 7, -12 + j * 2.4);
export const tileId = (i, j) => `t${i}${j}`;
const tileAt = (s, i, j) => { const k = j * 3 + i; const t = TILES[k]; return { path: rotMask(t[2], s.T[k]), chan: rotMask(t[3], s.T[k]) }; };
const DIRS = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]];
function tileConn(s, key, start, startSide, end, endSide) {
  if (!(tileAt(s, ...start)[key] & startSide)) return false; const seen = new Set([start.join()]); const q = [start];
  while (q.length) { const [x, y] = q.shift(); if (x === end[0] && y === end[1] && (tileAt(s, x, y)[key] & endSide)) return true;
    for (const [dx, dy, a, b] of DIRS) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx > 2 || ny > 2) continue;
      if ((tileAt(s, x, y)[key] & a) && (tileAt(s, nx, ny)[key] & b) && !seen.has(nx + ',' + ny)) { seen.add(nx + ',' + ny); q.push([nx, ny]); } } }
  return false;
}
export const waterLinked = (s) => tileConn(s, 'chan', [2, 0], 2, [0, 2], 8);   // cistern (east of the top-right terrace) to the outlet (west of the bottom-left)
export const waterFlows = (s) => s.sluice && waterLinked(s);
export const FLOWER_ORDER = [2, 1, 0]; // offer them as the maidens stand along the wall, from the lion end (west) to the sunrise end (east)

// the stair from the gallery gate round the west end of the rock, behind it, and up to the lion platform
export const CLIMB2 = [a2(-8.4, 0.6, 0.2), a2(-9.6, 1.6, -2.6), a2(-10.2, 2.8, -8.0), a2(-9.2, 3.6, -12.6), V3(15.0, 9.8, -29.4), V3(22.0, 11.0, -30.6), V3(26.4, 11.8, -29.6)];
export const NODES = {
  E_start: V3(-3.0, 0.06, 5.6),
  VAL: V3(-1.5, 0.06, -5.4), BRG: V3(0, 0.36, -5.4), GATE1: V3(4.6, 0.06, -5.4),
  S_base: a2(7.4, 0, 3.0), S_mid: a2(6.2, 1.8, -1.2), S_mid2: a2(8.0, 3.6, -3.0), POCKET: a2(3.6, 3.6, -3.4), P_end: a2(-3.0, 3.6, -3.4),
  L_mid: a2(0.6, 0, 0.2), GATE2: a2(-6.6, 0, 0.6),
  LION: a3(0, 0, 1.8), ST1: a3(0, 1.6, -2.7), ST2: a3(6.25, 4.6, -10.0), SUM_IN: a3(0, 7, -5.0), CIS: a3(2.6, 7, -5.0), THRONE: a3(0, 7, -14.6),
};
for (let c = 0; c < GC; c++) for (let r = 0; r < GR; r++) NODES[cellId(c, r)] = cellPos(c, r);
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) NODES[tileId(i, j)] = tilePos(i, j);
export const areaOf = (id) => (/^(S_|POCKET|P_end|L_mid|GATE2)/.test(id) ? 2 : /^(LION|ST\d|SUM_IN|CIS|THRONE|t\d\d)$/.test(id) ? 3 : 1);

export function initialState() {
  return {
    player: 'E_start', view: 0, twin: [...G_START], gardenOpen: false, V: [0, 0, 0, 0], gate1: false,
    cloth: false, pol: [false, false, false, false], M: [2, 2, 2, 2], lit: [false, false, false], gate2: false,
    T: TILES.map((t) => t[5]), sluice: false, offered: [], won: false, verses: [false, false, false], has: { leaf: false },
  };
}

export function edges(s) {
  const E = []; const line = (a, b, extra = {}) => E.push({ a, b, kind: 'line', ...extra });
  // the mirrored garden: her cells are linked where neither end is blocked
  const free = (c, r) => c >= 0 && c < GC && r >= 0 && r < GR && !P_BLOCK.includes(c + ',' + r);
  for (let c = 0; c < GC; c++) for (let r = 0; r < GR; r++) { if (!free(c, r)) continue;
    if (free(c + 1, r)) line(cellId(c, r), cellId(c + 1, r), { kind: 'cell' }); if (free(c, r + 1)) line(cellId(c, r), cellId(c, r + 1), { kind: 'cell' }); }
  line('E_start', cellId(...G_START));
  if (s.gardenOpen) { line(cellId(0, 0), 'VAL'); line('VAL', 'BRG'); line('BRG', 'GATE1'); }
  if (s.gate1) line('GATE1', 'S_base', { kind: 'climb', via: [V3(7.4, 1.4, -8.4), V3(10.6, 3.6, -10.6), V3(13.8, 5.6, -11.2)] });
  // Mirror Wall: the two perspective joins
  line('S_base', 'S_mid', { kind: 'stair' });
  if (s.view === V_UP) line('S_mid', 'S_mid2', { kind: 'illusion', speed: 40 });
  line('S_mid2', 'POCKET'); line('POCKET', 'P_end');
  if (s.view === V_DOWN) line('P_end', 'L_mid', { kind: 'illusion', speed: 60 });
  line('L_mid', 'GATE2');
  if (s.gate2) line('GATE2', 'LION', { kind: 'climb', via: CLIMB2 });
  // Lion Gate and summit
  line('LION', 'ST1', { kind: 'stair' });
  // the iron stair winds up the rock: along the south face, round the corner, up the east face, then zigzags back to the top
  line('ST1', 'ST2', { kind: 'hornet', via: [a3(3.0, 2.3, -3.3), a3(5.3, 3.0, -4.7), a3(6.3, 3.8, -7.4)] }); line('ST2', 'SUM_IN', { kind: 'hornet', via: [a3(6.7, 5.6, -7.2), a3(5.9, 6.5, -4.9), a3(4.3, 7, -5.9)] }); line('SUM_IN', 'CIS');
  if (tileAt(s, 1, 2).path & 4) line('SUM_IN', tileId(1, 2), { kind: 'tile' });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (const [dx, dy, a, b] of DIRS.slice(1, 3)) { const ni = i + dx, nj = j + dy; if (ni > 2 || nj > 2) continue;
    if ((tileAt(s, i, j).path & a) && (tileAt(s, ni, nj).path & b)) line(tileId(i, j), tileId(ni, nj), { kind: 'tile' }); }
  if (tileAt(s, 1, 0).path & 1) line(tileId(1, 0), 'THRONE', { kind: 'tile' });
  return E;
}
export function adjacency(s) { const m = new Map(); for (const e of edges(s)) for (const [x, y] of [[e.a, e.b], [e.b, e.a]]) { if (!m.has(x)) m.set(x, []); m.get(x).push({ to: y, e }); } return m; }
export function findPath(s, from, to) {
  if (from === to) return [from]; const adj = adjacency(s), prev = new Map([[from, null]]), q = [from];
  while (q.length) { const n = q.shift(); for (const { to: t } of adj.get(n) || []) if (!prev.has(t)) { prev.set(t, n); if (t === to) { const p = [t]; let c = n; while (c) { p.unshift(c); c = prev.get(c); } return p; } q.push(t); } }
  return null;
}

// her reflection copies every step she takes on the garden grid; it stays put if its own way is blocked
export function mirrorStep(s, from, to) {
  if (!isCell(from) || !isCell(to) || s.gardenOpen) return null;
  const [c0, r0] = cellOf(from), [c1, r1] = cellOf(to); const tc = s.twin[0] + (c1 - c0), tr = s.twin[1] + (r1 - r0);
  const ok = tc >= 0 && tc < GC && tr >= 0 && tr < GR && !T_BLOCK.includes(tc + ',' + tr);
  if (ok) s.twin = [tc, tr];
  if (c1 === P_PLATE[0] && r1 === P_PLATE[1] && s.twin[0] === T_PLATE[0] && s.twin[1] === T_PLATE[1]) { s.gardenOpen = true; return 'gardenOpen'; }
  return ok ? 'twinMoved' : 'twinBlocked';
}
export const PLATES = { CIS: 'sluice' };
export function stepOn(s, node) { if (!PLATES[node]) return null; s.sluice = !s.sluice; return { k: 'sluice', on: s.sluice, flows: waterFlows(s) }; }

export const SPOTS = {
  pool: null, v0: 'VAL', v1: 'VAL', v2: 'VAL', v3: 'VAL',
  cloth: 'POCKET', w0: 'L_mid', w1: 'L_mid', w2: 'L_mid', w3: 'L_mid', m0: 'L_mid', m1: 'L_mid', m2: 'L_mid', m3: 'L_mid',
  fl_jasmine: 'THRONE', fl_lotus: 'THRONE', fl_lily: 'THRONE', fl_araliya: 'THRONE',
};
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) SPOTS['turn' + i + j] = null; // turned from anywhere on the summit

export function interact(s, what) {
  if (what === 'pool') { // still the water: the reflection steps back level with her
    if (s.gardenOpen || !isCell(s.player)) return 'nothing'; const [c, r] = cellOf(s.player); if (T_BLOCK.includes(c + ',' + r)) return 'poolBlocked';
    if (s.twin[0] === c && s.twin[1] === r) return 'nothing'; s.twin = [c, r]; return 'poolReset'; }
  if (/^v\d$/.test(what)) { const i = +what[1]; const was = fountainsOk(s); s.V[i] = (s.V[i] + 1) % 3; if (fountainsOk(s) && !s.gate1) { s.gate1 = true; return 'gate1'; } return was !== fountainsOk(s) ? 'valve' : 'valve'; }
  if (what === 'cloth') { if (s.cloth) return 'nothing'; s.cloth = true; return 'gotCloth'; }
  if (/^w\d$/.test(what)) { const i = +what[1]; if (s.pol[i]) return 'nothing'; if (!s.cloth) return 'wallDull'; s.pol[i] = true; return lightUp(s, 'polished'); }
  if (/^m\d$/.test(what)) { const i = +what[1]; s.M[i] = (s.M[i] + 1) % 3; return lightUp(s, 'mirror'); }
  if (/^turn\d\d$/.test(what)) {
    if (areaOf(s.player) !== 3) return 'nothing'; const i = +what[4], j = +what[5], k = j * 3 + i; if (!TILES[k][4]) return 'tileFixed';
    if (s.player === tileId(i, j)) return 'tileUnderFoot'; const was = waterFlows(s); s.T[k] = (s.T[k] + 1) % 4; return !was && waterFlows(s) ? 'waterOn' : was && !waterFlows(s) ? 'waterOff' : 'turned'; }
  if (what.startsWith('fl_')) { if (s.won) return 'nothing'; const f = what.slice(3); const want = FLOWERS[FLOWER_ORDER[s.offered.length]];
    if (f !== want) { s.offered = []; return 'offerWrong'; }
    s.offered.push(f); if (s.offered.length < 3) return 'offerOk';
    if (!waterFlows(s)) { s.offered = []; return 'offerDry'; } s.won = true; return 'win'; }
  return 'nothing';
}
function lightUp(s, r) { const t = trace(s); if (t.lit !== null && !s.lit[t.lit]) { s.lit[t.lit] = true; if (s.lit.every(Boolean)) { s.gate2 = true; return 'gate2'; } return 'maidenLit'; } return r; }

// graffiti verses on the outer face of the Mirror Wall (seen only from behind) and the ola-leaf page on the summit
export function canTap(s, k) { if (k[0] === 'q') return !s.verses[+k[1]]; if (k === 'leaf') return !s.has.leaf; return false; }
export function tap(s, k) { if (!canTap(s, k)) return null; if (k === 'leaf') { s.has.leaf = true; return 'leaf'; } s.verses[+k[1]] = true; return 'verse'; }

export function objective(s) {
  if (s.won) return 'The cistern water runs down the rock to the gardens below. Every fountain is playing.';
  const a = areaOf(s.player);
  if (a === 3) {
    if (s.player === 'LION' || s.player === 'ST1' || s.player === 'ST2') return 'Climb between the lion’s paws. When the wind gongs ring the hornets wake: wait on a landing until it passes.';
    const walk = !!findPath(s, 'SUM_IN', 'THRONE');
    if (!walk || !waterLinked(s)) return 'Turn the palace terraces so there is a walk to the throne AND a channel from the cistern to the outlet. (Tap a terrace to turn it; not the one you stand on.)';
    if (!s.sluice) return 'Both routes are set. Stand on the sluice stone to release the cistern.';
    return 'The water is flowing. At the throne, offer the three flowers in the order the maidens stand along the wall, from the lion end.';
  }
  if (a === 2) {
    if (!s.cloth) return s.player === 'S_base' || s.player === 'S_mid' ? 'The iron stair stops short of the fresco pocket. Turn the view until the two flights line up, then climb.' : 'Fetch the painter’s cloth from the fresco pocket.';
    if (areaOf(s.player) === 2 && /POCKET|P_end|S_mid2/.test(s.player)) return 'Back down to the Mirror Wall: the pocket ledge meets the gallery in just one view.';
    if (s.gate2) return 'The gallery gate is open! Tap the glowing gate at the end of the gallery, then the lantern-lit steps, to climb to the Lion Rock.';
    const n = s.lit.filter(Boolean).length, np = s.pol.filter(Boolean).length;
    if (np < 4) return `Polish the Mirror Wall with the cloth: tap each glowing brown panel on the low front wall (${np}/4 polished). Then turn the bronze mirrors to light the maidens (${n}/3).`;
    return `Bounce the sun onto the painted maidens (${n}/3): tap a bronze mirror to turn it (flat → / → \\ → flat).`;
  }
  if (s.gate1) return 'The boulder gate is open. Climb up to the Mirror Wall.';
  if (s.gardenOpen) return `Set the four valves (shut, half or full) so the three fountains reach the heights carved on the stone (${FTARGET.join(' · ')}).`;
  if (s.player === 'E_start') return 'Walk into the water garden. Your reflection walks the other half.';
  return 'Stand on your lotus stone while your reflection stands on its own. It copies each step, unless its way is blocked. Tap the pool to bring it back level with you.';
}
