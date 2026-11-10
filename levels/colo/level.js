// Prologue: Galle Face Green, Colombo. A gentle tutorial at sunset, before the journey begins. Rules live in logic.js.
import * as L from './logic.js';
import HERO_GLB from './heroine.js';

const PAL = {
  grass: 0x8fae5a, grassDark: 0x76964a, paving: 0xe2d6c2, pavingDark: 0xcdbfa8, wall: 0xd9cfbf, rail: 0x5a6a6e,
  sea: 0x3f9fb8, deep: 0x2a7d9c, foam: 0xffffff, asphalt: 0x5d5752, kerb: 0xcfc6b8, white: 0xf7f3eb,
  wood: 0x9a6a44, woodDark: 0x6e4a30, red: 0xc8423b, yellow: 0xf2c12e, green: 0x2f8a5a, maroon: 0x8a2a3a,
  palm: 0x4f8a43, palmDark: 0x3d6f36, trunk: 0x8c7356, wade: 0xb87a3a, prawn: 0xf08a5a, earth: 0xb5643c,
};
const svg = (paths) => paths.map((p) => { const [d, c] = p.split('#'); return `<path d="${d}" fill="#${c}"/>`; }).join('');
const ICONS = {
  wade: ['M16 5a11 11 0 100 22 11 11 0 100-22z#b87a3a', 'M16 12a4 4 0 100 8 4 4 0 100-8z#e8c48a', 'M10 9c3-3 7-3 9 0-2 2-6 2-9 0z#f08a5a'],
  reel: ['M7 8h18v3H7zM7 21h18v3H7z#8a5a3a', 'M10 11h12v10H10z#f2f0e8', 'M10 13h12M10 15h12M10 17h12M10 19h12#c8423b'],
  kite: ['M16 3l9 11-9 15-9-15z#f2c12e', 'M16 3v26M7 14h18#c8423b'],
  tuk: ['M5 12h17l5 7v6H5z#2f8a5a', 'M9 25a3 3 0 106 0 3 3 0 10-6 0zM20 25a3 3 0 106 0 3 3 0 10-6 0z#222222'],
};
const SLOTS = [
  { id: 'wade', title: 'Isso wade (prawn fritters)', svg: svg(ICONS.wade) },
  { id: 'reel', title: 'A kite-string reel', svg: svg(ICONS.reel) },
];
const CSS = `#coach{position:fixed;left:50%;transform:translateX(-50%);bottom:84px;z-index:7;width:min(520px,calc(100vw - 32px));padding:12px 16px;display:flex;gap:12px;align-items:flex-start;pointer-events:none;animation:rise .4s ease}
#coach .num{flex:none;width:34px;height:34px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font:700 15px "Nunito Sans"}
#coach .tx{font-size:15.5px;line-height:1.45}#coach .of{display:block;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-soft);font-weight:700;margin-bottom:2px}
body.colo #toast{bottom:190px}
.coach-pulse{animation:cpulse 1.1s ease-in-out infinite;outline:3px solid var(--accent)}@keyframes cpulse{50%{transform:scale(1.12)}}
@media (max-width:600px), (max-height:500px){#coach{bottom:72px;padding:10px 12px}#coach .tx{font-size:14px}body.colo #toast{bottom:200px}}
body.colo{--sky-top:#f3a98a;--sky-mid:#fbd3a6;--sky-bot:#9fd0dc;--accent:#c8623c}
body.colo.won{--sky-top:#e0857a;--sky-mid:#f6b98a;--sky-bot:#86bfd2}`;

export default {
  heroGlb: HERO_GLB, slots: SLOTS, icons: ICONS, logic: L,
  meta: {
    chapter: '0', chapterLabel: 'Prologue', place: 'Colombo', title: 'Galle Face Green', tagline: 'Sunset by the sea, the evening before the journey.',
    bodyClass: 'colo', css: CSS, noStats: true,
    intro: 'Tomorrow you set off across Sri Lanka. Tonight it’s Galle Face Green: kites over the sea, food carts on the promenade, and the Galle Road traffic humming past. Take a stroll and find your way to Fort station.',
    howto: ['This short prologue shows you how to play, one step at a time.', 'Just follow the <b>steps at the bottom of the screen</b>. A bouncing <b>arrow</b> shows you exactly what to tap.'],
    startLabel: '',
    winTitle: 'Off you go', winSub: 'Next stop: Fort station, and the train to Polonnaruwa', winNote: 'Every chapter ahead is built from what you just did: walking, looking around, picking up, giving, and standing on things.',
    inviteNode: 'LAWN', camStart: [0.8, 1.1, -0.6], fog: 0xf6d6bc, winDelay: 5200,
  },
  build,
};

function build(E) {
  const { THREE, S, scene, mat, mesh, polar, deg, tag, hash, canvasTex, bubble, sparkle, jiggle, beacon, halo, label, anims, girl, cam } = E;
  const V3 = (a) => new THREE.Vector3(...a);
  const P = (id) => V3(L.NODES[id]);
  const at = (u, v, y = 0) => V3(L.at(u, v, y));
  const YAW = 0; // objects are built along the promenade's axes
  const items = {};
  const fx = () => E.sfx;
  const sways = [];

  /* ---------- props ---------- */
  function person(shirt, lower, { seated = false, scale = 1, skin = 0x8a5a3c, hair = 0x2a211d } = {}) {
    const g = new THREE.Group(); const sk = mat(skin);
    const legs = mesh(new THREE.CylinderGeometry(0.17, 0.2, seated ? 0.35 : 0.75, 8), mat(lower)); legs.position.y = seated ? 0.35 : 0.38; g.add(legs);
    if (seated) { legs.rotation.x = Math.PI / 2; legs.position.set(0, 0.32, 0.18); }
    const body = mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.6, 8), mat(shirt)); body.position.y = seated ? 0.7 : 1.05; g.add(body);
    const head = mesh(new THREE.SphereGeometry(0.17, 10, 8), sk); head.position.y = body.position.y + 0.45; g.add(head);
    const hr = mesh(new THREE.SphereGeometry(0.175, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2.2), mat(hair)); hr.position.copy(head.position); g.add(hr);
    const arms = []; for (const sx of [-1, 1]) { const a = new THREE.Group(); a.position.set(sx * 0.24, body.position.y + 0.22, 0.02); const m = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6), sk); m.position.y = -0.25; a.add(m); a.rotation.z = sx * 0.2; g.add(a); arms.push(a); }
    g.scale.setScalar(scale); g.userData = { head, arms }; return g;
  }
  function palm(h = 4.4, lean = 0.3, seed = 1) {
    const g = new THREE.Group(); let p = new THREE.Vector3();
    for (let i = 0; i < 6; i++) { const q = new THREE.Vector3(Math.sin(seed) * lean * (i + 1) ** 1.6 / 6, h * (i + 1) / 6, Math.cos(seed) * lean * (i + 1) ** 1.6 / 6);
      const seg = mesh(new THREE.CylinderGeometry(0.11 - i * 0.008, 0.14 - i * 0.008, p.distanceTo(q), 6), mat(PAL.trunk)); seg.position.copy(p).lerp(q, 0.5); seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), q.clone().sub(p).normalize()); g.add(seg); p = q; }
    const crown = new THREE.Group(); crown.position.copy(p); g.add(crown);
    for (let i = 0; i < 8; i++) { const arm = new THREE.Group(); arm.rotation.y = i / 8 * Math.PI * 2 + seed; crown.add(arm); const fr = mesh(new THREE.ConeGeometry(0.32, 2.1, 4, 1), mat(i % 2 ? PAL.palm : PAL.palmDark)); fr.scale.set(1, 1, 0.25); fr.rotation.set(Math.PI / 2 + 0.55 + hash(i, seed, 2) * 0.3, 0, 0); fr.position.set(0, -0.15, 0.95); arm.add(fr); }
    sways.push({ o: crown, seed }); return g;
  }
  function kite(color, tail) { // a diamond kite with a ribbon tail
    const g = new THREE.Group(); const sh = new THREE.Shape(); sh.moveTo(0, 0.55); sh.lineTo(0.4, 0.05); sh.lineTo(0, -0.6); sh.lineTo(-0.4, 0.05); sh.closePath();
    const k = mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.8 }), { cast: false }); g.add(k);
    const cross = mesh(new THREE.BoxGeometry(0.8, 0.02, 0.02), mat(PAL.woodDark), { cast: false }); cross.position.y = 0.05; g.add(cross);
    const tl = new THREE.Group(); tl.position.y = -0.6; g.add(tl); for (let i = 0; i < 5; i++) { const b = mesh(new THREE.BoxGeometry(0.12, 0.06, 0.01), mat(tail), { cast: false }); b.position.y = -0.22 * (i + 1); b.rotation.z = (i % 2 ? 1 : -1) * 0.5; tl.add(b); }
    g.userData.tail = tl; return g;
  }
  function line3(a, b, color = 0xf5f0e6) { const geo = new THREE.BufferGeometry().setFromPoints([a, b]); const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 })); scene.add(l); return l; }
  function signTex(text, bg, fg, w = 256, h = 64, font = 'bold 34px Nunito Sans, sans-serif') { return canvasTex(w, h, (c) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.fillStyle = fg; c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, w / 2, h / 2 + 2); }); }

  /* ---------- the green: a floating slab with lawn, promenade, sea wall, sea and Galle Road ---------- */
  const U0 = -10.5, U1 = 12, V0 = -5.6, V1 = 8.6;
  const slab = new THREE.Group(); slab.position.copy(at(0, 0)); slab.rotation.y = YAW; scene.add(slab);
  const box = (w, h, d, c, u, y, v, o = {}) => { const m = mesh(new THREE.BoxGeometry(w, h, d), mat(c, o)); m.position.set(u, y, -v); slab.add(m); return m; }; // u→x, v→-z inside the slab
  { const base = box(U1 - U0, 0.5, V1 - V0, 0xc9b49a, (U0 + U1) / 2, -0.26, (V0 + V1) / 2);
    const under = mesh(new THREE.CylinderGeometry(9.5, 2.6, 7, 10, 2, true), mat(0xb59a80)); under.scale.set(1.25, 1, 0.8); under.position.set((U0 + U1) / 2, -3.9, -(V0 + V1) / 2); slab.add(under); }
  const lawn = box(15.6, 0.06, 7.7, PAL.grass, -2.3, 0.0, -1.55); tag(lawn, { surface: 'g' });
  for (let i = 0; i < 26; i++) { const t = mesh(new THREE.ConeGeometry(0.07, 0.18, 3), mat(PAL.grassDark), { cast: false }); t.position.set(-10 + hash(i, 1, 4) * 15.5, 0.1, 5.2 - hash(i, 2, 4) * 7.4); slab.add(t); }
  const prom = box(15.6, 0.08, 2.6, PAL.paving, -2.3, 0.01, 3.65); tag(prom, { surface: 'g' });
  for (let u = -10; u < 5.4; u += 0.9) box(0.03, 0.02, 2.6, PAL.pavingDark, u, 0.06, 3.65, {}).castShadow = false;
  const wall = box(15.6, 0.55, 0.35, PAL.wall, -2.3, 0.25, 5.1); tag(wall, { surface: 'g' });
  for (let u = -10; u <= 5.4; u += 1.3) box(0.06, 0.6, 0.06, PAL.rail, u, 0.8, 5.1);
  box(15.6, 0.05, 0.05, PAL.rail, -2.3, 1.08, 5.1);
  const sea = box(15.6 + 6.6, 0.1, 3.1, PAL.sea, 0.75, 0.0, 7.0, { roughness: 0.25, flatShading: false }); sea.material = new THREE.MeshStandardMaterial({ color: PAL.sea, roughness: 0.25, transparent: true, opacity: 0.92 });
  const foams = []; for (let i = 0; i < 3; i++) { const f = box(22, 0.02, 0.18, PAL.foam, 0.75, 0.07, 5.6, {}); f.material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }); f.userData.i = i; foams.push(f); }
  // Galle Road on the right, with a zebra crossing, kerbs and the far pavement
  const road = box(2.6, 0.06, 5.3 - V0, PAL.asphalt, 7.5, 0.0, (V0 + 5.3) / 2); tag(road, { surface: 'g' });
  for (let v = -5.2; v < 5.2; v += 1.0) if (v < -1 || v > 1.6) box(0.08, 0.02, 0.5, 0xf2eee4, 7.5, 0.04, v + 0.25);
  const zebra = []; for (let i = 0; i < 6; i++) zebra.push(box(0.32, 0.025, 1.7, 0xf6f2e8, 6.45 + i * 0.42, 0.045, 0.3));
  box(0.25, 0.14, 10.9, PAL.kerb, 6.15, 0.05, -0.25); box(0.25, 0.14, 10.9, PAL.kerb, 8.85, 0.05, -0.25);
  const farPave = box(3.0, 0.1, 10.9, PAL.paving, 10.45, 0.02, -0.25); tag(farPave, { surface: 'g' });
  { const k = box(2.2, 0.06, 7.7, PAL.grass, 5.0, 0.0, -1.55); tag(k, { surface: 'g' }); }
  { const p2 = box(0.7, 0.08, 2.6, PAL.paving, 5.75, 0.01, 3.65); tag(p2, { surface: 'g' }); }

  /* ---------- the vadai cart (the hidden reel rolls behind it) and its neighbours ---------- */
  const cart = new THREE.Group(); cart.position.copy(at(-3.6, 2.85)); cart.rotation.y = YAW; scene.add(cart);
  { const c = (w, h, d, col, x, y, z) => { const m = mesh(new THREE.BoxGeometry(w, h, d), mat(col)); m.position.set(x, y, z); cart.add(m); return m; };
    c(1.7, 0.75, 1.0, PAL.wood, 0, 0.55, 0); c(1.74, 0.08, 1.04, PAL.woodDark, 0, 0.95, 0);
    const glass = mesh(new THREE.BoxGeometry(1.4, 0.55, 0.8), new THREE.MeshStandardMaterial({ color: 0xdff2f4, transparent: true, opacity: 0.45, roughness: 0.1 })); glass.position.set(0, 1.27, 0); cart.add(glass);
    for (let i = 0; i < 9; i++) { const w = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 10), mat(PAL.wade)); w.position.set(-0.5 + (i % 3) * 0.5, 1.03 + Math.floor(i / 3) * 0.07, -0.2 + Math.floor(i / 3) * 0.2); cart.add(w);
      const pr = mesh(new THREE.TorusGeometry(0.05, 0.02, 4, 8, Math.PI * 1.3), mat(PAL.prawn)); pr.rotation.x = -Math.PI / 2; pr.position.copy(w.position).add(new THREE.Vector3(0, 0.04, 0)); cart.add(pr); }
    for (const x of [-0.8, 0.8]) for (const z of [-0.48, 0.48]) c(0.05, 1.2, 0.05, PAL.woodDark, x, 1.5, z);
    c(1.9, 0.08, 1.2, PAL.red, 0, 2.12, 0); for (let i = 0; i < 6; i++) c(0.3, 0.16, 0.02, i % 2 ? PAL.red : PAL.yellow, -0.75 + i * 0.3, 2.0, 0.6);
    for (const x of [-0.75, 0.75]) { const w = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 14), mat(PAL.woodDark)); w.rotation.z = Math.PI / 2; w.position.set(x * 1.18, 0.3, 0); cart.add(w); }
    const sign = mesh(new THREE.PlaneGeometry(1.5, 0.36), new THREE.MeshBasicMaterial({ map: signTex('ISSO WADE', '#f2c12e', '#8a2a1a') })); sign.position.set(0, 1.8, 0.53); cart.add(sign);
    const hit = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.2, 1.3), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 1.1; cart.add(hit); }
  tag(cart, { item: 'cart' }); items.cart = cart;
  const seller = person(0xf4f0e6, 0x2f5fa8); seller.position.copy(at(-2.3, 3.45)); seller.rotation.y = YAW + Math.PI + 0.3; scene.add(seller);
  // a pickle cart (achcharu jars) and an ice-cream bicycle, just for colour
  { const g = new THREE.Group(); g.position.copy(at(-7.4, 2.9)); g.rotation.y = YAW; scene.add(g);
    const b = mesh(new THREE.BoxGeometry(1.3, 0.8, 0.8), mat(0x3f7fbf)); b.position.y = 0.55; g.add(b);
    [0xf2c12e, 0xd94f3a, 0x7fbf4a, 0xf08a3a, 0xe6d26a].forEach((c, i) => { const j = mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.3, 8), new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: 0.85 })); j.position.set(-0.45 + i * 0.22, 1.1, 0); g.add(j); });
    const um = mesh(new THREE.ConeGeometry(1.0, 0.4, 8), mat(0xf6f0e2)); um.position.y = 2.1; g.add(um); const pole = mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 5), mat(0x777777)); pole.position.y = 1.2; g.add(pole); }
  { const g = new THREE.Group(); g.position.copy(at(1.5, 2.2)); g.rotation.y = YAW; scene.add(g);
    const bx = mesh(new THREE.BoxGeometry(0.8, 0.6, 0.6), mat(0xf6f0e2)); bx.position.set(0.3, 0.75, 0); g.add(bx); const st = mesh(new THREE.PlaneGeometry(0.7, 0.2), new THREE.MeshBasicMaterial({ map: signTex('ICE CREAM', '#e05a7a', '#ffffff') })); st.position.set(0.3, 0.8, 0.31); g.add(st);
    for (const x of [-0.5, 0.6]) { const w = mesh(new THREE.TorusGeometry(0.28, 0.03, 4, 14), mat(0x333333)); w.position.set(x, 0.3, 0); g.add(w); } }

  /* ---------- the boy on the sea wall, and kites over the sea ---------- */
  const kid = person(0xf2c12e, 0x2f5fa8, { seated: true, scale: 0.68 }); kid.position.copy(at(3.0, 5.05, 0.5)); kid.rotation.y = YAW + Math.PI; scene.add(kid);
  { const hit = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 1.0), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 0.4; kid.add(hit); }
  tag(kid, { item: 'kid' }); items.kid = kid;
  const kidKite = kite(0xf2c12e, PAL.red); kidKite.scale.setScalar(0.7); kidKite.position.copy(at(3.6, 4.6, 0.18)); kidKite.rotation.set(-Math.PI / 2 + 0.1, 0, 0.4); scene.add(kidKite); // limp on the ground
  let kidLine = null;
  const skyKites = [[0xd94f3a, PAL.yellow, -6, 7.5, 7.5], [0x3f7fbf, 0xffffff, -1.5, 8.2, 9], [0x7fbf4a, 0xf08a3a, 5.5, 7.8, 8.2]].map(([c, t, u, v, h], i) => {
    const k = kite(c, t); k.position.copy(at(u, v, h)); scene.add(k); const flyer = person([0xf6f0e2, 0xd94f3a, 0x2f8a5a][i], 0x3a3a4a, { scale: 0.9 }); flyer.position.copy(at(u - 0.5, 3.4 + (i % 2) * 0.6)); flyer.rotation.y = YAW + Math.PI; scene.add(flyer);
    flyer.userData.arms[1].rotation.x = -2.2; const ln = line3(flyer.position.clone().add(new THREE.Vector3(0, 1.5, 0)), k.position); return { k, base: k.position.clone(), ln, hand: flyer.position.clone().add(new THREE.Vector3(0, 1.5, 0)), ph: i * 1.7 }; });

  /* ---------- the lost reel, hidden behind the cart ---------- */
  const reel = new THREE.Group(); reel.position.copy(V3(L.REEL_AT)); scene.add(reel);
  { const core = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.24, 12), mat(0xf2f0e8)); core.rotation.z = Math.PI / 2; reel.add(core);
    for (const x of [-0.14, 0.14]) { const d = mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 12), mat(0x8a5a3a)); d.rotation.z = Math.PI / 2; d.position.x = x; reel.add(d); }
    const thread = mesh(new THREE.TorusGeometry(0.17, 0.02, 4, 12), mat(PAL.red)); thread.rotation.y = Math.PI / 2; reel.add(thread);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.36, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); reel.add(hit); }
  halo(reel, 0xffe2a0, 0.35, 0.6).position.y = -0.1; tag(reel, { hidden: 'reel' });

  /* ---------- the crossing: a stand-on button stone, signals and the traffic ---------- */
  const plate = new THREE.Group(); plate.position.copy(P('PLATE')).setY(0.02); scene.add(plate);
  { const s = mesh(new THREE.CylinderGeometry(0.55, 0.62, 0.12, 20), mat(0xd9cfbf)); s.position.y = 0.05; plate.add(s);
    const top = mesh(new THREE.CircleGeometry(0.42, 20), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (c) => { c.fillStyle = '#f2c12e'; c.beginPath(); c.arc(64, 64, 62, 0, 7); c.fill(); c.fillStyle = '#3a3a3a';
      c.beginPath(); c.ellipse(50, 70, 12, 22, -0.2, 0, 7); c.fill(); c.beginPath(); c.ellipse(80, 56, 12, 22, 0.2, 0, 7); c.fill(); }) })); top.rotation.x = -Math.PI / 2; top.position.y = 0.115; plate.add(top);
    tag(s, { surface: 'g' }); tag(top, { surface: 'g' }); }
  const plateGlow = halo(plate, 0xfff2b0, 0.62, 0.85); plateGlow.position.y = 0.04;
  const signals = [];
  for (const [u, v] of [[6.05, -0.75], [9.0, 1.4]]) { const g = new THREE.Group(); g.position.copy(at(u, v)); scene.add(g);
    const pole = mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6), mat(0x3a3a3a)); pole.position.y = 1.1; g.add(pole);
    const boxm = mesh(new THREE.BoxGeometry(0.3, 0.55, 0.22), mat(0x2a2a2a)); boxm.position.y = 2.25; g.add(boxm);
    const red = mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff4a3a })); red.position.set(0, 2.38, 0.12); g.add(red);
    const grn = mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: 0x2a4a2a })); grn.position.set(0, 2.12, 0.12); g.add(grn);
    g.rotation.y = YAW + (u < 7 ? Math.PI / 2 : -Math.PI / 2); signals.push({ red, grn }); }
  function setSignals(walk) { signals.forEach(({ red, grn }) => { red.material.color.setHex(walk ? 0x4a2420 : 0xff4a3a); grn.material.color.setHex(walk ? 0x5aff7a : 0x2a4a2a); }); }
  // traffic: buses, tuk-tuks and cars in two lanes; they stop short of the zebra when the crossing is on
  function vehicle(kind) {
    const g = new THREE.Group(); const b = (w, h, d, c, x, y, z) => { const m = mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y, z); g.add(m); };
    if (kind === 'bus') { b(0.95, 1.1, 3.0, 0xc8423b, 0, 0.8, 0); b(0.97, 0.3, 2.9, 0xf2eee4, 0, 1.1, 0); b(0.9, 0.08, 2.9, 0x8a2a2a, 0, 1.4, 0); }
    else if (kind === 'tuk') { b(0.7, 0.6, 1.15, [0x8a2a3a, 0x2f8a5a, 0x2f5fa8][Math.floor(Math.random() * 3)], 0, 0.5, 0); b(0.74, 0.06, 1.1, 0x2b2b2b, 0, 1.05, -0.05); b(0.4, 0.45, 0.3, 0x8a2a3a, 0, 0.45, 0.7); }
    else { b(0.8, 0.45, 1.7, [0xf2eee4, 0x9aa4ab, 0x2a2a2a][Math.floor(Math.random() * 3)], 0, 0.45, 0); b(0.72, 0.35, 0.9, 0x6a7a84, 0, 0.82, -0.1); }
    for (const z of kind === 'bus' ? [-1, 1] : [-0.45, 0.45]) for (const x of [-0.42, 0.42]) { const w = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 8), mat(0x222222)); w.rotation.z = Math.PI / 2; w.position.set(x * (kind === 'bus' ? 1.05 : 1), 0.17, z); g.add(w); }
    g.userData.len = kind === 'bus' ? 3.0 : kind === 'tuk' ? 1.4 : 1.8; return g;
  }
  const traffic = []; const LANES = [[7.0, -1], [8.0, 1]]; // u, direction along v
  [['bus', 0, -3], ['tuk', 0, 2.5], ['car', 0, 6.5], ['tuk', 1, -4], ['car', 1, 0.5], ['tuk', 1, 4.5]].forEach(([k, lane, v]) => { const g = vehicle(k); scene.add(g); traffic.push({ g, lane, v, speed: 2.4 + Math.random() * 0.6 }); });
  const ZONE = [-0.8, 1.4]; // the zebra, in v
  function placeVehicle(c) { const [u, dir] = LANES[c.lane]; c.g.position.copy(at(u, c.v)); c.g.rotation.y = YAW + (dir > 0 ? Math.PI : 0); const edge = Math.min(c.v - (-5.4), 5.2 - c.v); c.g.scale.setScalar(THREE.MathUtils.clamp(edge / 0.8, 0.001, 1)); }
  traffic.forEach(placeVehicle);

  /* ---------- the tuk-tuk across the road, and its driver ---------- */
  const tuk = new THREE.Group(); tuk.position.copy(at(10.4, 1.7, 0.08)); tuk.rotation.y = YAW + Math.PI; scene.add(tuk);
  { const body = mesh(new THREE.BoxGeometry(0.9, 0.75, 1.5), mat(PAL.green)); body.position.y = 0.6; tuk.add(body);
    const roof = mesh(new THREE.BoxGeometry(0.95, 0.08, 1.4), mat(0x2b2b2b)); roof.position.set(0, 1.35, -0.05); tuk.add(roof);
    for (const x of [-0.42, 0.42]) { const p = mesh(new THREE.BoxGeometry(0.05, 0.55, 0.05), mat(0x2b2b2b)); p.position.set(x, 1.05, 0.55); tuk.add(p); }
    const nose = mesh(new THREE.BoxGeometry(0.5, 0.6, 0.35), mat(PAL.green)); nose.position.set(0, 0.55, 0.9); tuk.add(nose);
    const ws = mesh(new THREE.BoxGeometry(0.85, 0.42, 0.04), new THREE.MeshStandardMaterial({ color: 0xbfe6ea, transparent: true, opacity: 0.6 })); ws.position.set(0, 1.05, 0.62); ws.rotation.x = -0.2; tuk.add(ws);
    for (const [x, z] of [[0, 0.95], [-0.42, -0.45], [0.42, -0.45]]) { const w = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 10), mat(0x222222)); w.rotation.z = Math.PI / 2; w.position.set(x, 0.2, z); tuk.add(w); }
    const driver = person(0xf6f0e2, 0x5a4a3a, { seated: true, scale: 0.8 }); driver.position.set(0, 0.2, 0.25); tuk.add(driver); tuk.userData.driver = driver;
    const hit = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 2.4), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 0.8; tuk.add(hit); }
  tag(tuk, { item: 'tuk' }); items.tuk = tuk; const tukBeacon = beacon(0xffd27a, 2.6); tuk.add(tukBeacon);

  /* ---------- palms, lamps, and the city behind (it turns with the view so it stays behind) ---------- */
  [[-9.6, -4.6, 1], [-5.5, -5.0, 2.2], [1.2, -5.0, 3.1], [5.4, -4.6, 4], [11.3, -4.4, 5], [11.4, 4.2, 6], [-9.8, 1.0, 7]].forEach(([u, v, s]) => { const p = palm(3.8 + hash(s, 1, 1) * 1.4, 0.3, s); p.position.copy(at(u, v)); scene.add(p); });
  for (const u of [-8.3, -5.8, 2.6]) { const g = new THREE.Group(); g.position.copy(at(u, 2.45)); scene.add(g); const pl = mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.6, 6), mat(0x2f3a3a)); pl.position.y = 1.3; g.add(pl);
    const lp = mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshStandardMaterial({ color: 0xfff1c8, emissive: 0xffd27a, emissiveIntensity: 0.4 })); lp.position.y = 2.7; g.add(lp); }
  const backdrop = new THREE.Group(); scene.add(backdrop);
  { const B = (w, h, d, c, u, v) => { const m = mesh(new THREE.BoxGeometry(w, h, d), mat(c), { receive: false }); m.position.copy(at(u - 9, v + 4, h / 2 - 7)); m.rotation.y = YAW; backdrop.add(m); return m; };
    // Galle Face Hotel: long, white, red roof
    { const h = B(2.4, 3.2, 7, 0xf4efe6, -15, 0); const r = B(2.6, 0.4, 7.2, 0xb8563a, -15, 0); r.position.y += 1.8; }
    // the city skyline, and the Lotus Tower
    [[2.2, 9, -18, 7, 0xe6dcd0], [1.8, 12, -21, 3, 0xd9cfc4], [2.6, 7, -17, -6, 0xeae2d6], [2.0, 14, -23, -2, 0xcfd6dc], [2.4, 10, -19, 11, 0xe2d8cc]].forEach(([w, h, u, v, c]) => B(w, h, w, c, u, v));
    const lt = new THREE.Group(); lt.position.copy(at(-34, 12, -7)); backdrop.add(lt);
    const stem = mesh(new THREE.CylinderGeometry(0.35, 0.7, 20, 8), mat(0x6aa48a)); stem.position.y = 10; lt.add(stem);
    const bud = mesh(new THREE.SphereGeometry(1.4, 10, 8), mat(0xb0609a)); bud.scale.set(1, 1.5, 1); bud.position.y = 21; lt.add(bud);
    const tip = mesh(new THREE.ConeGeometry(0.3, 4, 6), mat(0xd9a0c8)); tip.position.y = 24.5; lt.add(tip); }

  /* ---------- carried things (they ride along beside her) ---------- */
  const carriedWade = new THREE.Group(); { const pk = mesh(new THREE.BoxGeometry(0.28, 0.08, 0.2), mat(0xe8dcc0)); carriedWade.add(pk); const w = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 10), mat(PAL.wade)); w.position.y = 0.06; carriedWade.add(w); }
  carriedWade.visible = false; girl.userData.orbit.add(carriedWade); carriedWade.position.set(0.45, 0, 0);
  const carriedReel = reel.clone(); carriedReel.children.forEach((c) => { if (c.userData.halo) c.visible = false; }); carriedReel.traverse((o) => { delete o.userData.hidden; }); carriedReel.scale.setScalar(0.7); carriedReel.visible = false; girl.userData.orbit.add(carriedReel); carriedReel.position.set(-0.45, 0, 0);

  /* ---------- story beats ---------- */
  function liftKite() { // the boy's kite climbs back into the sky
    kid.userData.arms[1].rotation.x = -2.4; const from = kidKite.position.clone(), to = at(3.2, 8.3, 7.2);
    anims.push({ t: 0, dur: 3.2, f: (e) => { kidKite.position.lerpVectors(from, to, e); kidKite.position.y += Math.sin(e * Math.PI) * 0.8; kidKite.rotation.set(-Math.PI / 2 * (1 - e) + 0.1 * e, 0, 0.4 * (1 - e)); kidKite.scale.setScalar(0.7 + 0.3 * e); },
      done: () => { kidLine = line3(kid.position.clone().add(new THREE.Vector3(0, 0.95, 0)), kidKite.position); skyKites.push({ k: kidKite, base: kidKite.position.clone(), ln: kidLine, hand: kid.position.clone().add(new THREE.Vector3(0, 0.95, 0)), ph: 4.2 }); } });
  }
  function rideAway() {
    carriedWade.visible = false; const d = tuk.userData.driver; d.userData.arms[0].rotation.x = -1.2;
    setTimeout(() => { girl.visible = false; riding = true; if (E.audio.ctx) E.audio.motor({ f: 64, f2: 74, rate: 18, dur: 5, vol: 0.05, attack: 0.4, release: 1.5, lp: 620, bus: 'sfx' }); }, 900);
    const from = tuk.position.clone(), to = at(10.4, -9.5, 0.08);
    setTimeout(() => anims.push({ t: 0, dur: 4.2, f: (e) => { tuk.position.lerpVectors(from, to, e * e); tuk.scale.setScalar(Math.max(0.001, 1 - Math.max(0, (e - 0.75) * 4))); } }), 1100);
    setTimeout(() => E.win(), 2600);
  }
  let riding = false;

  /* ---------- engine interface ---------- */
  const MSG = {
    cartAgain: '“One packet is enough for the train, nangi!”',
    kidNeeds: 'He points at his limp kite. The string reel has rolled away somewhere…',
    tukWaits: '“Sorry, nangi, I’m waiting for my son. He’s down by the sea wall with his kite.”',
    tukHungry: '“Is that isso wade I can smell? … Oh. You ate them all?”',
  };
  const NAMES = { gotWade: '<em>Isso wade</em> · prawn fritters, hot from the cart' };
  function onResult(r) {
    E.refresh();
    switch (r) {
      case 'gotWade': carriedWade.visible = true; fx().pickup(); break;
      case 'cartAgain': fx().bump(); break;
      case 'kidNeeds': bubble(kid, 'reel', { offset: 1.3, dur: 3.4 }); fx().bump();
        setTimeout(() => label('“My kite reel rolled away, akka… somewhere behind the wade cart.”', 4800), 300); break;
      case 'gaveReel': carriedReel.visible = false; fx().place(); [4, 6, 8, 9].forEach((n, i) => fx().pluck(n, { vol: 0.05, delay: 0.3 + i * 0.18 })); liftKite();
        setTimeout(() => label('“Thank you, akka! My thaththa’s tuk-tuk is across the road. He’ll take you to the station!”', 5200), 900);
        setTimeout(() => { E.refresh(); sparkle(tuk, 2); }, 3000); break;
      case 'kidHappy': bubble(kid, 'kite', { offset: 1.3 }); break;
      case 'tukWaits': bubble(tuk, 'kite', { offset: 2.0 }); fx().bump(); break;
      case 'tukHungry': fx().bump(); break;
      case 'win': label('You share your isso wade with the driver. “Fort station? Hari, hari!”', 4200); fx().place(); rideAway(); break;
    }
  }
  function tapHidden(k) {
    const r = L.tap(S, k); if (!r) return; E.progress();
    const from = reel.position.clone(); fx().found(1);
    anims.push({ t: 0, dur: 0.9, f: (e) => { reel.position.lerpVectors(from, girl.position.clone().add(new THREE.Vector3(0, 1.7, 0)), e); reel.position.y += Math.sin(e * Math.PI) * 1.2; reel.scale.setScalar(1 - e * 0.5); }, done: () => { reel.visible = false; carriedReel.visible = true; E.refresh(); } });
    label('<em>Pattam nool</em> · the boy’s kite-string reel', 3000);

  }
  function onArrive(node, e, stop) {
    const ev = stop ? L.stepOn(S, node) : null;
    if (ev) { E.progress(); fx().thunk(); fx().pluck(ev.on ? 4 : 1, { vol: 0.05, delay: 0.2 }); setSignals(ev.on); plate.children[0].position.y = ev.on ? 0.0 : 0.05;
      label(ev.on ? 'The lights turn red and the traffic stops!' : 'The lights change back. Stand on the yellow stone again to stop the traffic.', 3800); E.refresh(); }
    if (node === 'FAR' && S.reel === 2) sparkle(tuk, 1);
  }
  function surfaceTarget(kind, point) {
    let best = null, bd = 1e9; for (const id of Object.keys(L.NODES)) { const n = P(id); const d = Math.hypot(n.x - point.x, n.z - point.z); if (d < bd) { bd = d; best = id; } } return best;
  }
  function surfaceAt(pos, cur) {
    if (cur && cur.e && cur.e.kind === 'cross') return 'stone';
    const ids = cur ? [cur.from, cur.to] : []; if (ids.includes('PROM') || ids.includes('KID') || ids.includes('FAR')) return 'stone';
    return 'grass';
  }
  function unreachable(what) {
    if (what === 'tuk' && !S.crossing) { label('Galle Road is far too busy to just walk across.', 3600); sparkle(plate, 1); }
  }
  function hintTarget() {
    const st = coachStep(); if (st && st.k === 1) return { obj: arrow, words: ['Tap the white circle on the grass.'] };
    if (!S.wade) return { obj: cart, words: ['The vadai cart on the promenade: tap it.'] };
    if (S.reel === 0 && !S.asked) return { obj: kid, words: ['The boy on the sea wall. Tap him.'] };
    if (S.reel === 0) return { obj: reel, words: ['Turn the view and look behind the vadai cart.'] };
    if (S.reel === 1) return { obj: kid, words: ['Give the reel back: tap the boy.'] };
    if (!S.crossing && S.player !== 'FAR') return { obj: plate, words: ['The yellow stone by the kerb: stand on it.'] };
    if (S.player !== 'FAR') return { obj: zebra[2], words: ['Walk across the zebra crossing.'] };
    return { obj: tuk, words: ['Tap the tuk-tuk.'] };
  }
  function inventory(s) { return { wade: !!s.wade, reel: s.reel === 1 }; }
  const centre = at(0.8, 0.6, 1.1);
  function focus() { return { target: centre, zoom: 1, pz: 1.12 }; }
  function afterCamera() { backdrop.position.copy(E.camTarget).setY(0); backdrop.rotation.y = cam.az - Math.PI / 4; }
  function nodePos(id) { return P(id); }
  function busy() { return riding; }

  /* ---------- sound ---------- */
  function sound(A) { // sunset by the sea: waves at the wall, a sea breeze, crows, kites, and Galle Road's hum and horns
    A.loop({ color: 'pink', type: 'lowpass', f: 480, q: 0.5, vol: 0.045, lfo: [0.1, 0.7] });
    A.loop({ color: 'white', f: 1400, q: 0.5, vol: 0.006, lfo: [0.1, 0.8], pan: 0.2 });
    A.loop({ color: 'pink', f: 380, q: 0.4, vol: 0.016, lfo: [0.05, 0.5] });
    const hum = A.loop({ color: 'brown', type: 'lowpass', f: 160, q: 0.5, vol: 0.02, pan: 0.6 });
    A.every([7, 15], () => { const f = A.rnd(520, 640); [0, 0.32].forEach((d) => A.osc('sawtooth', f, A.now(d), 0.22, { bus: 'amb', to: f * 0.78, vol: 0.006, lp: 1500, far: 0.5, pan: A.rnd(-0.7, 0.7) })); }, 3);
    A.every([3, 7], () => A.bird('chirp', { vol: 0.6 }), 2);
    A.every([4, 9], () => { if (S.crossing) return; const l = Math.random() < 0.5 ? -1 : 1; A.motor({ f: A.rnd(55, 120), rate: A.rnd(12, 30), dur: 2.6, vol: 0.012, lp: 700, pan: [0.4 * l, 0.9 * l] }); if (Math.random() < 0.25) A.osc('triangle', A.rnd(380, 480), A.now(0.8), 0.16, { bus: 'amb', vol: 0.006, lp: 1500, far: 0.4, pan: 0.6 }); }, 2);
    A.every([5, 11], () => A.sfx.flutter(3));
    return { update() { hum.to(S.crossing ? 0.006 : 0.02); } };
  }

  /* ---------- the coach: one step at a time, with an arrow over the thing to tap ---------- */
  document.body.insertAdjacentHTML('beforeend', '<div id="coach" class="card" style="display:none"><div class="num"></div><div class="tx"></div></div>');
  const coachEl = document.getElementById('coach');
  const arrow = new THREE.Group(); scene.add(arrow); arrow.visible = false; arrow.scale.setScalar(1.5);
  { const m = new THREE.MeshBasicMaterial({ color: 0xffe08a, depthTest: false, transparent: true }); const head = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.55, 4), m); head.rotation.x = Math.PI; head.renderOrder = 999; arrow.add(head);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 6), m); shaft.position.y = 0.5; shaft.renderOrder = 999; arrow.add(shaft);
    const rim = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.62, 4), new THREE.MeshBasicMaterial({ color: 0xc8623c, depthTest: false, transparent: true, opacity: 0.9 })); rim.rotation.x = Math.PI; rim.position.y = 0.02; rim.renderOrder = 998; arrow.add(rim); }
  const az0 = cam.azTo; let turned = false, stepKey = '', started = false;
  const lawnSpot = P('LAWN');
  function coachStep() {
    if (S.won) return null;
    if (S.player === 'START' && !S.wade) return { k: 1, t: '<b>Tap the white circle</b> on the grass. She walks wherever you tap the ground.', at: lawnSpot, h: 0.2 };
    if (!S.wade) return { k: 2, t: 'Tap the <b>red food cart</b> (the one that says ISSO WADE). She’ll walk over and buy some prawn wade.', obj: cart };
    if (S.reel === 0 && !S.asked) return { k: 3, t: 'The wade is now in your bag (<b>top right</b> of the screen). Next, <b>tap the boy</b> sitting on the sea wall.', obj: kid };
    if (S.reel === 0 && !turned) return { k: 4, t: 'His reel rolled <b>behind the food cart</b>, where you can’t see it. Tap the <b>turn button ⟲</b> at the bottom right (or swipe sideways) to look from another side.', btn: 'camL' };
    if (S.reel === 0) return { k: 5, t: 'There it is, glowing behind the cart! <b>Tap the reel</b> to pick it up. You can tap things from far away.', obj: reel };
    if (S.reel === 1) return { k: 6, t: '<b>Tap the boy</b> again to give him back his reel.', obj: kid };
    if (!S.crossing && S.player !== 'FAR') return { k: 7, t: 'His dad’s green tuk-tuk is across the road, but the traffic is too busy. <b>Tap the yellow stone</b> by the road. When she stands on it, the traffic stops.', obj: plate, h: 0.2 };
    return { k: 8, t: 'The traffic has stopped. <b>Tap the green tuk-tuk</b> across the road to walk over and hop in.', obj: tuk };
  }
  function coach(t) {
    if (!started) { if (document.getElementById('intro').classList.contains('hide')) started = true; else return; }
    if (Math.abs(cam.azTo - az0) > 0.1) turned = true;
    const st = coachStep(); const key = st ? st.k + st.t : '';
    if (key !== stepKey) { const was = stepKey; stepKey = key; document.querySelectorAll('.coach-pulse').forEach((b) => b.classList.remove('coach-pulse'));
      if (!st) { coachEl.style.display = 'none'; arrow.visible = false; return; }
      coachEl.style.display = 'flex'; coachEl.style.animation = 'none'; void coachEl.offsetWidth; coachEl.style.animation = '';
      coachEl.querySelector('.num').textContent = st.k; coachEl.querySelector('.tx').innerHTML = `<span class="of">Step ${st.k} of 8</span>${st.t}`;
      if (st.btn) { document.getElementById(st.btn).classList.add('coach-pulse'); document.getElementById(st.btn === 'camL' ? 'camR' : 'camL').classList.add('coach-pulse'); }
      if (was) fx().pluck(st.k + 2, { vol: 0.05 }); }
    if (!st) return;
    if (st.btn) { arrow.visible = false; return; }
    let p; if (st.obj) { const b = new THREE.Box3().setFromObject(st.obj); p = new THREE.Vector3((b.min.x + b.max.x) / 2, Math.min(b.max.y, (st.obj === reel ? 0.5 : 3)) + (st.h ?? 0.6), (b.min.z + b.max.z) / 2); if (st.obj === reel) p.copy(reel.position).setY(reel.position.y + 0.9); if (st.obj === plate) p.copy(plate.position).setY(1.0); if (st.obj === kid) p.copy(kid.position).setY(1.9); if (st.obj === cart) p.copy(cart.position).setY(3.0); if (st.obj === tuk) p.copy(tuk.position).setY(2.6); }
    else p = st.at.clone().setY(1.0);
    arrow.visible = !(st.obj && !st.obj.visible); arrow.position.copy(p).add(new THREE.Vector3(0, Math.abs(Math.sin(t * 3)) * 0.35, 0)); arrow.rotation.y = t * 1.5;
  }

  /* ---------- per frame ---------- */
  function tick(dt, t) {
    coach(t);
    foams.forEach((f) => { const k = (t * 0.25 + f.userData.i / 3) % 1; f.position.z = -(5.5 + k * 2.6); f.material.opacity = 0.55 * (1 - k); });
    sea.position.y = Math.sin(t * 0.8) * 0.02;
    skyKites.forEach((s) => { s.k.position.copy(s.base).add(new THREE.Vector3(Math.sin(t * 0.6 + s.ph) * 0.4, Math.sin(t * 0.9 + s.ph) * 0.3, Math.cos(t * 0.5 + s.ph) * 0.3)); s.k.rotation.z = Math.sin(t * 1.3 + s.ph) * 0.25; s.k.userData.tail.rotation.z = Math.sin(t * 3 + s.ph) * 0.4;
      s.ln.geometry.setFromPoints([s.hand, s.k.position]); });
    sways.forEach(({ o, seed }) => (o.rotation.z = Math.sin(t * 0.8 + seed) * 0.04));
    // traffic flows, and waits short of the zebra while the crossing is on
    for (const c of traffic) { const dir = LANES[c.lane][1]; let v = c.v + dir * c.speed * dt;
      if (S.crossing) { const stopAt = dir > 0 ? ZONE[0] - c.g.userData.len / 2 - 0.3 : ZONE[1] + c.g.userData.len / 2 + 0.3; const before = dir > 0 ? c.v <= stopAt + 0.01 : c.v >= stopAt - 0.01; if (before && (dir > 0 ? v > stopAt : v < stopAt)) v = stopAt;
        for (const o of traffic) if (o !== c && o.lane === c.lane) { const gap = (o.v - v) * dir; const need = (o.g.userData.len + c.g.userData.len) / 2 + 0.4; if (gap > 0 && gap < need) v = o.v - dir * need; } }
      if (v > 5.6) v = -5.6; if (v < -5.6) v = 5.6; c.v = v; placeVehicle(c); }
    plateGlow.material.opacity = S.crossing ? 0.12 : 0.3 + Math.sin(t * 3) * 0.2;
    reel.rotation.y = Math.sin(t * 1.4) * 0.3; reel.position.y = S.reel === 0 ? L.REEL_AT[1] + Math.abs(Math.sin(t * 2)) * 0.04 : reel.position.y;
    tukBeacon.visible = S.reel === 2 && !S.won;
    if (S.reel !== 2) kid.userData.head.rotation.y = Math.sin(t * 0.7) * 0.3; else kid.userData.head.rotation.x = -0.4;
    seller.userData.head.rotation.y = Math.sin(t * 0.5) * 0.5;
  }

  return { nodePos, surfaceTarget, onArrive, onResult, tapHidden, actionFor: { cart: () => !S.wade && 'pickup', kid: () => S.reel === 1 && 'place' }, items, unreachable, hintTarget, inventory, focus, tick, afterCamera, MSG, NAMES, busy, sound, surfaceAt };
}
