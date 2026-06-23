

'use strict';

const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuid }     = require('uuid');
const path             = require('path');
// السطر الأول — استيراد الاثنين
const { s3, BUCKET, R2_PUBLIC_URL, R2_PUBLIC_URL_AVATAR } = require('../config/storage');
// ════════════════════════════════════════════════════════════
// Storage Service — Cloudflare R2
// ════════════════════════════════════════════════════════════

/* ── Allowed MIME types ───────────────────────────────────── */
const ALLOWED = {
  cv:          ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  course:      ['application/pdf'],
  avatar:      ['image/jpeg', 'image/png', 'image/webp'],
  logo:        ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  certificate: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
};

/* ── Max sizes (bytes) ────────────────────────────────────── */
const MAX_SIZE = {
  cv:          5  * 1024 * 1024,   // 5 MB
  course:      50 * 1024 * 1024,   // 50 MB
  avatar:      5  * 1024 * 1024,   // 2 MB
  logo:        2  * 1024 * 1024,   // 2 MB
  certificate: 10 * 1024 * 1024,   // 10 MB — CompanyCertificates/
};

/* ── Key builder ──────────────────────────────────────────── */
const buildKey = (folder, ext) => `${folder}/${uuid()}${ext}`;

/* ══════════════════════════════════════════════════════════
   UPLOAD — stream buffer to R2
   folder: 'cvs' | 'courses' | 'avatars' | 'logos'
   type:   'cv'  | 'course'  | 'avatar'  | 'logo'
   returns: { key, url }
═══════════════════════════════════════════════════════════ */
const upload = async ({ buffer, mimetype, originalname, folder, type }) => {
  /* validate mime */
  const allowed = ALLOWED[type];
  if (allowed && !allowed.includes(mimetype)) {
    throw Object.assign(new Error(`نوع الملف غير مسموح. المسموح: ${allowed.join(', ')}`), { status: 400 });
  }

  /* validate size */
  const maxSize = MAX_SIZE[type];
  if (maxSize && buffer.length > maxSize) {
    throw Object.assign(new Error(`حجم الملف كبير. الحد الأقصى: ${maxSize / 1024 / 1024} MB`), { status: 400 });
  }

  const ext = path.extname(originalname || '').toLowerCase() || '.bin';
  const key = buildKey(folder, ext);

  await s3.send(new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    Body:        buffer,
    ContentType: mimetype,
    // Files are private by default — access via presigned URL
  }));

  // return { key, url: `${R2_PUBLIC_URL}/${key}` };
  const baseUrl = (folder === 'Profileimages' || folder === 'avatars')
  ? R2_PUBLIC_URL_AVATAR
  : R2_PUBLIC_URL;
return { key, url: `${baseUrl}/${key}` };
};

/* ══════════════════════════════════════════════════════════
   PRESIGNED URL — time-limited download link (default 1h)
═══════════════════════════════════════════════════════════ */
const getPresignedUrl = async (key, expiresInSeconds = 3600) => {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
};

/* ══════════════════════════════════════════════════════════
   DELETE — remove file from R2
═══════════════════════════════════════════════════════════ */
const remove = async (key) => {
  if (!key) return;
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
};

/* ══════════════════════════════════════════════════════════
   EXISTS — check if key exists in R2
═══════════════════════════════════════════════════════════ */
const exists = async (key) => {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
};

/* ══════════════════════════════════════════════════════════
   UPLOAD CV — shorthand
═══════════════════════════════════════════════════════════ */
const uploadCV = (file) => upload({ ...file, folder: 'cvs', type: 'cv' });

/* ══════════════════════════════════════════════════════════
   UPLOAD COURSE PDF — shorthand
═══════════════════════════════════════════════════════════ */
const uploadCourse = (file) => upload({ ...file, folder: 'courses', type: 'course' });

/* ══════════════════════════════════════════════════════════
   UPLOAD AVATAR — shorthand
   Note: only 4 preset avatars are shown in UI;
   this handles custom uploads if needed
═══════════════════════════════════════════════════════════ */
// const uploadAvatar = (file) => upload({ ...file, folder: 'avatars', type: 'avatar' });
// const uploadAvatar = (file) => upload({ ...file, folder: 'Profileimages', type: 'avatar' });
const uploadAvatar = (file) => upload({ ...file, folder: 'Profileimages', type: 'avatar' });

/* ══════════════════════════════════════════════════════════
   UPLOAD COMPANY LOGO — shorthand
═══════════════════════════════════════════════════════════ */
const uploadLogo = (file) => upload({ ...file, folder: 'logos', type: 'logo' });
// module.exports = {
//   upload,
//   uploadCV,
//   uploadCourse,
//   uploadAvatar,
//   uploadLogo,
//   getPresignedUrl,
//   remove,
//   exists,
//   getClient: () => s3,
// };

// services/storage.service.js

/* ══════════════════════════════════════════════════════════
   DOWNLOAD FILE — get file buffer from R2 for email attachment
═══════════════════════════════════════════════════════════ */

// services/storage.service.js

/* ══════════════════════════════════════════════════════════
   DOWNLOAD FILE — get file buffer from R2 for email attachment
═══════════════════════════════════════════════════════════ */
const downloadFile = async (key) => {
  if (!key) throw new Error('Storage key is required');
  
  try {
    console.log(`[storage] Downloading file with key: ${key}`);
    
    const command = new GetObjectCommand({ 
      Bucket: BUCKET, 
      Key: key 
    });
    
    const response = await s3.send(command);
    
    // Convert the readable stream to buffer
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);
    console.log(`[storage] Downloaded ${buffer.length} bytes`);
    
    return buffer;
  } catch (error) {
    console.error('[storage] Error downloading file from R2:', error);
    throw new Error(`Failed to download file: ${error.message}`);
  }
};

/* ══════════════════════════════════════════════════════════
   GET FILE INFO — get file metadata from R2
═══════════════════════════════════════════════════════════ */
const getFileInfo = async (key) => {
  if (!key) return null;
  
  try {
    const command = new HeadObjectCommand({ 
      Bucket: BUCKET, 
      Key: key 
    });
    
    const response = await s3.send(command);
    return {
      size: response.ContentLength,
      contentType: response.ContentType,
      lastModified: response.LastModified,
    };
  } catch (error) {
    console.error('[storage] Error getting file info:', error);
    return null;
  }
};

// تأكد من إضافة الدوال الجديدة في exports
module.exports = {
  upload,
  uploadCV,
  uploadCourse,
  uploadAvatar,
  uploadLogo,
  getPresignedUrl,
  remove,
  exists,
  downloadFile,     // ✅ أضف هذا
  getFileInfo,      // ✅ أضف هذا
  getClient: () => s3,
};