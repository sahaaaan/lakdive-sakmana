// Pahana shared engine: renderer, camera, heroine, walking, picking, HUD, hints, audio and the main loop.
// A level module supplies its logic (shared with its solver) and builds its own scene through `build(E)`.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { pose, Secondary, CLIPS, WALK_SPEED } from './anim.js';

const EMBED = window.parent !== window; // running inside the full game (the journey map hosts each chapter in a frame)
const CSS = `  :root{ --sky-top:#e8d9cf; --sky-mid:#f0e6dc; --sky-bot:#d5e0e0; --ink:#4a3b35; --ink-soft:#7b6a61; --card:rgba(255,250,244,.8); --line:rgba(122,96,82,.18); --accent:#b9664c; }
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  html,body{margin:0;height:100%;overflow:hidden;font-family:"Nunito Sans",system-ui,sans-serif;color:var(--ink);
    background:linear-gradient(180deg,var(--sky-top) 0%,var(--sky-mid) 50%,var(--sky-bot) 100%);transition:background 3s}
  body.golden{--sky-top:#efc39b;--sky-mid:#f6dcb6;--sky-bot:#efc8a8}
  canvas{display:block;touch-action:none}
  .hud{position:fixed;pointer-events:none;inset:0;z-index:5}
  .card{pointer-events:auto;background:var(--card);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--line);border-radius:16px;box-shadow:0 8px 30px rgba(90,60,45,.08)}
  #title{position:absolute;left:16px;top:16px;pointer-events:none;padding:12px 16px 14px;max-width:min(380px,calc(100vw - 32px))}
  #title .obj{font-size:14px;line-height:1.4;display:flex;gap:8px;align-items:flex-start;margin-top:8px}
  #title .obj i{flex:none;width:8px;height:8px;border-radius:50%;background:var(--accent);margin-top:6px;box-shadow:0 0 0 4px rgba(185,102,76,.16)}
  #title .k{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-soft);font-weight:700}
  #title .t{font-family:"Cormorant Garamond",serif;font-weight:600;font-size:26px;line-height:1.05}
  
  #inv{position:absolute;right:16px;top:16px;display:flex;gap:6px;padding:8px;transition:opacity .4s}
  #inv.empty{opacity:0}
  .slot{width:46px;height:46px;border-radius:12px;display:none;place-items:center;position:relative;background:rgba(255,255,255,.85);border:1px solid rgba(122,96,82,.2);animation:rise .45s ease}
  .slot.on{display:grid} .slot svg{width:28px;height:28px}
  .slot b{position:absolute;right:4px;bottom:1px;font-size:11px;font-weight:700;color:var(--ink-soft)}
  #view{position:absolute;right:16px;bottom:16px;display:flex;gap:8px;padding:8px}
  .btn{pointer-events:auto;border:none;cursor:pointer;width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,.9);color:var(--ink);display:grid;place-items:center;box-shadow:0 2px 8px rgba(90,60,45,.1);transition:transform .15s, background .2s}
  .btn:hover{background:#fff}.btn:active{transform:scale(.92)} .btn svg{width:22px;height:22px}
  #hintBtn.glow{box-shadow:0 0 0 4px rgba(217,168,78,.35),0 2px 8px rgba(90,60,45,.1)}
  #toast{position:absolute;left:50%;bottom:28px;transform:translate(-50%,10px);opacity:0;max-width:min(460px,calc(100vw - 180px));text-align:center;padding:10px 16px;font-size:14px;line-height:1.4;transition:opacity .35s, transform .35s;pointer-events:none}
  #toast.show{opacity:1;transform:translate(-50%,0)}
  #toast em{font-family:"Cormorant Garamond",serif;font-size:18px;font-style:italic}
  .overlay{position:fixed;inset:0;z-index:10;display:grid;place-items:center;background:rgba(240,228,220,.5);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);transition:opacity .8s}
  .overlay.hide{opacity:0;pointer-events:none;visibility:hidden;transition:opacity .8s,visibility 0s .8s}
  .overlay.hide *{pointer-events:none!important}
  .panel{max-width:min(440px,calc(100vw - 32px));padding:30px 28px 26px;text-align:center}
  .panel .kicker{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-soft);font-weight:700}
  .panel h2{font-family:"Cormorant Garamond",serif;font-size:46px;font-weight:600;margin:6px 0 4px;line-height:1}
  .panel h3{font-family:"Cormorant Garamond",serif;font-style:italic;font-weight:500;font-size:20px;margin:0 0 20px;color:var(--ink-soft)}
  .cta{pointer-events:auto;border:none;cursor:pointer;background:var(--accent);color:#fff;font:700 15px "Nunito Sans";padding:13px 34px;border-radius:999px;box-shadow:0 6px 18px rgba(185,102,76,.35)}
  .stats{display:flex;justify-content:center;gap:22px;margin:4px 0 20px}
  .stats div{font-size:12px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.1em}
  .stats b{display:block;font-family:"Cormorant Garamond",serif;font-size:30px;color:var(--ink);letter-spacing:0}
  .panel p{font-size:15px;line-height:1.5;margin:0 0 18px}
  @keyframes rise{from{opacity:0;transform:translateY(6px) scale(.9)}to{opacity:1;transform:none}}
  @media (max-width:600px){ #title .t{font-size:20px} #inv{padding:6px;gap:4px} .slot{width:38px;height:38px} .slot svg{width:22px;height:22px}
    #view{right:12px;bottom:12px;padding:6px} #toast{bottom:84px;max-width:calc(100vw - 32px)} .panel h2{font-size:38px} }`;

export function run(L) {
  const { meta, logic } = L;
  /* ---------- page shell ---------- */
  document.title = `Lakdive Sakmana — ${meta.place}: ${meta.title}`;
  const style = document.createElement('style'); style.textContent = CSS + (meta.css || ''); document.head.appendChild(style);
  const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Nunito+Sans:wght@400;600;700&display=swap'; document.head.appendChild(link);
  if (meta.bodyClass) document.body.classList.add(meta.bodyClass);
  document.body.insertAdjacentHTML('beforeend', `
<div class="hud">
  <div id="title" class="card"><div class="k">Chapter ${meta.chapter} · ${meta.place}</div><div class="t">${meta.title}</div><div class="obj"><i></i><span id="objective">…</span></div></div>
  <div id="inv" class="card empty">${(L.slots || []).map((s) => `<div class="slot" id="s-${s.id}" title="${s.title}"><svg viewBox="0 0 32 32">${s.svg}</svg>${s.count ? `<b id="n-${s.id}"></b>` : ''}</div>`).join('')}</div>
  <div id="view" class="card">
    <button class="btn" id="hintBtn" aria-label="Hint" title="Hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/></svg></button>
    <button class="btn" id="camL" aria-label="Rotate view left" title="Rotate view (Q)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><ellipse cx="12" cy="14" rx="8" ry="4"/><path d="M7 6l-3 3 3 3"/><path d="M4 9h8"/></svg></button>
    <button class="btn" id="camR" aria-label="Rotate view right" title="Rotate view (E)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><ellipse cx="12" cy="14" rx="8" ry="4"/><path d="M17 6l3 3-3 3"/><path d="M20 9h-8"/></svg></button>
    <button class="btn" id="mute" aria-label="Sound" title="Sound"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path id="wave" d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg></button>
    <button class="btn" id="restart" aria-label="Restart level" title="Restart level"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/></svg></button>
  </div>
  <div id="toast" class="card"></div>
</div>
<div class="overlay" id="intro"><div class="panel card">
  <div class="kicker">Lakdive Sakmana · Chapter ${meta.chapter}</div><h2>${meta.title}</h2><h3>${meta.tagline}</h3>
  <p style="font-size:15px;line-height:1.55;margin:0 0 12px">${meta.intro}</p>
  <ul style="text-align:left;font-size:14px;line-height:1.6;margin:0 0 18px;padding-left:20px;color:var(--ink-soft)">${meta.howto.map((h) => `<li>${h}</li>`).join('')}</ul>
  <button class="cta" id="start">Begin</button>
</div></div>
<div class="overlay hide" id="win"><div class="panel card">
  <div class="kicker">Chapter complete</div><h2>${meta.winTitle}</h2><h3>${meta.winSub}</h3>
  <div class="stats"><div><b id="stSteps">0</b>steps</div><div><b id="stTurns">0</b>turns</div><div><b id="stSecret">0/1</b>secret</div></div>
  <p id="winNote"></p><button class="cta" id="again">Play again</button><button class="cta" id="toMap" style="display:none;margin-left:8px;background:#6a8a7a">Back to the map</button>
</div></div>`);

  /* ---------- setup ---------- */
  const $ = (id) => document.getElementById(id);
  const S = logic.initialState();
  const stats = { steps: 0, turns: 0 };
  const anims = [];
  const timeScale = { k: 1 };
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.prepend(renderer.domElement);
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(meta.fog ?? 0xefe5dc, 92, 150);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
  const camTarget = new THREE.Vector3(...(meta.camStart || [0, 1.4, 0]));
  let areaZoom = 1;
  const cam = { az: meta.az ?? Math.PI / 4, azTo: meta.az ?? Math.PI / 4, el: 0.6155, dist: 80, zoom: 1, zoomTo: 1 };
  function fitCamera() { const a = innerWidth / innerHeight; const h = (a < 0.8 ? 23.5 / a : 25) * (meta.frame || 1); camera.left = -h * a / 2; camera.right = h * a / 2; camera.top = h / 2; camera.bottom = -h / 2; camera.zoom = cam.zoom * areaZoom; camera.updateProjectionMatrix(); }
  function placeCamera() { camera.position.set(camTarget.x + cam.dist * Math.sin(cam.az) * Math.cos(cam.el), camTarget.y + cam.dist * Math.sin(cam.el), camTarget.z + cam.dist * Math.cos(cam.az) * Math.cos(cam.el)); camera.lookAt(camTarget); }
  fitCamera(); placeCamera();
  addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); fitCamera(); });
  const hemi = new THREE.HemisphereLight(0xfff3e8, 0xb5a58e, 1.5); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0dc, 2.2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 80 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; scene.add(sun); scene.add(sun.target);
  const fill = new THREE.DirectionalLight(0xd9e6ff, 0.45); fill.position.set(14, 6, -10); scene.add(fill);

  /* ---------- helpers ---------- */
  const matCache = new Map();
  function mat(color, opts = {}) { const k = color + JSON.stringify(opts); if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0, flatShading: true, ...opts })); return matCache.get(k); }
  function mesh(geo, material, { cast = true, receive = true } = {}) { const m = new THREE.Mesh(geo, material); m.castShadow = cast; m.receiveShadow = receive; return m; }
  const polar = (r, th, y = 0) => new THREE.Vector3(r * Math.sin(th), y, r * Math.cos(th));
  const deg = (d) => d * Math.PI / 180;
  const pickables = [];
  function tag(obj, data) { obj.traverse((o) => { if (o.isMesh) { Object.assign(o.userData, data); pickables.push(o); } }); return obj; }
  function hash(x, y, z) { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
  function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
  const ICONS = { ...(L.icons || {}) };
  function bubbleTex(icon, count = 0, filled = 0) {
    return canvasTex(128, 140, (x) => {
      x.fillStyle = 'rgba(255,252,247,.95)'; x.strokeStyle = 'rgba(122,96,82,.25)'; x.lineWidth = 3;
      x.beginPath(); x.roundRect(8, 8, 112, 104, 28); x.moveTo(52, 110); x.lineTo(64, 132); x.lineTo(76, 110); x.fill(); x.stroke();
      x.save(); x.translate(64 - 40, count ? 18 : 22); x.scale(2.5, 2.5);
      for (const s of ICONS[icon]) { const [d, col] = s.split('#'); x.fillStyle = '#' + col; x.fill(new Path2D(d)); }
      x.restore();
      if (count) for (let i = 0; i < count; i++) { x.beginPath(); x.arc(64 + (i - (count - 1) / 2) * 20, 96, 6, 0, 7); x.fillStyle = i < filled ? '#e48aa3' : 'rgba(122,96,82,.25)'; x.fill(); }
    });
  }
  const glowTex = (inner, outer) => canvasTex(64, 64, (x) => { const g = x.createRadialGradient(32, 36, 2, 32, 32, 30); g.addColorStop(0, '#fff8e0'); g.addColorStop(0.25, inner); g.addColorStop(0.6, outer + '66'); g.addColorStop(1, outer + '00'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });
  const FLAME_TEX = glowTex('#ffd36a', '#ff9a3c');
  const SPARK_TEX = canvasTex(64, 64, (x) => { x.translate(32, 32); const g = x.createRadialGradient(0, 0, 0, 0, 0, 30); g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(.3, 'rgba(255,225,150,.5)'); g.addColorStop(1, 'rgba(255,220,140,0)'); x.fillStyle = g; x.fillRect(-32, -32, 64, 64); x.fillStyle = '#fffbe8'; for (let i = 0; i < 4; i++) { x.rotate(Math.PI / 4); x.fillRect(-1.5, -28, 3, 56); } });

  /* ---------- feedback ---------- */
  const bubbles = [];
  function bubble(target, icon, { offset = 1.2, dur = 2.8, count = 0, filled = 0 } = {}) {
    for (const b of bubbles) if (b.target === target) { b.t = b.dur; }
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubbleTex(icon, count, filled), transparent: true, depthTest: false, fog: false }));
    sp.renderOrder = 10; sp.scale.set(0, 0, 1); scene.add(sp);
    bubbles.push({ sp, target, offset, t: 0, dur });
  }
  function sparkle(obj, times = 3) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: SPARK_TEX, transparent: true, depthTest: false, blending: THREE.AdditiveBlending, fog: false }));
    sp.renderOrder = 11; scene.add(sp);
    anims.push({ t: 0, dur: 1.1 * times, lin: true, f: (e) => { const p = obj.getWorldPosition(new THREE.Vector3()); sp.position.copy(p).add(new THREE.Vector3(0, 0.35, 0)); const k = Math.sin(e * Math.PI * times); sp.scale.setScalar(0.3 + 1.1 * Math.abs(k)); sp.material.opacity = Math.abs(k); sp.material.rotation = e * 4; }, done: () => scene.remove(sp) });
  }
  function jiggle(obj) { const r0 = obj.rotation.z; anims.push({ t: 0, dur: 0.45, lin: true, f: (e) => (obj.rotation.z = r0 + Math.sin(e * Math.PI * 6) * 0.25 * (1 - e)), done: () => (obj.rotation.z = r0) }); }
  function ring(color = 0xffc04a) { const m = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.62, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; return m; }
  // finish beacon: a column of warm light and a pulsing ring
  function beacon(color = 0xffd27a, h = 3.2) {
    const b = new THREE.Group(); b.visible = false;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, h, 20, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    col.position.y = h / 2; b.add(col); const r = ring(0xffc04a); r.position.y = 0.05; b.add(r); b.userData = { col, ring: r, beacon: true }; beacons.push(b); return b;
  }
  const beacons = [];
  function halo(obj, color = 0xffc6dc, r0 = 0.3, r1 = 0.62) { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.y = 0.02; m.userData.halo = true; obj.add(m); halos.push(m); return m; }
  const halos = [];

  /* ---------- heroine ---------- */
  const HERO_SCALE = 1.5;
  const girl = new THREE.Group(); scene.add(girl);
  const hero = { rig: null, sec: null, model: null, action: null, walkPhase: 0, idleT: 0, clip: 'idle', snap: null, blend: 1, reach: null };
  { const orbit = new THREE.Group(); orbit.position.y = 1.72; girl.add(orbit);
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.4, 20), new THREE.MeshBasicMaterial({ color: 0x3a2a20, transparent: true, opacity: 0.18, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.03; girl.add(sh);
    girl.userData = { orbit, face: Math.PI / 4, shadow: sh }; }
  const held = []; // props carried in the hands, kept upright: { obj, bone, scale, pos }
  function hold(obj, bone, scale, pos) { obj.visible = false; held.push({ obj, bone, scale, pos }); if (hero.rig) attachHeld(held[held.length - 1]); return obj; }
  function attachHeld(h) { const b = hero.rig.bones[h.bone]; b.add(h.obj); h.obj.scale.setScalar(h.scale / HERO_SCALE); h.obj.position.set(...h.pos); }
  {
    const bin = Uint8Array.from(atob(L.heroGlb), (c) => c.charCodeAt(0));
    new GLTFLoader().parse(bin.buffer, './', (g) => {
      const model = g.scene; model.scale.setScalar(HERO_SCALE);
      model.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; o.frustumCulled = false; } });
      girl.add(model); hero.model = model;
      const bones = {}; model.traverse((o) => { if (o.isBone) bones[o.name] = o; });
      hero.rig = { bones, landmarks: { SK: Object.keys(bones).filter((n) => /^skirt\d+_0$/.test(n)).length } };
      hero.sec = new Secondary(hero.rig);
      held.forEach(attachHeld);
    });
  }
  function playAction(name, { speed = 1.35, contact = 0.95, onContact, done } = {}) { hero.action = { name, t: 0, speed, contact, onContact, done, fired: false }; }

  /* ---------- context handed to the level ---------- */
  const E = { THREE, S, scene, camera, cam, camTarget, sun, hemi, fill, renderer, anims, stats, timeScale, girl, hero, HERO_SCALE,
    mat, mesh, polar, deg, tag, hash, canvasTex, bubble, sparkle, jiggle, beacon, halo, ring, hold, playAction, label: (...a) => label(...a), ICONS,
    bell: (...a) => bell(...a), grind: (...a) => grind(...a), click: () => click(), bump: () => bump(), chime: () => chime(), tone: (...a) => tone(...a),
    refresh: () => refreshHUD(), progress: () => { lastProgress = clock.elapsedTime; }, win: () => win(), shake: (s) => { shake = s; }, $, get AC() { return AC; } };
  const V = L.build(E); // the level's view: nodePos, items, actions, results, hints, focus, tick...
  E.V = V;

  /* ---------- walking ---------- */
  const nodePos = (id) => V.nodePos(id);
  function edgePoints(e, from, to) {
    if (V.edgePoints) { const p = V.edgePoints(e, from, to); if (p) return p; }
    const via = (e.via || []).map((v) => new THREE.Vector3(...v)); if (from !== e.a) via.reverse();
    const seq = [...via, nodePos(to)]; const out = []; let prev = nodePos(from);
    for (const q of seq) { const n = Math.max(2, Math.round(prev.distanceTo(q) / 0.5)); for (let k = 1; k <= n; k++) out.push(prev.clone().lerp(q, k / n)); prev = q; }
    return out;
  }
  const walker = { segs: [], cur: null, pending: null, queued: null };
  E.isWalking = () => !!walker.cur;
  let lastProgress = 0;
  function edgeBetween(a, b) { for (const { to, e } of logic.adjacency(S).get(a) || []) if (to === b) return e; return null; }
  function startWalk(target, pending = null) {
    if (V.busy && V.busy()) return true;
    if (hero.action) return true;
    if (walker.cur) { walker.queued = { target, pending }; return true; }
    const path = logic.findPath(S, S.player, target); if (!path) return false;
    walker.pending = pending; walker.segs = [];
    for (let i = 1; i < path.length; i++) walker.segs.push({ from: path[i - 1], to: path[i] });
    nextSeg(); if (!walker.cur) arrive(); return true;
  }
  function nextSeg() {
    walker.cur = walker.segs.shift() || null; if (!walker.cur) return;
    const e = edgeBetween(walker.cur.from, walker.cur.to);
    if (!e) { walker.cur = null; walker.segs = []; walker.pending = null; return; } // the way changed under her feet
    const pts = [nodePos(walker.cur.from), ...edgePoints(e, walker.cur.from, walker.cur.to)];
    const lens = [0]; for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + pts[i].distanceTo(pts[i - 1]));
    Object.assign(walker.cur, { e, pts, lens, d: 0, wait: 0 });
    if (V.onEdgeStart) V.onEdgeStart(e, walker.cur);
  }
  function updateWalk(dt) {
    const c = walker.cur; if (!c) return false;
    if (V.holdEdge && V.holdEdge(c.e, c)) return 'wait'; // e.g. waiting at the kerb for a gap in the traffic
    const sp = c.e && c.e.speed ? c.e.speed : (Math.abs(c.pts[0].y - c.pts[c.pts.length - 1].y) > 0.2 ? 1.5 : 2.1);
    c.d += sp * dt;
    const Ln = c.lens[c.lens.length - 1];
    if (c.d >= Ln) {
      S.player = c.to; stats.steps++;
      if (V.onArrive) V.onArrive(c.to, c.e, !walker.segs.length && !walker.queued); // last flag: she stops here
      refreshHUD();
      if (walker.queued) { const q = walker.queued; walker.queued = null; walker.cur = null; walker.segs = []; if (!startWalk(q.target, q.pending)) noPath(q.pending); return true; }
      nextSeg(); if (!walker.cur) arrive(); return true;
    }
    let i = 1; while (c.lens[i] < c.d) i++;
    const f = (c.d - c.lens[i - 1]) / (c.lens[i] - c.lens[i - 1] || 1);
    girl.position.copy(c.pts[i - 1].clone().lerp(c.pts[i], f));
    const dx = c.pts[i].x - c.pts[i - 1].x, dz = c.pts[i].z - c.pts[i - 1].z;
    if (Math.abs(dx) + Math.abs(dz) > 1e-4) girl.userData.face = Math.atan2(dx, dz);
    return c.e && c.e.ride ? 'ride' : true;
  }
  function arrive() { const what = walker.pending; walker.pending = null; if (what) act(what); }
  function act(what) {
    const kind = V.actionFor && V.actionFor[what] && V.actionFor[what]();
    if (!kind || !hero.rig) { doInteract(what); return; }
    const target = V.items[what];
    let reach = null;
    if (target) {
      const p = target.getWorldPosition(new THREE.Vector3()); girl.userData.face = Math.atan2(p.x - girl.position.x, p.z - girl.position.z);
      const box = new THREE.Box3().setFromObject(target); const top = new THREE.Vector3((box.min.x + box.max.x) / 2, Math.min(box.max.y, box.min.y + (V.reachCap?.[what] ?? 9)), (box.min.z + box.max.z) / 2);
      girl.rotation.y = girl.userData.face; girl.updateMatrixWorld(true);
      const local = girl.worldToLocal(top.clone()).divideScalar(HERO_SCALE); reach = { x: local.x, y: Math.max(0.12, local.y + 0.03), z: local.z };
    }
    hero.reach = reach;
    playAction(kind, { contact: kind === 'pickup' ? 0.95 : 1.1, onContact: () => doInteract(what), done: () => { hero.reach = null; } });
  }
  function doInteract(what) {
    const r = logic.interact(S, what);
    if (r === 'nothing') { V.onNothing && V.onNothing(what); return; }
    lastProgress = clock.elapsedTime;
    if (V.MSG && V.MSG[r]) setTimeout(() => label(V.MSG[r], 4800), r.startsWith('got') ? 1800 : 0);
    if (V.NAMES && V.NAMES[r]) label(V.NAMES[r]);
    V.onResult(r, what);
    refreshHUD();
  }
  function noPath(what) { bump(); if (what && V.items[what]) sparkle(V.items[what], 1); }
  function interactAt(what) {
    const spot = logic.SPOTS[what];
    if (hero.action || (V.busy && V.busy())) return;
    if (spot === undefined || spot === null) { doInteract(what); return; } // usable from anywhere
    if (S.player === spot && !walker.cur) { act(what); return; }
    if (!startWalk(spot, what)) { if (V.unreachable) V.unreachable(what); noPath(what); }
  }

  /* ---------- win ---------- */
  function win() {
    chime(); document.body.classList.add('won');
    if (V.onWin) V.onWin();
    if (EMBED) parent.postMessage({ pahana: 'won', chapter: meta.chapter }, '*');
    setTimeout(() => {
      $('stSteps').textContent = stats.steps; $('stTurns').textContent = stats.turns; $('stSecret').textContent = S.has && S.has.leaf ? '1/1' : '0/1';
      $('winNote').textContent = S.has && S.has.leaf ? 'You even found the hidden ola-leaf page.' : 'Something is still hidden somewhere…';
      $('win').classList.remove('hide');
    }, meta.winDelay ?? 7000);
  }

  /* ---------- HUD ---------- */
  let toastTimer;
  function label(html, ms = 2600) { const el = $('toast'); el.innerHTML = html; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), ms); }
  function refreshHUD() {
    $('objective').textContent = logic.objective(S);
    const inv = V.inventory ? V.inventory(S) : {};
    for (const s of L.slots || []) { const v = inv[s.id]; $('s-' + s.id).classList.toggle('on', !!v); if (s.count) $('n-' + s.id).textContent = typeof v === 'string' ? v : (v || ''); }
    $('inv').classList.toggle('empty', !document.querySelector('.slot.on'));
  }
  let lastHint = { at: -99, obj: null };
  function hint() {
    const h = V.hintTarget(); if (!h) return; const now = clock.elapsedTime;
    if (lastHint.obj === h.obj && now - lastHint.at < 25) label(h.words[0], 4200);
    sparkle(h.obj, 3); lastHint = { at: now, obj: h.obj }; $('hintBtn').classList.remove('glow');
  }
  $('hintBtn').onclick = (e) => { e.stopPropagation(); ensureAudio(); hint(); };
  $('camL').onclick = () => { cam.azTo -= Math.PI / 2; click(); };
  $('camR').onclick = () => { cam.azTo += Math.PI / 2; click(); };
  addEventListener('keydown', (e) => { if (e.key === 'q' || e.key === 'Q') $('camL').click(); if (e.key === 'e' || e.key === 'E') $('camR').click(); });
  let started = false;
  $('start').onclick = () => { ensureAudio(); $('intro').classList.add('hide'); started = true; lastProgress = clock.elapsedTime; invite(); label(meta.startLabel, 5200); };
  $('again').onclick = () => location.reload();
  // inside the full game (an iframe of the journey map): the win screen leads on to the next chapter or back to the map
  if (EMBED) { $('again').textContent = 'Continue the journey'; $('again').onclick = () => parent.postMessage({ pahana: 'next', chapter: meta.chapter }, '*');
    $('toMap').style.display = ''; $('toMap').onclick = () => parent.postMessage({ pahana: 'map', chapter: meta.chapter }, '*');
    // a chapter already finished earlier can be left at any time from a map button in the corner
    if (new URLSearchParams(location.search).get('done') === '1') { const b = document.createElement('button'); b.className = 'btn'; b.title = 'Back to the map'; b.setAttribute('aria-label', 'Back to the map');
      b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>';
      b.onclick = () => parent.postMessage({ pahana: 'map', chapter: meta.chapter }, '*'); $('view').appendChild(b); }
    // the map plays the music between chapters; a level starts straight away, without its own title card
    if (new URLSearchParams(location.search).get('autostart') === '1') setTimeout(() => $('start') && $('start').click(), 50); }
  // restart: tap once to arm (the button turns red), tap again within 3 s to start the level over
  { let armed = 0; const rb = $('restart');
    rb.onclick = () => { click(); if (performance.now() - armed < 3000) { location.reload(); return; } armed = performance.now(); rb.style.background = '#e8735a'; rb.style.color = '#fff'; label('Tap restart again to start this level over from the beginning.', 3000);
      setTimeout(() => { if (performance.now() - armed >= 2900) { rb.style.background = ''; rb.style.color = ''; } }, 3000); }; }
  let inviteObj = null;
  function invite() {
    if (!meta.inviteNode) return; const p = nodePos(meta.inviteNode);
    const m = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.36, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.copy(p).add(new THREE.Vector3(0, 0.07, 0)); scene.add(m); inviteObj = m;
  }

  /* ---------- picking & gestures ---------- */
  const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2();
  function isVisible(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
  function pickAt(x, y) { ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.intersectObjects(pickables.filter(isVisible), false); }
  let down = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { const h = V.onHandle ? pickAt(e.clientX, e.clientY)[0] : null; down = { x: e.clientX, y: e.clientY, btn: e.button, handle: h && h.object.userData.handle }; });
  renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!down) return; const dx = e.clientX - down.x, dy = e.clientY - down.y; const d = down; down = null;
    ensureAudio();
    // a handle (e.g. a terrace wheel): tap turns it one way, drag sideways or right-click picks the direction
    if (d.handle && V.onHandle) { V.onHandle(d.handle, Math.abs(dx) > 25 ? Math.sign(dx) : (d.btn === 2 ? -1 : 1)); return; }
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) { cam.azTo -= Math.sign(dx) * Math.PI / 2; click(); return; }
    if (Math.hypot(dx, dy) > 8) return;
    const hits = pickAt(e.clientX, e.clientY); if (!hits.length) return;
    const hidden = hits.find((h) => h.object.userData.hidden !== undefined);
    handleHit(hidden && hidden.distance - hits[0].distance < 1.3 ? hidden : hits[0]);
  });
  function handleHit(h) {
    const u = h.object.userData;
    if (u.hidden !== undefined) { lastProgress = clock.elapsedTime; return V.tapHidden(u.hidden, h.object); }
    if (u.item) return interactAt(u.item);
    if (u.surface) {
      const target = V.surfaceTarget(u.surface, h.point); if (!target) return;
      if (inviteObj) { scene.remove(inviteObj); inviteObj = null; }
      if (target === S.player && !walker.cur) return;
      if (!startWalk(target)) { bump(); ripple(h.point, 0xd97a6a); } else ripple(h.point, 0xffffff);
    }
  }
  const ripples = [];
  function ripple(p, color) { const m = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.22, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.copy(p).add(new THREE.Vector3(0, 0.06, 0)); scene.add(m); ripples.push({ m, t: 0 }); }
  renderer.domElement.addEventListener('wheel', (e) => { cam.zoomTo = THREE.MathUtils.clamp(cam.zoomTo * (e.deltaY > 0 ? 0.9 : 1.1), 0.7, 2.2); }, { passive: true });
  let pinch = null;
  renderer.domElement.addEventListener('touchmove', (e) => { if (e.touches.length === 2) { const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); if (pinch) cam.zoomTo = THREE.MathUtils.clamp(cam.zoomTo * d / pinch, 0.7, 2.2); pinch = d; down = null; } }, { passive: true });
  renderer.domElement.addEventListener('touchend', () => (pinch = null));

  /* ---------- audio ---------- */
  let AC = null, master = null, muted = false;
  function ensureAudio() { if (AC) { if (AC.state === 'suspended') AC.resume(); return; } try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = 0.6; master.connect(AC.destination); ambience(); } catch (e) { AC = null; } }
  function noiseBuf(sec) { const b = AC.createBuffer(1, AC.sampleRate * sec, AC.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
  function tone(f, t, dur, type = 'sine', vol = 0.15, f2) { const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.05); }
  function bell(f, delay = 0) { if (!AC) return; const t = AC.currentTime + delay; [[1, 0.25], [2.76, 0.08], [5.4, 0.04]].forEach(([k, a]) => { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = f * k; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2 / k); o.connect(g).connect(master); o.start(t); o.stop(t + 2.5); }); }
  function grind(sec) { if (!AC) return; const t = AC.currentTime; const s = AC.createBufferSource(); s.buffer = noiseBuf(sec + 0.2); const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260; const g = AC.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5, t + 0.12); g.gain.setValueAtTime(0.5, t + sec - 0.15); g.gain.linearRampToValueAtTime(0, t + sec); s.connect(f).connect(g).connect(master); s.start(t); }
  function rattle() { if (!AC) return; const t = AC.currentTime; for (let i = 0; i < 4; i++) tone(120 + i * 15, t + i * 0.07, 0.06, 'square', 0.05); }
  function click() { if (!AC) return; tone(180, AC.currentTime, 0.12, 'sine', 0.15); }
  function bump() { if (!AC) return; tone(220, AC.currentTime, 0.25, 'triangle', 0.12, 140); }
  function chatter() { if (!AC) return; const t = AC.currentTime; for (let i = 0; i < 5; i++) tone(900 + Math.random() * 500, t + i * 0.08, 0.06, 'sawtooth', 0.04, 600); }
  function chime() { [523, 587, 659, 784, 880, 1046].forEach((f, i) => bell(f, i * 0.22)); bell(523, 1.6); bell(784, 1.6); }
  function ambience() {
    const s = AC.createBufferSource(); s.buffer = noiseBuf(4); s.loop = true; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 0.4;
    const g = AC.createGain(); g.gain.value = 0.035; const lfo = AC.createOscillator(), lg = AC.createGain(); lfo.frequency.value = 0.08; lg.gain.value = 0.025; lfo.connect(lg).connect(g.gain); lfo.start(); s.connect(f).connect(g).connect(master); s.start();
    const notes = [392, 440, 523, 587, 659, 784];
    const play = () => { if (!AC) return; if (!muted) { const t = AC.currentTime; const o = AC.createOscillator(), gg = AC.createGain(), v = AC.createOscillator(), vg = AC.createGain();
      o.frequency.value = notes[Math.floor(Math.random() * notes.length)] / 2; v.frequency.value = 5; vg.gain.value = 3; v.connect(vg).connect(o.frequency);
      gg.gain.setValueAtTime(0, t); gg.gain.linearRampToValueAtTime(0.05, t + 0.8); gg.gain.linearRampToValueAtTime(0, t + 3.2); o.connect(gg).connect(master); o.start(t); v.start(t); o.stop(t + 3.4); v.stop(t + 3.4); }
      setTimeout(play, 2600 + Math.random() * 3500); };
    setTimeout(play, 1500);
  }
  $('mute').onclick = () => { ensureAudio(); muted = !muted; if (master) master.gain.value = muted ? 0 : 0.6; $('wave').style.opacity = muted ? 0.15 : 1; };

  /* ---------- loop ---------- */
  let shake = 0;
  const clock = new THREE.Clock();
  const tmpQ = new THREE.Quaternion();
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05) * timeScale.k, t = clock.elapsedTime;
    const walking = updateWalk(dt);
    if (!walking) girl.position.copy(nodePos(S.player));
    const gb = girl.userData; const face = gb.face ?? Math.PI / 4;
    let dr = face - girl.rotation.y; while (dr > Math.PI) dr -= Math.PI * 2; while (dr < -Math.PI) dr += Math.PI * 2;
    girl.rotation.y += dr * Math.min(1, dt * 10);
    if (hero.rig) {
      let clip, ct;
      if (hero.action) {
        const A = hero.action; A.t += dt * A.speed; clip = A.name; ct = Math.min(A.t, CLIPS[A.name]);
        if (!A.fired && A.t >= A.contact) { A.fired = true; A.onContact && A.onContact(); }
        if (A.t >= CLIPS[A.name]) { hero.action = null; A.done && A.done(); }
      } else if (walking === true) {
        hero.walkPhase += dt * 2.1 / (WALK_SPEED * CLIPS.walk * HERO_SCALE * 1.6); clip = 'walk'; ct = (hero.walkPhase % 1) * CLIPS.walk;
      } else { hero.idleT += dt; clip = 'idle'; ct = hero.idleT % CLIPS.idle; }
      const B = hero.rig.bones;
      if (clip !== hero.clip) { hero.snap = Object.fromEntries(Object.entries(B).map(([n, b]) => [n, b.quaternion.clone()])); hero.snapHip = B.hips.position.clone(); hero.blend = 0; hero.clip = clip; }
      girl.updateMatrixWorld(true);
      pose(hero.rig, clip, ct, { carry: held.some((h) => h.obj.visible && h.carry !== false) && !hero.action, reach: hero.reach });
      if (hero.blend < 1) { hero.blend = Math.min(1, hero.blend + dt / 0.22); const k = hero.blend * hero.blend * (3 - 2 * hero.blend);
        for (const [n, b] of Object.entries(B)) b.quaternion.slerpQuaternions(hero.snap[n], b.quaternion, k); B.hips.position.lerpVectors(hero.snapHip, B.hips.position, k); }
      girl.updateMatrixWorld(true);
      hero.sec.update(dt, girl);
      for (const h of held) if (h.obj.visible && h.upright !== false) { const hq = h.obj.parent.getWorldQuaternion(tmpQ).invert(); h.obj.quaternion.copy(hq.multiply(girl.getWorldQuaternion(new THREE.Quaternion()))); }
    }
    gb.orbit.children.forEach((l, i, a) => { const ang = t * 1.4 + i / a.length * Math.PI * 2; l.position.set(Math.cos(ang) * 0.36, Math.sin(t * 2 + i) * 0.05, Math.sin(ang) * 0.36); });
    for (const b of beacons) if (b.visible) { const k = 0.5 + 0.5 * Math.sin(t * 3); b.userData.ring.scale.setScalar(1 + 0.25 * k); b.userData.ring.material.opacity = 0.9 - 0.5 * k; b.userData.col.material.opacity = 0.18 + 0.15 * k; }
    halos.forEach((h, i) => (h.material.opacity = 0.3 + 0.3 * Math.sin(t * 2.5 + i)));
    if (inviteObj) { inviteObj.material.opacity = 0.45 + Math.sin(t * 3) * 0.35; inviteObj.scale.setScalar(1 + Math.sin(t * 3) * 0.12); }
    if (started && !S.won && t - lastProgress > 45) { lastProgress = t; $('hintBtn').classList.add('glow'); const h = V.hintTarget(); if (h) sparkle(h.obj, 2); }
    V.tick && V.tick(dt, t);
    for (let i = bubbles.length - 1; i >= 0; i--) { const b = bubbles[i]; b.t += dt; const p = b.target.getWorldPosition(new THREE.Vector3()); b.sp.position.copy(p).add(new THREE.Vector3(0, b.offset + Math.sin(t * 3) * 0.04, 0));
      const k = Math.min(1, b.t / 0.2, (b.dur - b.t) / 0.3); b.sp.scale.set(1.1 * k, 1.2 * k, 1); if (b.t >= b.dur) { scene.remove(b.sp); bubbles.splice(i, 1); } }
    for (let i = anims.length - 1; i >= 0; i--) { const a = anims[i]; a.t = Math.min(1, a.t + dt / a.dur); a.f(a.lin ? a.t : 1 - (1 - a.t) ** 3); if (a.t >= 1) { anims.splice(i, 1); a.done && a.done(); } }
    for (let i = ripples.length - 1; i >= 0; i--) { const r = ripples[i]; r.t += dt; r.m.scale.setScalar(1 + r.t * 5); r.m.material.opacity = 0.9 * (1 - r.t / 0.6); if (r.t > 0.6) { scene.remove(r.m); ripples.splice(i, 1); } }
    // camera framing: the level says which area she is in and how tight to frame it
    { const f = V.focus(); camTarget.lerp(f.target, Math.min(1, dt * 2.2)); areaZoom += (f.zoom - areaZoom) * Math.min(1, dt * 1.5); }
    sun.position.copy(camTarget).add(new THREE.Vector3(-12, 20.6, 10)); sun.target.position.copy(camTarget);
    cam.az += (cam.azTo - cam.az) * Math.min(1, dt * 5); cam.zoom += (cam.zoomTo - cam.zoom) * Math.min(1, dt * 8);
    camera.zoom = cam.zoom * areaZoom; camera.updateProjectionMatrix(); placeCamera();
    V.afterCamera && V.afterCamera(dt, t);
    if (shake > 0) { shake -= dt; camera.position.x += (Math.random() - 0.5) * 0.15; camera.position.y += (Math.random() - 0.5) * 0.15; }
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  refreshHUD(); tick();

  window.__game = { S, V, E, logic, timeScale, camera, cam, camTarget, THREE, girl, hero, walkTo: startWalk, interactAt, findPath: logic.findPath, hint,
    pick: (x, y) => pickAt(x, y).slice(0, 4).map((h) => JSON.stringify(h.object.userData)), tapHidden: (k) => V.tapHidden(k),
    isBusy: () => !!(walker.cur || anims.length || hero.action || (V.busy && V.busy())) };
}
