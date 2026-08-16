import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const ACC = '#4E8CF0'; // sRGB approximation of oklch(0.66 0.17 250) for raster icons
const ACC_LIGHT = '#8BB4FA';

function svg({ size, pad = 0 }) {
  const barW = Math.round(size * 0.095);
  const inset = pad;
  const s = size - pad * 2;
  const cx = s / 2, cy = s / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#15181E"/>
        <stop offset="100%" stop-color="#07080A"/>
      </linearGradient>
      <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${ACC_LIGHT}"/>
        <stop offset="100%" stop-color="${ACC}"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="38%" r="65%">
        <stop offset="0%" stop-color="${ACC}" stop-opacity=".22"/>
        <stop offset="100%" stop-color="${ACC}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#bg)"/>
    <rect width="${size}" height="${size}" fill="url(#glow)"/>
    <g transform="translate(${inset},${inset})">
      <circle cx="${cx}" cy="${cy}" r="${s * 0.295}" fill="none" stroke="url(#mark)" stroke-width="${s * 0.105}"/>
      <rect x="${cx - barW / 2}" y="${s * 0.085}" width="${barW}" height="${s * 0.235}" rx="${barW / 2}" fill="url(#mark)"/>
    </g>
  </svg>`;
}

const targets = [
  { name: 'icon-32.png', size: 32, pad: 0 },
  { name: 'icon-180.png', size: 180, pad: 0 },
  { name: 'icon-192.png', size: 192, pad: 0 },
  { name: 'icon-512.png', size: 512, pad: 0 },
  { name: 'icon-maskable-192.png', size: 192, pad: 26 },
  { name: 'icon-maskable-512.png', size: 512, pad: 70 }
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
