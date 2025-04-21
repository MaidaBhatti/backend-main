require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const { processMessage } = require('./nlpManager'); // Hugging Face-based processor
const userRoutes = require('./routes/User');
const postsRoute = require('./routes/Post');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to serve static files (e.g., uploaded files)
app.use('/uploads', express.static('uploads'));

// Parse incoming JSON requests
app.use(bodyParser.json());

// MongoDB connection with error handling
mongoose.connect("mongodb+srv://maidabhatti77:gRx8NWL9XefK5TZS@calmdata.kjxbc1a.mongodb.net/?retryWrites=true&w=majority&appName=CalmData", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));
// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postsRoute);

// Chatbot endpoint using Hugging Face
app.post('/api/chatbot', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    console.log('Received message:', message);

    // Process message through Hugging Face
    const responseText = await processMessage(message);

    // Send chatbot response
    res.json({ answer: responseText });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
