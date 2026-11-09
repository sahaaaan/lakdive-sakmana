// Animation for the heroine rig: IK-driven legs and arms, layered body motion,
// and spring physics for hair and skirt. Shared by every outfit (same bone names).
import * as THREE from 'three';

export const CLIPS = { idle: 4, walk: 1.0, pickup: 2.2, place: 2.4, wave: 1.6 };
export const STRIDE = 0.26;          // foot travel per step, in character heights
const STANCE = 0.6;                   // fraction of the cycle a foot is on the ground
export const WALK_SPEED = STRIDE / (STANCE * CLIPS.walk); // move the character at this speed (heights / s) so feet don't slide

const V = () => new THREE.Vector3(), Qn = () => new THREE.Quaternion();
const E = new THREE.Euler(), D = new THREE.Quaternion();
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

// world rotation that turns the bone's rest frame (restAxis, restPole, in skeleton space) into (axis, pole) in world space
function frameQuat(a0, p0, a1, p1) {
  const basis = (a, p) => { const z = a.clone().normalize(); const x = p.clone().addScaledVector(z, -p.dot(z)).normalize(); const y = z.clone().cross(x); return new THREE.Matrix4().makeBasis(x, y, z); };
  const m0 = basis(a0, p0), m1 = basis(a1, p1);
  return Qn().setFromRotationMatrix(m1.multiply(m0.transpose()));
}
function setWorldQuat(bone, qw) { const pq = bone.parent.getWorldQuaternion(Qn()); bone.quaternion.copy(pq.invert().multiply(qw)); bone.updateMatrixWorld(true); }
const wpos = (b) => b.getWorldPosition(V());

// analytic two-bone IK (thigh/shin, upper arm/forearm). All vectors in world space.
function twoBone(upper, lower, end, target, pole, restAxis, restPole) {
  const A = wpos(upper), B0 = wpos(lower), C0 = wpos(end);
  const l1 = A.distanceTo(B0), l2 = B0.distanceTo(C0);
  const dir = target.clone().sub(A); const d = clamp(dir.length(), 1e-4, (l1 + l2) * 0.9995); dir.normalize();
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), sinA = Math.sqrt(1 - cosA * cosA);
  const perp = pole.clone().addScaledVector(dir, -pole.dot(dir)).normalize();
  const B = A.clone().addScaledVector(dir, l1 * cosA).addScaledVector(perp, l1 * sinA);
  const C = A.clone().addScaledVector(dir, d);
  setWorldQuat(upper, frameQuat(restAxis, restPole, B.clone().sub(A), pole));
  setWorldQuat(lower, frameQuat(restAxis, restPole, C.clone().sub(B), pole));
  return { knee: B };
}

// Pose the rig for `clip` at time `t`. Targets are given in the character's own space
// (feet at y=0, facing +Z) and converted to world space here.
export function pose(rig, clip, t, opts = {}) {
  const B = rig.bones, L = rig.landmarks || {};
  const root = B.root; root.parent.updateMatrixWorld(true);
  const rootM = root.parent.matrixWorld.clone().multiply(root.matrix);
  const rootQ = Qn(); rootM.decompose(V(), rootQ, V());
  const toW = (v) => v.clone().applyMatrix4(rootM);
  const dirW = (v) => v.clone().applyQuaternion(rootQ);
  for (const b of Object.values(B)) b.quaternion.identity();
  const hip0 = B.hips.userData.world ? new THREE.Vector3().copy(B.hips.userData.world) : B.hips.position.clone();
  if (!B.hips.userData.rest) B.hips.userData.rest = hip0.clone();
  const hipRest = B.hips.userData.rest;
  const legX = Math.abs((B.thighL.userData.world && B.thighL.userData.world.x) || 0.053);
  const ankle = (B.footL.userData.world && B.footL.userData.world.y) || 0.045;

  // ---------- body (FK) ----------
  const body = { x: 0, y: 0, z: 0, pitch: 0, yaw: 0, roll: 0, spine: 0, spineYaw: 0, chest: 0, chestYaw: 0, headPitch: 0, headYaw: 0, headRoll: 0, spineRoll: 0 };
  const feet = { L: { pos: new THREE.Vector3(legX, ankle, 0.0), pitch: 0, toe: 0 }, R: { pos: new THREE.Vector3(-legX, ankle, 0.0), pitch: 0, toe: 0 } };
  const armsFK = { L: { swing: 0, down: 1.4, out: 0.04, elbow: 0.25, twist: 0 }, R: { swing: 0, down: 1.4, out: 0.04, elbow: 0.25, twist: 0 } };
  const handsIK = { L: null, R: null }; // { pos, w }
  let kneeOut = 0.12;

  if (clip === 'idle') {
    const p = (t / CLIPS.idle) * Math.PI * 2; const s = Math.sin(p);
    body.x = s * 0.016; body.y = -0.006 - Math.abs(s) * 0.004; body.roll = -s * 0.03; body.spineRoll = s * 0.035;
    body.chest = Math.sin(p * 2) * 0.02; body.headYaw = Math.sin(p + 0.7) * 0.22; body.headPitch = Math.sin(p * 2 + 1) * 0.03; body.headRoll = -s * 0.04;
    feet.L.pos.set(legX * 1.15, ankle, 0.015); feet.R.pos.set(-legX * 1.15, ankle, -0.01);
    armsFK.L.swing = Math.sin(p * 2) * 0.025; armsFK.R.swing = -Math.sin(p * 2) * 0.025;
  } else if (clip === 'walk') {
    const ph = t / CLIPS.walk; const P = ph * Math.PI * 2;
    for (const [side, off, sg] of [['L', 0, 1], ['R', 0.5, -1]]) {
      const u = (ph + off) % 1; const f = feet[side];
      let z, lift = 0, pitch = 0, toe = 0;
      if (u < STANCE) { // planted: slides back under the moving body
        const k = u / STANCE; z = lerp(STRIDE / 2, -STRIDE / 2, k);
        pitch = k < 0.12 ? lerp(-0.32, 0, smooth(0, 0.12, k)) : k > 0.7 ? lerp(0, 0.55, smooth(0.7, 1, k)) : 0; // heel strike → flat → heel off
        toe = k > 0.7 ? -pitch * 0.9 : 0;
      } else { // swing: arcs forward
        const k = (u - STANCE) / (1 - STANCE); const e = smooth(0, 1, k);
        z = lerp(-STRIDE / 2, STRIDE / 2, e); lift = Math.sin(k * Math.PI) * 0.05 + (k < 0.3 ? 0.02 * smooth(0, 0.3, k) : 0.02 * (1 - smooth(0.3, 1, k)));
        pitch = lerp(0.5, -0.3, smooth(0, 0.85, k)); toe = k < 0.25 ? -0.3 * (1 - k / 0.25) : 0;
      }
      // when the heel lifts, the ankle rises
      const heelUp = pitch > 0 ? Math.sin(pitch) * 0.07 : 0;
      f.pos.set(sg * legX * 0.95, ankle + lift + heelUp, z); f.pitch = pitch; f.toe = toe;
    }
    const c2 = Math.cos(P * 2);
    body.y = -0.016 + 0.009 * -c2 * -1; // low at contact, high at passing
    body.y = -0.012 - 0.009 * c2;
    body.yaw = 0.14 * Math.sin(P); body.roll = 0.045 * Math.sin(P - 0.4); body.x = -0.01 * Math.sin(P);
    body.pitch = 0.04; body.spineYaw = -body.yaw * 0.55; body.chestYaw = -body.yaw * 0.55; body.headYaw = -body.yaw * 0.15; body.spineRoll = -body.roll * 0.7;
    body.chest = -0.03;
    const sw = Math.sin(P - 0.35);
    armsFK.L.swing = -0.42 * sw; armsFK.R.swing = 0.42 * sw;
    armsFK.L.elbow = 0.3 + Math.max(0, -sw) * 0.45; armsFK.R.elbow = 0.3 + Math.max(0, sw) * 0.45;
    armsFK.L.out = armsFK.R.out = 0.06;
  } else if (clip === 'pickup' || clip === 'place') {
    const T = CLIPS[clip];
    // reach target in character space (defaults to the floor just in front); higher targets need less crouch
    const R = opts.reach ? new THREE.Vector3(opts.reach.x, opts.reach.y, opts.reach.z) : new THREE.Vector3(0.04, 0.15, 0.27);
    R.z = clamp(R.z, 0.12, 0.34); R.x = clamp(R.x, -0.12, 0.12);
    const depth = clamp((0.62 - R.y) / 0.47, 0.15, 1);
    const down = depth * (clip === 'pickup' ? smooth(0.35, 1.0, t) * (1 - smooth(1.25, 1.85, t)) : smooth(0.4, 1.1, t) * (1 - smooth(1.4, 2.05, t)));
    const look = clip === 'pickup' ? smooth(0.0, 0.4, t) * (1 - smooth(1.6, 2.1, t)) : smooth(0.3, 0.7, t) * (1 - smooth(1.6, 2.2, t));
    // crouch: hips back and down, pelvis and back curl forward, head finds the object
    body.y = -0.21 * down; body.z = -0.08 * down; body.pitch = 0.38 * down; body.spine = 0.45 * down; body.chest = 0.28 * down;
    body.headPitch = 0.45 * look - 0.55 * down; body.x = 0.012 * down; body.roll = -0.03 * down;
    feet.L.pos.set(legX * 1.25, ankle, 0.05); feet.R.pos.set(-legX * 1.15, ankle, -0.06);
    feet.R.pitch = 0.35 * down; feet.R.toe = -0.32 * down; feet.R.pos.y += Math.sin(0.35 * down) * 0.06; // back heel lifts as she sinks
    const bowOnly = 1 - depth; body.spine += 0.25 * bowOnly * (down > 0 ? 1 : 0) * (clip === 'pickup' ? smooth(0.35, 1.0, t) * (1 - smooth(1.25, 1.85, t)) : smooth(0.4, 1.1, t) * (1 - smooth(1.4, 2.05, t))); // waist-high: a small bow instead of a crouch
    kneeOut = 0.25 + 0.2 * down;
    const ground = R.clone();
    if (clip === 'pickup') {
      const reach = smooth(0.45, 1.0, t) * (1 - smooth(1.15, 1.7, t)); const carry = smooth(1.15, 1.7, t) * (1 - smooth(1.85, 2.2, t));
      const chestHold = new THREE.Vector3(0.07, 0.6, 0.17);
      if (reach > 0.001 || carry > 0.001) {
        const p = carry > 0 ? ground.clone().lerp(chestHold, smooth(1.15, 1.7, t)) : ground;
        handsIK.R = { pos: p, w: Math.max(reach, carry) };
      }
      handsIK.L = { knee: true, w: down * 0.9 };
    } else {
      const hold = 1 - smooth(1.1, 1.6, t); const set = smooth(0.4, 1.0, t);
      const chestHold = (s) => new THREE.Vector3(s * 0.065, 0.58, 0.17), groundAt = (s) => R.clone().add(new THREE.Vector3(s * 0.05, 0, 0));
      const w = smooth(0, 0.3, t) * (1 - smooth(1.35, 1.9, t));
      for (const [side, s] of [['L', 1], ['R', -1]]) {
        const p = hold > 0.001 ? chestHold(s).lerp(groundAt(s), set) : groundAt(s).lerp(new THREE.Vector3(s * 0.12, 0.3, 0.12), smooth(1.1, 1.6, t));
        handsIK[side] = { pos: p, w };
      }
    }
  } else if (clip === 'wave') {
    const k = smooth(0, 0.3, t) * (1 - smooth(1.25, 1.6, t));
    armsFK.L.down = 1.4 - 2.42 * k; armsFK.L.elbow = 0.22 + 0.55 * k; armsFK.L.twist = Math.sin(t * 14) * 0.35 * k;
    body.headRoll = 0.12 * k; body.headYaw = 0.18 * k; body.x = -0.012 * k; body.roll = 0.03 * k; body.spineRoll = -0.04 * k;
    feet.L.pos.set(legX * 1.1, ankle, 0.0); feet.R.pos.set(-legX * 1.1, ankle, 0.0);
  }

  // carrying something in the right hand (lamp): hold it up in front while idling or walking
  if (opts.carry && (clip === 'idle' || clip === 'walk' || clip === 'wave') && !handsIK.R) {
    const bob = clip === 'walk' ? Math.sin((t / CLIPS.walk) * Math.PI * 4) * 0.008 : 0;
    handsIK.R = { pos: new THREE.Vector3(-0.035, 0.53 + body.y + bob, 0.17), w: opts.carry === true ? 1 : opts.carry };
  }

  // apply body
  B.hips.position.copy(hipRest).add(new THREE.Vector3(body.x, body.y, body.z));
  B.hips.quaternion.setFromEuler(E.set(body.pitch, body.yaw, body.roll, 'YXZ'));
  B.spine.quaternion.setFromEuler(E.set(body.spine * 0.55, body.spineYaw, body.spineRoll, 'YXZ'));
  B.chest.quaternion.setFromEuler(E.set(body.spine * 0.45 + body.chest, body.chestYaw, 0, 'YXZ'));
  root.updateMatrixWorld(true);
  // head: keep the gaze level-ish (counter the trunk), then add look
  const trunkPitch = body.pitch + body.spine + body.chest;
  B.neck.quaternion.setFromEuler(E.set(-trunkPitch * 0.3 + body.headPitch * 0.4, body.headYaw * 0.4 - (body.yaw + body.spineYaw + body.chestYaw) * 0.4, body.headRoll * 0.4 - (body.roll + body.spineRoll) * 0.4, 'YXZ'));
  B.head.quaternion.setFromEuler(E.set(-trunkPitch * 0.3 + body.headPitch * 0.6, body.headYaw * 0.6 - (body.yaw + body.spineYaw + body.chestYaw) * 0.4, body.headRoll * 0.6 - (body.roll + body.spineRoll) * 0.4, 'YXZ'));
  root.updateMatrixWorld(true);

  // ---------- legs (IK) ----------
  const legSwing = {};
  for (const [side, sg] of [['L', 1], ['R', -1]]) {
    const f = feet[side];
    const pole = dirW(new THREE.Vector3(sg * kneeOut, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), body.yaw * 0.6));
    const { knee } = twoBone(B['thigh' + side], B['shin' + side], B['foot' + side], toW(f.pos), pole, new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 1));
    setWorldQuat(B['foot' + side], rootQ.clone().multiply(Qn().setFromEuler(E.set(f.pitch, 0, 0))));
    B['toe' + side].quaternion.setFromEuler(E.set(f.toe, 0, 0)); B['toe' + side].updateMatrixWorld(true);
    // forward swing of the thigh in character space (for the skirt)
    const hipP = wpos(B['thigh' + side]); const d = knee.clone().sub(hipP).applyQuaternion(rootQ.clone().invert());
    legSwing[side] = Math.atan2(d.z, -d.y);
    if (handsIK.L && handsIK.L.knee && side === 'L') handsIK.L.pos = knee.clone().applyMatrix4(rootM.clone().invert()).add(new THREE.Vector3(0.03, 0.05, -0.01));
  }

  // ---------- arms: FK hang/swing, blended toward IK targets ----------
  for (const [side, sg] of [['L', 1], ['R', -1]]) {
    const a = armsFK[side];
    const qDown = Qn().setFromEuler(E.set(0, 0, -sg * (a.down - a.out)));
    const qSwing = Qn().setFromEuler(E.set(a.swing, a.twist * sg, 0));
    B['upperArm' + side].quaternion.copy(qSwing).multiply(qDown);
    B['foreArm' + side].quaternion.setFromEuler(E.set(0, -sg * a.elbow, 0));
    B['hand' + side].quaternion.setFromEuler(E.set(0, 0, -sg * 0.12));
    const ik = handsIK[side];
    if (ik && ik.pos && ik.w > 0.001) {
      root.updateMatrixWorld(true);
      const fk = [B['upperArm' + side].quaternion.clone(), B['foreArm' + side].quaternion.clone()];
      const pole = dirW(new THREE.Vector3(sg * 0.6, -0.35, -1));
      twoBone(B['upperArm' + side], B['foreArm' + side], B['hand' + side], toW(ik.pos), pole, new THREE.Vector3(sg, 0, 0), new THREE.Vector3(0, -0.35, -1));
      B['upperArm' + side].quaternion.copy(fk[0].slerp(B['upperArm' + side].quaternion, ik.w));
      B['foreArm' + side].quaternion.copy(fk[1].slerp(B['foreArm' + side].quaternion, ik.w));
      B['hand' + side].quaternion.setFromEuler(E.set(0, 0, -sg * (0.12 + 0.5 * ik.w)));
    }
  }

  // ---------- skirt: hangs by gravity, follows the knees, pools on the floor ----------
  const SK = L.SK ?? Object.keys(B).filter((n) => /^skirt\d+_0$/.test(n)).length;
  const invRoot = rootM.clone().invert();
  const swMax = Math.max(legSwing.L, legSwing.R);
  for (let k = 0; k < SK; k++) {
    const ang = (k / SK) * Math.PI * 2; const side = Math.sin(ang), front = Math.cos(ang);
    const b0 = B[`skirt${k}_0`], b1 = B[`skirt${k}_1`], b2 = B[`skirt${k}_2`];
    const sw = side > 0.25 ? legSwing.L : side < -0.25 ? legSwing.R : (legSwing.L + legSwing.R) / 2;
    const follow = front > 0.3 ? 0.72 : front < -0.3 ? 0.25 : 0.55;
    const s = front > 0.3 ? Math.max(sw, swMax * 0.5) : sw;
    let rx = -body.pitch - s * follow;
    if (front < -0.3) rx += Math.max(0, swMax) * 0.15;
    // how much room is there between this panel's waist point and the floor?
    const top = wpos(b0).applyMatrix4(invRoot);
    const l1 = b1.position.length(), l2 = b2.position.length();
    const lift = Math.abs(rx) > 0.05 ? (l1 + l2) * (1 - Math.cos(Math.min(1.2, Math.abs(rx)))) : 0; // the leg-follow already raises the hem a bit
    const room = top.y - 0.012 + lift;
    let flare = 0;
    if (l1 + l2 > room) { // solve l1 cos(f) + l2 cos(f/2) = room
      let lo = 0, hi = 1.45; for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; (l1 * Math.cos(m) + l2 * Math.cos(m * 0.5) > room) ? (lo = m) : (hi = m); } flare = lo;
    }
    const tangent = new THREE.Vector3(Math.cos(ang), 0, -Math.sin(ang));
    const qFollow = Qn().setFromEuler(E.set(rx, 0, -body.roll * 0.8 * (Math.abs(side) > 0.3 ? 1 : 0)));
    b0.quaternion.copy(qFollow).multiply(Qn().setFromAxisAngle(tangent, -flare));
    const drape = front > 0.3 ? Math.max(0, s) * 0.55 : Math.abs(side) > 0.3 ? Math.max(0, s) * 0.3 : 0;
    b1.quaternion.setFromEuler(E.set(drape, 0, 0)).multiply(Qn().setFromAxisAngle(tangent, flare * 0.5));
  }
  root.updateMatrixWorld(true);
}

// Apply a rotation on top of whatever the animation set this frame. AnimationMixer skips re-writing
// unchanged values, so remember what we wrote and recover the animation's base from it.
function applyDelta(bone, delta) {
  const u = bone.userData; if (!u._base) { u._base = Qn(); u._out = Qn(); u._has = false; }
  if (!u._has || !bone.quaternion.equals(u._out)) u._base.copy(bone.quaternion);
  bone.quaternion.copy(u._base).multiply(delta); u._out.copy(bone.quaternion); u._has = true;
}

// ---- secondary motion: damped springs on hair and skirt chains ----
export class Secondary {
  constructor(rig) {
    this.rig = rig; this.prev = null; this.vel = V(); this.acc = V(); this.prevChest = null;
    this.hair = ['hairL', 'hairC', 'hairR'].map((n) => ({ n, x: 0, z: 0, vx: 0, vz: 0 }));
    const SK = rig.landmarks.SK; this.skirt = []; for (let k = 0; k < SK; k++) this.skirt.push({ k, a: (k / SK) * Math.PI * 2, x: 0, z: 0, vx: 0, vz: 0 });
  }
  update(dt, obj) {
    if (dt <= 0) return; dt = Math.min(dt, 1 / 30);
    const B = this.rig.bones; const p = wpos(B.hips); const c = wpos(B.head);
    if (this.prev) { const v = p.clone().sub(this.prev).divideScalar(dt); this.acc.lerp(v.clone().sub(this.vel).divideScalar(dt), 0.5); this.vel.copy(v); }
    // head motion drives the hair (bobbing, turning, bending)
    let headAcc = V(); if (this.prevChest) { const hv = c.clone().sub(this.prevChest).divideScalar(dt); headAcc = hv.clone().sub(this.headVel || hv).divideScalar(dt); this.headVel = hv; }
    this.prev = p; this.prevChest = c;
    const inv = obj.getWorldQuaternion(Qn()).invert();
    const a = this.acc.clone().applyQuaternion(inv).clampLength(0, 20), ha = headAcc.applyQuaternion(inv).clampLength(0, 30), vl = this.vel.clone().applyQuaternion(inv);
    const step = (s, tx, tz, k, d) => { s.vx += (k * (tx - s.x) - d * s.vx) * dt; s.vz += (k * (tz - s.z) - d * s.vz) * dt; s.x += s.vx * dt; s.z += s.vz * dt; };
    // keep hair hanging down when the head tilts: counter the head's pitch/roll
    const hq = B.head.getWorldQuaternion(Qn()).premultiply(inv); const he = new THREE.Euler().setFromQuaternion(hq, 'YXZ');
    for (const h of this.hair) {
      const tx = -he.x * 0.55 + 0.1 * clamp(vl.z / 1.2, -1, 1) - ha.z * 0.01 - ha.y * 0.006;
      const tz = -he.z * 0.5 - ha.x * 0.008 + (h.n === 'hairL' ? 0.03 : h.n === 'hairR' ? -0.03 : 0);
      step(h, tx, tz, 70, 8);
      applyDelta(B[h.n + '1'], D.setFromEuler(E.set(h.x * 0.55, 0, h.z * 0.55)));
      applyDelta(B[h.n + '2'], D.setFromEuler(E.set(h.x * 0.6, 0, h.z * 0.6)));
    }
    for (const s of this.skirt) {
      const front = Math.cos(s.a), side = Math.sin(s.a);
      const tx = -a.z * 0.012 + 0.07 * clamp(vl.z / 1.2, -1, 1) * (front > 0 ? 0.6 : 1) - a.y * 0.004;
      const tz = -a.x * 0.01 * Math.sign(side || 1);
      step(s, tx, tz, 120, 11);
      applyDelta(B[`skirt${s.k}_0`], D.setFromEuler(E.set(s.x * 0.8, 0, s.z)));
      applyDelta(B[`skirt${s.k}_1`], D.setFromEuler(E.set(s.x * 0.4, 0, s.z * 0.4)));
    }
  }
}

// Bake the clips into AnimationClips (for GLB export / any engine).
export function bakeClips(rig, fps = 30) {
  const clips = [];
  for (const [name, dur] of Object.entries(CLIPS)) {
    const frames = Math.round(dur * fps) + 1; const times = []; const tracks = new Map();
    for (let f = 0; f < frames; f++) {
      const t = (f / (frames - 1)) * dur; times.push(t); pose(rig, name, name === 'walk' || name === 'idle' ? t % dur : t);
      for (const b of Object.values(rig.bones)) {
        if (!tracks.has(b.name)) tracks.set(b.name, { q: [], p: [] });
        const tr = tracks.get(b.name); tr.q.push(...b.quaternion.toArray()); if (b.name === 'hips') tr.p.push(...b.position.toArray());
      }
    }
    const kt = [];
    for (const [n, tr] of tracks) { kt.push(new THREE.QuaternionKeyframeTrack(`${n}.quaternion`, times, tr.q)); if (tr.p.length) kt.push(new THREE.VectorKeyframeTrack(`${n}.position`, times, tr.p)); }
    clips.push(new THREE.AnimationClip(name, dur, kt));
  }
  pose(rig, 'idle', 0);
  return clips;
}
