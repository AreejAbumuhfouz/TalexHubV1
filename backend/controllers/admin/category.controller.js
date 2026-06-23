'use strict';

const { JobCategory, CourseCategory, ChatCategory, Company } = require('../../models');
const { success, error } = require('../../utils/apiResponse');

exports.getJobCategories = async (req, res) => {
  try {
    const cats = await JobCategory.findAll({ order: [['sortOrder', 'ASC']] });
    return success(res, { categories: cats });
  } catch (err) { return error(res, err.message, 500); }
};

exports.getCourseCategories = async (req, res) => {
  try {
    const cats = await CourseCategory.findAll();
    return success(res, { categories: cats });
  } catch (err) { return error(res, err.message, 500); }
};

exports.getChatCategories = async (req, res) => {
  try {
    const cats = await ChatCategory.findAll({ order: [['sortOrder', 'ASC']] });
    return success(res, { categories: cats });
  } catch (err) { return error(res, err.message, 500); }
};

exports.getCompanyList = async (req, res) => {
  try {
    const companies = await Company.findAll({ where: { status: 'active', deletedAt: null }, attributes: ['id', 'name'], order: [['name', 'ASC']] });
    return success(res, { companies });
  } catch (err) { return error(res, err.message, 500); }
};