// Chapter II: Yala. Scene, story beats, hints. Rules live in logic.js (shared with the solver).
import * as L from './logic.js';
import HERO_GLB from './heroine.js';

const PAL = {
  dirt: 0xc8643c, dirtDark: 0xa64f2e, scrub: 0x9aa65a, scrubDark: 0x6f8a46, dry: 0xc9b77a, rock: 0xb9a596, rockDark: 0x8f7d72,
  trunk: 0x8a7458, deadwood: 0xe8e2d6, leaf: 0x5f8f45, leafDark: 0x46723a, water: 0x5fa9a0, lotus: 0xf2a3b8, lily: 0x6f9a52,
  ele: 0x8d8680, eleDark: 0x6f6964, khaki: 0xb59a6a, jeep: 0x5f6b4a, canvas: 0x8f8a6a, dung: 0x5b4632, white: 0xf7f3eb,
};
const svg = (paths) => paths.map((p) => { const [d, c] = p.split('#'); return `<path d="${d}" fill="#${c}"/>`; }).join('');
const ICONS = {
  calf: ['M6 14c0-5 5-8 11-8 6 0 9 4 9 9v8h-3v-4h-3v4h-3v-4h-5v4H9v-5c-2 0-3-2-3-4z#8d8680', 'M6 14c-2 1-3 4-2 7l2-1c-1-2 0-4 1-5z#8d8680'],
  heart: ['M16 27C6 20 3 15 3 10a6 6 0 0113-2 6 6 0 0113 2c0 5-3 10-13 17z#e46a7a'],
  radio: ['M8 10h16v16H8z#4a4a4a', 'M11 13h10v5H11z#9fd3c8', 'M20 4l-6 6#4a4a4a'],
  stone: ['M4 22c2-6 6-9 12-9s10 3 12 9z#b9a596'],
  branch: ['M4 24L26 8l2 3L6 27z#8a6a44', 'M14 17l-4-8 3-1 3 7z#8a6a44', 'M8 8a3 3 0 106 0 3 3 0 00-6 0z#5f8f45'],
  drop: ['M16 4c5 8 9 12 9 17a9 9 0 01-18 0c0-5 4-9 9-17z#5fa9d0'],
  note: ['M7 5h18v22H7z#f4e7c8', 'M10 10h12v1.6H10zM10 14h12v1.6H10zM10 18h8v1.6h-8z#8a6a44'],
};
const SLOTS = [{ id: 'calf', title: 'The calf is with you', svg: svg(ICONS.calf) }, { id: 'branch', title: 'Fallen branches for a ramp', svg: svg(ICONS.branch), count: true }, { id: 'note', title: 'Sighting slips', svg: svg(ICONS.note), count: true }, { id: 'leaf', title: 'Ola-leaf page (secret)', svg: '<rect x="3" y="12" width="26" height="8" rx="2" fill="#d9be8a"/><path d="M6 15h18M6 17.5h14" stroke="#8a6a44" stroke-width="1"/>' }];
const CSS = `body.yala{--sky-top:#bfe0e8;--sky-mid:#f3ead2;--sky-bot:#e9c79a;--accent:#b5643a}
body.yala.dusk{--sky-top:#f0a46a;--sky-mid:#f7cf98;--sky-bot:#c98a6a}
body.yala.won{--sky-top:#3d3463;--sky-mid:#b8698a;--sky-bot:#f0a060}
#compass{position:fixed;right:16px;top:84px;width:64px;height:64px;z-index:6;pointer-events:none;filter:drop-shadow(0 2px 6px rgba(90,60,45,.2))}
#signs{position:fixed;left:16px;bottom:16px;z-index:6;max-width:300px;font-size:12.5px;line-height:1.45;padding:10px 12px;pointer-events:none}
#listen{position:fixed;left:50%;transform:translateX(-50%);bottom:84px;z-index:7;display:none;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;border:0;font:600 14px Nunito Sans,sans-serif;color:var(--ink);background:rgba(255,250,244,.92);box-shadow:0 4px 14px rgba(90,60,45,.18);cursor:pointer}
#listen.on{display:flex}#listen i{display:inline-block;width:5px;margin-left:2px;border-radius:2px;background:#c9b9a8;vertical-align:bottom}#listen i.lit{background:#c8643c}
#signs b{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-soft)}
#notesBtn{display:none;position:fixed;left:12px;bottom:12px;z-index:7;width:46px;height:46px;border-radius:12px;border:0;place-items:center;color:var(--ink);pointer-events:auto}#notesBtn svg{width:22px;height:22px}
@media (max-width:600px), (max-height:500px){#compass{top:auto;bottom:140px;right:12px;width:52px;height:52px}#signs{display:none;left:12px;right:12px;bottom:76px;max-width:none;pointer-events:auto}#signs.open{display:block}#notesBtn{display:grid}#listen{top:auto;bottom:136px;left:12px;transform:none}}`;

export default {
  heroGlb: HERO_GLB, slots: SLOTS, icons: ICONS, logic: L,
  meta: {
    chapter: 'III', saveV: 2, place: 'Yala', title: 'The Lost Calf', tagline: 'A baby elephant has lost its herd.', bodyClass: 'yala', css: CSS,
    intro: 'On the morning drive, the ranger spots a baby elephant’s trail: it has wandered off alone. You’ll know it by the pink freckles on its ears and trunk. Read the signs on the red tracks to find it, bring it safely across the river, then find its family at the waterholes before dark.',
    howto: ['<b>Listen</b> at each crossroads (the Listen button): the louder the calf’s call, the closer you are.', '<b>Read the signs</b> at each crossroads (Tracker’s notes): the calf’s prints are small, round and <b>alone</b>, toes point the way it walked, broken branches show where it pushed through. Where the ground is baked hard there are no prints at all: listen.',
      '<b>Tap the calf</b> to tell it to stay or to follow you. It can do things you can’t.', '<b>Count</b>: the compass shows north. Count tracks from the lone tree, and count elephants.'],
    startLabel: 'The ranger kneels by the track: “Small prints, fresh. A calf, on its own. Follow its trail and watch for the signs at every crossroads.”',
    winTitle: 'Back with the herd', winSub: 'Evening at the waterhole', inviteNode: 'J12', camStart: [3, 1.2, -1], fog: 0xf3e6cc, winDelay: 9000,
  },
  build,
};

function build(E) {
  const { THREE, S, scene, mat, mesh, polar, deg, tag, hash, canvasTex, bubble, sparkle, beacon, halo, label, bell, grind, click, bump, anims, girl, hemi, sun, fill, cam, $ } = E;
  const V3 = (a) => new THREE.Vector3(...a);
  const P = (id) => V3(L.NODES[id]);
  const A2 = V3(L.A2C);
  const items = {};

  /* ---------- builders ---------- */
  function islandBase(c, R, depth, color) { const g = mesh(new THREE.CylinderGeometry(R, R * 0.28, depth, 20, 3, true), mat(color)); g.position.set(c.x, -depth / 2 - 0.42, c.z); scene.add(g);
    const p = g.geometry.attributes.position; for (let i = 0; i < p.count; i++) { if (p.getY(i) < depth / 2 - 0.01) { p.setX(i, p.getX(i) * (0.9 + hash(i, 1, 1) * 0.2)); p.setZ(i, p.getZ(i) * (0.9 + hash(i, 2, 1) * 0.2)); } } g.geometry.computeVertexNormals(); return g; }
  function island(c, R, color = PAL.scrub, kind = 'a1') { const d = mesh(new THREE.CylinderGeometry(R, R, 0.4, 44), mat(color)); d.position.set(c.x, -0.2, c.z); scene.add(d); tag(d, { surface: kind }); islandBase(c, R, 6, PAL.rockDark); return d; }
  function track(a, b, w = 1.0) { const len = a.distanceTo(b); const m = mesh(new THREE.BoxGeometry(w, 0.05, len + w * 0.6), mat(PAL.dirt)); m.position.copy(a).lerp(b, 0.5).setY(0.02); m.lookAt(b.clone().setY(0.02)); scene.add(m); tag(m, { surface: L.areaOf('J00') && a.x > 12 ? 'a2' : 'a1' }); return m; }
  function bush(r, color) { const g = new THREE.Group(); for (let i = 0; i < 3; i++) { const b = mesh(new THREE.IcosahedronGeometry(r * (0.7 + hash(i, r, 3) * 0.4), 0), mat(color || (i % 2 ? PAL.leaf : PAL.leafDark))); b.position.set((hash(i, 1, r) - 0.5) * r, r * 0.6 + i * 0.1, (hash(i, 2, r) - 0.5) * r); g.add(b); } return g; }
  function tree(h = 3, r = 1.2, dead = false) { const g = new THREE.Group(); const t = mesh(new THREE.CylinderGeometry(0.1, 0.18, h, 6), mat(dead ? PAL.deadwood : PAL.trunk)); t.position.y = h / 2; g.add(t);
    if (dead) { for (let i = 0; i < 5; i++) { const br = mesh(new THREE.CylinderGeometry(0.03, 0.07, 1.6, 5), mat(PAL.deadwood)); br.position.set(0, h * (0.55 + i * 0.08), 0); br.rotation.set(0.9 + hash(i, 1, 1) * 0.5, i * 1.3, 0); br.translateY(0.7); g.add(br); } }
    else { const c = mesh(new THREE.IcosahedronGeometry(r, 0), mat(PAL.leaf)); c.scale.y = 0.55; c.position.y = h + 0.2; g.add(c); const c2 = mesh(new THREE.IcosahedronGeometry(r * 0.7, 0), mat(PAL.leafDark)); c2.scale.y = 0.55; c2.position.set(r * 0.5, h - 0.1, r * 0.3); g.add(c2); }
    return g; }
  function boulder(r, color = PAL.rock) { const m = mesh(new THREE.DodecahedronGeometry(r, 1), mat(color)); m.scale.set(1.3, 0.7, 1.0); m.rotation.y = hash(r, 3, 3) * 6; return m; }
  function elephant(s = 1, { tusks = false, tornEar = false, color = PAL.ele, freckles = false } = {}) {
    const g = new THREE.Group(); const m = mat(color), d = mat(PAL.eleDark);
    const body = mesh(new THREE.SphereGeometry(0.75, 14, 10), m); body.scale.set(0.95, 0.85, 1.25); body.position.y = 1.25; g.add(body);
    for (const [x, z] of [[-0.38, 0.55], [0.38, 0.55], [-0.38, -0.55], [0.38, -0.55]]) { const l = mesh(new THREE.CylinderGeometry(0.2, 0.22, 1.0, 8), m); l.position.set(x, 0.5, z); g.add(l); const f = mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 10), d); f.position.set(x, 0.04, z); g.add(f); }
    const head = new THREE.Group(); head.position.set(0, 1.55, 1.0); g.add(head);
    const h = mesh(new THREE.SphereGeometry(0.48, 12, 10), m); h.scale.set(1, 1.05, 0.95); head.add(h);
    for (const sx of [-1, 1]) { const ear = mesh(new THREE.SphereGeometry(0.5, 10, 8), m); ear.scale.set(0.12, 0.85, 0.7); ear.position.set(sx * 0.48, 0.05, -0.15); ear.rotation.y = sx * 0.4; head.add(ear); ear.userData.side = sx; head.userData['ear' + (sx > 0 ? 'R' : 'L')] = ear;
      if (tornEar && sx > 0) { const notch = mesh(new THREE.BoxGeometry(0.2, 0.2, 0.25), mat(0xf3e6cc)); notch.position.set(sx * 0.52, -0.35, -0.3); head.add(notch); notch.visible = false; ear.scale.set(0.12, 0.5, 0.38); ear.position.y = 0.2; ear.position.z = -0.05; const rag = mesh(new THREE.ConeGeometry(0.12, 0.25, 4), mat(color)); rag.position.set(sx * 0.5, -0.12, -0.15); rag.rotation.x = Math.PI; head.add(rag); } }
    const trunk = new THREE.Group(); trunk.position.set(0, -0.15, 0.4); head.add(trunk); g.userData.trunk = trunk;
    const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.4, 0.2), new THREE.Vector3(0, -0.85, 0.25), new THREE.Vector3(0, -1.15, 0.12)];
    trunk.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.13, 7), m));
    for (const sx of [-1, 1]) { const eye = mesh(new THREE.SphereGeometry(0.05, 6, 5), mat(0x2a211d)); eye.position.set(sx * 0.3, 0.1, 0.36); head.add(eye);
      if (tusks) { const t = mesh(new THREE.ConeGeometry(0.06, 0.6, 6), mat(0xf4ecd8)); t.position.set(sx * 0.18, -0.35, 0.45); t.rotation.x = 1.9; head.add(t); } }
    if (freckles) { const pink = mat(0xf0a0b0);
      for (const sx of [-1, 1]) { const ear = head.userData['ear' + (sx > 0 ? 'R' : 'L')]; const pe = mesh(new THREE.SphereGeometry(0.5, 10, 8), pink); pe.scale.set(0.13, 0.62, 0.5); pe.position.copy(ear.position).add(new THREE.Vector3(sx * 0.03, -0.04, -0.02)); pe.rotation.copy(ear.rotation); head.add(pe); }
      const tip = mesh(new THREE.SphereGeometry(0.16, 8, 6), pink); tip.position.set(0, -1.12, 0.14); trunk.add(tip); for (const sx of [-1, 1]) for (let k = 0; k < 7; k++) { const f = mesh(new THREE.SphereGeometry(0.07, 6, 4), pink); f.scale.set(0.5, 1, 1); f.position.set(sx * 0.53, -0.25 + hash(k, sx, 5) * 0.55, -0.4 + hash(k, sx, 6) * 0.5); head.add(f); }
      for (let k = 0; k < 4; k++) { const f = mesh(new THREE.SphereGeometry(0.06, 6, 4), pink); f.position.set((hash(k, 2, 7) - 0.5) * 0.2, -0.95 - k * 0.07, 0.3); trunk.add(f); }
      const face = mesh(new THREE.SphereGeometry(0.2, 8, 6), pink); face.scale.set(1.2, 0.6, 0.4); face.position.set(0, 0.1, 0.38); head.add(face); }
    const tail = mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.6, 4), d); tail.position.set(0, 1.1, -0.95); tail.rotation.x = 0.4; g.add(tail);
    g.scale.setScalar(s); g.userData.head = head; g.userData.phase = Math.random() * 6; elephants.push(g); return g;
  }
  const elephants = [];
  // a shaggy sloth bear: long untidy black coat, long pale snout, white V on the chest, long curved claws
  function bear() { const g = new THREE.Group(); const fur = mat(0x1c1817), fur2 = mat(0x2a2422);
    const b = mesh(new THREE.SphereGeometry(0.55, 12, 9), fur); b.scale.set(0.95, 0.8, 1.35); b.position.y = 0.62; g.add(b);
    for (let i = 0; i < 16; i++) { const a = hash(i, 1, 4) * Math.PI * 2, y = 0.45 + hash(i, 2, 4) * 0.5; const t = mesh(new THREE.ConeGeometry(0.12, 0.34, 4), i % 2 ? fur : fur2); t.position.set(Math.cos(a) * 0.48, y, Math.sin(a) * 0.62); t.lookAt(t.position.clone().multiplyScalar(2)); t.rotateX(Math.PI / 2); g.add(t); }
    const head = new THREE.Group(); head.position.set(0, 0.78, 0.78); g.add(head); g.userData.head = head;
    const h = mesh(new THREE.SphereGeometry(0.3, 10, 8), fur); h.scale.set(1.1, 0.95, 1); head.add(h);
    for (let i = 0; i < 6; i++) { const t = mesh(new THREE.ConeGeometry(0.09, 0.3, 4), fur2); const a = -0.6 + i * 0.25; t.position.set(Math.sin(a) * 0.3, 0.16, -0.05); t.rotation.set(-0.5, 0, a); head.add(t); }
    const sn = mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.42, 8), mat(0xc8b49a)); sn.rotation.x = Math.PI / 2 + 0.25; sn.position.set(0, -0.08, 0.36); head.add(sn);
    const nose = mesh(new THREE.SphereGeometry(0.07, 6, 5), mat(0x2a2020)); nose.position.set(0, -0.14, 0.58); head.add(nose);
    for (const sx of [-1, 1]) { const ear = mesh(new THREE.SphereGeometry(0.08, 6, 5), fur2); ear.position.set(sx * 0.22, 0.26, -0.05); head.add(ear); const eye = mesh(new THREE.SphereGeometry(0.035, 5, 4), mat(0x0a0a0a)); eye.position.set(sx * 0.12, 0.06, 0.25); head.add(eye); }
    for (const sx of [-1, 1]) { const v = mesh(new THREE.BoxGeometry(0.06, 0.34, 0.04), mat(0xf2ead8)); v.position.set(sx * 0.1, 0.72, 1.02); v.rotation.set(-0.5, 0, sx * 0.55); g.add(v); }
    for (const [x, z, front] of [[-0.3, 0.55, 1], [0.3, 0.55, 1], [-0.3, -0.5, 0], [0.3, -0.5, 0]]) { const l = mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.45, 7), fur); l.position.set(x, 0.22, z); g.add(l);
      if (front) for (let k = -1; k <= 1; k++) { const c = mesh(new THREE.ConeGeometry(0.025, 0.2, 4), mat(0xe8dcc4)); c.rotation.x = Math.PI / 2 + 0.4; c.position.set(x + k * 0.05, 0.03, z + 0.16); g.add(c); } }
    return g; }
  // a water buffalo: heavy slate-grey barrel, wide horns sweeping back, caked in mud
  function buffalo() { const g = new THREE.Group(); const hide = mat(0x3a3836), mud = mat(0x7a5a3e);
    const b = mesh(new THREE.CapsuleGeometry(0.5, 0.9, 4, 10), hide); b.rotation.x = Math.PI / 2; b.position.y = 0.95; b.scale.set(1, 1, 0.95); g.add(b);
    const hump = mesh(new THREE.SphereGeometry(0.42, 10, 8), hide); hump.position.set(0, 1.25, 0.35); g.add(hump);
    const caked = mesh(new THREE.CapsuleGeometry(0.51, 0.9, 4, 10, 1), mud); caked.rotation.x = Math.PI / 2; caked.position.y = 0.8; caked.scale.set(1.02, 0.6, 0.97); g.add(caked);
    for (const [x, z] of [[-0.28, 0.55], [0.28, 0.55], [-0.28, -0.55], [0.28, -0.55]]) { const l = mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.62, 6), mud); l.position.set(x, 0.31, z); g.add(l); }
    const head = new THREE.Group(); head.position.set(0, 0.95, 1.05); head.rotation.x = 0.5; g.add(head); g.userData.head = head;
    const h = mesh(new THREE.BoxGeometry(0.42, 0.42, 0.62), hide); head.add(h); const muz = mesh(new THREE.BoxGeometry(0.34, 0.26, 0.2), mat(0x2a2826)); muz.position.set(0, -0.08, 0.38); head.add(muz);
    for (const sx of [-1, 1]) { const horn = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(sx * 0.15, 0.2, -0.05), new THREE.Vector3(sx * 0.55, 0.3, -0.15), new THREE.Vector3(sx * 0.85, 0.32, -0.5), new THREE.Vector3(sx * 0.75, 0.42, -0.85)]), 10, 0.06, 6), mat(0x8a8274)); head.add(horn);
      const ear = mesh(new THREE.SphereGeometry(0.1, 6, 5), hide); ear.scale.set(1.4, 0.5, 0.8); ear.position.set(sx * 0.3, 0.05, -0.15); head.add(ear); }
    const tail = mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.7, 4), hide); tail.position.set(0, 0.9, -0.95); tail.rotation.x = 0.3; g.add(tail); return g; }
  // a leopard: rosette-spotted gold coat, pale belly, long curling tail
  function leopardModel() { const g = new THREE.Group();
    const coat = canvasTex(128, 128, (x) => { x.fillStyle = '#d99a40'; x.fillRect(0, 0, 128, 128); for (let i = 0; i < 26; i++) { const cx = hash(i, 1, 2) * 128, cy = hash(i, 2, 2) * 128; x.strokeStyle = '#2a1a10'; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, 5 + hash(i, 3, 2) * 2, 0.3, 5.6); x.stroke(); x.fillStyle = '#b8782a'; x.beginPath(); x.arc(cx, cy, 3, 0, 7); x.fill(); } });
    coat.wrapS = coat.wrapT = THREE.RepeatWrapping; coat.repeat.set(2, 1); const lm = new THREE.MeshStandardMaterial({ map: coat, roughness: 0.9 }), pale = mat(0xf0e2c4);
    const b = mesh(new THREE.CapsuleGeometry(0.26, 1.05, 4, 10), lm); b.rotation.z = Math.PI / 2; b.position.y = 0.5; g.add(b);
    const belly = mesh(new THREE.CapsuleGeometry(0.2, 0.8, 4, 8), pale); belly.rotation.z = Math.PI / 2; belly.position.set(0, 0.4, 0); g.add(belly);
    const head = new THREE.Group(); head.position.set(0.85, 0.66, 0); g.add(head); g.userData.head = head;
    const h = mesh(new THREE.SphereGeometry(0.22, 12, 10), lm); h.scale.set(1.05, 0.9, 1); head.add(h); const muz = mesh(new THREE.SphereGeometry(0.11, 8, 6), pale); muz.position.set(0.17, -0.06, 0); head.add(muz);
    const nose = mesh(new THREE.SphereGeometry(0.035, 5, 4), mat(0x8a4a4a)); nose.position.set(0.27, -0.03, 0); head.add(nose);
    for (const sz of [-1, 1]) { const ear = mesh(new THREE.ConeGeometry(0.07, 0.12, 5), lm); ear.position.set(-0.02, 0.2, sz * 0.13); head.add(ear); const eye = mesh(new THREE.SphereGeometry(0.03, 5, 4), mat(0x6a8a3a)); eye.position.set(0.17, 0.07, sz * 0.09); head.add(eye); }
    for (const [x, z] of [[-0.45, -0.13], [-0.45, 0.13], [0.5, -0.13], [0.5, 0.13]]) { const l = mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.42, 6), lm); l.position.set(x, 0.2, z); g.add(l); const pw = mesh(new THREE.SphereGeometry(0.08, 6, 5), lm); pw.scale.y = 0.5; pw.position.set(x + 0.03, 0.02, z); g.add(pw); }
    const tl = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.75, 0.55, 0), new THREE.Vector3(-1.2, 0.35, 0.05), new THREE.Vector3(-1.5, 0.15, 0.15), new THREE.Vector3(-1.6, 0.4, 0.3)]), 12, 0.05, 6), lm); g.add(tl);
    const tip = mesh(new THREE.SphereGeometry(0.06, 6, 5), mat(0x2a1a10)); tip.position.set(-1.6, 0.42, 0.3); g.add(tip); return g; }
  // an Indian peafowl (peacock): royal blue neck and breast, crest, and a great fanned tail of eye-spots
  function peacock() { const g = new THREE.Group(); const blue = mat(0x1f5aa8, { metalness: 0.2, roughness: 0.4 });
    const b = mesh(new THREE.SphereGeometry(0.22, 10, 8), blue); b.scale.set(0.9, 0.9, 1.25); b.position.y = 0.55; g.add(b);
    const neck = mesh(new THREE.CylinderGeometry(0.07, 0.11, 0.42, 8), blue); neck.position.set(0, 0.86, 0.15); neck.rotation.x = -0.3; g.add(neck);
    const head = mesh(new THREE.SphereGeometry(0.09, 8, 6), blue); head.position.set(0, 1.08, 0.24); g.add(head); g.userData.head = head;
    const beak = mesh(new THREE.ConeGeometry(0.025, 0.1, 5), mat(0xd8c8a0)); beak.rotation.x = Math.PI / 2; beak.position.set(0, 1.07, 0.35); g.add(beak);
    for (let i = -2; i <= 2; i++) { const st = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.16, 3), blue); st.position.set(i * 0.025, 1.22, 0.22); st.rotation.z = i * 0.15; g.add(st); const bl = mesh(new THREE.SphereGeometry(0.02, 5, 4), blue); bl.position.set(i * 0.037, 1.3, 0.22); g.add(bl); }
    for (const sx of [-1, 1]) { const w = mesh(new THREE.SphereGeometry(0.16, 8, 6), mat(0xb8956a)); w.scale.set(0.35, 0.8, 1.2); w.position.set(sx * 0.18, 0.58, -0.02); g.add(w); const l = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4), mat(0x8a8070)); l.position.set(sx * 0.08, 0.2, 0); g.add(l); }
    const fanTex = canvasTex(256, 140, (x) => { x.clearRect(0, 0, 256, 140); x.fillStyle = '#2f6a3a'; x.beginPath(); x.moveTo(128, 138); x.arc(128, 138, 126, Math.PI, 0); x.fill();
      for (let r = 0; r < 3; r++) for (let k = 0; k < 9 + r * 3; k++) { const a = Math.PI + (k + 0.5) / (9 + r * 3) * Math.PI, rad = 50 + r * 30; const cx = 128 + Math.cos(a) * rad, cy = 138 + Math.sin(a) * rad;
        x.fillStyle = '#d8b84a'; x.beginPath(); x.ellipse(cx, cy, 9, 11, a + Math.PI / 2, 0, 7); x.fill(); x.fillStyle = '#2a8a8a'; x.beginPath(); x.ellipse(cx, cy, 6, 8, a + Math.PI / 2, 0, 7); x.fill(); x.fillStyle = '#1a2a6a'; x.beginPath(); x.arc(cx, cy, 3.5, 0, 7); x.fill(); } });
    const fan = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.04), new THREE.MeshStandardMaterial({ map: fanTex, transparent: true, side: THREE.DoubleSide, roughness: 0.6, alphaTest: 0.3 })); fan.position.set(0, 0.95, -0.28); fan.rotation.x = -0.25; g.add(fan); g.userData.fan = fan;
    return g; }
  function person(shirt, shorts, hat = true) { const g = new THREE.Group(); const skin = mat(0x8a5a3c);
    const legs = mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.75, 8), mat(shorts)); legs.position.y = 0.38; g.add(legs); const body = mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.6, 8), mat(shirt)); body.position.y = 1.05; g.add(body);
    const head = mesh(new THREE.SphereGeometry(0.17, 10, 8), skin); head.position.y = 1.5; g.add(head); if (hat) { const h = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 12), mat(PAL.khaki)); h.position.y = 1.65; g.add(h); const c = mesh(new THREE.CylinderGeometry(0.17, 0.18, 0.15, 10), mat(PAL.khaki)); c.position.y = 1.72; g.add(c); }
    for (const sx of [-1, 1]) { const a = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6), skin); a.position.set(sx * 0.24, 1.0, 0.05); a.rotation.z = sx * 0.2; g.add(a); } g.userData.head = head; return g; }
  function jeep() { const g = new THREE.Group(); const b = mesh(new THREE.BoxGeometry(1.3, 0.6, 2.6), mat(PAL.jeep)); b.position.y = 0.6; g.add(b);
    const hood = mesh(new THREE.BoxGeometry(1.25, 0.25, 0.8), mat(PAL.jeep)); hood.position.set(0, 0.95, 0.85); g.add(hood);
    for (const z of [-0.2, -0.9]) { const seat = mesh(new THREE.BoxGeometry(1.1, 0.3, 0.45), mat(0x4a3a2a)); seat.position.set(0, 1.05, z); g.add(seat); }
    for (const [x, z] of [[-0.6, 0.4], [0.6, 0.4], [-0.6, -1.25], [0.6, -1.25]]) { const p = mesh(new THREE.BoxGeometry(0.05, 0.9, 0.05), mat(0x333333)); p.position.set(x, 1.35, z); g.add(p); }
    const roof = mesh(new THREE.BoxGeometry(1.3, 0.06, 1.75), mat(PAL.canvas)); roof.position.set(0, 1.82, -0.42); g.add(roof);
    for (const [x, z] of [[-0.68, 0.9], [0.68, 0.9], [-0.68, -0.85], [0.68, -0.85]]) { const w = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12), mat(0x222222)); w.rotation.z = Math.PI / 2; w.position.set(x, 0.3, z); g.add(w); }
    const spare = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.18, 12), mat(0x222222)); spare.rotation.x = Math.PI / 2; spare.position.set(0, 0.75, -1.38); g.add(spare); return g; }
  function print(size, dir, fresh = true) { // a footprint decal: an oval with toe-nails at the front, pointing along dir
    const g = new THREE.Group(); const m = mesh(new THREE.CircleGeometry(size, 14), new THREE.MeshBasicMaterial({ color: fresh ? 0x6a3420 : 0x8e5236, transparent: true, opacity: fresh ? 0.75 : 0.45, depthWrite: false }), { cast: false });
    m.rotation.x = -Math.PI / 2; m.scale.set(1, 1.2, 1); g.add(m);
    for (let i = -1; i <= 1; i++) { const t = mesh(new THREE.CircleGeometry(size * 0.22, 8), new THREE.MeshBasicMaterial({ color: 0x4a2414, transparent: true, opacity: fresh ? 0.8 : 0.4, depthWrite: false }), { cast: false }); t.rotation.x = -Math.PI / 2; t.position.set(i * size * 0.5, 0.002, size * 1.15 - Math.abs(i) * size * 0.15); g.add(t); }
    g.rotation.y = Math.atan2(dir.x, dir.z); g.position.y = 0.055; return g; }
  // other animals' prints: kinds the tracker can tell apart
  function pawPrint(kind, size, dir) { const g = new THREE.Group(); const M = (o) => new THREE.MeshBasicMaterial({ color: 0x5a2a18, transparent: true, opacity: o, depthWrite: false });
    const blob = (r, x, z, sx = 1, sz = 1, o = 0.7) => { const m = mesh(new THREE.CircleGeometry(r, 10), M(o), { cast: false }); m.rotation.x = -Math.PI / 2; m.scale.set(sx, sz, 1); m.position.set(x, 0.002, z); g.add(m); return m; };
    if (kind === 'bear') { blob(size, 0, 0, 1.3, 0.8); for (let i = -2; i <= 2; i++) { blob(size * 0.22, i * size * 0.38, size * 0.95); const c = mesh(new THREE.PlaneGeometry(size * 0.08, size * 0.6), M(0.8), { cast: false }); c.rotation.x = -Math.PI / 2; c.position.set(i * size * 0.4, 0.003, size * 1.45); g.add(c); } }
    else if (kind === 'leo') { blob(size, 0, 0, 1.1, 0.9); for (let i = 0; i < 4; i++) blob(size * 0.3, (i - 1.5) * size * 0.5, size * (1.05 + (i === 1 || i === 2 ? 0.2 : 0))); }
    else if (kind === 'bird') { for (const a of [-0.55, 0, 0.55]) { const t = mesh(new THREE.PlaneGeometry(size * 0.12, size * 1.2), M(0.75), { cast: false }); t.rotation.x = -Math.PI / 2; t.rotation.z = a; t.position.set(Math.sin(a) * size * 0.5, 0.002, Math.cos(a) * size * 0.5); g.add(t); }
      const h = mesh(new THREE.PlaneGeometry(size * 0.1, size * 0.6), M(0.75), { cast: false }); h.rotation.x = -Math.PI / 2; h.position.set(0, 0.002, -size * 0.3); g.add(h); }
    else if (kind === 'hoof') { blob(size * 0.6, -size * 0.32, 0, 0.7, 1.3, 0.45); blob(size * 0.6, size * 0.32, 0, 0.7, 1.3, 0.45); }
    g.rotation.y = Math.atan2(dir.x, dir.z); g.position.y = 0.055; return g; }
  function dung(fresh) { const g = new THREE.Group(); for (let i = 0; i < 4; i++) { const b = mesh(new THREE.SphereGeometry(0.11, 7, 5), mat(fresh ? 0x5b4632 : 0x9a8a6a)); b.position.set((hash(i, 1, 2) - 0.5) * 0.3, 0.08, (hash(i, 2, 2) - 0.5) * 0.3); g.add(b); }
    if (fresh) { g.userData.steam = []; for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false })); s.userData.ph = i / 3; g.add(s); g.userData.steam.push(s); } steamers.push(g); }
    return g; }
  const steamers = [];
  function brokenBranch() { const g = new THREE.Group(); const b = bush(0.45); g.add(b); const twig = mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.8, 5), mat(0xe8d8b8)); twig.position.set(0.1, 0.5, 0.35); twig.rotation.set(1.1, 0, 0.4); g.add(twig);
    const leaves = mesh(new THREE.IcosahedronGeometry(0.15, 0), mat(PAL.leaf)); leaves.position.set(0.2, 0.08, 0.7); g.add(leaves); return g; }

  /* ================= AREA 1: THE RED TRACKS ================= */
  island(new THREE.Vector3(0, 0, 0), 11.2, PAL.scrub, 'a1');
  const ids1 = Object.keys(L.NODES).filter((id) => L.areaOf(id) === 1 && id !== 'R_far');
  for (const e of L.edges({ calf: null })) if (L.areaOf(e.a) === 1 && L.areaOf(e.b) === 1 && e.kind === 'line') track(P(e.a), P(e.b));
  for (const id of ids1) if (id[0] === 'J') { const post = mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.6, 6), mat(0xe8e0cc)); post.position.copy(P(id)).add(new THREE.Vector3(0.62, 0.3, 0.62)); scene.add(post);
    const cap = mesh(new THREE.BoxGeometry(0.28, 0.1, 0.28), mat(0xc8423b)); cap.position.copy(post.position).add(new THREE.Vector3(0, 0.33, 0)); scene.add(cap); }
  // scrub between the tracks
  for (let i = 0; i < 70; i++) { const x = -10 + hash(i, 1, 7) * 20, z = -10 + hash(i, 2, 7) * 20; if (Math.hypot(x, z) > 10.4) continue;
    const nearTrack = (Math.abs(((x + 6) % 4 + 4) % 4) < 0.9 || Math.abs(((x + 6) % 4 + 4) % 4) > 3.1) && Math.abs(z) < 5 || (Math.abs(((z + 4) % 4 + 4) % 4) < 0.9 || Math.abs(((z + 4) % 4 + 4) % 4) > 3.1) && Math.abs(x) < 7;
    const segs = L.edges({}).filter((e) => L.areaOf(e.a) === 1 && L.areaOf(e.b) === 1 && e.kind === 'line'); const dSeg = (A, B) => { const ax = A[0], az = A[2], bx = B[0], bz = B[2]; const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / ((bx - ax) ** 2 + (bz - az) ** 2))); return Math.hypot(x - ax - t * (bx - ax), z - az - t * (bz - az)); };
    if (nearTrack || segs.some((e) => dSeg(L.NODES[e.a], L.NODES[e.b]) < 1.1) || ['G_leo', 'G_peac', 'G_mom', 'G_bear', 'G_buff', 'G_tusk', 'G_calf'].some((id) => Math.hypot(x - L.NODES[id][0], z - L.NODES[id][2]) < 2.6)) continue; const b = i % 9 === 0 ? tree(2.4 + hash(i, 3, 3), 1.0) : bush(0.4 + hash(i, 4, 4) * 0.35); b.position.set(x, 0, z); scene.add(b); }
  for (const [x, z, r] of [[-8.5, 6.5, 1.0], [7.8, -9.5, 0.9], [-4, 9.8, 0.8], [0.5, -9.8, 0.7], [9.8, -5.5, 0.8]]) { const b = boulder(r); b.position.set(x, 0.25, z); scene.add(b); }
  const lone1 = tree(3.4, 0, true); lone1.position.set(-8.4, 0, 1.2); scene.add(lone1);
  // the ranger and his jeep at the start; he drives round to meet you across the river
  const jeepA = jeep(); jeepA.position.copy(P('J02')).add(new THREE.Vector3(-1.6, 0, 1.6)); jeepA.rotation.y = Math.PI * 0.75; scene.add(jeepA);
  const ranger = person(0x6b7a4a, 0x5a4a32); ranger.position.copy(P('J02')).add(new THREE.Vector3(0.9, 0, 0.9)); ranger.rotation.y = -Math.PI * 0.75; scene.add(ranger);

  // ---- the trail: calf prints on the right segments, decoy signs on the wrong ones
  const TRAIL = ['J02', 'J12', 'J11', 'J21', 'J20', 'J30', 'G_calf'];
  const clue = new THREE.Group(); scene.add(clue);
  function prints(a, b, size, n, fresh = true) { const A = P(a), B = P(b), d = B.clone().sub(A).setY(0).normalize(); const side = new THREE.Vector3(-d.z, 0, d.x);
    for (let i = 0; i < n; i++) { const t = 0.18 + i * 0.13; const p = print(size, d, fresh); p.position.add(A.clone().lerp(B, t)).add(side.clone().multiplyScalar((i % 2 ? 1 : -1) * size * 0.9)); p.position.y = 0.055; clue.add(p); } }
  const HARD = [2, 4]; // J11→J21 and J20→J30: baked hard ground, no prints
  for (let k = 0; k < TRAIL.length - 1; k++) { if (!HARD.includes(k)) prints(TRAIL[k], TRAIL[k + 1], 0.16, 3, false);
    const A = P(TRAIL[k]), B = P(TRAIL[k + 1]), d = B.clone().sub(A).setY(0).normalize(); const side = new THREE.Vector3(-d.z, 0, d.x);
    if (k % 2) { const br = brokenBranch(); br.position.copy(A.clone().lerp(B, 0.5)).add(side.clone().multiplyScalar(0.95)); br.rotation.y = Math.atan2(d.x, d.z); clue.add(br); } }
  // decoys: big adult prints, old dry dung, bear prints
  prints('J12', 'J22', 0.3, 4); prints('J22', 'J32', 0.3, 3);
  prints('J21', 'J31', 0.3, 4); prints('J31', 'G_tusk', 0.32, 3);
  function kindPrints(kind, a, b, size, n, t0 = 0.18) { const A = P(a), B = P(b), d = B.clone().sub(A).setY(0).normalize(); const side = new THREE.Vector3(-d.z, 0, d.x);
    for (let i = 0; i < n; i++) { const p = pawPrint(kind, size, d); p.position.add(A.clone().lerp(B, t0 + i * (0.7 / n))).add(side.clone().multiplyScalar((i % 2 ? 1 : -1) * size * 1.1)); p.position.y = 0.055; clue.add(p); } }
  { kindPrints('hoof', 'J11', 'J10', 0.18, 3); kindPrints('hoof', 'J10', 'G_buff', 0.18, 4); }
  // a sloth bear's prints: about calf-sized, but with five toes and long claw marks
  kindPrints('bear', 'J02', 'J01', 0.14, 4); kindPrints('bear', 'J01', 'J00', 0.14, 3); kindPrints('bear', 'J00', 'G_bear', 0.14, 3);
  // a leopard's pug marks: round, four toes, no claws
  kindPrints('leo', 'J01', 'G_leo', 0.13, 5);
  // two other young elephants have wandered too: small prints, alone, just like ours
  prints('J01', 'J00', 0.16, 3, false); prints('J00', 'G_kid', 0.16, 3, false);
  prints('J22', 'J32', 0.16, 3, false); prints('J32', 'G_kid2', 0.16, 3, false); prints('J11', 'J10', 0.16, 2, false); { const br = brokenBranch(); br.position.copy(P('J32').lerp(P('G_kid2'), 0.5)).add(new THREE.Vector3(0.95, 0, 0)); clue.add(br); }
  // a peacock's three-toed prints and a dropped tail feather
  kindPrints('bird', 'J12', 'G_peac', 0.16, 6);
  { const f = new THREE.Group(); const q = mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.9, 3), mat(0xd8c8a0)); q.rotation.z = Math.PI / 2; f.add(q); const eye = mesh(new THREE.CircleGeometry(0.1, 10), mat(0x2a8a8a)); eye.rotation.x = -Math.PI / 2; eye.position.set(0.45, 0.01, 0); f.add(eye);
    const c = mesh(new THREE.CircleGeometry(0.05, 8), mat(0x1a2a6a)); c.rotation.x = -Math.PI / 2; c.position.set(0.45, 0.015, 0); f.add(c); f.position.copy(P('J12').lerp(P('G_peac'), 0.45)).add(new THREE.Vector3(0.4, 0.06, 0)); f.rotation.y = 0.6; clue.add(f); }
  // a calf that is NOT lost: small fresh prints, but with big prints right beside them (its mother)
  prints('J20', 'G_mom', 0.16, 3, false); prints('J20', 'G_mom', 0.3, 4);
  // dead-end residents
  const bearA = bear(); bearA.position.copy(P('G_bear')).add(new THREE.Vector3(-0.6, 0, 0)); bearA.rotation.y = Math.PI / 2; scene.add(bearA); { const tm = mesh(new THREE.ConeGeometry(0.5, 1.4, 6), mat(0xb5643c)); tm.position.copy(P('G_bear')).add(new THREE.Vector3(-1.3, 0.7, 0.6)); scene.add(tm); }
  const buffA = buffalo(); buffA.position.copy(P('G_buff')).add(new THREE.Vector3(0, 0, -0.9)); scene.add(buffA); { const mud = mesh(new THREE.CircleGeometry(1.1, 16), mat(0x6a4a32)); mud.rotation.x = -Math.PI / 2; mud.position.copy(P('G_buff')).add(new THREE.Vector3(0, 0.04, -1)); scene.add(mud); }
  const tusker = elephant(1.0, { tusks: true }); tusker.position.copy(P('G_tusk')).add(new THREE.Vector3(0.9, 0, 0)); tusker.rotation.y = -Math.PI / 2; scene.add(tusker);
  // a leopard draped along the branch of a dead tree; a peacock in a clearing; a mother elephant with her own calf
  const leoTree = tree(3.0, 0, true); leoTree.position.copy(P('G_leo')).add(new THREE.Vector3(-0.9, 0, -0.4)); scene.add(leoTree);
  { const lb = mesh(new THREE.CylinderGeometry(0.1, 0.14, 2.2, 6), mat(PAL.deadwood)); lb.rotation.z = Math.PI / 2 - 0.15; lb.position.copy(P('G_leo')).add(new THREE.Vector3(-0.3, 1.55, -0.4)); scene.add(lb); }
  const leoA = leopardModel(); leoA.position.copy(P('G_leo')).add(new THREE.Vector3(-0.35, 1.55, -0.4)); leoA.rotation.y = Math.PI; scene.add(leoA);
  const peaA = peacock(); peaA.position.copy(P('G_peac')).add(new THREE.Vector3(0, 0, 0.9)); peaA.rotation.y = Math.PI; scene.add(peaA);
  const momA = elephant(1.0); momA.position.copy(P('G_mom')).add(new THREE.Vector3(-0.6, 0, -1.0)); momA.rotation.y = 0.3; scene.add(momA);
  const momCalf = elephant(0.42, { color: 0x9a928b });
  // the other young elephants: one dozing by a fallen log, one dust-bathing; both plain grey, no pink freckles
  const kidA = elephant(0.46, { color: 0x8e8882 }); kidA.position.copy(P('G_kid')).add(new THREE.Vector3(0.2, 0, -0.9)); kidA.rotation.y = 0.6; scene.add(kidA);
  { const log = mesh(new THREE.CylinderGeometry(0.18, 0.2, 1.6, 7), mat(PAL.deadwood)); log.rotation.z = Math.PI / 2; log.rotation.y = 0.4; log.position.copy(P('G_kid')).add(new THREE.Vector3(-0.8, 0.18, -0.6)); scene.add(log); }
  const kidB = elephant(0.4, { color: 0xa09890 }); kidB.position.copy(P('G_kid2')).add(new THREE.Vector3(0, 0, 0.9)); kidB.rotation.y = Math.PI; scene.add(kidB);
  { const dust = mesh(new THREE.CircleGeometry(1.0, 14), mat(0xb8704a)); dust.rotation.x = -Math.PI / 2; dust.position.copy(P('G_kid2')).add(new THREE.Vector3(0, 0.04, 0.9)); scene.add(dust); } momCalf.position.copy(P('G_mom')).add(new THREE.Vector3(0.6, 0, -0.5)); scene.add(momCalf);
  const deadEnd = { G_bear: [bearA, 'A sloth bear, snout-deep in a termite mound! Those prints had five toes and long claw marks: the bear’s, not the calf’s. Back away quietly.'],
    G_buff: [buffA, 'A water buffalo wallowing in old mud. Those split-hoof prints were its. Wrong trail.'],
    G_tusk: [tusker, 'A huge tusker! Those big prints were his, not the calf’s. Back off slowly…'],
    G_leo: [leoA, 'A leopard, draped along a dead branch, watching you with green eyes. Round pug marks, no claws: a cat. Back away slowly…'],
    G_peac: [peaA, 'A peacock fans his tail at you and screams. Three thin toes: bird prints. Not the calf!'],
    G_mom: [momA, 'A mother elephant with her own calf. Those small prints had big ones right beside them: this calf isn’t lost. Ours walked alone.'],
    G_kid: [kidA, 'A young elephant dozing by a log… but its ears are plain grey: no pink freckles. Not ours! Far off, its own herd rumbles. Listen for our calf instead.'],
    G_kid2: [kidB, 'A calf dust-bathing in the red earth. Look closely: no pink freckles on its ears or trunk. Not ours. Its family is just through the trees.'] };
  // every dead end is screened by a thicket: you only see who is there when you walk in
  const thickets = {};
  for (const [id, [animal]] of Object.entries(deadEnd)) { const c = P(id); const junction = L.edges({}).find((e) => e.b === id || e.a === id); const from = P(junction.a === id ? junction.b : junction.a); const into = c.clone().sub(from).setY(0).normalize();
    const grp = new THREE.Group(); scene.add(grp); for (let k = 0; k < 9; k++) { const a = Math.atan2(into.x, into.z) - 1.25 + k * 0.31; const b = bush(0.62 + hash(k, c.x, 2) * 0.2); b.scale.set(1.15, 1.7, 1.15); b.position.copy(c).add(into.clone().multiplyScalar(0.5)).add(new THREE.Vector3(Math.sin(a) * 1.9, 0, Math.cos(a) * 1.9)); grp.add(b); }
    for (let k = 0; k < 4; k++) { const b = bush(0.55); b.scale.set(1.2, 1.9, 1.2); b.position.copy(c).add(into.clone().multiplyScalar(-0.35)).add(new THREE.Vector3(-into.z, 0, into.x).multiplyScalar((k < 2 ? -1 : 1) * (0.95 + (k % 2) * 0.5))); grp.add(b); }
    thickets[id] = grp; animal.visible = false; }
  [momCalf].forEach((a) => (a.visible = false));
  // fallen branches (one at each wrong turn) for the ramp out of the gully
  const branches = []; [['G_bear', -0.2, 1.0], ['G_buff', 1.0, 0.2], ['G_tusk', -0.2, 1.1]].forEach(([id, dx, dz], i) => {
    const b = new THREE.Group(); const st = mesh(new THREE.CylinderGeometry(0.07, 0.1, 1.5, 6), mat(0x9a7a54)); st.rotation.z = Math.PI / 2; st.position.y = 0.1; b.add(st);
    for (let k = 0; k < 3; k++) { const tw = mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.5, 5), mat(0x9a7a54)); tw.position.set(-0.5 + k * 0.45, 0.25, 0); tw.rotation.z = 0.8; b.add(tw); const lf = mesh(new THREE.IcosahedronGeometry(0.16, 0), mat(PAL.leaf)); lf.position.set(-0.35 + k * 0.45, 0.45, 0); b.add(lf); }
    // lie on the track just outside the thicket, so they can be seen from anywhere
    { const jn = L.edges({}).find((e) => e.a === id || e.b === id); const from = P(jn.a === id ? jn.b : jn.a); const into = P(id).sub(from).setY(0).normalize(); const side = new THREE.Vector3(-into.z, 0, into.x);
      b.position.copy(P(id)).addScaledVector(into, -2.2).addScaledVector(side, 0.3); b.rotation.y = Math.atan2(into.x, into.z) + Math.PI / 2 + 0.3; } scene.add(b); halo(b, 0xffe2a0, 0.55, 0.8).position.y = 0.04; { const hit = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 0.3; b.add(hit); } tag(b, { hidden: 'b' + i }); branches.push(b); });
  // the rock pool where the calf drinks
  const rockPool = new THREE.Group(); rockPool.position.copy(P('G_pool')).add(new THREE.Vector3(0, 0, 1.3)); scene.add(rockPool);
  { const w = new THREE.Mesh(new THREE.CircleGeometry(1.1, 20), new THREE.MeshStandardMaterial({ color: PAL.water, roughness: 0.2 })); w.rotation.x = -Math.PI / 2; w.position.y = 0.05; rockPool.add(w);
    for (let i = 0; i < 6; i++) { if (i === 3) continue; const r = boulder(0.45, PAL.rock); r.position.copy(polar(1.25, i * 1.05 + 0.5, 0.15)); rockPool.add(r); }
    for (let i = 0; i < 4; i++) { const pad = mesh(new THREE.CircleGeometry(0.17, 10), mat(PAL.lily), { cast: false }); pad.rotation.x = -Math.PI / 2; pad.position.copy(polar(0.5 + i * 0.12, i * 1.6, 0.07)); rockPool.add(pad); } }
  tag(rockPool, { item: 'pool' }); items.pool = rockPool;
  { const a = P('J22'), b = P('G_pool'); const len = a.distanceTo(b); const m = mesh(new THREE.BoxGeometry(1.0, 0.05, len + 0.6), mat(PAL.dirt)); m.position.copy(a).lerp(b, 0.5).setY(0.02); m.lookAt(b.clone().setY(0.02)); scene.add(m); tag(m, { surface: 'a1' }); }
  // the calf, stuck in a dry gully at the end of the trail
  const ramp = new THREE.Group(); ramp.position.copy(P('G_calf')).add(new THREE.Vector3(0, -0.05, -0.55)); ramp.visible = false; scene.add(ramp);
  for (let k = 0; k < 3; k++) { const st = mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.4, 6), mat(0x9a7a54)); st.rotation.x = Math.PI / 2 - 0.35; st.position.set(-0.3 + k * 0.3, 0.0, -0.3); ramp.add(st); }
  const gully = mesh(new THREE.CylinderGeometry(1.4, 1.1, 0.3, 12), mat(0x9a5a3a)); gully.position.copy(P('G_calf')).add(new THREE.Vector3(0, -0.12, -1.0)); scene.add(gully);
  const calf = elephant(0.42, { color: 0x9a928b, freckles: true }); calf.position.copy(P('G_calf')).add(new THREE.Vector3(0, -0.1, -1.0)); scene.add(calf);
  { const hit = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 0.9; calf.add(hit); hit.scale.setScalar(1 / 0.42 * 0.6); }
  tag(calf, { item: 'calfFind' }); items.calfFind = calf; items.calf = calf; calf.visible = false; let calfSeen = false;
  const calfThicket = new THREE.Group(); scene.add(calfThicket);
  { const c = P('G_calf'), from = P('J30'), into = c.clone().sub(from).setY(0).normalize(); for (let k = 0; k < 9; k++) { const a = Math.atan2(into.x, into.z) - 1.25 + k * 0.31; const b = bush(0.62 + hash(k, 3, 2) * 0.2); b.scale.set(1.15, 1.7, 1.15); b.position.copy(c).add(into.clone().multiplyScalar(0.3)).add(new THREE.Vector3(Math.sin(a) * 2.1, 0, Math.cos(a) * 2.1)); calfThicket.add(b); } }
  // the river, the old bridge and its lever stone
  const river = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 26), new THREE.MeshStandardMaterial({ color: PAL.water, transparent: true, opacity: 0.85, roughness: 0.2 })); river.rotation.x = -Math.PI / 2; river.position.set(11.8, -0.55, 4); scene.add(river);
  island(P('R_far').add(new THREE.Vector3(1.6, 0, 0)), 2.6, PAL.scrub, 'a1');
  const levers = {}; for (const node of ['B_bank', 'R_far']) { const lv = new THREE.Group(); lv.position.copy(P(node)).setY(0.02); scene.add(lv); levers[node] = lv;
    const st = mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.16, 12), mat(PAL.rock)); st.position.y = 0.06; lv.add(st); lv.userData.st = st; const g = halo(lv, 0xffe2a0, 0.85, 1.05); g.position.y = 0.16; tag(st, { surface: 'a1' }); }
  const lever = levers.B_bank;
  const bridgePivot = new THREE.Group(); bridgePivot.position.copy(P('B_bank')).add(new THREE.Vector3(0.8, 0, 0)).setY(0.0); scene.add(bridgePivot);
  const bridge = new THREE.Group(); bridgePivot.add(bridge);
  { const len = P('R_far').x - P('B_bank').x - 1.0; for (let i = 0; i < 9; i++) { const pl = mesh(new THREE.BoxGeometry(len / 9 - 0.04, 0.08, 1.2), mat(0x8a6a44)); pl.position.set((i + 0.5) * len / 9, 0, 0); bridge.add(pl); tag(pl, { surface: 'a1' }); }
    for (const z of [-0.6, 0.6]) { const r = mesh(new THREE.BoxGeometry(len, 0.06, 0.06), mat(0x6e4a30)); r.position.set(len / 2, 0.45, z); bridge.add(r); } }
  const BR_UP = 1.25, BR_DOWN = 0; bridgePivot.rotation.z = BR_UP; // raised like a drawbridge
  const jeepB = jeep(); jeepB.position.copy(P('R_far')).add(new THREE.Vector3(1.6, 0, 0.2)); jeepB.rotation.y = Math.PI; scene.add(jeepB);
  const ranger2 = person(0x6b7a4a, 0x5a4a32); ranger2.position.copy(P('R_far')).add(new THREE.Vector3(1.0, 0, -1.4)); scene.add(ranger2);
  { const hit = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2, 3), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 1; jeepB.add(hit); } tag(jeepB, { surface: 'jeep' });
  const jeepBeacon = beacon(0xffd27a, 2.6); jeepB.add(jeepBeacon);
  // the dirt road from the far bank to the waterhole plain
  const roadA = P('R_far').add(new THREE.Vector3(2.6, 0, 0)), roadB = P('D').add(new THREE.Vector3(0, 0, 2.2));
  { const len = roadA.distanceTo(roadB); const rd = mesh(new THREE.BoxGeometry(1.8, 0.35, len), mat(PAL.dirt)); rd.position.copy(roadA).lerp(roadB, 0.5).add(new THREE.Vector3(0, -0.2, 0)); rd.lookAt(roadB.clone().add(new THREE.Vector3(0, -0.2, 0))); scene.add(rd);
    const under = mesh(new THREE.BoxGeometry(1.5, 1.2, len - 1), mat(PAL.rockDark)); under.position.copy(rd.position).add(new THREE.Vector3(0, -0.75, 0)); under.quaternion.copy(rd.quaternion); scene.add(under); }

  /* ================= AREA 2: THE WATERHOLES ================= */
  island(A2, 12.6, PAL.dry, 'a2');
  for (const e of L.edges({ calf: null })) if (L.areaOf(e.a) === 2 && L.areaOf(e.b) === 2) { if (e.via) { let prev = P(e.a); for (const v of [...e.via.map(V3), P(e.b)]) { track(prev, v, 0.9); prev = v; } } else track(P(e.a), P(e.b), 0.9); }
  for (const m of scene.children) if (m.userData.surface === 'a1' && m.position.x > 13) m.userData.surface = 'a2';
  // the lone tree with a compass rose at its foot
  const lone = tree(4.2, 0, true); lone.position.copy(P('T')).add(new THREE.Vector3(0.9, 0, 0.9)); scene.add(lone);
  { const tex = canvasTex(256, 256, (x) => { x.translate(128, 128); x.fillStyle = 'rgba(255,248,232,.85)'; x.beginPath(); x.arc(0, 0, 120, 0, 7); x.fill(); x.strokeStyle = '#8a6a44'; x.lineWidth = 4; x.stroke();
      x.fillStyle = '#c8423b'; x.beginPath(); x.moveTo(0, -105); x.lineTo(18, 0); x.lineTo(-18, 0); x.fill(); x.fillStyle = '#6b5a4a'; x.beginPath(); x.moveTo(0, 105); x.lineTo(18, 0); x.lineTo(-18, 0); x.fill();
      x.beginPath(); x.moveTo(-105, 0); x.lineTo(0, 14); x.lineTo(0, -14); x.fill(); x.beginPath(); x.moveTo(105, 0); x.lineTo(0, 14); x.lineTo(0, -14); x.fill();
      x.font = 'bold 34px Nunito Sans, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#c8423b'; x.fillText('N', 0, -80); x.fillStyle = '#4a3b35'; x.fillText('E', 82, 0); x.fillText('S', 0, 82); x.fillText('W', -82, 0); });
    const rose = new THREE.Mesh(new THREE.CircleGeometry(1.0, 32), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })); rose.rotation.x = -Math.PI / 2; rose.position.copy(P('T')).setY(0.07); scene.add(rose); }
  // track counters: a small numbered post at every crossroads on the plain (1, 2, 3 tracks from the tree)
  for (const id of Object.keys(L.NODES)) if (L.areaOf(id) === 2 && /^(N\d|E\d\d|W\d\d)$/.test(id)) { const post = mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.5, 6), mat(0xe8e0cc)); post.position.copy(P(id)).add(new THREE.Vector3(0.55, 0.25, 0.55)); scene.add(post); }
  // three waterholes with three herds
  const herds = {};
  function waterhole(id, herdKey, members, { hiddenCalf = false } = {}) {
    const c = P(id); const dir = c.clone().sub(A2).setY(0).normalize(); const pc = c.clone().add(dir.clone().multiplyScalar(1.4));
    const pool = new THREE.Mesh(new THREE.CircleGeometry(1.5, 24), new THREE.MeshStandardMaterial({ color: PAL.water, roughness: 0.2 })); pool.rotation.x = -Math.PI / 2; pool.position.copy(pc).setY(0.03); scene.add(pool);
    for (let i = 0; i < 9; i++) { const pad = mesh(new THREE.CircleGeometry(0.22, 10), mat(PAL.lily), { cast: false }); pad.rotation.x = -Math.PI / 2; pad.position.copy(pc).add(polar(0.6 + hash(i, 3, id.length) * 1.1, i * 0.7, 0.04)); scene.add(pad);
      if (i % 3 === 0) { const fl = mesh(new THREE.ConeGeometry(0.08, 0.14, 6), mat(PAL.lotus)); fl.position.copy(pad.position).setY(0.1); scene.add(fl); } }
    for (let i = 0; i < 3; i++) { const b = boulder(0.6 + hash(i, 5, id.length) * 0.5); b.position.copy(pc).add(polar(2.3, Math.atan2(dir.x, dir.z) + Math.PI / 2 + i * 0.9 - 0.9, 0.2)); scene.add(b); }
    const g = new THREE.Group(); scene.add(g); const out = [];
    // adults stand in two staggered rows behind the water; the little ones drink at the near edge, where nothing hides them
    const base = Math.atan2(dir.x, dir.z), adults = members.filter(([sz]) => sz >= 0.7), young = members.filter(([sz]) => sz < 0.7);
    const put = (e, a, r) => { e.position.copy(pc).add(polar(r, a, 0)); e.rotation.y = a + Math.PI; g.add(e); out.push(e);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 1.2; e.add(hit); };
    adults.forEach(([sz, opts], j) => put(elephant(sz, opts), base + (j - (adults.length - 1) / 2) * 0.42, 2.1 + (j % 2) * 0.9));
    const front = hiddenCalf ? young.slice(0, -1) : young;
    front.forEach(([sz, opts], k) => put(elephant(sz, opts), base + Math.PI + (k - (front.length - 1) / 2) * 1.1 + (front.length === 1 ? 0.55 : 0), 1.65));
    if (hiddenCalf) { // the second little one is tucked in behind a boulder at the end of the line: turn the view to spot it
      const [sz, opts] = young[young.length - 1], a = base + ((adults.length - 1) / 2) * 0.42 + 0.62; const e = elephant(sz, opts); put(e, a, 3.1);
      const rock = boulder(0.95); rock.scale.set(1.3, 1.15, 1.0); rock.position.copy(e.position).add(pc.clone().sub(e.position).setY(0).normalize().multiplyScalar(1.05)).setY(0.35); scene.add(rock); }
    tag(g, { item: herdKey }); items[herdKey] = g; herds[herdKey] = { g, out, pc };
  }
  // the description: north-east of the lone tree, seven elephants, two little ones, a matriarch with a torn left ear. Only herd1 fits all four.
  waterhole('H1', 'herd1', [[1.0, { tornEar: true }], [0.95, {}], [0.9, {}], [0.42, {}], [1.0, {}], [0.85, {}], [0.4, {}]], { hiddenCalf: true }); // NNE: the one (a calf hides behind a rock)
  waterhole('H2', 'herd2', [[1.0, {}], [0.95, {}], [0.42, {}], [0.9, {}], [1.0, {}], [0.85, {}], [0.4, {}]]);                        // ENE: seven, two little ones, but both ears whole
  waterhole('H3', 'herd3', [[1.0, { tornEar: true }], [0.9, {}], [0.42, {}], [0.95, {}], [0.4, {}]]);                                // west: torn ear, two little ones, but only five
  waterhole('H4', 'herd4', [[1.0, { tornEar: true }], [0.95, {}], [0.9, {}], [0.42, {}], [1.0, {}], [0.85, {}], [0.4, {}]]);         // north-north-west: everything matches except the direction
  waterhole('H5', 'herd5', [[1.0, { tornEar: true }], [0.95, {}], [0.9, {}], [1.0, {}], [0.85, {}], [0.95, {}], [0.42, {}]]);       // east: seven, torn ear, but one little one
  // the safari camp: canvas tents with lanterns (a secret ola leaf in one)
  const tents = [];
  for (const [dx, dz, r] of [[-1.4, 0.4, 0.3], [0.6, 1.4, -0.4]]) { const t = new THREE.Group(); t.position.copy(P('CAMP')).add(new THREE.Vector3(dx, 0, dz)); t.rotation.y = r; scene.add(t);
    const body = mesh(new THREE.CylinderGeometry(0.01, 1.1, 1.4, 4, 1), mat(0x7f7a5a)); body.rotation.y = Math.PI / 4; body.scale.set(1.2, 1, 1); body.position.y = 0.7; t.add(body);
    const fly = mesh(new THREE.BoxGeometry(2.2, 0.05, 2.0), mat(0x3a6ea5)); fly.position.y = 1.55; fly.rotation.z = 0.08; t.add(fly);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: 0x8a6a40 })); lamp.position.set(0, 0.9, 0.95); t.add(lamp); const pl = new THREE.PointLight(0xffb35a, 0, 4); pl.position.copy(lamp.position); t.add(pl); tents.push([lamp, pl]); }
  const leaf = mesh(new THREE.BoxGeometry(0.5, 0.04, 0.14), mat(0xd9be8a)); leaf.position.copy(P('CAMP')).add(new THREE.Vector3(-1.4, 0.06, 1.35)); scene.add(leaf);
  { const hit = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); leaf.add(hit); } tag(leaf, { hidden: 'leaf' });
  // the rangers' sighting slips: the rest of the herd's description
  const NOTE_TEXT = ['“Seven of them at the waterhole.”', '“Two little ones with them.”', '“The matriarch’s <b>left ear is torn</b>.”'];
  const notes = []; [[P('CAMP').add(new THREE.Vector3(0.5, 0.95, -0.7)), 0.4], [P('T').add(new THREE.Vector3(-0.7, 0.75, 0.9)), -0.3], [P('NWJ').add(new THREE.Vector3(0.55, 0.52, 0.55)), 0.8]].forEach(([p, r], i) => {
    const n = mesh(new THREE.BoxGeometry(0.42, 0.02, 0.3), mat(0xf4e7c8)); n.position.copy(p); n.rotation.set(-0.4, r, 0.1); scene.add(n);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); n.add(hit); halo(n, 0xfff0b0, 0.25, 0.4).position.y = -0.02; tag(n, { hidden: 'n' + i }); notes.push(n); });
  { const tbl = mesh(new THREE.BoxGeometry(1.0, 0.06, 0.7), mat(0x8a6a44)); tbl.position.copy(P('CAMP')).add(new THREE.Vector3(0.5, 0.88, -0.7)); scene.add(tbl); const leg = mesh(new THREE.BoxGeometry(0.08, 0.86, 0.08), mat(0x6e4a30)); leg.position.copy(tbl.position).add(new THREE.Vector3(0, -0.43, 0)); scene.add(leg); }
  // granite outcrop with a leopard on top (revealed at sunset), trees, bee-eaters, scrub
  const leoRock = boulder(1.6, 0xc4ab98); leoRock.scale.set(1.3, 1.1, 1.1); leoRock.position.copy(A2).add(new THREE.Vector3(4.6, 0.9, 7.4)); scene.add(leoRock); // out on the open south side, clear of the waterholes
  const leopard = new THREE.Group(); leopard.position.copy(leoRock.position).add(new THREE.Vector3(0, 1.35, 0)); leopard.scale.setScalar(0.001); scene.add(leopard); leopard.add(leopardModel());

  for (let i = 0; i < 26; i++) { const a = hash(i, 4, 9) * Math.PI * 2, r = 6.5 + hash(i, 5, 9) * 5.4; const p = A2.clone().add(polar(r, a, 0));
    if ([...Object.values(herds)].some((h) => h.pc.distanceTo(p) < 3.6) || p.distanceTo(P('CAMP')) < 2.6 || p.distanceTo(leoRock.position) < 3.2) continue;
    const t = i % 4 === 0 ? tree(2.8, 1.2) : bush(0.5); t.position.copy(p).setY(0); scene.add(t); }
  { const twig = mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 5), mat(PAL.trunk)); twig.rotation.z = Math.PI / 2; twig.position.copy(P('N1')).add(new THREE.Vector3(-1.8, 1.6, 0.4)); scene.add(twig);
    for (let i = 0; i < 2; i++) { const bird = new THREE.Group(); const b = mesh(new THREE.SphereGeometry(0.1, 8, 6), mat(0x4fb06a)); b.scale.set(1, 1, 1.6); bird.add(b); const t = mesh(new THREE.BoxGeometry(0.03, 0.02, 0.35), mat(0x2f8a5a)); t.position.z = -0.25; bird.add(t);
      bird.position.copy(twig.position).add(new THREE.Vector3(-0.3 + i * 0.5, 0.12, 0)); bird.rotation.y = 1.2; scene.add(bird); } }

  /* ================= COMPANION: THE CALF ================= */
  const trailPts = []; // breadcrumbs of where she walked: the calf follows a little behind
  const calfState = { pos: calf.position.clone(), face: 0, mode: 'stuck', wade: null };
  // HUD: compass and the tracker's notes
  document.body.insertAdjacentHTML('beforeend', `<svg id="compass" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="rgba(255,250,244,.88)" stroke="rgba(122,96,82,.3)"/><g id="needle"><path d="M32 8l6 24h-12z" fill="#c8423b"/><path d="M32 56l6-24h-12z" fill="#7b6a61"/><text x="32" y="20" font-size="9" font-weight="700" text-anchor="middle" fill="#fff" font-family="Nunito Sans,sans-serif">N</text></g></svg>
    <button id="listen"><svg width="18" height="18" viewBox="0 0 32 32"><path d="M16 4a9 9 0 00-9 9c0 4 3 5 3 8s2 6 6 6 4-3 4-3l-2-1s-1 2-2 2-3-2-3-4 4-4 4-8a2 2 0 00-4 0" fill="#c8643c"/></svg>Listen <span><i style="height:6px"></i><i style="height:10px"></i><i style="height:14px"></i></span></button>
    <button id="notesBtn" class="card" aria-label="Tracker's notes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg></button><div id="signs" class="card"><b>Tracker's notes</b><br>Elephant: round prints, toenails at the front (toes point the way it walked).<br>Our calf: <b>small prints, alone</b>, and <b>pink freckles on its ears and trunk</b>. Other young elephants wander too: check before you bring one home. Small beside big = a calf with its mother.<br>Five toes + long claws = sloth bear. Round, four toes, no claws = leopard.<br>Three thin toes = bird. Split hoof = buffalo.<br>Broken branches = something pushed through. No prints on hard ground: listen.<br>Fallen branches for the ramp: tap them wherever you see them.</div>`);

  /* ================= VIEW SYNC & STORY ================= */
  const nodePos = (id) => P(id);
  function surfaceTarget(kind, point) {
    if (kind === 'jeep') { if (L.areaOf(S.player) === 2) { if (S.calf !== 'follow') window.__game.interactAt('calf'); return null; } if (S.player !== 'R_far') return 'R_far'; if (!S.drank) { label('“The calf is too weak for the walk. It needs a drink first, back at the rock pool.”', 4200); bubble(ranger2, 'drop', { offset: 2.1 }); E.bump(); return null; } if (S.calf !== 'follow') { label('“Bring the calf! We can’t leave it here on its own.” Tap the calf to call it.', 4200); bubble(ranger2, 'calf', { offset: 2.1 }); E.bump(); return null; } return 'D'; }
    const ids = Object.keys(L.NODES).filter((id) => (kind === 'a2' ? L.areaOf(id) === 2 : L.areaOf(id) === 1));
    let best = null, bd = 1e9; for (const id of ids) { const n = P(id); const d = Math.hypot(n.x - point.x, n.z - point.z); if (d < bd) { bd = d; best = id; } }
    // a tap just outside her crossroads, along one of the trails (on its prints, say): set off down that trail
    if (best === S.player && bd > 0.3) { const here = P(S.player), dx = point.x - here.x, dz = point.z - here.z, dl = Math.hypot(dx, dz);
      let pick = null, pc = Math.cos(0.6); for (const { to } of L.adjacency(S).get(S.player) || []) { const n = P(to), nx = n.x - here.x, nz = n.z - here.z, c = (dx * nx + dz * nz) / (dl * Math.hypot(nx, nz) || 1); if (c > pc) { pc = c; pick = to; } }
      if (pick) return pick; }
    return best;
  }
  function edgePoints(e, from, to) {
    if (e.kind === 'bridge') { const a = P(from), b = P(to); const out = []; for (let i = 1; i <= 12; i++) { const p = a.clone().lerp(b, i / 12); p.y = 0.1; out.push(p); } return out; }
    if (e.kind === 'jeep') { const out = []; const path = from === 'R_far' ? [roadA, roadB, P(to)] : [roadB, roadA, P(to)]; let prev = P(from); for (const q of path) { const n = Math.max(2, Math.round(prev.distanceTo(q) / 0.5)); for (let k = 1; k <= n; k++) out.push(prev.clone().lerp(q, k / n)); prev = q; } return out; }
    return null;
  }
  let riding = false;
  /* ---------- sound ---------- */
  function animalCall(node) { if (!E.AC) return; const A = E.audio, b = { bus: 'sfx', far: 0.35 };
    if (node === 'G_bear') for (let i = 0; i < 3; i++) { A.hiss(A.now(i * 0.35), 0.22, { ...b, type: 'lowpass', color: 'brown', f: 320, vol: 0.12 }); A.osc('sawtooth', 85, A.now(i * 0.35), 0.2, { ...b, to: 70, vol: 0.02, lp: 300 }); }
    else if (node === 'G_buff') A.osc('sawtooth', 112, A.now(), 1.3, { ...b, to: 92, vol: 0.03, lp: 420, a: 0.2, vib: [4, 3] });
    else if (node === 'G_leo') for (let i = 0; i < 4; i++) { A.hiss(A.now(i * 0.42), 0.25, { ...b, type: 'lowpass', color: 'brown', f: 420, vol: 0.12, a: 0.08 }); A.osc('sawtooth', 75, A.now(i * 0.42), 0.25, { ...b, vol: 0.016, lp: 260, a: 0.08 }); }
    else if (node === 'G_peac') A.bird('peacock', { ...b, vol: 2.2, pan: 0 });
    else if (node === 'G_tusk' || node === 'G_mom') { A.elephant('snort', { vol: 1.1, far: 0.3 }); A.elephant('trumpet', { vol: 1.2, far: 0.35, delay: 0.45 }); A.elephant('rumble', { vol: 1.1, far: 0.35, delay: 1.8 }); if (node === 'G_mom') setTimeout(() => A.bird('calf', { ...b, vol: 1.2 }), 1400); }
    else A.bird('calf', { ...b, vol: 1.2, pan: 0 }); }
  let sunset = false;
  function sound(A) { // morning on the red tracks: cicadas, birds, far peacocks and elephants; golden hour at the waterholes
    A.loop({ color: 'pink', f: 450, q: 0.45, vol: 0.022, lfo: [0.05, 0.4] });
    const pools = A.loop({ color: 'pink', f: 700, q: 1.1, vol: 0, lfo: [0.3, 0.55] });
    const area = () => L.areaOf(S.player);
    A.every([6, 14], () => A.bird('cicada', { far: 0.5 }), 3);
    A.every([2.5, 7], () => !sunset && A.bird('chirp'), 1.5);
    A.every([5, 12], () => !sunset && A.bird('bulbul'), 4);
    A.every([25, 45], () => A.bird('peacock', { far: 0.8, vol: 0.7 }), 12);
    A.every([30, 55], () => A.bird('elephant', { far: 0.9, vol: 0.6 }), 20);
    A.every([16, 30], () => calfState.mode === 'follow' && A.bird('calf', { far: 0.2, vol: 0.5 }), 10);
    A.every([1, 2.5], () => sunset && A.bird('cricket', { far: 0.4 }));
    A.every([2, 4.5], () => area() === 2 && A.sfx.plip({ vol: 0.012, bus: 'amb', far: 0.5, pan: A.rnd(-0.6, 0.6) }));
    return { update() { pools.to(area() === 2 ? 0.014 : 0); } };
  }
  function surfaceAt(pos, cur) { const e = cur && cur.e; if (e && e.kind === 'bridge') return 'wood'; return 'sand'; }
  function onEdgeStart(e) { if (e.kind === 'jeep') { riding = true; E.audio.ctx && E.audio.motor({ f: 52, f2: 60, rate: 13, dur: 7, vol: 0.05, attack: 0.8, release: 1.6, lp: 520, bus: 'sfx', far: 0.1, depth: 0.35 }); label('“Hold on!” The ranger drives you to the waterhole plain, the calf trotting behind.', 4200); } }
  function onArrive(node, e, stop) {
    if (e && e.kind === 'jeep') { riding = false; if (node === 'D') setTimeout(() => { bubble(girl, 'radio', { offset: 2.1 }); label('📻 “Ranger post here. The calf’s herd went <b>north-east of the lone tree</b>. <b>Seven</b> of them, with <b>two little ones</b>. Over.”', 9000); }, 700); }
    if (deadEnd[node]) { const [animal, msg] = deadEnd[node]; if (!animal.visible) { animal.visible = true; const th = thickets[node]; if (th) th.children.forEach((b) => { const s0 = b.scale.clone(); anims.push({ t: 0, dur: 0.8, f: (k) => b.scale.set(s0.x * (1 - 0.55 * k), s0.y * (1 - 0.7 * k), s0.z * (1 - 0.55 * k)) }); }); if (node === 'G_mom') momCalf.visible = true; const s0 = animal.scale.x; anims.push({ t: 0, dur: 0.5, f: (k) => animal.scale.setScalar(s0 * (0.6 + 0.4 * k)) }); }
      if (stop) { label(msg, 5200); animal.userData.alarm = 1.5; animalCall(node); } }
    if (node === 'G_calf' && !calfSeen) { calfSeen = true; calf.visible = true; calfThicket.children.forEach((b) => { const s0 = b.scale.clone(); anims.push({ t: 0, dur: 0.8, f: (k) => b.scale.set(s0.x * (1 - 0.55 * k), s0.y * (1 - 0.7 * k), s0.z * (1 - 0.55 * k)) }); }); bell(988); label(S.branches < 3 ? 'There, behind the thicket: pink freckles on its ears and trunk. It’s our calf! Stuck in a dry gully, calling for its mother. It needs a ramp to climb out: bring three fallen branches from the wrong trails.' : 'There, behind the thicket: the calf, stuck in a dry gully!', 6000); }
  }
  const MSG = {
    foundCalf: 'There it is, stuck in a dry gully and calling for its mother! It scrambles out and trots up to you. It will follow you now.',
    calfStay: 'You tell the calf to stay. It plants its feet and waits.', calfFollow: 'You call the calf. It flaps its ears and comes trotting after you.',
    calfCantReach: 'The calf can’t get to you from there.',
    gotBranch: 'A sturdy fallen branch. Good for a ramp.',
    needRamp: 'The calf is stuck at the bottom of a steep gully, squealing. It needs a ramp to climb out: find three fallen branches.',
    poolNoCalf: 'A cool rock pool. The calf would love a drink here.',
    drank: 'The calf dips its trunk and drinks and drinks, then gives a happy little rumble. It’s ready for the long walk.',
    needNotes: 'You’re not sure this is the right herd. Find the rangers’ sighting slips for the full description first.', herdNoCalf: 'The calf isn’t with you. Tap the calf to call it (if it’s back by the river, tap the jeep and the ranger will fetch it).',
    wrongHerd: 'The matriarch rumbles and turns away; the calf hides behind your legs. Not its family. Count again.',
  };
  function onResult(r, what) {
    switch (r) {
      case 'foundCalf': ramp.visible = true; calfState.mode = 'follow'; E.sfx.place(); E.audio.bird('calf', { far: 0.15 }); [4, 6, 9].forEach((n, i) => E.sfx.pluck(n, { vol: 0.05, delay: 0.5 + i * 0.18 })); for (const m of calf.children) m.traverse((o) => { if (o.isMesh) o.userData.item = 'calf'; }); calf.traverse((o) => { if (o.isMesh) o.userData.item = 'calf'; });
        anims.push({ t: 0, dur: 0.8, f: (k) => { calf.position.y = -0.1 + Math.sin(k * Math.PI) * 0.6 + k * 0.16; } }); trailPts.length = 0; break;
      case 'calfStay': calfState.mode = 'stay'; calfState.stayAt = P(S.calf).clone(); click(); bubble(calf, 'stone', { offset: 1.4 }); if (levers[S.calf]) { const lv = levers[S.calf]; setTimeout(() => lowerBridge(lv), 500); } break;
      case 'calfFollow': { const was = calfState.stayAt; calfState.mode = 'follow'; click(); bubble(calf, 'heart', { offset: 1.4 }); for (const node of ['B_bank', 'R_far']) if (was && was.distanceTo(P(node)) < 0.5) setTimeout(() => raiseBridge(levers[node]), 300);
        if (was && was.distanceTo(P('R_far')) < 0.5 && L.areaOf(S.player) === 1 && S.player !== 'R_far') { calfState.wade = { t: 0, from: was.clone(), to: P('B_bank').add(new THREE.Vector3(-0.8, 0, 0.8)) }; label('The calf splashes back across the river to you.', 3200); }
        if (was && L.areaOf(S.player) === 2 && was.distanceTo(P('D')) > 12) { calfState.wade = null; calf.position.copy(P('D')).add(new THREE.Vector3(-1.2, 0, 2.2)); trailPts.length = 0; label('The ranger drives back for the calf, and it trots off the jeep to find you.', 4200); } // it was left behind by the river
        if (was && was.distanceTo(P('B_bank')) < 0.5 && S.player === 'R_far') { calfState.wade = { t: 0, from: was.clone(), to: P('R_far').add(new THREE.Vector3(-0.8, 0, 0.8)) }; label('The calf splashes happily across the river to you.', 3200); } trailPts.length = 0; break; }
      case 'calfCantReach': bump(); break;
      case 'gotBranch': { const b = branches[+what[2]]; b.visible = false; E.sfx.found(S.branches); E.sfx.flutter(4); if (S.branches >= 3) setTimeout(() => label('That’s three branches: enough for a ramp. Back to the calf’s gully!', 4200), 2000); break; }
      case 'needRamp': bubble(calf, 'branch', { count: 3, filled: S.branches, offset: 1.3 }); bump(); break;
      case 'poolNoCalf': bubble(rockPool, 'calf', { offset: 1.2 }); break;
      case 'drank': { const tr = calf.userData.trunk; anims.push({ t: 0, dur: 2.4, lin: true, f: (k) => (tr.rotation.x = -0.4 + Math.sin(k * Math.PI * 4) * 0.4) }); bubble(calf, 'heart', { offset: 1.4 }); E.sfx.splash(0.6); setTimeout(() => E.sfx.splash(0.4), 900); setTimeout(() => E.audio.bird('calf', { far: 0.2 }), 1800); break; }
      case 'needNotes': bubble(girl, 'note', { count: 3, filled: S.notes, offset: 2.1 }); bump(); break;
      case 'herdNoCalf': bump(); break;
      case 'wrongHerd': { const h = herds[what]; h.out[0].userData.alarm = 1.4; bump(); grind(0.6); break; }
      case 'win': reunite(); E.win(); setTimeout(() => (sunset = true), 4000); break;
    }
  }
  function lowerBridge(lv = lever) { grind(1.2); E.sfx.lever(); const r0 = bridgePivot.rotation.z; anims.push({ t: 0, dur: 1.4, f: (k) => (bridgePivot.rotation.z = r0 + (BR_DOWN - r0) * k) }); const s0 = lv.userData.st.position.y; anims.push({ t: 0, dur: 0.4, f: (k) => (lv.userData.st.position.y = s0 - 0.06 * k) });
    label('The calf’s weight presses the lever stone down, and the old bridge creaks down across the river.', 4800); E.progress(); }
  function raiseBridge(lv = lever) { grind(1.0); const r0 = bridgePivot.rotation.z; anims.push({ t: 0, dur: 1.2, f: (k) => (bridgePivot.rotation.z = r0 + (BR_UP - r0) * k) }); const s0 = lv.userData.st.position.y; anims.push({ t: 0, dur: 0.4, f: (k) => (lv.userData.st.position.y = s0 + 0.06 * k) }); }
  function reunite() {
    document.body.classList.add('won'); const h = herds.herd1; const mom = h.out[0];
    const from = calf.position.clone(), to = mom.position.clone().add(mom.position.clone().sub(h.pc).setY(0).normalize().multiplyScalar(-1.2)).setY(0);
    calfState.mode = 'home'; anims.push({ t: 0, dur: 2.2, f: (k) => { calf.position.lerpVectors(from, to, k); calf.position.y = Math.abs(Math.sin(k * Math.PI * 6)) * 0.12; calf.rotation.y = Math.atan2(to.x - from.x, to.z - from.z); },
      done: () => { mom.userData.trumpet = 2.5; h.out.forEach((e, i) => setTimeout(() => (e.userData.trumpet = 2), 300 + i * 150)); trumpet(); } });
    setTimeout(() => { anims.push({ t: 0, dur: 1.5, f: (k) => leopard.scale.setScalar(Math.max(0.001, k)) }); tents.forEach(([l, pl]) => { l.material.color.setHex(0xffd27a); pl.intensity = 6; }); }, 3200);
    let turns = 0; const spin = setInterval(() => { cam.azTo += Math.PI / 2; if (++turns >= 4) clearInterval(spin); }, 2700);
    E.playAction('wave', { speed: 1 });
  }
  // the reunion: the matriarch trumpets, the herd answers one after another, the calf squeaks back, and it all settles into a rumble
  function trumpet() { if (!E.AC) return; const A = E.audio;
    A.elephant('trumpet', { vol: 1.5, far: 0.35, pan: -0.15 }); A.elephant('trumpet', { vol: 1.0, far: 0.5, pan: 0.35, delay: 0.75 }); A.elephant('snort', { vol: 1.1, far: 0.4, pan: 0.5, delay: 1.3 }); A.elephant('trumpet', { vol: 0.8, far: 0.6, pan: -0.45, delay: 1.9 });
    setTimeout(() => A.bird('calf', { far: 0.3, pan: 0.2, vol: 1.3, bus: 'sfx' }), 900); A.elephant('rumble', { vol: 1.4, far: 0.4, delay: 2.8 }); A.elephant('rumble', { vol: 1.0, far: 0.5, pan: 0.3, delay: 3.8 }); A.elephant('snort', { vol: 0.8, far: 0.55, pan: -0.3, delay: 5.2 }); }
  function tapHidden(k) { const r = L.tap(S, k); if (!r) return; E.progress();
    if (r === 'leaf') { leaf.visible = false; E.sfx.found(4); label('<em>Puskola</em> · an ola-leaf page, left in the ranger’s tent'); E.refresh(); return; }
    if (r === 'branch') { const b = branches[+k[1]], from = b.position.clone(); E.sfx.found(S.branches); E.sfx.flutter(4);
      anims.push({ t: 0, dur: 1.0, f: (e) => { b.position.lerpVectors(from, girl.position, e); b.position.y = from.y + Math.sin(e * Math.PI) * 2.2; b.scale.setScalar(Math.max(0.05, 1 - e * 0.9)); }, done: () => { b.visible = false; E.refresh(); } });
      label(S.branches >= 3 ? 'That’s three branches: enough for a ramp. Back to the calf’s gully!' : `A fallen branch for the ramp (${S.branches}/3)`, 3600); E.refresh(); return; }
    const i = +k[1]; notes[i].visible = false; E.sfx.found(S.notes); E.sfx.flutter(3); label('Sighting slip: ' + NOTE_TEXT[i], 5200); updateNotes(); E.refresh(); }
  function updateNotes() { const el = $('signs'); if (!el || L.areaOf(S.player) !== 2) return;
    el.innerHTML = '<b>Sighting log</b><br>📻 North-east of the lone tree.<br>' + NOTE_TEXT.map((t, i) => (S.noteTaken[i] ? t : '<span style="opacity:.45">… (slip not found yet)</span>')).join('<br>'); }
  // listening: how many crossroads away is the calf? 3 bars = close
  const listenBtn = $('listen');
  { const nb = $('notesBtn'), sg = $('signs'); if (nb && sg) { nb.onclick = (e) => { e.stopPropagation(); sg.classList.toggle('open'); }; sg.addEventListener('pointerdown', (e) => { e.stopPropagation(); sg.classList.remove('open'); }); } }
  function hops(from) { const p = L.findPath({ ...S, calf: null }, from, 'G_calf'); return p ? p.length - 1 : 9; }
  listenBtn.onclick = (ev) => { ev.stopPropagation(); if (S.calf) return; const h = hops(S.player); const bars = h <= 1 ? 3 : h <= 3 ? 2 : 1;
    listenBtn.querySelectorAll('i').forEach((b, k) => b.classList.toggle('lit', k < bars));
    // the calf's squeal: fainter and more distant the further away it is
    if (E.AC) for (let n = 0; n < 2; n++) E.audio.elephant('calf', { vol: [0, 0.3, 0.75, 1.5][bars], far: [0, 0.85, 0.55, 0.2][bars], delay: n * 0.75 });
    label(['', 'A faint, faraway squeal… the calf is a long way off.', 'A clearer squeal. You’re getting closer.', 'A loud, frightened squeal, very close now!'][bars], 3000); };
  const actionFor = { calfFind: () => !S.calf && S.branches >= 3 && 'place', herd1: () => S.calf === 'follow' && 'place', herd2: () => S.calf === 'follow' && 'place', herd3: () => S.calf === 'follow' && 'place', herd4: () => S.calf === 'follow' && 'place', herd5: () => S.calf === 'follow' && 'place' };
  function unreachable(what) { if (what === 'calfFind') label('Follow the trail to find the calf. Read the signs at each crossroads.', 3600); }
  function onNothing() {}
  function hintTarget() {
    if (!S.calf && S.player === 'G_calf' && S.branches < 3) { const b = branches.find((x) => x.visible); return { obj: b, words: ['Fallen branches lie near the dead ends of the wrong trails. Tap them wherever you can see them: you need three for a ramp.'] }; }
    if (!S.calf && TRAIL.indexOf(S.player) === TRAIL.length - 1 - 0 && S.branches < 3) return { obj: branches.find((x) => x.visible), words: ['Find three fallen branches.'] };
    if (!S.calf && S.branches >= 3) return { obj: calf.visible ? calf : P('G_calf') && calfThicket, words: ['You have three branches. Tap the calf in the gully to build it a ramp.'] };
    if (S.player === 'R_far' && !S.drank) return S.calf === 'R_far' ? { obj: bridge, words: ['The calf’s weight holds this bridge down too. Cross back, then call the calf over and take it to the rock pool.'] } : { obj: calf, words: ['The calf must drink before the long drive. Tell it to stay on the stone here (tap the calf): the bridge comes down, so you can go back to the rock pool.'] };
    if (S.calf === 'follow' && !S.drank && L.areaOf(S.player) === 1) return { obj: rockPool, words: ['Lead the calf to the rock pool for a drink.'] };
    if (L.areaOf(S.player) === 2 && S.calf !== 'follow' && !S.won) return { obj: jeepB, words: ['The calf got left behind by the river! Tap the jeep, and the ranger will drive back for it.'] };
    if (L.areaOf(S.player) === 2 && S.notes < 3) { const n = notes.find((x) => x.visible); return { obj: n, words: ['The rangers left sighting slips around the camp and the plain. Look by the tents, the lone tree and the track posts.'] }; }
    if (!S.calf) { // next correct crossroads on the trail
      const i = TRAIL.indexOf(S.player); const nxt = i >= 0 ? TRAIL[i + 1] : TRAIL[0];
      const obj = i >= 0 && !HARD.includes(i) ? clue.children.find((c) => c.position.distanceTo(P(nxt)) < 3.2 && c.position.distanceTo(P(TRAIL[i])) < 3.2) : null;
      if (i >= 0 && !obj) return { obj: girl, words: ['The ground is baked hard here: no prints. Press Listen, then try each way out and listen again.'] };
      return { obj: obj || clue.children[0], words: [i >= 0 ? 'Look at the prints leaving this crossroads: small, alone, toes pointing away.' : 'Head back to the crossroads where the small prints were.'] };
    }
    if (L.areaOf(S.player) === 1 && S.player !== 'R_far') {
      if (!L.bridgeDown(S)) return S.player === 'B_bank' && S.calf === 'follow' ? { obj: calf, words: ['You’re on the lever stone. Now tap the calf to tell it to stay here.'] } : { obj: lever, words: ['The lever stone by the river needs real weight. Lead the calf onto it and tell it to stay (tap the calf).'] };
      return { obj: bridge, words: ['The bridge is down. Cross to the ranger.'] };
    }
    if (S.player === 'R_far' && !S.drank) return S.calf === 'R_far' ? { obj: bridge, words: ['The calf’s weight holds this bridge down too. Cross back, then call the calf over and take it to the rock pool.'] } : { obj: calf, words: ['The calf must drink before the long drive. Tell it to stay on the stone here (tap the calf): the bridge comes down, so you can go back to the rock pool.'] };
    if (S.player === 'R_far') return S.calf === 'follow' ? { obj: jeepB, words: ['Tap the jeep to drive to the waterholes.'] } : { obj: calf, words: ['Tap the calf to call it across. Elephants can wade.'] };
    if (S.calf !== 'follow') return { obj: calf, words: ['Tap the calf to call it.'] };
    return { obj: herds.herd1.g, words: ['North-east of the lone tree (the compass shows north). Two waterholes lie that way. Check each: seven elephants, two little ones (turn the view to see behind rocks), and a matriarch with a torn left ear.'] };
  }
  function inventory(s) { return { calf: s.calf === 'follow', branch: !s.calf && s.branches ? `${s.branches}/3` : '', note: L.areaOf(s.player) === 2 && s.notes < 3 ? `${s.notes}/3` : '', leaf: s.has.leaf }; }

  /* ---------- camera, time of day, animals ---------- */
  const tod = { k: 0 }; let notesShown = false; const started = () => document.getElementById('intro').classList.contains('hide');
  function focus() { let f = L.areaOf(S.player) === 2 ? 1 : 0; if (riding) { const d = roadB.clone().sub(roadA); f = THREE.MathUtils.clamp(girl.position.clone().sub(roadA).dot(d) / d.lengthSq(), 0, 1); }
    if (S.player === 'R_far' && !riding) f = 0.15; const k = f * f * (3 - 2 * f);
    // up close with a young elephant (ours or not): come right in, so the ears and trunk can be compared
    const young = !riding && { G_kid: deadEnd.G_kid[0], G_kid2: deadEnd.G_kid2[0], G_mom: deadEnd.G_mom[0] }[S.player];
    if (young && young.visible !== false) { // close enough to see the ears, while the crossroads she came from stays in the frame
      const back = (L.adjacency(S).get(S.player) || [])[0], yp = young.getWorldPosition(new THREE.Vector3());
      const p = back ? yp.clone().lerp(P(back.to), 0.38) : yp.clone().lerp(girl.position, 0.35); return { target: p.add(new THREE.Vector3(0, 0.6, 0)), zoom: 1.75, k, pz: 1.2 }; }
    return { target: new THREE.Vector3(1.5, 1.2, -1).lerp(A2.clone().add(new THREE.Vector3(0.6, 1.2, -1.8)), k), zoom: 1, k, pz: 1.12 - 0.14 * k }; }
  const skyA = { sun: new THREE.Color(0xfff2dc), hemi: new THREE.Color(0xfff3e8), fog: new THREE.Color(0xf3e6cc) };
  const skyB = { sun: new THREE.Color(0xffb070), hemi: new THREE.Color(0xf0c8a0), fog: new THREE.Color(0xf0c8a0) };
  const skyC = { sun: new THREE.Color(0xc87a8a), hemi: new THREE.Color(0x9a7aa8), fog: new THREE.Color(0x8a6a8a) };
  const tmp = new THREE.Vector3();
  function tick(dt, t) {
    // the calf: stuck, following her breadcrumbs, staying, wading
    const gp = girl.position.clone();
    if (!trailPts.length || trailPts[trailPts.length - 1].distanceTo(gp) > 0.25) trailPts.push(gp.clone()); if (trailPts.length > 60) trailPts.shift();
    if (calfState.mode === 'follow' && !calfState.wade) {
      let goal = gp; let acc = 0; for (let i = trailPts.length - 1; i > 0; i--) { acc += trailPts[i].distanceTo(trailPts[i - 1]); if (acc > 1.5) { goal = trailPts[i - 1]; break; } }
      if (riding) goal = gp.clone().add(new THREE.Vector3(0, 0, 0)).sub(girl.getWorldDirection(tmp).multiplyScalar(2.4));
      const d = goal.clone().sub(calf.position).setY(0); const dist = d.length();
      if (dist > 0.05) { const sp = Math.min(dist, (dist > 2 ? 6 : 2.4) * dt); calf.position.add(d.normalize().multiplyScalar(sp)); calf.rotation.y += (Math.atan2(d.x, d.z) - calf.rotation.y + Math.PI * 3) % (Math.PI * 2) - Math.PI > 0 ? 0 : 0; calf.rotation.y = Math.atan2(d.x, d.z); calf.position.y = Math.abs(Math.sin(t * 9)) * 0.04 + Math.max(0, goal.y - 0.06); }
    } else if (calfState.mode === 'stay' && calfState.stayAt) { const d = calfState.stayAt.clone().sub(calf.position).setY(0); if (d.length() > 0.05) { calf.position.add(d.multiplyScalar(Math.min(1, dt * 3))); } calf.position.y = 0.02; }
    if (calfState.wade) { const w = calfState.wade; w.t += dt / 2.6; const k = Math.min(1, w.t); calf.position.lerpVectors(w.from, w.to, k); calf.position.y = -0.45 * Math.sin(k * Math.PI); calf.rotation.y = Math.atan2(w.to.x - w.from.x, w.to.z - w.from.z); if (k >= 1) calfState.wade = null; }
    if (calfState.mode === 'stuck') { calf.userData.head.rotation.x = Math.sin(t * 2) * 0.12; calf.userData.trunk.rotation.x = -0.6 + Math.sin(t * 3) * 0.3; }
    // elephants: ears flap, trunks sway; alarm = head shake; trumpet = trunk up
    for (const e of elephants) { const ph = e.userData.phase, h = e.userData.head; if (!h) continue;
      h.userData.earL && (h.userData.earL.rotation.y = -0.4 - Math.sin(t * 1.3 + ph) * 0.25); h.userData.earR && (h.userData.earR.rotation.y = 0.4 + Math.sin(t * 1.3 + ph) * 0.25);
      let tr = Math.sin(t * 0.9 + ph) * 0.15; if (e.userData.trumpet > 0) { e.userData.trumpet -= dt; tr = -1.6; } e.userData.trunk.rotation.x += (tr - e.userData.trunk.rotation.x) * Math.min(1, dt * 4);
      if (e.userData.alarm > 0) { e.userData.alarm -= dt; h.rotation.y = Math.sin(t * 18) * 0.25; } else h.rotation.y *= 0.9; }
    for (const a of [bearA, buffA, leoA, peaA]) if (a.userData.alarm > 0) { a.userData.alarm -= dt; a.rotation.y += Math.sin(t * 20) * 0.02; }
    if (peaA.visible) peaA.userData.fan.rotation.x = -0.25 + Math.sin(t * 6) * (peaA.userData.alarm > 0 ? 0.08 : 0.015);
    if (leoA.visible && leoA.userData.head) leoA.userData.head.rotation.y = Math.sin(t * 0.7) * 0.3; if (bearA.userData.head) bearA.userData.head.rotation.x = 0.3 + Math.sin(t * 3) * 0.15;
    // steam from fresh dung
    for (const g of steamers) for (const s of g.userData.steam) { const k = (t * 0.35 + s.userData.ph) % 1; s.position.set(Math.sin(k * 6 + s.userData.ph * 9) * 0.06, 0.15 + k * 0.7, 0); s.material.opacity = 0.45 * (1 - k); s.scale.setScalar(0.6 + k * 1.2); }
    // beacons
    jeepBeacon.visible = S.player === 'R_far' && S.calf === 'follow' && !riding;
    if (riding) { jeepB.position.copy(girl.position).setY(0); jeepB.rotation.y = girl.rotation.y; if (E.hero.model) E.hero.model.position.y = 0.55; } else if (E.hero.model) E.hero.model.position.y = 0;
    if (!riding && L.areaOf(S.player) === 2 && jeepB.position.distanceTo(P('D')) > 4) { jeepB.position.copy(P('D')).add(new THREE.Vector3(-1.8, 0, 1.2)); jeepB.rotation.y = 0; }
    // lever glow while waiting for weight
    lever.children.forEach((c) => { if (c.userData.halo) c.visible = !L.bridgeDown(S); });
    listenBtn.classList.toggle('on', !S.calf && L.areaOf(S.player) === 1 && started());
    if (L.areaOf(S.player) === 2 && !notesShown) { notesShown = true; updateNotes(); }
    // compass needle follows the camera
    { const n = $('needle'); if (n) n.setAttribute('transform', `rotate(${(-(cam.az - Math.PI / 4) * 180 / Math.PI + 45) % 360} 32 32)`); }
    // time of day: morning on the tracks, golden at the waterholes, sunset at the end
    const fk = focus().k; tod.k += ((S.won ? 1.6 : fk) - tod.k) * Math.min(1, dt * 0.7);
    const kk = Math.min(1, tod.k), k2 = Math.max(0, tod.k - 1) / 0.6;
    document.body.classList.toggle('dusk', tod.k > 0.5);
    sun.color.copy(skyA.sun).lerp(skyB.sun, kk).lerp(skyC.sun, k2); hemi.color.copy(skyA.hemi).lerp(skyB.hemi, kk).lerp(skyC.hemi, k2); scene.fog.color.copy(skyA.fog).lerp(skyB.fog, kk).lerp(skyC.fog, k2);
    sun.intensity = 2.2 - k2 * 1.0; hemi.intensity = 1.5 - k2 * 0.5;
  }
  return { busy: () => riding, sound, surfaceAt, nodePos, surfaceTarget, edgePoints, onEdgeStart, onArrive, onResult, tapHidden, actionFor, items, unreachable, onNothing, hintTarget, inventory, focus, tick, MSG, tod,
    reachCap: { calfFind: 0.6, herd1: 1.0, herd2: 1.0, herd3: 1.0, herd4: 1.0, herd5: 1.0 } };
}
