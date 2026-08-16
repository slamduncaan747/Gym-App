import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const ACC = '#4E8CF0'; // sRGB approximation of oklch(0.66 0.17 250) for raster icons
const BG = '#0A0B0D';

function svg({ size, pad = 0, bg = BG }) {
  const barW = Math.round(size * 0.1);
  const inset = pad;
  const s = size - pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${bg}"/>
    <g transform="translate(${inset},${inset})">
      <circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.30}" fill="none" stroke="${ACC}" stroke-width="${s * 0.11}"/>
      <rect x="${s / 2 - barW / 2}" y="${s * 0.08}" width="${barW}" height="${s * 0.22}" rx="${barW / 2}" fill="${ACC}"/>
    </g>
  </svg>`;
}

const targets = [
  { name: 'icon-32.png', size: 32, pad: 0 },
  { name: 'icon-180.png', size: 180, pad: 0 },
  { name: 'icon-192.png', size: 192, pad: 0 },
  { name: 'icon-512.png', size: 512, pad: 0 },
  { name: 'icon-maskable-192.png', size: 192, pad: 24 },
  { name: 'icon-maskable-512.png', size: 512, pad: 64 }
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const t of targets) {
  const markup = svg({ size: t.size, pad: t.pad });
  await page.setViewportSize({ width: t.size, height: t.size });
  await page.setContent(`<html><body style="margin:0">${markup}</body></html>`);
  const buf = await page.screenshot({ omitBackground: false });
  writeFileSync(path.join(outDir, t.name), buf);
  console.log('wrote', t.name);
}
await browser.close();
