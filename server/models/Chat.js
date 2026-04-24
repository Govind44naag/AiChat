const mongoose = require('mongoose');
const providers = require('../config/providers');

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  provider: {
    type: String,
    required: true,
    enum: Object.keys(providers)
  },
  model: {
    type: String,
    required: true,
    validate: {
      validator: function(model) {
        return providers[this.provider]?.models[model] !== undefined;
      },
      message: 'Invalid model for selected provider'
    }
  },
  status: {
    type: String,
    enum: ['active', 'token_exhausted', 'archived'],
    default: 'active'
  },
  totalTokensUsed: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);