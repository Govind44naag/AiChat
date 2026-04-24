const providers = {
  groq: {
    name: 'Groq',
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
    models: {
      'llama-3.3-70b-versatile': {
        name: 'Llama 3.3 70B Versatile',
        maxOutputTokens: 1024,
        dailyLimit: 1000
      },
      'llama-3.1-8b-instant': {
        name: 'Llama 3.1 8B Instant',
        maxOutputTokens: 1024,
        dailyLimit: 10000
      }
    }
  }
};

module.exports = providers;