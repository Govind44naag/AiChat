const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const AIService = require('../services/aiService');
const TokenManager = require('../services/tokenManager');
const providers = require('../config/providers');

// Get all chats for user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .sort({ lastActivity: -1 })
      .select('-__v');
    
    res.json({ chats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
});

// Create new chat
router.post('/', auth, async (req, res) => {
  try {
    const { provider, model } = req.body;
    
    console.log('Create chat request:', { provider, model, userId: req.user._id });

    // Validate input
    if (!provider || !model) {
      return res.status(400).json({ message: 'Provider and model are required' });
    }

    // Validate provider and model
    if (!providers[provider]) {
      return res.status(400).json({ 
        message: `Invalid provider: ${provider}. Available: ${Object.keys(providers).join(', ')}` 
      });
    }

    if (!providers[provider].models[model]) {
      return res.status(400).json({ 
        message: `Invalid model: ${model}. Available for ${provider}: ${Object.keys(providers[provider].models).join(', ')}` 
      });
    }

    // Check API key
    if (providers[provider].apiKey === undefined && provider !== 'ollama') {
      return res.status(500).json({ 
        message: `${provider} API key not configured on server` 
      });
    }

    // Check if user can create new chat with this provider
    const canRequest = await TokenManager.canMakeRequest(
      req.user._id, 
      provider, 
      model
    );

    if (!canRequest) {
      return res.status(429).json({ 
        message: `Daily limit reached for ${providers[provider].models[model].name}. Please try another model or wait until tomorrow.` 
      });
    }

    const chat = await Chat.create({
      user: req.user._id,
      provider,
      model,
      title: `Chat with ${providers[provider].models[model].name}`
    });

    console.log('Chat created:', chat._id);
    res.status(201).json({ chat });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create chat',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get chat with messages
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      user: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const messages = await Message.find({ chat: chat._id })
      .sort({ createdAt: 1 })
      .select('-__v');

    const remaining = await TokenManager.getRemainingRequests(
      req.user._id,
      chat.provider,
      chat.model
    );

    res.json({
      chat: {
        ...chat.toObject(),
        remainingRequests: remaining
      },
      messages
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Failed to fetch chat' });
  }
});

// Send message in chat
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    console.log('Send message request:', { 
      chatId: req.params.chatId, 
      contentLength: content?.length,
      userId: req.user._id 
    });

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const chat = await Chat.findOne({
      _id: req.params.chatId,
      user: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    console.log('Found chat:', { 
      chatId: chat._id, 
      provider: chat.provider, 
      model: chat.model,
      status: chat.status 
    });

    if (chat.status === 'token_exhausted') {
      return res.status(400).json({ 
        message: 'This chat has reached its token limit. Please start a new chat with a different model.' 
      });
    }

    // Check token availability
    const canRequest = await TokenManager.canMakeRequest(
      req.user._id,
      chat.provider,
      chat.model
    );

    if (!canRequest) {
      chat.status = 'token_exhausted';
      await chat.save();
      
      return res.status(429).json({ 
        message: `Daily limit reached for this model. Chat has been archived. Please create a new chat with a different model.` 
      });
    }

    // Save user message
    const userMessage = await Message.create({
      chat: chat._id,
      role: 'user',
      content,
      tokensUsed: Math.ceil(content.length / 4)
    });

    console.log('User message saved');

    // Get chat history
    const history = await Message.find({ chat: chat._id })
      .sort({ createdAt: 1 })
      .limit(10);

    console.log('Generating AI response...');

    // Generate AI response
    const aiResponse = await AIService.generateResponse(
      chat.provider,
      chat.model,
      [{ role: 'user', content }],
      history.slice(0, -1)
    );

    console.log('AI response generated', { tokenCount: aiResponse.tokenCount });

    // Save AI response
    const assistantMessage = await Message.create({
      chat: chat._id,
      role: 'assistant',
      content: aiResponse.text,
      tokensUsed: aiResponse.tokenCount
    });

    // Update chat
    chat.totalTokensUsed += aiResponse.tokenCount;
    chat.lastActivity = new Date();
    if (chat.title && chat.title.startsWith('Chat with')) {
      chat.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
    }
    await chat.save();

    // Record usage
    await TokenManager.recordUsage(
      req.user._id,
      chat.provider,
      chat.model,
      aiResponse.tokenCount
    );

    const remaining = await TokenManager.getRemainingRequests(
      req.user._id,
      chat.provider,
      chat.model
    );

    console.log('Message sent successfully');

    res.json({
      message: {
        userMessage: {
          _id: userMessage._id,
          role: userMessage.role,
          content: userMessage.content,
          createdAt: userMessage.createdAt
        },
        assistantMessage: {
          _id: assistantMessage._id,
          role: assistantMessage.role,
          content: assistantMessage.content,
          createdAt: assistantMessage.createdAt
        }
      },
      remainingRequests: remaining
    });
  } catch (error) {
    console.error('Send message error:', error);
    
    // Determine status code
    let statusCode = 500;
    if (error.message.includes('not configured')) {
      statusCode = 500;
    } else if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (error.message.includes('rate limit')) {
      statusCode = 429;
    }
    
    res.status(statusCode).json({ 
      message: error.message || 'Failed to generate response',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete chat
router.delete('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.chatId,
      user: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Delete associated messages
    await Message.deleteMany({ chat: chat._id });

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ message: 'Failed to delete chat' });
  }
});

// Get usage stats
router.get('/stats/usage', auth, async (req, res) => {
  try {
    const stats = await TokenManager.getUserStats(req.user._id);
    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Get available models
router.get('/models/available', auth, async (req, res) => {
  try {
    const models = {};
    
    for (const [providerKey, provider] of Object.entries(providers)) {
      // Skip providers without API keys
      if (provider.apiKey === undefined && providerKey !== 'ollama') {
        continue;
      }
      
      models[providerKey] = {
        name: provider.name,
        models: {}
      };
      
      for (const [modelKey, model] of Object.entries(provider.models)) {
        const remaining = await TokenManager.getRemainingRequests(
          req.user._id,
          providerKey,
          modelKey
        );
        
        models[providerKey].models[modelKey] = {
          name: model.name,
          remaining,
          limit: model.dailyLimit
        };
      }
    }

    res.json({ models });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ message: 'Failed to fetch models' });
  }
});

// Dynamic model fetching from APIs
router.get('/models/fetch', auth, async (req, res) => {
  try {
    const axios = require('axios');
    const dynamicModels = {};
    
    // Fetch Groq models
    if (process.env.GROQ_API_KEY) {
      try {
        const groqResponse = await axios.get('https://api.groq.com/openai/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          }
        });
        
        // Filter only chat models that are active
        dynamicModels.groq = {
          name: 'Groq',
          models: {}
        };
        
        groqResponse.data.data.forEach(model => {
          if (model.active && !model.id.includes('whisper') && !model.id.includes('guard')) {
            dynamicModels.groq.models[model.id] = {
              name: model.id.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              maxOutputTokens: 1024,
              dailyLimit: 14400,
              contextWindow: model.context_window,
              owned_by: model.owned_by
            };
          }
        });
      } catch (error) {
        console.error('Failed to fetch Groq models:', error.message);
      }
    }
    
    
    res.json({ models: dynamicModels });
  } catch (error) {
    console.error('Model fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch models' });
  }
});

module.exports = router;