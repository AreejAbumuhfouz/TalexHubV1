'use strict';

// ══════════════════════════════════════════════════════════
// File: backend/services/cv.service.js
//
// Handles: file parsing (PDF/DOCX), local disk storage,
//          PDF generation with Puppeteer
// ══════════════════════════════════════════════════════════

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Upload directory (local disk on Hostinger) ─────────────
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), 'uploads');

// Ensure directories exist
['cvs', 'avatars', 'logos', 'generated'].forEach(dir => {
  const p = path.join(UPLOAD_DIR, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// ── Save uploaded file to disk ─────────────────────────────
exports.saveFile = async (buffer, originalName, userId, type = 'cvs') => {
  const ext      = path.extname(originalName).toLowerCase();
  const filename = `${userId}-${Date.now()}${ext}`;
  const dir      = path.join(UPLOAD_DIR, type);
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, buffer);

  return {
    filename,
    filepath,
    relativePath: `${type}/${filename}`,
    size: buffer.length,
  };
};

// ── Generate signed download token ────────────────────────
exports.generateDownloadToken = (relativePath, expiresInSeconds = 3600) => {
  const payload = {
    path: relativePath,
    exp:  Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig  = crypto
    .createHmac('sha256', process.env.STORAGE_SIGN_SECRET || 'dev_secret')
    .update(data).digest('base64url');
  return `${data}.${sig}`;
};

// ── Verify download token ─────────────────────────────────
exports.verifyDownloadToken = (token) => {
  const [data, sig] = token.split('.');
  const expected = crypto
    .createHmac('sha256', process.env.STORAGE_SIGN_SECRET || 'dev_secret')
    .update(data).digest('base64url');

  if (sig !== expected) throw new Error('Invalid token');

  const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');

  return payload;
};

// ── Serve file by relative path ───────────────────────────
exports.readFile = (relativePath) => {
  const filepath = path.join(UPLOAD_DIR, relativePath);
  if (!fs.existsSync(filepath)) throw new Error('File not found');
  return fs.readFileSync(filepath);
};

// ── Delete file ───────────────────────────────────────────
exports.deleteFile = (relativePath) => {
  try {
    const filepath = path.join(UPLOAD_DIR, relativePath);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch { /* silent */ }
};

// ── Parse CV text from PDF or DOCX ───────────────────────
exports.extractText = async (buffer, mimeType) => {
  try {
    if (mimeType === 'application/pdf') {
      const pdfParse = require('pdf-parse');
      const result   = await pdfParse(buffer);
      return result.text?.trim() || '';
    }

    if (mimeType.includes('wordprocessingml') || mimeType === 'application/msword') {
      const mammoth = require('mammoth');
      const result  = await mammoth.extractRawText({ buffer });
      return result.value?.trim() || '';
    }

    return '';
  } catch (err) {
    console.error('CV text extraction failed:', err.message);
    return '';
  }
};

// ── Generate PDF from HTML (CV builder output) ────────────
exports.generatePDF = async (html, filename) => {
  const puppeteer = require('puppeteer');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8"/>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet"/>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Tajawal', Arial, sans-serif; direction: rtl; font-size: 13px; line-height: 1.6; color: #2D3436; }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      printBackground: true,
    });

    // Save to disk
    const filepath = path.join(UPLOAD_DIR, 'generated', filename);
    fs.writeFileSync(filepath, pdfBuffer);

    return { filepath, relativePath: `generated/${filename}`, buffer: pdfBuffer };
  } finally {
    await browser.close();
  }
};