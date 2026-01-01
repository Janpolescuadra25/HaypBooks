const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const outDir = 'screenshots';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const url = 'http://localhost:3000/hub/companies';
  const sizes = [
    { w: 1440, h: 900, file: `${outDir}/portfolio-1440x900.png` },
    { w: 1920, h: 1080, file: `${outDir}/portfolio-1920x1080.png` },
  ];

  for (const s of sizes) {
    console.log(`Launching browser for ${s.w}x${s.h}...`);
    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: s.w, height: s.h } });
    const page = await context.newPage();

    // Retry navigation a few times in case server is still warming up
    let ok = false;
    for (let i = 0; i < 10; i++) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
        ok = true;
        break;
      } catch (e) {
        console.log('Navigation failed, retrying...', i + 1);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    if (!ok) {
      console.error('Failed to reach', url);
      await browser.close();
      continue;
    }

    // Wait for header + main white container to appear
    try {
      await page.waitForSelector('header', { timeout: 5000 });
      await page.waitForSelector('.bg-white.rounded-[72px]', { timeout: 5000 });
    } catch (e) {
      console.warn('Key selectors not found before capture (page may still be rendering). Capturing anyway.');
    }

    // Scroll a bit to include header + portfolio area cleanly
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: s.file, fullPage: false });
    console.log('Saved screenshot:', s.file);
    await browser.close();
  }

  console.log('All screenshots captured.');
})();