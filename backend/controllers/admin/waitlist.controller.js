'use strict';

const { success, error, paginate } = require('../../utils/apiResponse');
const { AuditLog } = require('../../models');

const audit = (actor, action, id, o, n) =>
  AuditLog.create({ actorId: actor, action, entityType: 'Waitlist', entityId: id, oldValue: o ? JSON.stringify(o) : null, newValue: JSON.stringify(n) }).catch(() => {});

exports.getAll = async (req, res) => {
  try {
    const { sequelize } = require('../../models');
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const rows = await sequelize.query(
      'SELECT id, email, lang, ip, created_at FROM waitlist ORDER BY created_at DESC LIMIT :limit OFFSET :offset',
      { replacements: { limit, offset }, type: sequelize.QueryTypes.SELECT }
    );
    const [{ count }] = await sequelize.query('SELECT COUNT(*) as count FROM waitlist', { type: sequelize.QueryTypes.SELECT });

    return paginate(res, rows, parseInt(count), page, limit);
  } catch (err) {
    return success(res, { data: [], pagination: { total: 0 } });
  }
};

exports.delete = async (req, res) => {
  try {
    const { sequelize } = require('../../models');
    const email = req.params.email?.toLowerCase().trim();
    if (!email || !email.includes('@')) return error(res, 'Valid email required', 400);

    await sequelize.query('DELETE FROM waitlist WHERE email = :email', { replacements: { email } });
    await audit(req.user.id, 'waitlist.delete', null, { email }, null);
    return success(res, {}, 'Waitlist entry deleted');
  } catch (err) { return error(res, err.message, 400); }
};