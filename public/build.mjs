// يبني ملفًا واحدًا dist/bird-hafiz.html (يعمل حتى من file://) يضمّن: الشيفرة + نص المصحف (ورش) + خط ورش.
import { build } from '/opt/npm-tools/node_modules/esbuild/lib/main.js';
import fs from 'fs'; import crypto from 'crypto';
const root = new URL('.', import.meta.url).pathname;
const DATA = process.env.QURAN_JSON || root + 'assets/quran.json', FONT = process.env.FONT_WOFF2 || root + 'assets/UthmanicWarsh.woff2';
const out = await build({ entryPoints: [root + 'src/game/main.js'], bundle: true, minify: process.env.NOMIN ? false : true, format: 'iife', write: false, target: 'es2020' });
const js = out.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const data = fs.readFileSync(DATA, 'utf8').trim(); if (/<\/|<!--|\n/.test(data)) throw new Error('بيانات غير صالحة للتضمين');
const sha = crypto.createHash('sha256').update(data, 'utf8').digest('hex'); const font = fs.readFileSync(FONT).toString('base64');
let tpl = fs.readFileSync(root + 'src/ui/template.html', 'utf8');
for (const k of ['/*SEG_JSON*/', '/*FONT_B64*/', '/*DATA_JSON*/', '/*DATA_SHA*/', '/*MAIN_JS*/']) if (tpl.split(k).length !== 2) throw new Error('placeholder ' + k);
tpl = tpl.replace('/*SEG_JSON*/', () => fs.readFileSync(root + 'assets/audio/segments.json', 'utf8').trim()).replace('/*FONT_B64*/', () => font).replace('/*DATA_JSON*/', () => data).replace('/*DATA_SHA*/', sha).replace('/*MAIN_JS*/', () => js);
fs.mkdirSync(root + 'dist', { recursive: true }); fs.cpSync(root + 'assets/audio', root + 'dist/audio', { recursive: true, filter: f => !f.endsWith('.json') }); fs.writeFileSync(root + 'dist/bird-hafiz.html', tpl); console.log('ok', (tpl.length / 1e6).toFixed(2) + 'MB', sha.slice(0, 12));
