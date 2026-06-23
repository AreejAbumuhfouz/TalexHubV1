'use strict';
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const { RefreshToken } = require('../models');

const generateAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' });

const generateRefreshToken = async (userId, ip, deviceInfo, rememberMe = false) => {
  const rawToken  = crypto.randomBytes(64).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const days      = rememberMe ? 30 : 1;
  await RefreshToken.create({ userId, tokenHash, ipAddress: ip, deviceInfo, expiresAt: new Date(Date.now() + days*24*60*60*1000) });
  return rawToken;
};

// const generateOTP = (length = 6) =>
//   Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');

// const generateReferralCode = () =>
//   Math.random().toString(36).substring(2, 10).toUpperCase();
const generateOTP = (length = 6) => {
  const max = Math.pow(10, length);
  const randomBytes = crypto.randomBytes(4);
  const randomInt = randomBytes.readUInt32BE(0) % max;
  return randomInt.toString().padStart(length, '0');
};

const generateReferralCode = () =>
  crypto.randomBytes(6).toString('hex').toUpperCase();


module.exports = { generateAccessToken, generateRefreshToken, generateOTP, generateReferralCode };
