 
const Usage = require('../models/Usage');
const providers = require('../config/providers');

class TokenManager {
  static async canMakeRequest(userId, provider, model) {
    const today = new Date().toISOString().split('T')[0];
    
    const usage = await Usage.findOne({
      user: userId,
      provider,
      model,
      date: today
    });

    const providerConfig = providers[provider];
    if (!providerConfig) return false;

    const modelConfig = providerConfig.models[model];
    if (!modelConfig) return false;

    const currentUsage = usage ? usage.requestCount : 0;
    return currentUsage < modelConfig.dailyLimit;
  }

  static async recordUsage(userId, provider, model, tokenCount) {
    const today = new Date().toISOString().split('T')[0];

    await Usage.findOneAndUpdate(
      { user: userId, provider, model, date: today },
      { 
        $inc: { 
          requestCount: 1,
          tokenCount: tokenCount || 0
        }
      },
      { upsert: true, new: true }
    );
  }

  static async getRemainingRequests(userId, provider, model) {
    const today = new Date().toISOString().split('T')[0];
    
    const usage = await Usage.findOne({
      user: userId,
      provider,
      model,
      date: today
    });

    const providerConfig = providers[provider];
    const modelConfig = providerConfig?.models[model];

    if (!modelConfig) return 0;

    const used = usage ? usage.requestCount : 0;
    return Math.max(0, modelConfig.dailyLimit - used);
  }

  static async getUserStats(userId) {
    const today = new Date().toISOString().split('T')[0];
    
    const stats = {};
    
    for (const [providerKey, provider] of Object.entries(providers)) {
      stats[providerKey] = {};
      
      for (const [modelKey, model] of Object.entries(provider.models)) {
        const usage = await Usage.findOne({
          user: userId,
          provider: providerKey,
          model: modelKey,
          date: today
        });

        stats[providerKey][modelKey] = {
          used: usage ? usage.requestCount : 0,
          limit: model.dailyLimit,
          remaining: model.dailyLimit - (usage ? usage.requestCount : 0),
          name: model.name
        };
      }
    }

    return stats;
  }
}

module.exports = TokenManager;