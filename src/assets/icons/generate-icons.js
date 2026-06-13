// PWA placeholder icons generator
// Requires: node generate-icons.js
const { writeFileSync } = require('fs');
const { join } = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const dir = __dirname;

for (const size of sizes) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a5276"/>
      <stop offset="100%" style="stop-color:#1e8449"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#g)"/>
  <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="central"
        font-family="Arial,Helvetica,sans-serif" font-weight="bold"
        font-size="${size * 0.35}px" fill="white">CBT</text>
</svg>`;
  writeFileSync(join(dir, `icon-${size}x${size}.svg`), svg);
  console.log(`✅ icon-${size}x${size}.svg`);
}
console.log('Done! Replace placeholders with real club logo.');
