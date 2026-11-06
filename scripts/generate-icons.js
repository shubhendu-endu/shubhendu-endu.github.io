import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="50%" stop-color="#0ea5e9" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
    <linearGradient id="dropGrad" x1="0%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#e0f2fe" stop-opacity="0.8" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#0369a1" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="115" fill="url(#bg)" />
  <g filter="url(#shadow)">
    <!-- Water droplet path -->
    <path d="M256 90 C256 90 145 235 145 320 C145 385 195 430 256 430 C317 430 367 385 367 320 C367 235 256 90 256 90 Z" fill="url(#dropGrad)" />
    <!-- Highlight shine -->
    <path d="M225 210 C210 240 200 275 200 310 C200 325 190 325 190 310 C190 270 202 230 220 195 C226 185 235 195 225 210 Z" fill="#ffffff" opacity="0.75" />
    <!-- Secondary small sparkle -->
    <circle cx="310" cy="330" r="14" fill="#ffffff" opacity="0.6" />
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

// Helper function to create valid uncompressed PNG buffer
function createPng(width, height, isMaskable = false) {
  // RGBA buffer
  const stride = width * 4 + 1; // 1 filter byte per line
  const rawData = Buffer.alloc(height * stride);

  const cx = width / 2;
  const cy = height / 2;
  const radius = isMaskable ? width * 0.45 : width * 0.44;
  const cornerRadius = isMaskable ? 0 : width * 0.22;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * stride;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Squircle or full bleed check
      let inSquircle = true;
      if (!isMaskable) {
        // Rounded rect check
        const dx = Math.max(0, Math.abs(x - cx) - (cx - cornerRadius));
        const dy = Math.max(0, Math.abs(y - cy) - (cy - cornerRadius));
        if (dx * dx + dy * dy > cornerRadius * cornerRadius) {
          inSquircle = false;
        }
      }

      if (!inSquircle) {
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0;
        continue;
      }

      // Background gradient (Cyan to Sky Blue)
      const gradT = (x / width + y / height) / 2;
      let r = Math.round(2 + gradT * (56 - 2));
      let g = Math.round(132 + gradT * (189 - 132));
      let b = Math.round(199 + gradT * (248 - 199));
      let a = 255;

      // Draw Water Drop shape in center
      // Droplet formula: circle at (cx, cy + dropOff), taper up to (cx, cy - dropHeight)
      const scale = width / 512;
      const dropCy = cy + 30 * scale;
      const dropRadius = 100 * scale;
      const distFromDropBottom = Math.hypot(x - cx, y - dropCy);

      // Top triangle cone
      const dyTop = y - dropCy;
      const dxTop = Math.abs(x - cx);
      const isCone = dyTop < 0 && dyTop > -160 * scale && dxTop < (-dyTop * 0.68);
      const isDropCircle = distFromDropBottom <= dropRadius;

      if (isCone || isDropCircle) {
        // Drop fill (White with slight blue translucent gradient)
        const shineDist = Math.hypot(x - (cx - 25 * scale), y - (dropCy - 15 * scale));
        if (shineDist < 30 * scale) {
          r = 255; g = 255; b = 255;
        } else {
          r = Math.round(230 + (1 - gradT) * 25);
          g = Math.round(245 + (1 - gradT) * 10);
          b = 255;
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // PNG chunks
  const compressed = zlib.deflateSync(rawData);

  // PNG header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 table & function
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(32, 32, false));

console.log('Successfully generated PWA icons in /public');
