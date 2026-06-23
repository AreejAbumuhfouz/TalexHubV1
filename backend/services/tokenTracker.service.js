'use strict';
// backend/services/tokenTracker.service.js

const { TokenUsage, Wallet, WalletTransaction } = require('../models');
const pointsCfg = require('../config/pointsConfig');

// ✅ FIX: Match actual model names used in ai.service.js
const PRICING = {
  'deepseek-v4-flash':    { input: 0.14,  output: 0.28 },  // ✅ fast & cheap
  'deepseek-v4-pro':      { input: 1.74,  output: 3.48 },  // ✅ most powerful
  // Legacy aliases (keep for old records)
  'deepseek-chat':        { input: 0.14,  output: 0.28 },
  'deepseek-chat-v2.5':   { input: 0.14,  output: 0.28 },
  'deepseek-reasoner':    { input: 0.55,  output: 2.19 },
  default:                { input: 0.14,  output: 0.28 },  // ✅ default = flash pricing
};

const FEATURE_NAMES = {
  cv_analysis:  'CV Analysis',
  cover_letter: 'Cover Letter',
  interview:    'AI Interview',
  career_path:  'Career Path',
  auto_apply:   'Auto-Apply',
  chat:         'Career Chat',
  skill_gap:    'Skill Gap Analysis',
};

class TokenTracker {

  async recordSuccess(userId, userEmail, userName, feature, inputTokens, outputTokens, model = 'deepseek-v4-flash', metadata = {}) {
    try {
      const pricing       = PRICING[model] || PRICING.default;
      const totalTokens   = (inputTokens  || 0) + (outputTokens || 0);
      const estimatedCost = ((inputTokens  || 0) / 1_000_000 * pricing.input)
                          + ((outputTokens || 0) / 1_000_000 * pricing.output);

      const record = await TokenUsage.create({
        userId,
        userEmail,
        userName,
        feature,
        model,
        inputTokens:  inputTokens  || 0,
        outputTokens: outputTokens || 0,
        totalTokens,
        estimatedCost,
        status:    'success',
        metadata,
        timestamp: new Date(),
      });

      if (userId && totalTokens > 0) {
        await this._deductPoints(userId, totalTokens, feature, record.id);
      }

      console.log(`📊 [TokenTracker] ${feature} (${model}): ${totalTokens} tokens ($${estimatedCost.toFixed(6)}) — ${userEmail}`);
      return record;
    } catch (err) {
      console.error('[TokenTracker] recordSuccess error:', err.message);
      return null;
    }
  }

  async recordFailure(userId, userEmail, userName, feature, errorMessage, model = 'deepseek-v4-flash', metadata = {}) {
    try {
      const record = await TokenUsage.create({
        userId, userEmail, userName, feature, model,
        inputTokens: 0, outputTokens: 0, totalTokens: 0,
        estimatedCost: 0, status: 'failed',
        errorMessage, metadata, timestamp: new Date(),
      });
      console.log(`❌ [TokenTracker] ${feature} failed: ${errorMessage} — ${userEmail}`);
      return record;
    } catch (err) {
      console.error('[TokenTracker] recordFailure error:', err.message);
      return null;
    }
  }

  async _deductPoints(userId, totalTokens, feature, referenceId) {
    try {
      const cfg = await pointsCfg.get();
      if (!cfg.deductionEnabled) return;

      const pointsToDeduct = Math.ceil(totalTokens / cfg.tokensPerPoint);
      if (pointsToDeduct <= 0) return;

      let wallet = await Wallet.findOne({ where: { userId } });
      if (!wallet) wallet = await Wallet.create({ userId });

      const actualDeduct = Math.min(pointsToDeduct, wallet.pointsBalance);
      if (actualDeduct <= 0) return;

      await wallet.decrement('pointsBalance', { by: actualDeduct });

      await WalletTransaction.create({
        walletId:      wallet.id,
        type:          'ai_usage',
        pointsDelta:   -actualDeduct,
        cashDelta:     0,
        description:   `AI usage: ${FEATURE_NAMES[feature] || feature} (${totalTokens.toLocaleString()} tokens)`,
        referenceId:   referenceId || null,
        referenceType: 'TokenUsage',
      });

      console.log(`💎 [Points] -${actualDeduct}pts from ${userId} for ${feature} (${totalTokens} tokens)`);
    } catch (err) {
      console.error('[TokenTracker] _deductPoints error:', err.message);
    }
  }

  async canUseFeature(userId, estimatedTokens) {
    try {
      const cfg = await pointsCfg.get();
      if (!cfg.deductionEnabled || !cfg.blockOnZeroPoints) return { allowed: true };

      const wallet = await Wallet.findOne({ where: { userId } });
      if (!wallet) return { allowed: false, reason: 'no_wallet' };

      const needed = Math.ceil(estimatedTokens / cfg.tokensPerPoint);
      if (wallet.pointsBalance < needed) {
        return {
          allowed:   false,
          reason:    'insufficient_points',
          have:      wallet.pointsBalance,
          need:      needed,
          messageAr: cfg.zeroPointsMessage.ar,
          messageEn: cfg.zeroPointsMessage.en,
        };
      }
      return { allowed: true, pointsNeeded: needed };
    } catch {
      return { allowed: true };
    }
  }
}

module.exports = new TokenTracker();