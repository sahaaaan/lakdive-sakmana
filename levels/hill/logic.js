// Chapter IV: Ella, "The First Flush". Pure level logic, shared with the solver.
// Area 1, the tea estate (misty morning): perfect shoots, moving mist, the weighing shed, the ropeway (stand-on),
//   water gates to power the factory wheel, the factory machines in the right order, blending the auction chests.
// Area 2, Nine Arch Bridge (afternoon): the timetable question at the bridge gate, the interlocking lever frame,
//   two trains on one line (the passing loop), the waterfall secret, the blue train leaving at sunset.

const V3 = (x, y, z) => [x, y, z];
export const A2C = V3(19.5, 0, -19.5);
export const RAVINE = 4.2; // half-width of the ravine under Nine Arch Bridge (area-2 local x)
const a2 = (x, z, y = 0.06) => V3(A2C[0] + x, y, A2C[2] + z);

export const NODES = {
  // estate: flat front with the lake, channels and factory; three terraces rising to the back
  E_start: V3(-6.5, 0.06, 7), LAKE: V3(-6.2, 0.06, 3.2), G2: V3(-1.2, 0.06, 4.8), G3: V3(-1.2, 0.06, 1.6),
  F_door: V3(4.6, 0.06, 3.4), F_yard: V3(6.6, 0.06, 7.0),
  T1: V3(-3.4, 0.86, -0.8), T2: V3(-4.2, 1.66, -3.8), T3: V3(-4.6, 2.46, -6.8), R_top: V3(1.6, 2.46, -6.8), P_cw: V3(3.4, 2.46, -6.8),
  // Nine Arch Bridge: near side (halt, gate), the viaduct, far side (signal box, waterfall)
  L_drop: a2(-9.6, 3.4), H: a2(-8.0, 0.2), GATE: a2(-5.6, -1.0), BR_a: a2(-4.7, -1.0), BR_b: a2(4.7, -1.0),
  SB: a2(6.8, -3.9), WF: a2(6.0, -7.4), WF_cave: a2(7.6, -8.8),
};
export const areaOf = (id) => (/^(L_drop|H|GATE|BR_a|BR_b|SB|WF|WF_cave)$/.test(id) ? 2 : 1);

export const SACKS = [3, 4, 5, 6, 7, 8];          // kg; the first-flush basket weighs 2 kg, the scale wants 20
export const BASKET = 2, TARGET = 20;
export const STAGES = ['Withering', 'Rolling', 'Oxidising', 'Drying', 'Sorting'];
export const GRADES = ['B', 'F', 'D', 'N'];     // BOP, FBOP, Dust, Fannings
export const TIMES = { tA: '3:10', tB: '3:22', tC: '3:34' }; // the red local leaves Ella 3:10 and takes 12 minutes to reach the bridge

export function initialState() {
  return {
    player: 'E_start', shoots: 0, shootTaken: [false, false, false, false, false, false],
    pan: [false, false, false, false, false, false], weighed: false, hooked: false, rope: false, sackDown: false,
    G: [0, 0, 0], slots: [2, 0, 4, 1, 3], made: false, blend: { B: 0, F: 0, D: 0, N: 0 }, chests: false,
    gateOpen: false, Lv: [0, 0, 0, 0], phase: 'start', won: false, has: { leaf: false },
  };
}

// ---- water: the reservoir gives 4 units. Gate 1: 0 = all into the upper channel, 1 = split 2/2 upper/lower.
//      Gate 2 (upper): 0 = all to the wheel, 1 = all to the nursery, 2 = split half/half. Gate 3 (lower): 0 = wheel, 1 = nursery.
export function flows(G) {
  const up = G[0] === 0 ? 4 : 2, low = G[0] === 0 ? 0 : 2;
  let wheel = 0, nursery = 0;
  if (G[1] === 0) wheel += up; else if (G[1] === 1) nursery += up; else { wheel += up / 2; nursery += up / 2; }
  if (G[2] === 0) wheel += low; else nursery += low;
  return { up, low, wheel, nursery };
}
export const powered = (s) => { const f = flows(s.G); return f.wheel >= 3 && f.nursery >= 1; };
export const GATE_MODES = [2, 3, 2];
export const panWeight = (s) => SACKS.reduce((a, w, i) => a + (s.pan[i] ? w : 0), 0) + (s.shoots >= 6 ? BASKET : 0);
export const orderRight = (s) => s.slots.every((v, i) => v === i);
export const blendTotal = (b) => b.B + b.F + b.D + b.N;
export const blendOk = (b) => blendTotal(b) === 9 && b.B === 2 * b.F && b.D <= 2 && b.N === 0;

// ---- interlocking lever frame: 1 points (normal = main line, reversed = into the loop), 2 facing point lock,
//      3 loop signal (for the red local), 4 platform signal (for the blue express)
export function leverFree(s, i) {
  const [p, l, sg3, sg4] = s.Lv;
  switch (i) {
    case 0: return !l && !sg3 && !sg4;              // points can't move while locked or a signal is off
    case 1: return !sg3 && !sg4;                    // the lock can't come off while a signal is off
    case 2: return sg3 ? true : p === 1 && l === 1 && !sg4; // loop signal needs points into the loop, locked
    case 3: return sg4 ? true : p === 0 && l === 1 && !sg3; // platform signal needs points on the main line, locked
  }
  return false;
}

export function edges(s) {
  const E = []; const line = (a, b, extra = {}) => E.push({ a, b, kind: 'line', ...extra });
  line('E_start', 'LAKE'); line('LAKE', 'G2', { via: [V3(-4, 0.06, 4.6)] }); line('G2', 'G3'); line('G2', 'F_door', { via: [V3(2.4, 0.06, 4.6)] }); line('F_door', 'F_yard');
  line('LAKE', 'T1', { via: [V3(-5.6, 0.06, 1.0), V3(-4.6, 0.86, 0.2)] });
  line('T1', 'T2', { kind: 'mist', mist: 0 }); line('T2', 'T3', { kind: 'mist', mist: 1 });
  line('T3', 'R_top'); line('R_top', 'P_cw');
  if (s.chests) E.push({ a: 'F_yard', b: 'L_drop', kind: 'lorry', ride: true, speed: 6 });
  line('L_drop', 'H'); line('H', 'GATE'); line('GATE', 'BR_a');
  if (s.gateOpen) line('BR_a', 'BR_b', { kind: 'viaduct' });
  line('BR_b', 'SB', { via: [a2(5.8, -2.6)] }); line('BR_b', 'WF', { via: [a2(4.8, -3.0), a2(4.8, -6.0)] }); line('WF', 'WF_cave', { kind: 'spray' });
  return E;
}
export function adjacency(s) { const m = new Map(); for (const e of edges(s)) for (const [x, y] of [[e.a, e.b], [e.b, e.a]]) { if (!m.has(x)) m.set(x, []); m.get(x).push({ to: y, e }); } return m; }
export function findPath(s, from, to) {
  if (from === to) return [from]; const adj = adjacency(s), prev = new Map([[from, null]]), q = [from];
  while (q.length) { const n = q.shift(); for (const { to: t } of adj.get(n) || []) if (!prev.has(t)) { prev.set(t, n); if (t === to) { const p = [t]; let c = n; while (c) { p.unshift(c); c = prev.get(c); } return p; } q.push(t); } }
  return null;
}

export const SPOTS = {
  sack0: 'T3', sack1: 'T3', sack2: 'T3', sack3: 'T3', sack4: 'T3', sack5: 'T3', hook: 'R_top',
  g1: 'LAKE', g2: 'G2', g3: 'G3', st0: 'F_door', st1: 'F_door', st2: 'F_door', st3: 'F_door', st4: 'F_door', run: 'F_door',
  binB: 'F_yard', binF: 'F_yard', binD: 'F_yard', binN: 'F_yard', binClear: 'F_yard', seal: 'F_yard',
  tA: 'GATE', tB: 'GATE', tC: 'GATE', L1: 'SB', L2: 'SB', L3: 'SB', L4: 'SB', flag: 'H', leaf: 'WF_cave',
};
export const PLATES = { P_cw: 'rope' };
export function stepOn(s, node) { // the ropeway counterweight: step on to send the hook down, again to bring it back up
  if (!PLATES[node]) return null; s.rope = !s.rope; let sent = false; if (s.rope && s.hooked && !s.sackDown) { s.sackDown = true; sent = true; } return { k: 'rope', on: s.rope, sent };
}
// perfect shoots (two leaves and a bud) are tapped where you see them; the wrong shoots just get a gentle "no"
export function canTap(s, k) { if (k[0] === 's') return !s.shootTaken[+k[1]]; return false; }
export function tap(s, k) { if (!canTap(s, k)) return null; s.shootTaken[+k[1]] = true; s.shoots++; return 'shoot'; }

export function interact(s, what) {
  if (/^sack\d$/.test(what)) { if (s.weighed) return 'nothing'; const i = +what[4]; s.pan[i] = !s.pan[i];
    if (panWeight(s) === TARGET && s.shoots >= 6) { s.weighed = true; return 'balanced'; } return s.shoots >= 6 ? 'pan' : 'panNoBasket'; }
  switch (what) {
    case 'hook': if (!s.weighed) return 'hookEmpty'; if (s.hooked || s.sackDown) return 'nothing'; if (s.rope) return 'hookDown'; s.hooked = true; return 'hooked';
    case 'g1': case 'g2': case 'g3': { const i = +what[1] - 1; s.G[i] = (s.G[i] + 1) % GATE_MODES[i]; return powered(s) ? 'gatePower' : 'gate'; }
    case 'st0': case 'st1': case 'st2': case 'st3': case 'st4': { if (s.made) return 'nothing'; const i = +what[2]; s.slots[i] = (s.slots[i] + 1) % 5; return 'stage'; }
    case 'run': if (s.made) return 'nothing'; if (!s.sackDown) return 'runNoLeaf'; if (!powered(s)) return 'runNoPower'; if (!orderRight(s)) return 'runWrongOrder'; s.made = true; return 'made';
    case 'binB': case 'binF': case 'binD': case 'binN': if (!s.made || s.chests) return s.made ? 'nothing' : 'binsEmpty'; if (blendTotal(s.blend) >= 9) return 'binsFull'; s.blend[what[3]]++; return 'fill';
    case 'binClear': if (!s.made || s.chests) return 'nothing'; s.blend = { B: 0, F: 0, D: 0, N: 0 }; return 'cleared';
    case 'seal': if (!s.made || s.chests) return s.made ? 'nothing' : 'binsEmpty'; if (!blendOk(s.blend)) return 'sealWrong'; s.chests = true; return 'sealed';
    case 'tA': case 'tB': case 'tC': if (s.gateOpen) return 'nothing'; if (!s.chests) return 'nothing'; if (what !== 'tB') return 'wrongTime'; s.gateOpen = true; return 'gateOpen';
    case 'L1': case 'L2': case 'L3': case 'L4': {
      const i = +what[1] - 1; if (s.phase === 'expressIn') return 'nothing'; if (!leverFree(s, i)) return 'locked';
      s.Lv[i] = 1 - s.Lv[i];
      if (i === 2 && s.Lv[2] === 1 && s.phase === 'start') { s.phase = 'localIn'; return 'localIn'; }
      if (i === 3 && s.Lv[3] === 1) { if (s.phase === 'start') { s.Lv[3] = 0; return 'standoff'; } if (s.phase === 'localIn') { s.phase = 'expressIn'; return 'expressIn'; } }
      return 'lever'; }
    case 'flag': if (s.won) return 'nothing'; if (s.phase !== 'expressIn') return 'flagNoTrain'; s.won = true; return 'win';
    case 'leaf': if (s.has.leaf) return 'nothing'; s.has.leaf = true; return 'leaf';
  }
  return 'nothing';
}

export function objective(s) {
  if (s.won) return 'The first flush is on its way to Colombo. Watch the blue train cross the arches.';
  if (areaOf(s.player) === 2) {
    if (!s.gateOpen) return 'The gatekeeper won’t open the bridge until you tell him when the next train passes. Read the timetable board.';
    if (s.phase === 'start') return 'In the signal box, route the red local into the passing loop and hold it there.';
    if (s.phase === 'localIn') return 'The local is in the loop. Now set the route for the blue express to stop at the halt platform.';
    return 'The express is at the platform with your tea chests aboard. Go back to the halt and wave the guard’s flag.';
  }
  if (s.chests) return 'The chests are sealed. Ride the estate lorry to the Nine Arch halt.';
  if (s.made) return 'Blend the auction chests from the grade bins: follow the broker’s order letter, then seal them.';
  if (s.sackDown) {
    const parts = []; if (!powered(s)) parts.push('set the three water gates so the wheel gets at least 3 and the nursery 1'); if (!orderRight(s)) parts.push('put the five machines in the right order'); parts.push('then start the factory');
    return 'The leaf is at the factory: ' + parts.join(', ') + '.';
  }
  if (s.hooked) return 'Step onto the ropeway counterweight platform to send the leaf down to the factory.';
  if (s.weighed) return 'Hook the weighed leaf onto the ropeway.';
  if (s.shoots < 6) return `Pick the first flush: only perfect shoots, two leaves and a bud (${s.shoots}/6). Mist drifts across the upper terraces.`;
  return 'Weigh the day’s leaf at the shed on the top terrace: the beam must balance at exactly 20 kg.';
}
