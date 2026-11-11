// Chapter I: Hiriketiya. Scene, story beats, hints. The rules live in logic.js (shared with the solver).
import * as L from './logic.js';
import HERO_GLB from './heroine.js';

const PAL = {
  sand: 0xf3dcb0, sandWet: 0xd9bf8f, grass: 0x7fa25a, grassDark: 0x5f8645, rock: 0x8f8579, rockDark: 0x6f665c,
  water: 0x3fc1b8, deep: 0x1f8fa0, foam: 0xffffff, wood: 0x9a6a44, woodDark: 0x6e4a30, thatch: 0xc9a465,
  palm: 0x4f8a43, palmDark: 0x3d6f36, trunk: 0x8c7356, orange: 0xff7a2e, red: 0xa8432f, earth: 0xb5643c,
  white: 0xf7f3eb, plaster: 0xece6dc, brick: 0xb8735a, asphalt: 0x5d5752, kerb: 0xcfc6b8, blue: 0x2e6db4, cream: 0xf4e7c8,
};
const svg = (paths) => paths.map((p) => { const [d, c] = p.split('#'); return `<path d="${d}" fill="#${c}"/>`; }).join('');
const ICONS = {
  float: ['M16 6a8 8 0 100 16 8 8 0 100-16z#ff7a2e', 'M8 14h16v2H8z#ffffff'],
  paddle: ['M15 3h2v16h-2z#9a6a44', 'M12 18h8l-1 11h-6z#c98b55'],
  board: ['M16 2c5 6 5 22 0 28-5-6-5-22 0-28z#f2d36b', 'M15.4 4h1.2v24h-1.2z#c8423b'],
  bulb: ['M16 4a8 8 0 00-5 14c1 1 1.5 2 1.5 3h7c0-1 .5-2 1.5-3A8 8 0 0016 4z#ffd45a', 'M12.5 23h7v4h-7z#8a8a8a'],
  wave: ['M3 20c4-6 8-6 12 0s8 6 14 0v8H3z#3fc1b8', 'M3 18c4-6 8-6 12 0#ffffff'],
  bolt: ['M18 3L7 18h7l-2 11 11-16h-7z#f2c12e'],
  moon: ['M20 4a12 12 0 100 24A10 10 0 0120 4z#e8dcb8'],
};
const SLOTS = [
  { id: 'float', title: 'Net floats', svg: svg(ICONS.float), count: true },
  { id: 'paddle', title: 'Canoe paddle', svg: svg(ICONS.paddle) },
  { id: 'board', title: 'Your surfboard', svg: svg(ICONS.board) },
  { id: 'bulb', title: 'Light bulbs', svg: svg(ICONS.bulb), count: true },
  { id: 'leaf', title: 'Ola-leaf page (secret)', svg: '<rect x="3" y="12" width="26" height="8" rx="2" fill="#d9be8a"/><path d="M6 15h18M6 17.5h14" stroke="#8a6a44" stroke-width="1"/>' },
];
const CSS = `body.hiri{--sky-top:#f6c99a;--sky-mid:#fbe2bf;--sky-bot:#a9dcd6;--accent:#d06a3a}
body.hiri.dusk{--sky-top:#2c2a52;--sky-mid:#7b4a6e;--sky-bot:#e98a4f;--card:rgba(255,248,240,.84)}
body.hiri.won{--sky-top:#1f2147;--sky-mid:#5a3a66;--sky-bot:#d77a45}`;

export default {
  heroGlb: HERO_GLB, slots: SLOTS, icons: ICONS, logic: L,
  meta: {
    chapter: 'II', place: 'Hiriketiya', title: 'The Horseshoe Bay', tagline: 'Golden hour on the south coast.', bodyClass: 'hiri', css: CSS,
    intro: 'An old fisherman can’t take his canoe out, and your surfboard has drifted onto the reef. Help him, ride the last wave of the day, then head up to the main street, where the power has just gone out on the busiest evening of the week.',
    howto: ['<b>Tap</b> the sand to walk. Tap people and things to go to them and use them.', '<b>Find</b> hidden things. Turn the view (⟲ ⟳ or swipe) to look behind huts, palms and rocks.', '<b>Switch</b> things back and forth. Tides, plates and junction boxes all work both ways.'],
    startLabel: 'Tap the sand to walk. The fisherman by the blue canoe looks like he needs a hand.',
    winTitle: 'The street is alight', winSub: 'Evening on the south coast', inviteNode: 'B_mid', camStart: [1.5, 1.2, 1.5], fog: 0xf6dcc0, winDelay: 9000,
  },
  build,
};

function build(E) {
  const { THREE, S, scene, mat, mesh, polar, deg, tag, hash, canvasTex, bubble, sparkle, jiggle, beacon, halo, hold, label, bell, grind, click, bump, anims, girl, hemi, sun, fill, cam } = E;
  const V3 = (a) => new THREE.Vector3(...a);
  const P = (id) => V3(L.NODES[id]);
  const BC = V3(L.BAY_C), SC = V3(L.ST_C);
  const items = {}; const hiddenObjs = {};
  const tide = { level: -0.08, target: -0.08 }; const HIGH = -0.08, LOW = -0.5;
  const walkers = []; // things that bob or sway
  const s2w = (x, z, y = 0) => new THREE.Vector3(...L.sp(x, z, y)); // street-local → world
  const s2 = (x, z, y = 0) => new THREE.Vector3(x, y, z);                 // street-local (for things inside the street group)
  const RS_EDGE = 12.6;

  /* ---------- shared props ---------- */
  function palm(h = 4, lean = 0.25, seed = 1) {
    const g = new THREE.Group(); const segs = 6; let p = new THREE.Vector3();
    for (let i = 0; i < segs; i++) {
      const q = new THREE.Vector3(Math.sin(seed) * lean * (i + 1) ** 1.6 / segs, h * (i + 1) / segs, Math.cos(seed) * lean * (i + 1) ** 1.6 / segs);
      const len = p.distanceTo(q); const seg = mesh(new THREE.CylinderGeometry(0.11 - i * 0.008, 0.14 - i * 0.008, len, 6), mat(PAL.trunk));
      seg.position.copy(p).lerp(q, 0.5); seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), q.clone().sub(p).normalize()); g.add(seg); p = q;
    }
    const crown = new THREE.Group(); crown.position.copy(p); g.add(crown); g.userData.crown = crown;
    for (let i = 0; i < 8; i++) {
      const fr = mesh(new THREE.ConeGeometry(0.32, 2.1, 4, 1), mat(i % 2 ? PAL.palm : PAL.palmDark)); fr.scale.set(1, 1, 0.25);
      fr.position.y = 0.05; fr.rotation.set(0, i / 8 * Math.PI * 2 + seed, 0); const arm = new THREE.Group(); arm.rotation.y = i / 8 * Math.PI * 2 + seed; crown.add(arm);
      fr.rotation.set(Math.PI / 2 + 0.55 + hash(i, seed, 2) * 0.3, 0, 0); fr.position.set(0, -0.15, 0.95); arm.add(fr);
    }
    for (let i = 0; i < 3; i++) { const c = mesh(new THREE.SphereGeometry(0.13, 6, 5), mat(0x7a6a32)); c.position.set(Math.cos(i * 2.1) * 0.18, -0.2, Math.sin(i * 2.1) * 0.18); crown.add(c); }
    g.userData.seed = seed; walkers.push({ kind: 'palm', o: crown, seed });
    return g;
  }
  function netFloat() { const g = new THREE.Group(); const b = mesh(new THREE.SphereGeometry(0.2, 10, 8), mat(PAL.orange, { flatShading: false, roughness: 0.6 })); b.scale.y = 0.85; g.add(b); const band = mesh(new THREE.TorusGeometry(0.2, 0.025, 4, 16), mat(0xffffff)); band.rotation.x = Math.PI / 2; g.add(band); return g; }
  function surfboard(color = 0xf2d36b, stripe = PAL.red) {
    const g = new THREE.Group(); const b = mesh(new THREE.SphereGeometry(1, 16, 8), mat(color, { flatShading: false, roughness: 0.5 })); b.scale.set(0.28, 0.05, 1.0); g.add(b);
    const s = mesh(new THREE.BoxGeometry(0.03, 0.012, 1.7), mat(stripe)); s.position.y = 0.045; g.add(s); const fin = mesh(new THREE.BoxGeometry(0.02, 0.14, 0.14), mat(0x444444)); fin.position.set(0, -0.08, -0.75); g.add(fin); return g;
  }
  function bulb(lit = false) { const g = new THREE.Group(); const gl = mesh(new THREE.SphereGeometry(0.13, 10, 8), new THREE.MeshStandardMaterial({ color: 0xfff1b0, emissive: 0xffd36a, emissiveIntensity: lit ? 1.4 : 0.35, roughness: 0.3 })); g.add(gl); const cap = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), mat(0x9a9a9a)); cap.position.y = 0.14; g.add(cap); return g; }
  function person(shirt, sarong, { seated = false, hat = false } = {}) {
    const g = new THREE.Group(); const skin = mat(0x8a5a3c);
    const legs = mesh(new THREE.CylinderGeometry(0.17, 0.2, seated ? 0.35 : 0.75, 8), mat(sarong)); legs.position.y = seated ? 0.35 : 0.38; g.add(legs);
    if (seated) { legs.rotation.x = Math.PI / 2; legs.position.set(0, 0.32, 0.18); }
    const body = mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.6, 8), mat(shirt)); body.position.y = seated ? 0.7 : 1.05; g.add(body);
    const head = mesh(new THREE.SphereGeometry(0.17, 10, 8), skin); head.position.y = body.position.y + 0.45; g.add(head);
    const hair = mesh(new THREE.SphereGeometry(0.175, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2.2), mat(0x2a211d)); hair.position.copy(head.position); g.add(hair);
    if (hat) { const h = mesh(new THREE.ConeGeometry(0.38, 0.22, 10), mat(0xd9c08a)); h.position.y = head.position.y + 0.17; g.add(h); }
    for (const sx of [-1, 1]) { const a = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6), skin); a.position.set(sx * 0.24, body.position.y - 0.05, 0.05); a.rotation.z = sx * 0.2; g.add(a); }
    g.userData.head = head; return g;
  }
  function rock(r, color = PAL.rock) { const m = mesh(new THREE.DodecahedronGeometry(r, 0), mat(color)); m.scale.y = 0.6; m.rotation.set(hash(r, 1, 2) * 3, hash(r, 3, 1) * 3, 0); return m; }
  function islandBase(center, R, depth, color) { const g = mesh(new THREE.CylinderGeometry(R, R * 0.28, depth, 18, 3, true), mat(color)); g.position.set(center.x, -depth / 2 - 0.02, center.z); scene.add(g);
    const p = g.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < depth / 2 - 0.01) { p.setX(i, p.getX(i) * (0.92 + hash(i, 1, 1) * 0.16)); p.setZ(i, p.getZ(i) * (0.92 + hash(i, 2, 1) * 0.16)); } } g.geometry.computeVertexNormals(); return g; }
  function stringLights(a, b, n, sag = 0.4) {
    const g = new THREE.Group(); const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; const p = a.clone().lerp(b, t); p.y -= Math.sin(t * Math.PI) * sag; pts.push(p); }
    g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.012, 3), mat(0x333333), { cast: false })); g.userData.bulbs = [];
    for (let i = 1; i < n; i++) { const t = i / n; const p = a.clone().lerp(b, t); p.y -= Math.sin(t * Math.PI) * sag + 0.06;
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), new THREE.MeshBasicMaterial({ color: 0x6a5a40 })); m.position.copy(p); g.add(m); g.userData.bulbs.push(m); }
    return g;
  }

  /* ================= AREA 1: THE BAY ================= */
  // ground: a disc with the horseshoe bay cut out (the bay opens toward the camera)
  {
    const R = 10.2, bayDir = deg(45), w = 2.6;
    const dI = Math.asin(w / R), dB = Math.asin(w / L.BAY_R);
    const sh = new THREE.Shape();
    const isl = (a) => [R * Math.sin(a), R * Math.cos(a)];
    const bay = (a) => [BC.x + L.BAY_R * Math.sin(a), BC.z + L.BAY_R * Math.cos(a)];
    const N = 64; const pts = [];
    for (let i = 0; i <= N; i++) { const a = bayDir + dI + (Math.PI * 2 - 2 * dI) * i / N; pts.push(isl(a)); }
    for (let i = 0; i <= N; i++) { const a = bayDir - dB - (Math.PI * 2 - 2 * dB) * i / N; pts.push(bay(a)); }
    pts.forEach(([x, z], i) => (i ? sh.lineTo(x, -z) : sh.moveTo(x, -z)));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.5, bevelEnabled: false, curveSegments: 4 }); geo.rotateX(-Math.PI / 2); geo.translate(0, -0.5, 0);
    const ground = mesh(geo, mat(PAL.sand)); scene.add(ground); tag(ground, { surface: 'bay' });
    // green palm-grove band at the back of the beach
    const gs = new THREE.Shape(); const gp = []; for (let i = 0; i <= 40; i++) { const a = deg(140 + 180 * i / 40); gp.push([R * Math.sin(a), R * Math.cos(a)]); }
    for (let i = 40; i >= 0; i--) { const a = deg(140 + 180 * i / 40); const r = 7.4 + Math.sin(i * 0.7) * 0.3; gp.push([r * Math.sin(a) * 0.98 + 0.3, r * Math.cos(a) * 0.98 + 0.3]); }
    gp.forEach(([x, z], i) => (i ? gs.lineTo(x, -z) : gs.moveTo(x, -z)));
    const gg = new THREE.ExtrudeGeometry(gs, { depth: 0.08, bevelEnabled: false }); gg.rotateX(-Math.PI / 2); const grass = mesh(gg, mat(PAL.grass)); grass.position.y = 0.0; scene.add(grass); tag(grass, { surface: 'bay' });
    islandBase(new THREE.Vector3(0, 0, 0), R, 6, PAL.rockDark).position.y -= 0.5;
    // bay floor + water
    const floor = mesh(new THREE.CircleGeometry(L.BAY_R + 0.05, 40), mat(PAL.sandWet)); floor.rotation.x = -Math.PI / 2; floor.position.set(BC.x, -0.62, BC.z); scene.add(floor);
    const mouth = mesh(new THREE.PlaneGeometry(w * 2, 3.0), mat(PAL.sandWet)); mouth.rotation.set(-Math.PI / 2, 0, bayDir); mouth.position.copy(polar(8.65, bayDir, -0.62)); scene.add(mouth);
    const lip = mesh(new THREE.CylinderGeometry(L.BAY_R + 0.05, L.BAY_R + 0.05, 0.55, 40, 1, true, bayDir + dB, Math.PI * 2 - 2 * dB), mat(PAL.sandWet, { side: THREE.BackSide })); lip.position.set(BC.x, -0.35, BC.z); scene.add(lip);
  }
  const waterMat = new THREE.MeshStandardMaterial({ color: PAL.water, transparent: true, opacity: 0.82, roughness: 0.15, metalness: 0.05 });
  const water = new THREE.Group(); scene.add(water);
  { const c = new THREE.Mesh(new THREE.CircleGeometry(L.BAY_R, 48), waterMat); c.rotation.x = -Math.PI / 2; c.position.set(BC.x, 0, BC.z); water.add(c);
    const ch = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 3.0), waterMat); ch.rotation.set(-Math.PI / 2, 0, deg(45)); ch.position.copy(polar(8.65, deg(45), 0)); water.add(ch);
    tag(water, { surface: 'bay' });
    // foam lines on the incoming swell
    for (let i = 0; i < 3; i++) { const f = new THREE.Mesh(new THREE.TorusGeometry(2.4 + i * 1.3, 0.05, 3, 30, deg(70)), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 }));
      f.rotation.x = -Math.PI / 2; f.rotation.z = deg(-45 + 90) - deg(35); f.position.set(BC.x, 0.02, BC.z); water.add(f); f.userData.foam = i; } }
  // the surf wave: a curling crest in the bay mouth. Tap it (once you have your board) to paddle out and ride it to the surf point.
  const surfWave = new THREE.Group(); surfWave.position.copy(V3(L.BAY_C).add(polar(3.6, deg(25), 0))); surfWave.rotation.y = deg(25 + 90); scene.add(surfWave);
  { const crest = mesh(new THREE.TorusGeometry(0.75, 0.32, 8, 18, Math.PI * 1.1), new THREE.MeshStandardMaterial({ color: 0x5fd3c6, roughness: 0.2, transparent: true, opacity: 0.92 })); crest.scale.set(2.4, 1, 1); crest.position.y = 0.05; surfWave.add(crest);
    const lip = mesh(new THREE.TorusGeometry(0.75, 0.12, 6, 18, Math.PI * 1.1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })); lip.scale.set(2.4, 1, 1); lip.position.set(0, 0.2, 0.18); surfWave.add(lip);
    const hit = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.6, 1.6), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 0.4; surfWave.add(hit);
    const bc = beacon(0x9ff0e6, 2.6); surfWave.add(bc); surfWave.userData.beacon = bc; }
  tag(surfWave, { surface: 'surf' });
  const pointRing = E.ring(0x9ff0e6); pointRing.position.copy(L.NODES.B_point ? V3(L.NODES.B_point) : new THREE.Vector3()).setY(0.55); pointRing.visible = false; scene.add(pointRing);
  // a wide sea around the island (low), so the bay mouth opens onto ocean
  { const sea = new THREE.Mesh(new THREE.RingGeometry(10.3, 12.8, 64), new THREE.MeshStandardMaterial({ color: PAL.deep, transparent: true, opacity: 0.55, roughness: 0.2 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.7; scene.add(sea); }

  // reef rocks (walkable at low tide), the rock pool, the dial on the horn rocks
  const reefRocks = new THREE.Group(); scene.add(reefRocks);
  for (let i = 0; i < 14; i++) { const a = 104 - i * 4.4, r = 5.3 + Math.sin(i) * 0.35; const k = rock(0.42 + hash(i, 4, 4) * 0.25, i % 2 ? PAL.rock : PAL.rockDark); k.position.copy(V3(L.BAY_C).add(polar(r, deg(a), -0.5))); reefRocks.add(k); }
  { const slab = mesh(new THREE.CylinderGeometry(0.75, 0.95, 0.5, 8), mat(PAL.rock)); slab.position.copy(P('B_dial')).setY(0.17); scene.add(slab); tag(slab, { surface: 'bay' }); }
  const pool = new THREE.Group(); pool.position.copy(P('B_pool')).setY(-0.32); scene.add(pool);
  for (let i = 0; i < 7; i++) { const k = rock(0.38, PAL.rockDark); k.position.copy(polar(0.75, i / 7 * Math.PI * 2, 0.1)); pool.add(k); }
  { const pw = new THREE.Mesh(new THREE.CircleGeometry(0.6, 16), new THREE.MeshStandardMaterial({ color: 0x5fd3c6, transparent: true, opacity: 0.85 })); pw.rotation.x = -Math.PI / 2; pw.position.y = 0.12; pool.add(pw); }
  const paddle = new THREE.Group(); { const sh = mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.4, 6), mat(PAL.wood)); sh.position.y = 0.7; paddle.add(sh); const bl = mesh(new THREE.BoxGeometry(0.22, 0.45, 0.04), mat(0xc98b55)); bl.position.y = 0.05; paddle.add(bl); }
  paddle.position.copy(P('B_pool')).add(new THREE.Vector3(0.5, -0.05, 0.3)); paddle.rotation.z = 0.5; scene.add(paddle); tag(paddle, { item: 'paddle' }); items.paddle = paddle;
  for (let i = 0; i < 6; i++) { const k = rock(0.55 + hash(i, 9, 1) * 0.3); k.position.copy(V3(L.BAY_C).add(polar(6.6 + (i % 2) * 0.6, deg(96 + i * 6), 0.1))); scene.add(k); }
  const dial = new THREE.Group(); dial.position.copy(P('B_dial')).add(polar(0.75, deg(60), -0.42)); scene.add(dial);
  { const base = mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.5, 10), mat(PAL.rock)); base.position.y = 0.25; dial.add(base);
    const face = mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.12, 24), mat(0xd8d0c2)); face.rotation.x = Math.PI / 2 - 0.5; face.position.set(0, 0.95, 0); dial.add(face);
    const disc = new THREE.Group(); disc.position.copy(face.position); disc.rotation.x = -0.5; dial.add(disc); dial.userData.disc = disc;
    const tex = canvasTex(128, 128, (x) => { x.fillStyle = '#d8d0c2'; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill(); x.strokeStyle = '#8f8579'; x.lineWidth = 4; x.beginPath(); x.arc(64, 64, 56, 0, 7); x.stroke();
      x.fillStyle = '#efe4c4'; x.beginPath(); x.arc(64, 26, 15, 0, 7); x.fill(); x.fillStyle = '#5d5550'; x.beginPath(); x.arc(64, 102, 15, 0, 7); x.fill(); x.strokeStyle = '#3fc1b8'; x.lineWidth = 5;
      for (let k = 0; k < 2; k++) { x.beginPath(); for (let i = 0; i <= 40; i++) { const xx = 30 + i * 1.7, yy = 58 + k * 12 + Math.sin(i * 0.5) * 4; i ? x.lineTo(xx, yy) : x.moveTo(xx, yy); } x.stroke(); } });
    const fd = new THREE.Mesh(new THREE.CircleGeometry(0.6, 24), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })); fd.position.z = 0.065; disc.add(fd);
    const g = halo(dial, 0x9ff0e6, 0.7, 0.95); g.position.y = 0.52; }
  tag(dial, { item: 'dial' }); items.dial = dial;

  // the fisherman and his oru (outrigger canoe)
  const canoe = new THREE.Group(); scene.add(canoe);
  { const hull = mesh(new THREE.CylinderGeometry(0.32, 0.22, 3.4, 8, 1), mat(PAL.blue)); hull.rotation.x = Math.PI / 2; hull.scale.set(1, 1, 0.75); hull.position.y = 0.25; canoe.add(hull);
    const rim = mesh(new THREE.BoxGeometry(0.5, 0.06, 3.3), mat(PAL.white)); rim.position.y = 0.48; canoe.add(rim);
    for (const z of [-0.8, 0.8]) { const boom = mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.0, 5), mat(PAL.woodDark)); boom.rotation.z = Math.PI / 2; boom.position.set(1.0, 0.5, z); canoe.add(boom); }
    const out = mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.4, 6), mat(PAL.wood)); out.rotation.x = Math.PI / 2; out.position.set(2.0, 0.15, 0); canoe.add(out); }
  const canoeBeach = { pos: V3(L.BAY_C).add(polar(5.55, deg(226), 0)), rot: deg(226) + Math.PI / 2 };
  canoe.position.copy(canoeBeach.pos); canoe.rotation.y = canoeBeach.rot;
  const fisher = person(0xf2efe6, 0x2f5fa8, { seated: true, hat: true }); fisher.position.copy(P('B_mid')).add(polar(1.0, deg(250), -0.06)); fisher.rotation.y = deg(30); scene.add(fisher);
  tag(fisher, { item: 'fisher' }); items.fisher = fisher;
  const nets = mesh(new THREE.TorusGeometry(0.4, 0.14, 5, 10), mat(0x6f8f7a)); nets.rotation.x = Math.PI / 2; nets.scale.z = 0.5; nets.position.copy(fisher.position).add(polar(0.8, deg(300), 0.1)); scene.add(nets);
  // the surfboard, stranded out on the reef at the bay mouth
  const board = surfboard(); board.position.copy(V3(L.BAY_C).add(polar(6.3, deg(30), -0.22))); board.rotation.set(0.1, 0.6, 0.2); scene.add(board);
  const boardOnSand = { pos: P('B_mid').add(polar(1.0, deg(160), 0.06)), rot: deg(70) };
  tag(board, { item: 'board' }); items.board = board;
  const carriedBoard = surfboard(); carriedBoard.visible = false; girl.add(carriedBoard); // under her arm / under her feet
  const carriedPaddle = paddle.clone(); carriedPaddle.visible = false; carriedPaddle.scale.setScalar(0.75); carriedPaddle.position.set(-0.25, 0.25, -0.18); carriedPaddle.rotation.set(0.15, 0, 0.35); girl.add(carriedPaddle);

  // beach café on the west horn: posts, thatched roof, tables, surfboards, string lights
  const cafe = new THREE.Group(); cafe.position.copy(V3(L.BAY_C).add(polar(8.2, deg(305), 0))); cafe.rotation.y = deg(305) + Math.PI; scene.add(cafe);
  { const deck = mesh(new THREE.BoxGeometry(3.2, 0.2, 2.4), mat(PAL.wood)); deck.position.y = 0.1; cafe.add(deck);
    for (const [x, z] of [[-1.5, -1.1], [1.5, -1.1], [-1.5, 1.1], [1.5, 1.1]]) { const p = mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.9, 6), mat(PAL.woodDark)); p.position.set(x, 1.1, z); cafe.add(p); }
    const roof = mesh(new THREE.ConeGeometry(2.6, 1.3, 4), mat(PAL.thatch)); roof.rotation.y = Math.PI / 4; roof.scale.set(1.25, 1, 1); roof.position.y = 2.6; cafe.add(roof); cafe.userData.roof = roof;
    for (let i = 0; i < 2; i++) { const t = mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 10), mat(0xe8dcc0)); t.position.set(-0.6 + i * 1.2, 0.85, 0.3); cafe.add(t); const leg = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.65, 5), mat(PAL.woodDark)); leg.position.set(-0.6 + i * 1.2, 0.5, 0.3); cafe.add(leg); }
    const sl = stringLights(new THREE.Vector3(-1.6, 2.0, 1.2), new THREE.Vector3(1.6, 2.0, 1.2), 9, 0.25); cafe.add(sl); cafe.userData.lights = sl;
    for (let i = 0; i < 3; i++) { const b = surfboard([0xf2d36b, 0x7fc8c2, 0xf29b6b][i], [PAL.red, PAL.blue, 0x333333][i]); b.rotation.set(-Math.PI / 2 + 0.2, 0, 0); b.position.set(-1.0 + i * 0.55, 1.0, -1.45); cafe.add(b); }
    const umb = new THREE.Group(); umb.position.set(2.6, 0, 1.6); cafe.add(umb); const pole = mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 5), mat(PAL.woodDark)); pole.position.y = 0.9; umb.add(pole); const top = mesh(new THREE.ConeGeometry(1.0, 0.45, 8), mat(PAL.thatch)); top.position.y = 1.9; umb.add(top);
  }
  // the beach walls off the surf point: a tumble of rocks between the café and the point
  for (let i = 0; i < 7; i++) { const k = rock(0.7 + hash(i, 2, 7) * 0.4, i % 2 ? PAL.rock : PAL.rockDark); k.position.copy(V3(L.BAY_C).add(polar(7.0 + (i % 3) * 0.5, deg(330 + i * 3.5), 0.15 + (i % 2) * 0.3))); scene.add(k); }
  { const pt = mesh(new THREE.CylinderGeometry(1.4, 1.7, 0.6, 9), mat(PAL.rock)); pt.position.copy(P('B_point')).setY(0.2); scene.add(pt); tag(pt, { surface: 'bay' }); }

  // palms, shrubs and huts round the back of the beach
  const palms = [];
  for (let i = 0; i < 13; i++) { const a = 140 + i * 14 + hash(i, 1, 1) * 6, r = 8.0 + hash(i, 2, 2) * 1.6; const p = palm(3.4 + hash(i, 3, 3) * 1.6, 0.4 + hash(i, 4, 4) * 0.5, -a * Math.PI / 180 + 0.4); p.position.copy(polar(r, deg(a), 0)); scene.add(p); palms.push(p); }
  for (let i = 0; i < 10; i++) { const b = mesh(new THREE.IcosahedronGeometry(0.45 + hash(i, 7, 1) * 0.3, 0), mat(i % 2 ? PAL.grass : PAL.grassDark)); b.position.copy(polar(8.8 + hash(i, 5, 5), deg(150 + i * 17), 0.25)); scene.add(b); }
  for (const a of [200, 252]) { const hut = new THREE.Group(); hut.position.copy(polar(9.0, deg(a), 0)); hut.rotation.y = deg(a); scene.add(hut);
    const w = mesh(new THREE.BoxGeometry(1.6, 1.0, 1.3), mat(a === 200 ? 0xf0e3c6 : 0xf2c9a6)); w.position.y = 0.5; hut.add(w); const r = mesh(new THREE.ConeGeometry(1.25, 0.8, 4), mat(0xb5643c)); r.rotation.y = Math.PI / 4; r.position.y = 1.4; hut.add(r); }
  // palm 1 holds a float in its crown (tap the palm to shake it loose)
  const palm1 = palm(4.2, 0.9, deg(-30)); palm1.position.copy(P('B_palm')).add(polar(1.6, deg(205), 0)); scene.add(palm1);
  tag(palm1, { hidden: 'palm1' }); hiddenObjs.palm1 = palm1;

  // the four orange net floats
  const floats = [];
  const floatSpots = [
    () => cafe.localToWorld(new THREE.Vector3(-0.45, 0.25, -1.75)),                  // tucked behind the surfboards at the café
    () => canoeBeach.pos.clone().add(polar(0.9, deg(226 + 180) , 0.18)),            // behind the canoe
    () => palm1.userData.crown.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0.32, -0.42, 0.32)), // up in the palm, peeking out under the fronds (drops when shaken)
    () => pool.position.clone().add(new THREE.Vector3(0, 0.25, 0)),                  // in the rock pool (low tide only)
  ];
  scene.updateMatrixWorld(true);
  for (let i = 0; i < 4; i++) { const f = netFloat(); f.position.copy(floatSpots[i]()); f.scale.setScalar(i === 2 ? 1.3 : 1.15); scene.add(f); floats.push(f);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); f.add(hit); tag(f, { hidden: 'f' + i }); f.userData.base = f.position.clone(); }
  // secret: an ola-leaf page tucked in the café's thatch
  const leaf = mesh(new THREE.BoxGeometry(0.5, 0.04, 0.14), mat(0xd9be8a)); leaf.position.set(-1.1, 2.15, -1.25); leaf.rotation.set(0.3, 0.4, 0.2); cafe.add(leaf);
  { const hit = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); leaf.add(hit); } tag(leaf, { hidden: 'leaf' });

  /* ================= THE RED ROAD ================= */
  const tuk = new THREE.Group(); scene.add(tuk);
  { const body = mesh(new THREE.BoxGeometry(0.9, 0.75, 1.5), mat(0xa8432f)); body.position.y = 0.6; tuk.add(body);
    const roof = mesh(new THREE.BoxGeometry(0.95, 0.08, 1.4), mat(0x2b2b2b)); roof.position.set(0, 1.35, -0.05); tuk.add(roof);
    for (const x of [-0.42, 0.42]) { const p = mesh(new THREE.BoxGeometry(0.05, 0.55, 0.05), mat(0x2b2b2b)); p.position.set(x, 1.05, 0.55); tuk.add(p); }
    const nose = mesh(new THREE.BoxGeometry(0.5, 0.6, 0.35), mat(0xa8432f)); nose.position.set(0, 0.55, 0.9); tuk.add(nose);
    const ws = mesh(new THREE.BoxGeometry(0.85, 0.42, 0.04), new THREE.MeshStandardMaterial({ color: 0xbfe6ea, transparent: true, opacity: 0.6 })); ws.position.set(0, 1.05, 0.62); ws.rotation.x = -0.2; tuk.add(ws);
    for (const [x, z] of [[0, 0.95], [-0.42, -0.45], [0.42, -0.45]]) { const w = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 10), mat(0x222222)); w.rotation.z = Math.PI / 2; w.position.set(x, 0.2, z); tuk.add(w); }
    const head = mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfff1b0 })); head.position.set(0, 0.8, 1.08); tuk.add(head); }
  { const hit = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 2.4), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 0.8; tuk.add(hit); }
  tag(tuk, { surface: 'tuk' }); const tukBeacon = beacon(0xffd27a, 2.6); tuk.add(tukBeacon);
  const tukStart = P('B_point').add(polar(1.4, deg(0), -0.5)); tuk.position.copy(tukStart).setY(0.5); tuk.rotation.y = 0;
  const roadA = P('B_point').add(polar(1.6, 0, 0)).setY(0.45), roadB = s2w(RS_EDGE, 3.0, 0.02);
  { const len = roadA.distanceTo(roadB); const rd = mesh(new THREE.BoxGeometry(2.0, 0.35, len), mat(PAL.earth)); rd.position.copy(roadA).lerp(roadB, 0.5).add(new THREE.Vector3(0, -0.2, 0));
    rd.lookAt(roadB.clone().add(new THREE.Vector3(0, -0.2, 0))); scene.add(rd); const under = mesh(new THREE.BoxGeometry(1.7, 1.2, len - 1), mat(PAL.rockDark)); under.position.copy(rd.position).add(new THREE.Vector3(0, -0.75, 0)); under.quaternion.copy(rd.quaternion); scene.add(under);
    for (let i = 0; i < 6; i++) { const t = (i + 0.5) / 6; const p = palm(2.6 + hash(i, 1, 9), 0.5, i); p.position.copy(roadA).lerp(roadB, t).add(new THREE.Vector3(i % 2 ? 1.25 : -1.25, -0.05, 0)); scene.add(p); } }

  /* ================= AREA 2: THE MAIN STREET ================= */
  // The street island sits beside the bay, turned so the main road runs straight across the screen.
  // Everything here is built in the street's own frame: local x along the road (east end faces the bay), local +z = near side (toward the camera).
  const street = new THREE.Group(); street.position.copy(SC); street.rotation.y = L.ST_ROT; scene.add(street); street.updateMatrixWorld(true);
  const toW = (v) => street.localToWorld(v.clone()); const toL = (v) => street.worldToLocal(v.clone());
  const streetLights = []; const warmLights = []; const signs = []; const people = []; const traffic = [];
  const RS = 12.5;
  {
    const disc = mesh(new THREE.CylinderGeometry(RS, RS, 0.4, 48), mat(0x8a9a5a)); disc.position.y = -0.2; street.add(disc); tag(disc, { surface: 'street' });
    const base = islandBase(new THREE.Vector3(), RS, 6, PAL.rockDark); scene.remove(base); base.position.set(0, -3.42, 0); street.add(base);
    const road = mesh(new THREE.BoxGeometry(2 * RS - 0.4, 0.06, 2.8), mat(PAL.asphalt)); road.position.y = 0.01; street.add(road); tag(road, { surface: 'street' });
    for (const z of [-1.6, 1.6]) { const k = mesh(new THREE.BoxGeometry(2 * RS - 0.8, 0.1, 0.4), mat(PAL.earth)); k.position.set(0, 0.03, z); street.add(k); tag(k, { surface: 'street' }); }
    for (const z of [-3.3, 3.3]) { const w = mesh(new THREE.BoxGeometry(2 * RS - 1.6, 0.06, 3.0), mat(0xc79a6a)); w.position.set(0, 0.01, z); street.add(w); tag(w, { surface: 'street' }); }
    for (let i = 0; i < 12; i++) { const d = mesh(new THREE.BoxGeometry(0.8, 0.02, 0.08), mat(0xe8e0c8)); d.position.set(-11 + i * 2, 0.05, 0); street.add(d); }
    // tunnels of palms at both ends, so traffic arrives and leaves under the trees instead of off the edge
    for (const sx of [-1, 1]) for (const z of [-1.9, 1.9]) { const p = palm(4.2, 0.35, sx * 2 + z); p.position.set(sx * (RS - 0.9), 0, z); p.rotation.y = sx > 0 ? 0 : Math.PI; street.add(p); }
  }
  function signBoard(text, bg, fg, w = 1.6, h = 0.45) {
    const tex = canvasTex(256, 72, (x) => { x.fillStyle = bg; x.fillRect(0, 0, 256, 72); x.fillStyle = fg; x.font = 'bold 34px Nunito Sans, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 128, 38); });
    const m = new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.05, roughness: 0.8 });
    const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), m); signs.push(m); return s;
  }
  function lanternString(parent, a, b, n, sag, colors) { // a row of paper lanterns that light up in the finale
    const sl = stringLights(a, b, n, sag); parent.add(sl); streetLights.push(sl);
    sl.userData.bulbs.forEach((bm, i) => { bm.scale.set(1.6, 2.0, 1.6); bm.userData.on = colors ? colors[i % colors.length] : 0xffe08a; });
    return sl;
  }
  function shopFront(x, z, w, d, h, wall, roof, name, signBg, signFg, opts = {}) {
    const g = new THREE.Group(); g.position.set(x, 0, z); street.add(g);
    const body = mesh(new THREE.BoxGeometry(w, h, d), mat(wall)); body.position.y = h / 2; g.add(body);
    const r = mesh(new THREE.BoxGeometry(w + 0.4, 0.16, d + 0.5), mat(roof)); r.position.set(0, h + 0.08, 0.2); g.add(r);
    const win = mesh(new THREE.BoxGeometry(w * 0.62, h * 0.42, 0.05), new THREE.MeshStandardMaterial({ color: 0x2c3340 })); win.position.set(-w * 0.12, h * 0.45, d / 2 + 0.03); g.add(win); warmLights.push(win.material);
    const sgn = signBoard(name, signBg, signFg, Math.min(w - 0.2, 2.2)); sgn.position.set(0, h - 0.3, d / 2 + 0.06); g.add(sgn);
    lanternString(g, new THREE.Vector3(-w / 2, h - 0.05, d / 2 + 0.35), new THREE.Vector3(w / 2, h - 0.05, d / 2 + 0.35), Math.round(w * 3), 0.18, opts.lanterns);
    if (opts.thatch) { const t = mesh(new THREE.BoxGeometry(w + 0.2, 0.14, 0.9), mat(PAL.thatch)); t.position.set(0, h * 0.72, d / 2 + 0.45); t.rotation.x = 0.25; g.add(t); }
    return g;
  }
  // --- far side, west to east: rice & curry, [stair], the two-storey café, pizza, the corner shop, surf shop
  const rice = shopFront(-8.6, -6.3, 2.6, 2.6, 2.4, 0x7fae86, 0xa8432f, 'RICE & CURRY', '#f4e7c8', '#7a2e1f', { thatch: true, lanterns: [0xff5a4a, 0xffd45a, 0x5ad1ff] });
  for (let i = 0; i < 2; i++) { const t = mesh(new THREE.BoxGeometry(0.6, 0.06, 0.6), mat(PAL.wood)); t.position.set(-9.2 + i * 1.2, 0.72, -4.4); street.add(t);
    const p = person([0xd06a3a, 0x3a6ea5][i], [0x333333, 0x7a5a3a][i], { seated: true }); p.position.set(-9.2 + i * 1.2, 0, -3.9); p.rotation.y = Math.PI; street.add(p); people.push(p); }
  const cafe2 = new THREE.Group(); cafe2.position.set(-2.5, 0, -7.2); street.add(cafe2);
  {
    const g1 = mesh(new THREE.BoxGeometry(5.4, 2.6, 3.6), mat(PAL.brick)); g1.position.y = 1.3; cafe2.add(g1);
    const g2 = mesh(new THREE.BoxGeometry(5.4, 2.2, 3.6), mat(PAL.plaster)); g2.position.y = 3.7; cafe2.add(g2);
    const roof = mesh(new THREE.BoxGeometry(5.8, 0.2, 4.0), mat(0x6b6b6b)); roof.position.y = 4.9; cafe2.add(roof);
    for (const x of [-1.6, 0.4]) { const t = mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.7, 10), mat(0x1f1f1f)); t.position.set(x, 5.35, -0.8); cafe2.add(t); }
    for (let i = 0; i < 3; i++) { const w = mesh(new THREE.BoxGeometry(1.2, 1.2, 0.05), new THREE.MeshStandardMaterial({ color: 0x2c3340, emissive: 0x000000 })); w.position.set(-1.7 + i * 1.7, 3.75, 1.83); cafe2.add(w); warmLights.push(w.material); }
    const door = mesh(new THREE.BoxGeometry(1.6, 1.9, 0.05), new THREE.MeshStandardMaterial({ color: 0x3a2a22 })); door.position.set(0.6, 0.95, 1.83); cafe2.add(door); warmLights.push(door.material);
    const sgn = signBoard('SEA VIEW CAFÉ', '#1f1f1f', '#f4e7c8', 2.6, 0.5); sgn.position.set(0, 4.55, 1.84); cafe2.add(sgn);
    const deck = mesh(new THREE.BoxGeometry(5.4, 0.14, 1.2), mat(PAL.wood)); deck.position.set(0, 2.6, 2.4); cafe2.add(deck); tag(deck, { surface: 'street' });
    for (let i = 0; i <= 10; i++) { const b = mesh(new THREE.BoxGeometry(0.06, 0.6, 0.06), mat(0xd8732f)); b.position.set(-2.65 + i * 0.53, 2.95, 2.97); cafe2.add(b); }
    const rail = mesh(new THREE.BoxGeometry(5.4, 0.08, 0.1), mat(0xd8732f)); rail.position.set(0, 3.25, 2.97); cafe2.add(rail);
    for (const x of [-2.6, 2.6]) { const p = mesh(new THREE.BoxGeometry(0.16, 2.6, 0.16), mat(PAL.woodDark)); p.position.set(x, 1.3, 2.95); cafe2.add(p); }
    const th = mesh(new THREE.BoxGeometry(5.6, 0.18, 1.0), mat(PAL.thatch)); th.position.set(0, 2.42, 2.5); cafe2.add(th);
    for (let i = 0; i < 3; i++) { const t = mesh(new THREE.BoxGeometry(0.7, 0.06, 0.7), mat(PAL.wood)); t.position.set(-1.9 + i * 1.9, 0.75, 2.6); cafe2.add(t); const leg = mesh(new THREE.BoxGeometry(0.08, 0.7, 0.08), mat(PAL.woodDark)); leg.position.set(-1.9 + i * 1.9, 0.38, 2.6); cafe2.add(leg);
      const candle = new THREE.PointLight(0xffb35a, 1.2, 3); candle.position.set(-1.9 + i * 1.9, 1.0, 2.6); cafe2.add(candle); candle.userData.candle = true; warmLights.push(candle);
      const p = person([0x3a6ea5, 0xd06a3a, 0xf2efe6][i], [0x333333, 0x7a5a3a, 0x2f5fa8][i], { seated: true }); p.position.set(-1.9 + i * 1.9 + 0.55, 0, 2.6); p.rotation.y = -Math.PI / 2; cafe2.add(p); people.push(p); }
    for (let i = 0; i < 4; i++) { const w = mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshStandardMaterial({ color: 0x8a6a44, emissive: 0x000000 })); w.scale.y = 1.2; w.position.set(-2.0 + i * 1.33, 3.85, 2.9); cafe2.add(w); warmLights.push(w.material); } // wicker lamp shades
    const cb = mesh(new THREE.BoxGeometry(0.6, 0.8, 0.05), mat(0x2b2b2b)); cb.position.set(3.1, 0.55, 3.7); cb.rotation.x = -0.2; cafe2.add(cb);
    for (let i = 0; i < 9; i++) { const t = i / 8; const step = mesh(new THREE.BoxGeometry(0.42, 0.12, 1.0), mat(PAL.wood)); step.position.set(-4.4 + t * 1.9, 0.12 + t * 2.48, 2.3); cafe2.add(step); tag(step, { surface: 'street' }); }
    lanternString(cafe2, new THREE.Vector3(-2.7, 2.35, 3.0), new THREE.Vector3(2.7, 2.35, 3.0), 14, 0.25);
    lanternString(cafe2, new THREE.Vector3(-2.7, 3.3, 3.0), new THREE.Vector3(2.7, 3.3, 3.0), 14, 0.15);
  }
  const pizza = shopFront(2.1, -6.4, 2.4, 2.8, 2.6, 0xf2c94c, 0x6b4a33, 'PIZZA', '#c8423b', '#fff3d6', { lanterns: [0xffe08a] });
  { const oven = mesh(new THREE.SphereGeometry(0.55, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xb8735a)); oven.position.set(0.6, 0.6, 1.6); pizza.add(oven); const ch = mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.4, 6), mat(0x6b6b6b)); ch.position.set(0.6, 1.4, 1.5); pizza.add(ch);
    const glow = mesh(new THREE.CircleGeometry(0.22, 10), new THREE.MeshBasicMaterial({ color: 0xff8a3a })); glow.position.set(0.6, 0.75, 2.12); pizza.add(glow); }
  const shop = shopFront(5.4, -6.2, 3.8, 3.0, 2.8, 0xf0e3c6, 0x2e6db4, 'GENERAL STORE', '#2e6db4', '#ffffff');
  { const sill = mesh(new THREE.BoxGeometry(2.5, 0.08, 0.3), mat(PAL.wood)); sill.position.set(-0.5, 0.55, 1.65); shop.add(sill);
    for (let i = 0; i < 4; i++) { const c = mesh(new THREE.BoxGeometry(0.25, 0.3, 0.2), mat([0xd0503c, 0xf2c12e, 0x3fa06a, 0xffffff][i])); c.position.set(-1.3 + i * 0.5, 0.75, 1.65); shop.add(c); } }
  const surfShop = shopFront(8.7, -5.8, 2.2, 2.4, 2.3, 0x7fc8c2, 0xf2efe6, 'SURF', '#f2d36b', '#1f5f6a', { lanterns: [0x5ad1ff, 0xffffff] });
  for (let i = 0; i < 3; i++) { const b = surfboard([0xf29b6b, 0xf2d36b, 0xffffff][i], [PAL.blue, PAL.red, 0x333333][i]); b.rotation.set(-Math.PI / 2 + 0.15, 0, 0); b.position.set(-0.7 + i * 0.6, 1.0, 1.4); surfShop.add(b); }
  // the stand-on board on the balcony, and the thatched awning flap that swings out into a bridge to the electric pole
  const plate = new THREE.Group(); plate.position.copy(toL(P('S_balc'))).setY(2.73); street.add(plate);
  { const p = mesh(new THREE.BoxGeometry(0.9, 0.06, 0.9), mat(0xc98b55)); plate.add(p); const ring = halo(plate, 0xffe2a0, 0.5, 0.7); ring.position.y = 0.05; plate.userData.p = p; }
  const awPivot = new THREE.Group(); const awA = new THREE.Vector3(0.3, 2.66, -4.9), awB = toL(P('S_pole')).setY(2.66);
  awPivot.position.copy(awA); street.add(awPivot); awPivot.lookAt(toW(awB)); const awning = new THREE.Group(); awPivot.add(awning);
  { const len = awA.distanceTo(awB) + 0.3; const flap = mesh(new THREE.BoxGeometry(1.0, 0.12, len), mat(PAL.thatch)); flap.position.z = len / 2; awning.add(flap); tag(flap, { surface: 'street' });
    for (let i = 0; i < 6; i++) { const r = mesh(new THREE.BoxGeometry(1.05, 0.05, 0.08), mat(0xa88442)); r.position.set(0, 0.07, 0.3 + i * len / 6); awning.add(r); } }
  const AWN_UP = -1.45, AWN_DOWN = 0; awning.rotation.x = AWN_UP;
  // electric poles, junction boxes, cables
  function pole(x, z, h = 5.2) { const g = new THREE.Group(); g.position.set(x, 0, z); street.add(g); const p = mesh(new THREE.CylinderGeometry(0.12, 0.16, h, 6), mat(0x8c8070)); p.position.y = h / 2; g.add(p);
    const bar = mesh(new THREE.BoxGeometry(1.4, 0.08, 0.08), mat(0x6e6252)); bar.position.y = h - 0.4; g.add(bar); g.userData.top = new THREE.Vector3(x, h - 0.35, z); return g; }
  const poleJ1 = pole(1.95, -2.35), poleJ2 = pole(4.3, 2.05), poleA = pole(-6.0, 2.05), poleB = pole(7.5, -2.35), poleC = pole(-6.5, -2.35), poleD = pole(9.6, 2.05), poleE = pole(-0.8, 2.05);
  { const plat = mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.1, 10), mat(0x7a6e5e)); plat.position.set(-0.15, 2.6, -0.1); poleJ1.add(plat); tag(plat, { surface: 'street' }); }
  const junction = [];
  function jbox(parent, pos, item) { const g = new THREE.Group(); g.position.copy(pos); parent.add(g);
    const b = mesh(new THREE.BoxGeometry(0.55, 0.55, 0.3), mat(0x9aa3a8)); g.add(b);
    const dialG = new THREE.Group(); dialG.position.z = 0.17; g.add(dialG);
    const plateM = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 16), mat(0xd9d4c8)); plateM.rotation.x = Math.PI / 2; dialG.add(plateM);
    const arrow = mesh(new THREE.BoxGeometry(0.06, 0.26, 0.03), mat(0xc8423b)); arrow.position.set(0, 0.06, 0.03); dialG.add(arrow);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0x553333 })); led.position.set(0.2, 0.2, 0.16); g.add(led);
    const hit = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.6), new THREE.MeshBasicMaterial({ visible: false })); g.add(hit);
    g.userData = { dial: dialG, led }; tag(g, { item }); items[item] = g; junction.push(g); return g; }
  jbox(poleJ1, new THREE.Vector3(0, 3.35, 0.2), 'j1');
  jbox(poleJ2, new THREE.Vector3(0, 1.25, -0.2), 'j2').rotation.y = Math.PI;
  jbox(shop, new THREE.Vector3(1.4, 1.6, 1.55), 'j3');
  // generator behind the near-side kottu stall, with its pull cord (the finale)
  const gen = new THREE.Group(); gen.position.copy(toL(P('S_gen'))).add(new THREE.Vector3(0.1, -0.06, 1.0)); street.add(gen);
  { const b = mesh(new THREE.BoxGeometry(1.1, 0.75, 0.75), mat(0xd9b23a)); b.position.y = 0.38; gen.add(b); const f = mesh(new THREE.BoxGeometry(1.2, 0.08, 0.85), mat(0x2b2b2b)); f.position.y = 0.05; gen.add(f);
    const pull = mesh(new THREE.TorusGeometry(0.09, 0.025, 5, 10), mat(0xc8423b)); pull.position.set(0.45, 0.62, -0.38); gen.add(pull); const ex = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6), mat(0x555555)); ex.position.set(-0.4, 0.9, 0.1); gen.add(ex);
    gen.userData.ex = ex; const bc = beacon(); gen.add(bc); gen.userData.beacon = bc; }
  tag(gen, { item: 'gen' }); items.gen = gen;
  const cables = [];
  function cable(a, b, sag = 0.5) { const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; const p = a.clone().lerp(b, t); p.y -= Math.sin(t * Math.PI) * sag; pts.push(p); }
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.025, 4), new THREE.MeshStandardMaterial({ color: 0x2b2b2b, emissive: 0x000000 })); street.add(m); cables.push(m); return m; }
  const T = (p) => p.userData.top;
  const cG = cable(gen.position.clone().add(new THREE.Vector3(-0.5, 0.6, 0)), new THREE.Vector3(4.3, 1.25, 2.05), 0.2);
  const cA = cable(T(poleA), T(poleJ2), 0.5);
  const c21 = cable(T(poleJ2), T(poleJ1), 0.6);
  const c1c = cable(T(poleJ1), new THREE.Vector3(0.2, 4.2, -5.4), 0.4);
  const c13 = cable(T(poleJ1), T(poleB), 0.5);
  const c3s = cable(T(poleB), new THREE.Vector3(6.8, 2.6, -4.7), 0.3);
  cable(T(poleC), T(poleJ1), 0.5); cable(T(poleD), T(poleJ2), 0.4);
  const CABLE_FOR = [[c21, c1c], [cG, cA], [c13, c3s]];
  // festoon lights zig-zagging across the street between the poles
  const zig = [[poleC, poleA], [poleA, poleJ1], [poleJ1, poleE], [poleE, poleB], [poleB, poleJ2], [poleJ2, poleD], [poleC, poleE], [poleE, poleJ2]];
  for (const [a, b] of zig) lanternString(street, T(a).clone().add(new THREE.Vector3(0, -0.15, 0)), T(b).clone().add(new THREE.Vector3(0, -0.15, 0)), 14, 0.7, [0xffe08a, 0xffb35a, 0xfff3c0]);
  // --- near side (kept low so the far side stays visible): kottu stall, ice-cream cart, surfboard fence, juice bar, seafood grill
  function stall(x, z, w, color, name, signBg, signFg) {
    const g = new THREE.Group(); g.position.set(x, 0, z); street.add(g);
    const counter = mesh(new THREE.BoxGeometry(w, 0.9, 0.8), mat(color)); counter.position.y = 0.45; g.add(counter);
    for (const sx of [-1, 1]) { const p = mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.0, 5), mat(PAL.woodDark)); p.position.set(sx * (w / 2 - 0.05), 1.0, -0.3); g.add(p); }
    const roof = mesh(new THREE.BoxGeometry(w + 0.4, 0.12, 1.3), mat(PAL.thatch)); roof.position.set(0, 2.0, -0.1); roof.rotation.x = -0.15; g.add(roof);
    const sgn = signBoard(name, signBg, signFg, Math.min(w, 1.8), 0.36); sgn.position.set(0, 1.72, 0.25); sgn.rotation.y = 0; g.add(sgn);
    const bl = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: 0x6a5a40 })); bl.position.set(0, 1.5, -0.1); g.add(bl); bl.userData.on = 0xffe08a; streetLights.push({ userData: { bulbs: [bl] } });
    return g;
  }
  const kottu = stall(-3.0, 4.7, 1.8, 0x3a6ea5, 'KOTTU', '#f2c12e', '#2b2b2b');
  { const plate = mesh(new THREE.BoxGeometry(1.0, 0.05, 0.5), mat(0x444444)); plate.position.set(0, 0.93, 0.05); kottu.add(plate); const cook = person(0xf2efe6, 0x2f5fa8); cook.position.set(0, 0, -0.75); kottu.add(cook); people.push(cook); }
  const juice = stall(5.8, 4.6, 1.6, 0xf29b6b, 'JUICE', '#3fa06a', '#ffffff');
  for (let i = 0; i < 5; i++) { const f = mesh(new THREE.SphereGeometry(0.1, 6, 5), mat([0xf2c12e, 0x8bc34a, 0xff7a2e, 0xd0503c, 0xf2c12e][i])); f.position.set(-0.5 + i * 0.25, 0.98, 0.15); juice.add(f); }
  const grill = stall(8.4, 4.2, 1.6, 0x6b4a33, 'GRILL', '#1f1f1f', '#ff9a3c');
  { const coals = mesh(new THREE.BoxGeometry(1.0, 0.06, 0.4), new THREE.MeshBasicMaterial({ color: 0xff6a2a })); coals.position.set(0, 0.95, 0.1); grill.add(coals); }
  const iceCart = new THREE.Group(); iceCart.position.set(-6.9, 0, 3.6); iceCart.rotation.y = 0.3; street.add(iceCart);
  { const box = mesh(new THREE.BoxGeometry(0.8, 0.6, 0.6), mat(0xf2efe6)); box.position.y = 0.75; iceCart.add(box); const lid = mesh(new THREE.BoxGeometry(0.85, 0.08, 0.65), mat(0xe8862f)); lid.position.y = 1.08; iceCart.add(lid);
    for (const x of [-0.3, 0.3]) { const w = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 10), mat(0x222222)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.2, 0.32); iceCart.add(w); }
    const um = mesh(new THREE.ConeGeometry(0.7, 0.3, 8), mat(0xe8862f)); um.position.y = 1.9; iceCart.add(um); const up = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 5), mat(0x777777)); up.position.y = 1.45; iceCart.add(up); }
  const fence = new THREE.Group(); fence.position.set(1.4, 0, 4.0); street.add(fence);
  for (let i = 0; i < 9; i++) { const p = mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.2 + hash(i, 1, 4) * 0.3, 5), mat(PAL.woodDark)); p.position.set(-1.6 + i * 0.4, 0.6, 0); fence.add(p); }
  for (let i = 0; i < 3; i++) { const b = surfboard([0xf2d36b, 0xe8c45a, 0x9fd3c8][i], [0xc49a3a, PAL.red, PAL.blue][i]); b.rotation.set(-Math.PI / 2 + 0.12, 0, (i - 1) * 0.12); b.position.set(-1.0 + i * 0.9, 1.0, 0.18); fence.add(b); }
  const scoot = new THREE.Group(); scoot.position.set(7.0, 0, -2.6); scoot.rotation.y = Math.PI / 2; street.add(scoot);
  { const b = mesh(new THREE.BoxGeometry(0.35, 0.4, 1.2), mat(0xc8423b)); b.position.y = 0.45; scoot.add(b); const seat = mesh(new THREE.BoxGeometry(0.3, 0.1, 0.6), mat(0x222222)); seat.position.set(0, 0.7, -0.15); scoot.add(seat);
    for (const z of [-0.5, 0.5]) { const w = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 10), mat(0x222222)); w.rotation.z = Math.PI / 2; w.position.set(0, 0.2, z); scoot.add(w); } const hb = mesh(new THREE.BoxGeometry(0.6, 0.05, 0.05), mat(0x333333)); hb.position.set(0, 1.0, 0.5); scoot.add(hb); }
  const palm2 = palm(4.6, 0.8, deg(140)); palm2.position.set(-9.2, 0, 5.4); street.add(palm2); tag(palm2, { hidden: 'palm2' }); hiddenObjs.palm2 = palm2;
  for (const [x, z, h, l] of [[-4.6, 7.4, 4.0, 0.6], [3.6, 6.6, 3.6, 0.7], [10.4, 5.2, 3.8, 0.5], [-10.6, -4.2, 4.2, 0.9], [10.6, -3.8, 3.4, 0.5]]) { const p = palm(h, l, x); p.position.set(x, 0, z); street.add(p); }
  for (let i = 0; i < 6; i++) { const p = person([0x2e6db4, 0xe8862f, 0x9a3a6a, 0xf2efe6, 0x3fa06a, 0xd0503c][i], [0x333333, 0x2f5fa8, 0x7a5a3a, 0x333333, 0x333333, 0x2f5fa8][i]);
    p.position.set([-7.8, -1.0, 8.9, 3.4, 6.6, -4.2][i], 0, [-3.6, 5.6, 3.1, -3.9, 5.5, 3.2][i]); p.rotation.y = hash(i, 4, 1) * 6; street.add(p); people.push(p); }
  // traffic: two lanes, evenly spaced, same speed per lane, so nothing ever overlaps; they slip in and out under the palm arches at the ends
  function vehicle(kind, color) { const g = kind === 'tuk' ? tuk.clone() : scoot.clone(); g.traverse((o) => { if (o.isMesh && o.material.color && (o.material.color.getHex() === 0xa8432f || o.material.color.getHex() === 0xc8423b)) o.material = mat(color); }); g.children.forEach((c) => { if (c.userData.beacon) c.visible = false; }); street.add(g); return g; }
  for (const [kind, color, lane, ph, spd] of [['tuk', 0x2f7a4a, 1, 0, 2.8], ['scoot', 0x2e6db4, 1, 0.5, 2.8], ['tuk', 0xa8432f, -1, 0.13, 2.8], ['scoot', 0xe8862f, -1, 0.63, 2.8]]) {
    const v = vehicle(kind, color); v.userData = { lane, ph, spd, kind }; traffic.push(v); }
  const ROAD_LEN = 2 * RS;
  const vx = (v, t) => { const u = ((v.userData.ph * ROAD_LEN + t * v.userData.spd) % ROAD_LEN); return v.userData.lane > 0 ? -RS + u : RS - u; };
  const kerbMark = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.45, 24), new THREE.MeshBasicMaterial({ color: 0x55dd77, transparent: true, opacity: 0.0, depthWrite: false }));
  kerbMark.rotation.x = -Math.PI / 2; street.add(kerbMark);
  const CROSS_X = L.LOCAL.S_kerbN[0];
  // the four bulbs (in world space so they can fly to her)
  street.updateMatrixWorld(true);
  const bulbs = []; const bulbSpots = [
    () => fence.localToWorld(new THREE.Vector3(-0.1, 1.75, 0.28)),
    () => scoot.localToWorld(new THREE.Vector3(0, 0.88, -0.15)),
    () => shop.localToWorld(new THREE.Vector3(0.1, 0.9, 1.7)),
    () => palm2.userData.crown.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0.3, -0.4, 0.3)),
  ];
  for (let i = 0; i < 4; i++) { const b = bulb(); b.scale.setScalar(1.5); b.position.copy(bulbSpots[i]()); scene.add(b); bulbs.push(b); halo(b, 0xfff0a0, 0.18, 0.32).position.y = -0.12;
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); b.add(hit); tag(b, { hidden: 'b' + i }); b.userData.base = b.position.clone(); }
  const owner = person(0xf2efe6, 0x7a3a3a); owner.position.copy(toL(P('S_cafe'))).add(new THREE.Vector3(0.7, -0.06, -0.9)); owner.rotation.y = 0.35; street.add(owner); tag(owner, { item: 'owner' }); items.owner = owner;
  const streetLamp = new THREE.PointLight(0xffc27a, 0, 30); streetLamp.position.copy(SC).add(new THREE.Vector3(0, 6, 0)); scene.add(streetLamp);

  /* ---------- sky dressing: a far lighthouse, birds ---------- */
  const lighthouse = new THREE.Group(); lighthouse.position.set(-26, -2, -18); scene.add(lighthouse);
  { const t = mesh(new THREE.CylinderGeometry(0.8, 1.2, 7, 10), mat(PAL.white)); t.position.y = 3.5; lighthouse.add(t); const top = mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.9, 10), mat(0xc8423b)); top.position.y = 7.3; lighthouse.add(top); const isl = mesh(new THREE.ConeGeometry(4, 4, 8), mat(PAL.rockDark)); isl.rotation.x = Math.PI; isl.position.y = -2; lighthouse.add(isl); }

  /* ================= VIEW SYNC & STORY BEATS ================= */
  const nodePos = (id) => P(id);
  function surfaceTarget(kind, point) {
    if (kind === 'tuk') return L.areaOf(S.player) === 2 ? 'B_point' : 'S_enter'; // ride it up (or back down) the red road
    if (kind === 'surf') {
      if (!S.hasBoard) { label(S.boardBack ? 'Grab your surfboard from the sand first.' : 'A good little wave is breaking in the bay… if only you had your board.', 3200); E.bump(); return null; }
      if (S.tideLow) { label('The tide is too low to surf. Turn the moon-stone dial to bring the sea back in.', 3600); bubble(dial, 'moon', { offset: 1.6 }); E.bump(); return null; }
      return 'B_point';
    }
    const ids = Object.keys(L.NODES).filter((id) => (kind === 'street' ? id[0] === 'S' : id[0] === 'B'));
    let best = null, bd = 1e9; for (const id of ids) { const n = P(id); const d = Math.hypot(n.x - point.x, n.z - point.z) + Math.abs(n.y - point.y) * 0.6; if (d < bd) { bd = d; best = id; } } return best;
  }
  function edgePoints(e, from, to) {
    if (e.kind === 'surf') { const a = P(from), b = P(to), mid = V3(L.BAY_C).add(polar(1.0, deg(300), 0)); const out = []; const fwd = from === 'B_mid';
      const c = fwd ? [a, mid, b] : [b, mid, a]; const curve = new THREE.CatmullRomCurve3([c[0], c[0].clone().lerp(c[1], 0.5), c[1], c[1].clone().lerp(c[2], 0.6), c[2]]);
      for (let i = 1; i <= 40; i++) { const p = curve.getPoint(i / 40); p.y = (i < 3 || i > 37) ? p.y : tide.level + 0.12; out.push(p); } return fwd ? out : out.reverse(); }
    if (e.kind === 'tuk') { const a = P(from), b = P(to); const out = []; const path = from === 'B_point' ? [roadA, roadB, b] : [roadB, roadA, b];
      let prev = a; for (const q of path) { const n = Math.max(2, Math.round(prev.distanceTo(q) / 0.5)); for (let k = 1; k <= n; k++) out.push(prev.clone().lerp(q, k / n)); prev = q; } return out; }
    return null;
  }
  // timed crossing: wait at the kerb until there is a gap in the traffic
  const clockT = { t: 0 };
  function gapAt(x, t) { for (const v of traffic) { const d = vx(v, t) - x; const dir = v.userData.lane; const ahead = d * dir; if (ahead < 1.0 && ahead > -4.0) return false; } return true; }
  function holdEdge(e, c) { if (e.kind !== 'cross' || c.d > 0) return false; const ok = gapAt(CROSS_X, clockT.t) && gapAt(CROSS_X, clockT.t + 0.8); c.waiting = !ok; if (!ok && !c.told) { c.told = true; label('Tuk-tuks and scooters zip past. Wait for a gap…', 2600); } return !ok; }
  function onEdgeStart(e) {
    if (e.kind === 'surf') { surfingNow = true; carriedBoard.visible = true; label('You paddle out, turn, and catch the last wave of the day…', 3800); E.sfx.rush(4.5); E.sfx.whoosh(2.5); [0, 2, 4, 7].forEach((n, i) => E.sfx.pluck(n, { vol: 0.05, delay: 0.6 + i * 0.5, far: 0.3 })); }
    if (e.kind === 'tuk') { tukRide = true; E.audio.ctx && E.audio.motor({ f: 62, f2: 74, rate: 18, dur: 6.5, vol: 0.045, attack: 0.6, release: 1.5, lp: 600, bus: 'sfx', far: 0.1 }); label('“Main street? Hari, hari.” The tuk-tuk putters up the red road.', 4200); }
  }
  let tukRide = false, surfingNow = false;
  function onArrive(node, e, stop) {
    if (e && e.kind === 'surf') { surfingNow = false; carriedBoard.visible = S.hasBoard; label(node === 'B_point' ? 'You ride it all the way to the surf point. A tuk-tuk is waiting on the red road: <b>tap the tuk-tuk</b> to ride up to the main street.' : 'Back on the beach.', 6000); if (node === 'B_point') setTimeout(() => sparkle(tuk, 3), 800); }
    if (e && e.kind === 'tuk') { tukRide = false; if (node === 'S_enter') { label('Hiriketiya main street. Every café is in candlelight: <em>current giya</em>, the power has gone out.', 5600); setTimeout(() => bubble(owner, 'bulb', { count: 4, filled: S.bulbs, offset: 2.0 }), 2000); } }
    const ev = stop ? L.stepOn(S, node) : null; // plates only react when she stands on them
    if (ev && ev.k === 'awning') { E.progress(); E.sfx.lever(); E.sfx.flutter(5); E.sfx.pluck(ev.on ? 4 : 1, { vol: 0.05, delay: 1.1 }); const r0 = awning.rotation.x, r1 = ev.on ? AWN_DOWN : AWN_UP;
      anims.push({ t: 0, dur: 1.3, f: (k) => (awning.rotation.x = r0 + (r1 - r0) * k) }); const p0 = plate.userData.p.position.y; anims.push({ t: 0, dur: 0.3, f: (k) => (plate.userData.p.position.y = p0 + ((ev.on ? -0.04 : 0) - p0) * k) });
      label(ev.on ? 'The board creaks under your feet, and the thatched awning swings down into a bridge to the electric pole.' : 'You step on the board again and the awning swings back up.', 4200); }
  }
  const MSG = {
    tideLow: 'You turn the moon-stone dial. The sea draws back and a path of reef rocks rises out of the bay.',
    tideHigh: 'You turn the dial back. The tide rolls in and covers the reef.',
    tideHighBoard: 'The tide rolls in, the oru floats, and the fisherman paddles out to the reef…',
    gotPaddle: 'His paddle, wedged between the rocks of the pool.',
    fisherNeeds: '“My paddle is lost on the reef, and the net floats are scattered everywhere. No fishing tonight…”',
    fisherWaits: '“Bohoma sthuthi! Now, bring the tide in and I’ll fetch that board of yours from the reef.”',
    fisherGoes: '“Bohoma sthuthi! The tide is in. Wait here, I’ll fetch that board of yours.”',
    gotBoard: 'Your board, back on the sand. The swell is building for one last wave.',
    needBulbs: '“The power’s gone, and half the bulbs are smashed anyway. Can you find me four good ones?”',
    bulbsIn: '“Perfect!” The owner screws the bulbs into the string lights. Now the generator needs a cable to every café.',
    turned: 'Click. The junction box turns.', wired: 'Click. All three junction boxes line up and the cables hum faintly.',
    genNoBulbs: 'The generator is ready, but the café’s string lights are missing their bulbs.',
    genNoWire: 'The cable runs nowhere yet. The three junction boxes need lining up first.',
  };
  function onResult(r, what) {
    switch (r) {
      case 'tideLow': case 'tideHigh': case 'tideHighBoard': {
        const d = dial.userData.disc; const z0 = d.rotation.z; E.sfx.rush(3); anims.push({ t: 0, dur: 1.4, f: (k) => (d.rotation.z = z0 + k * Math.PI) }); grind(1.2);
        tide.target = S.tideLow ? LOW : HIGH; if (S.tideLow) setTimeout(() => sparkle(paddle, 2), 1600);
        if (r === 'tideHighBoard') setTimeout(fetchBoard, 1500); break; }
      case 'gotPaddle': paddle.visible = false; carriedPaddle.visible = true; E.sfx.pickup(); break;
      case 'fisherNeeds': metFisher = true; bubble(fisher, 'float', { count: 4, filled: S.floats, offset: 1.6 }); setTimeout(() => bubble(fisher, 'paddle', { offset: 1.6 }), 2900); bump(); break;
      case 'fisherWaits': carriedPaddle.visible = false; giveFloats(); bubble(fisher, 'wave', { offset: 1.6 }); E.sfx.place(); E.sfx.splash(); pushCanoe(); break;
      case 'fisherGoes': carriedPaddle.visible = false; giveFloats(); E.sfx.place(); E.sfx.splash(); pushCanoe(); setTimeout(fetchBoard, 1200); break;
      case 'gotBoard': board.visible = false; carriedBoard.visible = true; E.sfx.pickup(); bubble(girl, 'wave', { offset: 2.1 }); setTimeout(() => { sparkle(surfWave, 3); label('A wave is building in the bay. <b>Tap the glowing wave</b> to paddle out and ride it.', 5200); }, 2200); break;
      case 'needBulbs': bubble(owner, 'bulb', { count: 4, filled: S.bulbs, offset: 2.0 }); bump(); break;
      case 'bulbsIn': girl.userData.orbit.clear(); E.sfx.place(); [4, 6, 8].forEach((n, i) => E.sfx.pluck(n, { vol: 0.05, delay: 0.15 + i * 0.12 })); streetLights.forEach((sl) => sl.userData.bulbs.forEach((b) => b.material.color.setHex(0xb8a070))); break;
      case 'turned': case 'wired': { const i = +what[1] - 1; const d = junction[i].userData.dial; const z0 = d.rotation.z; anims.push({ t: 0, dur: 0.35, f: (k) => (d.rotation.z = z0 - k * Math.PI / 2) }); click(); E.stats.turns++; syncWires(); if (r === 'wired') bell(988); break; }
      case 'genNoBulbs': bubble(gen, 'bulb', { offset: 1.4 }); bump(); break;
      case 'genNoWire': bubble(gen, 'bolt', { offset: 1.4 }); junction.forEach((j) => sparkle(j, 1)); bump(); break;
      case 'win': lightUp(); E.win(); break;
    }
  }
  function syncWires() { CABLE_FOR.forEach((cs, i) => { const ok = S.J[i] === L.J_GOAL[i]; junction[i].userData.led.material.color.setHex(ok ? 0x55ee77 : 0x553333); cs.forEach((c) => c.material.emissive.setHex(ok && S.bulbsIn ? 0x442200 : ok ? 0x221100 : 0)); }); }
  function pushCanoe() { const a = canoe.position.clone(), b = V3(L.BAY_C).add(polar(4.4, deg(226), 0)); anims.push({ t: 0, dur: 1.6, f: (k) => { canoe.position.lerpVectors(a, b, k); canoe.position.y = S.tideLow ? 0 : tide.level - 0.12; } });
    fisher.userData.pushing = true; const f0 = fisher.position.clone(); anims.push({ t: 0, dur: 1.6, f: (k) => fisher.position.lerpVectors(f0, b.clone().add(polar(0.2, deg(226), 0.15)), k) }); }
  function fetchBoard() { // the oru glides out to the reef, picks up the board, and comes back
    const home = canoe.position.clone(), reef = board.position.clone().add(polar(0.8, deg(210), 0)); const fh = fisher.position.clone();
    label('The fisherman paddles out to the reef…', 3000);
    anims.push({ t: 0, dur: 3.2, f: (k) => { const p = home.clone().lerp(reef, Math.sin(k * Math.PI / 2)); canoe.position.set(p.x, tide.level - 0.12, p.z); fisher.position.set(p.x, tide.level + 0.18, p.z); },
      done: () => { anims.push({ t: 0, dur: 3.2, f: (k) => { const p = reef.clone().lerp(home, k); canoe.position.set(p.x, tide.level - 0.12, p.z); fisher.position.set(p.x, tide.level + 0.18, p.z); board.position.copy(p).add(new THREE.Vector3(0, 0.5, 0)); },
        done: () => { board.position.copy(boardOnSand.pos); board.rotation.set(0, boardOnSand.rot, 0); fisher.position.copy(fh); sparkle(board, 3); label('He drops your board on the sand with a grin. “Last wave of the day, nangi!”', 4600); E.refresh(); } }); } });
  }
  function giveFloats() { // the floats circling her fly over to the fisherman's net
    const orbit = girl.userData.orbit; const kids = [...orbit.children]; if (!kids.length) return;
    const to = fisher.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.6, 0));
    kids.forEach((c, i) => { const from = c.getWorldPosition(new THREE.Vector3()); orbit.remove(c); scene.add(c); c.position.copy(from);
      anims.push({ t: -i * 0.12, dur: 0.8, f: (e) => { e = Math.max(0, e); c.position.lerpVectors(from, to, e); c.position.y += Math.sin(e * Math.PI) * 0.8; c.scale.setScalar(0.55 * (1 - e * 0.7)); }, done: () => scene.remove(c) }); });
  }
  function lightUp() {
    document.body.classList.add('won'); streetAlive = true; if (E.audio.ctx) { E.sfx.lever(); E.audio.motor({ f: 48, f2: 52, rate: 30, dur: 2.2, vol: 0.05, attack: 0.15, release: 0.6, lp: 500, bus: 'sfx' }); } E.shake(0.3);
    const ex = gen.userData.ex; anims.push({ t: 0, dur: 0.6, lin: true, f: (k) => (ex.position.y = 0.9 + Math.sin(k * 30) * 0.03) });
    cables.forEach((c) => c.material.emissive.setHex(0x553300));
    const all = streetLights.flatMap((sl) => sl.userData.bulbs).concat(cafe.userData.lights.userData.bulbs);
    all.sort((a, b) => a.getWorldPosition(new THREE.Vector3()).distanceTo(gen.getWorldPosition(new THREE.Vector3())) - b.getWorldPosition(new THREE.Vector3()).distanceTo(gen.getWorldPosition(new THREE.Vector3())));
    all.forEach((b, i) => setTimeout(() => { b.material.color.setHex(b.userData.on || 0xffe08a); if (i % 9 === 0) E.sfx.pluck(4 + ((i / 9) | 0) % 8, { vol: 0.04, far: 0.4 }); }, 1200 + i * 18));
    setTimeout(() => { warmLights.forEach((m) => { if (m.isMaterial) { m.emissive.setHex(0xffb35a); m.emissiveIntensity = 0.9; } else m.intensity = 0; }); signs.forEach((m) => (m.emissiveIntensity = 0.9)); streetLamp.intensity = 80; }, 1200 + all.length * 18);
    for (let i = 0; i < 4; i++) { const p = person([0x9a3a6a, 0x3fa06a, 0xf2c12e, 0x2e6db4][i], [0x333333, 0x7a5a3a, 0x2f5fa8, 0x333333][i]); p.position.copy(s2(-7 + i * 4.3, 0, 0)).setZ(i % 2 ? 3.4 : -3.5); p.scale.setScalar(0.001); street.add(p);
      anims.push({ t: 0, dur: 0.6, f: (k) => p.scale.setScalar(Math.max(0.001, k)) }); }
    let turns = 0; const spin = setInterval(() => { cam.azTo += Math.PI / 2; if (++turns >= 4) clearInterval(spin); }, 2600);
    E.playAction('wave', { speed: 1 });
  }
  // hidden taps
  function tapHidden(k, obj) {
    const r = L.tap(S, k); if (!r) { if (k === 'f3' && !S.tideLow) label('Something orange glints under the water in the rock pool.', 3000); return; }
    E.progress();
    if (r === 'palmDrop') { const pm = k === 'palm1' ? palm1 : palm2; const thing = k === 'palm1' ? floats[2] : bulbs[3]; const to = (k === 'palm1' ? P('B_palm').add(polar(0.7, deg(205), 0.2)) : s2w(-8.4, 4.4, 0.25));
      const cr = pm.userData.crown; anims.push({ t: 0, dur: 0.6, lin: true, f: (e) => (cr.rotation.z = Math.sin(e * Math.PI * 5) * 0.12 * (1 - e)) }); E.sfx.flutter(9); setTimeout(() => E.sfx.thunk(), 900);
      const from = thing.position.clone(); anims.push({ t: 0, dur: 1.0, f: (e) => { thing.position.lerpVectors(from, to, e); thing.position.y = from.y + (to.y - from.y) * e * e; }, done: () => { thing.userData.base = to.clone(); sparkle(thing, 2); } });
      label(k === 'palm1' ? 'You shake the palm. Something orange tumbles out of the crown.' : 'You give the palm a shake. A bulb drops out of the fronds!', 3000); return; }
    if (r === 'leaf') { leaf.visible = false; E.sfx.found(4); label('<em>Puskola</em> · an ancient ola-leaf page, tucked in the thatch'); E.refresh(); return; }
    const isF = r === 'float'; const thing = (isF ? floats : bulbs)[+k.slice(1)];
    E.sfx.found(isF ? S.floats : S.bulbs + 1);
    const from = thing.position.clone(); thing.userData.taken = true;
    anims.push({ t: 0, dur: 0.9, f: (e) => { const to = girl.userData.orbit.getWorldPosition(new THREE.Vector3()); thing.position.lerpVectors(from, to, e); thing.position.y += Math.sin(e * Math.PI) * 1.2; thing.scale.setScalar(1.2 - e * 0.7); },
      done: () => { thing.visible = false; const mini = isF ? netFloat() : bulb(true); mini.scale.setScalar(0.55); girl.userData.orbit.add(mini); E.refresh(); } });
    label(isF ? `A net float (${S.floats}/4)` : `A light bulb (${S.bulbs}/4)`, 1800);
  }
  const actionFor = { paddle: () => !S.hasPaddle && 'pickup', board: () => S.boardBack && !S.hasBoard && 'pickup', fisher: () => S.hasPaddle && S.floats >= 4 && !S.fisherOk && 'place',
    owner: () => S.bulbs >= 4 && !S.bulbsIn && 'place', j1: () => 'place', j2: () => 'place', j3: () => 'place', gen: () => S.bulbsIn && L.wired(S) && 'place', dial: () => 'place' };
  function unreachable(what) {
    if (what === 'paddle') { label('The paddle is out on the reef, but the tide covers the rocks.', 3600); bubble(dial, 'moon', { offset: 1.6 }); }
    else if (what === 'j1') { label('That junction box is high up on the pole. There’s no way up from the street.', 3800); }
    else if (what === 'fisher' || what === 'owner') E.bump();
  }
  let metFisher = false; // once you've heard what he needs, the hint moves on to the floats
  function hintTarget() {
    const f = (i) => floats[i], left = [0, 1, 2, 3].filter((i) => !S.floatTaken[i]);
    if (!S.won && L.areaOf(S.player) === 1 && S.player !== 'B_point') {
      if (!S.fisherOk) {
        if (S.floats === 0 && !S.hasPaddle && !metFisher) return { obj: fisher, words: ['The fisherman by the blue canoe needs help. Tap him.'] };
        const vis = left.filter((i) => (i !== 2 || S.palm1) && (i !== 3 || S.tideLow));
        if (vis.length) return { obj: f(vis[0]), words: ['Orange net floats hide around the bay: at the café, behind the canoe, in a palm and in the rock pool. Turn the view.'] };
        if (!S.palm1) return { obj: palm1, words: ['Something orange is tangled in a palm crown. Tap the palm to shake it.'] };
        if (!S.tideLow && (!S.hasPaddle || left.includes(3))) return { obj: dial, words: ['The moon-stone dial on the rocks controls the tide. Turn it to low tide.'] };
        if (!S.hasPaddle) return { obj: paddle, words: ['The paddle is wedged in the rock pool out on the reef.'] };
        return { obj: fisher, words: ['Take the paddle and floats back to the fisherman.'] };
      }
      if (!S.boardBack) return { obj: dial, words: ['Bring the tide back in so his canoe can float.'] };
      if (!S.hasBoard) return { obj: board, words: ['Pick up your surfboard.'] };
      if (S.tideLow) return { obj: dial, words: ['You need high tide to surf. Turn the dial.'] };
      return { obj: surfWave, words: ['Tap the glowing wave in the bay to paddle out and ride it to the surf point.'] };
    }
    if (S.player === 'B_point') return { obj: tuk, words: ['Tap the tuk-tuk to ride it up the red road to the main street.'] };
    if (!S.bulbsIn) {
      const vis = [0, 1, 2, 3].filter((i) => !S.bulbTaken[i] && (i !== 3 || S.palm2));
      if (S.bulbs >= 4) return { obj: owner, words: ['Give the bulbs to the café owner.'] };
      if (vis.length) return { obj: bulbs[vis[0]], words: ['Bulbs hide along the street: on the surfboard fence, a scooter seat, in a shop window… and up a palm.'] };
      return { obj: palm2, words: ['Something glints in the palm by the road. Give it a shake.'] };
    }
    if (!L.wired(S)) { const i = S.J.findIndex((v, k) => v !== L.J_GOAL[k]);
      if (i === 0 && !S.awning) return { obj: plate, words: ['The high junction box needs a way up. Try standing on the board on the café balcony.'] };
      return { obj: junction[i], words: ['Turn each junction box until its light goes green.'] }; }
    return { obj: gen, words: ['Pull the generator cord!'] };
  }
  function inventory(s) { return { float: !s.fisherOk && s.floats ? `${s.floats}/4` : '', paddle: s.hasPaddle, board: s.hasBoard && L.areaOf(s.player) === 1, bulb: !s.bulbsIn && s.bulbs ? `${s.bulbs}/4` : '', leaf: s.has.leaf }; }

  /* ---------- camera framing & time of day ---------- */
  const tod = { k: 0 }; // 0 golden hour → 1 night
  function focus() {
    let f = L.areaOf(S.player) === 2 ? 1 : 0;
    if (tukRide) { const a = roadA, b = roadB, d = b.clone().sub(a); const rel = girl.position.clone().sub(a); f = THREE.MathUtils.clamp(rel.dot(d) / d.lengthSq(), 0, 1); }
    const k = f * f * (3 - 2 * f);
    return { target: new THREE.Vector3(1.6, 1.2, 1.6).lerp(SC.clone().add(new THREE.Vector3(0, 1.6, 0)), k), zoom: 1 - 0.02 * k, k, pz: 1.12 - 0.2 * k };
  }
  const skyGold = { sun: new THREE.Color(0xffd6a0), hemi: new THREE.Color(0xfff0dc), fog: new THREE.Color(0xf6dcc0) };
  const skyNight = { sun: new THREE.Color(0x8f86c8), hemi: new THREE.Color(0x6f6aa8), fog: new THREE.Color(0x4a3f66) };
  function tick(dt, t) {
    clockT.t += dt;
    // tide
    if (Math.abs(tide.level - tide.target) > 0.001) tide.level += (tide.target - tide.level) * Math.min(1, dt * 0.9);
    water.position.y = tide.level + Math.sin(t * 0.8) * 0.015;
    water.children.forEach((c) => { if (c.userData.foam !== undefined) { const i = c.userData.foam; c.scale.setScalar(1 + ((t * 0.12 + i / 3) % 1) * 0.35); c.material.opacity = 0.6 * (1 - ((t * 0.12 + i / 3) % 1)); } });
    if (!floats[3].userData.taken) floats[3].visible = S.tideLow;
    // bob the hidden things a little so the eye catches them
    floats.forEach((f, i) => { if (!f.userData.taken && f.userData.base) f.position.y = f.userData.base.y + Math.sin(t * 2 + i) * 0.04; });
    bulbs.forEach((b, i) => { if (!b.userData.taken && b.userData.base) b.position.y = b.userData.base.y + Math.sin(t * 2.4 + i) * 0.04; });
    if (!S.boardBack && !S.fisherOk) { board.position.y = tide.level - 0.05 + Math.sin(t * 1.5) * 0.04; board.rotation.z = 0.2 + Math.sin(t) * 0.05; }
    if (!S.fisherOk) fisher.userData.head.rotation.y = Math.sin(t * 0.7) * 0.4;
    canoe.rotation.z = !S.fisherOk ? 0 : Math.sin(t * 1.3) * 0.04;
    for (const w of walkers) if (w.kind === 'palm') w.o.rotation.x = Math.sin(t * 0.9 + w.seed) * 0.05;
    // carried board: under her arm on land, under her feet when surfing
    const surfing = surfingNow;
    if (carriedBoard.visible) { if (surfing) { carriedBoard.position.set(0, 0.02, 0); carriedBoard.rotation.set(0, 0, 0); carriedBoard.scale.setScalar(1.15); }
      else { carriedBoard.position.set(0.42, 0.95, 0); carriedBoard.rotation.set(Math.PI / 2 - 0.15, 0, 0); carriedBoard.scale.setScalar(0.8); } }
    // the tuk-tuk carries her
    if (tukRide) { tuk.position.copy(girl.position).setY(girl.position.y + (girl.position.z < 20 ? 0 : 0)); tuk.rotation.y = girl.rotation.y; if (E.hero.model) E.hero.model.visible = false; girl.userData.shadow.visible = false; }
    else { if (E.hero.model) E.hero.model.visible = true; girl.userData.shadow.visible = true; }
    if (!tukRide && L.areaOf(S.player) === 2 && tuk.position.distanceTo(P('S_enter')) > 3) { tuk.position.copy(s2w(9.6, 4.3, 0)); tuk.rotation.y = L.ST_ROT - Math.PI / 2; }
    // traffic
    traffic.forEach((v) => { const x = vx(v, clockT.t); v.position.set(x, 0, v.userData.lane * 0.7); v.rotation.y = v.userData.lane > 0 ? Math.PI / 2 : -Math.PI / 2; v.scale.setScalar(THREE.MathUtils.clamp((RS - 0.6 - Math.abs(x)) / 1.4, 0.001, 1)); });
    // kerb marker: green when it's safe to cross
    { const near = S.player === 'S_kerbN' || S.player === 'S_kerbF'; const ok = gapAt(CROSS_X, clockT.t) && gapAt(CROSS_X, clockT.t + 0.8);
      kerbMark.position.copy(toL(P(S.player === 'S_kerbF' ? 'S_kerbF' : 'S_kerbN'))).setY(0.08); kerbMark.material.opacity = near && L.areaOf(S.player) === 2 ? 0.85 : 0; kerbMark.material.color.setHex(ok ? 0x55dd77 : 0xe0604a); }
    // junction dials glow when they need turning
    gen.userData.beacon.visible = S.bulbsIn && L.wired(S) && !S.won;
    tukBeacon.visible = S.player === 'B_point' && !tukRide;
    { const ready = S.hasBoard && !S.tideLow && S.player !== 'B_point' && L.areaOf(S.player) === 1 && !surfingNow; surfWave.userData.beacon.visible = ready; pointRing.visible = ready;
      if (ready) { pointRing.material.opacity = 0.5 + 0.4 * Math.sin(t * 3); pointRing.scale.setScalar(1.6 + 0.3 * Math.sin(t * 3)); }
      surfWave.visible = !S.tideLow; surfWave.position.y = tide.level + Math.sin(t * 1.6) * 0.06; surfWave.children[0].rotation.z = Math.sin(t * 1.6) * 0.05; }
    // time of day follows the camera from the bay to the street
    const fk = focus().k; tod.k += ((S.won ? 1 : fk) - tod.k) * Math.min(1, dt * 0.8);
    document.body.classList.toggle('dusk', tod.k > 0.5);
    sun.color.copy(skyGold.sun).lerp(skyNight.sun, tod.k); sun.intensity = 2.2 - tod.k * 1.7; hemi.color.copy(skyGold.hemi).lerp(skyNight.hemi, tod.k); hemi.intensity = 1.5 - tod.k * 0.85; fill.intensity = 0.45 - tod.k * 0.3;
    scene.fog.color.copy(skyGold.fog).lerp(skyNight.fog, tod.k);
    warmLights.forEach((m) => { if (m.isLight && m.userData.candle && !S.won) m.intensity = (0.6 + Math.sin(t * 13 + m.id) * 0.15) * (0.4 + tod.k * 2); });
    cafe.userData.lights.userData.bulbs.forEach((b, i) => { if (!S.won) b.material.color.setHex(tod.k > 0.3 ? 0xffd27a : 0x6a5a40); });
    if (!S.won) syncWires();
  }

  /* ---------- sound ---------- */
  let streetAlive = false;
  const inBay = () => (S.player[0] === 'B' ? 1 : 0);
  function sound(A) { // the bay at golden hour: slow waves and palms; the street at dusk: crickets, geckos, passing tuk-tuks; then café life
    const waves = A.loop({ color: 'pink', type: 'lowpass', f: 520, q: 0.5, vol: 0.05, lfo: [0.11, 0.7] });
    const wash = A.loop({ color: 'white', f: 1500, q: 0.5, vol: 0.008, lfo: [0.11, 0.8], pan: 0.3 });
    const palms = A.loop({ color: 'white', f: 3800, q: 0.4, vol: 0.002, lfo: [0.07, 0.6], pan: -0.3 });
    const night = A.loop({ color: 'pink', f: 380, q: 0.5, vol: 0, lfo: [0.05, 0.3] });
    const cafe = A.loop({ color: 'pink', f: 650, q: 1.4, vol: 0, lfo: [2.3, 0.5] });
    const hum = A.loop({ color: 'brown', type: 'lowpass', f: 120, q: 0.5, vol: 0 });
    A.every([5, 11], () => inBay() && A.bird('bulbul', { vol: 0.8 }), 4);
    A.every([2.5, 6], () => inBay() && A.bird('chirp', { vol: 0.7 }), 2);
    A.every([30, 50], () => inBay() && A.bird('koel', { vol: 0.6, far: 0.7 }), 15);
    A.every([1, 2.5], () => !inBay() && A.bird('cricket', { far: 0.4 }));
    A.every([9, 20], () => !inBay() && A.bird('gecko', { far: 0.25 }), 6);
    A.every([3.5, 7], () => { if (inBay()) return; const sc = Math.random() < 0.4, l = Math.random() < 0.5 ? -1 : 1;
      A.motor(sc ? { f: 120, f2: 105, rate: 40, dur: 2.6, vol: 0.016, lp: 900, pan: [-0.8 * l, 0.8 * l], depth: 0.3 } : { f: 66, f2: 60, rate: 17, dur: 3.2, vol: 0.02, lp: 600, pan: [-0.8 * l, 0.8 * l] });
      if (Math.random() < 0.12) A.osc('triangle', 440, A.now(1.2), 0.18, { bus: 'amb', vol: 0.008, lp: 1500, far: 0.4, pan: 0.3 * l }); }, 2);
    A.every([2, 5], () => streetAlive && !inBay() && [0, 1].forEach((i) => A.osc('sine', A.rnd(2600, 3400), A.now(i * 0.09), 0.08, { bus: 'amb', vol: 0.006, far: 0.4, pan: A.rnd(-0.5, 0.5) })));
    return { update() { const b = inBay();
      waves.to(0.05 * (b ? 1 : 0.15)); wash.to(0.008 * (b ? 1 : 0.1)); palms.to(0.002 * b); night.to(0.012 * (1 - b));
      cafe.to(streetAlive && !b ? 0.012 : 0); hum.to(streetAlive && !b ? 0.03 : 0, 2); } };
  }
  function surfaceAt(pos, cur) {
    const ids = cur ? [cur.from, cur.to] : [];
    if (ids.some((i) => i === 'B_reef' || i === 'B_pool')) return 'water';
    if (ids.some((i) => i === 'S_balc' || i === 'S_pole' || i === 'S_stair')) return 'wood';
    return ids.some((i) => i && i[0] === 'S') ? 'stone' : 'sand';
  }
  return { sound, surfaceAt, nodePos, surfaceTarget, edgePoints, holdEdge, onEdgeStart, onArrive, onResult, tapHidden, actionFor, items, unreachable, hintTarget, inventory, focus, tick, MSG,
    reachCap: { fisher: 0.9, owner: 1.3, gen: 0.8 }, tod };
}
