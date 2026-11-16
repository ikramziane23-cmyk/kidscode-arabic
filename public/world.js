// عالم الطائر: ممرّ مستقيم طويل (وادٍ مشمس وجزر عائمة) تقع على امتداده محطات الآيات. يُبنى حسب عدد الآيات.
import { WorldBuilder, noise, fbm, mix3 } from '../worlds/kit.js';
import { Geo } from '../engine/geo.js';
import { smooth, lerp, rng, mul, mT, mRY, mRX, mRZ } from '../engine/math.js';
export const SP = 48, Y0 = 15, WATER_Y = -1.2, Z_FIRST = -8;
export const COLS = [[.3, 1, .5], [1, .7, .2], [.75, .45, 1], [.3, .8, 1], [1, .45, .6], [1, .9, .3]];
export function build(r, ph, N) {
  const zEnd = Z_FIRST + (N - 1) * SP + 70, zMin = -75, zMax = zEnd + 55, W = 150, L = zMax - zMin, B = new WorldBuilder(r, ph, 32), R = rng(5 + N);
  const H = (x, z) => { let h = (fbm(x * .02 + 3, z * .02) - .42) * 14 + (fbm(x * .08, z * .08) - .5) * 1.4; const c = 1 - smooth(10, 40, Math.abs(x)); h = lerp(h, Math.min(h, 1.5), c * .9); return h + 1.4; };
  const col = (x, y, z, ny) => { const n = noise(x * .25, z * .25); let c = mix3([.36, .74, .28], [.5, .84, .3], n); if (noise(x * .6 + 9, z * .6) > .78) c = mix3(c, [1, .8, .3], .5); if (y < -.2) c = [.82, .75, .5]; if (1 - ny > .3) c = mix3(c, [.55, .5, .45], smooth(.3, .55, 1 - ny)); return c; };
  B.terrain(-W / 2, zMin, W, L, H, col, 3); ph.terrain = H; B.water(-W / 2, zMin, W, L, WATER_Y, [.2, 0], 2, 2);
  const fluffy = (x, y, z, s, cols) => { const g = B.G(x, z), h = (3 + R() * 2) * s; g.cyl(x, y + h / 2, z, .28 * s, .42 * s, h, [.5, .34, .22], { seg: 7 }); const c = cols[R() * cols.length | 0]; for (let i = 0; i < 4; i++) { const a = R() * 6.28, d = i ? (1 + R()) * s : 0; g.sph(x + Math.cos(a) * d, y + h + (i ? .2 : 1) * s + R() * s * .5, z + Math.sin(a) * d, (1.8 + R() * .6) * s, (1.5 + R() * .4) * s, (1.8 + R() * .6) * s, c, { sway: .8, jit: .06, hi: 1, grad: .25 }); } };
  const GREENS = [[.3, .72, .3], [.4, .8, .3], [.2, .65, .4]], PINKS = [[1, .7, .8], [1, .8, .85]];
  const flower = (x, y, z) => { const g = B.G(x, z), c = [[1, .3, .4], [1, .85, .2], [.7, .4, 1], [1, 1, 1], [1, .55, .15]][R() * 5 | 0]; g.cyl(x, y + .22, z, .02, .02, .44, [.3, .7, .3], { seg: 3 }); g.sph(x, y + .46, z, .13, .13, .13, c, { low: 1, jit: 0, sway: 1 }); g.sph(x, y + .47, z, .06, .05, .06, [1, .9, .3], { low: 1, jit: 0 }); };
  const mush = (x, y, z, s) => { const g = B.G(x, z); g.cyl(x, y + .4 * s, z, .15 * s, .2 * s, .8 * s, [.95, .93, .85], { seg: 6 }); g.sph(x, y + .85 * s, z, .55 * s, .35 * s, .55 * s, [.95, .25, .3], { jit: 0 }); for (let i = 0; i < 4; i++) { const a = i * 1.6; g.sph(x + Math.cos(a) * .3 * s, y + 1.1 * s, z + Math.sin(a) * .3 * s, .09 * s, .05 * s, .09 * s, [1, 1, 1], { low: 1, jit: 0 }); } };
  const area = W * L, rx = () => (R() - .5) * W, rz = () => zMin + R() * L;
  for (let i = 0; i < area / 800; i++) { const x = rx(), z = rz(); if (Math.abs(x) < 9) continue; const y = H(x, z); if (y < -.3) continue; fluffy(x, y, z, .9 + R() * .8, R() < .25 ? PINKS : GREENS); }
  for (let i = 0; i < area / 330; i++) { const x = rx(), z = rz(), y = H(x, z); if (y < -.2) continue; flower(x, y, z); }
  for (let i = 0; i < area / 2500; i++) { const x = rx(), z = rz(), y = H(x, z); if (y > -.2) mush(x, y, z, 1 + R()); }
  for (let i = 0; i < area / 1700; i++) { const x = rx(), z = rz(), y = H(x, z); if (y < -.2) continue; const g = B.G(x, z); g.sph(x, y + .3, z, .6 + R() * .8, .5, .6 + R() * .8, [.6, .62, .65], { low: 1, jit: .1 }); }
  // جزر عائمة على الجانبين
  const isl = (x, y, z, rad, cl) => { const g = B.G(x, z); const grass = cl ? [1, 1, 1] : mix3([.4, .78, .3], [.55, .85, .35], R()); g.cyl(x, y, z, rad, rad * .93, 1.8, grass, { seg: 16, jit: .03 }); g.cyl(x, y - 1.7, z, rad * .93, rad * .8, 1.6, cl ? [.95, .95, 1] : [.62, .45, .3], { seg: 16, jit: .05 }); g.cyl(x, y - 1.7 - rad * .55, z, rad * .8, .5, rad * 1.1, cl ? [.9, .92, 1] : [.55, .43, .36], { seg: 12, jit: .08 }); if (!cl) { for (let i = 0; i < Math.max(1, Math.round(rad / 4)); i++) { const a = R() * 6.28, d = rad * (.3 + R() * .5); fluffy(x + Math.cos(a) * d, y + .9, z + Math.sin(a) * d, .7 + R() * .4, R() < .4 ? PINKS : GREENS); } for (let i = 0; i < rad * 1.4; i++) { const a = R() * 6.28, d = Math.sqrt(R()) * rad * .9; flower(x + Math.cos(a) * d, y + .9, z + Math.sin(a) * d); } const f = B.FX(x, z); f.box(x + rad * .96, y - 8, z, .5, 18, 1.4, [.7, .95, 1], { e: .25, jit: .1 }); } B.light(x, y + 5, z, rad * 2.4, [1, .95, .8], .5, 0); };
  for (let z = zMin + 20, i = 0; z < zMax; z += 62, i++) { const side = i % 2 ? 1 : -1; isl(side * (32 + R() * 18), 22 + R() * 22, z + R() * 20, 8 + R() * 6, false); if (i % 2 === 0) isl(-side * (45 + R() * 10), 40 + R() * 25, z + 30, 7, true); }
  // الأجسام المتحركة
  const star = B.dynMesh(g => { const pts = []; for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5, rr = i % 2 ? .22 : .5; pts.push([Math.sin(a) * rr, Math.cos(a) * rr]); } const base = g.n, col = [1, .85, .2]; const add = (x, y, z, nx, ny, nz) => { g.v.push(x, y, z, nx, ny, nz, col[0], col[1], col[2], .9, 0, .5, .5); g.n++; }; add(0, 0, .12, 0, 0, 1); add(0, 0, -.12, 0, 0, -1); pts.forEach(p => add(p[0], p[1], 0, p[0], p[1], 0)); for (let i = 0; i < 10; i++) { const a = base + 2 + i, b = base + 2 + (i + 1) % 10; g.idx.push(base, a, b); g.idx.push(base + 1, b, a); } g.min = [-.5, -.5, -.2]; g.max = [.5, .5, .2]; });
  const gem = B.dynMesh(g => { g.cone(0, .2, 0, .24, .4, [.5, .9, 1], { seg: 6, e: .9, jit: 0 }); g.cone(0, -.15, 0, .24, .25, [.3, .6, 1], { seg: 6, e: .6, jit: 0, rx: Math.PI }); });
  const gem2 = B.dynMesh(g => { g.cone(0, .2, 0, .24, .4, [1, .5, .85], { seg: 6, e: .9, jit: 0 }); g.cone(0, -.15, 0, .24, .25, [.8, .3, .7], { seg: 6, e: .6, jit: 0, rx: Math.PI }); });
  const chest = B.dynMesh(g => { g.box(0, .35, 0, 1.4, .8, 1, [.75, .45, .2], { jit: .02 }); g.box(0, .75, 0, 1.45, .1, 1.05, [1, .8, .25], { e: .2, jit: 0 }); g.box(0, .35, .52, .25, .26, .05, [1, .8, .25], { e: .3, jit: 0 }); });
  const lid = B.dynMesh(g => { g.cyl(0, 0, 0, .5, .5, 1.4, [.8, .5, .22], { seg: 10, rz: Math.PI / 2, jit: 0 }); g.box(0, 0, 0, 1.45, .06, .06, [1, .8, .25], { e: .2, jit: 0 }); });
  const rings = COLS.map(c => B.dynMesh(g => { for (let i = 0; i < 22; i++) { const a = i / 22 * 6.283; g.sph(Math.cos(a) * 6, Math.sin(a) * 6, 0, .42, .42, .42, c, { e: .35, jit: 0, hi: 1 }); } }));
  const glows = COLS.map(c => B.dynMesh(g => { for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.sph(Math.cos(a) * 6, Math.sin(a) * 6, 0, 1.3, 1.3, 1.3, c, { e: .1, soft: 1, low: 1, jit: 0 }); } }, 'fx'));
  const items = []; const put = (k, x, y, z, e) => items.push({ k, x, y, z, taken: false, id: items.length, ...e });
  const stations = []; for (let k = 0; k < N; k++) stations.push({ k, z: Z_FIRST + k * SP, col: COLS[k % COLS.length] });
  // نجوم على امتداد المسار بين المحطات
  let zs = -50; for (let z = -50; z < zEnd - 20; z += 7) { if (stations.some(s => Math.abs(s.z - z) < 8)) continue; const t = z * .09; put(R() < .15 ? 'gem' : 'star', Math.sin(t) * 7, Y0 + Math.cos(t * 1.3) * 3, z, { v: R() < .5 ? 1 : 2 }); }
  // صناديق: كل 4 آيات وفي النهاية (تُفتح عند الاقتراب)
  const addChest = (z, x) => { const y = H(x, z) + 9; const g = B.G(x, z); g.cyl(x, y - .5, z, 3.2, 2.6, 1, [1, 1, 1], { seg: 12, e: .2, jit: 0 }); put('chest', x, y, z, { n: items.filter(i => i.k === 'chest').length, open: 0 }); };
  for (let k = 3; k < N - 1; k += 4) addChest(stations[k].z + SP / 2, k % 8 < 4 ? 9 : -9); addChest(zEnd - 20, 0);
  // جسيمات
  B.scatterParticles(Math.min(260, area / 600), -W / 2, zMin, W, L, (x, z) => Math.max(0, H(x, z)) + 2, [[1, .9, .5], [1, .7, .9], [.7, .9, 1]], 1.2, 0, 10, 4);
  B.scatterParticles(70, -W / 2, zMin, W, L, () => 5, [1, 1, 1], 1.5, 2, 30, 6);
  const e = r.env; Object.assign(e, { sunDir: [-.45, -.8, -.35], sunCol: [.85, .78, .62], ambSky: [.5, .6, .82], ambGnd: [.42, .42, .36], fogCol: [.74, .87, .98], fog: .0058, top: [.2, .5, .95], mid: [.55, .8, 1], bot: [.92, .96, 1], sun: [1, .9, .6], stars: 0 });
  const fin = B.finish();
  return { ...fin, H, items, stations, zEnd, zMin, zMax, N, mesh: { star, gem, gem2, chest, lid, rings, glows }, spawn: [0, Y0, -55], B };
}
