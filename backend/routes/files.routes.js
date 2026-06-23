


'use strict';

// ══════════════════════════════════════════════════════════
// File: backend/routes/files.routes.js
// ══════════════════════════════════════════════════════════

const express = require('express');
const router  = express.Router();
const mime    = require('mime-types');
const path    = require('path');
const fs      = require('fs');
const cvSvc   = require('../services/cv.service');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

// ── GET /api/v1/files/download?token=xxx ─────────────────
// Secure token-gated download (CVs etc.)
router.get('/download', (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success:false, message:'Token required' });

    const payload  = cvSvc.verifyDownloadToken(token);
    const buffer   = cvSvc.readFile(payload.path);
    const mimeType = mime.lookup(payload.path) || 'application/octet-stream';
    const filename = path.basename(payload.path);

    res.setHeader('Content-Type',        mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length',      buffer.length);
    res.setHeader('Cache-Control',       'private, max-age=3600');
    res.send(buffer);
  } catch (err) {
    res.status(403).json({ success:false, message: err.message });
  }
});

// ── GET /api/v1/files/serve/:folder/:filename ─────────────
// Public file serving for avatars and logos
// Only allows: avatars/, logos/ — never serves CVs or sensitive docs
router.get('/serve/:folder/:filename', (req, res) => {
  try {
    const { folder, filename } = req.params;

    // whitelist — never expose CVs or anything outside avatars/logos
    const ALLOWED_FOLDERS = ['avatars', 'logos'];
    if (!ALLOWED_FOLDERS.includes(folder)) {
      return res.status(403).json({ success:false, message:'Folder not allowed' });
    }

    // block path traversal attempts
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ success:false, message:'Invalid filename' });
    }

    const filePath = path.join(UPLOAD_DIR, folder, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success:false, message:'File not found' });
    }

    const mimeType = mime.lookup(filePath) || 'application/octet-stream';

    res.setHeader('Content-Type',  mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24h cache for images
    res.setHeader('Content-Length', fs.statSync(filePath).size);
    fs.createReadStream(filePath).pipe(res);

  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

module.exports = router;