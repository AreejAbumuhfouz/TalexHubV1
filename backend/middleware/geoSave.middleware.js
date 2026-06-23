'use strict';

const { User, Company } = require('../models');

const getCountryFromRequest = (req) => {
  const cf = req.headers['cf-ipcountry'];
  if (cf && cf !== 'XX' && cf.length === 2) return cf.toUpperCase();

  const xcc = req.headers['x-country-code'];
  if (xcc && xcc.length === 2) return xcc.toUpperCase();

  return null;
};

// Call this after successful login
const saveGeoToProfile = async (user, req) => {
  try {
    const country = getCountryFromRequest(req);
    if (!country) return; // Can't detect — don't overwrite existing data
    if (user.locationCountry === country) return; // Already saved

    await User.update(
      { locationCountry: country },
      { where: { id: user.id } }
    );
  } catch { /* silent — not critical */ }
};

// Save to company profile too
const saveGeoToCompany = async (companyId, req) => {
  try {
    const country = getCountryFromRequest(req);
    if (!country) return;

    await Company.update(
      { locationCountry: country },
      { where: { id: companyId, locationCountry: null } } // only if not set
    );
  } catch { /* silent */ }
};

module.exports = { getCountryFromRequest, saveGeoToProfile, saveGeoToCompany };