// تقدّم الطفل (محلي): النجوم/الجواهر/الصناديق، حالة كل آية، نتائج المراحل، إعدادات المعلمة والصوت.
import { Q, surah } from '../data/quran.js';
const KEY = 'bird-hafiz.v2';
export const JUZ = [78, 114]; // جزء عمّ: النبأ → الناس
const fresh = () => ({ v: 1, name: '', sel: { s: 114, from: 1, to: 6 }, seg: 0, stars: 0, gems: 0, got: {}, chests: {}, ayat: {}, results: [], set: { vol: .8, sfx: true, voice: true, hide: false, noQ: false }, audio: { on: true }, tw: 0 });
export class Progress {
  constructor() { this.d = fresh(); try { const t = localStorage.getItem(KEY); if (t) { const d = JSON.parse(t); if (d.v === 1) this.d = Object.assign(fresh(), d); } } catch (e) { this.memOnly = true; } this.fix(); this.cb = []; }
  fix() { const s = this.d.sel; if (s.s < JUZ[0] || s.s > JUZ[1]) s.s = 114; const n = surah(s.s).ayat.length; s.from = Math.min(Math.max(1, s.from), n); s.to = Math.min(Math.max(s.from, s.to), n); this.d.seg = Math.min(this.d.seg, s.to - s.from); }
  save() { try { localStorage.setItem(KEY, JSON.stringify(this.d)); } catch (e) { this.memOnly = true; } this.cb.forEach(f => f()); }
  reset() { this.d = fresh(); this.fix(); this.save(); }
  segs() { const { s, from, to } = this.d.sel, o = []; for (let a = from; a <= to; a++) o.push({ s, a }); return o; }
  cur() { return this.segs()[this.d.seg]; }
  setSel(s, from, to) { this.d.sel = { s, from, to }; this.d.seg = 0; this.fix(); this.save(); }
  go(i) { const n = this.segs().length; this.d.seg = Math.min(Math.max(0, i), n - 1); this.save(); }
  rec(s, a) { return this.d.ayat[s + ':' + a] || (this.d.ayat[s + ':' + a] = { heard: 0, ok: 0, bad: 0 }); }
  result(stage, s, a, ok, mode) { const r = this.rec(s, a); if (stage === 1) r.heard++; else if (ok) r.ok++; else r.bad++; this.d.results.unshift({ ts: Date.now(), stage, s, a, ok, mode: mode || 'screen' }); if (this.d.results.length > 200) this.d.results.length = 200; this.save(); }
  addStars(n) { this.d.stars += n; this.save(); } addGems(n) { this.d.gems += n; this.save(); }
  mastered(s, a) { const r = this.d.ayat[s + ':' + a]; return !!r && r.ok >= 2; }
}
