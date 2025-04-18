require('dotenv').config();
const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

// Maximum token limit for Hugging Face models
const MAX_TOKENS = 127;

// Truncate input if it exceeds the token limit
const truncateInput = (input) => {
  const tokens = input.split(' ');
  if (tokens.length > MAX_TOKENS) {
    return tokens.slice(0, MAX_TOKENS).join(' ');
  }
  return input;
};

// Generate chatbot response using GPT-Neo or GPT-J
const generateResponse = async (prompt) => {
  try {
    const response = await hf.textGeneration({
      model: 'EleutherAI/gpt-neo-1.3B', // Use GPT-Neo model, or switch to 'EleutherAI/gpt-j-6B' for GPT-J
      inputs: prompt,
    });

    return response.generated_text.trim();
  } catch (error) {
    console.error('Error generating response with Hugging Face:', error);
    throw error;
  }
};

// Process message using sentiment + chatbot
const processMessage = async (message) => {
  try {
    // Truncate the message if it exceeds the token limit
    const truncatedMessage = truncateInput(message);

    const sentiment = await hf.textClassification({
      inputs: truncatedMessage,
      model: 'distilbert-base-uncased-finetuned-sst-2-english', // Sentiment model
    });

    const sentimentLabel = sentiment[0]?.label || 'Neutral';

    const prompt = `The user said: "${truncatedMessage}". The sentiment is ${sentimentLabel}. Respond like a friendly companion.`;

    const responseText = await generateResponse(prompt);

    console.log('Sentiment:', sentimentLabel);
    console.log('Bot Response:', responseText);

    return responseText;
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  }
};

module.exports = { processMessage };
