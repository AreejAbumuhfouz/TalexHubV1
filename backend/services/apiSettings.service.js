// backend/services/apiSettings.service.js
'use strict';

const { Setting, TokenUsage, User } = require('../models');
const { Op } = require('sequelize');

class ApiSettingsService {
  

async getDeepSeekSettings() {
  try {
    let settings = await Setting.findOne({ where: { key: 'deepseek_settings' } });
    if (!settings) {
      const defaultSettings = {
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        activeModel: 'deepseek-v4-flash',
        availableModels: [
          { 
            id: 'deepseek-v4-flash', 
            name: 'DeepSeek V4 Flash', 
            inputPrice: 0.14, 
            outputPrice: 0.28,
            description: 'Fastest and most cost-effective for daily tasks',
            speed: 'Fastest',
            quality: 'High',
            badge: 'Recommended',
            badgeColor: '#22C55E'
          },
          { 
            id: 'deepseek-v4-pro', 
            name: 'DeepSeek V4 Pro', 
            inputPrice: 1.74, 
            outputPrice: 3.48,
            description: 'Most powerful for complex reasoning and deep analysis',
            speed: 'Slower',
            quality: 'Highest',
            badge: 'Most Powerful',
            badgeColor: '#8B5CF6'
          },
        ],
        rateLimit: { enabled: true, maxRequestsPerMinute: 60, maxTokensPerMinute: 100000 },
        logging: { enabled: true, logPrompts: true, logResponses: false, retentionDays: 90 },
        lastUpdated: new Date(),
      };
      settings = await Setting.create({
        key: 'deepseek_settings',
        value: JSON.stringify(defaultSettings),
      });
      return defaultSettings;
    }
    return JSON.parse(settings.value);
  } catch (error) {
    console.error('Failed to get DeepSeek settings:', error.message);
    return {
      apiKey: '',
      activeModel: 'deepseek-v4-flash',
      availableModels: [
        { 
          id: 'deepseek-v4-flash', 
          name: 'DeepSeek V4 Flash', 
          inputPrice: 0.14, 
          outputPrice: 0.28,
          description: 'Fastest and most cost-effective',
          speed: 'Fastest',
          quality: 'High'
        },
        { 
          id: 'deepseek-v4-pro', 
          name: 'DeepSeek V4 Pro', 
          inputPrice: 1.74, 
          outputPrice: 3.48,
          description: 'Most powerful for complex reasoning',
          speed: 'Slower',
          quality: 'Highest'
        },
      ],
      rateLimit: { enabled: true, maxRequestsPerMinute: 60, maxTokensPerMinute: 100000 },
      logging: { enabled: true, logPrompts: true, logResponses: false, retentionDays: 90 },
    };
  }
}
  // تحديث إعدادات DeepSeek
  async updateDeepSeekSettings(settings) {
    try {
      settings.lastUpdated = new Date();
      await Setting.upsert({
        key: 'deepseek_settings',
        value: JSON.stringify(settings),
      });
      return { success: true, settings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  

  // اختبار مفتاح API
  async testApiKey(apiKey) {
    try {
      const axios = require('axios');
      const response = await axios.get('https://api.deepseek.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        timeout: 10000,
      });
      return { success: true, models: response.data.data?.map(m => m.id) || [] };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  // الحصول على الاستخدام حسب المستخدم
  async getUsageByUser(period = 'month') {
    try {
      let startDate;
      const now = new Date();
      
      switch (period) {
        case 'day':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(now.setMonth(now.getMonth() - 1));
      }
      
      const usage = await TokenUsage.findAll({
        where: { timestamp: { [Op.gte]: startDate } },
        attributes: [
          'userId',
          [TokenUsage.sequelize.fn('SUM', TokenUsage.sequelize.col('total_tokens')), 'totalTokens'],
          [TokenUsage.sequelize.fn('SUM', TokenUsage.sequelize.col('estimated_cost')), 'totalCost'],
          [TokenUsage.sequelize.fn('COUNT', TokenUsage.sequelize.col('id')), 'requestCount'],
        ],
        group: ['userId'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email', 'planKey'],
          },
        ],
      });
      
      return usage;
    } catch (error) {
      console.error('Failed to get usage by user:', error.message);
      return [];
    }
  }

  // الحصول على الاستخدام اليومي
  async getDailyUsage(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const usage = await TokenUsage.findAll({
        where: { timestamp: { [Op.gte]: startDate } },
        attributes: [
          [TokenUsage.sequelize.fn('DATE', TokenUsage.sequelize.col('timestamp')), 'date'],
          [TokenUsage.sequelize.fn('SUM', TokenUsage.sequelize.col('total_tokens')), 'totalTokens'],
          [TokenUsage.sequelize.fn('SUM', TokenUsage.sequelize.col('estimated_cost')), 'totalCost'],
          [TokenUsage.sequelize.fn('COUNT', TokenUsage.sequelize.col('id')), 'requestCount'],
        ],
        group: [TokenUsage.sequelize.fn('DATE', TokenUsage.sequelize.col('timestamp'))],
        order: [[TokenUsage.sequelize.fn('DATE', TokenUsage.sequelize.col('timestamp')), 'ASC']],
      });
      
      return usage;
    } catch (error) {
      console.error('Failed to get daily usage:', error.message);
      return [];
    }
  }

  // حذف السجلات القديمة
  async clearOldLogs(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const deleted = await TokenUsage.destroy({
        where: { timestamp: { [Op.lt]: cutoffDate } },
      });
      
      return { success: true, deletedCount: deleted };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ApiSettingsService();