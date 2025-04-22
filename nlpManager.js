require('dotenv').config();
const { HfInference } = require('@huggingface/inference');

// Initialize Hugging Face Inference API
const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

// Define the new conversational model
// Replace with the model you want, e.g., 'gpt2', 'EleutherAI/gpt-neo-2.7B', etc.
const GPT_MODEL = 'EleutherAI/gpt-neo-1.3B';  // Example of GPT-Neo 2.7B model

// Function to generate a response from the chosen model
const generateResponse = async (userInput) => {
  try {
    const response = await hf.textGeneration({
      model: GPT_MODEL,
      inputs: userInput,
      parameters: {
        max_new_tokens: 150,  // Customize this based on your response length
        temperature: 0.7,  // Controls randomness; lower is more deterministic
        repetition_penalty: 1.2  // Helps to prevent repetitive answers
      }
    });

    return response.generated_text.trim();
  } catch (error) {
    console.error('Error generating response:', error);
    return "I'm having trouble understanding that right now. Could you rephrase?";
  }
};

// Sample function to process a message
const processMessage = async (message) => {
  const responseText = await generateResponse(message);
  return responseText;
};

// Example usage (testing):
const userMessage = 'Hi, how are you doing today?';
processMessage(userMessage).then(response => {
  console.log('Bot Response:', response);
});

module.exports = { processMessage };
