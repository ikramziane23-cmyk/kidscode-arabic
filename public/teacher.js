// وضع المعلمة: لوحة جانبية (مناسبة لمشاركة الشاشة في Zoom): السورة والآيات والمحطة الحالية، تشغيل المراحل، التلاوة وضبط تقطيعها، النتائج.
import { Q, surah } from '../data/quran.js';
import { h } from './stages.js';
import { JUZ } from './progress.js';
const mmss = t => { const m = Math.floor(t / 60), s = (t % 60).toFixed(2).padStart(5, '0'); return m + ':' + s; };
export function teacherPanel(ctx) {
  const { P, qa, root } = ctx; let tab = 0, alignS = null;
  const el = root;
  const surahSel = (only) => { const s = h('select', {}); for (let n = JUZ[0]; n <= JUZ[1]; n++) { if (only && !qa.has(n)) continue; s.append(h('option', { value: n }, `${n}. ${surah(n).name} (${surah(n).ayat.length})${qa.has(n) ? ' 🔊' : ''}`)); } return s; };
  const TABS = ['التحكم', 'التلاوة', 'النتائج'];
  const chk = (label, get, set) => h('label', { class: 'chk' }, h('input', { type: 'checkbox', checked: get() ? 'checked' : null, onchange: e => { set(e.target.checked); P.save(); } }), ' ' + label);
  const pages = [
    () => { const s = surahSel(false); s.value = P.d.sel.s; const a = h('input', { type: 'number', min: 1, value: P.d.sel.from }), b = h('input', { type: 'number', min: 1, value: P.d.sel.to });
      const apply = () => { const n = surah(+s.value).ayat.length, f = Math.min(Math.max(1, +a.value || 1), n); P.setSel(+s.value, f, Math.min(Math.max(f, +b.value || f), n)); ctx.rebuild(); draw(); };
      const sg = P.segs(), cur = P.cur();
      return h('div', {}, h('label', {}, 'السورة'), s, h('div', { class: 'row2' }, h('div', {}, h('label', {}, 'من آية'), a), h('div', {}, h('label', {}, 'إلى آية'), b)), h('button', { class: 'tbtn', onclick: apply }, 'اعتمد المقطع المطلوب'),
        h('label', {}, `المحطة الحالية (${P.d.seg + 1}/${sg.length})`), h('div', { class: 'q tcur' }, cur ? surah(cur.s).ayat[cur.a - 1] : ''), h('div', { class: 'row2' }, h('button', { class: 'tbtn alt', onclick: () => { ctx.gotoStation(P.d.seg - 1); draw(); } }, '▶ السابقة'), h('button', { class: 'tbtn alt', onclick: () => { ctx.gotoStation(P.d.seg + 1); draw(); } }, 'التالية ◀')),
        h('label', {}, 'شغّلي المراحل مباشرة (1 / 2 / 3)'), h('div', { class: 'row3' }, [1, 2, 3].map(i => h('button', { class: 'tbtn', onclick: () => ctx.launch(i) }, ['استمع', 'ساعد الطائر', 'اختبر'][i - 1]))),
        chk('تسميع شفهي: إخفاء الخيارات وأنا أحكم', () => P.d.set.hide, v => P.d.set.hide = v), chk('بلا أسئلة أثناء الطيران (استماع فقط)', () => P.d.set.noQ, v => P.d.set.noQ = v), chk('التشجيع الصوتي (أحسنت…)', () => P.d.set.voice, v => P.d.set.voice = v)); },
    () => { const s = surahSel(true); if (alignS && qa.has(alignS)) s.value = alignS; else alignS = +s.value; const sg = qa.segs(alignS) || [], box = h('div', {}); const audio = h('audio', { controls: 'controls', src: qa.file(alignS), style: 'width:100%' });
      const starts = sg.map(x => x[0]), end = sg.length ? sg[sg.length - 1][1] : 0; const rows = h('div', {});
      const drawRows = () => { rows.replaceChildren(...starts.map((t, i) => h('div', { class: 'tr' }, h('b', {}, 'آية ' + (i + 1)), h('input', { type: 'number', step: '0.05', value: t.toFixed(2), style: 'width:80px', onchange: e => { starts[i] = +e.target.value; } }), h('button', { class: 'tbtn alt', style: 'width:auto;padding:4px 8px', onclick: () => { starts[i] = +audio.currentTime.toFixed(2); drawRows(); } }, '⏱ هنا'), h('button', { class: 'tbtn alt', style: 'width:auto;padding:4px 8px', onclick: () => { audio.currentTime = Math.max(0, starts[i] - .05); audio.play(); } }, '▶')))); };
      drawRows(); const conf = qa.conf(alignS);
      return h('div', {}, chk('تفعيل التلاوة', () => P.d.audio.on !== false, v => P.d.audio.on = v), h('p', { class: 'hint' }, 'التسجيلات: القارئ ياسين الجزائري (أرسلتِها أنتِ). قصّ الآيات تقدير آلي من الصمت والطاقة وقد لا يطابق حدود الآيات تمامًا؛ استمعي وصحّحي البدايات إن لزم.'),
        h('label', {}, 'السورة'), s, h('p', { class: 'hint' }, conf === 'teacher' ? '✅ تقطيع معتمد من المعلمة' : conf === 'low' ? '⚠ ثقة منخفضة — راجعيه' : '⚠ تقطيع آلي غير مُراجَع'), audio, rows,
        h('div', { class: 'row2' }, h('button', { class: 'tbtn', onclick: () => { const sg2 = starts.map((t, i) => [t, i + 1 < starts.length ? starts[i + 1] : end]); qa.setOverride(alignS, sg2); ctx.toast('حُفظ التقطيع'); draw(); } }, 'احفظ التقطيع'), h('button', { class: 'tbtn alt', onclick: () => { qa.clearOverride(alignS); draw(); } }, 'استعادة الآلي')),
        h('label', {}, 'مستوى الصوت'), h('input', { type: 'range', min: 0, max: 1, step: .05, value: P.d.set.vol, oninput: e => { P.d.set.vol = +e.target.value; ctx.sfx.setVol(+e.target.value); P.save(); } }), chk('المؤثرات وصوت الطائر', () => P.d.set.sfx, v => { P.d.set.sfx = v; ctx.sfx.on = v; if (!v) ctx.sfx.stopAmb(); }));
      }, 
    () => { const r = P.d.results.slice(0, 25); return h('div', {}, h('div', { class: 'stat' }, `⭐ ${P.d.stars}   💎 ${P.d.gems}   📦 ${Object.keys(P.d.chests).length}`), h('h4', {}, 'آخر النتائج'), ...(r.length ? r.map(x => h('div', { class: 'tr ' + (x.ok ? 'good' : 'bad') }, `${new Date(x.ts).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })} · مرحلة ${x.stage} · ${surah(x.s).name} ${x.a}`, h('b', {}, x.stage === 1 ? 'تعلّم' : x.ok ? '✔' : '✘'), x.mode === 'oral' ? h('small', {}, 'شفهي') : null)) : [h('p', { class: 'hint' }, 'لا نتائج بعد.')]),
      h('h4', {}, 'الآيات'), ...P.segs().map(g => { const x = P.rec(g.s, g.a); return h('div', { class: 'tr' }, `آية ${g.a}`, h('small', {}, `استماع ${x.heard} · صحيح ${x.ok} · خطأ ${x.bad}`), P.mastered(g.s, g.a) ? h('b', {}, '🏅') : null); }),
      h('button', { class: 'tbtn alt', onclick: () => { if (confirm('مسح كل تقدّم الطفل؟')) { P.reset(); ctx.rebuild(); draw(); } } }, 'مسح التقدّم')); }];
  const draw = () => { el.replaceChildren(h('div', { class: 'thead' }, h('b', {}, '👩‍🏫 وضع المعلمة'), h('button', { class: 'x', onclick: () => ctx.toggleTeacher(false) }, '✕')), h('div', { class: 'ttabs' }, TABS.map((t, i) => h('button', { class: 'ttab' + (i === tab ? ' on' : ''), onclick: () => { tab = i; draw(); } }, t))), h('div', { class: 'tbody' }, pages[tab]())); const sel = el.querySelector('.tbody select'); if (tab === 1 && sel) sel.onchange = () => { alignS = +sel.value; draw(); }; };
  draw(); return { draw };
}
