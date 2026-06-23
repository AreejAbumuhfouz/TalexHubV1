'use strict';
// backend/services/tokenUsage.service.js

const TokenUsage = require('../models/TokenUsage');
const { Op } = require('sequelize');

// DeepSeek pricing (USD per 1M tokens) - Update with actual prices
const DEEPSEEK_PRICING = {
  input: 0.14,   // $0.14 per 1M input tokens
  output: 0.28,  // $0.28 per 1M output tokens
};

class TokenUsageService {
  /**
   * Record token usage for a specific feature
   */
  async recordUsage({ userId, feature, inputTokens, outputTokens, metadata = {} }) {
    try {
      const totalTokens = inputTokens + outputTokens;
      const estimatedCost = (inputTokens / 1000000) * DEEPSEEK_PRICING.input +
                            (outputTokens / 1000000) * DEEPSEEK_PRICING.output;
      
      const record = await TokenUsage.create({
        userId,
        feature,
        inputTokens,
        outputTokens,
        totalTokens,
        estimatedCost,
        metadata: JSON.stringify(metadata),
        timestamp: new Date(),
      });
      
      console.log(`📊 Token usage recorded: ${feature} - ${totalTokens} tokens ($${estimatedCost.toFixed(6)})`);
      return record;
    } catch (error) {
      console.error('Failed to record token usage:', error.message);
      return null;
    }
  }

  /**
   * Get user's token usage summary
   */
  async getUserSummary(userId, period = 'month') {
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
        startDate = null;
    }
    
    const where = { userId };
    if (startDate) where.timestamp = { [Op.gte]: startDate };
    
    const usage = await TokenUsage.findAll({ where });
    
    const summary = {
      totalTokens: usage.reduce((sum, u) => sum + u.totalTokens, 0),
      totalInputTokens: usage.reduce((sum, u) => sum + u.inputTokens, 0),
      totalOutputTokens: usage.reduce((sum, u) => sum + u.outputTokens, 0),
      totalCost: usage.reduce((sum, u) => sum + parseFloat(u.estimatedCost), 0),
      totalRequests: usage.length,
      byFeature: {},
      dailyUsage: [],
    };
    
    // Group by feature
    const features = ['cv_analysis', 'cover_letter', 'interview', 'career_path', 'auto_apply', 'chat'];
    features.forEach(f => {
      const featureUsage = usage.filter(u => u.feature === f);
      summary.byFeature[f] = {
        count: featureUsage.length,
        tokens: featureUsage.reduce((sum, u) => sum + u.totalTokens, 0),
        cost: featureUsage.reduce((sum, u) => sum + parseFloat(u.estimatedCost), 0),
      };
    });
    
    // Group by day
    const dailyMap = new Map();
    usage.forEach(u => {
      const day = u.timestamp.toISOString().split('T')[0];
      if (!dailyMap.has(day)) {
        dailyMap.set(day, { date: day, tokens: 0, requests: 0 });
      }
      const entry = dailyMap.get(day);
      entry.tokens += u.totalTokens;
      entry.requests++;
    });
    
    summary.dailyUsage = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    
    return summary;
  }

  /**
   * Get platform-wide metrics (admin only)
   */
  async getPlatformMetrics(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const usage = await TokenUsage.findAll({
      where: { timestamp: { [Op.gte]: startDate } },
    });
    
    // Get active users
    const activeUsers = new Set(usage.map(u => u.userId));
    
    // Calculate totals
    const totalTokens = usage.reduce((sum, u) => sum + u.totalTokens, 0);
    const totalCost = usage.reduce((sum, u) => sum + parseFloat(u.estimatedCost), 0);
    const avgDailyTokens = totalTokens / days;
    
    // Determine pressure level
    let pressureLevel = 'low';
    let pressureColor = '#22C55E';
    let pressureMessage = 'All systems operational';
    
    if (avgDailyTokens > 5000000) {
      pressureLevel = 'critical';
      pressureColor = '#EF4444';
      pressureMessage = 'Critical load! Immediate attention needed';
    } else if (avgDailyTokens > 2000000) {
      pressureLevel = 'high';
      pressureColor = '#F59E0B';
      pressureMessage = 'High load. Consider scaling up';
    } else if (avgDailyTokens > 500000) {
      pressureLevel = 'medium';
      pressureColor = '#3B82F6';
      pressureMessage = 'Moderate load. Monitor closely';
    }
    
    // Feature distribution
    const featureStats = {};
    const features = ['cv_analysis', 'cover_letter', 'interview', 'career_path', 'auto_apply', 'chat'];
    features.forEach(f => {
      const fUsage = usage.filter(u => u.feature === f);
      featureStats[f] = {
        count: fUsage.length,
        tokens: fUsage.reduce((sum, u) => sum + u.totalTokens, 0),
        cost: fUsage.reduce((sum, u) => sum + parseFloat(u.estimatedCost), 0),
      };
    });
    
    // Daily tokens for chart
    const dailyMap = new Map();
    usage.forEach(u => {
      const day = u.timestamp.toISOString().split('T')[0];
      if (!dailyMap.has(day)) {
        dailyMap.set(day, { date: day, tokens: 0, requests: 0 });
      }
      const entry = dailyMap.get(day);
      entry.tokens += u.totalTokens;
      entry.requests++;
    });
    
    const dailyTokens = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      period: `${days} days`,
      totalTokens,
      totalRequests: usage.length,
      totalCost,
      activeUsers: activeUsers.size,
      avgDailyTokens,
      pressureLevel,
      pressureColor,
      pressureMessage,
      featureStats,
      dailyTokens,
    };
  }

  /**
   * Get DeepSeek API usage from external API (if you have API key)
   */
  async getDeepSeekApiUsage(apiKey) {
    try {
      // DeepSeek doesn't have a public usage API, so we use our recorded data
      // For now, return calculated usage from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const usage = await TokenUsage.findAll({
        where: { timestamp: { [Op.gte]: thirtyDaysAgo } },
      });
      
      const totalTokens = usage.reduce((sum, u) => sum + u.totalTokens, 0);
      const totalCost = usage.reduce((sum, u) => sum + parseFloat(u.estimatedCost), 0);
      
      return {
        totalTokens,
        totalCost,
        totalRequests: usage.length,
        remainingBalance: 10.00 - totalCost, // Example: $10 initial balance
        monthlyUsage: totalCost,
      };
    } catch (error) {
      console.error('Failed to get DeepSeek usage:', error.message);
      return null;
    }
  }
}

module.exports = new TokenUsageService();