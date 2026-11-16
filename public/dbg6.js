const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage(); const e = []; p.on('pageerror', x => e.push(x.message + ' | ' + (x.stack || '').split('\n').slice(0, 3).join(' / '))); await p.goto('file:///home/claude/bird-game/dist/bird-hafiz.html'); await p.waitForSelector('#title.on'); await p.click('text=هيّا نطير'); await p.waitForTimeout(800);
 await p.evaluate(() => { __game.noRender = true; }); await p.evaluate(() => { try { import_ = 1; } catch (x) { } }); 
 await p.evaluate(async () => { window.__err = null; try { const m = await Promise.resolve(); } catch (x) { } });
 await p.evaluate(() => { __game.bird.z = __game.W.stations[0].z; }); await p.waitForSelector('#ov.on'); await p.waitForTimeout(500); await p.evaluate(() => { document.querySelectorAll('#ov .kbtn.big').forEach(() => 0); });
 for (let i = 0; i < 10 && await p.locator('#ov.on').count(); i++) await p.click('.kbtn.big').catch(() => { });
 await p.evaluate(() => { __game.bird.z = __game.W.stations[1].z; }); await p.waitForTimeout(2500); console.log(JSON.stringify(e)); console.log(await p.evaluate(() => document.getElementById('ov').innerHTML.slice(0, 200))); await b.close(); })();
