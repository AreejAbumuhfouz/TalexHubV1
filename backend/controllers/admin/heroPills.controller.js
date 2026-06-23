'use strict';

const { Setting, AuditLog } = require('../../models');
const { success, error } = require('../../utils/apiResponse');

const audit = (actor, action, id, o, n) =>
  AuditLog.create({ actorId: actor, action, entityType: 'Setting', entityId: id, oldValue: o ? JSON.stringify(o) : null, newValue: JSON.stringify(n) }).catch(() => {});

exports.get = async (req, res) => {
  try {
    const row = await Setting.findOne({ where: { key: 'hero_pills' } });
    const pills = row ? JSON.parse(row.value) : [];
    return success(res, { pills });
  } catch (err) { return error(res, err.message, 500); }
};

exports.save = async (req, res) => {
  try {
    const { pills } = req.body;
    if (!Array.isArray(pills)) return error(res, 'Pills must be an array', 400);
    if (pills.length > 20) return error(res, 'Maximum 20 pills', 400);

    for (let i = 0; i < pills.length; i++) {
      const p = pills[i];
      if (!p.text?.trim()) return error(res, `Pill #${i + 1}: text required`, 400);
      if (!p.textAr?.trim()) return error(res, `Pill #${i + 1}: textAr required`, 400);
      if (typeof p.x !== 'number') return error(res, `Pill #${i + 1}: x must be number`, 400);
      if (typeof p.y !== 'number') return error(res, `Pill #${i + 1}: y must be number`, 400);
    }

    await Setting.upsert({ key: 'hero_pills', value: JSON.stringify(pills) });
    await audit(req.user.id, 'setting.update', null, { key: 'hero_pills' }, { key: 'hero_pills', count: pills.length });
    return success(res, { pills }, 'Hero pills saved');
  } catch (err) { return error(res, err.message, 400); }
};