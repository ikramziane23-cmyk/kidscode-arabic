// المراحل الثلاث بواجهة للأطفال: (1) استمع وتعلّم (2) ساعد الطائر (3) اختبر حفظك. + وضع التسميع الشفهي للمعلمة.
import { Q, surah, words } from '../data/quran.js';
import { PRAISE, TRY, speak } from './qaudio.js';
export function h(tag, attrs = {}, ...kids) { const e = document.createElement(tag); for (const k in attrs) { if (attrs[k] == null || attrs[k] === false) continue; if (k === 'class') e.className = attrs[k]; else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); } for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c)); return e; }
export const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };
const T = (s, a) => surah(s).ayat[a - 1], W = (s, a) => surah(s).w[a - 1];
const rnd = (arr, n) => shuffle(arr).slice(0, n);
export const pieces = (s, a, n = 4) => { const w = W(s, a), o = []; let i = 0; while (i < w.length) { let j = Math.min(w.length, i + n); if (w.length - j === 1) j = w.length; o.push(w.slice(i, j).join(' ')); i = j; } return o; };
/** سؤال «ما الآية التالية؟» */
export function qNext(s, a) { const n = surah(s).ayat.length; let cur = a; if (cur >= n) cur = n - 1; if (cur < 1) return null; const others = []; for (let i = 1; i <= n; i++) if (i !== cur + 1 && i !== cur && T(s, i) !== T(s, cur + 1)) others.push(i); const o = shuffle([cur + 1, ...rnd(others, 2)]); return { kind: 'next', s, a: cur + 1, show: T(s, cur), showA: cur, opts: o.map(i => ({ t: T(s, i), a: i })), ans: o.indexOf(cur + 1), title: 'ساعد الطائر! ما الآية التي تأتي بعدها؟' }; }
/** سؤال «أكمل الآية» */
export function qFinish(s, a) { const w = W(s, a); if (w.length < 2) return qNext(s, a); const k = Math.max(1, Math.ceil(w.length / 2)), head = w.slice(0, k).join(' '), tail = w.slice(k).join(' '); const n = surah(s).ayat.length, pool = []; for (let i = 1; i <= n; i++) if (i !== a && W(s, i).length > 1) { const wi = W(s, i), kk = Math.max(1, Math.ceil(wi.length / 2)), tl = wi.slice(kk).join(' '); if (tl !== tail) pool.push(tl); } if (pool.length < 2) { for (const sx of Q.surahs.slice(77)) for (let i = 1; i <= sx.ayat.length && pool.length < 12; i++) { const wi = W(sx.n, i); if (wi.length > 1) { const tl = wi.slice(Math.ceil(wi.length / 2)).join(' '); if (tl !== tail) pool.push(tl); } } } const opts = shuffle([{ t: tail, ok: 1 }, ...rnd([...new Set(pool)], 2).map(t => ({ t }))]); return { kind: 'finish', s, a, head, show: head + ' …', full: T(s, a), opts, ans: opts.findIndex(o => o.ok), title: 'اختبر حفظك! أكمل الآية' }; }

export function runStage(ctx, stage, cfg = {}) {
  // ctx: {P, qa, root, sfx, onStars(n), teacher}
  const { P, qa, root } = ctx; const seg = cfg.seg || P.cur(); if (!seg) return Promise.resolve();
  return new Promise(resolve => {
    const hide = () => { qa.stop(); root.classList.remove('on'); root.replaceChildren(); ctx.onClose && ctx.onClose(); resolve(); };
    root.classList.add('on'); ctx.onOpen && ctx.onOpen();
    const box = h('div', { class: 'kcard' }); root.replaceChildren(box);
    const head = (title) => h('div', { class: 'khead' }, h('b', {}, title), h('span', {}, `سورة ${surah(seg.s).name} · آية ${seg.a}`), h('button', { class: 'x', onclick: hide }, '✕'));
    const listenBtn = (s, a, txt = '🔊 استمع') => h('button', { class: 'kbtn listen' + (qa.available(s) ? '' : ' off'), onclick: async () => { if (!qa.available(s)) return ctx.toast('لا توجد تلاوة لهذه السورة بعد — اقرأ أنت بصوتك 🌟'); const ok = await qa.play(s, a); if (!ok) ctx.toast('تعذّر تشغيل التلاوة'); } }, txt);
    if (stage === 1) {
      const ps = pieces(seg.s, seg.a), line = h('div', { class: 'ayah' }); let i = 0, done = false; const total = ps.length;
      const draw = () => { line.replaceChildren(...ps.map((p, k) => h('span', { class: 'pc' + (k < i ? ' on' : '') + (k === i - 1 ? ' cur' : '') }, p + ' '))); };
      const next = h('button', { class: 'kbtn big', onclick: () => { qa.stop(); if (i < total) { i++; draw(); ctx.sfx.play('ui'); if (i === total) { next.textContent = '▶ واصل الطيران'; } } else if (!done) { done = true; P.result(1, seg.s, seg.a, true); ctx.onStars(3); speak(PRAISE[0], P.d.set.voice); hide(); } } }, 'ابدأ ◀');
      const all = h('button', { class: 'kbtn alt', onclick: () => { i = total; draw(); next.textContent = '▶ واصل الطيران'; } }, 'اعرض الآية كاملة');
      box.append(head('١ · استمع وتعلّم'), h('p', { class: 'say' }, 'استمع ثم كرّر معي، جزءًا بعد جزء:'), line, h('div', { class: 'krow' }, listenBtn(seg.s, seg.a), listenBtn(seg.s, seg.a, '🔁 أعد'), all, next)); draw(); qa.play(seg.s, seg.a); return;
    }
    const mk = stage === 2 ? qNext : qFinish; let n = 0, tries = 0, score = 0; const N = cfg.N || 3; let cur = seg.a;
    const step = () => {
      const segs = P.segs(); const base = cfg.fixed ? seg : (cfg.random ? segs[Math.random() * segs.length | 0] : segs[(P.d.seg + n) % segs.length]); let q = mk(base.s, base.a); if (!q) { q = qFinish(base.s, base.a); }
      window.__q = q; const oral = P.d.set.hide, tag = stage === 2 ? '٢ · ساعد الطائر' : '٣ · اختبر حفظك';
      box.replaceChildren(head(tag), h('p', { class: 'say' }, q.title), q.kind === 'next' ? h('div', { class: 'ayah small' }, q.show) : h('div', { class: 'ayah' }, q.show));
      const lr = h('div', { class: 'krow' }, listenBtn(q.s, q.kind === 'next' ? q.showA : q.a)); if (stage === 2 || oral) box.append(lr);
      const fin = (ok, first) => { const b = h('div', { class: 'kfb ' + (ok ? 'good' : 'bad') }, ok ? '⭐ أحسنت!' : 'الإجابة الصحيحة:', ok ? null : h('div', { class: 'ayah small' }, q.kind === 'next' ? T(q.s, q.a) : q.full), h('button', { class: 'kbtn big', onclick: () => { n++; tries = 0; if (n >= N) { P.addStars(0); P.save(); ctx.onDone && ctx.onDone(stage, score, N); hide(); } else step(); } }, n + 1 >= N ? 'إنهاء' : 'التالي ◀')); box.append(b); if (first) { P.result(stage, q.s, q.a, ok, oral ? 'oral' : 'screen'); } };
      if (oral) { // تسميع شفهي: بلا خيارات، المعلمة تحكم
        const ans = h('div', { class: 'ayah small hid' }, q.kind === 'next' ? T(q.s, q.a) : q.full); box.append(h('p', { class: 'say' }, 'أجب شفهيًا — المعلمة ستحكم 🎤'), h('button', { class: 'kbtn alt', onclick: () => ans.classList.toggle('hid') }, '👁 أظهر الإجابة للمعلمة'), ans, h('div', { class: 'krow' }, h('button', { class: 'kbtn good', onclick: () => { score++; ctx.sfx.play('ok'); ctx.onStars(2); speak(PRAISE[Math.random() * PRAISE.length | 0], P.d.set.voice); P.result(stage, q.s, q.a, true, 'oral'); n++; tries = 0; if (n >= N) { ctx.onDone && ctx.onDone(stage, score, N); hide(); } else step(); } }, '✔ أصاب'), h('button', { class: 'kbtn bad', onclick: () => { ctx.sfx.play('bad'); speak(TRY[0], P.d.set.voice); P.result(stage, q.s, q.a, false, 'oral'); n++; if (n >= N) { ctx.onDone && ctx.onDone(stage, score, N); hide(); } else step(); } }, '✘ يحتاج مراجعة'))); return;
      }
      const opts = h('div', { class: 'kopts' }); let locked = false;
      q.opts.forEach((o, k) => { const b = h('div', { class: 'kopt' }, h('button', { class: 'kbtn opt q', onclick: () => { if (locked) return; if (k === q.ans) { locked = true; b.classList.add('good'); if (tries === 0) { score++; } ctx.sfx.play('ok'); ctx.onStars(tries === 0 ? 2 : 1); speak(PRAISE[Math.random() * PRAISE.length | 0], P.d.set.voice); fin(true, tries === 0); } else { tries++; b.classList.add('bad'); ctx.sfx.play('bad'); if (tries >= 2) { locked = true; speak(TRY[1], P.d.set.voice); opts.children[q.ans].classList.add('good'); fin(false, true); } else { speak(TRY[0], P.d.set.voice); ctx.toast('حاول مرة أخرى 💪'); } } } }, o.t)); if (stage === 2) b.append(listenBtn(q.s, o.a, '🔊')); opts.append(b); });
      box.append(opts);
    };
    step();
  });
}
