// Pahana shared engine: renderer, camera, heroine, walking, picking, HUD, hints, audio and the main loop.
// A level module supplies its logic (shared with its solver) and builds its own scene through `build(E)`.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { pose, Secondary, CLIPS, WALK_SPEED } from './anim.js';

const EMBED = window.parent !== window; // running inside the full game (the journey map hosts each chapter in a frame)
const CSS = `  :root{ --sky-top:#e8d9cf; --sky-mid:#f0e6dc; --sky-bot:#d5e0e0; --ink:#4a3b35; --ink-soft:#7b6a61; --card:rgba(255,250,244,.84); --line:rgba(122,96,82,.16); --accent:#b9664c; --sl:env(safe-area-inset-left,0px); --sr:env(safe-area-inset-right,0px); --st:env(safe-area-inset-top,0px); --sb:env(safe-area-inset-bottom,0px); }
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  html,body{margin:0;height:100%;overflow:hidden;font-family:"Nunito Sans",system-ui,sans-serif;color:var(--ink);
    background:linear-gradient(180deg,var(--sky-top) 0%,var(--sky-mid) 50%,var(--sky-bot) 100%);transition:background 3s}
  body.golden{--sky-top:#efc39b;--sky-mid:#f6dcb6;--sky-bot:#efc8a8}
  #sky{position:fixed;inset:0;overflow:hidden;pointer-events:none} #sky i{position:absolute;display:block}
  #sky .glow{left:8%;top:-22%;width:74vmax;height:74vmax;border-radius:50%;background:radial-gradient(closest-side,rgba(255,250,236,.62),rgba(255,246,228,.22) 45%,rgba(255,246,228,0) 72%)}
  #sky .c{width:70vmax;height:16vmax;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.5),rgba(255,255,255,.2) 55%,rgba(255,255,255,0) 100%);animation:skyDrift 150s linear infinite;will-change:transform}
  #sky .c1{top:9%;left:-20vmax} #sky .c2{top:34%;left:-60vmax;width:92vmax;height:13vmax;opacity:.7;animation-duration:230s;animation-delay:-90s} #sky .c3{top:62%;left:-35vmax;width:60vmax;height:11vmax;opacity:.55;animation-duration:190s;animation-delay:-40s}
  #sky .vig{inset:0;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 58%,rgba(74,50,40,.13) 100%)}
  #sky .glow,#sky .c{transition:opacity 3s} body.dusk #sky .c, body.won #sky .c{opacity:.22} body.dusk #sky .glow, body.won #sky .glow{opacity:.4}
  @keyframes skyDrift{from{transform:translateX(-30vmax)}to{transform:translateX(150vw)}}
  canvas{position:relative;display:block;touch-action:none;opacity:0;transition:opacity 1s ease}
  body.ready canvas{opacity:1}
  body > *:not(canvas):not(.overlay):not(.hud):not(script):not(style):not(#resumeVeil), .hud > #panelBtn{margin:var(--st) var(--sr) var(--sb) var(--sl)}
  @media (prefers-reduced-motion:reduce){ *{animation-duration:.01s!important;transition-duration:.01s!important} }
  html,body{touch-action:manipulation;overscroll-behavior:none;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
  .panel{max-height:calc(100dvh - 24px);overflow-y:auto}
  #win .cta{margin:4px}
  .panel .go{position:sticky;bottom:-26px;margin:0 -28px -26px;padding:14px 0 22px;background:linear-gradient(rgba(255,250,244,0),rgba(255,250,244,.96) 38%);border-radius:0 0 18px 18px} /* Begin stays in view on short screens; the text scrolls behind it */
  @media (max-height:640px){ .panel h2{font-size:32px} .panel h3{font-size:16px;margin-bottom:10px} .panel p{font-size:13.5px!important;margin-bottom:10px!important} .panel ul{font-size:13px!important;margin-bottom:8px!important} .panel{padding-top:18px} }
  .hud{position:fixed;pointer-events:none;inset:var(--st) var(--sr) var(--sb) var(--sl);z-index:5}
  .card{pointer-events:auto;background:var(--card);backdrop-filter:blur(14px) saturate(1.15);-webkit-backdrop-filter:blur(14px) saturate(1.15);border:1px solid var(--line);border-radius:18px;box-shadow:0 10px 34px rgba(90,60,45,.10),0 1px 2px rgba(90,60,45,.06),inset 0 1px 0 rgba(255,255,255,.55)}
  #title{position:absolute;left:16px;top:16px;pointer-events:none;padding:12px 16px 14px;max-width:min(380px,calc(100vw - 32px))}
  #title .obj{font-size:14px;line-height:1.4;display:flex;gap:8px;align-items:flex-start;margin-top:8px}
  #objective{transition:opacity .22s ease, transform .22s ease} #objective.swap{opacity:0;transform:translateY(3px)}
  #title{transition:opacity .5s ease} body:not(.playing) #title, body:not(.playing) #view, body:not(.playing) #inv{opacity:0}
  #view{transition:opacity .5s ease}
  #title .obj i{flex:none;width:8px;height:8px;border-radius:50%;background:var(--accent);margin-top:6px;box-shadow:0 0 0 4px rgba(185,102,76,.16)}
  #title .k{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-soft);font-weight:700}
  #title .t{font-family:"Cormorant Garamond",serif;font-weight:600;font-size:26px;line-height:1.05}
  
  #inv{position:absolute;right:16px;top:16px;display:flex;gap:6px;padding:8px;transition:opacity .4s}
  #inv.empty{opacity:0}
  .slot{width:46px;height:46px;border-radius:12px;display:none;place-items:center;position:relative;background:rgba(255,255,255,.85);border:1px solid rgba(122,96,82,.2);animation:rise .45s ease}
  .slot.on{display:grid} .slot svg{width:28px;height:28px}
  .slot b{position:absolute;right:4px;bottom:1px;font-size:11px;font-weight:700;color:var(--ink-soft)}
  #view{position:absolute;right:16px;bottom:16px;display:flex;gap:8px;padding:8px}
  .btn{pointer-events:auto;border:none;cursor:pointer;width:44px;height:44px;border-radius:13px;background:rgba(255,255,255,.92);color:var(--ink);display:grid;place-items:center;box-shadow:0 2px 8px rgba(90,60,45,.1);transition:transform .18s cubic-bezier(.3,1.4,.5,1), background .2s, box-shadow .2s}
  @media (hover:hover){ .btn:hover{background:#fff;transform:translateY(-1px);box-shadow:0 5px 14px rgba(90,60,45,.14)} }
  .btn:active{transform:scale(.9)} .btn svg{width:22px;height:22px} .btn:focus-visible,.cta:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
  #hintBtn.glow{box-shadow:0 0 0 4px rgba(217,168,78,.35),0 2px 8px rgba(90,60,45,.1)}
  #queenOffer{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:55;width:min(340px,calc(100vw - 32px));padding:18px 20px;text-align:center;font-size:14px;line-height:1.5;color:var(--ink)} #queenOffer b{font-size:18px} #queenOffer div{margin:12px 0 6px;display:flex;gap:8px;justify-content:center} #queenOffer .cta{margin:0} #queenOffer #qNo{background:#8a7a6a} #queenOffer small{color:var(--ink-soft)}
  #resumeVeil{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:linear-gradient(var(--sky-top),var(--sky-bot));color:var(--ink);text-align:center;font-size:16px;line-height:1.6;transition:opacity .6s}
  #resumeVeil b{font-size:22px;font-weight:600} #resumeVeil .bar{width:180px;height:4px;margin:14px auto 0;border-radius:2px;background:rgba(122,96,82,.18);overflow:hidden} #resumeVeil .bar i{display:block;height:100%;width:0;background:var(--accent);transition:width .2s} #resumeVeil.out{opacity:0;pointer-events:none}
  #toast{position:absolute;left:50%;bottom:28px;transform:translate(-50%,10px);opacity:0;max-width:min(460px,calc(100vw - 180px));text-align:center;padding:10px 16px;font-size:14px;line-height:1.4;transition:opacity .35s ease, transform .45s cubic-bezier(.2,1.2,.4,1);pointer-events:none}
  #toast.show{opacity:1;transform:translate(-50%,0)}
  #toast em{font-family:"Cormorant Garamond",serif;font-size:18px;font-style:italic}
  .overlay{position:fixed;inset:0;z-index:10;display:grid;place-items:center;background:rgba(240,228,220,.5);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);transition:opacity .8s}
  .overlay.hide{opacity:0;pointer-events:none;visibility:hidden;transition:opacity .8s,visibility 0s .8s}
  .overlay.hide *{pointer-events:none!important}
  .panel{max-width:min(440px,calc(100vw - 32px));padding:30px 28px 26px;text-align:center}
  .panel .kicker{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-soft);font-weight:700}
  .panel h2{font-family:"Cormorant Garamond",serif;font-size:46px;font-weight:600;margin:6px 0 4px;line-height:1}
  .panel h3{font-family:"Cormorant Garamond",serif;font-style:italic;font-weight:500;font-size:20px;margin:0 0 20px;color:var(--ink-soft)}
  .cta{pointer-events:auto;border:none;cursor:pointer;background:var(--accent);color:#fff;font:700 15px "Nunito Sans";padding:13px 34px;border-radius:999px;box-shadow:0 6px 18px rgba(185,102,76,.35);transition:transform .18s cubic-bezier(.3,1.4,.5,1), box-shadow .2s} .cta:active{transform:scale(.96)} @media (hover:hover){ .cta:hover{transform:translateY(-1px);box-shadow:0 9px 22px rgba(185,102,76,.4)} }
  .overlay .panel{transition:transform .8s cubic-bezier(.2,.8,.3,1), opacity .6s} .overlay.hide .panel{transform:translateY(14px) scale(.98);opacity:0}
  .stats{display:flex;justify-content:center;gap:22px;margin:4px 0 20px}
  .stats div{font-size:12px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.1em}
  .stats b{display:block;font-family:"Cormorant Garamond",serif;font-size:30px;color:var(--ink);letter-spacing:0}
  .panel p{font-size:15px;line-height:1.5;margin:0 0 18px}
  #panelBtn{display:none;position:fixed;left:12px;bottom:12px;z-index:7;width:46px;height:46px;border-radius:12px;border:0;place-items:center;color:var(--ink);pointer-events:auto}#panelBtn svg{width:22px;height:22px}
  @media (max-width:600px), (max-height:500px){ body.haspanel #panelBtn{display:grid} #panel.on{display:none!important} body.panelopen #panel.on{display:block!important;left:12px!important;right:12px;bottom:72px!important;max-width:none!important;pointer-events:auto!important} }
  #sndPanel{position:absolute;right:16px;bottom:84px;width:210px;padding:12px 14px;display:none;flex-direction:column;gap:10px;pointer-events:auto;font-size:13px;color:var(--ink-soft);animation:rise .25s ease}
  #sndPanel.open{display:flex}
  #sndPanel label{display:flex;flex-direction:column;gap:4px;font-weight:600}
  #sndPanel input{width:100%;accent-color:var(--accent)}
  #sndMute{border:none;cursor:pointer;border-radius:999px;padding:7px 12px;font:700 13px "Nunito Sans";background:var(--accent);color:#fff}
  #sndMute.off{background:#cbbfb6}
  @keyframes rise{from{opacity:0;transform:translateY(6px) scale(.9)}to{opacity:1;transform:none}}
  @media (max-width:600px), (max-height:500px){ #title{max-width:calc(100vw - 92px)} #inv{top:12px;right:12px;flex-direction:column} #title .obj{font-size:12.5px} .panel{padding:22px 18px 18px} .panel .go{bottom:-18px;margin:0 -18px -18px;padding:12px 0 16px} .panel p{font-size:14px} #sndPanel{right:12px;bottom:76px}
    #title .t{font-size:20px} #inv{padding:6px;gap:4px} .slot{width:38px;height:38px} .slot svg{width:22px;height:22px}
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
  <div id="title" class="card"><div class="k">${meta.chapterLabel || 'Chapter ' + meta.chapter} · ${meta.place}</div><div class="t">${meta.title}</div><div class="obj"><i></i><span id="objective">…</span></div></div>
  <div id="inv" class="card empty">${(L.slots || []).map((s) => `<div class="slot" id="s-${s.id}" title="${s.title}"><svg viewBox="0 0 32 32">${s.svg}</svg>${s.count ? `<b id="n-${s.id}"></b>` : ''}</div>`).join('')}</div>
  <div id="view" class="card">
    <button class="btn" id="hintBtn" aria-label="Hint" title="Hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/></svg></button>
    <button class="btn" id="camL" aria-label="Rotate view left" title="Rotate view (Q)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><ellipse cx="12" cy="14" rx="8" ry="4"/><path d="M7 6l-3 3 3 3"/><path d="M4 9h8"/></svg></button>
    <button class="btn" id="camR" aria-label="Rotate view right" title="Rotate view (E)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><ellipse cx="12" cy="14" rx="8" ry="4"/><path d="M17 6l3 3-3 3"/><path d="M20 9h-8"/></svg></button>
    <button class="btn" id="mute" aria-label="Sound" title="Sound"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path id="wave" d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg></button>
    <button class="btn" id="restart" aria-label="Restart level" title="Restart level"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/></svg></button>
  </div>
  <div id="toast" class="card"></div>
  <button id="panelBtn" class="card" aria-label="Notes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg></button>
  <div id="sndPanel" class="card"><button id="sndMute">Sound on</button>
    <label>Effects<input type="range" id="sndSfx" min="0" max="100"></label>
    <label>Surroundings<input type="range" id="sndAmb" min="0" max="100"></label></div>
</div>
<div class="overlay" id="intro"><div class="panel card">
  <div class="kicker">Lakdive Sakmana · ${meta.chapterLabel || 'Chapter ' + meta.chapter}</div><h2>${meta.title}</h2><h3>${meta.tagline}</h3>
  <p style="font-size:15px;line-height:1.55;margin:0 0 12px">${meta.intro}</p>
  ${(L.slots || []).some((x) => x.id === 'leaf') ? `<p style="font-size:13.5px;line-height:1.5;margin:0 0 12px;padding:8px 12px;border-radius:10px;background:rgba(217,190,138,.25)">🍃 ${meta.chapter === 'V' ? 'The last secret ola-leaf page is hidden in this chapter. If you found the other four, it brings a surprise.' : 'A secret ola-leaf page is hidden somewhere in this chapter. Find one in every chapter for a surprise in Chapter V.'}</p>` : ''}
  <ul style="text-align:left;font-size:14px;line-height:1.6;margin:0 0 18px;padding-left:20px;color:var(--ink-soft)">${meta.howto.map((h) => `<li>${h}</li>`).join('')}</ul>
  <div class="go"><button class="cta" id="start">Begin</button></div>
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
  // soft start, soft landing
  const ease = (t) => 0.5 * (1 - (1 - t) ** 3) + 0.5 * (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);
  const timeScale = { k: 1 };
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !!navigator.webdriver, powerPreference: 'high-performance' });
  const COARSE = matchMedia('(pointer: coarse)').matches; let pixelRatio = Math.min(devicePixelRatio || 1, 2); renderer.setPixelRatio(pixelRatio); renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.prepend(renderer.domElement);
  // the sky behind the scene: a soft glow where the sun sits and slow bands of cloud, tinted by each chapter's own sky colours
  { const sky = document.createElement('div'); sky.id = 'sky'; sky.innerHTML = '<i class="glow"></i><i class="c c1"></i><i class="c c2"></i><i class="c c3"></i><i class="vig"></i>'; document.body.prepend(sky); }
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(meta.fog ?? 0xefe5dc, 92, 150);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
  const camTarget = new THREE.Vector3(...(meta.camStart || [0, 1.4, 0]));
  let areaZoom = 1;
  const cam = { az: meta.az ?? Math.PI / 4, azTo: meta.az ?? Math.PI / 4, azDrag: 0, el: 0.6155, dist: 80, zoom: 1, zoomTo: 1 };
  // critically damped springs: every camera move eases in and out, with no overshoot
  const camVel = { az: 0, zoom: 0, area: 0, target: new THREE.Vector3() };
  function damp(cur, to, velKey, smooth, dt) { const om = 2 / smooth, x = om * dt, ex = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x); const ch = cur - to, tmp = (camVel[velKey] + om * ch) * dt; camVel[velKey] = (camVel[velKey] - om * tmp) * ex; return to + (ch + tmp) * ex; }
  const dampV = { v: new THREE.Vector3() };
  function dampVec(cur, to, smooth, dt) { const om = 2 / smooth, x = om * dt, ex = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x); const ch = dampV.v.copy(cur).sub(to), tmp = camVel.target.clone().addScaledVector(ch, om).multiplyScalar(dt); camVel.target.addScaledVector(tmp, -om).multiplyScalar(ex); cur.copy(to).add(ch.add(tmp).multiplyScalar(ex)); }
  function fitCamera() { const a = innerWidth / innerHeight; const h = (a < 0.8 ? 29 / a : 25) * (meta.frame || 1); camera.left = -h * a / 2; camera.right = h * a / 2; camera.top = h / 2; camera.bottom = -h / 2; camera.zoom = cam.zoom * areaZoom; camera.updateProjectionMatrix(); }
  function placeCamera() { camera.position.set(camTarget.x + cam.dist * Math.sin(cam.az) * Math.cos(cam.el), camTarget.y + cam.dist * Math.sin(cam.el), camTarget.z + cam.dist * Math.cos(cam.az) * Math.cos(cam.el)); camera.lookAt(camTarget); }
  fitCamera(); placeCamera();
  addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); fitCamera(); });
  const hemi = new THREE.HemisphereLight(0xfff3e8, 0xb5a58e, 1.5); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0dc, 2.2); sun.castShadow = true; const SH_MAP = COARSE ? 3072 : 4096, SH_EXT = 23; sun.shadow.mapSize.set(SH_MAP, SH_MAP);
  Object.assign(sun.shadow.camera, { left: -SH_EXT, right: SH_EXT, top: SH_EXT, bottom: -SH_EXT, near: 1, far: 90 });
  const SUN_OFF = new THREE.Vector3(-12, 20.6, 10), shF = SUN_OFF.clone().normalize().negate(), shR = new THREE.Vector3().crossVectors(shF, new THREE.Vector3(0, 1, 0)).normalize(), shU = new THREE.Vector3().crossVectors(shR, shF), shTexel = 2 * SH_EXT / SH_MAP, shP = new THREE.Vector3();
  // the shadow box follows the camera in whole-texel steps, so shadow edges don't shimmer
  function placeSun() { const a = Math.round(camTarget.dot(shR) / shTexel) * shTexel, b = Math.round(camTarget.dot(shU) / shTexel) * shTexel, c = camTarget.dot(shF);
    shP.set(0, 0, 0).addScaledVector(shR, a).addScaledVector(shU, b).addScaledVector(shF, c); sun.target.position.copy(shP); sun.position.copy(shP).add(SUN_OFF); }
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.035; sun.shadow.radius = 2.2; scene.add(sun); scene.add(sun.target);
  const fill = new THREE.DirectionalLight(0xd9e6ff, 0.45); fill.position.set(14, 6, -10); scene.add(fill);

  /* ---------- helpers ---------- */
  const matCache = new Map();
  // every surface gets a soft light edge on the faces turned away from the viewer, and the undersides of the islands melt into the sky's haze
  const haze = { color: { value: new THREE.Color(meta.fog ?? 0xefe5dc) } };
  function soften(m) {
    m.onBeforeCompile = (sh) => { sh.uniforms.uHaze = haze.color;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vHazeY;').replace('#include <project_vertex>', `#include <project_vertex>
        vec4 hzP = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          hzP = instanceMatrix * hzP;
        #endif
        vHazeY = (modelMatrix * hzP).y;`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vHazeY; uniform vec3 uHaze;').replace('#include <opaque_fragment>', `
        float hzRim = pow(1.0 - clamp(normal.z, 0.0, 1.0), 3.0);
        outgoingLight += diffuseColor.rgb * hzRim * 0.22 + vec3(1.0, 0.97, 0.92) * hzRim * 0.035;
        outgoingLight = mix(outgoingLight, uHaze, smoothstep(-3.0, -15.0, vHazeY) * 0.62);
        #include <opaque_fragment>`); };
    m.customProgramCacheKey = () => 'lakdive-soft-1'; return m; }
  function mat(color, opts = {}) { const k = color + JSON.stringify(opts); if (!matCache.has(k)) matCache.set(k, soften(new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0, flatShading: true, ...opts }))); return matCache.get(k); }
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
    // the Kandyan queen's outfit (unlocked on the map by finding all five ola-leaf pages) replaces each chapter's own outfit
    const wear = (() => { try { return new Set(JSON.parse(localStorage.getItem('lakdive.leaves.v1') || '[]')).size >= 5 && localStorage.getItem('lakdive.wardrobe.v1') === 'queen'; } catch (e) { return false; } })();
    const glb = wear ? import('../queen.js').then((m) => m.default).catch(() => L.heroGlb) : Promise.resolve(L.heroGlb);
    glb.then(loadHero);
  }
  // build (or swap in) her model: props she is carrying move over to the new rig
  function loadHero(b64, then) { const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    new GLTFLoader().parse(bin.buffer, './', (g) => {
      const model = g.scene; model.scale.setScalar(HERO_SCALE);
      model.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; o.frustumCulled = false; } });
      if (hero.model) { held.forEach((h) => h.obj.parent && h.obj.parent.remove(h.obj)); girl.remove(hero.model); }
      girl.add(model); hero.model = model;
      const bones = {}; model.traverse((o) => { if (o.isBone) bones[o.name] = o; });
      hero.rig = { bones, landmarks: { SK: Object.keys(bones).filter((n) => /^skirt\d+_0$/.test(n)).length } };
      hero.sec = new Secondary(hero.rig);
      held.forEach(attachHeld); document.body.classList.add('ready'); if (then) then();
    }); }
  function playAction(name, { speed = 1.35, contact = 0.95, onContact, done } = {}) { hero.action = { name, t: 0, speed, contact, onContact, done, fired: false }; }

  /* ---------- context handed to the level ---------- */
  const E = { THREE, S, scene, camera, cam, camTarget, sun, hemi, fill, renderer, anims, stats, timeScale, girl, hero, HERO_SCALE,
    mat, mesh, polar, deg, tag, hash, canvasTex, bubble, sparkle, jiggle, beacon, halo, ring, hold, playAction, label: (...a) => label(...a), ICONS,
    bell: (...a) => bell(...a), grind: (...a) => grind(...a), click: () => click(), bump: () => bump(), chime: () => chime(), tone: (...a) => tone(...a),
    refresh: () => refreshHUD(), progress: () => { lastProgress = clock.elapsedTime; }, win: () => win(), shake: (s) => { shake = s; }, $, get AC() { return AC; }, get sfx() { return SFX; }, get audio() { return A; } };
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
      S.player = c.to; stats.steps++; rec({ n: c.to });
      if (V.onArrive) V.onArrive(c.to, c.e, !walker.segs.length && !walker.queued); // last flag: she stops here
      refreshHUD();
      if (walker.queued) { const q = walker.queued; walker.queued = null; walker.cur = null; walker.segs = []; if (!startWalk(q.target, q.pending)) noPath(q.pending); return true; }
      const over = c.d - Ln; nextSeg(); if (!walker.cur) arrive(); else if (!(V.holdEdge && V.holdEdge(walker.cur.e, walker.cur))) walker.cur.d = Math.min(over, 0.2); return true;
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
    rec({ a: what });
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
    clearRun(); chime(); document.body.classList.add('won');
    if (V.onWin) V.onWin();
    if (EMBED) parent.postMessage({ pahana: 'won', chapter: meta.chapter }, '*');
    setTimeout(() => {
      if (meta.noStats) { document.querySelector('#win .stats').style.display = 'none'; $('winNote').textContent = meta.winNote || ''; $('win').classList.remove('hide'); return; }
      $('stSteps').textContent = stats.steps; $('stTurns').textContent = stats.turns; $('stSecret').textContent = S.has && S.has.leaf ? '1/1' : '0/1';
      $('winNote').textContent = S.has && S.has.leaf ? 'You even found the hidden ola-leaf page.' : 'Something is still hidden somewhere…';
      $('win').classList.remove('hide');
    }, meta.winDelay ?? 7000);
  }


  /* ---------- saving: every move inside a chapter is kept, so a reload (or a phone that drops the tab) carries on where she was ---------- */
  const RUN_KEY = 'lakdive.run.v2.' + (meta.chapter ?? meta.place ?? location.pathname) + (meta.saveV ? '.' + meta.saveV : ''); // a chapter bumps saveV when its map changes
  const runLog = []; let replaying = false, quietUntil = 0;
  function loadRun() { try { const r = JSON.parse(localStorage.getItem(RUN_KEY)); return r && Array.isArray(r.log) ? r.log : null; } catch (e) { return null; } }
  function saveRun() { try { localStorage.setItem(RUN_KEY, JSON.stringify({ log: runLog, at: Date.now() })); } catch (e) {} }
  function clearRun() { try { localStorage.removeItem(RUN_KEY); } catch (e) {} }
  function rec(e) { if (replaying || !started || document.body.classList.contains('won')) return; runLog.push(e); saveRun(); }
  const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
  async function settle(maxMs = 20000) { const t0 = performance.now(); let calm = 0;
    while (performance.now() - t0 < maxMs) { await nextFrame(); const busy = walker.cur || walker.queued || anims.length || hero.action || (V.busy && V.busy()); calm = busy ? 0 : calm + 1; if (calm >= 4) return; } }
  function stepTo(n) { if (S.player === n) return; const e = edgeBetween(S.player, n); if (!e) { startWalk(n); return; }
    walker.pending = null; walker.queued = null; walker.segs = [{ from: S.player, to: n }]; nextSeg(); }
  async function resume(log) {
    replaying = true; const veil = document.createElement('div'); veil.id = 'resumeVeil';
    veil.innerHTML = '<div><b>Welcome back</b><br>Picking up where you left off…<div class="bar"><i></i></div></div>'; document.body.appendChild(veil);
    const bar = veil.querySelector('i'); timeScale.k = 20; if (E.audio && E.audio.quiet) E.audio.quiet(true);
    try {
      await settle();
      for (let n = 0; n < log.length; n++) {
        const e = log[n]; bar.style.width = (100 * (n + 1) / log.length).toFixed(0) + '%';
        if (e.r) { cam.azTo += e.r * Math.PI / 2; for (let k = 0; k < 6; k++) await nextFrame(); }
        else if (e.n !== undefined) stepTo(e.n); // one stone at a time, along the very edge she really took
        else if (e.a !== undefined) act(e.a);
        else if (e.H !== undefined && V.onHandle) V.onHandle(e.H, e.d);
        else if (e.h !== undefined && V.tapHidden) { const o = pickables.find((m) => m.userData.hidden === e.h); V.tapHidden(e.h, o); }
        runLog.push(e); await settle();
      }
    } catch (err) { console.warn('resume stopped early', err); }
    timeScale.k = 1; replaying = false; quietUntil = performance.now() + 6000; saveRun(); refreshHUD();
    cam.az = cam.azTo; camVel.az = 0; if (E.audio && E.audio.quiet) E.audio.quiet(false);
    veil.classList.add('out'); setTimeout(() => veil.remove(), 700);
    const el = $('toast'); el.innerHTML = 'Welcome back. You’re right where you left off.'; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3600);
    lastProgress = clock.elapsedTime;
  }

  /* ---------- HUD ---------- */
  let toastTimer;
  function label(html, ms = 2600) { if (replaying || performance.now() < quietUntil) return; const el = $('toast'); el.innerHTML = html; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), ms); }
  let leafNoted = false;
  function noteLeaf() { if (leafNoted || !(S.has && S.has.leaf)) return; leafNoted = true;
    try { const k = 'lakdive.leaves.v1', a = JSON.parse(localStorage.getItem(k) || '[]'); if (!a.includes(meta.chapter)) { a.push(meta.chapter); localStorage.setItem(k, JSON.stringify(a)); } } catch (e) {}
    if (EMBED) parent.postMessage({ pahana: 'leaf', chapter: meta.chapter }, '*');
    let n = 0; try { n = new Set(JSON.parse(localStorage.getItem('lakdive.leaves.v1') || '[]')).size; } catch (e) {}
    if (n >= 5 && !replaying) setTimeout(offerQueen, 2600); } // the fifth page: offer the royal outfit right away
  function offerQueen() {
    try { if (localStorage.getItem('lakdive.wardrobe.v1') === 'queen') return; } catch (e) {}
    const box = document.createElement('div'); box.id = 'queenOffer'; box.className = 'card';
    box.innerHTML = '<b>All five ola-leaf pages!</b><br>The old pages tell of a Kandyan queen. Her robes and crown are yours now.<div><button class="cta" id="qYes">👑 Wear them</button><button class="cta" id="qNo">Not now</button></div><small>You can change outfits any time from the journey map.</small>';
    document.body.appendChild(box); ['pointerdown', 'pointerup'].forEach((t) => box.addEventListener(t, (e) => e.stopPropagation()));
    $('qNo').onclick = () => { click(); box.remove(); };
    $('qYes').onclick = () => { click(); box.remove(); try { localStorage.setItem('lakdive.wardrobe.v1', 'queen'); } catch (e) {}
      import('../queen.js').then((m) => loadHero(m.default, () => { sparkle(girl, 4); chime(); label('The Kandyan queen walks on.', 3600); if (EMBED) parent.postMessage({ pahana: 'leaf', chapter: meta.chapter }, '*'); })).catch(() => label('The royal outfit could not be loaded.', 3000)); };
  }
  let objTimer = 0;
  function refreshHUD() {
    noteLeaf();
    { const el = $('objective'), txt = logic.objective(S);
      if (!el.textContent || el.textContent === '…' || replaying) el.textContent = txt;
      else if (txt !== (el.dataset.next ?? el.textContent)) { el.dataset.next = txt; el.classList.add('swap'); clearTimeout(objTimer); objTimer = setTimeout(() => { el.textContent = el.dataset.next; delete el.dataset.next; el.classList.remove('swap'); }, 230); } }
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
  $('camL').onclick = () => { cam.azTo -= Math.PI / 2; rec({ r: -1 }); click(); };
  $('camR').onclick = () => { cam.azTo += Math.PI / 2; rec({ r: 1 }); click(); };
  addEventListener('keydown', (e) => { if (e.key === 'q' || e.key === 'Q') $('camL').click(); if (e.key === 'e' || e.key === 'E') $('camR').click(); });
  let started = false;
  $('start').onclick = () => { ensureAudio(); $('intro').classList.add('hide'); document.body.classList.add('playing'); started = true; lastProgress = clock.elapsedTime; const saved = loadRun(); if (saved && saved.length) { resume(saved); return; } invite(); if (meta.startLabel) label(meta.startLabel, 5200); };
  $('again').onclick = () => location.reload();
  // inside the full game (an iframe of the journey map): the win screen leads on to the next chapter or back to the map
  if (EMBED) { $('again').textContent = 'Continue the journey'; $('again').onclick = () => parent.postMessage({ pahana: 'next', chapter: meta.chapter }, '*');
    $('toMap').style.display = ''; $('toMap').onclick = () => parent.postMessage({ pahana: 'map', chapter: meta.chapter }, '*');
    // a chapter already finished earlier can be left at any time from a map button in the corner
    // the map button is always there now: progress inside the chapter is saved, so leaving is safe
    { const b = document.createElement('button'); b.className = 'btn'; b.title = 'Back to the map'; b.setAttribute('aria-label', 'Back to the map');
      b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>';
      b.onclick = () => parent.postMessage({ pahana: 'map', chapter: meta.chapter }, '*'); $('view').appendChild(b); }
    // the map plays the music between chapters; a level starts straight away, without its own title card
    if (new URLSearchParams(location.search).get('autostart') === '1') setTimeout(() => $('start') && $('start').click(), 50); }
  // restart: tap once to arm (the button turns red), tap again within 3 s to start the level over
  { let armed = 0; const rb = $('restart');
    rb.onclick = () => { click(); if (performance.now() - armed < 3000) { clearRun(); location.reload(); return; } armed = performance.now(); rb.style.background = '#e8735a'; rb.style.color = '#fff'; label('Tap restart again to start this level over from the beginning.', 3000);
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
  renderer.domElement.addEventListener('pointermove', (e) => { const d = down; if (!d || d.handle || pinch) return; const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.drag && Math.abs(dx) > 14 && Math.abs(dx) > Math.abs(dy) * 1.3) { d.drag = true; dragging = true; }
    if (d.drag) cam.azDrag = THREE.MathUtils.clamp(-dx / Math.min(innerWidth, 820) * 2.2, -1.75, 1.75); });
  const dropDrag = () => { dragging = false; cam.azDrag = 0; down = null; };
  renderer.domElement.addEventListener('pointercancel', dropDrag); renderer.domElement.addEventListener('pointerleave', () => { if (down && down.drag) dropDrag(); });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!down) return; const dx = e.clientX - down.x, dy = e.clientY - down.y; const d = down; down = null;
    ensureAudio();
    // a handle (e.g. a terrace wheel): tap turns it one way, drag sideways or right-click picks the direction
    if (d.handle && V.onHandle) { const dir = Math.abs(dx) > 25 ? Math.sign(dx) : (d.btn === 2 ? -1 : 1); rec({ H: d.handle, d: dir }); V.onHandle(d.handle, dir); return; }
    if (d.drag) { dragging = false; cam.azDrag = 0; if (Math.abs(dx) > Math.min(70, innerWidth * 0.16)) { cam.azTo -= Math.sign(dx) * Math.PI / 2; rec({ r: -Math.sign(dx) }); click(); } return; }
    if (Math.hypot(dx, dy) > 8) return;
    const hits = pickAt(e.clientX, e.clientY); if (!hits.length) return;
    const hidden = hits.find((h) => h.object.userData.hidden !== undefined);
    handleHit(hidden && hidden.distance - hits[0].distance < 1.3 ? hidden : hits[0]);
  });
  function handleHit(h) {
    const u = h.object.userData;
    if (u.hidden !== undefined) { lastProgress = clock.elapsedTime; rec({ h: u.hidden }); return V.tapHidden(u.hidden, h.object); }
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
  renderer.domElement.addEventListener('wheel', (e) => { cam.zoomTo = THREE.MathUtils.clamp(cam.zoomTo * (e.deltaY > 0 ? 0.9 : 1.1), 0.7, 3); }, { passive: true });
  let pinch = null;
  renderer.domElement.addEventListener('touchmove', (e) => { if (e.touches.length === 2) { const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); if (pinch) cam.zoomTo = THREE.MathUtils.clamp(cam.zoomTo * d / pinch, 0.7, 3); pinch = d; down = null; dragging = false; cam.azDrag = 0; } }, { passive: true });
  renderer.domElement.addEventListener('touchend', () => (pinch = null));

  /* ---------- audio ---------- */
  // Calm, Monument Valley-style sound: soft voices, a pentatonic scale, a gentle shared reverb.
  // Two buses, each with its own volume: effects (sfx) and surroundings (amb). Settings are remembered.
  const AKEY = 'lakdive.audio.v1';
  const aset = (() => { const d = { sfx: 0.8, amb: 0.8, muted: false }; try { return Object.assign(d, JSON.parse(localStorage.getItem(AKEY) || '{}')); } catch (e) { return d; } })();
  const saveAudio = () => { try { localStorage.setItem(AKEY, JSON.stringify(aset)); } catch (e) {} };
  let AC = null, master = null, verb = null, sfxBus = null, ambBus = null, ambCtl = null, muted = aset.muted, quietAudio = false, audioGen = 0, stuck = false, wakeHooked = false;
  function rebuildAudio() { const old = AC; AC = null; stuck = false; audioGen++; for (const k in NB) delete NB[k]; try { old && old.close(); } catch (e) {} ensureAudio(); }
  const NB = {};
  const SCALE = meta.scale || [293.66, 329.63, 369.99, 440.0, 493.88]; // D major pentatonic
  const note = (i) => SCALE[((i % 5) + 5) % 5] * Math.pow(2, Math.floor(i / 5));
  const rnd = (a, b) => a + Math.random() * (b - a);
  let silentEl = null, returned = false;
  function primeSession() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    try { if (!silentEl) { silentEl = document.createElement('audio'); silentEl.setAttribute('playsinline', ''); silentEl.loop = true; silentEl.volume = 0.01;
      silentEl.src = 'data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA=='; }
      const p = silentEl.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
  }
  function ensureAudio() {
    primeSession();
    if (AC) { if (AC.state !== 'running') AC.resume().catch(() => {}); return; }
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      const comp = AC.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.connect(AC.destination);
      master = AC.createGain(); master.gain.value = 0; master.connect(comp);
      verb = AC.createConvolver(); verb.buffer = impulse(3.4, 2.4); verb.connect(master);
      sfxBus = bus(aset.sfx, 0.22, 1.6); ambBus = bus(aset.amb, 0.35, 0.5);
      fadeMaster(muted || quietAudio ? 0 : 1, 2.5);
      ambCtl = (V.sound && V.sound(A)) || defaultAmbience(A);
      document.addEventListener('visibilitychange', () => { if (AC && document.hidden) AC.suspend().catch(() => {}); });
      if (!wakeHooked) { wakeHooked = true; // phones pause sound when the screen locks (iOS calls it "interrupted")
        // first try to resume; if the phone refuses, the next touch rebuilds the sound from scratch (a new context made inside a touch is always allowed)
        const wake = (ev) => { if (!AC || document.hidden) return;
          const touch = ev && ev.isTrusted && (ev.type === 'pointerdown' || ev.type === 'touchend' || ev.type === 'keydown');
          if (returned && touch) { returned = false; primeSession(); rebuildAudio(); return; } // back from a locked screen: start the sound afresh
          if (AC.state === 'running') return;
          if (stuck && ev && ev.isTrusted && ev.type !== 'focus' && ev.type !== 'pageshow') { rebuildAudio(); return; }
          AC.resume().catch(() => {}); setTimeout(() => { if (AC && AC.state !== 'running' && !document.hidden) stuck = true; }, 450); };
        ['pointerdown', 'touchend', 'keydown'].forEach((ev) => addEventListener(ev, wake, true));
        addEventListener('pageshow', wake); addEventListener('focus', wake);
        document.addEventListener('visibilitychange', () => { if (document.hidden) returned = true; else wake(); }); addEventListener('pagehide', () => (returned = true)); }
      AC.onstatechange = () => { if (AC && AC.state === 'running') stuck = false; };
    } catch (e) { console.warn('audio', e); AC = null; }
  }
  function bus(vol, send, k) {
    const g = AC.createGain(); g.gain.value = vol * k; g.connect(master);
    const s = AC.createGain(); s.gain.value = send; g.connect(s).connect(verb);
    const f = AC.createGain(); f.gain.value = vol * k; f.connect(verb); // "far": mostly reverb, for distant sounds
    const fd = AC.createGain(); fd.gain.value = 0.2; f.connect(fd).connect(master);
    return { in: g, far: f, set(v) { const t = AC.currentTime; g.gain.setTargetAtTime(v * k, t, 0.05); f.gain.setTargetAtTime(v * k, t, 0.05); } };
  }
  function impulse(sec, decay) {
    const n = (AC.sampleRate * sec) | 0, b = AC.createBuffer(2, n, AC.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let lp = 0; for (let i = 0; i < n; i++) { lp += ((Math.random() * 2 - 1) - lp) * (0.5 - 0.42 * i / n); d[i] = lp * Math.pow(1 - i / n, decay) * (i < 400 ? i / 400 : 1); } }
    return b;
  }
  function fadeMaster(v, sec = 0.4) { if (!master) return; const t = AC.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(v * 2.4, t + sec); }
  function noise(kind = 'white', sec = 4) {
    const k = kind + sec; if (NB[k]) return NB[k];
    const n = (AC.sampleRate * sec) | 0, b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, last = 0;
    for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1;
      if (kind === 'pink') { b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2; }
      else if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else d[i] = w; }
    const fade = Math.min(2000, n >> 3); for (let i = 0; i < fade; i++) { const k2 = i / fade; d[n - fade + i] = d[n - fade + i] * (1 - k2) + d[i] * k2; } // seamless loop
    return (NB[k] = b);
  }
  const noiseBuf = (sec) => noise('white', sec);
  // route a voice to a bus; o.bus 'sfx' | 'amb', o.pan -1..1, o.far 0..1 (how distant / wet)
  function out(node, o = {}) {
    const b = o.bus === 'amb' ? ambBus : sfxBus; let n = node;
    if (o.pan && AC.createStereoPanner) { const p = AC.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, o.pan)); n.connect(p); n = p; }
    if (o.far) { const a = AC.createGain(), z = AC.createGain(); a.gain.value = 1 - o.far; z.gain.value = o.far; n.connect(a).connect(b.in); n.connect(z).connect(b.far); }
    else n.connect(b.in);
  }
  function env(p, t, a, peak, d) { p.setValueAtTime(0.0001, t); p.linearRampToValueAtTime(Math.max(peak, 0.0002), t + a); p.exponentialRampToValueAtTime(0.0001, t + a + d); }
  // elephant voices. A trumpet is a brassy blast that leaps up in pitch, shakes, and falls away, pushed through a "trunk" of
  // resonances with a rush of breath; a rumble is a deep purring growl; a calf's call is a short high squeak of the same kind.
  let shaperCurve = null;
  function elephantCall(style, t, o = {}) {
    const v = o.vol ?? 1, g = AC.createGain(), ends = [];
    const lfo = (hz, depth, param, d) => { const l = AC.createOscillator(), lg = AC.createGain(); l.frequency.value = hz; lg.gain.value = depth; l.connect(lg).connect(param); l.start(t); l.stop(t + d + 0.2); };
    if (style === 'rumble') {
      const d = rnd(1.9, 2.7), f = rnd(56, 70), mix = AC.createGain(), lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.8;
      [[1, 'sawtooth', 1], [2.01, 'sawtooth', 0.5], [3, 'sine', 0.35]].forEach(([m, type, lv]) => { const s = AC.createOscillator(), sg = AC.createGain(); s.type = type; sg.gain.value = lv;
        s.frequency.setValueAtTime(f * m * 0.94, t); s.frequency.linearRampToValueAtTime(f * m * 1.1, t + d * 0.4); s.frequency.linearRampToValueAtTime(f * m * 0.9, t + d); s.connect(sg).connect(mix); s.start(t); s.stop(t + d + 0.2); });
      const am = AC.createGain(); am.gain.value = 0.72; lfo(rnd(9, 13), 0.28, am.gain, d); mix.connect(lp).connect(am).connect(g);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.011 * v, t + 0.4); g.gain.setValueAtTime(0.011 * v, t + d * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      out(g, o); return d; }
    if (style === 'snort') {
      const d = rnd(0.22, 0.34), br = AC.createBufferSource(), bp = AC.createBiquadFilter(), hp = AC.createBiquadFilter();
      br.buffer = noise('white', 2); bp.type = 'bandpass'; bp.frequency.setValueAtTime(rnd(900, 1150), t); bp.frequency.exponentialRampToValueAtTime(rnd(260, 340), t + d); bp.Q.value = 1.1;
      hp.type = 'highpass'; hp.frequency.value = 180; br.connect(bp).connect(hp).connect(g); br.start(t); br.stop(t + d + 0.1);
      const bod = AC.createOscillator(), bg = AC.createGain();   // the thump of air in the trunk
      bod.type = 'triangle'; bod.frequency.setValueAtTime(rnd(120, 150), t); bod.frequency.exponentialRampToValueAtTime(62, t + d);
      bg.gain.setValueAtTime(0.0001, t); bg.gain.linearRampToValueAtTime(0.5, t + 0.02); bg.gain.exponentialRampToValueAtTime(0.0001, t + d); bod.connect(bg).connect(g); bod.start(t); bod.stop(t + d + 0.1);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.26 * v, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      out(g, o); return d; }
    const calf = style === 'calf', d = calf ? (o.short ? rnd(0.28, 0.4) : rnd(0.45, 0.7)) : rnd(1.05, 1.5), f = calf ? rnd(640, 760) : rnd(395, 465), k = calf ? 1.35 : 1;
    const shape = calf ? [[0, 0.8], [0.18, 1.42], [0.55, 1.3], [1, 0.98]] : [[0, 0.72], [0.13, 1.2], [0.45, 1.3], [0.75, 1.12], [1, 0.82]];
    const src = AC.createGain(); src.gain.value = 0.5;
    [[1, 'sawtooth', 1], [1.008, 'sawtooth', 0.8], [0.5, 'square', calf ? 0.12 : 0.4]].forEach(([m, type, lv]) => { const s = AC.createOscillator(), sg = AC.createGain(); s.type = type; sg.gain.value = lv;
      shape.forEach(([at, mul], i) => (i ? s.frequency.linearRampToValueAtTime(f * m * mul, t + d * at) : s.frequency.setValueAtTime(f * m * mul, t)));
      lfo(calf ? 23 : 31, f * m * 0.035, s.frequency, d); s.connect(sg).connect(src); s.start(t); s.stop(t + d + 0.2); });
    const rough = AC.createGain(); rough.gain.value = 0.7; lfo(calf ? 29 : 37, 0.3, rough.gain, d);   // the rattle in the blast
    if (!shaperCurve) { shaperCurve = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; shaperCurve[i] = Math.tanh(2.6 * x); } }
    const sh = AC.createWaveShaper(); sh.curve = shaperCurve; src.connect(rough).connect(sh);
    [[780, 4, 1], [1650, 5, 0.7], [2900, 6, 0.32]].forEach(([fc, q, lv]) => { const bp = AC.createBiquadFilter(), bg = AC.createGain(); bp.type = 'bandpass'; bp.frequency.value = fc * k; bp.Q.value = q; bg.gain.value = lv; sh.connect(bp).connect(bg).connect(g); });
    const br = AC.createBufferSource(), bf = AC.createBiquadFilter(), bg = AC.createGain(); br.buffer = noise('white', 4); bf.type = 'bandpass'; bf.frequency.value = 2100 * k; bf.Q.value = 0.9; bg.gain.value = 0.16; br.connect(bf).connect(bg).connect(g); br.start(t); br.stop(t + d + 0.2);
    { const body = AC.createOscillator(), bg2 = AC.createGain(), blp = AC.createBiquadFilter();   // the chest behind the blast
      body.type = 'sine'; blp.type = 'lowpass'; blp.frequency.value = calf ? 420 : 240; bg2.gain.value = calf ? 0.18 : 0.42;
      shape.forEach(([at, mul], i) => (i ? body.frequency.linearRampToValueAtTime(f * 0.5 * mul, t + d * at) : body.frequency.setValueAtTime(f * 0.5 * mul, t)));
      body.connect(bg2).connect(blp).connect(g); body.start(t); body.stop(t + d + 0.2); }
    const pk = (calf ? 0.12 : 0.11) * v; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(pk, t + 0.05); g.gain.linearRampToValueAtTime(pk * 0.8, t + d * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    out(g, o); return d; }
  function osc(type, f, t, dur, o = {}) {
    const v = AC.createOscillator(), g = AC.createGain(), a = o.a ?? 0.005; v.type = type; v.frequency.setValueAtTime(f, t);
    if (o.to) v.frequency.exponentialRampToValueAtTime(o.to, t + (o.glide || dur));
    if (o.vib) { const l = AC.createOscillator(), lg = AC.createGain(); l.frequency.value = o.vib[0]; lg.gain.value = o.vib[1]; l.connect(lg).connect(v.frequency); l.start(t); l.stop(t + a + dur + 0.1); }
    env(g.gain, t, a, o.vol ?? 0.1, dur); let n = v.connect(g);
    if (o.lp) { const fl = AC.createBiquadFilter(); fl.frequency.value = o.lp; n = n.connect(fl); }
    out(n, o); v.start(t); v.stop(t + a + dur + 0.1); return v;
  }
  function hiss(t, dur, o = {}) {
    const s = AC.createBufferSource(); s.buffer = noise(o.color || 'white', 4); s.loop = true;
    const f = AC.createBiquadFilter(); f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f || 1000, t); if (o.fTo) f.frequency.exponentialRampToValueAtTime(o.fTo, t + (o.a ?? 0.005) + dur); f.Q.value = o.q ?? 1;
    const g = AC.createGain(); env(g.gain, t, o.a ?? 0.005, o.vol ?? 0.1, dur);
    s.connect(f).connect(g); out(g, o); s.start(t, Math.random() * 3); s.stop(t + (o.a ?? 0.005) + dur + 0.1);
  }
  const now = (d = 0) => AC.currentTime + d;
  /* --- instruments --- */
  function pluck(f, t, o = {}) { // soft kalimba / marimba
    const vol = o.vol ?? 0.1, dur = o.dur ?? 1.4;
    osc('sine', f, t, dur, { ...o, vol, a: 0.004 });
    osc('sine', f * 4, t, 0.12, { ...o, vol: vol * 0.18, a: 0.002 });
    osc('triangle', f * 2, t, dur * 0.35, { ...o, vol: vol * 0.12, a: 0.004 });
  }
  function bellV(f, t, o = {}) { // bronze bell: inharmonic partials, long ring
    const vol = o.vol ?? 0.1, dur = o.dur ?? 3.5;
    [[1, 1, 1], [2, 0.3, 0.7], [2.76, 0.22, 0.5], [5.4, 0.07, 0.25], [8.93, 0.035, 0.12]].forEach(([k, a, dk]) =>
      osc('sine', f * k * (1 + (Math.random() - 0.5) * 0.003), t, dur * dk, { ...o, vol: vol * a, a: 0.003 }));
    if (o.hum !== false) osc('sine', f * 0.5, t, dur * 1.2, { ...o, vol: vol * 0.25, a: 0.05 });
  }
  function pad(fs, t, dur, o = {}) { // slow warm chord swell
    const vol = o.vol ?? 0.04;
    fs.forEach((f) => [-4, 4].forEach((c) => { const v = AC.createOscillator(), g = AC.createGain(), lp = AC.createBiquadFilter(); v.type = 'triangle'; v.frequency.value = f; v.detune.value = c; lp.frequency.value = 1400;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.35); g.gain.linearRampToValueAtTime(0.0001, t + dur); v.connect(lp).connect(g); out(g, { ...o, far: o.far ?? 0.4 }); v.start(t); v.stop(t + dur + 0.1); }));
  }
  /* --- effects (all short and soft) --- */
  function tone(f, t, dur, type = 'sine', vol = 0.15, f2) { if (!AC) return; osc(type === 'square' || type === 'sawtooth' ? 'triangle' : type, f, t, dur, { vol: vol * 0.7, to: f2, lp: 2600 }); }
  function snap(f) { let best = f, bd = 1e9; for (let o = -2; o <= 3; o++) for (const q of SCALE) { const c = q * Math.pow(2, o), d = Math.abs(Math.log(c / f)); if (d < bd) { bd = d; best = c; } } return best; }
  function bell(f, delay = 0) { if (!AC) return; f = snap(f); bellV(f, now(delay), { vol: 0.07, dur: 2.6, far: 0.25, hum: false }); }
  function click() { if (!AC) return; const t = now(); osc('sine', 1300, t, 0.05, { to: 900, vol: 0.035 }); hiss(t, 0.03, { f: 2400, q: 2, vol: 0.02 }); }
  function bump() { if (!AC) return; const t = now(); osc('sine', 233, t, 0.28, { to: 196, vol: 0.08, a: 0.01 }); osc('sine', 349, t + 0.08, 0.3, { to: 294, vol: 0.04, a: 0.01 }); }
  function rattle() { if (!AC) return; const t = now(); for (let i = 0; i < 3; i++) { osc('triangle', 150 - i * 12, t + i * 0.11, 0.09, { vol: 0.06, lp: 900 }); hiss(t + i * 0.11, 0.04, { type: 'lowpass', f: 700, vol: 0.05 }); } }
  function grind(sec) { if (!AC) return; const t = now();
    const s = AC.createBufferSource(); s.buffer = noise('brown', 4); s.loop = true; const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420;
    const am = AC.createGain(); am.gain.value = 0.75; const l = AC.createOscillator(), lg = AC.createGain(); l.frequency.value = 6.5; lg.gain.value = 0.25; l.connect(lg).connect(am.gain);
    const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.32, t + 0.25); g.gain.setValueAtTime(0.32, t + Math.max(0.3, sec - 0.35)); g.gain.linearRampToValueAtTime(0.0001, t + sec);
    s.connect(f).connect(am).connect(g); out(g, { far: 0.3 }); s.start(t); s.stop(t + sec + 0.1); l.start(t); l.stop(t + sec + 0.1);
    for (let k = 0.2; k < sec - 0.1; k += rnd(0.28, 0.5)) hiss(t + k, 0.04, { f: rnd(700, 1100), q: 4, vol: 0.03 });
    osc('sine', 110, t + sec - 0.08, 0.6, { vol: 0.1, far: 0.3 }); pluck(note(0) / 2, t + sec - 0.05, { vol: 0.05, far: 0.3 });
  }
  function chime() { if (!AC) return; const t = now(); [0, 2, 4, 5, 7, 9, 10].forEach((n, i) => pluck(note(n), t + i * 0.2, { vol: 0.08, dur: 2.4, far: 0.35 }));
    bellV(note(0), t + 1.5, { vol: 0.07, dur: 5, far: 0.5 }); pad([note(-5), note(-3), note(-1), note(0)], t + 0.3, 7, { vol: 0.03 }); }
  function chatter() { if (!AC) return; const t = now(); const n = 3 + ((Math.random() * 3) | 0);
    for (let i = 0; i < n; i++) { const f = rnd(1100, 1600); osc('triangle', f, t + i * 0.11, 0.07, { to: f * rnd(1.25, 1.5), glide: 0.04, vol: 0.035, lp: 3200, far: 0.15, pan: 0.2 }); } }
  const SFX = {
    pluck: (n, o = {}) => AC && pluck(note(n), now(o.delay || 0), o),
    bell: (f, o = {}) => AC && bellV(f, now(o.delay || 0), o),
    pad: (ns, dur = 6, o = {}) => AC && pad(ns.map(note), now(o.delay || 0), dur, o),
    pickup() { if (!AC) return; const t = now(); pluck(note(4), t, { vol: 0.07, dur: 1 }); pluck(note(7), t + 0.1, { vol: 0.07, dur: 1.3 }); hiss(t, 0.18, { f: 1800, fTo: 3600, q: 0.7, vol: 0.02, a: 0.05 }); },
    place() { if (!AC) return; const t = now(); osc('sine', 150, t, 0.2, { to: 110, vol: 0.08 }); hiss(t, 0.06, { type: 'lowpass', f: 800, vol: 0.05 }); pluck(note(2), t + 0.05, { vol: 0.06, dur: 1.6 }); },
    found(k = 0) { if (!AC) return; const t = now(); hiss(t, 0.45, { f: 700, fTo: 4200, q: 0.8, vol: 0.03, a: 0.12 }); [5, 7, 9].forEach((n, i) => pluck(note(n + k), t + 0.12 + i * 0.09, { vol: 0.055, dur: 1.5, far: 0.25 })); },
    whoosh(d = 0.5) { if (!AC) return; hiss(now(), d, { f: 500, fTo: 2400, q: 0.7, vol: 0.04, a: d * 0.4 }); },
    splash(v = 1) { if (!AC) return; const t = now(); hiss(t, 0.3, { f: 1400, fTo: 600, q: 0.6, vol: 0.06 * v }); for (let i = 0; i < 4; i++) { const f = rnd(500, 900); osc('sine', f, t + 0.06 + i * rnd(0.05, 0.12), 0.07, { to: f * 1.9, vol: 0.025 * v }); } },
    plip(o = {}) { if (!AC) return; const f = rnd(450, 800); osc('sine', f, now(), 0.08, { to: f * rnd(1.7, 2.3), vol: o.vol ?? 0.025, pan: o.pan, far: o.far ?? 0.3, bus: o.bus }); },
    pour(sec = 1.8) { if (!AC) return; const t = now(); hiss(t, sec, { color: 'pink', f: 1100, q: 1.2, vol: 0.06, a: 0.2 }); hiss(t + 0.1, sec * 0.9, { f: 2600, q: 2, vol: 0.02, a: 0.3 }); for (let k = 0.2; k < sec; k += rnd(0.08, 0.2)) SFX.plip({ vol: 0.015 }); },
    rush(sec = 3) { if (!AC) return; const t = now(); hiss(t, sec, { color: 'pink', f: 700, fTo: 450, q: 0.6, vol: 0.09, a: sec * 0.25 }); hiss(t, sec * 0.8, { f: 2200, q: 1, vol: 0.02, a: sec * 0.3 }); },
    flutter(n = 6) { if (!AC) return; const t = now(); for (let i = 0; i < n; i++) hiss(t + i * rnd(0.07, 0.12), 0.06, { f: rnd(1500, 2500), q: 1.5, vol: 0.03 }); },
    flame() { if (!AC) return; const t = now(); hiss(t, 0.6, { type: 'lowpass', color: 'brown', f: 300, fTo: 900, vol: 0.12, a: 0.15 }); pluck(note(5), t + 0.15, { vol: 0.05, dur: 2, far: 0.3 }); },
    lever() { if (!AC) return; const t = now(); osc('triangle', 220, t, 0.06, { vol: 0.05, lp: 1500 }); osc('triangle', 180, t + 0.12, 0.08, { vol: 0.06, lp: 1200 }); hiss(t + 0.12, 0.05, { type: 'lowpass', f: 900, vol: 0.05 }); },
    wheel(n = 6, gap = 0.14) { if (!AC) return; const t = now(); for (let i = 0; i < n; i++) { osc('triangle', 520 + (i % 2) * 40, t + i * gap, 0.04, { vol: 0.03, lp: 2000 }); hiss(t + i * gap, 0.03, { f: 1800, q: 3, vol: 0.02 }); } },
    thunk() { if (!AC) return; const t = now(); osc('sine', 90, t, 0.4, { to: 60, vol: 0.14, far: 0.25 }); hiss(t, 0.12, { type: 'lowpass', color: 'brown', f: 400, vol: 0.12 }); },
    monkey: () => chatter(),
    grind, click, bump, rattle, chime,
    step, steps: true,
  };
  // footsteps: soft, a little different each time; surface from the level (V.surfaceAt)
  let stepSide = 1;
  function step(surface = 'stone', vol = 1) {
    if (!AC) return; const t = now(), v = vol * rnd(0.8, 1.1), p = (stepSide = -stepSide) * 0.06;
    const o = { pan: p };
    switch (surface) {
      case 'sand': hiss(t, 0.08, { ...o, f: rnd(2200, 3200), q: 0.7, vol: 0.02 * v }); hiss(t, 0.05, { ...o, type: 'lowpass', f: 380, vol: 0.035 * v }); break;
      case 'grass': hiss(t, 0.12, { ...o, f: rnd(3000, 4200), q: 0.6, vol: 0.016 * v, a: 0.02 }); hiss(t, 0.04, { ...o, type: 'lowpass', f: 300, vol: 0.025 * v }); break;
      case 'brick': hiss(t, 0.045, { ...o, type: 'lowpass', f: 900, vol: 0.04 * v }); osc('sine', rnd(150, 175), t, 0.05, { ...o, to: 120, vol: 0.025 * v }); break;
      case 'wood': osc('triangle', rnd(130, 150), t, 0.08, { ...o, to: 105, vol: 0.045 * v, lp: 900 }); hiss(t, 0.03, { ...o, type: 'lowpass', f: 1300, vol: 0.03 * v }); break;
      case 'iron': osc('sine', rnd(300, 340), t, 0.16, { ...o, vol: 0.016 * v }); osc('sine', rnd(820, 900), t, 0.1, { ...o, vol: 0.009 * v }); hiss(t, 0.03, { ...o, type: 'lowpass', f: 2000, vol: 0.025 * v }); break;
      case 'water': case 'pad': hiss(t, 0.12, { ...o, f: rnd(700, 1000), fTo: 450, q: 0.8, vol: 0.04 * v }); { const f = rnd(450, 650); osc('sine', f, t + 0.03, 0.07, { ...o, to: f * 1.8, vol: 0.016 * v }); } break;
      default: hiss(t, 0.04, { ...o, type: 'lowpass', f: rnd(650, 800), vol: 0.045 * v }); osc('sine', rnd(165, 190), t, 0.05, { ...o, to: 130, vol: 0.022 * v });
    }
  }
  /* --- surroundings toolkit, handed to V.sound(A) --- */
  const A = {
    get ctx() { return AC; }, note, rnd, osc, hiss, pluck, bell: bellV, pad, out, sfx: SFX, now,
    quiet(on) { quietAudio = on; if (master) fadeMaster(on || muted ? 0 : 1, on ? 0.1 : 1.2); }, // hushed while a saved walk is replayed
    loop(o = {}) { // continuous filtered noise bed with an optional slow swell
      const s = AC.createBufferSource(); s.buffer = noise(o.color || 'pink', 6); s.loop = true;
      const f = AC.createBiquadFilter(); f.type = o.type || 'bandpass'; f.frequency.value = o.f || 600; f.Q.value = o.q ?? 0.7;
      const sw = AC.createGain(); sw.gain.value = 1; const g = AC.createGain(); g.gain.value = o.vol ?? 0.05;
      if (o.lfo) { const l = AC.createOscillator(), lg = AC.createGain(); l.frequency.value = o.lfo[0]; lg.gain.value = o.lfo[1]; l.connect(lg).connect(sw.gain); l.start(); }
      s.connect(f).connect(sw).connect(g); out(g, { bus: 'amb', pan: o.pan, far: o.far }); s.start(0, Math.random() * 5);
      return { f, g, to(v, tc = 0.8) { g.gain.setTargetAtTime(Math.max(0, v), AC.currentTime, tc); }, level(v, sec = 1.5) { const t = AC.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(Math.max(0, v), t + sec); } };
    },
    swell(lp, peak, sec) { const t = AC.currentTime, g = lp.g.gain, base = g.value; g.cancelScheduledValues(t); g.setValueAtTime(base, t); g.linearRampToValueAtTime(base + peak, t + sec * 0.45); g.linearRampToValueAtTime(base, t + sec); },
    every(range, fn, first) { // random repeating event; skipped while muted or hidden
      let stop = false; const gen = audioGen; const go = () => { if (stop || gen !== audioGen) return; if (AC && !muted && !document.hidden && AC.state === 'running') try { fn(); } catch (e) { console.warn(e); } setTimeout(go, rnd(range[0], range[1]) * 1000); };
      setTimeout(go, (first ?? rnd(range[0], range[1])) * 1000); return () => (stop = true);
    },
    motor(o = {}) { // an engine passing by or carrying her: o.f Hz (o.f2 at the end), o.rate putts/s, o.dur, o.vol, o.pan [from, to]
      const t = now(), d = o.dur || 3, v = AC.createOscillator(), am = AC.createOscillator(), amg = AC.createGain(), g = AC.createGain(), lp = AC.createBiquadFilter(), pre = AC.createGain();
      v.type = o.type || 'sawtooth'; v.frequency.setValueAtTime(o.f || 70, t); if (o.f2) v.frequency.linearRampToValueAtTime(o.f2, t + d);
      am.frequency.value = o.rate || 22; amg.gain.value = o.depth ?? 0.5; pre.gain.value = 0.5; am.connect(amg).connect(pre.gain);
      lp.type = 'lowpass'; lp.frequency.value = o.lp || 650;
      const pk = o.vol ?? 0.03, at = o.attack ?? d * 0.45, rl = o.release ?? d * 0.45;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(pk, t + at); g.gain.setValueAtTime(pk, t + Math.max(at, d - rl)); g.gain.linearRampToValueAtTime(0.0001, t + d);
      let n = v.connect(pre).connect(lp).connect(g);
      if (o.pan && AC.createStereoPanner) { const p = AC.createStereoPanner(); p.pan.setValueAtTime(o.pan[0], t); p.pan.linearRampToValueAtTime(o.pan[1], t + d); n.connect(p); n = p; }
      out(n, { bus: o.bus || 'amb', far: o.far ?? 0.2 }); v.start(t); am.start(t); v.stop(t + d + 0.1); am.stop(t + d + 0.1);
    },
    elephant(style, o = {}) { return elephantCall(style, now() + (o.delay || 0), { bus: o.bus || 'sfx', pan: o.pan ?? 0, far: o.far ?? 0.4, vol: o.vol ?? 1 }); },
    bird(kind = 'chirp', o = {}) {
      const t = now(), pan = o.pan ?? rnd(-0.8, 0.8), far = o.far ?? rnd(0.3, 0.6), v = o.vol ?? 1, b = { bus: 'amb', pan, far };
      if (kind === 'chirp') { const n = 2 + ((Math.random() * 3) | 0), f0 = rnd(3400, 5200); for (let i = 0; i < n; i++) osc('sine', f0 * rnd(0.95, 1.05), t + i * rnd(0.07, 0.11), 0.05, { ...b, to: f0 * 0.7, vol: 0.022 * v }); }
      else if (kind === 'bulbul') { const ns = [rnd(1500, 1800), rnd(2200, 2600), rnd(1800, 2100), rnd(2500, 2900)]; let tt = t; ns.slice(0, 3 + ((Math.random() * 2) | 0)).forEach((f) => { osc('sine', f, tt, 0.11, { ...b, to: f * rnd(0.85, 1.2), vol: 0.02 * v, a: 0.015 }); tt += rnd(0.11, 0.16); }); }
      else if (kind === 'koel') { // Asian koel: "ku-OO", repeated, rising each time
        const base = rnd(560, 640), n = 3 + ((Math.random() * 3) | 0);
        for (let i = 0; i < n; i++) { const f = base * (1 + 0.075 * i), tt = t + i * 0.78;
          osc('sine', f * 0.86, tt, 0.13, { ...b, to: f, vol: 0.026 * v, a: 0.02 }); osc('sine', f * 1.04, tt + 0.17, 0.3, { ...b, to: f * 1.42, glide: 0.22, vol: 0.032 * v, a: 0.05 }); }
      }
      else if (kind === 'dove') { const f = rnd(380, 430); [0, 0.42, 0.78].forEach((d, i) => osc('sine', f * (i === 2 ? 0.92 : 1), t + d, i === 2 ? 0.5 : 0.28, { ...b, to: f * 0.9, vol: 0.022 * v, a: 0.06, vib: [22, 6] })); }
      else if (kind === 'cricket') { const f = rnd(4200, 4800); for (let k = 0; k < 3; k++) for (let i = 0; i < 4; i++) osc('sine', f, t + k * 0.32 + i * 0.035, 0.018, { ...b, vol: 0.008 * v, a: 0.004 }); }
      else if (kind === 'gecko') { const n = 5 + ((Math.random() * 3) | 0); for (let i = 0; i < n; i++) { hiss(t + i * 0.14, 0.02, { ...b, f: 2600, q: 5, vol: 0.03 * v }); osc('triangle', 900, t + i * 0.14, 0.03, { ...b, to: 700, vol: 0.012 * v }); } }
      else if (kind === 'cicada') { const d = rnd(2.5, 4.5); const s = AC.createBufferSource(); s.buffer = noise('white', 4); s.loop = true; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = rnd(4500, 6000); f.Q.value = 6;
        const am = AC.createGain(); am.gain.value = 0.5; const l = AC.createOscillator(), lg = AC.createGain(); l.frequency.value = rnd(35, 50); lg.gain.value = 0.5; l.connect(lg).connect(am.gain);
        const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.02 * v, t + d * 0.4); g.gain.linearRampToValueAtTime(0.0001, t + d);
        s.connect(f).connect(am).connect(g); out(g, b); s.start(t); s.stop(t + d + 0.1); l.start(t); l.stop(t + d + 0.1); }
      else if (kind === 'elephant' || kind === 'calf') { const eb = { ...b, bus: o.bus || 'amb', vol: v };
        // far-off herds mostly rumble; close by, an elephant trumpets. A calf squeaks, sometimes twice.
        if (kind === 'calf') { const d = elephantCall('calf', t, eb); if (Math.random() < 0.45) elephantCall('calf', t + d + rnd(0.1, 0.2), { ...eb, vol: v * 0.8, short: true }); }
        else { const pick = o.style || (far > 0.6 ? (Math.random() < 0.68 ? 'rumble' : Math.random() < 0.5 ? 'snort' : 'trumpet') : (Math.random() < 0.3 ? 'snort' : 'trumpet'));
          const dd = elephantCall(pick, t, eb);
          if (!o.style && Math.random() < 0.3) elephantCall(Math.random() < 0.6 ? 'snort' : 'rumble', t + dd + rnd(0.3, 0.9), { ...eb, vol: v * 0.75 }); } }
      else if (kind === 'whistle') { const f = o.f || 760; [0, 0.06].forEach((d) => osc('triangle', f * (d ? 1.25 : 1), t + d, 1.4, { ...b, vol: 0.016 * v, a: 0.15, lp: 2200, vib: [5, 4] })); }
      else if (kind === 'peacock') { const f = rnd(650, 760); [0, 0.55].forEach((d) => osc('triangle', f, t + d, 0.4, { ...b, to: f * 1.35, glide: 0.15, vol: 0.02 * v, a: 0.03, lp: 2400 })); }
    },
  };
  function defaultAmbience(A) {
    A.loop({ color: 'pink', f: 500, q: 0.5, vol: 0.02, lfo: [0.07, 0.35] });
    A.every([3, 8], () => A.bird('chirp')); A.every([5, 12], () => A.bird('bulbul'));
    return {};
  }
  /* --- sound panel: mute, effects volume, surroundings volume (remembered) --- */
  function applyAudio() {
    if (sfxBus) sfxBus.set(aset.sfx); if (ambBus) ambBus.set(aset.amb);
    muted = aset.muted; if (master) fadeMaster(muted ? 0 : 1, 0.3);
    $('wave').style.opacity = muted ? 0.15 : 1; $('sndMute').textContent = muted ? 'Sound off' : 'Sound on'; $('sndMute').classList.toggle('off', muted);
    $('sndSfx').value = aset.sfx * 100; $('sndAmb').value = aset.amb * 100;
  }
  $('mute').onclick = (e) => { e.stopPropagation(); ensureAudio(); $('sndPanel').classList.toggle('open'); };
  $('sndMute').onclick = (e) => { e.stopPropagation(); ensureAudio(); aset.muted = !aset.muted; saveAudio(); applyAudio(); };
  $('sndSfx').oninput = (e) => { aset.sfx = e.target.value / 100; saveAudio(); applyAudio(); };
  $('sndSfx').onchange = () => SFX.pickup();
  $('sndAmb').oninput = (e) => { aset.amb = e.target.value / 100; saveAudio(); applyAudio(); };
  $('sndPanel').addEventListener('pointerdown', (e) => e.stopPropagation());
  $('panelBtn').onclick = (e) => { e.stopPropagation(); document.body.classList.toggle('panelopen'); };
  addEventListener('pointerdown', (e) => { if (document.body.classList.contains('panelopen') && e.target.id !== 'panelBtn' && !e.target.closest('#panelBtn')) document.body.classList.remove('panelopen'); });
  addEventListener('pointerdown', () => $('sndPanel').classList.remove('open'));
  applyAudio();

  /* ---------- loop ---------- */
  let shake = 0, camSettled = false, dragging = false;
  const clock = new THREE.Clock();
  const tmpQ = new THREE.Quaternion();
  setTimeout(() => document.body.classList.add('ready'), 4000);
  // keeps the picture sharp where the device can afford it, and steps the resolution down (never up) where frames run slow
  let fpsN = 0, fpsAcc = 0, fpsLast = performance.now();
  function watchFrameRate() { const now = performance.now(), ms = now - fpsLast; fpsLast = now; if (document.hidden || ms > 250 || replaying) { fpsN = 0; fpsAcc = 0; return; }
    fpsAcc += ms; if (++fpsN < 75) return; const avg = fpsAcc / fpsN; fpsN = 0; fpsAcc = 0;
    if (avg > 27 && pixelRatio > 1) { pixelRatio = Math.max(1, pixelRatio - 0.25); renderer.setPixelRatio(pixelRatio); renderer.setSize(innerWidth, innerHeight); } }
  function tick() {
    watchFrameRate();
    const dt = Math.min(clock.getDelta(), 0.05) * timeScale.k, t = clock.elapsedTime;
    const walking = updateWalk(dt);
    if (!walking) girl.position.copy(nodePos(S.player));
    const gb = girl.userData; const face = gb.face ?? Math.PI / 4;
    let dr = face - girl.rotation.y; while (dr > Math.PI) dr -= Math.PI * 2; while (dr < -Math.PI) dr += Math.PI * 2;
    girl.rotation.y += dr * (1 - Math.exp(-dt * 9));
    if (hero.rig) {
      let clip, ct;
      if (hero.action) {
        const A = hero.action; A.t += dt * A.speed; clip = A.name; ct = Math.min(A.t, CLIPS[A.name]);
        if (!A.fired && A.t >= A.contact) { A.fired = true; A.onContact && A.onContact(); }
        if (A.t >= CLIPS[A.name]) { hero.action = null; A.done && A.done(); }
      } else if (walking === true) {
        const ph0 = hero.walkPhase; hero.walkPhase += dt * 2.1 / (WALK_SPEED * CLIPS.walk * HERO_SCALE * 1.6); clip = 'walk';
        if (AC && Math.floor(ph0 * 2) !== Math.floor(hero.walkPhase * 2)) step(V.surfaceAt ? V.surfaceAt(girl.position, walker.cur) : (meta.surface || 'stone')); ct = (hero.walkPhase % 1) * CLIPS.walk;
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
    V.tick && V.tick(dt, t); tickLife(dt, t);
    if (ambCtl && ambCtl.update) ambCtl.update(dt, t);
    { const hp = !!document.querySelector('#panel.on'); if (hp !== document.body.classList.contains('haspanel')) { document.body.classList.toggle('haspanel', hp); if (!hp) document.body.classList.remove('panelopen'); } }
    for (let i = bubbles.length - 1; i >= 0; i--) { const b = bubbles[i]; b.t += dt; const p = b.target.getWorldPosition(new THREE.Vector3()); b.sp.position.copy(p).add(new THREE.Vector3(0, b.offset + Math.sin(t * 3) * 0.04, 0));
      const k = Math.min(1, b.t / 0.2, (b.dur - b.t) / 0.3); b.sp.scale.set(1.1 * k, 1.2 * k, 1); if (b.t >= b.dur) { scene.remove(b.sp); bubbles.splice(i, 1); } }
    for (let i = anims.length - 1; i >= 0; i--) { const a = anims[i]; a.t = Math.min(1, a.t + dt / a.dur); a.f(a.lin ? a.t : ease(a.t)); if (a.t >= 1) { anims.splice(i, 1); a.done && a.done(); } }
    for (let i = ripples.length - 1; i >= 0; i--) { const r = ripples[i]; r.t += dt; r.m.scale.setScalar(1 + r.t * 5); r.m.material.opacity = 0.9 * (1 - r.t / 0.6); if (r.t > 0.6) { scene.remove(r.m); ripples.splice(i, 1); } }
    // camera framing: the level says which area she is in and how tight to frame it
    { const f = V.focus(); const pz = innerWidth / innerHeight < 0.8 ? (f.pz ?? meta.pz ?? 1) : 1;
      if (!camSettled) { camTarget.copy(f.target); areaZoom = f.zoom * pz; camSettled = true; }
      dampVec(camTarget, f.target, 0.62, dt); areaZoom = damp(areaZoom, f.zoom * pz, 'area', 0.62, dt); }
    placeSun(); haze.color.value.copy(scene.fog.color);
    cam.az = damp(cam.az, cam.azTo + cam.azDrag, 'az', dragging ? 0.07 : 0.26, dt); cam.zoom = damp(cam.zoom, cam.zoomTo, 'zoom', 0.14, dt);
    if (!dragging && Math.abs(cam.az - cam.azTo) < 0.002 && Math.abs(camVel.az) < 0.01) { cam.az = cam.azTo; camVel.az = 0; }
    camera.zoom = cam.zoom * areaZoom; camera.updateProjectionMatrix(); placeCamera();
    V.afterCamera && V.afterCamera(dt, t);
    if (shake > 0) { shake -= dt; camera.position.x += (Math.random() - 0.5) * 0.15; camera.position.y += (Math.random() - 0.5) * 0.15; }
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  /* ---------- dressing: small details scattered on open ground, and a little life in the air ----------
     Purely decorative. Nothing here can be tapped (taps only ever look at tagged objects), and nothing is placed near a path,
     a person or a puzzle object, on water, under a roof, or on top of anything that isn't plain walkable ground. */
  const life = { flies: [], birds: [], nextFlock: 25 };
  function dress() {
    const KIT = { '0': { flowers: [0xffffff, 0xf6d24a], sand: 'none', n: 0.6 }, I: { flowers: [0xffffff, 0xf3a9c0, 0xf6e7a8], sand: 'petals' }, II: { flowers: [0xb48be0, 0xffffff, 0xf07aa6], sand: 'shells' },
      III: { flowers: [0xf2c53d, 0xe9893a], tuft: 0xc2ad62, sand: 'dry' }, IV: { flowers: [0xe0523f, 0xb48be0, 0xffffff, 0xf6d24a], n: 1.3 }, V: { flowers: [0xf3a9c0, 0xffffff, 0xf6d24a], sand: 'petals' } }[meta.chapter] || { flowers: [0xffffff, 0xf6d24a] };
    let seed = 20261112; const rand = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let r = Math.imul(seed ^ (seed >>> 15), 1 | seed); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
    scene.updateMatrixWorld(true);
    // everything solid that could sit above a spot (so nothing is planted under a roof, a tree or a prop)
    const solid = []; scene.traverse((o) => { if (!o.isMesh || !o.geometry || o.isSkinnedMesh) return; if (o.material && o.material.visible === false) return; for (let q = o; q; q = q.parent) if (q === girl || !q.visible) return; solid.push(o); });
    const grounds = pickables.filter((m) => m.userData.surface !== undefined && m.userData.item === undefined && m.userData.hidden === undefined && m.userData.handle === undefined && isVisible(m) && m.material && m.material.visible !== false && !m.material.transparent && (m.material.roughness ?? 1) >= 0.6 && m.material.color);
    const hsl = {}; const kind = (m) => { m.material.color.getHSL(hsl); const h = hsl.h * 360; if (h >= 58 && h <= 150 && hsl.s >= 0.14 && hsl.l > 0.22 && hsl.l < 0.72) return 'grass'; if (h >= 18 && h < 58 && hsl.s >= 0.18 && hsl.l >= 0.5 && hsl.l < 0.86) return 'sand'; return null; };
    // keep-outs: every stop she can stand on, every stretch between neighbouring stops, every person and puzzle object
    const stops = [], legs = [], boxes = [];
    try { const adj = logic.adjacency(S), ids = new Set([...Object.keys(logic.NODES || {}), ...Object.keys(logic.GN || {}), ...adj.keys()]); const at = {};
      for (const id of ids) { let p = null; try { p = V.nodePos(id); } catch (err) {} if (p) { at[id] = p; stops.push(p); } }
      for (const id of Object.keys(at)) for (const e of adj.get(id) || []) if (at[e.to]) legs.push([at[id], at[e.to]]);
      // routes that only open later aren't in today's list of paths, so any two stops close together are treated as joined
      for (let i = 0; i < stops.length; i++) for (let j = i + 1; j < stops.length; j++) if (stops[i].distanceTo(stops[j]) < 3.4) legs.push([stops[i], stops[j]]); } catch (err) {}
    for (const m of pickables) if (m.userData.surface === undefined) boxes.push(new THREE.Box3().setFromObject(m).expandByScalar(0.55));
    const seg = (p, a, b) => { const abx = b.x - a.x, abz = b.z - a.z, l2 = abx * abx + abz * abz || 1; const k = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.z - a.z) * abz) / l2)); return Math.hypot(p.x - a.x - abx * k, p.z - a.z - abz * k); };
    const clear = (p) => { for (const s of stops) if (Math.hypot(p.x - s.x, p.z - s.z) < 1.0 && Math.abs(p.y - s.y) < 2.5) return false; for (const [a, b] of legs) if (Math.abs(p.y - (a.y + b.y) / 2) < 3 && seg(p, a, b) < 0.8) return false;
      for (const bx of boxes) if (p.x > bx.min.x && p.x < bx.max.x && p.z > bx.min.z && p.z < bx.max.z && p.y > bx.min.y - 1.5 && p.y < bx.max.y + 0.5) return false; return true; };
    const jobs = []; for (const g of grounds) { const k = kind(g); if (!k || (k === 'sand' && KIT.sand === 'none')) continue; const bb = new THREE.Box3().setFromObject(g), area = (bb.max.x - bb.min.x) * (bb.max.z - bb.min.z); if (area < 3) continue;
      jobs.push({ g, k, bb, n: Math.min(230, Math.round(area * 0.9 * (KIT.n || 1))), inv: g.matrixWorld.clone().invert(), put: { patch: [], bush: [], tuft: [], stem: [], head: [], pebble: [], shell: [], petal: [] } }); }
    const down = new THREE.Vector3(0, -1, 0), rc = new THREE.Raycaster(), from = new THREE.Vector3(), nrm = new THREE.Vector3(), M = new THREE.Matrix4(), Q = new THREE.Quaternion(), EU = new THREE.Euler(), SC = new THREE.Vector3(), P = new THREE.Vector3(), col = new THREE.Color();
    const add = (job, type, x, y, z, ry, sx, sy, color, rx = 0) => { M.compose(P.set(x, y, z), Q.setFromEuler(EU.set(rx, ry, 0)), SC.set(sx, sy, sx)); job.put[type].push({ m: job.inv.clone().multiply(M), c: color }); };
    const tint = (hex, j = 0.06) => col.setHex(hex).offsetHSL((rand() - 0.5) * 0.03, 0, (rand() - 0.5) * j).getHex();
    const spots = []; let budget = 0; for (const j of jobs) budget += j.n; const scale = budget > 900 ? 900 / budget : 1; let ji = 0, left = jobs.length ? Math.round(jobs[0].n * scale) : 0;
    let bushes = 0, patches = 0;
    const roomy = (p, m) => { for (const s of stops) if (Math.hypot(p.x - s.x, p.z - s.z) < m && Math.abs(p.y - s.y) < 2.5) return false;
      for (const [a, b] of legs) if (Math.abs(p.y - (a.y + b.y) / 2) < 3 && seg(p, a, b) < m) return false;
      for (const bx of boxes) if (p.x > bx.min.x - m && p.x < bx.max.x + m && p.z > bx.min.z - m && p.z < bx.max.z + m && p.y > bx.min.y - 1.5 && p.y < bx.max.y + 0.5) return false; return true; };
    const onGround = (job, x, z, y) => { from.set(x, y + 6, z); rc.set(from, down); const h = rc.intersectObjects(solid, false)[0]; return !!h && h.object === job.g && Math.abs(h.point.y - y) < 0.35; };
    function plant(job, p) { const gc = job.g.material.color.getHex(), r = rand();
      // a soft patch of other-coloured ground: flat, so it can never get in the way, and it reads from right across the island
      if (patches < 26 && r < 0.17 && roomy(p, 0.5)) { const rad = 0.7 + rand() * 1.0;
        let fits = true; for (let a = 0; a < 4 && fits; a++) fits = onGround(job, p.x + Math.cos(a * 1.57) * rad, p.z + Math.sin(a * 1.57) * rad, p.y);
        if (fits) { patches++; add(job, 'patch', p.x, p.y + 0.014, p.z, rand() * 3, rad, 1, col.setHex(gc).offsetHSL((rand() - 0.5) * 0.04, 0.03, (rand() - 0.5) * 0.085).getHex()); return; } }
      // a low shrub, only well away from every stop, path and prop
      if (job.k === 'grass' && bushes < 14 && r < 0.3 && roomy(p, 2.1)) { bushes++; const base = col.setHex(gc).offsetHSL(0.015, 0.1, -0.12).getHex(), n = 2 + ((rand() * 2) | 0);
        for (let i = 0; i < n; i++) { const a = rand() * 6.28, d = rand() * 0.3; add(job, 'bush', p.x + Math.cos(a) * d, p.y + 0.1 + rand() * 0.06, p.z + Math.sin(a) * d, rand() * 3, 0.5 + rand() * 0.5, 0.62 + rand() * 0.3, tint(base, 0.07)); }
        return; }
      if (job.k === 'grass') {
        if (r < 0.3) { const hue = KIT.flowers[(rand() * KIT.flowers.length) | 0], n = 2 + ((rand() * 3) | 0); for (let i = 0; i < n; i++) { const a = rand() * 6.28, d = rand() * 0.22, h = 0.75 + rand() * 0.6; add(job, 'stem', p.x + Math.cos(a) * d, p.y, p.z + Math.sin(a) * d, 0, 1, h, 0x5c8a45); add(job, 'head', p.x + Math.cos(a) * d, p.y + 0.17 * h, p.z + Math.sin(a) * d, rand() * 3, 0.8 + rand() * 0.5, 0.8 + rand() * 0.4, tint(hue, 0.04)); } spots.push(p.clone()); }
        else if (r < 0.88) { const base = KIT.tuft ?? col.setHex(gc).offsetHSL(0, 0.04, -0.07).getHex(); for (let i = 0; i < 3; i++) add(job, 'tuft', p.x + (rand() - 0.5) * 0.16, p.y, p.z + (rand() - 0.5) * 0.16, rand() * 3, 0.8 + rand() * 0.5, 0.6 + rand() * 0.9, tint(base, 0.08), (rand() - 0.5) * 0.3); }
        else add(job, 'pebble', p.x, p.y, p.z, rand() * 3, 0.6 + rand() * 0.9, 0.5 + rand() * 0.4, tint(0xb9b0a4, 0.1));
      } else if (KIT.sand === 'petals') { const hue = KIT.flowers[(rand() * KIT.flowers.length) | 0]; for (let i = 0; i < 3; i++) add(job, 'petal', p.x + (rand() - 0.5) * 0.5, p.y + 0.012, p.z + (rand() - 0.5) * 0.5, rand() * 6, 0.7 + rand() * 0.6, 1, tint(hue, 0.03)); }
      else if (KIT.sand === 'shells') { if (r < 0.45) add(job, 'shell', p.x, p.y, p.z, rand() * 6, 0.7 + rand() * 0.6, 0.7 + rand() * 0.5, tint([0xf6e3d2, 0xf2c4c0, 0xffffff][(rand() * 3) | 0], 0.04), 1.2); else add(job, 'pebble', p.x, p.y, p.z, rand() * 3, 0.5 + rand() * 0.7, 0.45, tint(0xd8c9b4, 0.08)); }
      else if (KIT.sand === 'dry') { if (r < 0.6) for (let i = 0; i < 3; i++) add(job, 'tuft', p.x + (rand() - 0.5) * 0.16, p.y, p.z + (rand() - 0.5) * 0.16, rand() * 3, 0.8 + rand() * 0.4, 0.7 + rand() * 0.9, tint(KIT.tuft, 0.1), (rand() - 0.5) * 0.3); else add(job, 'pebble', p.x, p.y, p.z, rand() * 3, 0.6 + rand() * 0.9, 0.5, tint(0xb5a48c, 0.1)); }
      else add(job, 'pebble', p.x, p.y, p.z, rand() * 3, 0.5 + rand() * 0.8, 0.45, tint(0xc9bba6, 0.08)); }
    function finish() {
      const GEO = { tuft: new THREE.ConeGeometry(0.055, 0.34, 4).translate(0, 0.17, 0), stem: new THREE.CylinderGeometry(0.013, 0.017, 0.2, 4).translate(0, 0.1, 0), head: new THREE.IcosahedronGeometry(0.07, 0), pebble: new THREE.DodecahedronGeometry(0.115, 0).translate(0, 0.035, 0), shell: new THREE.ConeGeometry(0.07, 0.12, 5).translate(0, 0.035, 0), petal: new THREE.CircleGeometry(0.065, 5).rotateX(-Math.PI / 2), patch: new THREE.CircleGeometry(1, 11).rotateX(-Math.PI / 2), bush: new THREE.IcosahedronGeometry(0.4, 0) };
      const white = mat(0xffffff);
      for (const job of jobs) for (const [type, list] of Object.entries(job.put)) { if (!list.length) continue; const im = new THREE.InstancedMesh(GEO[type], white, list.length); im.castShadow = false; im.receiveShadow = true; im.frustumCulled = false; im.userData.decor = true;
        list.forEach((it, i) => { im.setMatrixAt(i, it.m); im.setColorAt(i, col.setHex(it.c)); }); im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; job.g.add(im); }
      // butterflies over a few of the flower patches
      for (let i = 0; i < Math.min(7, spots.length); i++) { const home = spots[Math.floor(i * spots.length / Math.min(7, spots.length))]; const g = new THREE.Group(), c = KIT.flowers[i % KIT.flowers.length] === 0xffffff ? 0xfff2c4 : KIT.flowers[i % KIT.flowers.length];
        const wm = new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }); const wg = new THREE.PlaneGeometry(0.1, 0.08).translate(0.05, 0, 0);
        const L = new THREE.Mesh(wg, wm), R = new THREE.Mesh(wg, wm); R.scale.x = -1; L.rotation.x = R.rotation.x = -Math.PI / 2; const wl = new THREE.Group(), wr = new THREE.Group(); wl.add(L); wr.add(R); g.add(wl, wr); g.userData = { home, ph: rand() * 10, wl, wr, sp: 0.5 + rand() * 0.4 }; scene.add(g); life.flies.push(g); }
    }
    function step() { let rays = 0;
      while (ji < jobs.length && rays < 70) { const job = jobs[ji]; if (left-- <= 0) { ji++; left = ji < jobs.length ? Math.round(jobs[ji].n * scale) : 0; continue; } rays++;
        from.set(job.bb.min.x + rand() * (job.bb.max.x - job.bb.min.x), job.bb.max.y + 40, job.bb.min.z + rand() * (job.bb.max.z - job.bb.min.z)); rc.set(from, down); const hit = rc.intersectObjects(solid, false)[0];
        if (!hit || hit.object !== job.g || !hit.face) continue; nrm.copy(hit.face.normal).transformDirection(job.g.matrixWorld); if (nrm.y < 0.97) continue; if (!clear(hit.point)) continue; plant(job, hit.point); }
      if (ji < jobs.length) setTimeout(step, 30); else finish(); }
    if (jobs.length) setTimeout(step, 400);
  }
  const birdGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0.5, 0, -0.12, 0.42, 0, 0.1], 3));
  function flock() { const n = 3 + ((Math.random() * 3) | 0), dir = Math.random() < 0.5 ? 1 : -1, az = cam.az + Math.PI / 2, dx = Math.sin(az) * dir, dz = Math.cos(az) * dir, bm = new THREE.MeshBasicMaterial({ color: 0x5a4a44, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const back = new THREE.Vector3(-Math.sin(cam.az), 0, -Math.cos(cam.az)), y = camTarget.y + 9 + Math.random() * 4, off = 6 + Math.random() * 8;
    for (let i = 0; i < n; i++) { const g = new THREE.Group(), a = new THREE.Mesh(birdGeo, bm), b = new THREE.Mesh(birdGeo, bm); b.scale.x = -1; const wa = new THREE.Group(), wb = new THREE.Group(); wa.add(a); wb.add(b); g.add(wa, wb); g.scale.setScalar(0.55);
      const lag = Math.ceil(i / 2) * 0.9, side = (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 0.7; g.position.copy(camTarget).addScaledVector(back, off + side).add(new THREE.Vector3(-dx * (34 + lag), 0, -dz * (34 + lag))); g.position.y = y + (i % 2) * 0.3; g.rotation.y = Math.atan2(dx, dz) - Math.PI / 2;
      g.userData = { dx, dz, wa, wb, ph: Math.random() * 6, life: 0 }; scene.add(g); life.birds.push(g); } }
  function tickLife(dt, t) {
    for (const g of life.flies) { const u = g.userData, a = t * u.sp + u.ph; g.position.set(u.home.x + Math.sin(a) * 0.55 + Math.sin(a * 2.3) * 0.2, u.home.y + 0.42 + Math.sin(a * 1.7) * 0.16, u.home.z + Math.cos(a * 0.8) * 0.5); g.rotation.y = a * 0.8; const f = Math.sin(t * 16 + u.ph) * 0.9; u.wl.rotation.z = f; u.wr.rotation.z = -f; }
    if (started && (life.nextFlock -= dt) < 0) { life.nextFlock = 50 + Math.random() * 50; if (!document.hidden) flock(); }
    for (let i = life.birds.length - 1; i >= 0; i--) { const g = life.birds[i], u = g.userData; u.life += dt; g.position.x += u.dx * dt * 3.2; g.position.z += u.dz * dt * 3.2; const f = Math.sin(t * 7 + u.ph) * 0.55; u.wa.rotation.z = f; u.wb.rotation.z = -f; if (u.life > 24) { scene.remove(g); life.birds.splice(i, 1); } }
  }

  try { dress(); } catch (err) { console.warn('dressing skipped', err); }
  refreshHUD(); tick();

  window.__game = { S, V, E, logic, timeScale, camera, cam, camTarget, THREE, girl, hero, walkTo: startWalk, interactAt, findPath: logic.findPath, hint,
    pick: (x, y) => pickAt(x, y).slice(0, 4).map((h) => JSON.stringify(h.object.userData)), tapHidden: (k) => { rec({ h: k }); return V.tapHidden(k, pickables.find((m) => m.userData.hidden === k)); }, resuming: () => replaying || !!document.getElementById("resumeVeil"),
    isBusy: () => !!(walker.cur || anims.length || hero.action || (V.busy && V.busy())) };
}
