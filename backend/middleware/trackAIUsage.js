// backend/middleware/trackAIUsage.js

const tokenUsageService = require('../services/tokenUsage.service');

/**
 * Middleware to track AI usage for all AI endpoints
 */
async function trackAIUsage(req, res, next) {
  // Store original send function
  const originalSend = res.send;
  
  // Override send to capture response
  res.send = function(data) {
    // Try to parse response data
    let responseData;
    try {
      responseData = JSON.parse(data);
    } catch {
      responseData = { data };
    }
    
    // Track if this is an AI response
    const feature = req.feature || detectFeature(req.path);
    const userId = req.user?.id;
    
    if (userId && feature && responseData?.data) {
      // Estimate tokens
      const inputText = JSON.stringify(req.body);
      const outputText = JSON.stringify(responseData);
      
      const inputTokens = Math.ceil(inputText.length / 4);
      const outputTokens = Math.ceil(outputText.length / 4);
      
      // Async recording (don't block response)
      tokenUsageService.recordUsage({
        userId,
        feature,
        inputTokens,
        outputTokens,
        metadata: {
          path: req.path,
          method: req.method,
        },
      }).catch(err => console.error('Track error:', err));
    }
    
    originalSend.call(this, data);
  };
  
  next();
}

function detectFeature(path) {
  if (path.includes('/cv/analyze')) return 'cv_analysis';
  if (path.includes('/cover-letter')) return 'cover_letter';
  if (path.includes('/interview')) return 'interview';
  if (path.includes('/career-path')) return 'career_path';
  if (path.includes('/auto-apply')) return 'auto_apply';
  if (path.includes('/chat')) return 'chat';
  return null;
}

module.exports = { trackAIUsage };