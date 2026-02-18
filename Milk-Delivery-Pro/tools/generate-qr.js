#!/usr/bin/env node
const fs = require('fs');
const QRCode = require('qrcode');

const [,, url, out] = process.argv;
if (!url || !out) {
  console.error('Usage: node tools/generate-qr.js <url> <out.png>');
  process.exit(2);
}

QRCode.toFile(out, url, { type: 'png', margin: 2 }, function (err) {
  if (err) {
    console.error('QR generation failed:', err);
    process.exit(1);
  }
  console.log('QR code saved to', out);
});
