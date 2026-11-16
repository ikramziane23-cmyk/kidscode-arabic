const { chromium } = require('playwright'); const S = process.argv[2];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1100, height: 650 } }); p.setDefaultTimeout(30000); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file:///home/claude/bird-game/dist/bird-hafiz.html'); await p.waitForSelector('#title.on'); await p.screenshot({ path: S + '/r_title.png' }); await p.click('text=هيّا نطير'); await p.waitForTimeout(2500); await p.screenshot({ path: S + '/r_fly.png' });
  const info = () => p.evaluate(() => { const b = __game.bird; return { z: +b.z.toFixed(1), x: +b.x.toFixed(1), y: +b.y.toFixed(1), mode: __game.mode, seg: __game.P.d.seg, N: __game.W.N }; });
  console.log('start', JSON.stringify(await info())); await p.keyboard.down('ArrowLeft'); await p.waitForTimeout(1500); await p.keyboard.up('ArrowLeft'); console.log('after left', JSON.stringify(await info()));
  await p.evaluate(() => { __game.bird.z = -12; }); await p.waitForSelector('#ov.on'); await p.waitForTimeout(1200); await p.screenshot({ path: S + '/r_st1.png' });
  console.log('audio', await p.evaluate(() => { const a = __game.qa.el; return a ? { t: +a.currentTime.toFixed(2), paused: a.paused, err: a.error && a.error.code, src: a.src.split('/').pop(), seg: __game.qa.segs(114)[0] } : null; }));
  await p.evaluate(() => __game.noRender = true);
  const doStage1 = async () => { for (let i = 0; i < 12; i++) { if (!await p.locator('#ov.on').count()) break; await p.click('.kbtn.big').catch(() => { }); } };
  await doStage1(); await p.waitForTimeout(500); console.log('after st1', JSON.stringify(await info()), 'stars', await p.evaluate(() => __game.P.d.stars));
  // محطة 2: سؤال ثم تعلّم
  await p.evaluate(() => { __game.noRender = false; __game.bird.z = __game.W.stations[1].z; }); await p.waitForSelector('#ov.on'); await p.waitForTimeout(800); await p.screenshot({ path: S + '/r_q.png' });
  await p.evaluate(() => __game.noRender = true); const q = await p.evaluate(() => window.__q); await p.locator('.kopt .kbtn.opt').nth(q.ans).click(); await p.click('.kfb .kbtn'); await p.waitForTimeout(300); await doStage1(); await p.waitForTimeout(400);
  console.log('after st2', JSON.stringify(await info()));
  // الوصول إلى آخر محطة
  for (let k = 2; k < 6; k++) { await p.evaluate(k => { __game.bird.z = __game.W.stations[k].z; }, k); await p.waitForSelector('#ov.on'); await p.waitForTimeout(300); for (let g = 0; g < 8 && await p.locator('#ov.on').count(); g++) { const q = await p.evaluate(() => window.__q); if (await p.locator('.kopt').count()) { await p.locator('.kopt .kbtn.opt').nth(q.ans).click(); await p.click('.kfb .kbtn'); } else await p.click('.kbtn.big').catch(() => { }); await p.waitForTimeout(150); if (await p.locator('text=طيران جديد').count()) break; } }
  console.log('end', JSON.stringify(await info()), await p.locator('text=طيران جديد').count()); await p.evaluate(() => __game.noRender = false); await p.screenshot({ path: S + '/r_end.png' });
  console.log('errors', JSON.stringify(errs.slice(0, 4))); await b.close();
})();
