// الطائر وحافظ القرآن — طيران مستقيم تلقائي؛ عند كل مسافة محطة آية: استمع وتعلّم (+ سؤال «ساعد الطائر» قبل الآية).
import { Renderer } from '../engine/gl.js';
import { Physics } from '../engine/physics.js';
import { FollowCam } from '../engine/camera.js';
import { Input } from '../engine/input.js';
import { Sfx } from '../engine/audio.js';
import { mul, mT, mRY, mRZ, mS, clamp } from '../engine/math.js';
import { loadQuran, surah } from '../data/quran.js';
import { Progress, JUZ } from './progress.js';
import { QAudio, speak, PRAISE } from './qaudio.js';
import { createBird } from './bird.js';
import * as World from './world.js';
import { runStage, h } from './stages.js';
import { teacherPanel } from './teacher.js';

const $ = id => document.getElementById(id), wait = ms => new Promise(r => setTimeout(r, ms));
const G = window.__game = { sfx: new Sfx(), qual: 1, paused: true, stageOpen: false, up: false, down: false, mode: 'fly', t: 0, flapT: 0, tweetT: 3 };
function toast(t, ms = 2400) { const e = $('toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), ms); }
function fatal(m, d) { $('loading').classList.add('off'); const e = $('err'); e.classList.add('on'); e.replaceChildren(h('div', { class: 'kcard' }, h('h2', {}, 'تعذّر تشغيل اللعبة'), h('p', {}, m), d ? h('pre', {}, String(d).slice(0, 300)) : null, h('button', { class: 'kbtn', onclick: () => location.reload() }, 'إعادة المحاولة'))); }
addEventListener('error', e => { if (!G.running) fatal('حدث خطأ غير متوقع.', e.message); });
const setLoad = (p, t) => { $('lbar').style.width = p + '%'; $('ltxt').textContent = t; };

async function boot() {
  try {
    setLoad(8, 'تجهيز عالم الطائر…'); try { G.r = new Renderer($('c')); } catch (e) { return fatal(e.message === 'NO_WEBGL2' ? 'جهازك أو متصفحك لا يدعم WebGL2 المطلوب للّعبة. جرّب Chrome حديثًا.' : 'فشل تهيئة الرسوميات', e.message); }
    G.r.onLost = () => fatal('فُقد سياق الرسوميات. أعد التحميل.'); await wait(30);
    setLoad(25, 'التحقق من النص القرآني (ورش)…'); await loadQuran(); G.P = new Progress(); G.qa = new QAudio(G.P); G.qa.err = () => toast('تعذّر تشغيل التلاوة — تأكد من وجود مجلد audio بجانب الملف');
    G.bird = createBird(G.r); G.mark = G.r.mark(); G.ph = new Physics(); G.cam = new FollowCam(G.ph);
    setLoad(45, 'بناء الغابة والجزر العائمة…'); await wait(40); buildWorld(true);
    G.inp = new Input($('c')); G.inp.onMenu = () => toggleTeacher(); G.inp.onJoy = (j, on) => { const b = $('joy'); b.classList.toggle('on', on); if (on) { b.style.left = j.ox - 60 + 'px'; b.style.top = j.oy - 60 + 'px'; $('knob').style.transform = `translate(${j.x * 42}px,${j.y * 42}px)`; } };
    G.sfx.vol = G.P.d.set.vol; G.sfx.on = G.P.d.set.sfx; wire(); setupTeacher(); setLoad(100, 'جاهز!'); await wait(250); $('loading').classList.add('off'); $('title').classList.add('on'); fillTitle(); G.running = true; requestAnimationFrame(loop);
  } catch (e) { fatal('تعذّر تحميل اللعبة.', e.stack || e.message); }
}
function buildWorld(first) {
  if (!first) G.r.disposeFrom(G.mark); const P = G.P, N = P.segs().length; G.W = World.build(G.r, G.ph, N); G.ph.terrain = G.W.H; P.fix(); placeAtStation(P.d.seg, true); hud();
}
function placeAtStation(k, snap) { const st = G.W.stations[Math.min(Math.max(0, k), G.W.stations.length - 1)], b = G.bird; Object.assign(b, { x: 0, y: World.Y0, z: k <= 0 ? G.W.spawn[2] : st.z - 34, vx: 0, vy: 0, vz: 0 }); G.mode = 'fly'; if (snap) G.snap = 0; }
function fillTitle() {
  const P = G.P, nm = h('input', { value: P.d.name, placeholder: 'اسم البطل/البطلة (اختياري)', maxlength: 20 }), sel = h('select', {}); for (let n = JUZ[1]; n >= JUZ[0]; n--) sel.append(h('option', { value: n }, `سورة ${surah(n).name}${G.qa.has(n) ? ' 🔊' : ' (بلا تلاوة)'}`)); sel.value = P.d.sel.s;
  $('title').replaceChildren(h('div', { class: 'kcard ttl' }, h('div', { class: 'bigbird' }, '🐦'), h('h1', {}, 'الطائر وحافظ القرآن'), h('p', {}, 'طِر مع الطائر، وفي كل محطة تتعلّم آية جديدة!'), nm, h('label', { style: 'display:block;margin:8px 0 2px;font-weight:700' }, 'اختر السورة'), sel,
    h('button', { class: 'kbtn big', onclick: () => { P.d.name = nm.value; if (+sel.value !== P.d.sel.s || P.d.sel.to - P.d.sel.from + 1 !== surah(+sel.value).ayat.length && +sel.value !== P.d.sel.s) { P.setSel(+sel.value, 1, surah(+sel.value).ayat.length); } P.save(); G.sfx.init(); G.sfx.ambience('sky'); buildWorld(); $('title').classList.remove('on'); $('hud').classList.add('on'); G.paused = false; toast('استخدم الأسهم ← → ↑ ↓ لتوجيه الطائر وجمع النجوم ⭐', 5000); } }, '▶ هيّا نطير!'),
    h('button', { class: 'kbtn alt', onclick: () => toggleTeacher(true) }, '👩‍🏫 وضع المعلمة'), h('p', { class: 'hint' }, 'النص القرآني برواية ورش عن نافع — التلاوة: القارئ ياسين الجزائري (للسور 95–114)')));
}
function setupTeacher() { G.tctx = { P: G.P, qa: G.qa, sfx: G.sfx, root: $('teacher'), toast, teacherOn: false, rebuild: () => buildWorld(), launch: i => launch(i), toggleTeacher: on => toggleTeacher(on), gotoStation: k => { G.P.go(k); placeAtStation(G.P.d.seg); hud(); } }; G.tp = teacherPanel(G.tctx); }
function toggleTeacher(on) { const t = $('teacher'); on = on === undefined ? !t.classList.contains('on') : on; t.classList.toggle('on', on); document.body.classList.toggle('tmode', on); G.tctx.teacherOn = on; if (on) { G.tp.draw(); if ($('title').classList.contains('on')) { $('title').classList.remove('on'); $('hud').classList.add('on'); G.paused = false; G.sfx.init(); } } }
const sctx = () => ({ P: G.P, qa: G.qa, root: $('ov'), sfx: G.sfx, toast, onStars: n => { G.P.addStars(n); G.bird.sparkle = 1; G.sfx.play('crystal'); hud(); }, onDone: (st, sc) => { G.bird.sparkle = 1.5; } });
async function launch(i, opts) { if (G.stageOpen) return; G.stageOpen = true; G.sfx.stopAmb(); await runStage(sctx(), i, opts); G.stageOpen = false; if (G.P.d.set.sfx) G.sfx.ambience('sky'); hud(); G.tp && G.tctx.teacherOn && G.tp.draw(); }
async function atStation(k) {
  G.mode = 'station'; const P = G.P, s = P.d.sel.s, a = P.d.sel.from + k, N = G.W.N; G.sfx.play('door'); G.bird.sparkle = 1; await wait(500);
  if (k > 0 && !P.d.set.noQ) await launch(2, { seg: { s, a: a - 1 }, fixed: true, N: 1 });
  await launch(1, { seg: { s, a } }); P.addStars(2); P.go(k + 1 < N ? k + 1 : N - 1); hud();
  if (k + 1 >= N) { G.mode = 'end'; if (!P.d.set.noQ) await launch(3, { random: true, N: 3 }); await finish(); } else G.mode = 'fly';
}
function finish() { return new Promise(res => { const o = $('ov'); o.classList.add('on'); G.sfx.play('crystal'); speak('ما شاء الله! أحسنت يا بطل', G.P.d.set.voice); o.replaceChildren(h('div', { class: 'kcard' }, h('div', { class: 'bigbird' }, '🏆'), h('h1', {}, 'أحسنت يا بطل!'), h('p', {}, `أتممتَ سورة ${surah(G.P.d.sel.s).name} ⭐ ${G.P.d.stars}`), h('button', { class: 'kbtn big', onclick: () => { o.classList.remove('on'); o.replaceChildren(); G.P.go(0); placeAtStation(0); G.mode = 'fly'; hud(); res(); } }, '🔁 طيران جديد'))); }); }
function hud() { const P = G.P, N = P.segs().length; $('hs').textContent = P.d.stars; $('hg').textContent = P.d.gems; $('hc').textContent = Object.keys(P.d.chests).length; $('seg').textContent = `سورة ${surah(P.d.sel.s).name}`; const pr = $('prog'); pr.replaceChildren(...P.segs().map((g, i) => h('i', { class: i < P.d.seg ? 'done' : i === P.d.seg ? 'cur' : '' }, P.d.sel.from + i))); }
function wire() {
  const hold = (id, k) => { const e = $(id); e.addEventListener('pointerdown', ev => { G[k] = true; ev.preventDefault(); }); for (const t of ['pointerup', 'pointerleave', 'pointercancel']) e.addEventListener(t, () => G[k] = false); }; hold('bUp', 'up'); hold('bDown', 'down');
  let tm; const tb = $('bTeach'); tb.addEventListener('pointerdown', () => { tm = setTimeout(() => toggleTeacher(true), 900); }); tb.addEventListener('pointerup', () => clearTimeout(tm)); tb.addEventListener('pointerleave', () => clearTimeout(tm));
  addEventListener('keydown', e => { if (e.target.closest && e.target.closest('input,textarea,select')) return; if (G.tctx.teacherOn && '123'.includes(e.key) && e.key) launch(+e.key); if (e.code === 'KeyT') toggleTeacher(); });
  addEventListener('touchstart', () => document.body.classList.add('touch'), { once: true, passive: true }); if (matchMedia('(pointer:coarse)').matches) document.body.classList.add('touch'); addEventListener('resize', () => G.r.resize(G.qual)); document.addEventListener('pointerdown', () => G.sfx.init(), { once: true });
}
let last = performance.now(), fa = 0, fn = 0;
function loop(now) {
  requestAnimationFrame(loop); const dt = Math.min(.05, (now - last) / 1000); last = now; const r = G.r, b = G.bird; if (r.lost) return; r.resize(G.qual);
  fa += dt; fn++; if (fa > 3) { G.fps = fn / fa; if (G.fps < 28 && G.qual > .55) G.qual -= .15; fa = 0; fn = 0; }
  const W = G.W, I = G.inp, P = G.P, running = !G.paused;
  if (running) {
    const o = I.poll(0), k = I.keys, st = W.stations[P.d.seg], ahead = G.mode === 'fly' && st ? st.z - b.z : 99;
    const fwd = G.mode === 'fly' ? 9 : 0, pull = G.mode !== 'fly' ? 1.4 : (ahead < 24 && ahead > -5 ? .9 : .12);
    if (!G.stageOpen) b.updateRail(dt, o.mx, G.up || k.ArrowUp || k.KeyW || k.Space, G.down || k.ArrowDown || k.KeyS || k.KeyC, fwd, pull, W.H, World.Y0);
    if (G.mode === 'fly' && st && b.z >= st.z - 1) atStation(P.d.seg);
    for (const it of W.items) { if (it.taken && it.k !== 'chest') continue; const d = Math.hypot(it.x - b.x, it.y - b.y, it.z - b.z);
      if (it.k === 'chest') { if (!it.open && d < 6) { it.open = 1; P.d.chests[it.n] = 1; P.addGems(5); P.addStars(5); G.sfx.play('crystal'); b.sparkle = 1.5; toast('📦 فتحتَ صندوقًا! +5 جواهر و+5 نجوم'); hud(); } continue; }
      if (d < 2.3) { it.taken = true; if (it.k === 'star') P.addStars(1); else P.addGems(1); b.sparkle = .5; G.sfx.play('pick'); hud(); } }
    // أصوات الطيران: خفقان الأجنحة وزقزقة
    if (!G.stageOpen) { G.flapT -= dt; if (G.flapT <= 0) { G.sfx.play('flap'); G.flapT = G.mode === 'fly' ? .34 : .5; } G.tweetT -= dt; if (G.tweetT <= 0) { G.sfx.play('tweet'); G.tweetT = 3 + Math.random() * 4; } }
    if (st) { $('dist').textContent = G.mode === 'fly' ? `الآية ${P.d.sel.from + P.d.seg} بعد ${Math.max(0, Math.round(ahead))} م` : ''; }
    if (b.sparkle > 0) b.sparkle -= dt; G.t += dt;
  }
  G.cam.yaw = 0; G.cam.pitch = .3; G.cam.dist = 10; const gh = W.H(b.x, b.z); G.cam.update(dt, { x: b.x * .6, y: b.y - 1.2, z: b.z }, G.snap === 0 && (G.snap = 1, true));
  r.beginFrame(dt); r.setCamera(G.cam.pos, G.cam.tgt); r.drawSky(); r.lights = W.lights.concat([{ x: b.x, y: b.y + 1, z: b.z, r: 8, c: [1, .95, .8], i: .5 }]);
  r.drawLit(W.lit, G.cam.tgt); const t = r.time, M = W.mesh; b.draw(r);
  for (const it of W.items) { if (it.taken && it.k !== 'chest') continue; if (Math.abs(it.z - b.z) > 150) continue;
    if (it.k === 'chest') { r.drawModel(M.chest, mT(it.x, it.y, it.z)); r.drawModel(M.lid, mul(mT(it.x, it.y + .8, it.z - .45), mRX2(it.open ? -1.9 : 0), mT(0, 0, .45))); continue; }
    r.drawModel(it.k === 'star' ? M.star : (it.v === 2 ? M.gem2 : M.gem), mul(mT(it.x, it.y + Math.sin(t * 2 + it.x) * .25, it.z), mRY(t * 1.8 + it.x), mS(1.4, 1.4, 1.4))); }
  const fx = []; for (const s of W.stations) { if (Math.abs(s.z - b.z) > 160 || (b.z > s.z - 12 && b.z < s.z + 12)) continue; const ci = s.k % M.rings.length; r.drawModel(M.rings[ci], mul(mT(0, World.Y0, s.z), mRZ(t * .3))); fx.push(Object.assign(Object.create(M.glows[ci]), { model: mT(0, World.Y0, s.z) })); }
  r.drawWater(W.water, { a: [.1, .5, .85], b: [.55, .92, 1], alpha: .7 }); r.drawFx(W.fx); r.drawFx(fx, { pulse: 1 }); b.drawFx(r, Math.max(gh, -1.2)); r.drawParticles(W.parts, G.qual < .8 ? .8 : 1);
}
import { mRX } from '../engine/math.js'; const mRX2 = mRX;
boot();
