'use strict';

const { Setting, AuditLog } = require('../../models');
const { success, error } = require('../../utils/apiResponse');

const audit = (actor, action, id, o, n) =>
  AuditLog.create({ actorId: actor, action, entityType: 'Setting', entityId: id, oldValue: o ? JSON.stringify(o) : null, newValue: JSON.stringify(n) }).catch(() => { });

// GET ALL
exports.getAll = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    const result = {};
    settings.forEach(s => { try { result[s.key] = JSON.parse(s.value); } catch { result[s.key] = s.value; } });
    return success(res, { settings: result });
  } catch (err) { return error(res, err.message, 500); }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return error(res, 'Key required', 400);
    if (value === undefined) return error(res, 'Value required', 400);

    const old = await Setting.findOne({ where: { key } });
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    await Setting.upsert({ key, value: stringValue });
    await audit(req.user.id, 'setting.update', null, { key, value: old?.value }, { key, value: stringValue });
    return success(res, {}, 'Setting saved');
  } catch (err) { return error(res, err.message, 400); }
};

// BULK UPDATE
exports.bulkUpdate = async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') return error(res, 'Settings object required', 400);
    const keys = Object.keys(settings);
    if (keys.length > 50) return error(res, 'Max 50 settings', 400);

    await Promise.all(keys.map(async (key) => {
      const value = settings[key];
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      return Setting.upsert({ key, value: stringValue });
    }));

    await audit(req.user.id, 'setting.bulk_update', null, null, { keys, count: keys.length });
    return success(res, {}, `${keys.length} settings saved`);
  } catch (err) { return error(res, err.message, 400); }
};