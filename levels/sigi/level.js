// Chapter V: Sigiriya, "The Lion Rock". Scene, story beats, hints. Rules live in logic.js.
import * as L from './logic.js';
import HERO_GLB from './heroine.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const PAL = {
  grass: 0x7fa45a, grass2: 0x6a9448, pave: 0xd9c9a6, paveDark: 0xc4b08a, brick: 0xb0603a, brickDark: 0x8a4a30, rock: 0xb8774a, rockDark: 0x8e5a3a, rockGrey: 0x8a8278,
  water: 0x5fb0c4, waterDeep: 0x3f8aa8, lotus: 0xe88aa8, bronze: 0xc8923a, polished: 0xf6ead0, dull: 0xa8744a, jungle: 0x3f7a3a, jungle2: 0x5a9a48, iron: 0x3a3a3a,
  frangi: 0xf6efe0, hornet: 0x2a2018, gold: 0xe0b44a, cream: 0xf2e6c4,
};
const svg = (paths) => paths.map((p) => { const [d, c] = p.split('#'); return `<path d="${d}" fill="#${c}"/>`; }).join('');
const ICONS = {
  cloth: ['M6 8h20v16H6z#e8dcc0', 'M6 8l20 16H6z#d8c8a0', 'M22 4h6v8h-6z#a8744a'],
  sun: ['M16 6a10 10 0 100 20 10 10 0 000-20z#f3c34a'],
  drop: ['M16 4c5 8 9 12 9 17a9 9 0 01-18 0c0-5 4-9 9-17z#5fa9d0'],
  lotus: ['M16 26c-6 0-10-3-10-6 4 0 7 2 10 6z#e88aa8', 'M16 26c6 0 10-3 10-6-4 0-7 2-10 6z#e88aa8', 'M16 26c-3-4-3-10 0-16 3 6 3 12 0 16z#f4b4c8'],
  verse: ['M7 5h18v22H7z#e8d8b0', 'M10 10h12v1.6H10zM10 14h10v1.6H10zM10 18h12v1.6H10z#8a6a44'],
  hornet: ['M16 8a6 8 0 100 16 6 8 0 000-16z#e0b44a', 'M10 14h12v2H10zM10 18h12v2H10z#2a2018'],
  path: ['M12 4h8v24h-8z#d9c9a6'],
};
const SLOTS = [{ id: 'cloth', title: 'Painter’s cloth', svg: svg(ICONS.cloth) }, { id: 'verse', title: 'Mirror Wall verses', svg: svg(ICONS.verse), count: true },
  { id: 'lotus', title: 'Fresco flowers (the order)', svg: svg(ICONS.lotus), count: true },
  { id: 'leaf', title: 'Ola-leaf page (secret)', svg: '<rect x="3" y="12" width="26" height="8" rx="2" fill="#d9be8a"/><path d="M6 15h18M6 17.5h14" stroke="#8a6a44" stroke-width="1"/>' }];
const CSS = `body.sigi{--sky-top:#a8d4ea;--sky-mid:#eaf2ee;--sky-bot:#cfe2c0;--accent:#b0603a}
body.sigi.noon{--sky-top:#8cc4e6;--sky-mid:#f2f0e2;--sky-bot:#e6d8b0}
body.sigi.dusk{--sky-top:#f3b07a;--sky-mid:#f8dcb0;--sky-bot:#d8c890}
body.sigi.won{--sky-top:#3d3a6a;--sky-mid:#d0789a;--sky-bot:#f3a85a}
#panel{position:fixed;left:16px;bottom:16px;z-index:6;max-width:340px;font-size:13px;line-height:1.5;padding:10px 12px;pointer-events:none;display:none}
#panel.on{display:block}#panel b.h{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-soft)}
#panel .bar{display:inline-block;height:9px;border-radius:4px;vertical-align:middle;margin-left:3px}
#panel .ok{color:#2f8a4a;font-weight:700}#panel .no{color:#b8432f;font-weight:700}#panel .fl{display:inline-block;padding:1px 7px;border-radius:9px;margin:1px 2px;font-weight:700;font-size:12px}
@media (max-width:600px){#panel{max-width:62vw;font-size:12px}}`;

const FL_COL = { jasmine: '#f6f2e6', lotus: '#f0a0b8', lily: '#7aa6e0', araliya: '#f6d27a' };
const FL_NAME = { jasmine: 'white jasmine (pichcha)', lotus: 'pink lotus (nelum)', lily: 'blue water lily (nil manel)', araliya: 'frangipani (araliya)' };

export default {
  heroGlb: HERO_GLB, slots: SLOTS, icons: ICONS, logic: L,
  meta: {
    chapter: 'V', place: 'Sigiriya', title: 'The Lion Rock', tagline: 'Gardens, mirrors and a palace in the sky.', bodyClass: 'sigi', css: CSS,
    intro: 'Fifteen centuries ago a king built his palace on top of a 200-metre rock, with water gardens at its feet, a polished Mirror Wall, painted maidens and a staircase through the jaws of a giant lion. The old water engineering still works, if you can wake it. This is the hardest chapter: three areas, and they depend on each other.',
    howto: ['<b>Your reflection</b> walks the other half of the water garden, copying every step unless its way is blocked. Tap the pool to bring it back level with you.',
      '<b>Turn the view</b> (swipe or the arrows). Some stairways only join up when you look at them from the right side.',
      '<b>Light</b> travels in straight lines and bounces off bronze mirrors and polished panels.',
      '<b>Remember</b> what the painted maidens hold: you will need it at the top.', 'Mechanisms switch back the same way. The hint bulb helps if you are stuck.'],
    startLabel: 'Morning at the water gardens. Look into the long pool: your reflection is waiting on the other side.',
    winTitle: 'The Lion Rock wakes', winSub: 'Water from the summit cistern fills every fountain below', inviteNode: 'g14', camStart: [0, 1.4, 0], fog: 0xe6eee6, winDelay: 10000, frame: 1.05,
  },
  build,
};

function build(E) {
  const { THREE, S, scene, mat, mesh, tag, hash, canvasTex, bubble, sparkle, beacon, halo, label, bell, grind, click, bump, anims, girl, hemi, sun, cam, $ } = E;
  const V3 = (a) => new THREE.Vector3(...a);
  const P = (id) => V3(L.NODES[id]);
  const C2 = V3(L.C2), C3 = V3(L.C3);
  const at2 = (x, y, z) => C2.clone().add(new THREE.Vector3(x, y, z));
  const at3 = (x, y, z) => C3.clone().add(new THREE.Vector3(x, y, z));
  const items = {};
  const glow = (c, o = 0.9) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false });

  /* ---------- builders ---------- */
  function islandBase(c, R, depth, color, sx = 1, sz = 1) { const g = mesh(new THREE.CylinderGeometry(R, R * 0.28, depth, 22, 3, true), mat(color)); g.scale.set(sx, 1, sz); g.position.set(c.x, c.y - depth / 2 - 0.42, c.z); scene.add(g);
    const p = g.geometry.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < depth / 2 - 0.01) { p.setX(i, p.getX(i) * (0.88 + hash(i, 1, c.x) * 0.24)); p.setZ(i, p.getZ(i) * (0.88 + hash(i, 2, c.z) * 0.24)); } g.geometry.computeVertexNormals(); return g; }
  function box(w, h, d, color, pos, surf) { const m = mesh(new THREE.BoxGeometry(w, h, d), mat(color)); m.position.copy(pos); scene.add(m); if (surf) tag(m, { surface: surf }); return m; }
  function disc(R, color, pos, surf, h = 0.4) { const m = mesh(new THREE.CylinderGeometry(R, R, h, 32), mat(color)); m.position.copy(pos).add(new THREE.Vector3(0, -h / 2, 0)); scene.add(m); if (surf) tag(m, { surface: surf }); return m; }
  function boulder(r, pos, color = PAL.rock) { const m = mesh(new THREE.DodecahedronGeometry(r, 0), mat(color)); m.position.copy(pos); m.rotation.set(hash(pos.x, 1, 2) * 3, hash(pos.z, 2, 3) * 3, 0); m.scale.y = 0.8; scene.add(m); return m; }
  function tree(pos, s = 1, col = PAL.jungle) { const g = new THREE.Group(); const t = mesh(new THREE.CylinderGeometry(0.1 * s, 0.16 * s, 1.6 * s, 6), mat(0x6e5a48)); t.position.y = 0.8 * s; g.add(t);
    for (let i = 0; i < 3; i++) { const c = mesh(new THREE.IcosahedronGeometry((0.9 - i * 0.15) * s, 0), mat(i % 2 ? col : PAL.jungle2)); c.position.set((hash(i, pos.x, 1) - 0.5) * 0.6 * s, (1.8 + i * 0.5) * s, (hash(i, pos.z, 2) - 0.5) * 0.6 * s); g.add(c); }
    g.position.copy(pos); scene.add(g); return g; }
  function frangipani(pos) { const g = new THREE.Group(); const t = mesh(new THREE.CylinderGeometry(0.08, 0.13, 1.2, 6), mat(0x8a7a68)); t.position.y = 0.6; g.add(t);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const c = mesh(new THREE.IcosahedronGeometry(0.42, 0), mat(0x5a8a48)); c.position.set(Math.cos(a) * 0.4, 1.35, Math.sin(a) * 0.4); g.add(c);
      const f = mesh(new THREE.SphereGeometry(0.1, 6, 4), mat(PAL.frangi)); f.position.set(Math.cos(a) * 0.55, 1.65, Math.sin(a) * 0.55); g.add(f); }
    g.position.copy(pos); scene.add(g); return g; }
  function steps(a, b, n, w = 1.0, color = PAL.paveDark, surf) { const g = []; for (let i = 0; i < n; i++) { const p = a.clone().lerp(b, (i + 0.5) / n); const s = mesh(new THREE.BoxGeometry(w, 0.14, Math.max(0.35, a.distanceTo(b) / n * 0.9)), mat(color)); s.position.copy(p).add(new THREE.Vector3(0, -0.07, 0)); s.lookAt(b.clone().setY(p.y)); scene.add(s); if (surf) tag(s, { surface: surf }); g.push(s); } return g; }
  function cardTex(text, bg, fg, w = 256) { return canvasTex(w, 96, (x) => { x.fillStyle = bg; x.fillRect(0, 0, w, 96); x.fillStyle = fg; x.font = 'bold 30px Nunito Sans, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, 50); }); }
  function signCard(text, w, h, bg = '#f3e6c4', fg = '#3a2a1a') { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: cardTex(text, bg, fg, Math.round(256 * w / h * 96 / 256 * 2.67)), transparent: true })); return m; }

  /* ================= AREA 1: THE WATER GARDENS ================= */
  disc(11.5, PAL.grass, new THREE.Vector3(0, 0, -0.4), 'a1', 0.4); islandBase(new THREE.Vector3(0, 0, -0.4), 11.5, 7, PAL.rockDark);
  // the long central pool, its rim and the north channel
  const pool = mesh(new THREE.BoxGeometry(1.5, 0.12, 9.6), new THREE.MeshStandardMaterial({ color: PAL.water, roughness: 0.15, metalness: 0.1 })); pool.position.set(0, 0.02, 0); scene.add(pool); tag(pool, { item: 'pool' }); items.pool = pool;
  for (const x of [-0.85, 0.85]) box(0.2, 0.22, 9.8, PAL.brickDark, new THREE.Vector3(x, 0.08, 0));
  for (const z of [-4.9, 4.9]) box(1.9, 0.22, 0.2, PAL.brickDark, new THREE.Vector3(0, 0.08, z));
  // the paving grids: hers (west) and the reflection's (east)
  const cellTile = (c, r, side) => { const p = V3(L.cellPos(c, r, side)); const blocked = (side < 0 ? L.P_BLOCK : L.T_BLOCK).includes(c + ',' + r);
    const t = box(1.36, 0.08, 1.36, (c + r) % 2 ? PAL.pave : PAL.paveDark, p.clone().setY(0.03), side < 0 && !blocked ? 'a1' : null); return t; };
  for (let c = 0; c < L.GC; c++) for (let r = 0; r < L.GR; r++) { cellTile(c, r, -1); cellTile(c, r, 1); }
  // lotus stones
  function lotusStone(p, col) { const g = new THREE.Group(); const b = mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.12, 16), mat(0xe8d8c0)); b.position.y = 0.08; g.add(b);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const pt = mesh(new THREE.SphereGeometry(0.2, 6, 4), mat(col)); pt.scale.set(1, 0.3, 0.6); pt.position.set(Math.cos(a) * 0.32, 0.16, Math.sin(a) * 0.32); pt.rotation.y = -a; g.add(pt); }
    const ring = halo(g, 0xffe0ea, 0.62, 0.78); ring.position.y = 0.17; g.position.copy(p); scene.add(g); return g; }
  const herStone = lotusStone(V3(L.cellPos(...L.P_PLATE, -1)), PAL.lotus), twinStone = lotusStone(V3(L.cellPos(...L.T_PLATE, 1)), 0x9ac8e8);
  // soft light columns so both stones can be found from any view (hers sits behind a frangipani)
  const stoneBeacons = [[herStone, 0xf4a0c0], [twinStone, 0x9ad0f0]].map(([st, c]) => { const b = beacon(c, 2.2); b.position.copy(st.position); scene.add(b); return b; });
  // obstacles: hers and the reflection's are different
  const obst = (key, side) => { const [c, r] = key.split(',').map(Number); const p = V3(L.cellPos(c, r, side)); const kind = (c * 3 + r + (side > 0 ? 1 : 0)) % 4;
    if (kind === 0) { const pl = mesh(new THREE.CylinderGeometry(0.22, 0.24, 1.3, 8), mat(0xd8cdb8)); pl.rotation.z = Math.PI / 2; pl.rotation.y = 0.6; pl.position.copy(p).setY(0.24); scene.add(pl); }
    else if (kind === 1) frangipani(p);
    else if (kind === 2) { const w = mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.1, 14), new THREE.MeshStandardMaterial({ color: PAL.waterDeep, roughness: 0.2 })); w.position.copy(p).setY(0.08); scene.add(w); for (let i = 0; i < 3; i++) { const pad = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 10), mat(0x5a9a48)); pad.position.copy(p).add(new THREE.Vector3((hash(i, c, r) - 0.5) * 0.7, 0.15, (hash(r, i, c) - 0.5) * 0.7)); scene.add(pad); } }
    else boulder(0.6, p.clone().setY(0.45), PAL.rockGrey); };
  L.P_BLOCK.forEach((k) => obst(k, -1)); L.T_BLOCK.forEach((k) => obst(k, 1));
  // entry path, the north terrace, sluice house, valves, fountains
  box(1.2, 0.06, 2.6, PAL.pave, new THREE.Vector3(-3.0, 0.03, 5.0), 'a1');
  box(13.6, 0.08, 1.6, PAL.paveDark, new THREE.Vector3(0, 0.03, -5.4), 'a1');
  { const br = mesh(new THREE.CylinderGeometry(1.0, 1.0, 1.4, 12, 1, true, 0, Math.PI), mat(PAL.brick, { side: THREE.DoubleSide })); br.rotation.z = Math.PI / 2; br.rotation.y = Math.PI / 2; br.scale.set(1, 1, 0.3); br.position.set(0, -0.6, -5.4); scene.add(br); }
  const house = new THREE.Group(); house.position.set(-1.6, 0, -7.0); scene.add(house);
  { const b = mesh(new THREE.BoxGeometry(2.8, 1.6, 1.4), mat(PAL.brick)); b.position.y = 0.8; house.add(b); const roof = mesh(new THREE.CylinderGeometry(0.01, 2.1, 0.8, 4), mat(PAL.brickDark)); roof.rotation.y = Math.PI / 4; roof.scale.z = 0.55; roof.position.y = 2.0; house.add(roof);
    const door = mesh(new THREE.BoxGeometry(0.8, 1.1, 0.08), mat(0x5a3a28)); door.position.set(0, 0.55, 0.72); house.add(door); house.userData.door = door; }
  const valves = [0, 1, 2, 3].map((i) => { const g = new THREE.Group(); g.position.set(-3.0 + i * 0.95, 0, -6.15); scene.add(g); const post = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 6), mat(PAL.iron)); post.position.y = 0.35; g.add(post);
    const w = mesh(new THREE.TorusGeometry(0.24, 0.05, 6, 14), mat(PAL.bronze)); w.position.y = 0.78; g.add(w); g.userData.wheel = w; const n = signCard(String(i + 1), 0.32, 0.32, '#3a2a1a', '#f3e6c4'); n.position.set(0, 1.18, 0); g.add(n); g.userData.num = n;
    const hit = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, 0.7), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 0.6; g.add(hit); g.visible = false; tag(g, { item: 'v' + i }); items['v' + i] = g; return g; });
  const FZ = [-3.0, 0, 3.0];
  const fountainJets = FZ.map((z) => { const g = new THREE.Group(); g.position.set(0, 0.1, z); scene.add(g); const base = mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.2, 10), mat(0xd8cdb8)); g.add(base);
    const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, 1, 8, 1, true), glow(0xd8f2ff, 0.75)); jet.position.y = 0.5; jet.scale.y = 0.01; g.add(jet); g.userData.jet = jet; g.userData.h = 0;
    const spray = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), glow(0xeaf8ff, 0.6)); g.add(spray); g.userData.spray = spray; return g; });
  // the carved stone showing the fountain heights
  const stoneTex = canvasTex(256, 200, (x) => { x.fillStyle = '#c8b898'; x.fillRect(0, 0, 256, 200); x.fillStyle = '#5a4632'; x.font = 'bold 22px Nunito Sans, sans-serif'; x.textAlign = 'center'; x.fillText('FOUNTAINS', 128, 30);
    L.FTARGET.forEach((h, i) => { const X = 52 + i * 76; x.fillStyle = '#7a6040'; x.fillRect(X - 14, 170 - h * 22, 28, h * 22); x.fillStyle = '#3a2a1a'; x.fillText(['N', 'mid', 'S'][i], X, 192); for (let k = 1; k <= h; k++) { x.fillStyle = '#e8dcc0'; x.fillRect(X - 14, 170 - k * 22, 28, 3); } x.fillStyle = '#3a2a1a'; x.fillText(String(h), X, 162 - h * 22); }); });
  const carved = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 0.2), [mat(0xb8a888), mat(0xb8a888), mat(0xb8a888), mat(0xb8a888), new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.95 }), mat(0xb8a888)]); carved.position.set(1.4, 0.65, -6.2); carved.castShadow = true; scene.add(carved);
  // the boulder gate to the climb
  boulder(1.0, new THREE.Vector3(8.6, 0.6, -2.6)); boulder(0.9, new THREE.Vector3(-8.4, 0.6, -4.2));
  // the boulder gate: two great boulders with a doorway between them, facing the climb; two stone doors swing open
  const gDir = new THREE.Vector3(2.8, 0, -3.0).normalize(), gPerp = new THREE.Vector3(-gDir.z, 0, gDir.x), gC = P('GATE1').add(gDir.clone().multiplyScalar(0.9)).setY(0);
  boulder(1.35, gC.clone().addScaledVector(gPerp, 2.05).setY(1.0)); boulder(1.35, gC.clone().addScaledVector(gPerp, -2.05).setY(1.0));
  const gateDoors = [1, -1].map((side) => { const hinge = new THREE.Group(); hinge.position.copy(gC).addScaledVector(gPerp, side * 1.3); hinge.rotation.y = Math.atan2(gPerp.x, gPerp.z) - Math.PI / 2; scene.add(hinge);
    const d = mesh(new THREE.BoxGeometry(1.3, 2.0, 0.22), mat(0x9a948a)); d.position.set(-side * 0.65, 1.0, 0); hinge.add(d);
    const carve = mesh(new THREE.TorusGeometry(0.3, 0.05, 6, 16), mat(0x7a7468)); carve.position.set(-side * 0.65, 1.2, 0.12); hinge.add(carve); hinge.userData.side = side; return hinge; });
  const gateLamps = [];
  const gate1Beacon = beacon(0xffd27a, 2.6); gate1Beacon.position.copy(P('GATE1')); scene.add(gate1Beacon);
  for (const [x, z] of [[-9, 2], [-8.5, -1.5], [9, 3.5], [8.8, 0.2], [-6, 8], [6.5, 7.5], [-9.5, 5.5], [9.6, -4.6]]) tree(new THREE.Vector3(x, 0, z), 0.9 + hash(x, z, 4) * 0.4);
  // the climb from the gate to the Mirror Wall
  const climb1 = [P('GATE1'), V3([7.4, 1.4, -8.4]), V3([10.6, 3.6, -10.6]), V3([13.8, 5.6, -11.2]), P('S_base')];
  for (let i = 1; i < climb1.length; i++) steps(climb1[i - 1], climb1[i], Math.max(3, Math.round(climb1[i - 1].distanceTo(climb1[i]) / 0.55)), 1.0, PAL.rockGrey, 'climb1');
  // little lanterns up the first flights that light up when the gate opens
  for (let i = 0; i < 6; i++) { const seg = i < 3 ? 0 : 1, k = ((i % 3) + 0.5) / 3; const q = climb1[seg].clone().lerp(climb1[seg + 1], k); const side = i % 2 ? 1 : -1;
    const dir = climb1[seg + 1].clone().sub(climb1[seg]).setY(0).normalize(); const off = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(0.75 * side);
    const post = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 5), mat(PAL.iron)); post.position.copy(q).add(off).add(new THREE.Vector3(0, 0.3, 0)); scene.add(post);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshBasicMaterial({ color: 0x5a5048 })); lamp.position.copy(post.position).add(new THREE.Vector3(0, 0.36, 0)); scene.add(lamp); gateLamps.push(lamp); }

  // the reflection: a watery copy of her that mirrors her pose
  const twin = new THREE.Group(); twin.scale.x = -1; scene.add(twin); let twinModel = null, twinPairs = [];
  const twinPos = V3(L.cellPos(...S.twin, 1)); twin.position.copy(twinPos);
  const twinMove = { from: twinPos.clone(), to: twinPos.clone(), cur: null, blocked: false };
  function buildTwin() { if (twinModel || !E.hero.model) return; twinModel = SkeletonUtils.clone(E.hero.model); twinModel.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.55; o.material.color = new THREE.Color(0x9ad4ff); o.material.emissive = new THREE.Color(0x1a4a78); o.material.side = THREE.DoubleSide; o.castShadow = false; } });
    twin.add(twinModel); const a = [], b = []; E.hero.model.traverse((o) => { if (o.isBone) a.push(o); }); twinModel.traverse((o) => { if (o.isBone) b.push(o); }); twinPairs = a.map((x, i) => [x, b[i]]); }
  const twinRing = halo(twin, 0x9ad0f0, 0.36, 0.5);

  /* ================= AREA 2: THE MIRROR WALL ================= */
  box(17.6, 0.5, 7.4, PAL.pave, at2(1.0, -0.25, 0.4), 'a2'); islandBase(at2(1.0, 0, 0.4), 9.6, 7, PAL.rockDark, 1, 0.55);
  // the great rock face behind, with the fresco pocket shelf
  { const rock = mesh(new THREE.BoxGeometry(19, 12, 5), mat(PAL.rock)); rock.position.copy(at2(1.0, 5.5, -6.6)); scene.add(rock);
    for (let i = 0; i < 9; i++) { const st = mesh(new THREE.BoxGeometry(2.2, 12, 0.3), mat(i % 2 ? PAL.rockDark : 0xc88a5a)); st.position.copy(at2(-7.5 + i * 2.1, 5.5, -4.05)); scene.add(st); } }
  const shelf = box(12.6, 0.3, 1.5, 0xd8b088, at2(2.5, 3.45, -3.45), 'a2'); box(12.6, 0.5, 0.12, PAL.brickDark, at2(2.5, 3.85, -2.72));
  const LY = 1.0; // beam height above the ledge
  const lp = (gx, gy, y = 0) => V3(L.lightPos(gx, gy, y));
  // the Mirror Wall: plain segments, plus four angled panels that start dull
  for (let gx = -1; gx <= 8; gx++) if (!L.WALLS.some((w) => w[0] === gx)) box(1.3, 1.3, 0.35, 0xe0a070, lp(gx, 4, 0.65).add(new THREE.Vector3(0, 0, 0.35)));
  const wallPanels = L.WALLS.map(([gx, gy, t], i) => { const g = new THREE.Group(); g.position.copy(lp(gx, gy, 0.65)); scene.add(g);
    const base = mesh(new THREE.BoxGeometry(1.3, 1.3, 0.3), mat(0xe0a070)); base.position.z = 0.35; g.add(base);
    // a taller, stained section of the wall that stands out; it shines once polished
    const face = mesh(new THREE.BoxGeometry(1.24, 1.9, 0.5), mat(0x7a4a2c)); face.position.set(0, 0.3, 0.33); g.add(face); g.userData.face = face;
    for (let k = 0; k < 3; k++) { const st = mesh(new THREE.BoxGeometry(0.18 + k * 0.1, 0.5 + k * 0.2, 0.52), mat(0x5a3420)); st.position.set(-0.4 + k * 0.38, 0.1 + k * 0.15, 0.33); g.add(st); g.userData['stain' + k] = st; }
    const tagTex = canvasTex(192, 72, (x) => { x.fillStyle = '#b0603a'; x.beginPath(); x.roundRect(4, 4, 184, 64, 30); x.fill(); x.fillStyle = '#fff'; x.font = 'bold 34px Nunito Sans, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('✦ wipe', 96, 39); });
    const wtag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex, transparent: true, depthTest: false })); wtag.scale.set(1.2, 0.45, 1); wtag.position.set(0, 1.75, 0.33); wtag.visible = false; g.add(wtag); g.userData.wtag = wtag;
    tag(g, { item: 'w' + i }); items['w' + i] = g; return g; });
  // graffiti verses on the inner face of the wall: you only see them looking back from the rock side
  const verses = [1, 4, 7].map((gx, i) => { const t = canvasTex(256, 128, (x) => { x.fillStyle = 'rgba(0,0,0,0)'; x.fillRect(0, 0, 256, 128); x.strokeStyle = '#6a3a24'; x.lineWidth = 2.4; for (let l = 0; l < 4; l++) { x.beginPath(); for (let k = 0; k < 20; k++) x.lineTo(20 + k * 11, 26 + l * 26 + Math.sin(k * 1.7 + l + i) * 5); x.stroke(); } });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.55), new THREE.MeshBasicMaterial({ map: t, transparent: true })); m.position.copy(lp(gx, 4, 0.75)).add(new THREE.Vector3(0, 0, 0.15)); m.rotation.y = Math.PI; scene.add(m);
    const hit = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.3), new THREE.MeshBasicMaterial({ visible: false })); hit.position.copy(m.position); scene.add(hit); tag(hit, { hidden: 'q' + i }); tag(m, { hidden: 'q' + i }); return m; });
  // rocks in the light grid
  for (const [gx, gy] of L.ROCKS) boulder(0.6, lp(gx, gy, 0.5), PAL.rockGrey);
  // bronze mirrors
  const mirrors = L.MIRRORS.map(([gx, gy], i) => { const g = new THREE.Group(); g.position.copy(lp(gx, gy)); scene.add(g); const post = mesh(new THREE.CylinderGeometry(0.06, 0.08, LY, 6), mat(PAL.iron)); post.position.y = LY / 2; g.add(post);
    const piv = new THREE.Group(); piv.position.y = LY; g.add(piv); const d = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 20), mat(PAL.bronze, { metalness: 0.5, roughness: 0.3 })); d.rotation.x = Math.PI / 2; piv.add(d); g.userData.piv = piv;
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = LY; g.add(hit); tag(g, { item: 'm' + i }); items['m' + i] = g; return g; });
  const MIR_ROT = [-3 * Math.PI / 4, -Math.PI / 4, 0];
  function setMirror(i, now = false) { const piv = mirrors[i].userData.piv; const st = S.M[i]; const ry = MIR_ROT[st], rx = st === 2 ? -Math.PI / 2 : 0;
    if (now) { piv.rotation.set(rx, ry, 0, 'YXZ'); return; } const r0 = piv.rotation.y, x0 = piv.rotation.x; anims.push({ t: 0, dur: 0.35, f: (k) => { piv.rotation.set(x0 + (rx - x0) * k, r0 + (ry - r0) * k, 0, 'YXZ'); } }); }
  for (let i = 0; i < 3; i++) setMirror(i, true);
  // the sun reflector that sends the beam in from the east
  { const g = new THREE.Group(); g.position.copy(lp(8, 3)); scene.add(g); const p = mesh(new THREE.CylinderGeometry(0.08, 0.1, LY + 0.4, 6), mat(PAL.iron)); p.position.y = (LY + 0.4) / 2; g.add(p);
    const d = mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.08, 24), mat(PAL.gold, { metalness: 0.6, roughness: 0.25, emissive: 0x6a4a10 })); d.rotation.z = Math.PI / 2; d.position.y = LY; g.add(d); }
  // the painted maidens on the rock above the shelf
  function maidenTex(i, lit) { return canvasTex(160, 220, (x) => { x.fillStyle = lit ? '#f6d8a8' : '#8a6a52'; x.fillRect(0, 0, 160, 220); const skin = lit ? '#d8904a' : '#6a5040', cloth = lit ? ['#e86a3a', '#f0c040', '#5aa070'][i] : '#5a4a3a';
    x.fillStyle = lit ? '#f4ead0' : '#7a6050'; x.beginPath(); for (let k = 0; k < 8; k++) x.arc(30 + k * 15, 196 + Math.sin(k) * 6, 16, 0, 7); x.fill(); // clouds
    x.fillStyle = skin; x.beginPath(); x.ellipse(80, 60, 20, 24, 0, 0, 7); x.fill(); x.fillRect(66, 82, 28, 70); x.beginPath(); x.ellipse(80, 108, 38, 30, 0, 0, 7); x.fill();
    x.fillStyle = '#2a1a12'; x.beginPath(); x.ellipse(80, 42, 26, 16, 0, Math.PI, 0); x.fill(); x.fillStyle = cloth; x.fillRect(48, 130, 64, 40);
    x.fillStyle = lit ? '#e0b44a' : '#5a4a3a'; x.fillRect(56, 36, 48, 8);
    if (lit) { const f = L.FLOWERS[i]; x.fillStyle = FL_COL[f]; x.strokeStyle = '#7a5030'; x.lineWidth = 2; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; x.beginPath(); x.ellipse(122 + Math.cos(a) * 11, 104 + Math.sin(a) * 11, 9, 5, a, 0, 7); x.fill(); x.stroke(); } x.fillStyle = '#e0b44a'; x.beginPath(); x.arc(122, 104, 5, 0, 7); x.fill();
      x.strokeStyle = skin; x.lineWidth = 9; x.beginPath(); x.moveTo(98, 110); x.lineTo(118, 104); x.stroke(); } }); }
  const maidens = L.MAIDENS.map(([gx], i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.8), new THREE.MeshStandardMaterial({ map: maidenTex(i, false), roughness: 0.9 })); m.position.copy(lp(gx, 0, 5.4)).setZ(C2.z - 3.86); scene.add(m); return m; });
  // the painter's cloth in the pocket
  const clothKit = new THREE.Group(); clothKit.position.copy(P('POCKET')).add(new THREE.Vector3(0.7, 0, -0.3)); scene.add(clothKit);
  { const pot = mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.26, 10), mat(0x8a5a3a)); pot.position.y = 0.13; clothKit.add(pot); const c = mesh(new THREE.BoxGeometry(0.5, 0.05, 0.4), mat(0xe8dcc0)); c.position.set(0.3, 0.04, 0); c.rotation.y = 0.4; clothKit.add(c); }
  tag(clothKit, { item: 'cloth' }); items.cloth = clothKit; const clothHit = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); clothHit.position.y = 0.2; clothKit.add(clothHit); tag(clothHit, { item: 'cloth' });
  // the iron stairways: the lower flight, the upper landing, and the pocket-to-gallery join
  const IRON = 0x2f3a3a;
  steps(P('S_base'), P('S_mid'), 9, 0.9, IRON, 'a2');
  const landing = (p, s = 1) => { const m = box(1.1 * s, 0.12, 1.1 * s, IRON, p.clone().add(new THREE.Vector3(0, -0.06, 0)), 'a2'); const rail = mesh(new THREE.TorusGeometry(0.55 * s, 0.03, 4, 16, Math.PI), mat(IRON)); rail.position.copy(p).add(new THREE.Vector3(0, 0.55, 0)); scene.add(rail); return m; };
  landing(P('S_mid')); landing(P('S_mid2')); landing(P('P_end')); landing(P('L_mid'), 1.2);
  box(1.1, 3.6, 0.12, IRON, P('S_mid2').add(new THREE.Vector3(0.5, -1.8, 0)));
  const joinGlow = [P('S_mid'), P('P_end')].map((p) => { const r = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.62, 24), glow(0xfff0b0, 0)); r.rotation.x = -Math.PI / 2; r.position.copy(p).add(new THREE.Vector3(0, 0.04, 0)); scene.add(r); return r; });
  // the gallery gate to the lion platform
  const gate2Bars = new THREE.Group(); gate2Bars.position.copy(P('GATE2')).add(new THREE.Vector3(-0.6, 0, 0)); scene.add(gate2Bars);
  for (let i = 0; i < 5; i++) { const b = mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 5), mat(IRON)); b.position.set(0, 0.9, -0.8 + i * 0.4); gate2Bars.add(b); }
  const gate2Beacon = beacon(0xffd27a, 2.6); gate2Beacon.position.copy(P('GATE2')); scene.add(gate2Beacon);
  const climb2 = [P('GATE2'), ...L.CLIMB2.map(V3), P('LION')];
  for (let i = 1; i < climb2.length; i++) steps(climb2[i - 1], climb2[i], Math.max(3, Math.round(climb2[i - 1].distanceTo(climb2[i]) / 0.55)), 1.0, PAL.rockGrey, 'climb2');
  // lanterns along the way out that light up when the gate opens, and a glowing ring at the gate
  const gate2Lamps = [];
  for (let i = 0; i < 8; i++) { const seg = Math.min(climb2.length - 2, Math.floor(i / 2)), k = (i % 2 ? 0.75 : 0.25); const q = climb2[seg].clone().lerp(climb2[seg + 1], k);
    const dir = climb2[seg + 1].clone().sub(climb2[seg]).setY(0).normalize(); const off = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(0.75 * (i % 2 ? 1 : -1));
    const post = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 5), mat(PAL.iron)); post.position.copy(q).add(off).add(new THREE.Vector3(0, 0.3, 0)); scene.add(post);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshBasicMaterial({ color: 0x5a5048 })); lamp.position.copy(post.position).add(new THREE.Vector3(0, 0.36, 0)); scene.add(lamp); gate2Lamps.push(lamp); }
  const gate2Ring = new THREE.Mesh(new THREE.RingGeometry(0.7, 1.0, 32), glow(0xffd27a, 0)); gate2Ring.rotation.x = -Math.PI / 2; gate2Ring.position.copy(P('GATE2')).add(new THREE.Vector3(0, 0.05, 0)); scene.add(gate2Ring);
  const gate2Pad = box(1.8, 0.1, 1.8, PAL.pave, P('GATE2').add(new THREE.Vector3(-0.2, -0.04, 0)), 'gate2');
  // the light beam
  const beamGroup = new THREE.Group(); scene.add(beamGroup); const beamMat = new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
  function beamSeg(a, b, w = 0.1) { const len = a.distanceTo(b); const m = new THREE.Mesh(new THREE.CylinderGeometry(w, w, len, 6, 1, true), beamMat); m.position.copy(a).lerp(b, 0.5); m.lookAt(b); m.rotateX(Math.PI / 2); beamGroup.add(m); }
  function drawBeam() { beamGroup.clear(); const t = L.trace(S); const pts = t.path.map(([x, y]) => lp(x, y, LY)); for (let i = 1; i < pts.length; i++) beamSeg(pts[i - 1], pts[i]);
    if (t.lit !== null) { const top = maidens[t.lit].position.clone().add(new THREE.Vector3(0, -0.3, 0.05)); beamSeg(pts[pts.length - 1], top, 0.13); } }

  /* ================= AREA 3: THE LION GATE AND THE SUMMIT ================= */
  // the lion platform, on a shelf against the south face of the rock
  disc(5.4, 0xc8a070, at3(0, 0, 0.6), 'a3', 0.4); islandBase(at3(0, 0, 0.6), 5.4, 5, PAL.rockDark);
  // the Lion Rock: a rounded, overhanging monolith with weathered orange, grey and black streaks
  const RX = 5.9, RZ = 6.6, RC = at3(0, 0, -9.8);
  const streaks = canvasTex(1024, 512, (x, W, H) => { x.fillStyle = '#c07a48'; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 260; i++) { const X = hash(i, 1, 7) * W, w = 4 + hash(i, 2, 7) * 26, h0 = hash(i, 3, 7) * H * 0.5, h1 = H * (0.5 + hash(i, 4, 7) * 0.5); const c = ['#8e5a3a', '#d89a62', '#7a7468', '#5a524a', '#a8a094', '#b86a3a', '#3a3430'][Math.floor(hash(i, 5, 7) * 7)];
      x.globalAlpha = 0.25 + hash(i, 6, 7) * 0.5; x.fillStyle = c; x.fillRect(X, h0, w, h1 - h0); }
    x.globalAlpha = 0.5; x.fillStyle = '#4f7a3a'; for (let i = 0; i < 40; i++) { x.beginPath(); x.ellipse(hash(i, 8, 7) * W, 8 + hash(i, 9, 7) * 30, 20 + hash(i, 10, 7) * 40, 10 + hash(i, 11, 7) * 12, 0, 0, 7); x.fill(); } x.globalAlpha = 1; });
  streaks.wrapS = THREE.RepeatWrapping; streaks.repeat.set(2, 1);
  { const geo = new THREE.CylinderGeometry(1, 1, 1, 40, 10, true); const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i) + 0.5; const a = Math.atan2(p.getZ(i), p.getX(i)); // y: 0 bottom .. 1 top
      const bulge = 0.84 + 0.2 * Math.sin(y * Math.PI * 0.85) + 0.05 * y; const n = 0.94 + hash(Math.round(a * 20), Math.round(y * 10), 3) * 0.1;
      p.setXYZ(i, Math.cos(a) * RX * bulge * n, -8.2 + y * 15.2, Math.sin(a) * RZ * bulge * n); }
    geo.computeVertexNormals(); const rock = mesh(geo, new THREE.MeshStandardMaterial({ map: streaks, roughness: 0.95, side: THREE.DoubleSide })); rock.position.copy(RC); scene.add(rock);
    const cap = mesh(new THREE.CylinderGeometry(1, 1, 0.5, 40), mat(0x8aa860)); cap.scale.set(RX * 1.0, 1, RZ * 1.0); cap.position.copy(RC).add(new THREE.Vector3(0, 6.8, 0)); scene.add(cap); tag(cap, { surface: 'a3' });
    islandBase(RC.clone().add(new THREE.Vector3(0, -7.8, 0)), RX * 0.9, 6, PAL.rockDark, 1, RZ / RX);
    // the forest that cloaks the foot of the rock
    for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2; tree(RC.clone().add(new THREE.Vector3(Math.cos(a) * RX * 1.0, -8.4 + hash(i, 3, 3) * 0.6, Math.sin(a) * RZ * 1.0)), 1.2 + hash(i, 4, 3) * 0.5); } }
  // the summit palace: tiers of ruined brick walls and lawns around the turning terraces, a few trees on the edge
  { const tier = (w, d, h, x, z, y = 7) => { box(w, h, d, PAL.brick, at3(x, y + h / 2 - 0.02, z)); box(w - 0.3, 0.06, d - 0.3, 0x8ab060, at3(x, y + h, z)); };
    tier(2.0, 3.2, 0.7, -4.6, -11.0); tier(1.6, 2.4, 1.2, -4.4, -13.8); tier(2.2, 1.6, 0.5, -2.4, -15.4); tier(2.0, 1.4, 0.9, 2.6, -15.2); tier(1.4, 2.6, 0.4, 4.9, -8.6);
    for (const [x, z, w, d] of [[-3.7, -5.6, 2.4, 0.3], [-5.3, -8.4, 0.3, 2.2], [4.2, -15.0, 1.6, 0.3], [-1.0, -16.0, 3.0, 0.3]]) box(w, 0.45, d, PAL.brickDark, at3(x, 7.2, z));
    for (const [x, z] of [[-4.8, -6.4], [5.0, -11.4], [-2.8, -16.0], [3.4, -16.2]]) tree(at3(x, 7, z), 0.6); }
  // the giant lion paws, with brick walls rising behind them, and the stair between
  function paw(p, flip) { const g = new THREE.Group(); g.position.copy(p); scene.add(g); const b = mesh(new THREE.BoxGeometry(1.6, 1.1, 2.2), mat(0xc8a07a)); b.position.y = 0.55; g.add(b);
    for (let i = 0; i < 3; i++) { const cl = mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.9, 8), mat(0xd8b088)); cl.rotation.x = Math.PI / 2; cl.position.set(-0.5 + i * 0.5, 0.35, 1.25); g.add(cl); const tip = mesh(new THREE.ConeGeometry(0.16, 0.3, 6), mat(0xe8d0b0)); tip.rotation.x = Math.PI / 2; tip.position.set(-0.5 + i * 0.5, 0.35, 1.8); g.add(tip); }
    const wall = mesh(new THREE.BoxGeometry(1.0, 2.6, 2.2), mat(PAL.brick)); wall.position.set(flip * 1.25, 1.3, -0.8); g.add(wall); return g; }
  paw(at3(-2.0, 0, 0.2), -1); paw(at3(2.0, 0, 0.2), 1);
  steps(P('LION'), P('ST1'), 7, 1.1, PAL.brick, 'a3');
  // the winding iron stair, with a rail on the outer side
  function stairRun(id1, id2) { const e = L.edges(S).find((q) => (q.a === id1 && q.b === id2)); const pts = [P(id1), ...(e.via || []).map(V3), P(id2)];
    for (let i = 1; i < pts.length; i++) { const n = Math.max(3, Math.round(pts[i - 1].distanceTo(pts[i]) / 0.45)); steps(pts[i - 1], pts[i], n, 0.85, IRON, 'a3');
      const a = pts[i - 1].clone(), b = pts[i].clone(); const out = new THREE.Vector3(b.z - a.z, 0, a.x - b.x).normalize().multiplyScalar(0.45); if (out.dot(a.clone().sub(RC).setY(0)) < 0) out.negate();
      const r = mesh(new THREE.CylinderGeometry(0.025, 0.025, a.distanceTo(b), 4), mat(IRON)); r.position.copy(a).lerp(b, 0.5).add(out).add(new THREE.Vector3(0, 0.6, 0)); r.lookAt(b.clone().add(out).add(new THREE.Vector3(0, 0.6, 0))); r.rotateX(Math.PI / 2); scene.add(r); }
    for (const q of pts.slice(1, -1)) landing(q, 0.9); }
  stairRun('ST1', 'ST2'); stairRun('ST2', 'SUM_IN');
  landing(P('ST1'), 1.2); landing(P('ST2'), 1.2);
  // hornet nests under the overhang beside the stair, a wind gong on the lower landing
  const nests = [at3(3.4, 4.4, -4.6), at3(6.4, 5.6, -9.0)].map((p) => { const n = mesh(new THREE.SphereGeometry(0.42, 8, 6), mat(0x6a5038)); n.scale.y = 1.4; n.position.copy(p); scene.add(n);
    const swarm = new THREE.Group(); swarm.position.copy(p); scene.add(swarm); for (let i = 0; i < 14; i++) { const h = mesh(new THREE.SphereGeometry(0.05, 4, 3), mat(PAL.hornet), { cast: false }); swarm.add(h); } return swarm; });
  const gong = new THREE.Group(); gong.position.copy(P('ST1')).add(new THREE.Vector3(-0.9, 0, 0.2)); scene.add(gong);
  { const p = mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.0, 6), mat(0x6e4a30)); p.position.y = 1.0; gong.add(p); const bar = mesh(new THREE.BoxGeometry(0.8, 0.06, 0.06), mat(0x6e4a30)); bar.position.set(0.3, 2.0, 0); gong.add(bar);
    const b = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 16), mat(PAL.bronze, { metalness: 0.5 })); b.rotation.x = Math.PI / 2; b.position.set(0.55, 1.6, 0); gong.add(b); gong.userData.b = b; }
  const windStreaks = new THREE.Group(); scene.add(windStreaks); for (let i = 0; i < 10; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.03, 0.03), glow(0xffffff, 0)); s.position.copy(at3(-3 + hash(i, 1, 9) * 6, 2 + hash(i, 2, 9) * 5, -3.5 - hash(i, 3, 9) * 2)); windStreaks.add(s); }
  // the palace terraces: path strips (paving) and channels (water) on each slab, turned as one piece
  const tiles = L.TILES.map(([i, j, path, chan, turns], k) => { const g = new THREE.Group(); g.position.copy(V3(L.tilePos(i, j))); scene.add(g); const inner = new THREE.Group(); g.add(inner); g.userData.inner = inner;
    const slab = mesh(new THREE.BoxGeometry(2.3, 0.3, 2.3), mat(turns ? 0xd8b890 : 0x7aa05a)); slab.position.y = -0.1; inner.add(slab);
    if (!turns) { for (let q = 0; q < 4; q++) { const b = mesh(new THREE.IcosahedronGeometry(0.35, 0), mat(q % 2 ? PAL.jungle2 : 0x6aa050)); b.position.set((hash(q, i, j) - 0.5) * 1.4, 0.2, (hash(j, q, i) - 0.5) * 1.4); inner.add(b); } return g; }
    const SIDES = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    SIDES.forEach(([dx, dz], s) => { if (chan & (1 << s)) { const w = mesh(new THREE.BoxGeometry(dx ? 1.2 : 0.42, 0.06, dz ? 1.2 : 0.42), new THREE.MeshStandardMaterial({ color: 0x6a8aa0, roughness: 0.3 })); w.position.set(dx * 0.57, 0.07, dz * 0.57); inner.add(w); w.userData.water = true; } });
    if (chan) { const c = mesh(new THREE.BoxGeometry(0.42, 0.06, 0.42), new THREE.MeshStandardMaterial({ color: 0x6a8aa0, roughness: 0.3 })); c.position.y = 0.07; c.userData.water = true; inner.add(c); }
    SIDES.forEach(([dx, dz], s) => { if (path & (1 << s)) { const w = mesh(new THREE.BoxGeometry(dx ? 1.2 : 0.6, 0.1, dz ? 1.2 : 0.6), mat(PAL.cream)); w.position.set(dx * 0.57, chan ? 0.18 : 0.1, dz * 0.57); inner.add(w); } });
    if (path) { const c = mesh(new THREE.BoxGeometry(0.6, 0.1, 0.6), mat(PAL.cream)); c.position.y = chan ? 0.18 : 0.1; inner.add(c); }
    const knob = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 8), mat(PAL.bronze)); knob.position.set(0.85, 0.12, 0.85); g.add(knob);
    tag(g, { item: 'turn' + i + j }); items['turn' + i + j] = g; inner.rotation.y = -S.T[k] * Math.PI / 2; return g; });
  // the cistern (east), the outlet and its waterfall (west), the sluice stone, the throne and its flower bowls
  { const cis = mesh(new THREE.BoxGeometry(1.6, 0.5, 2.6), new THREE.MeshStandardMaterial({ color: PAL.waterDeep, roughness: 0.2 })); cis.position.copy(at3(3.9, 6.9, -12)); scene.add(cis);
    for (const [w, d, x, z] of [[1.9, 0.2, 3.9, -13.4], [1.9, 0.2, 3.9, -10.6], [0.2, 2.9, 4.8, -12]]) box(w, 0.7, d, PAL.brick, at3(x, 7.0, z)); }
  const outletFall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 7.4, 0.3), glow(0xbfe6f6, 0)); outletFall.position.copy(at3(-6.3, 3.4, -7.2)); scene.add(outletFall);
  const sluiceStone = new THREE.Group(); sluiceStone.position.copy(P('CIS')); scene.add(sluiceStone);
  { const s = mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.14, 12), mat(0x9a948a)); s.position.y = 0.06; sluiceStone.add(s); const r = halo(sluiceStone, 0x9ad0f0, 0.62, 0.78); r.position.y = 0.15; sluiceStone.userData.ring = r; }
  const sluiceGate = box(0.12, 0.6, 1.2, IRON, at3(3.05, 7.3, -12));
  const throne = new THREE.Group(); throne.position.copy(P('THRONE')).add(new THREE.Vector3(0, 0, -0.9)); scene.add(throne);
  { const seat = mesh(new THREE.BoxGeometry(1.8, 0.6, 1.0), mat(0x9a948a)); seat.position.y = 0.3; throne.add(seat); const back = mesh(new THREE.BoxGeometry(1.8, 1.3, 0.3), mat(0x8a8478)); back.position.set(0, 0.9, -0.4); throne.add(back);
    const pool2 = mesh(new THREE.BoxGeometry(1.6, 0.08, 0.6), new THREE.MeshStandardMaterial({ color: 0xa89a7a, roughness: 0.6 })); pool2.position.set(0, 0.62, 0.15); throne.add(pool2); throne.userData.pool = pool2; }
  const throneBeacon = beacon(0xffd27a, 3.2); throneBeacon.position.copy(P('THRONE')); scene.add(throneBeacon);
  const bowls = ['lily', 'jasmine', 'araliya', 'lotus'].map((f, i) => { const g = new THREE.Group(); g.position.copy(P('THRONE')).add(new THREE.Vector3(-1.5 + i * 1.0, 0, 0.7)); scene.add(g);
    const b = mesh(new THREE.CylinderGeometry(0.26, 0.18, 0.22, 10), mat(0x8a5a3a)); b.position.y = 0.5; g.add(b); const st = mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.4, 6), mat(0x9a948a)); st.position.y = 0.2; g.add(st);
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; const p = mesh(new THREE.SphereGeometry(0.09, 6, 4), mat(new THREE.Color(FL_COL[f]).getHex())); p.scale.set(1, 0.4, 0.7); p.position.set(Math.cos(a) * 0.13, 0.66, Math.sin(a) * 0.13); g.add(p); }
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 0.5; g.add(hit); tag(g, { item: 'fl_' + f }); items['fl_' + f] = g; return g; });
  // the ola-leaf page, tucked behind the throne (seen from the north side only)
  const leaf = new THREE.Group(); leaf.position.copy(P('THRONE')).add(new THREE.Vector3(0.3, 0.4, -1.55)); scene.add(leaf);
  { const l = mesh(new THREE.BoxGeometry(0.6, 0.04, 0.16), mat(0xd9be8a)); l.rotation.x = Math.PI / 2; l.rotation.y = 0.2; leaf.add(l); const hit = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); leaf.add(hit); }
  tag(leaf, { hidden: 'leaf' });
  for (const [x, z] of [[-3.8, 3.4], [4.0, 3.2]]) tree(at3(x, 0, z), 0.8);
  // the jungle canopy far below and a reservoir: a backdrop
  for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, r = 46 + hash(i, 4, 4) * 16; const c = mesh(new THREE.IcosahedronGeometry(2.5 + hash(i, 5, 5) * 2, 0), mat(i % 2 ? PAL.jungle : PAL.jungle2)); c.position.set(15 + Math.cos(a) * r, -26 + hash(i, 6, 6) * 3, -15 + Math.sin(a) * r); scene.add(c); }

  /* ---------- the info panel ---------- */
  document.body.insertAdjacentHTML('beforeend', '<div id="panel" class="card"></div>');
  const panel = $('panel'); let lastPanel = '';
  function panelHTML() {
    const a = L.areaOf(S.player);
    if (a === 1 && S.gardenOpen && !S.gate1) { const f = L.fountains(S.V); return `<b class="h">Fountains · now / carved on the stone</b><br>` + ['North', 'Middle', 'South'].map((n, j) => `${n}: <span class="bar" style="width:${f[j] * 16}px;background:#5fa9d0"></span> ${f[j]} / ${L.FTARGET[j]} ${f[j] === L.FTARGET[j] ? '<span class="ok">✓</span>' : ''}`).join('<br>') + `<br><small>Each valve feeds more than one fountain. Valves (shut → half → full): ${S.V.map((v, i) => `${i + 1}:${L.VALVE_MODES[v]}`).join(' ')}</small>`; }
    if (a === 1 && !S.gardenOpen && /^g/.test(S.player)) return `<b class="h">The reflecting pool</b><br>You: stone ${S.player === L.cellId(...L.P_PLATE) ? '<span class="ok">✓</span>' : '·'} &nbsp; Reflection: stone ${S.twin[0] === L.T_PLATE[0] && S.twin[1] === L.T_PLATE[1] ? '<span class="ok">✓</span>' : '·'}<br><small>Your reflection copies each step, mirrored. When its way is blocked it stays put. Tap the pool to bring it level with you.</small>`;
    if (a === 2) { const fl = L.MAIDENS.map((_, i) => S.lit[i] ? `<span class="fl" style="background:${FL_COL[L.FLOWERS[i]]}">${['east', 'middle', 'west'][i]}: ${L.FLOWERS[i]}</span>` : `<span class="fl" style="background:#ddd">${['east', 'middle', 'west'][i]}: ?</span>`).join('');
      return `<b class="h">Fresco notes · maidens lit ${S.lit.filter(Boolean).length}/3</b><br>${fl}<br>Wall panels polished: <b>${S.pol.filter(Boolean).length}/4</b>${S.cloth ? '' : ' <span class="no">(you need the cloth from the pocket)</span>'}<br><small>Tap a bronze mirror to turn it: flat → / → \\ → flat. Dull panels swallow the light until polished.</small>`; }
    if (a === 3 && /^(SUM_IN|CIS|THRONE|t\d\d)$/.test(S.player)) { const walk = !!L.findPath(S, 'SUM_IN', 'THRONE'), water = L.waterLinked(S);
      return `<b class="h">The palace terraces</b><br>Walk to the throne: ${walk ? '<span class="ok">✓</span>' : '<span class="no">✗</span>'} &nbsp; Channel cistern → outlet: ${water ? '<span class="ok">✓</span>' : '<span class="no">✗</span>'}<br>Sluice: ${S.sluice ? 'open' : 'shut'}${S.offered.length ? `<br>Offered: ${S.offered.join(', ')}` : ''}<br><small>Cream strips are paths, blue grooves carry water. Tap a terrace to turn it.</small>`; }
    return '';
  }
  function refreshPanel() { const h = panelHTML(); if (h !== lastPanel) { lastPanel = h; panel.innerHTML = h; panel.classList.toggle('on', !!h); } }

  /* ---------- walking ---------- */
  const nodePos = (id) => P(id);
  function surfaceTarget(kind, point) {
    if (kind === 'climb1') return S.gate1 ? 'S_base' : 'GATE1';
    if (kind === 'climb2') return S.gate2 ? 'LION' : 'GATE2';
    if (kind === 'gate2') return 'GATE2';
    const area = kind === 'a2' ? 2 : kind === 'a3' ? 3 : 1;
    const ids = Object.keys(L.NODES).filter((id) => L.areaOf(id) === area && !/^t\d\d$/.test(id));
    let best = null, bd = 1e9; for (const id of ids) { const n = P(id); const d = Math.hypot(n.x - point.x, n.z - point.z) + Math.abs(n.y - point.y) * 0.8; if (d < bd) { bd = d; best = id; } } return best;
  }
  const curves = { climb: true };
  function edgePoints(e, from, to) {
    if (e.kind === 'illusion') return [P(to)];
    if (e.kind === 'climb') { const pts = [P(e.a), ...(e.via || []).map(V3), P(e.b)]; if (from !== e.a) pts.reverse(); const out = []; for (let i = 1; i < pts.length; i++) { const n = Math.max(2, Math.round(pts[i - 1].distanceTo(pts[i]) / 0.5)); for (let k = 1; k <= n; k++) out.push(pts[i - 1].clone().lerp(pts[i], k / n)); } return out; }
    if (e.via) { const pts = (from === e.a ? e.via : [...e.via].reverse()).map(V3); return [...pts, P(to)]; }
    return null;
  }
  // wind gusts wake the hornets: on the climb she waits on a landing until it passes
  const GUST = 7.0, GUST_ON = 2.2; let clock2 = 0;
  const gustAt = (t) => (t % GUST) < GUST_ON;
  function holdEdge(e, c) {
    if (c.d > 0 || e.kind !== 'hornet') return false; const len = c.lens[c.lens.length - 1] / 1.5 + 0.3;
    const danger = gustAt(clock2) || gustAt(clock2 + len * 0.5) || gustAt(clock2 + len);
    if (danger && !c.told) { c.told = true; label('The wind gong is ringing and the hornets are stirring. Wait on the landing until the wind drops…', 3000); }
    return danger;
  }
  let walkCur = null;
  function onEdgeStart(e, cur) {
    walkCur = cur;
    if (e.kind === 'cell' && !S.gardenOpen) { const [c0, r0] = [+cur.from[1], +cur.from[2]], [c1, r1] = [+cur.to[1], +cur.to[2]]; const tc = S.twin[0] + c1 - c0, tr = S.twin[1] + r1 - r0;
      const ok = tc >= 0 && tc < L.GC && tr >= 0 && tr < L.GR && !L.T_BLOCK.includes(tc + ',' + tr); twinMove.from = twin.position.clone(); twinMove.to = ok ? V3(L.cellPos(tc, tr, 1)) : twin.position.clone(); twinMove.cur = cur; twinMove.blocked = !ok; }
    if (e.kind === 'illusion') { bell(1046); sparkle(girl, 1); }
    if (e.kind === 'climb' && !S.won) bell(523);
  }
  function onArrive(node, e, stop) {
    if (e && e.kind === 'cell') { const from = e.a === node ? e.b : e.a; const r = L.mirrorStep(S, from, node); twinMove.cur = null; twin.position.copy(V3(L.cellPos(...S.twin, 1)));
      if (r === 'twinBlocked') { twinMove.bump = 0.3; } if (r === 'gardenOpen') gardenOpened(); }
    // after the perspective drop onto the gallery, swing the camera back round to the front so the rock doesn't hide the gallery
    if (e && e.kind === 'illusion' && node === 'L_mid') { const base = Math.PI / 4; const k = Math.round((cam.azTo - base) / (2 * Math.PI)); cam.azTo = base + k * 2 * Math.PI; label('You drop down onto the gallery. The view swings back round to the front.', 3200); }
    if (e && e.kind === 'climb') { label(L.areaOf(node) === 2 ? 'Up through the boulder garden to the foot of the Lion Rock. An iron stair clings to the rock face…' : L.areaOf(node) === 3 ? 'Out onto the lion platform. Two giant paws guard the last climb to the summit.' : 'Back down in the gardens.', 4200); }
    const ev = stop ? L.stepOn(S, node) : null;
    if (ev) { click(); grind(0.8); anims.push({ t: 0, dur: 0.5, f: (k) => (sluiceGate.position.y = C3.y + 7.3 + (ev.on ? 0.6 * k : 0.6 * (1 - k))) });
      label(ev.flows ? 'The sluice lifts and cistern water rushes along the channels, across the terraces and over the western edge!' : ev.on ? 'The sluice lifts, but the water stops at a terrace that doesn’t line up. Turn the terraces so the blue grooves join.' : 'You step on again and the sluice drops shut.', 4200); }
    refreshPanel();
  }
  function gardenOpened() { bell(784); bell(988, 0.2); sparkle(herStone, 2); sparkle(twin, 2); label('You and your reflection stand on the twin lotus stones together. With a deep gurgle, the sluice house door swings open!', 5000);
    anims.push({ t: 0, dur: 1.0, f: (k) => (house.userData.door.rotation.y = -k * 1.6) }); valves.forEach((v, i) => setTimeout(() => { v.visible = true; sparkle(v, 1); }, 600 + i * 200));
    anims.push({ t: 0, dur: 1.4, f: (k) => (twin.position.y = -k * 1.2), done: () => (twin.visible = false) }); }

  const MSG = {
    poolReset: 'You trail your hand in the pool. The ripples settle, and your reflection steps back level with you.', poolBlocked: 'Your reflection can’t stand there: something is in its way on its side.',
    valve: 'The valve wheel squeals round and the water changes in the pool.',
    gate1: 'All three fountains rise to the heights carved on the stone. Somewhere behind the boulders a stone door grinds open!',
    gotCloth: 'A painter’s cloth and a pot of beeswax, left by the restorers. Next: drop down to the gallery and tap each of the four dull brown panels on the low front wall to polish them.',
    wallDull: 'This panel of the Mirror Wall is dull and stained: it swallows the light. You need something to polish it with.',
    polished: 'You rub the panel with the cloth and beeswax until it shines like a mirror again.',
    mirror: 'The bronze mirror turns.', maidenLit: 'Sunlight floods the fresco! A painted maiden glows out of the dark, holding a flower.',
    gate2: 'The third maiden glows and the whole gallery shines gold. At the far end, the old iron gate to the lion platform swings open!',
    tileFixed: 'This terrace is a garden bed set in stone: it doesn’t turn.', tileUnderFoot: 'You can’t turn the terrace you’re standing on.',
    turned: 'The terrace grinds round a quarter turn.', waterOn: 'The terrace clicks into place and the cistern water flows all the way through!', waterOff: 'The channel breaks and the water stops.',
    offerOk: 'You lay the flowers in the throne’s offering bowl.', offerWrong: 'The flowers wilt in the bowl. Wrong order: think about how the maidens stand along the wall, from the lion end. The bowl empties.',
    offerDry: 'The offering is right, but the throne’s pool is dry. The cistern water has to be flowing first.',
  };
  let cur3 = null;
  function onResult(r, what) {
    if (/^v\d$/.test(what)) { const i = +what[1]; const w = valves[i].userData.wheel; const z0 = w.rotation.z; anims.push({ t: 0, dur: 0.5, f: (k) => (w.rotation.z = z0 + k * Math.PI) }); grind(0.4); E.stats.turns++; }
    switch (r) {
      case 'poolReset': bell(660); twin.position.copy(V3(L.cellPos(...S.twin, 1))); sparkle(twin, 1); break;
      case 'poolBlocked': bump(); break;
      case 'gate1': bell(784); bell(988, 0.2); grind(1.4); gateDoors.forEach((h) => { const r0 = h.rotation.y; anims.push({ t: 0, dur: 1.6, f: (k) => (h.rotation.y = r0 + h.userData.side * k * 1.75) }); });
        gateLamps.forEach((l, i) => setTimeout(() => { l.material.color.setHex(0xffd27a); sparkle(l, 1); bell(880 + i * 60); }, 900 + i * 260)); setTimeout(() => sparkle(gate1Beacon, 2), 600);
        label('The stone doors between the boulders swing open and lanterns light up the steps beyond. Tap the gate, then the steps, to climb to the Mirror Wall.', 6000); break;
      case 'gotCloth': clothKit.visible = false; bell(880); E.refresh(); break;
      case 'wallDull': bubble(items[what], 'cloth', { offset: 1.4 }); bump(); break;
      case 'polished': case 'mirror': case 'maidenLit': case 'gate2':
        if (/^w\d$/.test(what)) { const i = +what[1]; const gp = wallPanels[i].userData; gp.face.material = mat(PAL.polished, { metalness: 0.4, roughness: 0.2, emissive: 0x3a3020 }); [0, 1, 2].forEach((k) => (gp['stain' + k].visible = false)); gp.wtag.visible = false; sparkle(wallPanels[i], 1); click(); }
        if (/^m\d$/.test(what)) { setMirror(+what[1]); click(); E.stats.turns++; }
        drawBeam(); refreshMaidens();
        if (r === 'maidenLit' || r === 'gate2') { bell(988); bell(1318, 0.15); const i = S.lit.lastIndexOf(true); }
        if (r === 'gate2') { anims.push({ t: 0, dur: 1.0, f: (k) => (gate2Bars.rotation.y = -k * 1.7) }); grind(1.0);
          gate2Lamps.forEach((l, i) => setTimeout(() => { l.material.color.setHex(0xffd27a); sparkle(l, 1); bell(880 + i * 50); }, 800 + i * 220));
          label('All three maidens glow and the iron gate at the end of the gallery swings open. Lanterns light the stair beyond. Tap the glowing gate, then the steps, to climb to the Lion Rock.', 6500); }
        break;
      case 'tileFixed': case 'tileUnderFoot': bump(); break;
      case 'turned': case 'waterOn': case 'waterOff': { const k = +what[5] * 3 + +what[4]; const inner = tiles[k].userData.inner; const y0 = inner.rotation.y; anims.push({ t: 0, dur: 0.45, f: (q) => (inner.rotation.y = y0 - q * Math.PI / 2) }); grind(0.5); E.stats.turns++;
        if (r === 'waterOn') bell(784); break; }
      case 'offerOk': bell(660 + S.offered.length * 120); sparkle(items[what], 1); break;
      case 'offerWrong': case 'offerDry': bump(); bubble(throne, r === 'offerDry' ? 'drop' : 'lotus', { offset: 2.2 }); break;
      case 'win': finale(); E.win(); break;
    }
    refreshPanel();
  }
  function refreshMaidens() { maidens.forEach((m, i) => { const lit = S.lit[i]; if (m.userData.lit !== lit) { m.userData.lit = lit; m.material.map = maidenTex(i, lit); m.material.emissive = new THREE.Color(lit ? 0x4a3010 : 0); m.material.needsUpdate = true; } }); }
  let finaleT = -1;
  function finale() { document.body.classList.add('won'); bell(784); bell(988, 0.3); bell(1175, 0.6); finaleT = 0; throne.userData.pool.material = new THREE.MeshStandardMaterial({ color: PAL.water, roughness: 0.15 }); E.playAction('wave', { speed: 1 }); }
  function tapHidden(k) {
    const r = L.tap(S, k); if (!r) return; E.progress();
    if (r === 'verse') { const i = +k[1]; verses[i].material.opacity = 0.35; bell(880 + i * 110); label(['“The lady with the golden skin… she has stolen my heart.” A visitor scratched this 1,200 years ago.', '“I am Budal. I came with hundreds of people to see Sigiriya. Since all the others wrote poems, I did not!”', '“The wind blows, the hornets are angry: still I climbed to see the maidens.”'][i] + ` (verse ${S.verses.filter(Boolean).length}/3)`, 5200); }
    if (r === 'leaf') { leaf.visible = false; bell(988); bell(1318, 0.15); label('<em>Puskola</em> · an ola-leaf page, tucked behind the king’s throne', 4000); }
    E.refresh();
  }
  const actionFor = { cloth: () => 'pickup', v0: () => null, v1: () => null, v2: () => null, v3: () => null, w0: () => 'place', w1: () => 'place', w2: () => 'place', w3: () => 'place',
    m0: () => null, m1: () => null, m2: () => null, m3: () => null, fl_lily: () => 'place', fl_lotus: () => 'place', fl_jasmine: () => 'place', fl_araliya: () => 'place' };
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) actionFor['turn' + i + j] = () => null;
  function unreachable(what) {
    if (/^(m|w)\d/.test(what) || what === 'cloth') { if (L.areaOf(S.player) === 2) label('You can’t get there from here. The stair only meets in one view: try turning the camera.', 3400); else label('That’s up on the rock. Open the way from the gardens first.', 3000); return; }
    if (what === 'S_base') { label('The boulder gate is still shut. Set the fountains to the heights on the carved stone first.', 3200); return; }
    if (/^fl_/.test(what)) { label('There’s no way across the terraces to the throne yet. Turn them until the cream paths join.', 3400); return; }
  }
  function hintTarget() {
    const a = L.areaOf(S.player);
    if (a === 1) {
      if (!S.gardenOpen) { const atStart = S.player === 'E_start'; return { obj: atStart ? herStone : (S.twin[0] === S.player[1] * 1 && S.twin[1] === S.player[2] * 1 ? twinStone : pool), words: ['Use the obstacles: walk into a spot where your reflection’s way is blocked and it stays put, so the two of you drift apart. Your stone is one square west of where the reflection’s should be… compare the columns.'] }; }
      if (!S.gate1) { const f = L.fountains(S.V); const want = [2, 1, 2, 1]; const i = want.findIndex((v, k) => v !== S.V[k]); return { obj: valves[Math.max(0, i)], words: [`Fountain heights now ${f.join(' · ')}, the stone wants ${L.FTARGET.join(' · ')}. Half a valve gives its share once, full gives it twice. Find how much of each valve you need.`] }; }
      return { obj: gate1Beacon, words: ['Climb through the boulder gate.'] };
    }
    if (a === 2) {
      if (!S.cloth) return { obj: S.player === 'S_base' || S.player === 'S_mid' ? joinGlow[0] : clothKit, words: ['Turn the view a quarter at a time. In one view the top of the lower flight seems to touch the upper landing; then walk across.'] };
      if (/POCKET|P_end|S_mid2/.test(S.player)) return { obj: joinGlow[1], words: ['From the west end of the pocket, turn the view until the ledge seems to touch the gallery below.'] };
      const next = S.lit.findIndex((l) => !l);
      const words = ['A boulder now blocks the beam’s straight run west. The east maiden: the first mirror can still send the light straight up to her.', 'The middle maiden: send the beam down onto the wall, along to the second polished panel and up the middle column. The mirror in that column must lie flat.', 'The west maiden is the long way: wall → up the middle column → that mirror turns it west → the next mirror sends it down → the last two panels → up.'][next];
      return { obj: next === 0 ? mirrors[0] : S.pol.every(Boolean) ? mirrors[next === 1 ? 3 : 2] : wallPanels[S.pol.findIndex((p) => !p)], words: [words] };
    }
    if (S.player === 'LION' || S.player === 'ST1' || S.player === 'ST2') return { obj: gong, words: ['Watch the gong: when it swings, the hornets stir. Step up between gusts.'] };
    const walk = !!L.findPath(S, 'SUM_IN', 'THRONE'); if (!walk || !L.waterLinked(S)) { const k = L.TILES.findIndex((t, q) => t[4] && !S.T.every(() => false) && q >= 0 && tileWrong(q)); return { obj: tiles[k >= 0 ? k : 4], words: ['The middle terrace has to carry both: the path running north–south over a little bridge, and the water crossing east–west beneath it.'] }; }
    if (!S.sluice) return { obj: sluiceStone, words: ['Stand on the sluice stone beside the summit steps.'] };
    return { obj: bowls[['lily', 'jasmine', 'araliya', 'lotus'].indexOf(L.FLOWERS[L.FLOWER_ORDER[S.offered.length]])], words: ['Along the wall from the lion end (west): blue lily, then pink lotus, then white jasmine.'] };
  }
  const SOLVED = (() => { const turnable = L.TILES.map((t, k) => (t[4] ? k : -1)).filter((k) => k >= 0); for (let c = 0; c < 4 ** turnable.length; c++) { const T = L.TILES.map((t) => t[5]); let v = c; for (const k of turnable) { T[k] = v % 4; v = Math.floor(v / 4); } const s = { ...L.initialState(), T }; if (L.waterLinked(s) && L.findPath(s, 'SUM_IN', 'THRONE')) return T; } })();
  function tileWrong(k) { const t = L.TILES[k]; return L.rotMask(t[2], S.T[k]) !== L.rotMask(t[2], SOLVED[k]) || L.rotMask(t[3], S.T[k]) !== L.rotMask(t[3], SOLVED[k]); }
  function inventory(s) { const nf = s.lit.filter(Boolean).length; return { cloth: s.cloth && !s.pol.every(Boolean), verse: s.verses.some(Boolean) ? `${s.verses.filter(Boolean).length}/3` : '', lotus: nf && !s.won ? `${nf}/3` : '', leaf: s.has.leaf }; }

  /* ---------- camera, light, motion ---------- */
  const F = [new THREE.Vector3(0, 1.2, -0.6), at2(1.0, 2.2, -0.4), at3(0, 4.2, -5.2)], Z = [1, 1.0, 0.82];
  const tod = { k: 0 };
  function focus() {
    if (finaleT >= 0) { const k = Math.min(1, finaleT / 4); const mid = F[0].clone().lerp(F[2], 0.5); return { target: F[2].clone().lerp(mid, k), zoom: Z[2] + (0.42 - Z[2]) * k, k: 2 }; }
    let a = L.areaOf(S.player) - 1, target = F[a].clone(), zoom = Z[a];
    const c = walkCur; if (c && c.e && c.e.kind === 'climb' && c.d > 0) { const ta = L.areaOf(c.to) - 1, fa = L.areaOf(c.from) - 1; const k0 = c.d / c.lens[c.lens.length - 1]; const k = k0 * k0 * (3 - 2 * k0); target = F[fa].clone().lerp(F[ta], k); zoom = Z[fa] + (Z[ta] - Z[fa]) * k; a = fa + (ta - fa) * k; }
    return { target, zoom, k: a };
  }
  const sky = [{ sun: new THREE.Color(0xfff2e0), hemi: new THREE.Color(0xeef4ee), fog: new THREE.Color(0xe6eee6) }, { sun: new THREE.Color(0xfffbe8), hemi: new THREE.Color(0xfaf2dc), fog: new THREE.Color(0xf0ead8) },
    { sun: new THREE.Color(0xffc890), hemi: new THREE.Color(0xf3dcc0), fog: new THREE.Color(0xf0dcc0) }, { sun: new THREE.Color(0xd08080), hemi: new THREE.Color(0xa080a8), fog: new THREE.Color(0x9a7a9a) }];
  drawBeam();
  function tick(dt, t) {
    clock2 += dt; if (finaleT >= 0) finaleT += dt;
    // the view index (0..3) decides which stairways meet
    { const v = ((Math.round((cam.azTo - Math.PI / 4) / (Math.PI / 2)) % 4) + 4) % 4; if (v !== S.view) { S.view = v; E.refresh(); if (L.areaOf(S.player) === 2 && (v === L.V_UP || v === L.V_DOWN)) bell(1318); } }
    const settled = Math.abs(cam.az - cam.azTo) < 0.05;
    joinGlow[0].material.opacity = S.view === L.V_UP && settled ? 0.55 + Math.sin(t * 4) * 0.3 : 0; joinGlow[1].material.opacity = S.view === L.V_DOWN && settled ? 0.55 + Math.sin(t * 4) * 0.3 : 0;
    // the reflection
    buildTwin();
    if (twinModel && twin.visible) { for (const [a, b] of twinPairs) { b.quaternion.copy(a.quaternion); b.position.copy(a.position); }
      if (twinMove.cur && twinMove.cur.lens) { const c = twinMove.cur; const k = Math.min(1, c.d / c.lens[c.lens.length - 1]); twin.position.lerpVectors(twinMove.from, twinMove.to, k); if (twinMove.blocked) twin.position.x += Math.sin(k * Math.PI) * 0.12; }
      twin.rotation.y = -girl.rotation.y; twin.position.y = S.gardenOpen ? twin.position.y : 0.02 + Math.sin(t * 2) * 0.02;
      twinModel.visible = L.areaOf(S.player) === 1; }
    // fountains
    { const f = L.fountains(S.V); fountainJets.forEach((g, j) => { const want = finaleT >= 0 ? 4.5 : S.gardenOpen ? f[j] * 0.45 : 0.15; g.userData.h += (want - g.userData.h) * Math.min(1, dt * 2); const h = Math.max(0.01, g.userData.h);
      g.userData.jet.scale.y = h; g.userData.jet.position.y = h / 2; g.userData.spray.position.y = h; g.userData.spray.scale.setScalar(0.6 + Math.sin(t * 8 + j) * 0.15); g.userData.jet.material.opacity = 0.6 + Math.sin(t * 10 + j) * 0.1; }); }
    valves.forEach((v) => v.userData.num.quaternion.copy(E.camera.quaternion));
    gate1Beacon.visible = S.gate1 && L.areaOf(S.player) === 1; gate2Beacon.visible = S.gate2 && L.areaOf(S.player) === 2;
    stoneBeacons.forEach((q) => (q.visible = !S.gardenOpen && L.areaOf(S.player) === 1)); herStone.children[herStone.children.length - 1].visible = !S.gardenOpen; twinStone.children[twinStone.children.length - 1].visible = !S.gardenOpen;
    // dull panels pulse once she has the cloth, so it is obvious what to wipe
    wallPanels.forEach((g, i) => { if (!S.pol[i]) { const f = g.userData.face; f.material.emissive = f.material.emissive || new THREE.Color(0); const on = S.cloth && L.areaOf(S.player) === 2; const k = on ? 0.5 + 0.5 * Math.sin(t * 5 + i) : 0; f.material.emissive.setRGB(0.6 * k, 0.38 * k, 0.1 * k); g.userData.wtag.visible = on; g.userData.wtag.position.y = 1.75 + Math.sin(t * 3 + i) * 0.08; } });
    gate2Ring.material.opacity = S.gate2 && L.areaOf(S.player) === 2 ? 0.55 + Math.sin(t * 4) * 0.3 : 0;
    // beam shimmer
    beamMat.opacity = 0.7 + Math.sin(t * 9) * 0.12;
    // hornets and wind
    const gust = gustAt(clock2); gong.userData.b.rotation.z = gust ? Math.sin(t * 14) * 0.5 : gong.userData.b.rotation.z * 0.9;
    if (gust && !gong.userData.rang) { gong.userData.rang = true; if (L.areaOf(S.player) === 3 && !/^(t\d\d|THRONE|CIS|SUM_IN)$/.test(S.player)) bell(392, 0, 0.6); } if (!gust) gong.userData.rang = false;
    nests.forEach((sw, n) => sw.children.forEach((h, i) => { const sp = gust ? 3.2 : 1.0, r = gust ? 1.2 + Math.sin(t * 2 + i) * 0.4 : 0.55; const a = t * sp * (1 + i * 0.07) + i; h.position.set(Math.cos(a) * r, Math.sin(a * 1.3 + n) * r * 0.6, Math.sin(a) * r); }));
    windStreaks.children.forEach((s, i) => { s.material.opacity += ((gust ? 0.5 : 0) - s.material.opacity) * Math.min(1, dt * 4); s.position.x = C3.x - 4 + ((t * 6 + i * 1.3) % 8); });
    // terraces: water shows in the linked channels when the sluice is open
    { const flows = L.waterFlows(S); tiles.forEach((g) => g.userData.inner.children.forEach((c) => { if (c.userData.water) c.material.color.setHex(flows || finaleT >= 0 ? 0x4fb4e0 : 0x6a8aa0); })); outletFall.material.opacity += (((flows || finaleT >= 0) ? 0.7 : 0) - outletFall.material.opacity) * Math.min(1, dt * 2);
      sluiceStone.userData.ring.visible = !S.sluice && L.waterLinked(S) && !!L.findPath(S, 'SUM_IN', 'THRONE'); }
    throneBeacon.visible = L.waterFlows(S) && !S.won && L.areaOf(S.player) === 3;
    // time of day: morning in the gardens, midday at the wall, golden hour at the summit, sunset at the end
    const fk = focus().k; tod.k += ((finaleT >= 0 ? 3 : fk) - tod.k) * Math.min(1, dt * 0.7);
    const i0 = Math.min(2, Math.floor(tod.k)), kk = tod.k - i0; const A = sky[i0], B = sky[Math.min(3, i0 + 1)];
    sun.color.copy(A.sun).lerp(B.sun, kk); hemi.color.copy(A.hemi).lerp(B.hemi, kk); scene.fog.color.copy(A.fog).lerp(B.fog, kk); sun.intensity = 2.2 - Math.max(0, tod.k - 2) * 1.0;
    document.body.classList.toggle('noon', tod.k > 0.6 && tod.k < 1.6); document.body.classList.toggle('dusk', tod.k >= 1.6);
    refreshPanel();
  }
  return { nodePos, surfaceTarget, edgePoints, holdEdge, onEdgeStart, onArrive, onResult, tapHidden, actionFor, items, unreachable, hintTarget, inventory, focus, tick, MSG, tod,
    reachCap: { v0: 1.0, v1: 1.0, v2: 1.0, v3: 1.0, w0: 1.0, w1: 1.0, w2: 1.0, w3: 1.0, fl_lily: 0.8, fl_lotus: 0.8, fl_jasmine: 0.8, fl_araliya: 0.8 } };
}
