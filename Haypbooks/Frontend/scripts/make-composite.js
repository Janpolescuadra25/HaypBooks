const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const base = path.resolve(__dirname, '..', '..', '..'); // repo root (up 3 from frontend/scripts)
  const img1 = path.join(base, 'screenshots', 'portfolio-1440x900.png');
  const img2 = path.join(base, 'screenshots', 'portfolio-1920x1080.png');
  const out = path.join(base, 'screenshots', 'portfolio-composite.png');

  if (!fs.existsSync(img1) || !fs.existsSync(img2)) {
    console.error('One or both screenshots are missing:', img1, img2);
    process.exit(1);
  }

  const b1 = fs.readFileSync(img1).toString('base64');
  const b2 = fs.readFileSync(img2).toString('base64');

  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Composite</title>
    <style>
      html,body{height:100%;margin:0;background:#f3f6f8}
      .wrap{display:flex;align-items:flex-start;justify-content:center;gap:20px;padding:40px}
      .frame{background:white;border-radius:12px;box-shadow:0 6px 30px rgba(15,23,42,0.08);padding:8px}
      img{display:block;max-width:none}
      .label{font-family:Inter, system-ui, Arial; text-align:center;margin-top:8px;color:#334155;font-size:13px}
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="frame"><img src="data:image/png;base64,${b1}" alt="1440x900" width="1440" height="900"><div class="label">1440×900</div></div>
      <div class="frame"><img src="data:image/png;base64,${b2}" alt="1920x1080" width="1920" height="1080"><div class="label">1920×1080</div></div>
    </div>
  </body>
  </html>
  `;

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440 + 1920 + 40 + 40 + 20, height: 1080 + 80 } });
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();

  console.log('Saved composite to', out);
})();