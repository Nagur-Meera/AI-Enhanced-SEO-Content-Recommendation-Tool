const OpenAI = require('openai');

let openai = null;

// Only initialize OpenAI if API key is provided
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn('⚠️  OPENAI_API_KEY not set. AI features will be disabled.');
}

module.exports = openai;
