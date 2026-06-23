'use strict';

const { getList, updateList } = require('../../services/badWordsFilter');
const { success, error } = require('../../utils/apiResponse');
const { AuditLog } = require('../../models');

const audit = (actorId, action, entityType, entityId, o, n) =>
  AuditLog.create({
    actorId, action, entityType, entityId,
    oldValue: o ? JSON.stringify(o) : null,
    newValue: JSON.stringify(n),
  }).catch(() => {});

exports.getBadWords = async (req, res) => {
  const list = getList();
  return success(res, { list });
};

exports.updateBadWords = async (req, res) => {
  try {
    const { en, ar } = req.body;
    const oldList = getList();
    
    await updateList({ en, ar });
    const newList = getList();
    
    await audit(req.user.id, 'bad_words.update', 'Setting', null, oldList, newList);
    
    return success(res, { list: newList }, 'Bad words list updated');
  } catch (err) {
    return error(res, err.message, 400);
  }
};