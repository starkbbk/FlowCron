const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1690, height: 948 });
  try {
    await page.goto('http://localhost:5174/dashboard', { waitUntil: 'networkidle2' });
  } catch (e) {
    console.error('Failed to load page. Make sure dev server is running.');
    process.exit(1);
  }

  const rects = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    if (!aside) return 'No aside found';
    
    // Brand div
    const brand = aside.querySelector(':scope > div:first-child');
    // Nav 
    const nav = aside.querySelector('nav');
    // First NavLink
    const navLink = nav?.querySelector('a');
    
    return {
      aside: aside.getBoundingClientRect().toJSON(),
      brand: brand ? brand.getBoundingClientRect().toJSON() : null,
      nav: nav ? nav.getBoundingClientRect().toJSON() : null,
      navLink: navLink ? navLink.getBoundingClientRect().toJSON() : null,
      htmlDir: document.documentElement.dir,
      bodyMargin: getComputedStyle(document.body).margin,
      cssText: aside.style.cssText
    };
  });

  console.log(JSON.stringify(rects, null, 2));
  await browser.close();
})();
