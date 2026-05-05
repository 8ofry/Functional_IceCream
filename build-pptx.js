const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.3" x 7.5" (16:9 widescreen, large)
pres.author = 'Ain Shams University — Functional Ice Cream Team';
pres.title = 'Functional Ice Cream with Enhanced Nutritional & Health Benefits';
pres.subject = 'Graduation Research Project';
pres.company = 'Faculty of Agriculture, Ain Shams University';

const slideDir = path.join(__dirname, 'rendered-slides');
const slideFiles = fs.readdirSync(slideDir)
  .filter(f => /^slide-\d+\.png$/.test(f))
  .sort();

console.log('Adding', slideFiles.length, 'slides to PPTX');

const SLIDE_W = 13.3;
const SLIDE_H = 7.5;

for (const file of slideFiles) {
  const slide = pres.addSlide();
  slide.background = { color: 'FAF6EE' };
  slide.addImage({
    path: path.join(slideDir, file),
    x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
    sizing: { type: 'cover', w: SLIDE_W, h: SLIDE_H }
  });
  console.log(' ·', file);
}

pres.writeFile({ fileName: 'Functional-Ice-Cream-Presentation-v3.pptx' })
  .then(name => console.log('Wrote:', name))
  .catch(err => { console.error(err); process.exit(1); });
