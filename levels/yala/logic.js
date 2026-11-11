// Chapter III: Yala. Pure level logic (no rendering), shared with the solver.
// Area 1: the red tracks (morning). Read the signs (footprints, broken branches) and listen at each crossroads to follow
//         the lost calf's trail; the calf then follows you; leave it standing on the lever stone to hold the river bridge down.
// Area 2: the waterholes (golden hour). The ranger radios a bearing and a description; find the right herd by
//         counting tracks from the lone tree and counting elephants.

const V3 = (x, y, z) => [x, y, z];

// ---- area 1: a grid of red dirt crossroads. Junction J<c><r>: x = -6 + 4c, z = -4 + 4r (r = 2 is the front row)
const J = (c, r) => V3(-6 + 4 * c, 0.06, -4 + 4 * r);
// ---- area 2: the waterhole plain, a grid of tracks around the lone tree. North is -z, east is +x.
export const A2C = V3(18.4, 0, -18.4);
export const GRID = 2.2;
const B = (deg, r) => { const a = deg * Math.PI / 180; return V3(A2C[0] + Math.sin(a) * r, 0.06, A2C[2] - Math.cos(a) * r); }; // bearing from the lone tree: 0 = north, 90 = east
const W = (e, n) => V3(A2C[0] + e * GRID, 0.06, A2C[2] - n * GRID); // e tracks east, n tracks north of the lone tree

export const NODES = {
  J00: J(0, 0), J10: J(1, 0), J20: J(2, 0), J30: J(3, 0),
  J01: J(0, 1), J11: J(1, 1), J21: J(2, 1), J31: J(3, 1),
  J02: J(0, 2), J12: J(1, 2), J22: J(2, 2), J32: J(3, 2),
  G_pool: V3(2, 0.06, 7.6),
  G_bear: V3(-9.2, 0.06, -4), G_buff: V3(-2, 0.06, -8.2), G_calf: V3(6, 0.06, -8.2), G_tusk: V3(9.4, 0.06, 0),
  G_leo: V3(-9.8, 0.06, 0), G_peac: V3(-2, 0.06, 7.9), G_mom: V3(2, 0.06, -8.2), G_kid: V3(-6, 0.06, -8.2), G_kid2: V3(6, 0.06, 7.9), // two more young elephants that are not ours // more wrong trails: a leopard, a peacock, a calf that is with its mother
  B_bank: V3(9.4, 0.06, 4), R_far: V3(14.2, 0.06, 4),
  // area 2
  D: W(0, -2), T: W(0, 0), N1: W(0, 1), N2: W(0, 2.2),
  NEJ: B(42, 4.0), NWJ: B(-48, 4.0),                       // forks in the track
  H1: B(26, 7.4), H2: B(66, 7.4), H3: B(-74, 7.4), H4: B(-16, 7.6), H5: B(108, 7.2), // five waterholes around the plain
  CAMP: W(-2, -1),
};
export const areaOf = (id) => (/^(D|T|N\d|NEJ|NWJ|H\d|CAMP)$/.test(id) ? 2 : 1);
export const HERD_AT = { herd1: 'H1', herd2: 'H2', herd3: 'H3', herd4: 'H4', herd5: 'H5' }; // herd1 (north-east) is the right one

export function initialState() {
  return { player: 'J02', calf: null, /* null (not found) | 'follow' | node id where she told it to stay */ branches: 0, branchTaken: [false, false, false], drank: false, notes: 0, noteTaken: [false, false, false], won: false, has: { leaf: false } };
}
export const bridgeDown = (s) => s.calf === 'B_bank' || s.calf === 'R_far'; // a lever stone on each bank: the calf's weight on either one brings the bridge down // the lever stone needs real weight: only the calf is heavy enough

export function edges(s) {
  const E = []; const line = (a, b, extra = {}) => E.push({ a, b, kind: 'line', ...extra });
  // rows
  line('J02', 'J12'); line('J12', 'J22'); line('J22', 'J32');
  line('J01', 'J11'); line('J11', 'J21'); line('J21', 'J31');
  line('J00', 'J10'); line('J20', 'J30');
  // columns
  line('J02', 'J01'); line('J01', 'J00'); line('J12', 'J11'); line('J11', 'J10'); line('J22', 'J21'); line('J21', 'J20'); line('J32', 'J31'); line('J31', 'J30');
  // dead ends
  line('J00', 'G_bear'); line('J10', 'G_buff'); line('J30', 'G_calf'); line('J31', 'G_tusk'); line('J32', 'B_bank'); line('J22', 'G_pool');
  line('J01', 'G_leo'); line('J12', 'G_peac'); line('J20', 'G_mom'); line('J00', 'G_kid'); line('J32', 'G_kid2');
  if (bridgeDown(s)) line('B_bank', 'R_far', { kind: 'bridge' });
  if (s.calf === 'follow' && s.drank) E.push({ a: 'R_far', b: 'D', kind: 'jeep', ride: true, speed: 6 });
  // area 2
  line('D', 'T'); line('T', 'N1'); line('N1', 'N2'); line('N2', 'H4');
  line('N1', 'NEJ'); line('NEJ', 'H1'); line('NEJ', 'H2'); line('NEJ', 'H5');
  line('N1', 'NWJ'); line('NWJ', 'H3'); line('NWJ', 'H4'); line('D', 'CAMP', { via: [W(-2, -2)] });
  return E;
}
export function adjacency(s) {
  const m = new Map();
  for (const e of edges(s)) for (const [x, y] of [[e.a, e.b], [e.b, e.a]]) { if (!m.has(x)) m.set(x, []); m.get(x).push({ to: y, e }); }
  return m;
}
export function findPath(s, from, to, extra = []) {
  if (from === to) return [from];
  const adj = adjacency(s); for (const [a, b] of extra) { for (const [x, y] of [[a, b], [b, a]]) { if (!adj.has(x)) adj.set(x, []); adj.get(x).push({ to: y, e: { a, b, kind: 'wade' } }); } }
  const prev = new Map([[from, null]]), q = [from];
  while (q.length) { const n = q.shift(); for (const { to: t } of adj.get(n) || []) if (!prev.has(t)) { prev.set(t, n); if (t === to) { const p = [t]; let c = n; while (c) { p.unshift(c); c = prev.get(c); } return p; } q.push(t); } }
  return null;
}
// the calf can wade the river; she can't
export const calfPath = (s, from, to) => findPath(s, from, to, s.drank ? [['B_bank', 'R_far'], ['R_far', 'D']] : [['B_bank', 'R_far']]); // once it has drunk, the ranger will drive back for a calf left by the river

export const SPOTS = { calfFind: 'G_calf', calf: null, pool: 'G_pool', herd1: 'H1', herd2: 'H2', herd3: 'H3', herd4: 'H4', herd5: 'H5' };
// fallen branches (area 1) and sighting slips (area 2) are tapped wherever you see them
export function canTap(s, k) { if (k === 'leaf') return !s.has.leaf; if (k[0] === 'b') return !s.branchTaken[+k[1]]; if (k[0] === 'n') return !s.noteTaken[+k[1]]; return false; }
export function tap(s, k) { if (!canTap(s, k)) return null; if (k === 'leaf') { s.has.leaf = true; return 'leaf'; } if (k[0] === 'b') { s.branchTaken[+k[1]] = true; s.branches++; return 'branch'; } s.noteTaken[+k[1]] = true; s.notes++; return 'note'; }
export const PLATES = {};
export function stepOn() { return null; }

export function interact(s, what) {
  switch (what) {
    case 'br0': case 'br1': case 'br2': { const i = +what[2]; if (s.branchTaken[i]) return 'nothing'; s.branchTaken[i] = true; s.branches++; return 'gotBranch'; }
    case 'calfFind': if (s.calf) return 'nothing'; if (s.branches < 3) return 'needRamp'; s.calf = 'follow'; return 'foundCalf';
    case 'pool': if (s.calf !== 'follow' || s.drank) return s.drank ? 'nothing' : 'poolNoCalf'; s.drank = true; return 'drank';
    case 'calf':
      if (!s.calf) return 'nothing';
      if (s.calf === 'follow') { s.calf = s.player; return 'calfStay'; }
      if (!calfPath(s, s.calf, s.player)) return 'calfCantReach';
      s.calf = 'follow'; return 'calfFollow';
    case 'herd1': case 'herd2': case 'herd3': case 'herd4': case 'herd5':
      if (s.won) return 'nothing';
      if (s.calf !== 'follow') return 'herdNoCalf';
      if (s.notes < 3) return 'needNotes';
      if (what !== 'herd1') return 'wrongHerd';
      s.won = true; return 'win';
  }
  return 'nothing';
}

export function objective(s) {
  if (s.won) return 'The calf is home. Watch the herd at the waterhole as the sun goes down.';
  if (areaOf(s.player) === 2) {
    if (s.calf !== 'follow') return 'Call the calf to you, then find its herd.';
    if (s.notes < 3) return `The radio said “north-east of the lone tree”. Find the rangers’ sighting slips for the rest of the description (${s.notes}/3).`;
    return 'Find the calf’s herd: north-east of the lone tree, seven elephants, two little ones, and a matriarch with a torn left ear.';
  }
  if (!s.calf) return s.branches < 3 && s.player === 'G_calf' ? `The calf is stuck in the gully. Find fallen branches to build a ramp (${s.branches}/3).` : `Follow the lost calf’s trail: read the signs at each crossroads, and listen.${s.branches ? ` Branches for a ramp: ${s.branches}/3.` : ''}`;
  if (!s.drank) return 'The calf is weak and thirsty. Lead it to the rock pool for a drink before the long walk.';
  if (s.player === 'R_far') return s.calf === 'follow' ? 'Tap the ranger’s jeep to drive to the waterholes.' : 'Call the calf across the river (tap it), then take the jeep.';
  if (bridgeDown(s)) return 'The calf is holding the bridge down. Cross the river.';
  return 'The ranger waits across the river. The old bridge only lowers while something heavy stands on its lever stone.';
}
