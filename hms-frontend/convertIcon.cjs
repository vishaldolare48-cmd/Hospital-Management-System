const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, 'public', 'logo.png');
const icoPath = path.join(__dirname, 'public', 'logo.ico');

if (fs.existsSync(pngPath)) {
  const pngData = fs.readFileSync(pngPath);
  const pngSize = pngData.length;

  // Create ICO header (6 bytes)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: Icon (1)
  header.writeUInt16LE(1, 4); // Number of images (1)

  // Create Icon Directory Entry (16 bytes)
  const entry = Buffer.alloc(16);
  entry.writeUInt8(0, 0); // Width (0 means 256px or more)
  entry.writeUInt8(0, 1); // Height (0 means 256px or more)
  entry.writeUInt8(0, 2); // Color palette
  entry.writeUInt8(0, 3); // Reserved
  entry.writeUInt16LE(1, 4); // Color planes (1)
  entry.writeUInt16LE(32, 6); // Bits per pixel (32)
  entry.writeUInt32LE(pngSize, 8); // Size of PNG data
  entry.writeUInt32LE(22, 12); // Offset to PNG data (6 + 16 = 22)

  // Combine and write the file
  const icoData = Buffer.concat([header, entry, pngData]);
  fs.writeFileSync(icoPath, icoData);
  console.log('Successfully created logo.ico!');
} else {
  console.error('logo.png not found!');
}
