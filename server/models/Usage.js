 
const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  requestCount: {
    type: Number,
    default: 0
  },
  tokenCount: {
    type: Number,
    default: 0
  }
});

usageSchema.index({ user: 1, provider: 1, model: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Usage', usageSchema);