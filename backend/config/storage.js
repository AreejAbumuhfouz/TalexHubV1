

'use strict';

const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
  forcePathStyle: false,
});

const BUCKET = process.env.R2_BUCKET_NAME;

const R2_PUBLIC_URL        = process.env.R2_PUBLIC_URL        || `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET}`;
const R2_PUBLIC_URL_AVATAR = process.env.R2_PUBLIC_URL_AVATAR || R2_PUBLIC_URL;

module.exports = { s3, BUCKET, R2_PUBLIC_URL, R2_PUBLIC_URL_AVATAR };