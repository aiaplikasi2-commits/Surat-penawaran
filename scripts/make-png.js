import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(2, 9); // color type (truecolor RGB)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with filter byte 0 at start of each scanline
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      // create a handsome gradient from deep blue (30, 64, 175) to navy (15, 23, 42)
      // with a slight center glow
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / (width / 2);
      
      let pr = Math.round(r * (1 - dist * 0.3));
      let pg = Math.round(g * (1 - dist * 0.3));
      let pb = Math.round(b * (1 - dist * 0.3));

      // Border rounded corner simulation (darken outer margins)
      if (x < 12 || x > width - 12 || y < 12 || y > height - 12) {
        pr = Math.round(pr * 0.7);
        pg = Math.round(pg * 0.7);
        pb = Math.round(pb * 0.7);
      }

      rawData[pixelOffset] = Math.max(0, Math.min(255, pr));
      rawData[pixelOffset + 1] = Math.max(0, Math.min(255, pg));
      rawData[pixelOffset + 2] = Math.max(0, Math.min(255, pb));
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([len, body, crcBuf]);
}

// Standard CRC32
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if ((crc & 1) !== 0) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

// Generate files: brand royal blue #1e40af (30, 64, 175)
fs.writeFileSync('./public/pwa-192x192.png', createPng(192, 192, 30, 64, 175));
fs.writeFileSync('./public/pwa-512x512.png', createPng(512, 512, 30, 64, 175));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createPng(512, 512, 23, 37, 84));
fs.writeFileSync('./public/apple-touch-icon.png', createPng(180, 180, 30, 64, 175));
fs.writeFileSync('./public/icon-192.png', createPng(192, 192, 30, 64, 175));

console.log('PNG Icons generated successfully in /public');
