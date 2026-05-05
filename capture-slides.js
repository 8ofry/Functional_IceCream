const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const abs = path.resolve('index.html').split(path.sep).join('/');
  const fileUrl = 'file:///' + abs;
  console.log('Loading:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  // Disable scroll-snap so we can scroll programmatically to each slide.
  await page.evaluate(() => {
    const deck = document.getElementById('deck');
    if (deck) deck.style.scrollSnapType = 'none';
  });

  const slideCount = await page.$$eval('.slide', els => els.length);
  console.log('Found', slideCount, 'slides');

  fs.mkdirSync('rendered-slides', { recursive: true });

  for (let i = 0; i < slideCount; i++) {
    // Scroll the deck container (not the document) to slide i
    await page.evaluate((idx) => {
      const slides = document.querySelectorAll('.slide');
      const target = slides[idx];
      const deck = document.getElementById('deck');
      const targetTop = target.offsetTop;
      deck.scrollTo({ top: targetTop, behavior: 'instant' });
      // Manually trigger the in-view class so animations play
      target.classList.add('in-view');
    }, i);

    // Wait for entry animations + hero transition to settle.
    await new Promise(r => setTimeout(r, 2400));

    const filename = `rendered-slides/slide-${String(i + 1).padStart(2, '0')}.png`;
    await page.screenshot({ path: filename, type: 'png', fullPage: false });
    console.log('Captured', filename);
  }

  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
