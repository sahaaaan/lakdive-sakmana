// Chapter I: Polonnaruwa, "The Stupa House". Ported onto the shared engine: the scene code is the original level's,
// wrapped in the engine's level interface (nodePos, surfaces, handles, hidden finds, results, hints, focus, tick).
import * as L from './logic.js';
import HERO_GLB from './heroine.js';
const { A_STAIR_LOCAL, B_STAIR_LOCAL, CENTER, GN, GROUNDS_C, PLATES, POND_C, RAMP_SLOT, RINGS, SLOTS, SPOTS, STEP, adjacency, arriveAt, canRotate, edges, findPath, flagsFree, groundEdges, initialState, interact, localOf, nodeAtWorld, objective, reachable, ringOf, stepOn, worldSlot } = L;

const ICONS = {
  flag: ['M8 5v24#8a7a6a', 'M9 6l16 5-16 5z#c8423b'],
  lotus: ['M16 6c-3 4-3 10 0 14 3-4 3-10 0-14z#ef9db2', 'M5 12c1 6 5 9 11 9-1-5-5-9-11-9zM27 12c-1 6-5 9-11 9 1-5 5-9 11-9z#f4b5c5'],
  banana: ['M6 10c2 10 10 15 20 12-8-1-13-5-16-13z#f1cf4b'],
  lamp: ['M4 18c3 5 18 6 24-1l-3-1c-1 2-4 3-9 3s-9-1-12-1z#c97b4f'],
  flame: ['M4 18c3 5 18 6 24-1l-3-1c-1 2-4 3-9 3s-9-1-12-1z#c97b4f', 'M27 4c-3 4-3 7 0 9 3-2 3-5 0-9z#f3b33d'],
  drop: ['M16 4c-5 8-8 12-8 16a8 8 0 0016 0c0-4-3-8-8-16z#e8c46a'],
};
const SLOTS_HUD = [
  { id: 'lamp', title: 'Clay lamp (pahana)', svg: `<path d="M4 18c3 5 18 6 24-1l-3-1c-1 2-4 3-9 3s-9-1-12-1z" fill="#c97b4f"/><path d="M25 16l4-3" stroke="#a65e3b" stroke-width="2" stroke-linecap="round"/><path id="lampflame" d="M28 6c-2 3-2 5 0 6 2-1 2-3 0-6z" fill="#f3b33d" opacity="0"/>` },
  { id: 'lotus', title: 'Lotus flowers', svg: `<path d="M16 6c-3 4-3 10 0 14 3-4 3-10 0-14z" fill="#ef9db2"/><path d="M5 12c1 6 5 9 11 9-1-5-5-9-11-9zM27 12c-1 6-5 9-11 9 1-5 5-9 11-9z" fill="#f4b5c5"/><path d="M6 23c6 3 14 3 20 0" stroke="#8bab78" stroke-width="2" fill="none" stroke-linecap="round"/>`, count: true },
  { id: 'banana', title: 'Bananas', svg: `<path d="M6 10c2 10 10 15 20 12-8-1-13-5-16-13z" fill="#f1cf4b"/><path d="M8 8c3 9 10 13 19 11" stroke="#c9a43a" stroke-width="1.5" fill="none"/><path d="M5 8l2 3" stroke="#6b5a3a" stroke-width="2" stroke-linecap="round"/>` },
  { id: 'flag', title: 'Buddhist flags', svg: `<path d="M8 5v24" stroke="#8a7a6a" stroke-width="2"/><path d="M9 6h4v8H9zM13 6h4v8h-4zM17 6h4v8h-4zM21 6h4v8h-4z" fill="none"/><rect x="9" y="6" width="3.2" height="9" fill="#2f5fb3"/><rect x="12.2" y="6" width="3.2" height="9" fill="#f2c12e"/><rect x="15.4" y="6" width="3.2" height="9" fill="#c8423b"/><rect x="18.6" y="6" width="3.2" height="9" fill="#f6f2ea"/><rect x="21.8" y="6" width="3.2" height="9" fill="#e8862f"/>`, count: true },
  { id: 'pot', title: 'Clay water pot (kalagedi)', svg: `<path d="M13 5h6v3c5 2 8 6 8 11 0 6-5 9-11 9S5 25 5 19c0-5 3-9 8-11z" fill="#b4603f"/><path d="M8 17h16" stroke="#e8cf9a" stroke-width="1.5"/>` },
  { id: 'leaf', title: 'Ola-leaf page (secret)', svg: `<rect x="3" y="12" width="26" height="8" rx="2" fill="#d9be8a"/><path d="M6 15h18M6 17.5h14" stroke="#8a6a44" stroke-width="1"/><circle cx="16" cy="16" r="1.2" fill="#8a6a44"/>` },
];

export default {
  heroGlb: HERO_GLB, slots: SLOTS_HUD, icons: ICONS, logic: L,
  meta: {
    chapter: 'I', place: 'Polonnaruwa', title: 'The Stupa House', tagline: 'The lamp of Polonnaruwa has gone dark.',
    intro: 'Bring water to the bo tree and gather the scattered flags in the temple grounds. Then carry a clay lamp (pahana) through the turning terraces of the Stupa House and light it again at the dagoba.',
    howto: ['<b>Tap</b> the ground to walk. Tap objects to go to them and use them.', '<b>Find</b> hidden things. Turn the view (⟲ ⟳ or swipe) to look behind the dagoba.', '<b>Turn</b> the terraces once they awaken: tap or drag the golden wheels. You ride along if you’re standing on one.'],
    startLabel: 'Tap the path to walk. The temple grounds need tending before the Stupa House will let you in.',
    winTitle: 'The lamp is lit', winSub: 'Light returns to the Stupa House', inviteNode: 'P_x', camStart: [GROUNDS_C[0], 1.4, GROUNDS_C[2]], winDelay: 6000,
  },
  build,
};

function build(E) {
  const { THREE, S, scene, cam, sun, hemi, mat, mesh, polar, deg, tag, hash, canvasTex, bubble, sparkle, jiggle, hold, label, bell, grind, click, bump, anims, girl, $ } = E;
  const rattle = () => { const AC = E.AC; if (!AC) return; const t = AC.currentTime; for (let i = 0; i < 4; i++) E.tone(120 + i * 15, t + i * 0.07, 0.06, 'square', 0.05); };
  const chatter = () => E.sfx.monkey();
  const fx = () => E.sfx; // sound effects (the engine's sound kit exists once sound starts)

const PAL = {
  granite: 0xbcb3a6, graniteLight: 0xd6cfc4, graniteDark: 0x938a7f,
  brick: 0xb8735a, brickLight: 0xcc8f73, brickDark: 0x965a45,
  sand: 0xf2ebdd, grass: 0xa2a66b, grassDark: 0x858e55, rock: 0xcdbfac, rockDark: 0xae9f8b,
  plaster: 0xf7f3eb, weathered: 0xc4b8a7, gold: 0xdcae58, clay: 0xc6794f, skin: 0x8a5a3c, white: 0xfbf8f3,
  lotus: 0xf2a3b8, lotusLight: 0xf8c9d4, leaf: 0x86a873, water: 0x8fc3c2, lily: 0x7f8fd6,
  flags: [0x2f5fb3, 0xf2c12e, 0xc8423b, 0xf6f2ea, 0xe8862f],
};
function sector(inner, outer, th0, th1, y0, y1, color, m) {
  const a0 = th0 - Math.PI / 2, a1 = th1 - Math.PI / 2;
  const sh = new THREE.Shape();
  sh.absarc(0, 0, outer, a0, a1, false); sh.lineTo(inner * Math.cos(a1), inner * Math.sin(a1)); sh.absarc(0, 0, inner, a1, a0, true); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: y1 - y0, bevelEnabled: false, curveSegments: Math.max(6, Math.round((th1 - th0) / (Math.PI / 48))) });
  g.rotateX(-Math.PI / 2); g.translate(0, y0, 0);
  return mesh(g, m || mat(color));
}
const BRICK_TEX = canvasTex(256, 128, (x, w, h) => {
  x.fillStyle = '#b8735a'; x.fillRect(0, 0, w, h);
  const bh = 16, bw = 42;
  for (let r = 0; r < h / bh; r++) for (let c = -1; c < w / bw + 1; c++) {
    const ox = (r % 2) * bw / 2; const v = hash(r, c, 1);
    x.fillStyle = `rgb(${172 + v * 30},${100 + v * 25},${78 + v * 20})`;
    x.fillRect(c * bw + ox + 1.5, r * bh + 1.5, bw - 3, bh - 3);
  }
  x.fillStyle = 'rgba(80,90,60,.10)'; for (let i = 0; i < 40; i++) { x.beginPath(); x.arc(hash(i, 2, 3) * w, hash(i, 5, 1) * h, 4 + hash(i, 1, 9) * 10, 0, 7); x.fill(); }
});
BRICK_TEX.wrapS = BRICK_TEX.wrapT = THREE.RepeatWrapping;
const PARAPET_TEX = canvasTex(256, 64, (x, w, h) => {
  x.fillStyle = '#d6cfc4'; x.fillRect(0, 0, w, h);
  x.strokeStyle = '#a59c90'; x.lineWidth = 3; x.strokeRect(3, 3, w - 6, h - 6);
  for (let i = 0; i < 4; i++) { const cx = 32 + i * 64, cy = 32; x.beginPath(); x.arc(cx, cy, 18, 0, 7); x.stroke();
    for (let p = 0; p < 8; p++) { const a = p / 8 * Math.PI * 2; x.beginPath(); x.ellipse(cx + Math.cos(a) * 10, cy + Math.sin(a) * 10, 6, 3, a, 0, 7); x.stroke(); } }
});
PARAPET_TEX.wrapS = THREE.RepeatWrapping;
// cylindrical UV mapping so textures wrap around rings
function cylUV(geo, repeatPerUnit = 0.35, vScale = 1) {
  const p = geo.attributes.position, n = geo.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const side = Math.abs(n.getY(i)) < 0.5;
    if (side) { uv[i * 2] = Math.atan2(x, z) * Math.hypot(x, z) * repeatPerUnit; uv[i * 2 + 1] = y * vScale; }
    else { uv[i * 2] = x * repeatPerUnit; uv[i * 2 + 1] = z * repeatPerUnit; }
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return geo;
}
const brickMat = new THREE.MeshStandardMaterial({ map: BRICK_TEX, roughness: 0.95, flatShading: true });
const parapetMat = new THREE.MeshStandardMaterial({ map: PARAPET_TEX, roughness: 0.95 });

// Icon art (shared by HUD bubbles)
const glowTex = (inner, outer) => canvasTex(64, 64, (x) => { const g = x.createRadialGradient(32, 36, 2, 32, 32, 30); g.addColorStop(0, '#fff8e0'); g.addColorStop(0.25, inner); g.addColorStop(0.6, outer + '66'); g.addColorStop(1, outer + '00'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });
const FLAME_TEX = glowTex('#ffd36a', '#ff9a3c');
const SPARK_TEX = canvasTex(64, 64, (x) => { x.translate(32, 32); const g = x.createRadialGradient(0, 0, 0, 0, 0, 30); g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(.3, 'rgba(255,225,150,.5)'); g.addColorStop(1, 'rgba(255,220,140,0)'); x.fillStyle = g; x.fillRect(-32, -32, 64, 64); x.fillStyle = '#fffbe8'; for (let i = 0; i < 4; i++) { x.rotate(Math.PI / 4); x.fillRect(-1.5, -28, 3, 56); } });

/* ================= ISLAND ================= */
const world = new THREE.Group(); scene.add(world);
{
  const top = -0.42;
  const g = new THREE.CylinderGeometry(9.95, 2.2, 7.5, 18, 5);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); if (y > 3.7) continue;
    const k = 1 + (hash(Math.round(x * 10), Math.round(y * 10), Math.round(z * 10)) - 0.5) * 0.28; p.setXYZ(i, x * k, y + (hash(z, x, y) - 0.5) * 0.7, z * k); }
  g.computeVertexNormals();
  const rock = mesh(g, mat(PAL.rock)); rock.position.y = top - 3.75; world.add(rock);
  const tip = mesh(new THREE.ConeGeometry(2.3, 3.4, 9), mat(PAL.rockDark)); tip.rotation.x = Math.PI; tip.position.y = top - 9.1; world.add(tip);
  // roots of the island: a few hanging granite boulders
  for (let i = 0; i < 4; i++) { const c = mesh(new THREE.DodecahedronGeometry(0.5 + hash(i, 2, 3) * 0.5, 0), mat(PAL.rockDark)); c.position.copy(polar(3 + hash(i, 1, 1) * 3, i * 1.7, top - 8 - hash(i, 4, 4) * 2.5)); world.add(c); }
  const grass = mesh(new THREE.CylinderGeometry(9.7, 9.7, 0.42, 72), mat(PAL.grass, { flatShading: false })); grass.position.y = -0.21; world.add(grass); tag(grass, { surface: 'G' });
  const sand = sector(7.05, 8.75, 0, Math.PI * 2, 0, 0.04, PAL.sand); world.add(sand); tag(sand, { surface: 'G' }); // swept white-sand temple yard (meda midula)
  const kerbGeo = cylUV(sector(9.32, 9.78, 0, Math.PI * 2, -0.42, 0.22, 0).geometry, 0.5, 2);
  const kerb = mesh(kerbGeo, mat(PAL.graniteLight)); world.add(kerb); tag(kerb, { surface: 'G' });
}

/* ================= TERRACES ================= */
const ringGroups = { G: world };
function buildRing(R) {
  const g = new THREE.Group(); scene.add(g); ringGroups[R] = g;
  const { inner, outer, y, broken } = RINGS[R];
  const gap = 0.12;
  for (let i = 0; i < SLOTS; i++) {
    let th0 = (i - 0.5) * STEP, th1 = (i + 0.5) * STEP;
    if (broken.includes((i - 1 + SLOTS) % SLOTS)) th0 += gap;
    if (broken.includes(i)) th1 -= gap;
    let parts;
    if (R === 'A') { // brick terrace with a granite coping
      const body = sector(inner, outer, th0, th1, 0, y - 0.12, 0, brickMat); cylUV(body.geometry, 0.45, 1.1);
      const cap = sector(inner, outer + 0.06, th0, th1, y - 0.12, y, PAL.graniteLight);
      const plinth = sector(outer, outer + 0.18, th0, th1, 0, 0.3, PAL.granite);
      parts = [body, cap, plinth];
    } else { // granite upper terrace with a carved stone screen wall
      const body = sector(inner, outer, th0, th1, 0, y - 0.12, 0, brickMat); cylUV(body.geometry, 0.45, 1.1);
      const cap = sector(inner, outer + 0.05, th0, th1, y - 0.12, y, PAL.granite);
      const plinth = sector(outer, outer + 0.14, th0, th1, RINGS.A.y, RINGS.A.y + 0.24, PAL.graniteDark);
      parts = [body, cap, plinth];
      // carved parapet along the outer edge, leaving an opening for the stair
      const segs = [[th0, th1]];
      if (i === B_STAIR_LOCAL) segs.splice(0, 1, [th0, -0.2], [0.2, th1]);
      for (const [a, b] of segs) if (b - a > 0.05) {
        const pw = sector(outer - 0.16, outer - 0.02, a, b, y, y + 0.42, 0, parapetMat); cylUV(pw.geometry, 1.0, 2.2); parts.push(pw);
        const pc = sector(outer - 0.19, outer + 0.01, a, b, y + 0.42, y + 0.48, PAL.graniteLight); parts.push(pc);
      }
    }
    for (const m of parts) { g.add(m); tag(m, { surface: R }); }
  }
  for (const b of broken) {
    const th = (b + 0.5) * STEP;
    for (let k = 0; k < 6; k++) {
      const s = 0.2 + hash(b, k, 1) * 0.3;
      const c = mesh(new THREE.BoxGeometry(s * 1.6, s * 0.6, s * 0.8), mat(k % 2 ? PAL.brick : PAL.granite));
      c.position.copy(polar(inner + 0.3 + hash(k, b, 2) * (outer - inner - 0.6), th + (hash(b, k, 3) - 0.5) * 0.12, s * 0.3)); c.rotation.set(hash(k, 1, b), hash(k, 2, b) * 3, hash(k, 3, b)); g.add(c);
    }
  }
  return g;
}
buildRing('A'); buildRing('B');

// central platform: brick drum with an elephant frieze (as at Ruwanwelisaya), granite coping
const platform = new THREE.Group(); scene.add(platform);
{
  const body = mesh(cylUV(new THREE.CylinderGeometry(2.4, 2.4, CENTER.y - 0.12, 48, 1), 0.45, 1.1), brickMat); body.position.y = (CENTER.y - 0.12) / 2; platform.add(body);
  const cap = mesh(new THREE.CylinderGeometry(2.48, 2.48, 0.12, 48), mat(PAL.graniteLight, { flatShading: false })); cap.position.y = CENTER.y - 0.06; platform.add(cap);
  const band = mesh(new THREE.CylinderGeometry(2.45, 2.45, 0.08, 48), mat(PAL.granite, { flatShading: false })); band.position.y = RINGS.B.y + 0.04; platform.add(band);
  const pl = mat(PAL.plaster);
  for (let k = 0; k < 16; k++) {
    const th = (k + 0.5) * Math.PI * 2 / 16; if (Math.abs(th - CENTER.slot * STEP) < 0.32) continue;
    const e = new THREE.Group();
    const head = mesh(new THREE.SphereGeometry(0.2, 8, 6), pl); head.scale.set(1, 1.05, 0.75); e.add(head);
    for (const s of [-1, 1]) { const ear = mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 8), pl); ear.rotation.x = Math.PI / 2; ear.position.set(s * 0.2, 0.02, -0.04); ear.scale.set(0.8, 1, 1.1); e.add(ear);
      const tusk = mesh(new THREE.ConeGeometry(0.025, 0.14, 5), mat(0xfffdf6)); tusk.position.set(s * 0.07, -0.16, 0.12); tusk.rotation.x = 2.2; e.add(tusk); }
    const trunk = mesh(new THREE.CylinderGeometry(0.035, 0.065, 0.34, 6), pl); trunk.position.set(0, -0.2, 0.13); trunk.rotation.x = 0.35; e.add(trunk);
    e.position.copy(polar(2.5, th, RINGS.B.y + 0.62)); e.rotation.y = th; platform.add(e);
  }
  tag(platform, { surface: 'C' });
}

/* ================= STAIRS ================= */
function makeStair({ rTop, yTop, rBot, yBot, width = 1.15, color = PAL.graniteLight, side = PAL.granite, guard = false }) {
  const g = new THREE.Group();
  const n = Math.max(4, Math.round((yTop - yBot) / 0.18)); const d = (rBot - rTop) / n, dy = (yTop - yBot) / n;
  for (let i = 0; i < n; i++) { const h = yTop - (i + 1) * dy - yBot + dy * 0.98; const s = mesh(new THREE.BoxGeometry(width, h, d * 1.02), mat(color)); s.position.set(0, yBot + h / 2, rTop + d * (i + 0.5)); g.add(s); }
  for (const sx of [-1, 1]) {
    const len = Math.hypot(rBot - rTop, yTop - yBot);
    const wall = mesh(new THREE.BoxGeometry(0.16, 0.22, len + 0.1), mat(side)); wall.position.set(sx * (width / 2 + 0.08), (yTop + yBot) / 2 + 0.06, (rTop + rBot) / 2); wall.rotation.x = Math.atan2(yTop - yBot, rBot - rTop); g.add(wall);
    const fillw = mesh(new THREE.BoxGeometry(0.16, yTop - yBot, rBot - rTop), mat(side)); fillw.position.set(sx * (width / 2 + 0.08), yBot + (yTop - yBot) / 2 - 0.05, (rTop + rBot) / 2); fillw.scale.y = 0.98; g.add(fillw);
    // makara balustrade scroll at the foot
    const scroll = mesh(new THREE.TorusGeometry(0.13, 0.06, 6, 10, Math.PI * 1.3), mat(side)); scroll.rotation.y = Math.PI / 2; scroll.position.set(sx * (width / 2 + 0.08), yBot + 0.16, rBot - 0.02); g.add(scroll);
    if (guard) { // muragala guardstones
      const gs = new THREE.Group();
      const slab = mesh(new THREE.BoxGeometry(0.14, 0.8, 0.5), mat(PAL.graniteLight)); slab.position.y = 0.4; gs.add(slab);
      const arch = mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.14, 12, 1, false, 0, Math.PI), mat(PAL.graniteLight)); arch.rotation.z = Math.PI / 2; arch.rotation.y = Math.PI / 2; arch.position.y = 0.8; gs.add(arch);
      const fig = mesh(new THREE.CapsuleGeometry(0.06, 0.32, 3, 6), mat(PAL.granite)); fig.position.set(sx * 0.08, 0.45, 0); gs.add(fig);
      gs.position.set(sx * (width / 2 + 0.22), yBot, rBot + 0.15); g.add(gs);
    }
  }
  return g;
}
const MOON_TEX = canvasTex(256, 256, (x) => {
  const bands = [['#d6cfc6', 128], ['#c0b8ae', 118], ['#e0d9d0', 108], ['#bdb4a9', 92], ['#d9d2c8', 82], ['#c4bbb0', 66], ['#e3ddd4', 54], ['#bfb6ab', 34], ['#e8e2da', 22]];
  for (const [col, r] of bands) { x.fillStyle = col; x.beginPath(); x.arc(128, 128, r, 0, Math.PI * 2); x.fill(); }
  x.strokeStyle = 'rgba(120,108,96,.55)'; x.lineWidth = 2;
  // procession of animals (elephant, horse, lion, bull) suggested by little ovals, then geese, then lotus
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; x.beginPath(); x.ellipse(128 + Math.cos(a) * 100, 128 + Math.sin(a) * 100, 8, 5, a + Math.PI / 2, 0, 7); x.stroke(); }
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; x.beginPath(); x.arc(128 + Math.cos(a) * 74, 128 + Math.sin(a) * 74, 4, 0, 7); x.stroke(); }
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; x.beginPath(); x.ellipse(128 + Math.cos(a) * 44, 128 + Math.sin(a) * 44, 9, 4, a, 0, Math.PI * 2); x.stroke(); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; x.beginPath(); x.moveTo(128, 128); x.lineTo(128 + Math.cos(a) * 20, 128 + Math.sin(a) * 20); x.stroke(); }
});
function moonstone(r = 0.6, half = true) {
  const g = new THREE.CylinderGeometry(r, r, 0.06, 32, 1, false, half ? -Math.PI / 2 : 0, half ? Math.PI : Math.PI * 2);
  const m = new THREE.Mesh(g, [mat(PAL.granite), new THREE.MeshStandardMaterial({ map: MOON_TEX, roughness: 0.95 }), mat(PAL.granite)]); m.receiveShadow = true; return m;
}
const stairA = makeStair({ rTop: RINGS.A.outer, yTop: RINGS.A.y, rBot: 7.45, yBot: 0, color: PAL.brickLight, side: PAL.brick });
stairA.rotation.y = A_STAIR_LOCAL * STEP; ringGroups.A.add(stairA); tag(stairA, { surface: 'A' });
{ const ms = moonstone(0.62); ms.position.set(0, 0.06, 7.55); stairA.add(ms); }
const ramp = makeStair({ rTop: RINGS.A.outer + 0.02, yTop: RINGS.A.y, rBot: 7.45, yBot: 0, guard: true });
ramp.rotation.y = RAMP_SLOT * STEP; world.add(ramp); tag(ramp, { surface: 'G' });
{ const ms = moonstone(0.62); ms.position.set(0, 0.06, 7.6); ramp.add(ms); }
const stairB = makeStair({ rTop: RINGS.B.outer, yTop: RINGS.B.y, rBot: 5.15, yBot: RINGS.A.y });
stairB.rotation.y = B_STAIR_LOCAL * STEP; ringGroups.B.add(stairB); tag(stairB, { surface: 'B' }); stairB.scale.set(1, 0.02, 0.3); stairB.visible = false;
const stairC = makeStair({ rTop: 2.46, yTop: CENTER.y, rBot: 3.02, yBot: RINGS.B.y, width: 1.0 });
stairC.rotation.y = CENTER.slot * STEP; scene.add(stairC); tag(stairC, { surface: 'C' });

/* ================= PILLARS (lotus capitals) ================= */
const lotusPillarAngle = 7 * (STEP / 2) + STEP / 4;
{
  const g = ringGroups.B, pr = 4.0, y0 = RINGS.B.y;
  const short = new Set([3, 4, 10, 13]); const tops = [];
  for (let k = 0; k < 16; k++) {
    const a = k * STEP / 2 + STEP / 4;
    if (RINGS.B.broken.some((b) => Math.abs(a - (b + 0.5) * STEP) < 0.14)) { tops.push(null); continue; }
    const h = short.has(k) ? 0.6 + hash(k, 9, 9) * 0.6 : 2.5;
    const p = new THREE.Group();
    const base = mesh(new THREE.BoxGeometry(0.4, 0.14, 0.4), mat(PAL.granite)); base.position.y = 0.07; p.add(base);
    const shaft = mesh(new THREE.CylinderGeometry(0.14, 0.16, h, 8), mat(PAL.graniteLight)); shaft.position.y = 0.14 + h / 2; p.add(shaft);
    if (!short.has(k)) {
      const capi = mesh(new THREE.CylinderGeometry(0.24, 0.15, 0.16, 8), mat(PAL.granite)); capi.position.y = 0.14 + h + 0.08; p.add(capi);
      const abac = mesh(new THREE.BoxGeometry(0.38, 0.08, 0.38), mat(PAL.graniteLight)); abac.position.y = 0.14 + h + 0.2; p.add(abac);
    } else { const chunk = mesh(new THREE.DodecahedronGeometry(0.2, 0), mat(PAL.graniteLight)); chunk.position.set(0.3, 0.12, 0.25); p.add(chunk); }
    p.position.copy(polar(pr, a, y0)); p.rotation.y = a; g.add(p); tag(p, { surface: 'B' });
    tops.push(short.has(k) ? null : polar(pr, a, y0 + 0.14 + h + 0.24));
  }
  const skip = new Set([0, 6, 7, 11]);
  for (let k = 0; k < 16; k++) { const a = tops[k], b = tops[(k + 1) % 16]; if (!a || !b || skip.has(k)) continue;
    const l = mesh(new THREE.BoxGeometry(0.3, 0.2, a.distanceTo(b) + 0.34), mat(PAL.granite)); l.position.copy(a).add(b).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.1, 0)); l.lookAt(b.x, l.position.y, b.z); g.add(l); tag(l, { surface: 'B' }); }
}

/* ================= DAGOBA (weathered until the lamp is lit) ================= */
const domeMat = new THREE.MeshStandardMaterial({ color: PAL.weathered, roughness: 0.85, emissive: 0x000000 });
const finMat = new THREE.MeshStandardMaterial({ color: 0x9c8e7c, roughness: 0.6, metalness: 0.1 });
{
  const g = new THREE.Group(); g.position.y = CENTER.y; platform.add(g);
  [[1.58, 0.16], [1.48, 0.16], [1.38, 0.16]].reduce((y, [r, h]) => { const m = mesh(new THREE.CylinderGeometry(r, r, h, 48), domeMat); m.position.y = y + h / 2; g.add(m); return y + h; }, 0);
  const prof = [[1.32, 0], [1.31, 0.3], [1.24, 0.72], [1.08, 1.12], [0.84, 1.45], [0.55, 1.68], [0.25, 1.8], [0, 1.83]].map(([x, y]) => new THREE.Vector2(x, y));
  const dome = mesh(new THREE.LatheGeometry(prof, 48), domeMat); dome.position.y = 0.48; g.add(dome);
  const harmika = mesh(new THREE.BoxGeometry(0.52, 0.36, 0.52), domeMat); harmika.position.y = 2.47; g.add(harmika);
  const hcap = mesh(new THREE.BoxGeometry(0.62, 0.06, 0.62), domeMat); hcap.position.y = 2.67; g.add(hcap);
  const spire = mesh(new THREE.ConeGeometry(0.2, 1.45, 16), domeMat); spire.position.y = 3.42; g.add(spire);
  for (let i = 0; i < 6; i++) { const t = mesh(new THREE.TorusGeometry(0.19 - i * 0.022, 0.025, 6, 16), domeMat); t.rotation.x = Math.PI / 2; t.position.y = 2.82 + i * 0.16; g.add(t); }
  const fin = mesh(new THREE.SphereGeometry(0.08, 10, 8), finMat); fin.position.y = 4.18; g.add(fin);
  // weathering streaks on the dome
  for (let i = 0; i < 10; i++) { const s = mesh(new THREE.BoxGeometry(0.06, 0.5 + hash(i, 1, 2) * 0.4, 0.02), mat(0xa99d8b)); const th = i / 10 * Math.PI * 2 + 0.2; s.position.copy(polar(1.27, th, 0.75)); s.rotation.y = th; s.rotation.x = -0.12; g.add(s); s.userData.streak = true; }
  g.userData.isDagoba = true;
  tag(g, { surface: 'C' });
}

/* ================= PROPS ================= */
function lotusFlower(scale = 1, pad = true) {
  const g = new THREE.Group();
  if (pad) g.add(mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.03, 14, 1, false, 0.3, Math.PI * 2 - 0.6), mat(PAL.leaf)));
  for (let ring = 0; ring < 2; ring++) for (let i = 0; i < 7; i++) {
    const p = mesh(new THREE.SphereGeometry(0.1, 6, 5), mat(ring ? PAL.lotus : PAL.lotusLight)); const a = i / 7 * Math.PI * 2 + ring * 0.45;
    p.scale.set(0.55, 1.4, 0.35); p.position.set(Math.cos(a) * (0.1 - ring * 0.045), 0.12 + ring * 0.03, Math.sin(a) * (0.1 - ring * 0.045)); p.lookAt(p.position.clone().multiplyScalar(3).setY(1.2)); g.add(p);
  }
  const c = mesh(new THREE.SphereGeometry(0.045, 6, 5), mat(0xf3d36b)); c.position.y = 0.14; g.add(c);
  g.scale.setScalar(scale); return g;
}
function clayLamp() {
  const g = new THREE.Group();
  const prof = [[0, 0], [0.1, 0.0], [0.15, 0.05], [0.15, 0.08], [0.12, 0.085], [0.1, 0.06], [0, 0.05]].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(mesh(new THREE.LatheGeometry(prof, 14), mat(PAL.clay)));
  const nose = mesh(new THREE.ConeGeometry(0.04, 0.12, 6), mat(PAL.clay)); nose.rotation.z = -Math.PI / 2.3; nose.position.set(0.18, 0.07, 0); g.add(nose);
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: FLAME_TEX, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  flame.scale.set(0.28, 0.42, 1); flame.position.set(0.22, 0.24, 0); flame.visible = false; g.add(flame); g.userData.flame = flame; return g;
}
function oilPot() {
  const prof = [[0, 0], [0.16, 0.01], [0.27, 0.16], [0.27, 0.34], [0.16, 0.46], [0.12, 0.5], [0.16, 0.56], [0.13, 0.57], [0, 0.55]].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.Group(); g.add(mesh(new THREE.LatheGeometry(prof, 14), mat(0xb5664a)));
  const band = mesh(new THREE.TorusGeometry(0.265, 0.02, 4, 18), mat(0xe8cf9a)); band.rotation.x = Math.PI / 2; band.position.y = 0.28; g.add(band);
  const oil = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.01, 12), new THREE.MeshStandardMaterial({ color: 0xe8c46a, roughness: 0.2, emissive: 0x3a2a08 })); oil.position.y = 0.55; g.add(oil);
  return g;
}
function bananas() {
  const g = new THREE.Group();
  const leafm = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.02, 3), mat(0x7f9f62)); leafm.scale.set(1, 1, 0.6); g.add(leafm);
  for (let i = 0; i < 5; i++) { const b = mesh(new THREE.CapsuleGeometry(0.045, 0.26, 3, 6), mat(0xf0cd4a)); b.rotation.z = Math.PI / 2 - 0.3; b.rotation.y = -0.6 + i * 0.3; b.position.set(0, 0.07 + (i % 2) * 0.02, 0); b.translateY(0.08); g.add(b); }
  return g;
}
function tree({ seed, kind }) {
  const g = new THREE.Group();
  const bark = mat(kind === 'bo' ? 0xb0a395 : 0x8f8379);
  const trunkH = kind === 'bo' ? 1.0 : 1.2;
  const trunk = mesh(new THREE.CylinderGeometry(kind === 'bo' ? 0.16 : 0.1, kind === 'bo' ? 0.3 : 0.16, trunkH, 7), bark); trunk.position.y = trunkH / 2; g.add(trunk);
  const n = kind === 'bo' ? 7 : 4;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + seed; const spread = kind === 'bo' ? 0.75 : 0.55;
    const br = mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.9, 5), bark); br.position.set(Math.cos(a) * 0.25, trunkH + 0.25, Math.sin(a) * 0.25); br.rotation.set(Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6); g.add(br);
    let col = i % 2 ? 0x86a36c : 0x6f8f5c;
    if (kind === 'na' && i % 2 === 0) col = 0xb5583f; // Na tree: red young leaves
    if (kind === 'bo') col = i % 2 ? 0x7fa267 : 0x91b177;
    const crown = mesh(new THREE.IcosahedronGeometry((kind === 'bo' ? 0.55 : 0.42) + hash(seed, i, 1) * 0.15, 0), mat(col));
    crown.position.set(Math.cos(a) * spread, trunkH + 0.7 + hash(seed, i, 2) * 0.3, Math.sin(a) * spread); crown.scale.y = 0.66; g.add(crown);
    if (kind === 'araliya') for (let f = 0; f < 3; f++) { const fl = mesh(new THREE.SphereGeometry(0.06, 5, 4), mat(0xfff6e4)); fl.position.copy(crown.position).add(new THREE.Vector3((hash(i, f, seed) - 0.5) * 0.6, 0.22, (hash(f, i, seed) - 0.5) * 0.6)); g.add(fl); }
  }
  if (kind === 'na') { const top = mesh(new THREE.IcosahedronGeometry(0.4, 0), mat(0x6f8f5c)); top.position.y = trunkH + 1.25; top.scale.y = 0.8; g.add(top); }
  if (kind === 'bo') { // golden railing (ran veta)
    for (let s = 0; s < 4; s++) { const rail = mesh(new THREE.BoxGeometry(1.3, 0.05, 0.05), mat(PAL.gold, { metalness: 0.3, roughness: 0.5 })); rail.position.copy(polar(0.65, s * Math.PI / 2, 0.42)); rail.rotation.y = s * Math.PI / 2 + Math.PI / 2; g.add(rail);
      for (let q = -2; q <= 2; q++) { const post = mesh(new THREE.BoxGeometry(0.04, 0.45, 0.04), mat(PAL.gold, { metalness: 0.3, roughness: 0.5 })); post.position.copy(polar(0.65, s * Math.PI / 2, 0.22)).add(polar(q * 0.3, s * Math.PI / 2 + Math.PI / 2, 0)); g.add(post); } }
  }
  return g;
}
function coconut(seed) {
  const g = new THREE.Group(); const bark = mat(0xa38b73);
  let p = new THREE.Vector3(); const lean = 0.18 + hash(seed, 1, 1) * 0.12;
  for (let i = 0; i < 7; i++) { const s = mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.42, 6), bark); s.position.set(p.x, p.y + 0.21, p.z); s.rotation.z = -lean * (i / 7); g.add(s); p = new THREE.Vector3(p.x + Math.sin(lean * i / 7) * 0.42, p.y + Math.cos(lean * i / 7) * 0.42, p.z); }
  for (let i = 0; i < 8; i++) { const f = mesh(new THREE.ConeGeometry(0.16, 1.4, 3), mat(i % 2 ? 0x7d9e5e : 0x6c8c52)); const a = i / 8 * Math.PI * 2; f.position.copy(p).add(new THREE.Vector3(Math.cos(a) * 0.5, -0.12, Math.sin(a) * 0.5)); f.rotation.set(0, -a, 0); f.rotateZ(Math.PI / 2 + 0.45); f.scale.set(1, 1, 0.25); g.add(f); }
  return g;
}
function monkeyMesh() {
  const g = new THREE.Group(); const fur = mat(0x8f6b4b), face = mat(0xd69b82), dark = mat(0x5b4331);
  const body = mesh(new THREE.SphereGeometry(0.24, 10, 8), fur); body.scale.set(1, 1.2, 0.95); body.position.y = 0.3; g.add(body);
  const head = new THREE.Group(); head.position.set(0, 0.66, 0.04); g.add(head);
  head.add(mesh(new THREE.SphereGeometry(0.16, 10, 8), fur));
  const cap = mesh(new THREE.SphereGeometry(0.12, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xa07a55)); cap.position.set(0, 0.08, -0.04); cap.scale.set(1.25, 0.7, 1.2); head.add(cap);
  const f = mesh(new THREE.SphereGeometry(0.1, 8, 6), face); f.scale.set(1, 0.9, 0.6); f.position.set(0, -0.03, 0.1); head.add(f);
  for (const s of [-1, 1]) {
    const e = mesh(new THREE.SphereGeometry(0.018, 5, 4), dark); e.position.set(s * 0.04, 0, 0.16); head.add(e);
    const ear = mesh(new THREE.SphereGeometry(0.045, 6, 5), face); ear.position.set(s * 0.16, 0.02, -0.02); head.add(ear);
    const arm = mesh(new THREE.CapsuleGeometry(0.05, 0.22, 3, 6), fur); arm.position.set(s * 0.2, 0.32, 0.12); arm.rotation.x = -0.8; g.add(arm);
    const leg = mesh(new THREE.CapsuleGeometry(0.06, 0.16, 3, 6), fur); leg.position.set(s * 0.13, 0.08, 0.12); leg.rotation.x = -1.3; g.add(leg);
  }
  g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.15, -0.2), new THREE.Vector3(0.1, 0.1, -0.5), new THREE.Vector3(0.35, 0.3, -0.6), new THREE.Vector3(0.4, 0.6, -0.45)]), 12, 0.03, 5), fur));
  const snack = bananas(); snack.scale.setScalar(0.5); snack.position.set(0, 0.35, 0.25); snack.visible = false; g.add(snack);
  g.userData = { head, snack }; return g;
}
// Buddhist flag string between two fixed points
const flagStrings = [];
function flagString(a, b, sag = 0.5, n = 12) {
  const g = new THREE.Group();
  const mid = a.clone().add(b).multiplyScalar(0.5); mid.y -= sag;
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.012, 3), mat(0x8a7a6a)));
  for (let i = 1; i < n; i++) {
    const p = curve.getPoint(i / n); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.26), new THREE.MeshStandardMaterial({ color: PAL.flags[i % 5], side: THREE.DoubleSide, roughness: 0.9 }));
    f.geometry.translate(0, -0.13, 0); f.position.copy(p); f.lookAt(p.clone().add(new THREE.Vector3(b.z - a.z, 0, a.x - b.x))); f.userData.ph = i; g.add(f); flagStrings.push(f);
  }
  scene.add(g); return g;
}

// ---- held props (the engine keeps them in her hands, upright) ----
const heldLamp = hold(clayLamp(), 'handR', 0.75, [-0.055, -0.03, 0.0]);
const heldBanana = hold(bananas(), 'handL', 0.3, [0.05, -0.03, 0.0]);
girl.userData.lamp = heldLamp; girl.userData.carryBanana = heldBanana;
const ACTION_FOR = {
  sluice: () => 'place', pot: () => !S.hasPot && !S.boWatered && 'pickup', bo: () => S.hasPot && !S.boWatered && 'place', flagline: () => S.flags >= 5 && !S.flagsHung && 'place',
  lamp: () => !S.has.lamp && 'pickup', banana: () => !S.has.banana && !S.monkeyFed && 'pickup',
  oil: () => !S.has.oil && S.has.lamp && 'pickup', altar: () => !S.offered && S.lotus >= 3 && 'place',
  monkey: () => !S.monkeyFed && S.has.banana && 'place', dagoba: () => !S.lit && S.has.lamp && S.has.oil && 'place',
};
/* ================= INTERACTABLES ================= */
const items = {};
function placeOn(R, obj, r, th, y) { obj.position.copy(polar(r, th, y)); ringGroups[R].add(obj); return obj; }
{ // lamp on a stone stand (G7)
  const g = new THREE.Group();
  const col = mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.7, 8), mat(PAL.graniteLight)); col.position.y = 0.35; g.add(col);
  const top = mesh(new THREE.BoxGeometry(0.5, 0.08, 0.5), mat(PAL.granite)); top.position.y = 0.74; g.add(top);
  const lamp = clayLamp(); lamp.position.y = 0.78; g.add(lamp);
  placeOn('G', g, 8.6, 7 * STEP, 0); g.rotation.y = 7 * STEP; g.userData.lamp = lamp; tag(g, { item: 'lamp' }); items.lamp = g;
}
const sockets = [];
{ // flower altar (mal asanaya) with three lotus-shaped hollows (G3)
  const g = new THREE.Group();
  const base = mesh(new THREE.BoxGeometry(0.7, 0.42, 0.5), mat(PAL.granite)); base.position.y = 0.21; g.add(base);
  const slab = mesh(new THREE.BoxGeometry(1.2, 0.12, 0.75), mat(PAL.graniteLight)); slab.position.y = 0.48; g.add(slab);
  for (const s of [-1, 1]) { const leg = mesh(new THREE.BoxGeometry(0.12, 0.42, 0.6), mat(PAL.granite)); leg.position.set(s * 0.5, 0.21, 0); g.add(leg); }
  [-0.36, 0, 0.36].forEach((x) => {
    const sock = new THREE.Mesh(new THREE.CircleGeometry(0.14, 16), new THREE.MeshBasicMaterial({ color: 0xf3b9c8, transparent: true, opacity: 0.35, depthWrite: false }));
    sock.rotation.x = -Math.PI / 2; sock.position.set(x, 0.545, 0); g.add(sock);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.17, 16), mat(PAL.graniteDark)); ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.543, 0); g.add(ring);
    const l = lotusFlower(0.8, false); l.position.set(x, 0.54, 0); l.visible = false; g.add(l);
    sockets.push({ glow: sock, lotus: l });
  });
  placeOn('G', g, 8.6, 3 * STEP, 0); g.rotation.y = 3 * STEP; tag(g, { item: 'altar' }); items.altar = g;
}
const monkey = monkeyMesh();
monkey.position.copy(polar(7.1, RAMP_SLOT * STEP, 0.55)); monkey.rotation.y = RAMP_SLOT * STEP; scene.add(monkey); tag(monkey, { item: 'monkey' }); items.monkey = monkey;
{ const b = bananas(); placeOn('A', b, 6.05, 7 * STEP + 0.09, RINGS.A.y + 0.05); tag(b, { item: 'banana' }); items.banana = b; }
{ const p = oilPot(); placeOn('A', p, 4.95, 4 * STEP, RINGS.A.y); tag(p, { item: 'oil' }); items.oil = p; }
const dagobaLamp = clayLamp();
let lampSocket;
{
  const g = new THREE.Group();
  const t = mesh(new THREE.BoxGeometry(0.42, 0.4, 0.42), mat(PAL.graniteLight)); t.position.y = 0.2; g.add(t);
  const tp = mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), mat(PAL.granite)); tp.position.y = 0.42; g.add(tp);
  lampSocket = new THREE.Mesh(new THREE.CircleGeometry(0.16, 16), new THREE.MeshBasicMaterial({ color: 0xffd98a, transparent: true, opacity: 0.25, depthWrite: false })); lampSocket.rotation.x = -Math.PI / 2; lampSocket.position.y = 0.455; g.add(lampSocket);
  dagobaLamp.position.y = 0.45; dagobaLamp.visible = false; g.add(dagobaLamp);
  // finish beacon: a column of warm light and a pulsing ring, shown once she has the lamp and the oil
  const beacon = new THREE.Group(); beacon.visible = false; g.add(beacon);
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 3.2, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  col.position.y = 2.05; beacon.add(col);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.62, 32), new THREE.MeshBasicMaterial({ color: 0xffc04a, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.47; beacon.add(ring); beacon.userData.ring = ring; beacon.userData.col = col;
  const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.6, 10), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 0.8; g.add(hit); // bigger tap target
  g.userData.beacon = beacon;
  g.position.copy(polar(1.88, CENTER.slot * STEP + 0.36, CENTER.y)); scene.add(g); tag(g, { item: 'dagoba' }); items.dagoba = g;
}
const dagobaLight = new THREE.PointLight(0xffb45a, 0, 9, 1.6); dagobaLight.position.copy(polar(1.9, CENTER.slot * STEP + 0.36, CENTER.y + 1)); scene.add(dagobaLight);

// trees: araliya (frangipani), Na tree (monkey's tree), a young bo tree with golden railing, a coconut palm
{ const t = tree({ seed: 1, kind: 'araliya' }); t.position.copy(polar(9.05, deg(100), 0)); world.add(t); }
{ const t = tree({ seed: 2.3, kind: 'araliya' }); t.position.copy(polar(9.1, deg(178), 0)); t.scale.setScalar(0.85); world.add(t); }
const monkeyTree = tree({ seed: 3, kind: 'na' }); monkeyTree.position.copy(polar(9.05, deg(292), 0)); world.add(monkeyTree);
{ const t = tree({ seed: 4, kind: 'bo' }); t.position.copy(polar(9.0, deg(28), 0)); t.scale.setScalar(0.9); world.add(t); }
{ const t = coconut(5); t.position.copy(polar(9.25, deg(132), 0)); t.scale.setScalar(0.7); world.add(t); }

// carved discs (one hides a secret)
const discs = {};
for (const d of [67.5, 157.5, 247.5, 337.5]) { const m = moonstone(0.55, false); m.position.copy(polar(9.0, deg(d), 0.04)); world.add(m); discs[d] = m; }
const secretDisc = discs[67.5]; tag(secretDisc, { hidden: 'disc' });
const leaf = new THREE.Group();
{ leaf.add(mesh(new THREE.BoxGeometry(0.55, 0.03, 0.14), mat(0xd9be8a))); leaf.add(mesh(new THREE.BoxGeometry(0.02, 0.035, 0.14), mat(0x8a6a44))); }
leaf.position.copy(polar(9.0, deg(67.5), 0.03)); leaf.rotation.y = 0.6; leaf.visible = false; world.add(leaf); tag(leaf, { hidden: 'leaf' });

// stepped granite pond (pokuna), like Kuttam Pokuna, with blue water lilies (nil manel)
{
  const g = new THREE.Group(); const th = deg(202.5);
  const sizes = [[1.5, 0.12, PAL.graniteLight], [1.22, 0.0, PAL.granite], [0.96, -0.12, PAL.graniteDark]];
  for (const [s, y, c] of sizes) for (let k = 0; k < 4; k++) { const w = 0.14, bar = mesh(new THREE.BoxGeometry(s, 0.14, w), mat(c)); bar.position.y = y; const o = s / 2 - w / 2; if (k < 2) bar.position.z = k ? o : -o; else { bar.rotation.y = Math.PI / 2; bar.position.x = k === 2 ? o : -o; } g.add(bar); } // hollow rims, stepping down
  const water = mesh(new THREE.BoxGeometry(1.0, 0.02, 1.0), new THREE.MeshStandardMaterial({ color: PAL.water, roughness: 0.2 })); water.position.y = -0.02; g.add(water);
  for (let i = 0; i < 3; i++) { const lp = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.01, 10, 1, false, 0.3, 5.6), mat(PAL.leaf)); lp.position.set(-0.22 + i * 0.2, 0.0, 0.22 - i * 0.12); g.add(lp);
    const fl = mesh(new THREE.ConeGeometry(0.05, 0.08, 6), mat(PAL.lily)); fl.position.set(-0.22 + i * 0.2, 0.05, 0.22 - i * 0.12); if (i !== 1) g.add(fl); }
  g.position.copy(polar(8.95, th, 0.05)); g.rotation.y = th; world.add(g);
}
const lotuses = [];
function addLotus(idx, parent, pos, s = 1) { const l = lotusFlower(0.75 * s); l.position.copy(pos); parent.add(l); tag(l, { hidden: 'l' + idx }); lotuses[idx] = l; l.userData.base = pos.clone(); }
addLotus(0, world, polar(8.95, deg(202.5), 0.06), 1.6);
addLotus(1, scene, polar(1.85, deg(272), CENTER.y + 0.02));
addLotus(2, ringGroups.B, polar(4.0, lotusPillarAngle, RINGS.B.y + 0.14 + 2.5 + 0.3), 1.5);
for (const i of [0, 2]) { const halo = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.62, 24), new THREE.MeshBasicMaterial({ color: 0xffc6dc, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide }));
  halo.rotation.x = -Math.PI / 2; halo.position.y = 0.02; lotuses[i].add(halo); lotuses[i].userData.halo = halo; tag(halo, { hidden: 'l' + i }); } // soft pink glow on the harder-to-spot lotuses

// clay oil lamps along the kerb (lit when the chapter ends) and flag poles with Buddhist flags
const kerbLamps = [];
for (let k = 0; k < 24; k++) { const th = (k + 0.5) / 24 * Math.PI * 2; const l = clayLamp(); l.scale.setScalar(0.7); l.position.copy(polar(9.55, th, 0.22)); l.rotation.y = th; world.add(l); kerbLamps.push(l); }
{
  const poleAt = (d) => { const th = deg(d); const p = mesh(new THREE.CylinderGeometry(0.03, 0.04, 2.2, 6), mat(0xc8b48c)); p.position.copy(polar(9.55, th, 1.1)); world.add(p); return polar(9.55, th, 2.15); };
  const poles = [10, 50, 85, 118, 300, 335].map(poleAt);
  flagString(poles[0], poles[1], 0.4); flagString(poles[1], poles[2], 0.4); flagString(poles[2], poles[3], 0.4);
  flagString(poles[4], poles[5], 0.4); flagString(poles[5], poles[0], 0.45);
}

// rotation wheels on terrace walls (dharma-chakra handles)
const handles = { A: [], B: [] };
function wheel() {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0xb59a6e, roughness: 0.6, metalness: 0.15, emissive: 0x000000, flatShading: true });
  g.add(new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 6, 16), m));
  for (let i = 0; i < 4; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.04), m); sp.rotation.z = i * Math.PI / 4; g.add(sp); }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 8), m); hub.rotation.x = Math.PI / 2; g.add(hub);
  g.userData.mat = m; return g;
}
for (const [R, angles, r, y] of [['A', [67.5, 202.5], RINGS.A.outer + 0.2, 0.72], ['B', [157.5, 337.5], RINGS.B.outer + 0.16, 1.85]]) {
  for (const d of angles) { const w = wheel(); const th = deg(d); w.position.copy(polar(r, th, y)); w.rotation.y = th; ringGroups[R].add(w); tag(w, { handle: R }); handles[R].push(w); }
}

/* ================= AREA 1: THE TEMPLE GROUNDS (Dalada Maluwa) ================= */
const GC = new THREE.Vector3(...GROUNDS_C);
const gpos = (r, d, y = 0) => GC.clone().add(polar(r, deg(d), y));
const grounds = new THREE.Group(); scene.add(grounds);
const P = (id) => new THREE.Vector3(...GN[id]);
function surf(o) { grounds.add(o); tag(o, { surface: 'P' }); return o; }
{
  // floating island
  const top = -0.42;
  const g = new THREE.CylinderGeometry(9.95, 2.2, 7.5, 18, 5); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); if (y > 3.7) continue; const k = 1 + (hash(Math.round(x * 10) + 7, Math.round(y * 10), Math.round(z * 10)) - 0.5) * 0.28; p.setXYZ(i, x * k, y + (hash(z, x + 3, y) - 0.5) * 0.7, z * k); }
  g.computeVertexNormals();
  const rock = mesh(g, mat(PAL.rock)); rock.position.copy(GC).add(new THREE.Vector3(0, top - 3.75, 0)); grounds.add(rock);
  const tip = mesh(new THREE.ConeGeometry(2.3, 3.4, 9), mat(PAL.rockDark)); tip.rotation.x = Math.PI; tip.position.copy(GC).add(new THREE.Vector3(0, top - 9.1, 0)); grounds.add(tip);
  // grass top with a square opening for the sunken pond
  const shp = new THREE.Shape(); shp.absarc(0, 0, 9.7, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); const pc = polar(5.3, deg(135)); const ax = polar(1, deg(135)), tx = polar(1, deg(45));
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b], i) => { const v = pc.clone().addScaledVector(ax, a * 2.5).addScaledVector(tx, b * 2.5); i ? hole.lineTo(v.x, -v.z) : hole.moveTo(v.x, -v.z); }); hole.closePath(); shp.holes.push(hole);
  const gg = new THREE.ExtrudeGeometry(shp, { depth: 0.42, bevelEnabled: false, curveSegments: 72 }); gg.rotateX(-Math.PI / 2); gg.translate(0, -0.42, 0);
  const grass = mesh(gg, mat(PAL.grass, { flatShading: false })); grass.position.copy(GC); surf(grass);
  const kerb = sector(9.32, 9.78, 0, Math.PI * 2, -0.42, 0.22, PAL.graniteLight); kerb.position.copy(GC); surf(kerb);
  for (let k = 0; k < 20; k++) { const th = (k + 0.5) / 20 * Math.PI * 2; if (Math.abs(th - deg(225)) < 0.2) continue; const l = clayLamp(); l.scale.setScalar(0.7); l.position.copy(GC).add(polar(9.55, th, 0.22)); l.rotation.y = th; grounds.add(l); kerbLamps.push(l); }
  // brick-edged sand paths
  const strip = (a, b, w, y = 0.02) => {
    const d = b.clone().sub(a); const len = Math.hypot(d.x, d.z); const mid = a.clone().add(b).multiplyScalar(0.5);
    const s = mesh(new THREE.BoxGeometry(w, 0.05, len + w * 0.2), mat(PAL.sand)); s.position.set(mid.x, y, mid.z); s.rotation.y = Math.atan2(d.x, d.z); surf(s);
    for (const side of [-1, 1]) { const e = mesh(new THREE.BoxGeometry(0.16, 0.12, len), brickMat); e.position.copy(s.position).add(new THREE.Vector3(Math.cos(s.rotation.y) * side * (w / 2 + 0.08), 0.04, -Math.sin(s.rotation.y) * side * (w / 2 + 0.08))); e.rotation.y = s.rotation.y; surf(e); }
  };
  strip(gpos(8.6, 45), gpos(8.6, 225), 1.5);
  strip(gpos(2.6, 315), gpos(2.6, 135), 1.3, 0.025);
  const plaza = mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.06, 32), mat(PAL.sand)); plaza.position.copy(GC).setY(0.03); surf(plaza);
  const toCorner = new THREE.Vector3(...GN.P_pondEdge).add(polar(2.9, deg(45))); strip(new THREE.Vector3(...GN.P_pondEdge), toCorner, 0.9, 0.015); strip(toCorner, P('P_sluice'), 0.9, 0.015);
  // a stone lamp pillar at the crossroads
  const lp = new THREE.Group(); const sh = mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.2, 8), mat(PAL.graniteLight)); sh.position.y = 0.6; lp.add(sh);
  const bowl = mesh(new THREE.CylinderGeometry(0.28, 0.16, 0.16, 10), mat(PAL.granite)); bowl.position.y = 1.25; lp.add(bowl); lp.position.copy(gpos(1.7, 90)); grounds.add(lp);
}
// --- trees, shrubs and a few ruined brick stubs
{
  const put = (o, r, d, sc = 1) => { o.position.copy(gpos(r, d)); o.scale.setScalar(sc); grounds.add(o); };
  put(tree({ seed: 11, kind: 'araliya' }), 7.7, 165, 1.0); put(tree({ seed: 12, kind: 'na' }), 7.4, 292, 1.0);
  put(coconut(13), 8.7, 18, 0.8); put(tree({ seed: 14, kind: 'araliya' }), 8.2, 345, 0.85); put(coconut(15), 8.8, 255, 0.7);
  for (let i = 0; i < 14; i++) { const d = 20 + i * 25.7 + hash(i, 1, 2) * 10; if (Math.abs(((d - 225 + 540) % 360) - 180) < 12 || Math.abs(((d - 45 + 540) % 360) - 180) < 10) continue;
    const b = mesh(new THREE.IcosahedronGeometry(0.28 + hash(i, 3, 4) * 0.2, 0), mat(i % 2 ? 0x7d9a5c : 0x8eaa66)); b.position.copy(gpos(8.85 + hash(i, 5, 6) * 0.3, d, 0.15)); b.scale.y = 0.7; grounds.add(b); }
  for (const [r, d] of [[6.2, 20], [6.6, 70], [5.4, 250], [7.2, 205], [6.0, 100]]) { const stub = mesh(new THREE.BoxGeometry(0.5, 0.35 + hash(r, d, 1) * 0.5, 0.5), brickMat); stub.position.copy(gpos(r, d, 0.2)); stub.rotation.y = hash(d, r, 2) * 2; grounds.add(stub); }
}
// --- the bo tree on its white terrace, golden railing, tall Buddhist flag banners
const boC = gpos(5.65, 315);
let boTree, boCrowns = [], boStairGroup, islePlate;
{
  const t = new THREE.Group(); t.position.copy(boC); grounds.add(t);
  const wall = mesh(new THREE.BoxGeometry(4.2, 0.62, 4.2), mat(PAL.plaster)); wall.position.y = 0.31; t.add(wall);
  const cap = mesh(new THREE.BoxGeometry(4.4, 0.1, 4.4), mat(PAL.graniteLight)); cap.position.y = 0.66; t.add(cap);
  const top = mesh(new THREE.BoxGeometry(4.15, 0.04, 4.15), mat(PAL.sand)); top.position.y = 0.7; t.add(top);
  t.rotation.y = deg(315); tag(t, { surface: 'P' });
  boTree = tree({ seed: 9, kind: 'bo' }); boTree.scale.setScalar(1.75); boTree.position.copy(boC).setY(0.71); boTree.rotation.y = deg(315); grounds.add(boTree);
  boTree.traverse((o) => { if (o.isMesh && o.geometry.type === 'IcosahedronGeometry') boCrowns.push(o); });
  tag(boTree, { item: 'bo' });
  // stairs from the plaza side
  const dir = P('P_boFoot').sub(P('P_bo')).setY(0).normalize();
  const st = makeStair({ rTop: 0, yTop: 0.7, rBot: 1.0, yBot: 0, width: 1.2, color: PAL.graniteLight, side: PAL.plaster, guard: true });
  st.position.copy(gpos(3.5, 315)); st.rotation.y = Math.atan2(dir.x, dir.z); surf(st);
  const ms = moonstone(0.6); ms.position.set(0, 0.06, 1.1); st.add(ms);
  st.scale.set(1, 1, 0.03); boStairGroup = st;
  // vertical Buddhist flag banners at the corners (as at hill temples)
  const banTex = canvasTex(32, 128, (x) => { const cols = ['#2f5fb3', '#f2c12e', '#c8423b', '#f6f2ea', '#e8862f']; cols.forEach((c, i) => { x.fillStyle = c; x.fillRect(i * 6.4, 0, 6.4, 128); }); });
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const off = new THREE.Vector3(dx * 2.3, 0, dz * 2.3).applyAxisAngle(new THREE.Vector3(0, 1, 0), deg(315));
    const pole = mesh(new THREE.CylinderGeometry(0.035, 0.045, 3.2, 6), mat(0xd8c49a)); pole.position.copy(boC).add(off).setY(1.6); grounds.add(pole);
    const ban = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1.25), new THREE.MeshStandardMaterial({ map: banTex, side: THREE.DoubleSide, roughness: 0.9 }));
    ban.position.copy(pole.position).add(new THREE.Vector3(0.17, 0.75, 0)); ban.userData.ph = dx * 2 + dz; grounds.add(ban); flagStrings.push(ban);
  }
}
// --- the stepped pond (pokuna), its water level, lily pads, islet with the water pot
const pondC = new THREE.Vector3(...POND_C);
const pond = { level: -0.36, target: -0.36 };
let pondWater, padMesh, potItem;
{
  const g = new THREE.Group(); g.position.copy(pondC); g.rotation.y = deg(135); grounds.add(g);
  const frame = (size, y, w, col) => { for (const [x, z, sx, sz] of [[0, size / 2 - w / 2, size, w], [0, -size / 2 + w / 2, size, w], [size / 2 - w / 2, 0, w, size], [-size / 2 + w / 2, 0, w, size]]) { const m = mesh(new THREE.BoxGeometry(sx, 0.3, sz), mat(col)); m.position.set(x, y - 0.15, z); g.add(m); tag(m, { surface: 'P' }); } };
  frame(5.0, 0.04, 0.4, PAL.graniteLight); frame(4.2, -0.12, 0.3, PAL.granite); frame(3.6, -0.24, 0.3, PAL.graniteDark); frame(3.0, -0.34, 0.3, PAL.granite);
  const floor = mesh(new THREE.BoxGeometry(4.3, 0.06, 4.3), mat(0x9c8f7c)); floor.position.y = -0.4; g.add(floor);
  pondWater = mesh(new THREE.BoxGeometry(4.15, 0.04, 4.15), new THREE.MeshStandardMaterial({ color: PAL.water, roughness: 0.15, transparent: true, opacity: 0.85 })); pondWater.position.y = pond.level; g.add(pondWater);
  // islet in the middle
  const islet = mesh(new THREE.BoxGeometry(1.25, 0.55, 1.25), mat(PAL.graniteLight)); islet.position.y = -0.15; g.add(islet); tag(islet, { surface: 'P' });
  // decorative lily pads and nil manel
  for (let i = 0; i < 6; i++) { const lp = mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 10, 1, false, 0.3, 5.6), mat(PAL.leaf)); const a = i * 1.1 + 0.4; lp.position.set(Math.cos(a) * 1.5, 0, Math.sin(a) * 1.5); lp.userData.dy = 0.03; g.add(lp); lp.userData.float = true; if (i % 2) { const fl = mesh(new THREE.ConeGeometry(0.06, 0.1, 6), mat(PAL.lily)); fl.position.y = 0.06; lp.add(fl); } }
  // the big stepping-stone lily pad (only reachable when the pond is full)
  padMesh = mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.06, 18, 1, false, 0.25, Math.PI * 2 - 0.5), mat(0x7fa86a)); padMesh.position.copy(P('P_pad')).sub(pondC).applyAxisAngle(new THREE.Vector3(0, 1, 0), -deg(135)); padMesh.position.y = pond.level + 0.03; g.add(padMesh); tag(padMesh, { surface: 'P' });
  // kalagedi (clay water pot) on the islet
  potItem = new THREE.Group();
  const prof = [[0, 0], [0.14, 0.02], [0.24, 0.14], [0.25, 0.26], [0.17, 0.38], [0.08, 0.44], [0.08, 0.52], [0.12, 0.55], [0, 0.55]].map(([x, y]) => new THREE.Vector2(x, y));
  potItem.add(mesh(new THREE.LatheGeometry(prof, 14), mat(0xb4603f)));
  const band = mesh(new THREE.TorusGeometry(0.245, 0.015, 4, 18), mat(0xe8cf9a)); band.rotation.x = Math.PI / 2; band.position.y = 0.24; potItem.add(band);
  potItem.position.copy(P('P_islet')).add(new THREE.Vector3(0, 0.01, 0)).add(polar(0.42, deg(135 + 90))); grounds.add(potItem); tag(potItem, { item: 'pot' });
  islePlate = moonstone(0.36, false); islePlate.position.copy(P('P_islet')).add(new THREE.Vector3(0, 0.02, 0)); grounds.add(islePlate);
  const glow = new THREE.Mesh(new THREE.RingGeometry(0.36, 0.42, 28), new THREE.MeshBasicMaterial({ color: 0xffe2a0, transparent: true, opacity: 0.6, depthWrite: false })); glow.rotation.x = -Math.PI / 2; glow.position.y = 0.04; islePlate.add(glow); islePlate.userData.glow = glow;
}
// --- the sluice (bisokotuwa) wheel
let sluiceWheel;
{
  const h = new THREE.Group(); h.position.copy(pondC).add(polar(2.75, deg(45))); h.rotation.y = deg(45); grounds.add(h);
  const box = mesh(new THREE.BoxGeometry(1.1, 0.85, 0.7), mat(PAL.granite)); box.position.y = 0.42; h.add(box);
  const roof = mesh(new THREE.BoxGeometry(1.25, 0.12, 0.85), mat(PAL.graniteLight)); roof.position.y = 0.9; h.add(roof);
  const spout = mesh(new THREE.BoxGeometry(0.4, 0.25, 0.5), mat(PAL.graniteDark)); spout.position.set(0, 0.2, -0.55); h.add(spout);
  sluiceWheel = wheel(); sluiceWheel.scale.setScalar(1.35); sluiceWheel.position.set(0, 0.62, 0.42); h.add(sluiceWheel);
  tag(h, { item: 'sluice' });
}
// --- empty flag line by the threshold, and the moonstone threshold itself
let flagPoleA, flagPoleB;
{
  const t = polar(1.35, deg(135)); const base = P('P_flag');
  for (const [s, ref] of [[1, 'A'], [-1, 'B']]) { const pole = mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.6, 6), mat(0xc8b48c)); pole.position.copy(base).addScaledVector(t, s).setY(1.3); grounds.add(pole); tag(pole, { item: 'flagline' }); if (ref === 'A') flagPoleA = pole; else flagPoleB = pole; }
  const line = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(flagPoleA.position.clone().setY(2.5), base.clone().setY(2.1), flagPoleB.position.clone().setY(2.5)), 12, 0.012, 3), mat(0x8a7a6a)); grounds.add(line); tag(line, { item: 'flagline' });
  const lineHit = new THREE.Mesh(new THREE.TubeGeometry(line.geometry.parameters.path, 12, 0.3, 6), new THREE.MeshBasicMaterial({ visible: false })); grounds.add(lineHit); tag(lineHit, { item: 'flagline' });
  const gate = new THREE.Group(); gate.position.copy(gpos(8.8, 225)); gate.rotation.y = deg(225); grounds.add(gate);
  const slab = mesh(new THREE.BoxGeometry(1.9, 0.26, 1.2), mat(PAL.graniteLight)); slab.position.set(0, 0.1, 0.55); gate.add(slab);
  const ms = moonstone(0.75); ms.rotation.y = Math.PI; ms.position.set(0, 0.04, -0.15); gate.add(ms);
  for (const s of [-1, 1]) { const gs = new THREE.Group(); const sl = mesh(new THREE.BoxGeometry(0.16, 0.95, 0.55), mat(PAL.graniteLight)); sl.position.y = 0.47; gs.add(sl); const ar = mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.16, 12, 1, false, 0, Math.PI), mat(PAL.graniteLight)); ar.rotation.z = Math.PI / 2; ar.rotation.y = Math.PI / 2; ar.position.y = 0.95; gs.add(ar); gs.position.set(s * 1.05, 0, 0.45); gate.add(gs); }
  tag(gate, { surface: 'P' });
}
// --- the causeway: stone slabs that rise from the clouds when the grounds are complete
const causeway = [];
{
  const a = gpos(9.75, 225), b = polar(9.85, deg(45)); const n = 8; const dir = b.clone().sub(a); const len = dir.length(); const yaw = Math.atan2(dir.x, dir.z);
  for (let i = 0; i < n; i++) {
    const s = new THREE.Group(); const slab = mesh(new THREE.BoxGeometry(1.7, 0.32, len / n * 0.96), mat(i % 2 ? PAL.graniteLight : PAL.granite)); slab.position.y = -0.16; s.add(slab);
    const under = mesh(new THREE.ConeGeometry(0.5, 1.4, 6), mat(PAL.rock)); under.rotation.x = Math.PI; under.position.y = -1.0; s.add(under);
    s.position.copy(a).addScaledVector(dir, (i + 0.5) / n); s.rotation.y = yaw; s.userData.home = s.position.y; s.position.y = -14; s.visible = false; grounds.add(s); tag(s, { surface: 'P' }); causeway.push(s);
  }
}
function onPlate(ev) {
  if (ev.k === 'boStair') {
    E.progress(); fx().thunk(); fx().pluck(ev.on ? 2 : 0, { vol: 0.06 });
    const y0 = islePlate.position.y, y1 = P('P_islet').y + 0.02 - (ev.on ? 0.05 : 0); anims.push({ t: 0, dur: 0.35, f: (e) => (islePlate.position.y = y0 + (y1 - y0) * e) });
    islePlate.userData.glow.material.color.setHex(ev.on ? 0xfff2c8 : 0xffe2a0);
    const z0 = boStairGroup.scale.z, z1 = ev.on ? 1 : 0.03;
    setTimeout(() => { grind(1.3); anims.push({ t: 0, dur: 1.3, f: (e) => boStairGroup.scale.set(1, 1, z0 + (z1 - z0) * e) }); sparkle(boStairGroup, ev.on ? 3 : 1); }, 450);
    label(ev.on ? 'The moonstone sinks under your feet. Across the grounds, a stair slides out of the bo tree terrace.' : 'The moonstone rises again. Across the grounds, the stair folds back into the bo tree terrace.', 5000);
    E.refresh();
  }
}
function raiseCauseway() {
  causeway.forEach((s, i) => setTimeout(() => { s.visible = true; const y0 = -9; anims.push({ t: 0, dur: 1.1, f: (e) => (s.position.y = y0 + (s.userData.home - y0) * e) }); fx().whoosh(0.6); fx().pluck(i, { vol: 0.05, far: 0.35, delay: 0.9 }); }, 300 + i * 260));
}
// --- five scattered flag pennants (hidden objects); two are caught in the bo tree until she climbs up to it
const LATE_FLAGS = [0, 3];
const flagBits = [];
{
  const spots = [gpos(1.75, 0, 0.03), P('P_islet').add(polar(0.35, deg(45), 0.02)), gpos(9.15, 232, 0.25), gpos(6.3, 180, 0.03), pondC.clone().add(polar(2.75, deg(45), 0.98))];
  spots.forEach((p, i) => {
    const g = new THREE.Group(); const stick = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.45, 4), mat(0x8a7a6a)); stick.position.y = 0.22; g.add(stick);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.22), new THREE.MeshStandardMaterial({ color: PAL.flags[i], side: THREE.DoubleSide })); fl.position.set(0.16, 0.34, 0); g.add(fl);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); hit.position.set(0.1, 0.3, 0); g.add(hit); // bigger tap target
    g.position.copy(p); if (LATE_FLAGS.includes(i)) { g.scale.setScalar(1.6); g.visible = false; } g.rotation.z = (hash(i, 2, 3) - 0.5) * 0.6; g.userData.base = p.clone(); grounds.add(g); tag(g, { hidden: 'f' + i  }); flagBits.push(g);
  });
}
function dropFlags() {
  E.progress(); fx().flutter(10); fx().found(2);
  label('A breeze stirs the bo tree. Two flags caught in its branches come loose and drift down across the grounds.', 5200);
  LATE_FLAGS.forEach((i, n) => {
    const f = flagBits[i], to = f.userData.base.clone(), from = boC.clone().setY(3.4).add(polar(0.6, deg(90 + n * 180), 0));
    f.position.copy(from); f.visible = true;
    const mid = from.clone().lerp(to, 0.5).setY(4.6);
    anims.push({ t: -0.5 * n, dur: 2.6, f: (e) => { e = Math.max(0, e); const a = from.clone().lerp(mid, e), b = mid.clone().lerp(to, e); f.position.copy(a.lerp(b, e)); f.position.x += Math.sin(e * 12) * 0.25 * (1 - e); f.rotation.z = Math.sin(e * 14) * 0.6 * (1 - e); },
      done: () => { f.position.copy(to); sparkle(f, 2); } });
  });
  E.refresh();
}
function collectFlag(i) {
  const f = flagBits[i]; if (!f || f.userData.taken) return;
  f.userData.taken = true; S.flags++; E.progress(); fx().found(S.flags - 1);
  const from = f.getWorldPosition(new THREE.Vector3()); f.parent.remove(f); scene.add(f); f.position.copy(from);
  anims.push({ t: 0, dur: 0.9, f: (e) => { const to = girl.userData.orbit.getWorldPosition(new THREE.Vector3()); f.position.lerpVectors(from, to, e); f.position.y += Math.sin(e * Math.PI) * 1.2; f.scale.setScalar(1 - e * 0.5); }, done: () => { scene.remove(f); const mini = f.clone(); mini.scale.setScalar(0.55); mini.userData.isFlag = true; girl.userData.orbit.add(mini); E.refresh(); } });
  if (S.flags < 5) label(`A Buddhist flag (${S.flags}/5)`); else label('All five flags. Tie them back on the empty line by the gate.', 4200);
  E.refresh();
}
function hangFlags() {
  const orbit = girl.userData.orbit; [...orbit.children].filter((c) => c.userData.isFlag).forEach((c) => orbit.remove(c));
  flagString(flagPoleA.position.clone().setY(2.5), flagPoleB.position.clone().setY(2.5), 0.4, 11);
  sparkle(flagPoleA, 2); sparkle(flagPoleB, 2); fx().flutter(12); [5, 7, 9].forEach((n, i) => fx().pluck(n, { vol: 0.06, delay: 0.2 + i * 0.15 }));
}
function waterBo() {
  heldPot.visible = false;
  const fresh = [new THREE.Color(0x8fc76f), new THREE.Color(0xa6d47f)];
  boCrowns.forEach((c, i) => { const m = c.material.clone(); c.material = m; const c0 = m.color.clone(); anims.push({ t: 0, dur: 2.5, f: (e) => m.color.copy(c0).lerp(fresh[i % 2], e) }); });
  sparkle(boTree, 4); fx().pour(2.2); [4, 6, 8, 9].forEach((n, i) => fx().pluck(n, { vol: 0.05, delay: 1.4 + i * 0.22, far: 0.3 })); fx().bell(E.audio.note(0), { vol: 0.06, far: 0.6, dur: 4.5, delay: 2.4 });
}
const heldPot = new THREE.Group();
{ const prof = [[0, 0], [0.14, 0.02], [0.24, 0.14], [0.25, 0.26], [0.17, 0.38], [0.08, 0.44], [0.08, 0.52], [0.12, 0.55], [0, 0.55]].map(([x, y]) => new THREE.Vector2(x, y)); heldPot.add(mesh(new THREE.LatheGeometry(prof, 14), mat(0xb4603f))); }


/* ================= SKY: clouds, Anuradhapura & Polonnaruwa on distant islands, birds ================= */
const cloudTex = canvasTex(128, 128, (x) => { for (let i = 0; i < 9; i++) { const gx = 30 + hash(i, 1, 2) * 68, gy = 50 + hash(i, 3, 4) * 28, r = 22 + hash(i, 5, 6) * 18; const g = x.createRadialGradient(gx, gy, 0, gx, gy, r); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); } });
const clouds = [];
for (let i = 0; i < 26; i++) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0.5 + hash(i, 1, 1) * 0.35, depthWrite: false, fog: false }));
  const th = hash(i, 2, 2) * Math.PI * 2, r = 11 + hash(i, 3, 3) * 14, y = -10 + hash(i, 4, 4) * 6;
  const s = 6 + hash(i, 5, 5) * 9; sp.scale.set(s * 1.6, s * 0.8, 1); sp.userData = { th, r, y, sp: 0.004 + hash(i, 6, 6) * 0.006 }; scene.add(sp); clouds.push(sp);
}
function islandBase(r, h, grassCol = PAL.grass) {
  const g = new THREE.Group();
  const rock = mesh(new THREE.ConeGeometry(r, h, 8), mat(PAL.rock)); rock.rotation.x = Math.PI; rock.position.y = -h / 2 - 0.12; g.add(rock);
  g.add(mesh(new THREE.CylinderGeometry(r * 1.02, r, 0.24, 12), mat(grassCol)));
  return g;
}
function stupaIsland({ dome, base, color, ruin = false, elephants = false }) {
  const g = islandBase(base + 1.1, 3.2);
  const yard = mesh(new THREE.CylinderGeometry(base + 0.7, base + 0.7, 0.1, 24), mat(PAL.sand)); yard.position.y = 0.16; g.add(yard);
  const sq = mesh(new THREE.BoxGeometry(base * 2.3, 0.5, base * 2.3), elephants ? mat(PAL.plaster) : brickMat); sq.position.y = 0.45; g.add(sq);
  if (elephants) for (let s = 0; s < 4; s++) for (let k = -3; k <= 3; k++) { const e = mesh(new THREE.SphereGeometry(0.16, 6, 5), mat(PAL.plaster)); e.position.copy(polar(base * 1.16, s * Math.PI / 2, 0.42)).add(polar(k * 0.32, s * Math.PI / 2 + Math.PI / 2, 0)); g.add(e); }
  const m = ruin ? mat(color) : mat(color, { flatShading: false });
  [[base, 0.18], [base * 0.94, 0.18], [base * 0.88, 0.18]].reduce((y, [r, h]) => { const c = mesh(new THREE.CylinderGeometry(r, r, h, 32), m); c.position.y = y + h / 2; g.add(c); return y + h; }, 0.7);
  const prof = [[dome, 0], [dome * 0.99, dome * 0.25], [dome * 0.92, dome * 0.6], [dome * 0.75, dome * 0.95], [dome * 0.45, dome * 1.2], [0, dome * 1.3]].map(([x, y]) => new THREE.Vector2(x, y));
  const d = mesh(new THREE.LatheGeometry(prof, 32), m); d.position.y = 1.24; g.add(d);
  const top = 1.24 + dome * 1.3;
  const hm = mesh(new THREE.BoxGeometry(dome * 0.35, dome * 0.25, dome * 0.35), m); hm.position.y = top + dome * 0.1; g.add(hm);
  if (ruin) { for (let i = 0; i < 6; i++) { const b = mesh(new THREE.IcosahedronGeometry(0.25 + hash(i, 2, 1) * 0.2, 0), mat(0x7f9a5e)); b.position.copy(polar(dome * 0.5 * hash(i, 1, 1), i, top - 0.1)); g.add(b); } }
  else { const sp = mesh(new THREE.ConeGeometry(dome * 0.13, dome * 0.9, 12), m); sp.position.y = top + dome * 0.68; g.add(sp); const f = mesh(new THREE.SphereGeometry(dome * 0.05, 8, 6), mat(PAL.gold, { metalness: 0.4, roughness: 0.4 })); f.position.y = top + dome * 1.15; g.add(f); }
  return g;
}
function lankatilakaIsland() {
  const g = islandBase(2.2, 3.4);
  for (const s of [-1, 1]) { const w = mesh(new THREE.BoxGeometry(0.4, 3.0, 2.0), brickMat); w.position.set(s * 0.75, 1.6, 0); g.add(w); }
  const back = mesh(new THREE.BoxGeometry(1.9, 3.0, 0.4), brickMat); back.position.set(0, 1.6, -0.8); g.add(back);
  const lintel = mesh(new THREE.BoxGeometry(1.9, 0.5, 0.4), brickMat); lintel.position.set(0, 2.85, 0.8); g.add(lintel);
  for (let i = 0; i < 4; i++) { const t = mesh(new THREE.IcosahedronGeometry(0.4, 0), mat(0x7f9f62)); t.position.copy(polar(1.7, i * 1.6, 0.4)); g.add(t); }
  return g;
}
function boIsland() {
  const g = islandBase(2.2, 3.0);
  const terrace = mesh(new THREE.BoxGeometry(2.6, 0.5, 2.6), mat(PAL.plaster)); terrace.position.y = 0.37; g.add(terrace);
  const t = tree({ seed: 7, kind: 'bo' }); t.scale.setScalar(1.7); t.position.y = 0.6; g.add(t);
  return g;
}
function tankIsland() { // a wewa (ancient reservoir) with a kumbuk-lined bund
  const g = islandBase(2.8, 2.6, 0x9aa56a);
  const water = mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.06, 24), new THREE.MeshStandardMaterial({ color: PAL.water, roughness: 0.15 })); water.position.y = 0.15; g.add(water);
  for (let i = 0; i < 8; i++) { const lp = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 8), mat(PAL.leaf)); lp.position.copy(polar(0.6 + hash(i, 1, 2) * 1.2, i * 0.8, 0.19)); g.add(lp); }
  for (let i = 0; i < 5; i++) { const t = tree({ seed: 10 + i, kind: 'araliya' }); t.scale.setScalar(0.6); t.position.copy(polar(2.5, deg(200 + i * 30), 0.1)); g.add(t); }
  return g;
}
// The backdrop turns with the camera, so the distant sites always sit behind the island, never in front of it.
const backdrop = new THREE.Group(); scene.add(backdrop);
const minis = [
  [stupaIsland({ dome: 1.9, base: 2.05, color: PAL.plaster, elephants: true }), 203, 19, 0.5, 0.8], // Ruwanwelisaya
  [stupaIsland({ dome: 1.6, base: 1.75, color: 0xa8664d, ruin: true }), 252, 20, -0.5, 0.75], // Jetavanaramaya (brick)
  [lankatilakaIsland(), 158, 18, -3, 0.7], // Lankatilaka image house
  [boIsland(), 300, 18, 1.5, 0.65], // Sri Maha Bodhi
  [tankIsland(), 338, 17, -5.5, 0.7], // Parakrama Samudra
];
minis.forEach(([m, d, r, y, s]) => { m.position.copy(polar(r, deg(d), y)); m.scale.setScalar(s); m.userData.y = y; backdrop.add(m); });
function bird(color, tail = false) {
  const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, flatShading: true });
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.42, 5), m); body.rotation.x = Math.PI / 2; g.add(body);
  const wings = [];
  for (const s of [-1, 1]) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.1, s * 0.55, 0, -0.05, 0, 0, -0.12], 3)); geo.computeVertexNormals(); const piv = new THREE.Group(); piv.add(new THREE.Mesh(geo, m)); g.add(piv); wings.push([piv, s]); }
  if (tail) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.9, 4), new THREE.MeshStandardMaterial({ color: 0x2f7d6a, flatShading: true })); t.rotation.x = -Math.PI / 2; t.position.z = -0.6; t.scale.set(1, 1, 0.3); g.add(t); }
  g.userData.wings = wings; return g;
}
const egrets = [];
for (let i = 0; i < 5; i++) { const b = bird(0xfdfbf7); b.userData.p = { r: 12 + i * 1.3, y: 5 + i * 0.6, sp: 0.18 + i * 0.03, ph: i * 1.3 }; scene.add(b); egrets.push(b); }
const peacocks = [];

hold(heldPot, 'handR', 0.8, [-0.06, -0.06, 0.0]);
/* ================= GAME STATE / VIEW SYNC ================= */
const rotAcc = { A: S.rot.A, B: S.rot.B };
ringGroups.A.rotation.y = rotAcc.A * STEP; ringGroups.B.rotation.y = rotAcc.B * STEP;
function nodePos(id) {
  if (id[0] === 'P') return new THREE.Vector3(...GN[id]);
  if (id === 'C') return polar(CENTER.r, CENTER.slot * STEP, CENTER.y);
  const R = id[0], i = +id.slice(1); const ang = R === 'G' ? 0 : ringGroups[R].rotation.y;
  return polar(RINGS[R].r, i * STEP + ang, RINGS[R].y);
}
const UPPER_EDGE = { A: RINGS.A.outer, B: RINGS.B.outer, C: 2.46 };
const STAIR_FOOT = { A: 7.45, B: 5.15, C: 3.02 };
function edgePoints(e, from, to) {
  if (e.kind === 'line') {
    const via = (e.via || []).map((v) => new THREE.Vector3(...v)); if (from !== e.a) via.reverse();
    const seq = [...via, nodePos(to)]; const out = []; let prev = nodePos(from);
    for (const q of seq) { const n = Math.max(2, Math.round(prev.distanceTo(q) / 0.5)); for (let k = 1; k <= n; k++) out.push(prev.clone().lerp(q, k / n)); prev = q; }
    return out;
  }
  if (e.kind === 'arc') {
    const R = from[0]; const i = +from.slice(1), j = +to.slice(1); const dir = ((j - i + SLOTS) % SLOTS) === 1 ? 1 : -1;
    const base = i * STEP + (R === 'G' ? 0 : ringGroups[R].rotation.y); const P = [];
    for (let k = 1; k <= 8; k++) P.push(polar(RINGS[R].r, base + dir * STEP * k / 8, RINGS[R].y)); return P;
  }
  const th = e.w * STEP; const up = e.upper, lo = e.lower;
  const yU = up === 'C' ? CENTER.y : RINGS[up].y, yL = RINGS[lo].y;
  const top = polar(UPPER_EDGE[up], th, yU), foot = polar(STAIR_FOOT[up], th, yL);
  const seq = ringOf(from) === up ? [top, foot, nodePos(to)] : [foot, top, nodePos(to)];
  const out = []; let prev = nodePos(from);
  for (const q of seq) { for (let k = 1; k <= 4; k++) out.push(prev.clone().lerp(q, k / 4)); prev = q; }
  return out;
}

const MSG = {
  sluiceOpened: 'You turn the wheel of the old sluice (bisokotuwa). Water from the tank rushes into the pond and the lily pads float up.',
  sluiceClosed: 'You turn the wheel back. The water drains away and the lily pad sinks to the bottom.',
  gotPot: 'A clay water pot (kalagedi), filled from the pond.',
  needPot: 'The sacred bo tree looks thirsty. Pilgrims offer it water (bodhi puja).',
  needStair: 'The bo tree stands on a high white terrace, but its stair is folded away inside the wall.',
  watered: 'You pour the water at the roots of the bo tree. Its leaves shimmer.',
  wateredGate: 'You pour the water at the roots of the bo tree. Far off, stone grinds against stone…',
  needFlags: 'An empty flag line. The wind has scattered the five Buddhist flags across the grounds.',
  hung: 'You tie the five colours back on the line: blue, yellow, red, white and orange.',
  hungGate: 'You tie the five colours back on the line. Far off, stone grinds against stone…',
  gotLamp: 'You pick up the clay lamp (pahana). It is empty and dry.',
  gotBanana: 'A bunch of ripe bananas. Someone left them as an offering… or as bait.',
  needLotus: 'The flower altar (mal asanaya) is bare. Pilgrims offer three lotus flowers here.',
  offered: 'You lay the lotuses on the altar. A deep rumble: the brick terrace awakens. Turn it with its golden wheel.',
  monkeyHungry: "A temple monkey sits on the guardstone stair and won't budge. Maybe it's hungry?",
  monkeyFed: 'The monkey snatches the bananas and bounds off to the Na tree. The stair is clear!',
  needLamp: "A pot of fragrant coconut oil. You'll need something to carry it in.",
  gotOil: 'You fill the pahana and light its wick. The pillar terrace stirs and a stairway unfolds.',
  needLampAltar: 'An empty lamp altar sits at the foot of the dagoba.',
  needOil: 'Your lamp is dry. Find oil first.',
  win: 'You place the burning lamp at the foot of the dagoba.',
};
const NAMES = { gotPot: '<em>Kalagedi</em> · a clay water pot', gotLamp: '<em>Pahana</em> · a clay lamp', gotBanana: '<em>Kesel</em> · ripe bananas', gotOil: '<em>Pol thel</em> · coconut oil', leaf: '<em>Puskola</em> · an ancient ola-leaf page' };
function pulseSockets() { sockets.forEach((s, i) => { if (s.lotus.visible) return; anims.push({ t: 0, dur: 1.6, lin: true, f: (e) => (s.glow.material.opacity = 0.35 + Math.sin(e * Math.PI * 3) * 0.4) }); }); }
function offerLotuses() {
  const orbit = girl.userData.orbit; const kids = [...orbit.children];
  kids.forEach((l, i) => {
    const from = l.getWorldPosition(new THREE.Vector3()); orbit.remove(l); scene.add(l); l.position.copy(from);
    const to = sockets[i].lotus.getWorldPosition(new THREE.Vector3());
    anims.push({ t: 0, dur: 0.9 + i * 0.15, f: (e) => { l.position.lerpVectors(from, to, e); l.position.y += Math.sin(e * Math.PI) * 0.8; }, done: () => { scene.remove(l); sockets[i].lotus.visible = true; sockets[i].glow.visible = false; fx().place(); fx().pluck(4 + i * 2, { vol: 0.06, far: 0.3 }); } });
  });
  setTimeout(() => { grind(1.4); fx().bell(E.audio.note(-3), { vol: 0.06, far: 0.6, dur: 4, delay: 0.8 }); E.shake(0.5); awaken('A'); }, 1400);
}
function awaken(R) {
  handles[R].forEach((h) => { sparkle(h, 3); anims.push({ t: 0, dur: 1.4, f: (e) => (h.rotation.z = e * Math.PI * 2) }); });
  // swing the view so a wheel is in sight
  const vis = handles[R].map((h) => Math.atan2(h.getWorldPosition(new THREE.Vector3()).x, h.getWorldPosition(new THREE.Vector3()).z));
  const best = vis.reduce((b, a) => (angDist(a, cam.azTo) < angDist(b, cam.azTo) ? a : b));
  cam.azTo = nearestAz(Math.round((best - Math.PI / 4) / (Math.PI / 2)) * (Math.PI / 2) + Math.PI / 4);
}
const angDist = (a, b) => { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return Math.abs(d); };

/* ---------- terrace rotation ---------- */
let rotating = null;
function turn(R, dir) {
  if (rotating || E.isWalking()) return false;
  if (!canRotate(S, R)) { handles[R].forEach(jiggle); rattle(); label(R === 'A' ? 'The brick terrace is locked in place. The flower altar is still empty.' : "The pillar terrace won't move. It seems to be waiting for light.", 3800); return false; }
  rotAcc[R] += dir; rotating = { R, from: ringGroups[R].rotation.y, to: rotAcc[R] * STEP, t: 0 };
  grind(0.75); E.stats.turns++; return true;
}
function updateRotation(dt) {
  if (!rotating) return;
  rotating.t = Math.min(1, rotating.t + dt / 0.8);
  const e = rotating.t < 0.5 ? 4 * rotating.t ** 3 : 1 - (-2 * rotating.t + 2) ** 3 / 2;
  ringGroups[rotating.R].rotation.y = rotating.from + (rotating.to - rotating.from) * e;
  handles[rotating.R].forEach((h) => (h.rotation.z += dt * 6 * Math.sign(rotating.to - rotating.from)));
  if (rotating.t >= 1) { S.rot[rotating.R] = ((rotAcc[rotating.R] % SLOTS) + SLOTS) % SLOTS; rotating = null; click(); }
}
function unfoldStairB() { stairB.visible = true; anims.push({ t: 0, dur: 1.2, f: (e) => stairB.scale.set(1, Math.max(0.02, e), 0.3 + 0.7 * e) }); grind(1.2); [2, 4, 6].forEach((n, i) => fx().pluck(n, { vol: 0.05, delay: 0.3 + i * 0.3 })); setTimeout(() => awaken('B'), 900); }

/* ---------- monkey ---------- */
function monkeyHop() { const y0 = 0.55; anims.push({ t: 0, dur: 0.5, lin: true, f: (e) => (monkey.position.y = y0 + Math.sin(e * Math.PI * 2) ** 2 * 0.25) }); }
function monkeyLeave() {
  const a = monkey.position.clone(); const b = polar(8.75, deg(292) - 0.04, 1.75);
  monkey.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
  anims.push({ t: 0, dur: 1.1, f: (e) => { monkey.position.lerpVectors(a, b, e); monkey.position.y += Math.sin(e * Math.PI) * 1.6; } });
}

/* ---------- lotus & secrets ---------- */
function collectLotus(idx) {
  const l = lotuses[idx]; if (!l || l.userData.taken) return;
  l.userData.taken = true; S.lotus++; E.progress();
  fx().found(S.lotus + 1);
  const from = l.getWorldPosition(new THREE.Vector3()); l.parent.remove(l); scene.add(l); l.position.copy(from);
  anims.push({ t: 0, dur: 0.9, f: (e) => { const to = girl.userData.orbit.getWorldPosition(new THREE.Vector3()); l.position.lerpVectors(from, to, e); l.position.y += Math.sin(e * Math.PI) * 1.2; l.scale.setScalar(0.75 - e * 0.4); },
    done: () => { scene.remove(l); const mini = lotusFlower(0.35, false); girl.userData.orbit.add(mini); E.refresh(); } });
  E.refresh();
}
let discMoved = false;
function tapSecret(kind) {
  if (kind === 'disc' && !discMoved) {
    discMoved = true; leaf.visible = true; grind(0.7);
    const a = secretDisc.position.clone(), b = a.clone().add(polar(0.95, deg(67.5) + Math.PI / 2, 0));
    anims.push({ t: 0, dur: 0.8, f: (e) => secretDisc.position.lerpVectors(a, b, e) }); sparkle(leaf, 2);
  } else if (kind === 'leaf' && !S.has.leaf) { S.has.leaf = true; leaf.visible = false; fx().found(4); fx().bell(E.audio.note(7), { vol: 0.04, far: 0.4, delay: 0.4 }); label(NAMES.leaf); E.refresh(); }
}

/* ---------- win ---------- */
function onWin() {
  girl.userData.lamp.visible = false; dagobaLamp.visible = true; dagobaLamp.userData.flame.visible = true; lampSocket.visible = false;
  anims.push({ t: 0, dur: 2.5, f: (e) => (dagobaLight.intensity = e * 18) });
  // the dagoba is restored: weathered stone turns to fresh lime plaster, the pinnacle to gold
  const w0 = new THREE.Color(PAL.weathered), w1 = new THREE.Color(PAL.plaster), g0 = finMat.color.clone(), g1 = new THREE.Color(PAL.gold);
  anims.push({ t: 0, dur: 3.5, f: (e) => { domeMat.color.copy(w0).lerp(w1, e); domeMat.emissive.setRGB(0.12 * e, 0.1 * e, 0.07 * e); finMat.color.copy(g0).lerp(g1, e); finMat.metalness = 0.1 + 0.4 * e; } });
  scene.traverse((o) => { if (o.userData.streak) anims.push({ t: 0, dur: 3, f: (e) => o.scale.setScalar(Math.max(0.001, 1 - e)) }); });
  kerbLamps.forEach((l, i) => setTimeout(() => { l.userData.flame.visible = true; if (i % 4 === 0) fx().pluck(5 + ((i / 4) | 0) % 6, { vol: 0.04, far: 0.45 }); }, 1200 + i * 110));
  document.body.classList.add('golden');
  anims.push({ t: 0, dur: 3, f: (e) => { sun.color.setRGB(1, 0.94 - e * 0.14, 0.86 - e * 0.28); hemi.color.setRGB(1, 0.95 - e * 0.08, 0.91 - e * 0.18); scene.fog.color.setRGB(0.94 + e * 0.02, 0.9 - e * 0.04, 0.86 - e * 0.12); } });
  for (let i = 0; i < 3; i++) { const p = bird(0x2f6fa8, true); p.scale.setScalar(1.5); p.userData.p = { r: 8 + i * 2.5, y: 7 + i, sp: 0.35, ph: i * 2 }; scene.add(p); peacocks.push(p); }
  cam.azTo = nearestAz(CENTER.slot * STEP);

}
function nearestAz(th) { let a = th; while (a - cam.azTo > Math.PI) a -= Math.PI * 2; while (a - cam.azTo < -Math.PI) a += Math.PI * 2; return a; }
function hintTarget() {
  if (!S.gateOpen) {
    const left = flagBits.filter((f) => !f.userData.taken && f.visible);
    if (!S.boWatered && !S.sluiceOpen) return { obj: sluiceWheel, words: ['The pond is almost dry. The old sluice wheel beside it lets the tank water in.'] };
    if (!S.boWatered && !S.hasPot) return { obj: potItem, words: ['A water pot waits on the islet in the middle of the pond. Cross the lily pad.'] };
    if (S.hasPot) return { obj: boTree, words: ['Carry the water up to the bo tree on its white terrace.'] };
    if (!S.boStair) return { obj: islePlate, words: ['The bo tree terrace has no stair. Look for a carved stone to stand on.'] };
    if (left.length) return { obj: left[0], words: ['Flags hide on the islet, on the sluice roof, by the gate and out on the grounds. Turn the view.'] };
    if (S.flags < 5 && !S.boVisited) return { obj: boTree, words: ['Something bright is tangled high in the bo tree. Climb up to it.'] };
    if (!S.flagsHung) return { obj: flagPoleA, words: ['Tie the flags on the empty line by the gate.'] };
  }
  if (S.gateOpen && ringOf(S.player) === 'P') return { obj: causeway[4], words: ['Walk across the causeway to the Stupa House.'] };
  const lotusLeft = lotuses.filter((l) => !l.userData.taken);
  if (!S.offered && lotusLeft.length && S.has.lamp) return { obj: lotusLeft[0], words: ['Lotuses love water… and high places… and quiet corners behind the dagoba.'] };
  if (!S.has.lamp) return { obj: items.lamp, words: ['A clay lamp waits on its stone stand.'] };
  if (!S.offered && lotusLeft.length) return { obj: lotusLeft[0], words: ['Three lotuses are hidden on the island. Turn the view to look behind things.'] };
  if (!S.offered) return { obj: items.altar, words: ['The flower altar has three empty hollows.'] };
  if (!S.has.oil) {
    if (!S.monkeyFed && !S.has.banana) return { obj: items.banana, words: ['Someone left bananas on the brick terrace.'] };
    if (!S.monkeyFed) return { obj: monkey, words: ['The monkey looks hungry.'] };
    if (!findPath(S, S.player, SPOTS.oil)) return { obj: handles.A[0], words: ['Turn the brick terrace until the oil pot meets the grey stone stair.'] };
    return { obj: items.oil, words: ['The oil pot is within reach now.'] };
  }
  if (!findPath(S, S.player, 'C')) return { obj: handles.B[0], words: ['Turn the pillar terrace to meet its stair, then ride it round to the dagoba steps.'] };
  return { obj: items.dagoba, words: ['The lamp belongs at the dagoba.'] };
}

  // the engine asks for the object behind each action (to face it and reach for it)
  Object.assign(items, { sluice: sluiceWheel, pot: potItem, bo: boTree, flagline: flagPoleA, monkey });

  /* ---------- engine interface ---------- */
  const busy = () => !!rotating;
  function onHandle(R, dir) { turn(R, dir); }
  function surfaceTarget(R, point) {
    if (R === 'P') { let best = null, bd = 1e9; const ids = Object.keys(GN).concat(S.gateOpen ? ['G1'] : []); for (const id of ids) { const d = nodePos(id).setY(0).distanceTo(point.clone().setY(0)); if (d < bd) { bd = d; best = id; } } return best; }
    if (R === 'C') return 'C';
    const ang = R === 'G' ? 0 : ringGroups[R].rotation.y; const th = Math.atan2(point.x, point.z) - ang; return R + (((Math.round(th / STEP) % SLOTS) + SLOTS) % SLOTS);
  }
  function onArrive(node) { const ev = stepOn(S, node); if (ev) onPlate(ev); if (arriveAt(S, node)) dropFlags(); }
  function tapHidden(k) { if (k === 'disc' || k === 'leaf') return tapSecret(k); if (k[0] === 'f') return collectFlag(+k.slice(1)); if (k[0] === 'l') return collectLotus(+k.slice(1)); }
  function onResult(r, what) {
    if (r === 'wateredGate' || r === 'hungGate') setTimeout(() => { raiseCauseway(); setTimeout(() => label('Stone by stone, a causeway rises from the clouds towards the Stupa House.', 5000), 2600); }, 2200);
    switch (r) {
    case 'gotLamp': items.lamp.userData.lamp.visible = false; girl.userData.lamp.visible = true; fx().pickup(); break;
    case 'gotBanana': items.banana.visible = false; girl.userData.carryBanana.visible = true; fx().pickup(); break;
    case 'needLotus': bubble(items.altar, 'lotus', { count: 3, filled: S.lotus, offset: 1.3 }); pulseSockets(); bump(); break;
    case 'offered': offerLotuses(); break;
    case 'altarDone': break;
    case 'monkeyHungry': bubble(monkey, 'banana', { offset: 1.25 }); chatter(); monkeyHop(); break;
    case 'monkeyFed': girl.userData.carryBanana.visible = false; monkey.userData.snack.visible = true; chatter(); setTimeout(chatter, 450); fx().place(); monkeyLeave(); break;
    case 'needLamp': bubble(girl, 'lamp', { offset: 2.0 }); sparkle(items.oil, 1); bump(); break;
    case 'gotOil': items.oil.children[2].visible = false; girl.userData.lamp.userData.flame.visible = true; fx().flame(); setTimeout(unfoldStairB, 600); break;
    case 'needLampAltar': case 'needOil': bubble(items.dagoba, 'flame', { offset: 1.2 }); lampSocket.material.opacity = 0.6; bump(); break;
    case 'win': E.win(); break;
    case 'sluiceOpened': { const z0 = sluiceWheel.rotation.z; anims.push({ t: 0, dur: 1.6, f: (e) => (sluiceWheel.rotation.z = z0 + e * Math.PI * 4) }); fx().wheel(10, 0.15); grind(1.5); setTimeout(() => fx().rush(3.4), 700); pond.target = -0.08; break; }
    case 'sluiceClosed': { const z0 = sluiceWheel.rotation.z; anims.push({ t: 0, dur: 1.6, f: (e) => (sluiceWheel.rotation.z = z0 - e * Math.PI * 4) }); fx().wheel(10, 0.15); grind(1.5); pond.target = -0.36; break; }
    case 'gotPot': potItem.visible = false; heldPot.visible = true; fx().pickup(); break;
    case 'needPot': bubble(boTree, 'drop', { offset: 4.4 }); bump(); break;
    case 'watered': case 'wateredGate': waterBo(); break;
    case 'needFlags': bubble(flagPoleA, 'flag', { offset: 1.7, count: 5, filled: S.flags }); bump(); break;
    case 'hung': case 'hungGate': hangFlags(); break;
  }
  }
  function unreachable(what) {
    if (what === 'bo' && !S.boStair) { label(MSG.needStair, 4500); bubble(boTree, 'drop', { offset: 4.4 }); return; }
    if (what === 'monkey' && !S.has.banana) { bubble(monkey, 'banana', { offset: 1.25 }); chatter(); }
    else if (what === 'altar' && S.lotus < 3) bubble(items.altar, 'lotus', { count: 3, filled: S.lotus, offset: 1.3 });
    else if (what === 'dagoba') bubble(items.dagoba, 'flame', { offset: 1.2 });
  }
  const actionFor = ACTION_FOR;
  function inventory(s) { const carried = girl.userData.orbit.children.filter((c) => !c.userData.isFlag).length; const fl = s.flagsHung ? 0 : s.flags;
    for (const R of ['A', 'B']) if (!canRotate(s, R)) handles[R].forEach((h) => h.userData.mat.emissive.setHex(0));
    return { lamp: s.has.lamp && !s.lit, lotus: carried > 0 && !s.offered ? String(carried) : '', banana: s.has.banana, flag: fl > 0 ? `${fl}/5` : '', pot: s.hasPot, leaf: s.has.leaf }; }
  const GCv = new THREE.Vector3(...GROUNDS_C);
  function focus() { // 0 = temple grounds, 1 = Stupa House; on the causeway, how far across
    const gA = new THREE.Vector3(...GN.P_gate), gB = nodePos('G1'), d = gB.clone().sub(gA); d.y = 0;
    const rel = girl.position.clone().sub(gA); rel.y = 0; const along = THREE.MathUtils.clamp(rel.dot(d) / d.lengthSq(), 0, 1);
    const f = ringOf(S.player) === 'P' ? along : 1; const k = f * f * (3 - 2 * f);
    return { target: GCv.clone().lerp(new THREE.Vector3(0, 0, 0), k).setY(1.4), zoom: 1.42 - 0.1 * k, pz: 1.1 }; }
  function tick(dt, t) {
    updateRotation(dt);
    const flick = (f, sx, sy) => f.scale.set(sx + Math.sin(t * 17 + f.id) * 0.03, sy + Math.sin(t * 13 + f.id) * 0.05, 1);
    if (heldLamp.userData.flame.visible) flick(heldLamp.userData.flame, 0.28, 0.42);
    { const b = items.dagoba.userData.beacon; b.visible = !S.lit && S.has.lamp && S.has.oil;
      if (b.visible) { const k = 0.5 + 0.5 * Math.sin(t * 3); b.userData.ring.scale.setScalar(1 + 0.25 * k); b.userData.ring.material.opacity = 0.9 - 0.5 * k; b.userData.col.material.opacity = 0.18 + 0.15 * k; } }
    for (const i of [0, 2]) if (!lotuses[i].userData.taken) lotuses[i].userData.halo.material.opacity = 0.3 + 0.3 * Math.sin(t * 2.5 + i);
    if (dagobaLamp.userData.flame.visible) { flick(dagobaLamp.userData.flame, 0.34, 0.55); dagobaLight.intensity += Math.sin(t * 20) * 0.3; }
    kerbLamps.forEach((l) => l.userData.flame.visible && flick(l.userData.flame, 0.28, 0.42));
    if (!S.monkeyFed) monkey.userData.head.rotation.y = Math.sin(t * 1.3) * 0.5; else monkey.userData.head.rotation.x = Math.sin(t * 6) * 0.15;
    lotuses.forEach((l, i) => { if (!l.userData.taken) { l.position.y = l.userData.base.y + Math.sin(t * 1.5 + i) * 0.03; l.rotation.y = Math.sin(t * 0.5 + i) * 0.3; } });
    for (const R of ['A', 'B']) if (canRotate(S, R)) { const k = 0.35 + Math.sin(t * 3) * 0.25; handles[R].forEach((h) => h.userData.mat.emissive.setRGB(0.42 * k, 0.29 * k, 0.07 * k)); }
    if (!S.offered) sockets.forEach((s) => { if (!s.lotus.visible) s.glow.material.opacity = Math.max(s.glow.material.opacity * 0.98, 0.3); });
    flagStrings.forEach((f) => (f.rotation.z = Math.sin(t * 3 + f.userData.ph) * 0.15));
    clouds.forEach((c) => { c.userData.th += c.userData.sp * dt; c.position.copy(polar(c.userData.r, c.userData.th, c.userData.y)); });
    minis.forEach(([m], i) => (m.position.y = m.userData.y + Math.sin(t * 0.4 + i) * 0.3));
    for (const b of [...egrets, ...peacocks]) { const p = b.userData.p; const a = t * p.sp + p.ph; b.position.copy(polar(p.r, a, p.y + Math.sin(t + p.ph) * 0.5)); b.rotation.y = a + Math.PI / 2; b.userData.wings.forEach(([w, s]) => (w.rotation.z = s * Math.sin(t * 8 + p.ph) * 0.6)); }
    if (Math.abs(pond.level - pond.target) > 0.001) { pond.level += (pond.target - pond.level) * Math.min(1, dt * 0.9); pondWater.position.y = pond.level; padMesh.position.y = pond.level + 0.03; pondWater.parent.children.forEach((c) => { if (c.userData.float) c.position.y = pond.level + 0.02; }); }
    flagBits.forEach((f, i) => { if (!f.userData.taken) f.rotation.y = Math.sin(t * 2 + i) * 0.5; });
    islePlate.userData.glow.material.opacity = S.boStair ? 0.15 : 0.35 + Math.sin(t * 3) * 0.25;
  }
  function afterCamera() { backdrop.position.set(E.camTarget.x, 0, E.camTarget.z); backdrop.rotation.y = cam.az - Math.PI / 4; }
  /* ---------- sound ---------- */
  const nearPond = () => THREE.MathUtils.clamp(1 - girl.position.distanceTo(pondC) / 18, 0.1, 1);
  function sound(A) { // a calm temple morning: breeze, birds, a koel, a far bell; the pond once it fills
    A.loop({ color: 'pink', f: 480, q: 0.45, vol: 0.025, lfo: [0.06, 0.4] });
    const leaves = A.loop({ color: 'white', f: 4200, q: 0.4, vol: 0.002, pan: -0.2, lfo: [0.11, 0.6] });
    const water = A.loop({ color: 'pink', f: 650, q: 1.1, vol: 0, lfo: [0.35, 0.55] });
    A.every([7, 15], () => A.swell(leaves, 0.006, A.rnd(3, 6)), 4);
    A.every([2.5, 6.5], () => A.bird('chirp'), 1.5);
    A.every([5, 12], () => A.bird('bulbul'), 3);
    A.every([22, 40], () => A.bird('koel'), 8);
    A.every([14, 28], () => A.bird('dove'), 12);
    A.every([38, 65], () => A.bell(A.note(-5), A.now(), { bus: 'amb', vol: 0.045, far: 0.85, dur: 5 }), 18);
    A.every([1.2, 3.5], () => { if (pond.level > -0.2) A.sfx.plip({ vol: 0.02 * nearPond(), bus: 'amb', far: 0.4, pan: A.rnd(-0.4, 0.4) }); });
    return { update() { const k = THREE.MathUtils.clamp((pond.level + 0.36) / 0.28, 0, 1) * nearPond(); water.g.gain.setTargetAtTime(0.025 * k, A.ctx.currentTime, 0.4); } };
  }
  function surfaceAt(pos, cur) { // what her bare feet are on
    const e = cur && cur.e; if (!e) return 'stone';
    if (e.causeway || e.stair || e.kind === 'stair') return 'stone';
    if (cur.from === 'P_pad' || cur.to === 'P_pad') return 'pad';
    if (cur.from === 'P_bo' || cur.to === 'P_bo') return 'stone';
    const r = ringOf(cur.to); return r === 'P' || r === 'G' ? 'sand' : r === 'A' ? 'brick' : 'stone';
  }
  const winHook = () => { onWin(); setTimeout(() => E.playAction('wave', { speed: 1 }), 2500); };
  return { nodePos, surfaceTarget, edgePoints, onArrive, onResult, tapHidden, actionFor, items, unreachable, hintTarget, inventory, focus, tick, afterCamera, MSG, NAMES, busy, onHandle, onWin: winHook, sound, surfaceAt };
}
