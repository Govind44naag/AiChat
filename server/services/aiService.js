const axios = require('axios');
const providers = require('../config/providers');

class AIService {
  static async generateResponse(provider, model, messages, chatHistory = []) {
    try {
      switch (provider) {
        case 'groq':
          return await this.callGroq(model, messages, chatHistory);
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (error) {
      console.error('AI Service Error:', error.message);
      throw error;
    }
  }

 
  static async callGroq(model, messages, chatHistory) {
    const config = providers.groq;
    
    if (!config.apiKey || config.apiKey === 'your_groq_api_key_here') {
      throw new Error('Groq API key not configured');
    }

    if (!config.models[model]) {
      // List available models
      const available = Object.keys(config.models).join(', ');
      throw new Error(`Model '${model}' not supported. Available: ${available}`);
    }

    const url = `${config.baseURL}/chat/completions`;

    // Important: Keep context VERY small for free tier
    const recentHistory = chatHistory.slice(-2); // Only last 2 messages
    
    const formattedMessages = [
      { role: 'system', content: 'Be concise and direct in your responses give correct explanation with code(if required) but try to minimize the use of emojies.' }
    ];
    
    // Add truncated history
    for (const msg of recentHistory) {
      formattedMessages.push({
        role: msg.role,
        content: msg.content.substring(0, 200) // Keep history messages short
      });
    }
    
    // Add current message (truncated)
    const currentMsg = messages[messages.length - 1];
    formattedMessages.push({
      role: 'user',
      content: currentMsg.content.substring(0, 500)
    });

    console.log(`Calling Groq with model: ${model}, message count: ${formattedMessages.length}`);

    try {
      const response = await axios.post(url, {
        model: model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 500, // Keep response small for free tier
        top_p: 1,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const text = response.data.choices[0].message.content;
      const tokenCount = response.data.usage?.total_tokens || Math.ceil(text.length / 4);

      return { text, tokenCount, model };
    } catch (error) {
      console.error('Groq API Error:', {
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 401) {
        throw new Error('Invalid Groq API key. Check your .env file.');
      } else if (error.response?.data?.error?.code === 'rate_limit_exceeded') {
        throw new Error('Token limit exceeded. Try a shorter message or switch models.');
      }
      throw new Error(error.response?.data?.error?.message || 'Failed to get response from Groq');
    }
  }
}

module.exports = AIService;