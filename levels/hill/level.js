// Chapter IV: Hill Country, "The First Flush". Scene, story beats, hints. Rules live in logic.js.
import * as L from './logic.js';
import HERO_GLB from './heroine.js';

const PAL = {
  tea: 0x4f9a4a, teaDark: 0x3b7d3c, teaLight: 0x8fd06a, terrace: 0x7a9a5a, soil: 0xa8744a, path: 0xd8c09a, stone: 0x9a948a, stoneDark: 0x77706a,
  water: 0x6fb2c4, wood: 0x8a6a44, woodDark: 0x6e4a30, white: 0xf3efe6, roofGreen: 0x4f7a5a, brass: 0xc8a24a, rail: 0x5a5550,
  brick: 0x8a7f74, jungle: 0x3f7a3a, jungle2: 0x5a9a48, flame: 0xd8442f, blueTrain: 0x2f5fa8, redTrain: 0xa8342f, cream: 0xf2e6c4,
};
const svg = (paths) => paths.map((p) => { const [d, c] = p.split('#'); return `<path d="${d}" fill="#${c}"/>`; }).join('');
const ICONS = {
  shoot: ['M16 30V14#5a8a3a', 'M16 16c-6-1-9-6-8-11 5 1 8 5 8 11z#6fbf4a', 'M16 16c6-1 9-6 8-11-5 1-8 5-8 11z#6fbf4a', 'M16 12c-2-3-2-7 0-10 2 3 2 7 0 10z#b8e07a'],
  sack: ['M8 10h16l2 18H6z#d8c09a', 'M10 6h12l-2 4h-8z#b8a07a'],
  drop: ['M16 4c5 8 9 12 9 17a9 9 0 01-18 0c0-5 4-9 9-17z#5fa9d0'],
  gear: ['M14 3h4l1 4 3 1 3-2 3 3-2 3 1 3 4 1v4l-4 1-1 3 2 3-3 3-3-2-3 1-1 4h-4l-1-4-3-1-3 2-3-3 2-3-1-3-4-1v-4l4-1 1-3-2-3 3-3 3 2 3-1z#8a8a8a', 'M16 11a5 5 0 100 10 5 5 0 000-10z#f3efe6'],
  chest: ['M5 11h22v15H5z#a8744a', 'M5 11l3-5h16l3 5z#c8925a', 'M14 15h4v4h-4z#e8d8a8'],
  clock: ['M16 3a13 13 0 100 26 13 13 0 000-26z#f3efe6', 'M15 8h2v9h-2z#333333', 'M16 15h7v2h-7z#333333'],
  lock: ['M9 14h14v13H9z#c8a24a', 'M12 14v-4a4 4 0 018 0v4h-2v-4a2 2 0 00-4 0v4z#8a8a8a'],
  flag: ['M7 4h2v25H7z#6e4a30', 'M9 5h16l-4 5 4 5H9z#2f8a4a'],
};
const SLOTS = [{ id: 'shoot', title: 'First-flush shoots', svg: svg(ICONS.shoot), count: true }, { id: 'sack', title: 'The weighed leaf', svg: svg(ICONS.sack) }, { id: 'chest', title: 'Auction chests', svg: svg(ICONS.chest) },
  { id: 'leaf', title: 'Ola-leaf page (secret)', svg: '<rect x="3" y="12" width="26" height="8" rx="2" fill="#d9be8a"/><path d="M6 15h18M6 17.5h14" stroke="#8a6a44" stroke-width="1"/>' }];
const CSS = `body.hill{--sky-top:#cfe0e6;--sky-mid:#eef0ea;--sky-bot:#c9dcc8;--accent:#3b7d3c}
body.hill.dusk{--sky-top:#f3c38a;--sky-mid:#f8e2b8;--sky-bot:#b9cfa8}
body.hill.won{--sky-top:#3d3a6a;--sky-mid:#d0789a;--sky-bot:#f3a85a}
#panel{position:fixed;left:16px;bottom:16px;z-index:6;max-width:330px;font-size:13px;line-height:1.5;padding:10px 12px;pointer-events:none;display:none}
#panel.on{display:block}#panel b.h{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-soft)}
#panel .bar{display:inline-block;height:8px;border-radius:4px;background:#5fa9d0;vertical-align:middle;margin-left:4px}
#panel .ok{color:#2f8a4a;font-weight:700}#panel .no{color:#b8432f;font-weight:700}
@media (max-width:600px){#panel{max-width:60vw;font-size:12px}}
#sbox{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:8;width:min(760px,96vw);padding:12px 14px;display:none;font-size:13.5px;line-height:1.45}
#sbox.on{display:block}#sbox h4{margin:0 0 6px;font:600 12px Nunito Sans,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-soft)}
#sbox .row{display:flex;gap:12px;align-items:stretch;flex-wrap:wrap}#sbox img{width:300px;max-width:100%;border-radius:8px;border:1px solid rgba(0,0,0,.1)}
#sbox .levers{display:flex;gap:8px;flex:1;min-width:280px}
#sbox .lv{flex:1;border:0;border-radius:12px;padding:8px 4px;background:#f6efe2;cursor:pointer;font:600 12px Nunito Sans,sans-serif;color:var(--ink);display:flex;flex-direction:column;align-items:center;gap:4px;box-shadow:inset 0 0 0 2px rgba(0,0,0,.06)}
#sbox .lv:hover{background:#fff8ea}#sbox .lv.locked{opacity:.55;cursor:not-allowed}
#sbox .stick{width:10px;height:54px;border-radius:5px;transform-origin:50% 100%;transition:transform .3s}#sbox .lv.pulled .stick{transform:rotate(28deg)}#sbox .lv:not(.pulled) .stick{transform:rotate(-14deg)}
#sbox .knob{width:18px;height:18px;border-radius:50%;background:#e8e0cc;margin-bottom:-8px;position:relative;z-index:1}
#sbox .num{font-size:18px;font-weight:800}#sbox .st{font-size:11.5px;font-weight:700}#sbox .why{font-size:11px;color:#b8432f;font-weight:600;min-height:28px;text-align:center}
#sbox .goal{margin-top:8px;padding:8px 10px;border-radius:10px;background:#eef6ea;font-weight:600}#sbox .rules{margin:6px 0 0;padding-left:18px;color:var(--ink-soft);font-size:12.5px}
@media (max-width:600px){#sbox img{width:100%}#sbox .rules{display:none}}`;

export default {
  heroGlb: HERO_GLB, slots: SLOTS, icons: ICONS, logic: L,
  meta: {
    chapter: 'IV', place: 'Hill Country', title: 'The First Flush', tagline: 'From the tea bush to the Colombo train.', bodyClass: 'hill', css: CSS,
    intro: 'It’s first-flush season on an old tea estate above the clouds. The year’s finest tea has to be picked, weighed, made and blended, then put on this afternoon’s blue train to the Colombo tea auction. Help it every step of the way.',
    howto: ['<b>Look closely:</b> only perfect shoots (two leaves and a bud) are first flush.', '<b>Work it out:</b> weights, water flows, the order tea is made, the broker’s recipe, the timetable and the signal levers. The panel at the bottom left shows the numbers.', '<b>Switch things back</b> any time: gates, sacks, machines and levers all work both ways.'],
    startLabel: 'Morning mist on the estate. The pluckers are out on the terraces: pick the perfect shoots, two leaves and a bud.',
    winTitle: 'The first flush is away', winSub: 'Sunset over the nine arches', inviteNode: 'LAKE', camStart: [0, 1.6, 0], fog: 0xe6ece4, winDelay: 9500,
  },
  build,
};

function build(E) {
  const { THREE, S, scene, mat, mesh, polar, deg, tag, hash, canvasTex, bubble, sparkle, beacon, halo, label, bell, grind, click, bump, anims, girl, hemi, sun, cam, $ } = E;
  const V3 = (a) => new THREE.Vector3(...a);
  const P = (id) => V3(L.NODES[id]);
  const A2 = V3(L.A2C);
  const a2 = (x, z, y = 0) => new THREE.Vector3(A2.x + x, y, A2.z + z);
  const items = {};

  /* ---------- builders ---------- */
  function islandBase(c, R, depth, color) { const g = mesh(new THREE.CylinderGeometry(R, R * 0.28, depth, 22, 3, true), mat(color)); g.position.set(c.x, -depth / 2 - 0.42, c.z); scene.add(g);
    const p = g.geometry.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < depth / 2 - 0.01) { p.setX(i, p.getX(i) * (0.9 + hash(i, 1, 1) * 0.2)); p.setZ(i, p.getZ(i) * (0.9 + hash(i, 2, 1) * 0.2)); } g.geometry.computeVertexNormals(); return g; }
  // a slab bounded by a circle and a straight cut (used for the terraces and the two sides of the ravine)
  function slab(c, R, top, bottom, cut, color, kind) { const sh = new THREE.Shape(); const pts = [];
    for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2; const x = R * Math.sin(a), z = R * Math.cos(a); if (cut(x, z)) pts.push([x, z]); }
    // sort by angle so the outline is clean, then close along the cut line
    pts.forEach(([x, z], i) => (i ? sh.lineTo(x, -z) : sh.moveTo(x, -z)));
    const g = new THREE.ExtrudeGeometry(sh, { depth: top - bottom, bevelEnabled: false }); g.rotateX(-Math.PI / 2); g.translate(c.x, bottom, c.z);
    const m = mesh(g, mat(color)); scene.add(m); if (kind) tag(m, { surface: kind }); return m; }
  function teaRow(a, b, y, n) { const g = new THREE.Group(); for (let i = 0; i <= n; i++) { const p = a.clone().lerp(b, i / n); const bsh = mesh(new THREE.SphereGeometry(0.42 + hash(i, a.x, 2) * 0.08, 8, 6), mat(i % 3 ? PAL.tea : PAL.teaDark)); bsh.scale.set(1, 0.62, 1); bsh.position.set(p.x, y + 0.2, p.z); g.add(bsh); } scene.add(g); return g; }
  function silverOak(h = 4.5) { const g = new THREE.Group(); const t = mesh(new THREE.CylinderGeometry(0.07, 0.12, h, 6), mat(0x7a6a58)); t.position.y = h / 2; g.add(t);
    for (let i = 0; i < 4; i++) { const c = mesh(new THREE.IcosahedronGeometry(0.5 - i * 0.06, 0), mat(i % 2 ? 0x6f8a5a : 0x5f7a4a)); c.scale.y = 1.3; c.position.y = h * 0.55 + i * h * 0.13; g.add(c); } return g; }
  function flameTree() { const g = new THREE.Group(); const t = mesh(new THREE.CylinderGeometry(0.1, 0.16, 2.6, 6), mat(0x6e5a48)); t.position.y = 1.3; g.add(t);
    const c = mesh(new THREE.IcosahedronGeometry(1.1, 0), mat(PAL.flame)); c.scale.y = 0.6; c.position.y = 2.8; g.add(c); const c2 = mesh(new THREE.IcosahedronGeometry(0.8, 0), mat(0x5f8a45)); c2.scale.y = 0.6; c2.position.set(0.6, 2.4, 0.3); g.add(c2); return g; }
  function person(shirt, wrap, { basket = false } = {}) { const g = new THREE.Group(); const skin = mat(0x8a5a3c);
    const legs = mesh(new THREE.CylinderGeometry(0.17, 0.24, 0.8, 8), mat(wrap)); legs.position.y = 0.4; g.add(legs); const body = mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.6, 8), mat(shirt)); body.position.y = 1.05; g.add(body);
    const head = mesh(new THREE.SphereGeometry(0.17, 10, 8), skin); head.position.y = 1.5; g.add(head); const hair = mesh(new THREE.SphereGeometry(0.175, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2.2), mat(0x2a211d)); hair.position.y = 1.5; g.add(hair);
    if (basket) { const b = mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.45, 10, 1, true), mat(0xb8925a, { side: THREE.DoubleSide })); b.position.set(0, 1.15, -0.32); g.add(b); const strap = mesh(new THREE.TorusGeometry(0.2, 0.025, 4, 12, Math.PI), mat(0x8a6a44)); strap.position.set(0, 1.62, -0.1); strap.rotation.y = Math.PI / 2; g.add(strap); }
    return g; }
  function textBoard(lines, w, h, bg = '#2b2b2b', fg = '#f3efe6', size = 30) { const tex = canvasTex(512, Math.round(512 * h / w), (x, W, H) => { x.fillStyle = bg; x.fillRect(0, 0, W, H); x.fillStyle = fg; x.font = `600 ${size}px Nunito Sans, sans-serif`; x.textBaseline = 'top'; lines.forEach((l, i) => x.fillText(l, 22, 18 + i * size * 1.3)); });
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), [mat(0x5a4632), mat(0x5a4632), mat(0x5a4632), mat(0x5a4632), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }), mat(0x5a4632)]); m.castShadow = true; return m; }
  function cardTex(text, bg, fg) { return canvasTex(256, 96, (x) => { x.fillStyle = bg; x.fillRect(0, 0, 256, 96); x.fillStyle = fg; x.font = 'bold 30px Nunito Sans, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 128, 50); }); }

  /* ================= AREA 1: THE TEA ESTATE ================= */
  const R1 = 12;
  slab(new THREE.Vector3(), R1, 0, -0.4, () => true, 0x86a868, 'a1');
  islandBase(new THREE.Vector3(), R1, 6.5, PAL.stoneDark);
  const TERR = [[-0.2, 0.8], [-3.0, 1.6], [-5.8, 2.4]]; // [front z, top y]
  TERR.forEach(([zf, y], i) => { slab(new THREE.Vector3(), R1 - 0.05, y, 0, (x, z) => z < zf, i % 2 ? PAL.terrace : 0x6f9050, 'a1');
    const w = Math.sqrt(R1 * R1 - zf * zf) - 0.4; const wall = mesh(new THREE.BoxGeometry(2 * w, y - (i ? TERR[i - 1][1] : 0), 0.25), mat(PAL.stone)); wall.position.set(0, (y + (i ? TERR[i - 1][1] : 0)) / 2, zf + 0.12); scene.add(wall);
    for (let r = 0; r < 2; r++) { const z = zf - 0.9 - r * 1.2; const hw = Math.sqrt(R1 * R1 - z * z) - 0.9; teaRow(new THREE.Vector3(-hw, 0, z), new THREE.Vector3(hw, 0, z), y, Math.round(hw * 1.6)); } });
  // stone steps between the flat and the terraces
  function steps(a, b, n = 6) { for (let i = 0; i < n; i++) { const p = a.clone().lerp(b, (i + 0.5) / n); const s = mesh(new THREE.BoxGeometry(1.1, 0.12, 0.5), mat(PAL.stone)); s.position.copy(p); s.lookAt(b.clone().setY(p.y)); scene.add(s); tag(s, { surface: 'a1' }); } }
  steps(new THREE.Vector3(-5.6, 0.06, 1.0), new THREE.Vector3(-4.6, 0.86, -0.2)); steps(P('T1').add(new THREE.Vector3(-0.2, 0, -0.9)), P('T2').add(new THREE.Vector3(0.2, 0, 0.6)), 7); steps(P('T2').add(new THREE.Vector3(-0.1, 0, -0.9)), P('T3').add(new THREE.Vector3(0.1, 0, 0.6)), 7);
  // paths on the flat
  function path(a, b, w = 0.9) { const len = a.distanceTo(b); const m = mesh(new THREE.BoxGeometry(w, 0.04, len + w * 0.5), mat(PAL.path)); m.position.copy(a).lerp(b, 0.5).setY(0.02); m.lookAt(b.clone().setY(0.02)); scene.add(m); tag(m, { surface: 'a1' }); }
  for (const e of L.edges(L.initialState())) if (L.areaOf(e.a) === 1 && e.kind === 'line') { const pts = [P(e.a), ...(e.via || []).map(V3), P(e.b)]; for (let i = 1; i < pts.length; i++) if (pts[i - 1].y < 0.2 && pts[i].y < 0.2) path(pts[i - 1], pts[i]); }
  for (const [x, z] of [[-8.6, -1.5], [6.5, -4.2], [-1.0, -4.6], [3.5, -7.6], [-6.8, -7.2]]) { const t = silverOak(4 + hash(x, z, 1) * 1.5); const y = z < -5.8 ? 2.4 : z < -3.0 ? 1.6 : z < -0.2 ? 0.8 : 0; t.position.set(x, y, z); scene.add(t); }
  { const f = flameTree(); f.position.set(-9.4, 0, 6.8); scene.add(f); }
  // pluckers on the terraces
  const pluckers = []; for (const [x, z, y] of [[1.5, -1.4, 0.8], [-6.5, -4.4, 1.6], [4.6, -4.4, 1.6]]) { const p = person([0xd04a6a, 0xe8a23a, 0x3a8a8a][pluckers.length], 0x6a3a5a, { basket: true }); p.position.set(x, y, z); p.rotation.y = hash(x, z, 3) * 6; scene.add(p); pluckers.push(p); }

  // ---- first-flush shoots: 6 perfect (two leaves and a bud), and decoys (one leaf, or old coarse leaves)
  function shoot(kind) { const g = new THREE.Group(); const stem = mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.3, 4), mat(0x5a8a3a)); stem.position.y = 0.15; g.add(stem);
    const leaf = (rx, rz, c, s = 1) => { const l = mesh(new THREE.SphereGeometry(0.12 * s, 6, 4), mat(c)); l.scale.set(0.5, 0.12, 1); l.position.set(0, 0.26, 0); l.rotation.set(rx, 0, rz); l.translateZ(0.1 * s); g.add(l); };
    if (kind === 'perfect') { leaf(0.4, 0.5, PAL.teaLight); leaf(0.4, -0.5, PAL.teaLight); const bud = mesh(new THREE.ConeGeometry(0.04, 0.16, 6), mat(0xc8ec8a)); bud.position.y = 0.38; g.add(bud); }
    else if (kind === 'one') { leaf(0.4, 0.4, PAL.teaLight); }
    else { leaf(0.5, 0.6, 0x2f5f2f, 1.4); leaf(0.5, -0.6, 0x2f5f2f, 1.4); leaf(0.2, 1.4, 0x2f5f2f, 1.3); }
    g.scale.setScalar(1.6); return g; }
  const shoots = [], decoys = [];
  const SHOOT_AT = [[2.6, -1.0, 0.8], [-1.6, -2.2, 0.8], [-3.2, -3.9, 1.6], [3.4, -5.0, 1.6], [-1.8, -6.6, 2.4], [5.4, -7.6, 2.4]];
  const DECOY_AT = [[-6.0, -1.2, 0.8, 'one'], [5.6, -2.2, 0.8, 'coarse'], [0.6, -3.9, 1.6, 'coarse'], [-7.0, -5.0, 1.6, 'one'], [1.8, -7.8, 2.4, 'one'], [-6.6, -6.7, 2.4, 'coarse']];
  SHOOT_AT.forEach(([x, z, y], i) => { const s = shoot('perfect'); s.position.set(x, y + 0.3, z); scene.add(s); const hit = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 0.2; s.add(hit); tag(s, { hidden: 's' + i }); shoots.push(s); });
  DECOY_AT.forEach(([x, z, y, k], i) => { const s = shoot(k); s.position.set(x, y + 0.3, z); scene.add(s); const hit = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 0.2; s.add(hit); tag(s, { hidden: 'x' + k }); decoys.push(s); });

  // ---- mist banks: one over each upper stair; they drift on and off in turn
  const mists = [0, 1].map((i) => { const g = new THREE.Group(); const c = i === 0 ? P('T1').lerp(P('T2'), 0.5) : P('T2').lerp(P('T3'), 0.5);
    for (let k = 0; k < 7; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.9 + hash(k, i, 5) * 0.6, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.65, depthWrite: false, roughness: 1 })); m.scale.y = 0.45; m.position.set((k - 3) * 0.9, 0.4 + hash(k, i, 6) * 0.4, (hash(k, i, 7) - 0.5) * 1.4); g.add(m); }
    g.position.copy(c); scene.add(g); g.userData.c = c.clone(); return g; });
  const MIST_T = 7.5; let mistClock = 0;
  const mistOn = (i, t = mistClock) => Math.sin((t / MIST_T) * Math.PI * 2 + i * Math.PI) > -0.15;

  // ---- the weighing shed on the top terrace: a balance scale and six sacks
  const shed = new THREE.Group(); shed.position.copy(P('T3')).add(new THREE.Vector3(-1.6, -0.06, -1.3)); scene.add(shed);
  { for (const [x, z] of [[-1.4, -0.9], [1.4, -0.9], [-1.4, 0.9], [1.4, 0.9]]) { const p = mesh(new THREE.BoxGeometry(0.14, 2.4, 0.14), mat(PAL.woodDark)); p.position.set(x, 1.2, z); shed.add(p); }
    const roof = mesh(new THREE.BoxGeometry(3.4, 0.1, 2.4), mat(PAL.roofGreen)); roof.position.y = 2.45; roof.rotation.x = 0.12; shed.add(roof);
    const bench = mesh(new THREE.BoxGeometry(2.8, 0.1, 0.6), mat(PAL.wood)); bench.position.set(0, 0.55, -0.6); shed.add(bench); }
  const scale = new THREE.Group(); scale.position.set(0.9, 0, 0.35); shed.add(scale);
  const beam = new THREE.Group(); beam.position.y = 1.65; scale.add(beam);
  { const post = mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.65, 8), mat(PAL.brass)); post.position.y = 0.82; scale.add(post); const b = mesh(new THREE.BoxGeometry(1.6, 0.06, 0.06), mat(PAL.brass)); beam.add(b);
    for (const sx of [-1, 1]) { const ch = mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.7, 4), mat(0x777777)); ch.position.set(sx * 0.75, -0.35, 0); beam.add(ch); const pan = mesh(new THREE.CylinderGeometry(0.32, 0.26, 0.06, 14), mat(PAL.brass)); pan.position.set(sx * 0.75, -0.72, 0); beam.add(pan); beam.userData[sx < 0 ? 'left' : 'right'] = pan; }
    const w = mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.28, 10), mat(0x8a6a2a)); w.position.set(0.75, -0.55, 0); beam.add(w); const wl = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.12), new THREE.MeshBasicMaterial({ map: cardTex('20 kg', '#8a6a2a', '#fff3c0') })); wl.position.set(0.75, -0.55, 0.19); beam.add(wl); }
  const sacks = L.SACKS.map((w, i) => { const g = new THREE.Group(); const body = mesh(new THREE.CylinderGeometry(0.16 + w * 0.012, 0.2 + w * 0.012, 0.35 + w * 0.02, 10), mat(0xd8c09a)); body.position.y = 0.2; g.add(body);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.16), new THREE.MeshBasicMaterial({ map: cardTex(w + ' kg', '#f3e6c4', '#5a4632') })); lab.position.set(0, 0.25, 0.26); g.add(lab);
    g.userData.home = new THREE.Vector3(-1.25 + i * 0.42, 0.6, -0.6); g.position.copy(g.userData.home); shed.add(g); tag(g, { item: 'sack' + i }); items['sack' + i] = g; return g; });
  const basket = mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.3, 10, 1, true), mat(0xb8925a, { side: THREE.DoubleSide })); basket.visible = false; shed.add(basket);

  // ---- the aerial ropeway: tower and wire from the top terrace down to the factory, hook carriage, counterweight platform
  const topWheel = P('R_top').add(new THREE.Vector3(0, 2.6, -0.6)), botWheel = new THREE.Vector3(8.6, 2.9, 1.2);
  { const tw = mesh(new THREE.BoxGeometry(0.25, 2.6, 0.25), mat(PAL.woodDark)); tw.position.copy(P('R_top')).add(new THREE.Vector3(0, 1.3, -0.6)); scene.add(tw);
    const tw2 = mesh(new THREE.BoxGeometry(0.25, 2.9, 0.25), mat(PAL.woodDark)); tw2.position.set(8.6, 1.45, 1.2); scene.add(tw2);
    const wire = mesh(new THREE.TubeGeometry(new THREE.LineCurve3(topWheel, botWheel), 8, 0.02, 4), mat(0x444444)); scene.add(wire); }
  const carriage = new THREE.Group(); scene.add(carriage);
  { const c = mesh(new THREE.BoxGeometry(0.2, 0.2, 0.3), mat(0x555555)); carriage.add(c); const hk = mesh(new THREE.TorusGeometry(0.1, 0.02, 4, 10, Math.PI * 1.5), mat(0x777777)); hk.position.y = -0.25; carriage.add(hk); }
  const leafSack = mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.7, 10), mat(0xd8c09a)); leafSack.position.y = -0.7; leafSack.visible = false; carriage.add(leafSack);
  const hookPost = new THREE.Group(); hookPost.position.copy(P('R_top')).add(new THREE.Vector3(-0.2, 0, -0.6)); scene.add(hookPost); { const hit = new THREE.Mesh(new THREE.BoxGeometry(1, 2.4, 1), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 1.4; hookPost.add(hit); } tag(hookPost, { item: 'hook' }); items.hook = hookPost;
  const ropeT = { k: 0, target: 0 };
  const cw = new THREE.Group(); cw.position.copy(P('P_cw')).setY(2.4); scene.add(cw);
  { const plat = mesh(new THREE.BoxGeometry(1.0, 0.1, 1.0), mat(PAL.wood)); plat.position.y = 0.06; cw.add(plat); cw.userData.plat = plat; halo(cw, 0xffe2a0, 0.62, 0.82).position.y = 0.13;
    const box = mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), mat(0x6a6a6a)); box.position.set(0.9, 1.2, 0); cw.add(box); cw.userData.box = box; const ch = mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.2, 4), mat(0x777777)); ch.position.set(0.9, 1.9, 0); cw.add(ch); }

  // ---- the reservoir, water gates and channels (numbers matter: 4 units in; wheel needs 3, nursery needs 1)
  const lake = new THREE.Mesh(new THREE.CircleGeometry(2.3, 28), new THREE.MeshStandardMaterial({ color: PAL.water, roughness: 0.15 })); lake.rotation.x = -Math.PI / 2; lake.position.set(-8.8, 0.04, 4.6); scene.add(lake);
  for (let i = 0; i < 9; i++) { const r = mesh(new THREE.DodecahedronGeometry(0.35, 0), mat(PAL.stone)); r.scale.y = 0.5; r.position.copy(lake.position).add(polar(2.4, i * 0.7 + 1.2, 0.05)); scene.add(r); }
  function flume(a, b) { const len = a.distanceTo(b); const g = new THREE.Group(); g.position.copy(a).lerp(b, 0.5); g.lookAt(b.clone().setY(g.position.y)); scene.add(g);
    const box = mesh(new THREE.BoxGeometry(0.42, 0.18, len), mat(PAL.wood)); g.add(box); const w = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, len), new THREE.MeshStandardMaterial({ color: 0x7fc4dc, transparent: true, opacity: 0.9, roughness: 0.1 })); w.position.y = 0.1; g.add(w); g.userData.w = w; return g; }
  const CH = {
    up: [flume(new THREE.Vector3(-7.0, 0.12, 5.4), new THREE.Vector3(-1.6, 0.12, 5.6))],
    low: [flume(new THREE.Vector3(-7.0, 0.12, 3.8), new THREE.Vector3(-5.0, 0.12, 0.9)), flume(new THREE.Vector3(-5.0, 0.12, 0.9), new THREE.Vector3(-1.6, 0.12, 0.9))],
    upWheel: [flume(new THREE.Vector3(-0.8, 0.12, 5.6), new THREE.Vector3(2.6, 0.12, 5.6)), flume(new THREE.Vector3(2.6, 0.12, 5.6), new THREE.Vector3(2.6, 0.12, 2.6))],
    upNurs: [flume(new THREE.Vector3(-0.8, 0.12, 5.2), new THREE.Vector3(0.6, 0.12, 3.9))],
    lowWheel: [flume(new THREE.Vector3(-0.8, 0.12, 0.9), new THREE.Vector3(2.6, 0.12, 1.4))],
    lowNurs: [flume(new THREE.Vector3(-0.8, 0.12, 1.3), new THREE.Vector3(0.6, 0.12, 2.5))],
  };
  function gate(pos, item, modes) { const g = new THREE.Group(); g.position.copy(pos); scene.add(g); const fr = mesh(new THREE.BoxGeometry(0.8, 0.8, 0.12), mat(PAL.woodDark)); fr.position.y = 0.45; g.add(fr);
    const wheel = new THREE.Group(); wheel.position.y = 1.0; g.add(wheel); const rim = mesh(new THREE.TorusGeometry(0.22, 0.03, 5, 12), mat(0xc8423b)); wheel.add(rim); for (let k = 0; k < 3; k++) { const sp = mesh(new THREE.BoxGeometry(0.42, 0.03, 0.03), mat(0xc8423b)); sp.rotation.z = k * Math.PI / 3; wheel.add(sp); }
    const card = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.34), new THREE.MeshBasicMaterial({ map: cardTex(modes[0], '#f3e6c4', '#3a2a1a'), transparent: true })); card.position.set(0, 1.5, 0.05); g.add(card);
    g.userData = { wheel, card, modes }; const hit = new THREE.Mesh(new THREE.BoxGeometry(1, 1.8, 0.8), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 0.9; g.add(hit); tag(g, { item }); items[item] = g; return g; }
  const gates = [gate(new THREE.Vector3(-6.9, 0, 4.6), 'g1', ['ALL ↑ UPPER', 'SPLIT 2 / 2']), gate(new THREE.Vector3(-1.2, 0, 5.6), 'g2', ['ALL → WHEEL', 'ALL → NURSERY', 'HALF / HALF']), gate(new THREE.Vector3(-1.2, 0, 0.9), 'g3', ['ALL → WHEEL', 'ALL → NURSERY'])];
  gates.forEach((g) => g.lookAt(g.position.clone().add(new THREE.Vector3(0.3, 0, 1))));
  // the nursery (seedlings in bags) and the water wheel on the factory wall
  const nursery = new THREE.Group(); nursery.position.set(1.3, 0, 3.0); scene.add(nursery);
  for (let i = 0; i < 9; i++) { const b = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 6), mat(0x2b2b2b)); b.position.set((i % 3) * 0.32 - 0.32, 0.1, Math.floor(i / 3) * 0.32 - 0.32); nursery.add(b); const s = mesh(new THREE.ConeGeometry(0.1, 0.3, 5), mat(PAL.teaLight)); s.position.set(b.position.x, 0.35, b.position.z); nursery.add(s); s.userData.seed = true; }
  // gauges: how much water reaches the wheel and the nursery (the numbers that matter)
  function gauge(pos, title) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.6), new THREE.MeshBasicMaterial({ transparent: true })); m.position.copy(pos); scene.add(m); m.userData.title = title; m.userData.last = ''; return m; }
  const gaugeWheel = gauge(new THREE.Vector3(2.8, 2.7, 2.6), 'WHEEL'), gaugeNurs = gauge(new THREE.Vector3(1.3, 1.2, 3.0), 'NURSERY');
  function drawGauge(g, have, need) { const key = have + '/' + need; if (g.userData.last === key) return; g.userData.last = key;
    g.material.map = canvasTex(300, 120, (x) => { x.fillStyle = 'rgba(255,250,240,.95)'; x.fillRect(0, 0, 300, 120); x.fillStyle = '#3a2a1a'; x.font = 'bold 26px Nunito Sans, sans-serif'; x.fillText(g.userData.title + ' · needs ' + need, 12, 34);
      for (let i = 0; i < 4; i++) { x.fillStyle = i < have ? '#4fa6d0' : '#e2dccf'; x.fillRect(12 + i * 68, 52, 60, 50); x.strokeStyle = i < need ? '#3a2a1a' : 'rgba(0,0,0,.15)'; x.lineWidth = 3; x.strokeRect(12 + i * 68, 52, 60, 50); }
      x.fillStyle = have >= need ? '#2f8a4a' : '#b8432f'; x.font = 'bold 30px Nunito Sans, sans-serif'; x.fillText(have >= need ? '✓' : '✗', 262, 34); });
    g.material.needsUpdate = true; }
  const waterWheel = new THREE.Group(); waterWheel.position.set(2.8, 1.2, 1.9); scene.add(waterWheel);
  { const rim = mesh(new THREE.TorusGeometry(1.0, 0.07, 6, 18), mat(PAL.woodDark)); waterWheel.add(rim); for (let k = 0; k < 8; k++) { const pd = mesh(new THREE.BoxGeometry(0.06, 0.5, 0.4), mat(PAL.wood)); pd.position.copy(polar(0.95, k / 8 * Math.PI * 2)).applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2); pd.position.set(Math.cos(k / 8 * Math.PI * 2) * 0.95, Math.sin(k / 8 * Math.PI * 2) * 0.95, 0); pd.rotation.z = k / 8 * Math.PI * 2; waterWheel.add(pd); } }
  waterWheel.rotation.y = Math.PI / 2;
  // ---- the factory: white walls, green roof, rows of windows; five machine stations under a lean-to at the front
  const factory = new THREE.Group(); factory.position.set(6.4, 0, -0.6); scene.add(factory);
  { const w = mesh(new THREE.BoxGeometry(6.0, 3.4, 4.0), mat(PAL.white)); w.position.y = 1.7; factory.add(w); const r = mesh(new THREE.CylinderGeometry(0.01, 3.4, 1.4, 4, 1), mat(PAL.roofGreen)); r.rotation.y = Math.PI / 4; r.scale.set(1.25, 1, 0.85); r.position.y = 4.1; factory.add(r);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) { const win = mesh(new THREE.BoxGeometry(0.6, 0.7, 0.05), mat(0x3a4a50)); win.position.set(-2.4 + i * 0.95, 1.0 + j * 1.3, 2.02); factory.add(win); }
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.5), new THREE.MeshBasicMaterial({ map: cardTex('MIST VALLEY ESTATE', '#4f7a5a', '#f3efe6') })); sign.position.set(0, 3.0, 2.03); factory.add(sign); }
  const lean = mesh(new THREE.BoxGeometry(6.4, 0.08, 1.8), mat(PAL.roofGreen)); lean.position.set(6.4, 2.2, 2.6); lean.rotation.x = -0.15; scene.add(lean);
  const STAGE_COL = ['#7fae5a', '#5a8a4a', '#b8743a', '#7a4a2a', '#c8a24a'];
  const stations = []; for (let i = 0; i < 5; i++) { const g = new THREE.Group(); g.position.set(4.0 + i * 1.2, 0, 2.5); scene.add(g);
    const m = mesh(new THREE.BoxGeometry(0.95, 0.9, 0.9), mat(0x8a8f94)); m.position.y = 0.45; g.add(m); const drum = mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.9, 10), mat(0x6a6f74)); drum.rotation.z = Math.PI / 2; drum.position.y = 1.05; g.add(drum); g.userData.drum = drum;
    const card = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.36), new THREE.MeshBasicMaterial({ map: cardTex(L.STAGES[0], '#333', '#fff') })); card.position.set(0, 0.62, 0.46); g.add(card); g.userData.card = card;
    const num = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.2), new THREE.MeshBasicMaterial({ map: cardTex(String(i + 1), '#f3e6c4', '#333') })); num.position.set(0, 1.5, 0.3); g.add(num);
    tag(g, { item: 'st' + i }); items['st' + i] = g; stations.push(g); }
  const runLever = new THREE.Group(); runLever.position.set(3.2, 0, 3.4); scene.add(runLever);
  { const b = mesh(new THREE.BoxGeometry(0.3, 0.6, 0.3), mat(0x555555)); b.position.y = 0.3; runLever.add(b); const h = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6), mat(0xc8423b)); h.position.y = 0.9; h.rotation.z = 0.5; runLever.add(h); runLever.userData.h = h; const bc = beacon(0xffd27a, 2.4); runLever.add(bc); runLever.userData.beacon = bc; }
  tag(runLever, { item: 'run' }); items.run = runLever;
  // ---- the blending yard: four grade bins, nine chests, the broker's order letter, the seal stamp
  const GRADE_NAMES = { B: 'BOP', F: 'FBOP', D: 'DUST', N: 'FANNINGS' };
  const bins = {}; L.GRADES.forEach((k, i) => { const g = new THREE.Group(); g.position.set(5.2 + i * 1.0, 0, 8.6); scene.add(g); const b = mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), mat(0x8a6a44)); b.position.y = 0.4; g.add(b);
    const tea = mesh(new THREE.BoxGeometry(0.7, 0.05, 0.7), mat([0x3a2a1a, 0x4a3a22, 0x2a1e14, 0x5a4630][i])); tea.position.y = 0.78; g.add(tea);
    const BIN_COL = ['#c8423b', '#2f6db4', '#7a5a3a', '#8a8a2a'][i]; const post = mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 5), mat(0x6e4a30)); post.position.set(0, 1.4, -0.3); g.add(post);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.42), new THREE.MeshBasicMaterial({ map: cardTex(GRADE_NAMES[k], BIN_COL, '#ffffff'), side: THREE.DoubleSide })); lab.position.set(0, 2.1, -0.3); g.add(lab); g.userData.sign = lab;
    const front = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.3), new THREE.MeshBasicMaterial({ map: cardTex(GRADE_NAMES[k], BIN_COL, '#ffffff') })); front.position.set(0, 0.45, 0.41); g.add(front); tag(g, { item: 'bin' + k }); items['bin' + k] = g; bins[k] = g; });
  const chestGroup = new THREE.Group(); chestGroup.position.set(8.4, 0, 6.0); scene.add(chestGroup); const chestMeshes = [];
  for (let i = 0; i < 9; i++) { const c = mesh(new THREE.BoxGeometry(0.5, 0.45, 0.5), mat(0xa8744a)); c.position.set((i % 3) * 0.56 - 0.56, 0.23 + Math.floor(i / 3) * 0.0, Math.floor(i / 3) * 0.56 - 0.56); c.visible = false; chestGroup.add(c); chestMeshes.push(c); }
  const clearLever = new THREE.Group(); clearLever.position.set(4.2, 0, 8.6); scene.add(clearLever); { const b = mesh(new THREE.BoxGeometry(0.3, 0.5, 0.3), mat(0x555555)); b.position.y = 0.25; clearLever.add(b); const h = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), mat(0x888888)); h.position.y = 0.7; clearLever.add(h); } tag(clearLever, { item: 'binClear' }); items.binClear = clearLever;
  const stamp = new THREE.Group(); stamp.position.set(9.6, 0, 7.6); scene.add(stamp); { const t = mesh(new THREE.BoxGeometry(0.7, 0.75, 0.6), mat(PAL.wood)); t.position.y = 0.38; stamp.add(t); const s = mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.3, 10), mat(0xc8423b)); s.position.y = 0.92; stamp.add(s); const bc = beacon(0xffd27a, 2.2); stamp.add(bc); stamp.userData.beacon = bc; } tag(stamp, { item: 'seal' }); items.seal = stamp;
  const letter = textBoard(['BROKER’S ORDER', '9 chests in all.', 'Twice as much BOP', '  as FBOP.', 'At most 2 of Dust.', 'No Fannings.'], 1.3, 1.5, '#f4e7c8', '#3a2a1a', 34); letter.position.set(5.0, 1.2, 9.6); scene.add(letter);
  // the estate lorry
  const lorry = new THREE.Group(); lorry.position.copy(P('F_yard')).add(new THREE.Vector3(3.0, -0.06, -1.6)); scene.add(lorry);
  { const cab = mesh(new THREE.BoxGeometry(1.3, 1.1, 1.1), mat(0x3a6ea5)); cab.position.set(0, 0.9, 1.2); lorry.add(cab); const bed = mesh(new THREE.BoxGeometry(1.4, 0.5, 2.2), mat(0x6e5a48)); bed.position.set(0, 0.65, -0.5); lorry.add(bed);
    for (const [x, z] of [[-0.68, 1.2], [0.68, 1.2], [-0.68, -1.0], [0.68, -1.0]]) { const w = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12), mat(0x222222)); w.rotation.z = Math.PI / 2; w.position.set(x, 0.3, z); lorry.add(w); }
    const load = new THREE.Group(); load.visible = false; for (let i = 0; i < 9; i++) { const c = mesh(new THREE.BoxGeometry(0.4, 0.36, 0.4), mat(0xa8744a)); c.position.set((i % 3) * 0.44 - 0.44, 1.1, Math.floor(i / 3) * 0.6 - 1.1); load.add(c); } lorry.add(load); lorry.userData.load = load;
    const hit = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 3.4), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 0.9; lorry.add(hit); const bc = beacon(0xffd27a, 2.6); lorry.add(bc); lorry.userData.beacon = bc; }
  tag(lorry, { surface: 'lorry' });
  const roadA = P('F_yard').add(new THREE.Vector3(3.6, 0, 0)), roadB = P('L_drop').add(new THREE.Vector3(-2.0, 0, 1.6));
  { const len = roadA.distanceTo(roadB); const rd = mesh(new THREE.BoxGeometry(1.8, 0.35, len), mat(PAL.soil)); rd.position.copy(roadA).lerp(roadB, 0.5).add(new THREE.Vector3(0, -0.2, 0)); rd.lookAt(roadB.clone().add(new THREE.Vector3(0, -0.2, 0))); scene.add(rd); }
  // mountains far behind
  for (let i = 0; i < 3; i++) { const m = mesh(new THREE.ConeGeometry(8 + hash(i, 1, 1) * 6, 10 + hash(i, 2, 1) * 8, 6), mat(i % 2 ? 0x6a8aa0 : 0x7f9ab0)); m.position.set(-56 + i * 13, -9, -46 - hash(i, 3, 1) * 10); scene.add(m); }

  /* ================= AREA 2: NINE ARCH BRIDGE ================= */
  const R2 = 12.5, RV = L.RAVINE;
  slab(A2, R2, 0, -0.4, (x) => x < -RV, 0x6f9a52, 'a2'); slab(A2, R2, 0, -0.4, (x) => x > RV, 0x6f9a52, 'a2');
  { const b1 = islandBase(A2.clone().add(new THREE.Vector3(-8.6, 0, 0)), 5.5, 7, PAL.stoneDark); const b2 = islandBase(A2.clone().add(new THREE.Vector3(8.6, 0, 0)), 5.5, 7, PAL.stoneDark);
    const river = new THREE.Mesh(new THREE.PlaneGeometry(2 * RV, 20), new THREE.MeshStandardMaterial({ color: PAL.water, roughness: 0.2 })); river.rotation.x = -Math.PI / 2; river.position.copy(A2).add(new THREE.Vector3(0, -6.2, 0)); scene.add(river);
    for (let i = 0; i < 18; i++) { const j = mesh(new THREE.IcosahedronGeometry(0.9 + hash(i, 4, 4) * 0.7, 0), mat(i % 2 ? PAL.jungle : PAL.jungle2)); j.position.copy(A2).add(new THREE.Vector3((hash(i, 5, 5) - 0.5) * 2 * RV, -5 + hash(i, 6, 6) * 3, (hash(i, 7, 7) - 0.5) * 16)); scene.add(j); } }
  // the viaduct: nine arches under a deck carrying the track and a walkway
  const deckZ = -1.6;
  { const len = 2 * RV + 0.6; const deck = mesh(new THREE.BoxGeometry(len, 0.4, 2.8), mat(PAL.brick)); deck.position.copy(a2(0, deckZ, -0.15)); scene.add(deck); tag(deck, { surface: 'a2' });
    for (let i = 0; i < 9; i++) { const x = -RV + (i + 0.5) * (2 * RV / 9); const pier = mesh(new THREE.BoxGeometry(0.28, 6.2, 2.4), mat(PAL.brick)); pier.position.copy(a2(x - RV / 9, deckZ, -3.3)); if (i) scene.add(pier);
      const arch = mesh(new THREE.TorusGeometry(RV / 9 * 0.95, 0.12, 4, 10, Math.PI), mat(0x7a7068)); arch.position.copy(a2(x, deckZ + 1.2, -1.2)); scene.add(arch); }
    for (const z of [deckZ - 1.35, deckZ + 1.35]) { const wall = mesh(new THREE.BoxGeometry(len, 0.35, 0.12), mat(0x7a7068)); wall.position.copy(a2(0, z, 0.15)); scene.add(wall); } }
  // railway: main line along deckZ - 0.5 across everything; passing loop on the near side; platform beside the main line
  const trackZ = deckZ - 0.5, loopZ = trackZ - 1.6;
  function rails(x0, x1, z) { const len = x1 - x0; for (const dz of [-0.28, 0.28]) { const r = mesh(new THREE.BoxGeometry(len, 0.06, 0.06), mat(PAL.rail)); r.position.copy(a2((x0 + x1) / 2, z + dz, 0.12)); scene.add(r); }
    for (let x = x0; x < x1; x += 0.5) { const s = mesh(new THREE.BoxGeometry(0.14, 0.05, 0.8), mat(0x5a4632)); s.position.copy(a2(x, z, 0.06)); scene.add(s); } }
  rails(-R2 + 0.8, R2 - 0.8, trackZ); rails(-12.8, -4.9, loopZ);
  for (const [xa, xb] of [[-13.6, -12.8], [-4.9, -4.1]]) { const a = a2(xa, xa < -8 ? trackZ : loopZ, 0.1), b = a2(xb, xb < -8 ? loopZ : trackZ, 0.1); const len = a.distanceTo(b); const r = mesh(new THREE.BoxGeometry(0.06, 0.06, len), mat(PAL.rail)); r.position.copy(a).lerp(b, 0.5); r.lookAt(b); scene.add(r); }
  const platform = mesh(new THREE.BoxGeometry(5.6, 0.35, 1.2), mat(0xd8d0c0)); platform.position.copy(a2(-8.2, trackZ + 1.05, 0.17)); scene.add(platform); tag(platform, { surface: 'a2' });
  const haltSign = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.4), new THREE.MeshBasicMaterial({ map: cardTex('NINE ARCH HALT', '#f3c32a', '#2b2b2b') })); haltSign.position.copy(a2(-9.6, trackZ + 1.5, 1.7)); scene.add(haltSign);
  { const roof = mesh(new THREE.BoxGeometry(3.0, 0.08, 1.4), mat(PAL.roofGreen)); roof.position.copy(a2(-7.6, trackZ + 1.2, 2.3)); scene.add(roof); for (const x of [-8.8, -6.4]) { const p = mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.0, 6), mat(0x555555)); p.position.copy(a2(x, trackZ + 1.5, 1.2)); scene.add(p); } }
  const platChests = new THREE.Group(); platChests.visible = false; platChests.position.copy(a2(-7.2, trackZ + 1.4, 0.36)); scene.add(platChests);
  for (let i = 0; i < 9; i++) { const c = mesh(new THREE.BoxGeometry(0.36, 0.32, 0.36), mat(0xa8744a)); c.position.set((i % 5) * 0.4 - 0.8, 0.16 + (i >= 5 ? 0.32 : 0), 0); platChests.add(c); }
  // guard's flag at the halt (the finale)
  const flagPole = new THREE.Group(); flagPole.position.copy(P('H')).add(new THREE.Vector3(0.9, -0.06, 0.6)); scene.add(flagPole);
  { const p = mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6), mat(0x6e4a30)); p.position.y = 0.8; flagPole.add(p); const f = mesh(new THREE.BoxGeometry(0.02, 0.4, 0.6), mat(0x2f8a4a)); f.position.set(0, 1.4, 0.3); flagPole.add(f); const bc = beacon(0xffd27a, 2.4); flagPole.add(bc); flagPole.userData.beacon = bc; }
  tag(flagPole, { item: 'flag' }); items.flag = flagPole;
  // the gate, gatekeeper, timetable board, station clock and three answer clocks
  const gateBar = mesh(new THREE.BoxGeometry(0.08, 0.08, 1.4), mat(0xc8423b)); gateBar.position.copy(P('BR_a')).add(new THREE.Vector3(0.2, 0.9, 0)); scene.add(gateBar);
  const keeper = person(0x3a6ea5, 0x2b2b2b); keeper.position.copy(P('GATE')).add(new THREE.Vector3(-0.2, -0.06, 1.0)); keeper.rotation.y = Math.PI; scene.add(keeper);
  const board = textBoard(['TIMETABLE · NINE ARCH', 'Red local: leaves Ella 3:10', '  Ella → the bridge: 12 min', 'Blue express: leaves Ella 4:05', '  Ella → the bridge: 12 min'], 2.4, 1.2, '#2b2b2b', '#f3efe6', 30);
  board.position.copy(P('GATE')).add(new THREE.Vector3(-1.2, 1.3, 1.6)); board.rotation.y = 0.2; scene.add(board);
  const clockFace = (txt) => canvasTex(128, 128, (x) => { x.fillStyle = '#f3efe6'; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.lineWidth = 5; x.strokeStyle = '#3a2a1a'; x.stroke(); x.fillStyle = '#3a2a1a'; x.font = 'bold 32px Nunito Sans, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 64, 66); });
  const stationClock = new THREE.Mesh(new THREE.CircleGeometry(0.35, 20), new THREE.MeshBasicMaterial({ map: clockFace('3:14') })); stationClock.position.copy(a2(-8.6, trackZ + 1.7, 2.2)); scene.add(stationClock);
  const answers = {}; Object.entries(L.TIMES).forEach(([k, t], i) => { const g = new THREE.Group(); g.position.copy(P('GATE')).add(new THREE.Vector3(-0.6 + i * 0.6, 0, 2.3)); scene.add(g);
    const post = mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 6), mat(0x6e4a30)); post.position.y = 0.5; g.add(post); const f = new THREE.Mesh(new THREE.CircleGeometry(0.26, 18), new THREE.MeshBasicMaterial({ map: clockFace(t) })); f.position.y = 1.2; g.add(f);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 1.1; g.add(hit); tag(g, { item: k }); items[k] = g; answers[k] = g; });
  // signal box with an outdoor lever frame, and two signal posts
  const box = new THREE.Group(); box.position.copy(P('SB')).add(new THREE.Vector3(1.4, -0.06, -1.4)); scene.add(box);
  { const b = mesh(new THREE.BoxGeometry(2.2, 1.4, 1.8), mat(PAL.brick)); b.position.y = 0.7; box.add(b); const top = mesh(new THREE.BoxGeometry(2.4, 1.0, 2.0), mat(PAL.cream)); top.position.y = 1.9; box.add(top); const r = mesh(new THREE.CylinderGeometry(0.01, 1.9, 0.7, 4), mat(0x8a3a2a)); r.rotation.y = Math.PI / 4; r.position.y = 2.75; box.add(r);
    const nm = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.3), new THREE.MeshBasicMaterial({ map: cardTex('SIGNAL BOX', '#f3efe6', '#2b2b2b') })); nm.position.set(0, 2.2, 1.01); box.add(nm); }
  const LEVER_COL = [0x222222, 0x2f5fa8, 0xc8423b, 0xc8423b]; const LEVER_NAME = ['1 POINTS', '2 LOCK', '3 LOOP', '4 PLATFORM'];
  { const fr = mesh(new THREE.BoxGeometry(2.7, 0.12, 0.9), mat(0x6e4a30)); fr.position.copy(P('SB')).add(new THREE.Vector3(-2.12, -0.02, -0.35)); scene.add(fr); }
  const levers = [0, 1, 2, 3].map((i) => { const g = new THREE.Group(); g.position.copy(P('SB')).add(new THREE.Vector3(-3.05 + i * 0.62, -0.06, -0.35)); g.scale.setScalar(1.3); scene.add(g);
    const base = mesh(new THREE.BoxGeometry(0.3, 0.2, 0.5), mat(0x555555)); base.position.y = 0.1; g.add(base); const arm = new THREE.Group(); arm.position.y = 0.2; g.add(arm);
    const rod = mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.1, 6), mat(LEVER_COL[i])); rod.position.y = 0.55; arm.add(rod); const knob = mesh(new THREE.SphereGeometry(0.06, 8, 6), mat(0xd8d0c0)); knob.position.y = 1.1; arm.add(knob);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.2), new THREE.MeshBasicMaterial({ map: cardTex(LEVER_NAME[i], '#f3e6c4', '#2b2b2b') })); lab.position.set(0, 0.24, 0.26); g.add(lab);
    const num = new THREE.Mesh(new THREE.CircleGeometry(0.16, 18), new THREE.MeshBasicMaterial({ map: cardTex(String(i + 1), ['#2b2b2b', '#2f5fa8', '#c8423b', '#c8423b'][i], '#ffffff') })); num.position.set(0, 1.75, 0); g.add(num); g.userData.num = num;
    arm.rotation.x = -0.35; g.userData.arm = arm; const hit = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.4, 0.6), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 0.7; g.add(hit); tag(g, { item: 'L' + (i + 1) }); items['L' + (i + 1)] = g; return g; });
  // signal box diagram: the track layout with live points, lock, signals and trains
  const diagram = { userData: { last: '' }, url: '' }; // drawn into the info panel (never in front of the levers)
  function drawDiagram() { const key = S.Lv.join('') + S.phase; if (diagram.userData.last === key) return; diagram.userData.last = key;
    const tex = canvasTex(640, 320, (x) => { x.fillStyle = '#f4ecd8'; x.fillRect(0, 0, 640, 320); x.strokeStyle = '#3a2a1a'; x.lineWidth = 4; x.strokeRect(2, 2, 636, 316);
      x.fillStyle = '#3a2a1a'; x.font = 'bold 20px Nunito Sans, sans-serif'; x.fillText('NINE ARCH HALT · SIGNAL DIAGRAM', 16, 28);
      x.font = '15px Nunito Sans, sans-serif'; x.fillText('← blue express (from the west)', 16, 300); x.fillText('red local (over the bridge) →', 418, 300);
      // main line and loop
      x.lineWidth = 6; x.strokeStyle = '#555'; x.beginPath(); x.moveTo(20, 200); x.lineTo(620, 200); x.stroke();
      x.beginPath(); x.moveTo(110, 200); x.lineTo(160, 120); x.lineTo(380, 120); x.lineTo(420, 175); x.stroke();
      x.fillStyle = '#d8d0c0'; x.fillRect(160, 212, 220, 26); x.fillStyle = '#3a2a1a'; x.font = '15px Nunito Sans, sans-serif'; x.fillText('PLATFORM · tea chests', 196, 230); x.fillText('PASSING LOOP', 222, 110);
      // points (1) and lock (2)
      const loop = S.Lv[0] === 1; x.lineWidth = 8; x.strokeStyle = '#c8a24a'; x.beginPath(); x.moveTo(470, 200); loop ? x.lineTo(422, 172) : x.lineTo(410, 200); x.stroke();
      x.fillStyle = '#2b2b2b'; x.beginPath(); x.arc(470, 222, 14, 0, 7); x.fill(); x.fillStyle = '#fff'; x.font = 'bold 16px Nunito Sans, sans-serif'; x.fillText('1', 465, 228);
      x.fillStyle = '#3a2a1a'; x.font = '14px Nunito Sans, sans-serif'; x.fillText(loop ? 'points → LOOP' : 'points → MAIN', 488, 228);
      x.fillStyle = '#2f5fa8'; x.beginPath(); x.arc(470, 258, 14, 0, 7); x.fill(); x.fillStyle = '#fff'; x.fillText('2', 466, 263); x.fillStyle = '#3a2a1a'; x.fillText(S.Lv[1] ? '🔒 points locked' : 'unlocked', 488, 263);
      // signals 3 (into the loop) and 4 (along the main line to the platform)
      const sig = (sx, sy, n, off) => { x.fillStyle = '#2b2b2b'; x.fillRect(sx - 3, sy, 6, 34); x.fillStyle = off ? '#3fbf5a' : '#d8442f'; x.beginPath(); x.arc(sx, sy - 6, 12, 0, 7); x.fill(); x.fillStyle = '#c8423b'; x.beginPath(); x.arc(sx + 26, sy + 14, 13, 0, 7); x.fill(); x.fillStyle = '#fff'; x.font = 'bold 15px Nunito Sans, sans-serif'; x.fillText(String(n), sx + 21, sy + 19); };
      sig(440, 76, 3, S.Lv[2] === 1); sig(530, 150, 4, S.Lv[3] === 1);
      // trains
      const tr = (x0, y0, w, col) => { x.fillStyle = col; x.fillRect(x0, y0 - 11, w, 22); x.fillStyle = 'rgba(255,255,255,.7)'; for (let k = x0 + 8; k < x0 + w - 8; k += 16) x.fillRect(k, y0 - 5, 8, 8); };
      if (S.phase === 'start') tr(540, 200, 80, '#a8342f'); else tr(200, 120, 120, '#a8342f');
      if (S.phase === 'expressIn') tr(160, 200, 200, '#2f5fa8'); else tr(20, 200, 70, '#2f5fa8'); });
    diagram.url = tex.image.toDataURL(); }
  drawDiagram();
  function signalPost(x, z) { const g = new THREE.Group(); g.position.copy(a2(x, z)); scene.add(g); const p = mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.0, 6), mat(0xe8e0cc)); p.position.y = 1.5; g.add(p);
    const armS = new THREE.Group(); armS.position.set(0, 2.7, 0.1); g.add(armS); const blade = mesh(new THREE.BoxGeometry(0.8, 0.14, 0.04), mat(0xc8423b)); blade.position.x = 0.4; armS.add(blade); g.userData.arm = armS; return g; }
  const sigLoop = signalPost(-3.6, loopZ - 0.8), sigPlat = signalPost(-3.6, trackZ + 0.7);
  const points = mesh(new THREE.BoxGeometry(1.1, 0.07, 0.07), mat(0xd8d0c0)); points.position.copy(a2(-4.5, (trackZ + loopZ) / 2 + 0.6, 0.14)); scene.add(points);
  // trains
  function train(color, n) { const g = new THREE.Group(); for (let i = 0; i < n; i++) { const c = new THREE.Group(); c.position.x = -i * 2.1; g.add(c);
      const body = mesh(new THREE.BoxGeometry(2.0, 1.0, 1.0), mat(i === 0 ? 0x2b2b2b : color)); body.position.y = 0.75; c.add(body); const roof = mesh(new THREE.BoxGeometry(2.0, 0.12, 1.05), mat(0x8a8a8a)); roof.position.y = 1.31; c.add(roof);
      if (i) for (let k = 0; k < 4; k++) { const w = mesh(new THREE.BoxGeometry(0.3, 0.3, 1.02), mat(0xe8e0c8)); w.position.set(-0.7 + k * 0.47, 0.9, 0); c.add(w); }
      for (const x of [-0.7, 0.7]) for (const z of [-0.4, 0.4]) { const wh = mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 10), mat(0x222222)); wh.rotation.x = Math.PI / 2; wh.position.set(x, 0.18, z); c.add(wh); } }
    scene.add(g); return g; }
  const express = train(PAL.blueTrain, 5), local = train(PAL.redTrain, 3);
  const TR = window.__TR = { local: { x: 16, z: trackZ, dir: -1, goal: null }, express: { x: -22, z: trackZ, dir: 1, goal: null } };
  express.visible = false;
  // the waterfall: cliff, falling water, pool, the cave behind
  const cliff = new THREE.Group(); cliff.position.copy(a2(8.6, -10.2, 0)); scene.add(cliff);
  for (let i = 0; i < 7; i++) { const r = mesh(new THREE.DodecahedronGeometry(1.0 + hash(i, 2, 8) * 0.5, 0), mat(i % 2 ? 0xc8844a : 0xb06a3a)); r.scale.set(1.2, 1.0, 0.9); r.position.set((i % 3 - 1) * 1.1, 0.6 + Math.floor(i / 3) * 1.5, (hash(i, 3, 8) - 0.5) * 0.8); cliff.add(r); }
  { const top = mesh(new THREE.IcosahedronGeometry(1.4, 0), mat(PAL.jungle)); top.scale.y = 0.5; top.position.set(0, 4.6, 0); cliff.add(top); }
  const fall = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 5.6), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, roughness: 0.1 })); fall.position.copy(a2(8.0, -9.0, 2.6)); fall.rotation.y = -0.8; fall.scale.y = 0.9; scene.add(fall);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1.6, 22), new THREE.MeshStandardMaterial({ color: PAL.water, roughness: 0.15 })); pool.rotation.x = -Math.PI / 2; pool.position.copy(a2(6.8, -7.9, 0.04)); scene.add(pool);
  const spray = new THREE.Group(); spray.position.copy(a2(7.4, -8.6, 0.3)); scene.add(spray);
  for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false })); m.position.set((hash(i, 1, 9) - 0.5) * 1.2, hash(i, 2, 9) * 1.2, (hash(i, 3, 9) - 0.5) * 1.2); spray.add(m); }
  for (let i = 0; i < 5; i++) { const r = mesh(new THREE.DodecahedronGeometry(0.4, 0), mat(0x8a8078)); r.scale.y = 0.5; r.position.copy(P('WF').lerp(P('WF_cave'), (i + 0.5) / 5)).setY(0.1); scene.add(r); }
  const leaf = mesh(new THREE.BoxGeometry(0.5, 0.04, 0.14), mat(0xd9be8a)); leaf.position.copy(P('WF_cave')).add(new THREE.Vector3(0.5, 0.1, 0.4)); scene.add(leaf); tag(leaf, { item: 'leaf' }); items.leaf = leaf;
  const SPRAY_T = 5;
  const sprayOn = (t) => Math.sin((t / SPRAY_T) * Math.PI * 2) > -0.2;
  // jungle, tea and a flame tree on the far side
  for (let i = 0; i < 24; i++) { const side = i % 2 ? 1 : -1; const x = side * (RV + 1.2 + hash(i, 8, 1) * 6.5), z = (hash(i, 9, 1) - 0.5) * 20; const p = a2(x, z); if (p.distanceTo(A2) > R2 - 0.8) continue;
    const near = Object.keys(L.NODES).some((id) => L.areaOf(id) === 2 && P(id).distanceTo(p) < 1.6) || Math.abs(z - trackZ) < 1.4 || Math.abs(z - loopZ) < 1.0 || p.distanceTo(cliff.position) < 2.6; if (near) continue;
    const t = i % 5 === 0 ? flameTree() : (() => { const b = mesh(new THREE.IcosahedronGeometry(0.6 + hash(i, 3, 3) * 0.4, 0), mat(i % 3 ? PAL.jungle2 : PAL.tea)); b.position.y = 0.4; const g = new THREE.Group(); g.add(b); return g; })(); t.position.copy(p); scene.add(t); }
  // little viewpoint figures on the far hill (the finale crowd)
  const watchers = []; for (let i = 0; i < 4; i++) { const p = person([0xd04a6a, 0x3a8a8a, 0xe8a23a, 0xf3efe6][i], 0x333333); p.position.copy(a2(-10.5 + i * 0.7, 4.8 + (i % 2) * 0.5)); p.rotation.y = Math.PI; p.scale.setScalar(0.001); scene.add(p); watchers.push(p); }

  /* ---------- context panel: the numbers for whatever she's working on ---------- */
  document.body.insertAdjacentHTML('beforeend', '<div id="panel" class="card"></div>');
  const panel = $('panel');
  document.body.insertAdjacentHTML('beforeend', '<div id="sbox" class="card"></div>');
  const sbox = $('sbox');
  const LV_INFO = [['Points', 'MAIN line', 'LOOP siding', '#2b2b2b'], ['Lock', 'off', 'ON', '#2f5fa8'], ['Loop signal', 'red', 'GREEN', '#c8423b'], ['Platform signal', 'red', 'GREEN', '#c8423b']];
  sbox.addEventListener('pointerup', (e) => { const b = e.target.closest('.lv'); if (!b) return; e.stopPropagation(); window.__game.interactAt('L' + b.dataset.i); });
  sbox.addEventListener('pointerdown', (e) => e.stopPropagation());
  let lastSbox = '';
  function refreshSbox() {
    const on = S.player === 'SB' && S.phase !== 'expressIn'; sbox.classList.toggle('on', on); if (!on) { lastSbox = ''; return; }
    const key = S.Lv.join('') + S.phase; if (key === lastSbox) return; lastSbox = key; drawDiagram();
    const [pt, lk, s3, s4] = S.Lv; const free = [0, 1, 2, 3].map((i) => L.leverFree(S, i)); const why = ['', '', '', ''];
    if (!free[0]) why[0] = lk ? 'Lock is on: take it off (2) first' : 'Put the signals back to red first';
    if (!free[1]) why[1] = 'Put the signals back to red first';
    if (!free[2]) why[2] = s4 ? 'Signal 4 must be red first' : !pt ? 'Points must go to the LOOP' : 'Lock the points first (2)';
    if (!free[3]) why[3] = s3 ? 'Signal 3 must be red first' : pt ? 'Points must go to the MAIN line' : 'Lock the points first (2)';
    const goal = S.phase === 'start'
      ? '<b>Step A:</b> let the <span style="color:#a8342f">red local</span> into the passing <b>loop</b>, so the line is clear. (Points to LOOP → lock → loop signal green.)'
      : '<b>Step B:</b> the red local is safe in the loop ✓. Now bring the <span style="color:#2f5fa8">blue express</span> to the <b>platform</b>: put signal 3 back to red, unlock, set the points to MAIN, lock, then platform signal green.';
    sbox.innerHTML = `<h4>Signal box · Nine Arch Halt</h4><div class="row"><img src="${diagram.url}" alt="track diagram"><div class="levers">${[0, 1, 2, 3].map((i) => `
      <button class="lv ${S.Lv[i] ? 'pulled' : ''} ${free[i] ? '' : 'locked'}" data-i="${i + 1}"><span class="num">${i + 1}</span><span class="knob"></span><span class="stick" style="background:${LV_INFO[i][3]}"></span>
      <span>${LV_INFO[i][0]}</span><span class="st">${S.Lv[i] ? LV_INFO[i][2] : LV_INFO[i][1]}</span><span class="why">${free[i] ? 'tap to ' + (S.Lv[i] ? 'put back' : 'pull') : '🔒 ' + why[i]}</span></button>`).join('')}</div></div>
      <ul class="rules"><li><b>Points (1)</b> choose the route: the MAIN line to the platform, or the LOOP siding beside it.</li><li><b>Lock (2)</b> clamps the points. A signal can only turn green when the points are locked, and locked points can’t move.</li><li><b>Signals (3, 4)</b> let one train in. Put a signal back to red before changing anything else.</li></ul>
      <div class="goal">${goal}</div>`;
  }
  function panelHTML() {
    const p = S.player; const ok = (b, t, f) => (b ? `<span class="ok">${t}</span>` : `<span class="no">${f}</span>`);
    if (p === 'T3' && !S.weighed) { const parts = L.SACKS.filter((_, i) => S.pan[i]); const w = L.panWeight(S);
      return `<b class="h">The weighing shed</b><br>Left pan: ${S.shoots >= 6 ? 'your first-flush basket (2 kg)' : '<i>first-flush basket not picked yet</i>'}${parts.length ? ' + ' + parts.map((x) => x + ' kg').join(' + ') : ''}<br>= <b>${w} kg</b> &nbsp;vs&nbsp; right pan: <b>20 kg</b> ${ok(w === 20 && S.shoots >= 6, '✓ balanced', w > 20 ? '↓ too heavy' : '↑ too light')}<br><small>Tap a sack to put it on the pan or take it off.</small>`; }
    if (['LAKE', 'G2', 'G3'].includes(p)) { const f = L.flows(S.G); const bar = (n) => `<span class="bar" style="width:${n * 14}px"></span> ${n}`;
      return `<b class="h">Water from the reservoir: 4 units</b><br>Gate 1: ${gates[0].userData.modes[S.G[0]]}<br>Gate 2 (upper): ${gates[1].userData.modes[S.G[1]]}<br>Gate 3 (lower): ${gates[2].userData.modes[S.G[2]]}<br>Wheel ${bar(f.wheel)} (needs 3) ${ok(f.wheel >= 3, '✓', '✗')}<br>Nursery ${bar(f.nursery)} (needs 1) ${ok(f.nursery >= 1, '✓', '✗')}`; }
    if (p === 'F_door' && !S.made) return `<b class="h">The factory line</b><br>${S.slots.map((v, i) => `${i + 1}. ${L.STAGES[v]}`).join('<br>')}<br><small>Tea is made in this order: wither the leaf, roll it, let it oxidise, dry it, then sort it into grades.</small><br>Power: ${ok(L.powered(S), 'wheel turning', 'no water power')} · Leaf: ${ok(S.sackDown, 'delivered', 'not here yet')}`;
    if (p === 'F_yard' && S.made && !S.chests) { const b = S.blend; return `<b class="h">Blending · the broker’s order</b><br>9 chests in all · twice as much BOP as FBOP · at most 2 Dust · no Fannings<br>BOP <b>${b.B}</b> · FBOP <b>${b.F}</b> · Dust <b>${b.D}</b> · Fannings <b>${b.N}</b> = <b>${L.blendTotal(b)}/9</b> ${ok(L.blendOk(b), '✓ ready to seal', '')}<br><small>Tap a bin to fill a chest; the grey lever empties them all.</small>`; }
    if (p === 'GATE' && !S.gateOpen) return `<b class="h">The bridge gate</b><br>“When will the next train be on the bridge?”<br>Station clock: <b>3:14</b>. Read the timetable board, then tap the right clock.`;
    if (p === 'SB' && S.phase !== 'expressIn') return '';
    if (p === 'SB') { const [pt, lk, s3, s4] = S.Lv; const free = [0, 1, 2, 3].map((i) => L.leverFree(S, i));
      const why = ['', '', '', '']; if (!free[0]) why[0] = lk ? 'take the lock (2) off first' : 'put the signals back first'; if (!free[1]) why[1] = 'put the signals back first';
      if (!free[2]) why[2] = s4 ? 'signal 4 must be back first' : !pt ? 'points (1) must be set to LOOP' : 'points must be locked (2)'; if (!free[3]) why[3] = s3 ? 'signal 3 must be back first' : pt ? 'points (1) must be set to MAIN' : 'points must be locked (2)';
      const row = (i, txt) => `<b>${i + 1}</b> ${txt}${free[i] ? '' : ` <span class="no">🔒 ${why[i]}</span>`}`;
      drawDiagram(); return `<b class="h">Signal box · one line, one passing loop</b><br><img src="${diagram.url}" style="width:100%;max-width:320px;border-radius:6px;margin:4px 0"><br>${row(0, `Points → <b>${pt ? 'LOOP' : 'MAIN'}</b>`)}<br>${row(1, `Lock: <b>${lk ? 'ON' : 'off'}</b>`)}<br>${row(2, `Loop signal (red local): <b>${s3 ? 'GREEN' : 'red'}</b>`)}<br>${row(3, `Platform signal (blue express): <b>${s4 ? 'GREEN' : 'red'}</b>`)}<br>
        <small>Goal: first the red local into the loop, then the blue express to the platform. Tap a lever to pull it or put it back.</small><br>Now: ${S.phase === 'start' ? 'red local waiting by the bridge' : S.phase === 'localIn' ? '<span class="ok">red local in the loop ✓</span>' : '<span class="ok">blue express at the platform ✓</span>'}`; }
    return '';
  }
  let lastPanel = '';
  function refreshPanel() { const h = panelHTML(); if (h !== lastPanel) { panel.innerHTML = h; lastPanel = h; } panel.classList.toggle('on', !!h); }

  /* ================= VIEW SYNC & STORY ================= */
  const nodePos = (id) => P(id);
  function surfaceTarget(kind, point) {
    if (kind === 'lorry') { if (S.player !== 'F_yard') return 'F_yard'; if (!S.chests) { label('The lorry won’t leave without the sealed auction chests.', 3200); E.bump(); return null; } return 'L_drop'; }
    const ids = Object.keys(L.NODES).filter((id) => (kind === 'a2' ? L.areaOf(id) === 2 : L.areaOf(id) === 1));
    let best = null, bd = 1e9; for (const id of ids) { const n = P(id); const d = Math.hypot(n.x - point.x, n.z - point.z) + Math.abs(n.y - point.y) * 0.8; if (d < bd) { bd = d; best = id; } } return best;
  }
  function edgePoints(e, from, to) {
    if (e.kind === 'lorry') { const out = []; const path = from === 'F_yard' ? [roadA, roadB, P(to)] : [roadB, roadA, P(to)]; let prev = P(from); for (const q of path) { const n = Math.max(2, Math.round(prev.distanceTo(q) / 0.5)); for (let k = 1; k <= n; k++) out.push(prev.clone().lerp(q, k / n)); prev = q; } return out; }
    if (e.kind === 'mist' || e.kind === 'spray' || e.kind === 'viaduct') { const a = P(from), b = P(to); const out = []; for (let i = 1; i <= 14; i++) out.push(a.clone().lerp(b, i / 14)); return out; }
    return null;
  }
  function holdEdge(e, c) {
    if (c.d > 0) return false;
    if (e.kind === 'mist') { const on = mistOn(e.mist); if (on && !c.told) { c.told = true; label('Thick mist on the steps. Wait for it to drift off…', 2600); } return on; }
    if (e.kind === 'spray') { const on = sprayOn(clock2); if (on && !c.told) { c.told = true; label('The spray is too thick to see the stepping stones. Wait for a gap…', 2600); } return on; }
    return false;
  }
  let riding = false;
  function onEdgeStart(e) { if (e.kind === 'lorry') { riding = true; bell(440); label('The estate lorry grinds down the hairpins to the Nine Arch halt with nine chests of first flush.', 4200); } }
  function onArrive(node, e, stop) {
    if (e && e.kind === 'lorry') { riding = false; if (node === 'L_drop') { platChests.visible = true; lorry.userData.load.visible = false; setTimeout(() => label('The chests are stacked on the platform. But the signal box is across the bridge, and the gatekeeper has questions.', 5200), 600); } }
    const ev = stop ? L.stepOn(S, node) : null;
    if (ev) { click(); ropeT.target = ev.on ? 1 : 0; grind(1.2); const p0 = cw.userData.plat.position.y; anims.push({ t: 0, dur: 0.4, f: (k) => (cw.userData.plat.position.y = p0 + ((ev.on ? -0.1 : 0.06) - p0) * k) });
      label(ev.sent ? 'Your weight drops the platform; the counterweight rises and the sack of leaf flies down the wire to the factory!' : ev.on ? 'The platform sinks and the empty hook runs down the wire.' : 'You step on again and the hook runs back up the wire.', 4600); }
    refreshPanel();
  }
  const MSG = {
    panNoBasket: 'The beam won’t settle: your first-flush basket isn’t picked yet. It weighs 2 kg.',
    balanced: 'The beam hangs perfectly level: exactly 20 kg. The leaf is tipped into one sack and tied off.',
    hookEmpty: 'Nothing to send down yet. Weigh the leaf first.', hooked: 'You hang the sack on the ropeway hook.', hookDown: 'The hook is down at the factory. Step on the counterweight to bring it back up.',
    gatePower: 'The water wheel creaks, then spins! The nursery seedlings get their trickle too.',
    runNoLeaf: 'No leaf at the factory yet. Send it down the ropeway.', runNoPower: 'The line won’t run without power. The water wheel needs at least 3 units, and the nursery must still get its 1.',
    runWrongOrder: 'The machines grind and the leaf comes out wrong. Check the order: how is tea made?',
    made: 'The line hums: withered, rolled, oxidised, dried, sorted. Fragrant made tea pours into the grade bins.',
    binsEmpty: 'The bins are empty until the factory has run.', binsFull: 'All nine chests are full. Seal them, or empty them and start again.',
    sealWrong: 'The broker’s clerk shakes his head: that doesn’t match the order. Read the letter again.',
    sealed: 'Stamped and stencilled: nine chests of first-flush BOP and FBOP, ready for the Colombo auction.',
    wrongTime: '“No, no! That would put you on the bridge with a train. Read the board again.”',
    gateOpen: '“3:22, exactly. And the local is held at the signal until the box lets it into the loop. Off you go, the bridge is yours!”',
    locked: 'The lever won’t budge: it’s interlocked. Something else has to be set first.',
    standoff: 'The express comes round the bend and stops nose to nose with the red local on the single line! Both whistle crossly. The local must be in the loop first. Lever 4 goes back.',
    localIn: 'The red local rolls over the arches and curls into the passing loop. Now put signal 3 back, and set up the main line.',
    expressIn: 'The blue express sweeps round and stops at the halt. Porters load the nine chests!', flagNoTrain: 'There’s no train at the platform to wave off yet.',
    lever: 'Clunk. The lever moves and the rods rattle down the line.', leaf: '<em>Puskola</em> · an ola-leaf page, dry in the cave behind the waterfall',
  };
  function setStation(i) { stations[i].userData.card.material.map = cardTex(L.STAGES[S.slots[i]], STAGE_COL[S.slots[i]], '#fff'); }
  for (let i = 0; i < 5; i++) setStation(i);
  function setGate(i) { const g = gates[i]; g.userData.card.material.map = cardTex(g.userData.modes[S.G[i]], '#f3e6c4', '#3a2a1a'); }
  function fillChests() { const order = []; for (const k of L.GRADES) for (let n = 0; n < S.blend[k]; n++) order.push(k); chestMeshes.forEach((c, i) => { c.visible = i < order.length; if (order[i]) c.material = mat([0xc8423b, 0x2f6db4, 0x7a5a3a, 0x8a8a2a][L.GRADES.indexOf(order[i])]); }); }
  function setLevers() { levers.forEach((g, i) => { const a = g.userData.arm; const r = S.Lv[i] ? 0.45 : -0.35; anims.push({ t: 0, dur: 0.3, f: (k) => (a.rotation.x += (r - a.rotation.x) * k) }); });
    anims.push({ t: 0, dur: 0.4, f: (k) => { points.rotation.y = (S.Lv[0] ? 0.35 : 0) * k + points.rotation.y * (1 - k); sigLoop.userData.arm.rotation.z = (S.Lv[2] ? -0.7 : 0); sigPlat.userData.arm.rotation.z = (S.Lv[3] ? -0.7 : 0); } }); }
  function onResult(r, what) {
    if (/^sack\d$/.test(what) && (r === 'pan' || r === 'panNoBasket' || r === 'balanced')) { placeSacks(); click(); }
    switch (r) {
      case 'balanced': bell(880); sparkle(scale, 3); setTimeout(() => { sacks.forEach((s, i) => { if (S.pan[i]) s.visible = false; }); basket.visible = false; leafSack.visible = false; }, 1200); setTimeout(() => label('Now hang it on the ropeway at the tower.', 3000), 4000); break;
      case 'panNoBasket': bubble(scale, 'shoot', { count: 6, filled: S.shoots, offset: 1.0 }); break;
      case 'hooked': leafSack.visible = true; bell(660); break;
      case 'hookEmpty': bubble(hookPost, 'sack', { offset: 2.6 }); bump(); break;
      case 'gate': case 'gatePower': { const i = +what[1] - 1; const w = gates[i].userData.wheel; const z0 = w.rotation.z; anims.push({ t: 0, dur: 0.5, f: (k) => (w.rotation.z = z0 - k * Math.PI) }); grind(0.5); setGate(i); E.stats.turns++; if (r === 'gatePower') bell(784); break; }
      case 'stage': { const i = +what[2]; setStation(i); click(); break; }
      case 'runNoLeaf': bubble(runLever, 'sack', { offset: 1.6 }); bump(); break;
      case 'runNoPower': bubble(runLever, 'drop', { offset: 1.6 }); bump(); break;
      case 'runWrongOrder': stations.forEach((s) => (s.userData.jig = 0.6)); grind(0.8); bump(); break;
      case 'made': grind(2.2); bell(988); anims.push({ t: 0, dur: 0.4, f: (k) => (runLever.userData.h.rotation.z = 0.5 - k) }); stations.forEach((s, i) => setTimeout(() => sparkle(s, 1), i * 300)); setTimeout(() => label('Head to the blending yard: the broker’s order letter is pinned by the bins.', 3600), 5200); break;
      case 'fill': case 'cleared': fillChests(); click(); break;
      case 'binsFull': bump(); break;
      case 'sealWrong': bubble(stamp, 'chest', { offset: 1.5 }); bump(); break;
      case 'sealed': bell(784); bell(988, 0.2); chestMeshes.forEach((c) => (c.visible = false)); lorry.userData.load.visible = true; sparkle(lorry, 3); setTimeout(() => label('The chests are loaded on the estate lorry. Tap the lorry to ride down to the Nine Arch halt.', 4200), 4800); break;
      case 'wrongTime': bubble(keeper, 'clock', { offset: 2.1 }); bump(); break;
      case 'gateOpen': bell(660); anims.push({ t: 0, dur: 0.8, f: (k) => (gateBar.rotation.x = -k * 1.4) }); break;
      case 'locked': bubble(items[what], 'lock', { offset: 1.6 }); bump(); break;
      case 'lever': case 'localIn': case 'expressIn': case 'standoff': setLevers(); click(); E.stats.turns++;
        if (r === 'localIn') { TR.local.goal = 'loop'; bell(523); }
        if (r === 'expressIn') { express.visible = true; TR.express.x = -22; TR.express.goal = 'platform'; bell(659); setTimeout(() => { platChests.visible = false; }, 5200); }
        if (r === 'standoff') { express.visible = true; TR.express.x = -22; TR.express.goal = 'standoff'; E.shake(0.2); }
        break;
      case 'flagNoTrain': bump(); break;
      case 'leaf': leaf.visible = false; bell(988); bell(1318, 0.15); E.refresh(); break;
      case 'win': finale(); E.win(); break;
    }
    refreshPanel();
  }
  function placeSacks() { let k = 0; sacks.forEach((s, i) => { const to = S.pan[i] ? new THREE.Vector3(0.9 - 0.75 + (k % 2) * 0.22 - 0.11, 0.0, 0.35 + Math.floor(k++ / 2) * 0.0) : s.userData.home; s.userData.onPan = S.pan[i]; s.userData.to = to; });
    basket.visible = S.shoots >= 6; }
  function finale() {
    document.body.classList.add('won'); bell(784); bell(988, 0.3); bell(1175, 0.6);
    TR.express.goal = 'depart'; TR.local.goal = 'stay';
    watchers.forEach((w, i) => setTimeout(() => anims.push({ t: 0, dur: 0.6, f: (k) => w.scale.setScalar(Math.max(0.001, k)) }), 400 + i * 200));
    let turns = 0; const spin = setInterval(() => { cam.azTo += Math.PI / 2; if (++turns >= 4) clearInterval(spin); }, 2800);
    E.playAction('wave', { speed: 1 });
  }
  function tapHidden(k) {
    if (k[0] === 'x') { label(k === 'xone' ? 'Only one leaf on this shoot: not quite. First flush is two leaves and a bud.' : 'Big, dark, leathery leaves: that’s old coarse leaf, not the first flush.', 3200); bump(); return; }
    const r = L.tap(S, k); if (!r) return; E.progress(); const i = +k[1]; const s = shoots[i];
    bell(700 + S.shoots * 70); label(`Two leaves and a bud: perfect (${S.shoots}/6)`, 1800);
    const from = s.position.clone(); anims.push({ t: 0, dur: 0.8, f: (e) => { const to = girl.userData.orbit.getWorldPosition(new THREE.Vector3()); s.position.lerpVectors(from, to, e); s.position.y += Math.sin(e * Math.PI) * 0.8; s.scale.setScalar(1.6 - e); },
      done: () => { s.visible = false; if (S.shoots >= 6) { girl.userData.orbit.clear(); label('Six perfect shoots: the first-flush basket is full (2 kg). Take it to the weighing shed on the top terrace.', 4800); } else { const mini = shoot('perfect'); mini.scale.setScalar(0.6); girl.userData.orbit.add(mini); } E.refresh(); refreshPanel(); } });
  }
  const actionFor = { hook: () => S.weighed && !S.hooked && 'place', run: () => 'place', seal: () => 'place', flag: () => S.phase === 'expressIn' && 'place', leaf: () => 'pickup', L1: () => null, L2: () => null, L3: () => null, L4: () => null,
    g1: () => 'place', g2: () => 'place', g3: () => 'place', tA: () => 'place', tB: () => 'place', tC: () => 'place' };
  function unreachable(what) { if (/^L\d/.test(what) || what === 'leaf') label('That’s across the bridge. The gatekeeper has to let you over first.', 3200); }
  function hintTarget() {
    if (L.areaOf(S.player) === 1) {
      if (S.shoots < 6) { const s = shoots.find((x) => x.visible); return { obj: s, words: ['Perfect shoots have exactly two pale leaves and a little bud on top. Check every terrace (and wait for the mist on the steps).'] }; }
      if (!S.weighed) return { obj: scale, words: ['Basket 2 kg + sacks must make 20 kg. Which sacks add up to 18?'] };
      if (!S.hooked) return { obj: hookPost, words: ['Hang the sack on the ropeway hook by the tower.'] };
      if (!S.sackDown) return { obj: cw, words: ['Stand on the counterweight platform beside the tower.'] };
      if (!L.powered(S)) { const f = L.flows(S.G); return { obj: gates[0], words: [`The wheel needs 3 and the nursery 1, from 4 in total. Try splitting the water at gate 1, then splitting again on one side. (Now: wheel ${f.wheel}, nursery ${f.nursery})`] }; }
      if (!L.orderRight(S)) { const i = S.slots.findIndex((v, k) => v !== k); return { obj: stations[i], words: ['Tea is made: wither → roll → oxidise → dry → sort. Tap a machine to change it.'] }; }
      if (!S.made) return { obj: runLever, words: ['Pull the start lever.'] };
      if (!S.chests) return { obj: L.blendTotal(S.blend) === 9 ? stamp : bins.B, words: ['9 chests, BOP twice FBOP, no Fannings: if FBOP is f, BOP is 2f, so 3f = 9…'] };
      return { obj: lorry, words: ['Tap the lorry to ride to the halt.'] };
    }
    if (!S.gateOpen) return { obj: board, words: ['The red local leaves Ella at 3:10 and takes 12 minutes to the bridge.'] };
    if (S.phase !== 'expressIn') { const free = [0, 1, 2, 3].map((i) => L.leverFree(S, i));
      const want = S.phase === 'start' ? (S.Lv[0] === 0 ? 0 : S.Lv[1] === 0 ? 1 : 2) : (S.Lv[2] ? 2 : S.Lv[0] ? (S.Lv[1] ? 1 : 0) : S.Lv[1] === 0 ? 1 : 3);
      return { obj: levers[want], words: [S.phase === 'start' ? 'Route the red local into the loop: points over (1), lock them (2), then the loop signal (3).' : 'Now put signal 3 back, unlock (2), points back to the main line (1), lock again (2), then the platform signal (4).'] }; }
    return { obj: flagPole, words: ['Go back over the bridge and wave the guard’s flag at the halt.'] };
  }
  function inventory(s) { return { shoot: !s.weighed && s.shoots ? `${s.shoots}/6` : '', sack: s.weighed && !s.sackDown, chest: s.chests && !s.won, leaf: s.has.leaf }; }

  /* ---------- camera, time, motion ---------- */
  const tod = { k: 0 }; let clock2 = 0;
  function focus() { let f = L.areaOf(S.player) === 2 ? 1 : 0; if (riding) { const d = roadB.clone().sub(roadA); f = THREE.MathUtils.clamp(girl.position.clone().sub(roadA).dot(d) / d.lengthSq(), 0, 1); }
    const k = f * f * (3 - 2 * f); return { target: new THREE.Vector3(0.5, 1.6, 0).lerp(A2.clone().add(new THREE.Vector3(0, 1.2, 0)), k), zoom: 1, k }; }
  const skyA = { sun: new THREE.Color(0xf4f2ea), hemi: new THREE.Color(0xeef2ee), fog: new THREE.Color(0xe6ece4) };
  const skyB = { sun: new THREE.Color(0xffc890), hemi: new THREE.Color(0xf3dcc0), fog: new THREE.Color(0xf0dcc0) };
  const skyC = { sun: new THREE.Color(0xd08080), hemi: new THREE.Color(0xa080a8), fog: new THREE.Color(0x9a7a9a) };
  function moveTrain(g, st, dt) {
    let target = null, speed = 3.2;
    if (g === local) { if (st.goal === 'loop' || st.goal === 'stay') target = -11.9; else if (st.goal === null) target = 6.4 + RV; else target = st.x; }
    const localClear = TR.local.x < -11.8; // the express never moves onto shared track until the local is parked in the loop
    if (g === express && (st.goal === 'platform' || st.goal === 'depart') && !localClear) target = st.x;
    else if (g === express) { if (st.goal === 'platform') target = -6.0; else if (st.goal === 'standoff') target = -11.5; else if (st.goal === 'depart') { target = 40; speed = 4.5; } }
    if (target !== null) { const d = target - st.x; st.x += Math.sign(d) * Math.min(Math.abs(d), speed * dt); if (st.goal === 'standoff' && Math.abs(d) < 0.05) { st.goal = 'back'; } }
    if (g === express && st.goal === 'back') { st.x -= 4 * dt; if (st.x < -22) { st.goal = null; express.visible = false; } }
    // the local turns into the loop on the near side
    g.position.copy(a2(st.x, trackZ, 0.15));
    if (g === local) g.children.forEach((c, i) => { const cx = st.x + i * 2.1; const inLoop = st.goal === 'loop' || st.goal === 'stay';
      const f = inLoop ? THREE.MathUtils.smoothstep(-cx, 4.1, 4.9) : 0; c.position.z = -(loopZ - trackZ) * f; }); g.rotation.y = st.dir > 0 ? 0 : Math.PI; if (g === express) g.rotation.y = 0;
  }
  function tick(dt, t) {
    mistClock += dt; clock2 += dt;
    // mist banks drift
    mists.forEach((m, i) => { const on = mistOn(i); m.children.forEach((c, k) => { c.material.opacity += ((on ? 0.7 : 0.06) - c.material.opacity) * Math.min(1, dt * 1.5); }); m.position.x = m.userData.c.x + Math.sin(t * 0.3 + i) * 0.6; });
    // sacks slide to and from the pan
    sacks.forEach((s) => { if (s.userData.to) { s.position.lerp(s.userData.to, Math.min(1, dt * 6)); } });
    { const w = L.panWeight(S); const tilt = THREE.MathUtils.clamp((20 - w) * 0.035, -0.35, 0.35); beam.rotation.z += ((S.weighed ? 0 : tilt) - beam.rotation.z) * Math.min(1, dt * 3);
      // sacks on the pan ride with the left pan
      const lp = beam.userData.left.getWorldPosition(new THREE.Vector3()); const lpl = shed.worldToLocal(lp); let k = 0; sacks.forEach((s, i) => { if (S.pan[i] && !S.weighed) { s.userData.to = lpl.clone().add(new THREE.Vector3((k % 3) * 0.18 - 0.18, 0.03 + Math.floor(k / 3) * 0.3, 0)); k++; } });
      if (basket.visible) basket.position.copy(lpl).add(new THREE.Vector3(0.2, 0.18, 0.16)); }
    // ropeway carriage
    ropeT.k += (ropeT.target - ropeT.k) * Math.min(1, dt * 0.9); carriage.position.lerpVectors(topWheel, botWheel, ropeT.k); carriage.position.y -= 0.12;
    if (S.sackDown && ropeT.k > 0.95 && leafSack.visible) { leafSack.visible = false; sparkle(factory, 2); label('The sack arrives at the factory. Now get the water wheel turning.', 3600); }
    cw.userData.box.position.y = 1.2 + (ropeT.k) * 0.9;
    // water in the channels
    { const f = L.flows(S.G); const set = (arr, n) => arr.forEach((g) => { const w = g.userData.w; const tgt = Math.max(0.05, n / 4); w.scale.x += (tgt - w.scale.x) * Math.min(1, dt * 3); w.scale.y = 1 + n * 3; w.position.y = 0.1 + n * 0.02; w.visible = n > 0; w.material.opacity = 0.75 + Math.sin(t * 6 + g.id) * 0.1; });
      const upW = S.G[1] === 0 ? f.up : S.G[1] === 2 ? f.up / 2 : 0, upN = S.G[1] === 1 ? f.up : S.G[1] === 2 ? f.up / 2 : 0, loW = S.G[2] === 0 ? f.low : 0, loN = S.G[2] === 1 ? f.low : 0;
      set(CH.up, f.up); set(CH.low, f.low); set(CH.upWheel, upW); set(CH.upNurs, upN); set(CH.lowWheel, loW); set(CH.lowNurs, loN);
      Object.values(bins).forEach((b) => b.userData.sign.quaternion.copy(E.camera.quaternion));
      waterWheel.rotation.x += (f.wheel >= 3 ? 1.6 : f.wheel * 0.25) * dt; drawGauge(gaugeWheel, f.wheel, 3); drawGauge(gaugeNurs, f.nursery, 1); gaugeWheel.quaternion.copy(E.camera.quaternion); gaugeNurs.quaternion.copy(E.camera.quaternion);
      nursery.children.forEach((c) => { if (c.userData.seed) c.material.color.setHex(f.nursery >= 1 ? PAL.teaLight : 0xb8a85a); }); }
    stations.forEach((s, i) => { if (s.userData.jig > 0) { s.userData.jig -= dt; s.rotation.y = Math.sin(t * 30) * 0.06; } else s.rotation.y = 0; if (S.made || (L.powered(S) && S.sackDown)) s.userData.drum.rotation.x += dt * (S.made ? 4 : 1); });
    runLever.userData.beacon.visible = S.sackDown && L.powered(S) && L.orderRight(S) && !S.made;
    stamp.userData.beacon.visible = S.made && !S.chests && L.blendOk(S.blend);
    lorry.userData.beacon.visible = S.chests && S.player === 'F_yard' && !riding;
    flagPole.userData.beacon.visible = S.phase === 'expressIn' && !S.won;
    if (riding) { lorry.position.copy(girl.position).setY(0); lorry.rotation.y = girl.rotation.y; if (E.hero.model) E.hero.model.visible = false; } else if (E.hero.model) E.hero.model.visible = true;
    if (!riding && L.areaOf(S.player) === 2 && lorry.position.distanceTo(P('L_drop')) > 4) { lorry.position.copy(P('L_drop')).add(new THREE.Vector3(-1.6, -0.06, 1.4)); lorry.rotation.y = -Math.PI / 2; }
    // waterfall and spray
    fall.material.opacity = 0.7 + Math.sin(t * 12) * 0.08; const sp = sprayOn(clock2); spray.children.forEach((c, i) => { c.material.opacity += ((sp ? 0.55 : 0.05) - c.material.opacity) * Math.min(1, dt * 2); c.position.y = ((t * 0.6 + i * 0.13) % 1.4); });
    // trains
    moveTrain(local, TR.local, dt); moveTrain(express, TR.express, dt);
    // levers of the frame show padlocks when locked (tint)
    levers.forEach((g, i) => { g.userData.arm.children[0].material = mat(L.leverFree(S, i) ? LEVER_COL[i] : 0x9a9a9a); g.userData.num.quaternion.copy(E.camera.quaternion); }); drawDiagram();
    // time of day
    const fk = focus().k; tod.k += ((S.won ? 1.6 : fk) - tod.k) * Math.min(1, dt * 0.7); const kk = Math.min(1, tod.k), k2 = Math.max(0, tod.k - 1) / 0.6;
    document.body.classList.toggle('dusk', tod.k > 0.5);
    sun.color.copy(skyA.sun).lerp(skyB.sun, kk).lerp(skyC.sun, k2); hemi.color.copy(skyA.hemi).lerp(skyB.hemi, kk).lerp(skyC.hemi, k2); scene.fog.color.copy(skyA.fog).lerp(skyB.fog, kk).lerp(skyC.fog, k2); sun.intensity = 2.2 - k2 * 1.0;
    refreshPanel(); refreshSbox();
  }
  return { nodePos, surfaceTarget, edgePoints, holdEdge, onEdgeStart, onArrive, onResult, tapHidden, actionFor, items, unreachable, hintTarget, inventory, focus, tick, MSG, tod,
    reachCap: { hook: 1.4, run: 1.0, seal: 1.0, flag: 1.2, L1: 1.0, L2: 1.0, L3: 1.0, L4: 1.0, g1: 1.1, g2: 1.1, g3: 1.1, tA: 1.2, tB: 1.2, tC: 1.2 } };
}
