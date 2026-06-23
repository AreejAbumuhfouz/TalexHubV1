'use strict';
// backend/controllers/settings.controller.js

const { Setting } = require('../models');
const { success, error } = require('../utils/apiResponse');

/**
 * Get CliQ payment settings
 */
exports.getCliqSettings = async (req, res) => {
  try {
    // Get all CliQ settings from database
    const alias = await Setting.findOne({ where: { key: 'cliq_alias' } });
    const phone = await Setting.findOne({ where: { key: 'cliq_phone' } });
    const bank = await Setting.findOne({ where: { key: 'cliq_bank' } });
    const name = await Setting.findOne({ where: { key: 'cliq_name' } });
    
    // Return settings with fallback values
    return success(res, {
      alias: alias?.value || 'TalexHub',
      phone: phone?.value || '+962 79 000 0000',
      bank: bank?.value || 'Arab Bank',
      name: name?.value || 'TalexHub Payments',
    });
  } catch (err) {
    console.error('Error fetching CliQ settings:', err.message);
    return error(res, 'Failed to fetch payment settings', 500);
  }
};

/**
 * Update CliQ payment settings (Admin only)
 */
exports.updateCliqSettings = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return error(res, 'Unauthorized. Admin access required.', 403);
    }
    
    const { alias, phone, bank, name } = req.body;
    
    // Update or create each setting
    await Setting.upsert({ key: 'cliq_alias', value: alias });
    await Setting.upsert({ key: 'cliq_phone', value: phone });
    await Setting.upsert({ key: 'cliq_bank', value: bank });
    await Setting.upsert({ key: 'cliq_name', value: name });
    
    return success(res, null, 'CliQ settings updated successfully');
  } catch (err) {
    console.error('Error updating CliQ settings:', err.message);
    return error(res, 'Failed to update payment settings', 500);
  }
};