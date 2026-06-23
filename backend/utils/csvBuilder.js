'use strict';

/**
 * csvBuilder.js
 * Lightweight CSV builder — no external deps needed.
 * Usage:
 *   const { buildCsv, sendCsv } = require('../utils/csvBuilder');
 *   const csv = buildCsv(rows, ['id','name','email']);
 *   sendCsv(res, csv, 'users.csv');
 */

/**
 * Escape a single CSV cell value
 */
const escapeCell = (val) => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Build a CSV string from an array of objects
 * @param {object[]} rows      - Array of plain objects
 * @param {string[]} columns   - Column keys to include (in order)
 * @param {object}   headers   - Optional display headers { key: 'Label' }
 * @returns {string}           - CSV string
 */
const buildCsv = (rows, columns, headers = {}) => {
  const headerRow = columns.map(c => escapeCell(headers[c] || c)).join(',');
  const dataRows  = rows.map(row =>
    columns.map(c => {
      const val = row[c];
      // Flatten arrays and objects
      if (Array.isArray(val))        return escapeCell(val.join('; '));
      if (val && typeof val === 'object' && !(val instanceof Date)) return escapeCell(JSON.stringify(val));
      return escapeCell(val);
    }).join(',')
  );
  return [headerRow, ...dataRows].join('\r\n');
};

/**
 * Send a CSV file as a download response
 * @param {object} res       - Express response
 * @param {string} csv       - CSV string
 * @param {string} filename  - Download filename
 */
const sendCsv = (res, csv, filename) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-cache');
  // BOM for Excel to correctly read UTF-8 Arabic text
  res.send('\uFEFF' + csv);
};

module.exports = { buildCsv, sendCsv };