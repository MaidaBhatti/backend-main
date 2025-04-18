const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const upload = require('../middleware/upload');
const path = require('path')
const jwt = require('jsonwebtoken')
const Post = require('../models/Post');


const authMiddleware = require('../middleware/auth');


router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username imagePath height weight gender sleepTime');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/register - Register a new user
router.post('/register', upload.single('image'), async (req, res) => {
  console.log('Received request:', req.body, req.file);

  const {
    username,
    email,
    password,
    age,
    gender,
    height,
    weight,
    sleepTime,
    birthdate,
    medication,
    pain,
    financialStatus,
    therapyType,
  } = req.body;

  try {
    console.log('Checking if email already exists...');
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already exists');
      return res.status(400).json({ message: 'Email already exists' });
    }

    console.log('Creating new user instance...');
    const newUser = new User({
      username,
      email,
      password,
      age,
      gender,
      height,
      weight,
      sleepTime,
      birthdate,
      medication,
      pain,
      financialStatus,
      therapyType,
      imagePath: req.file.path, // Use the file path from multer
      // posts: []
    });

    // console.log('Hashing password...');
    // const salt = await bcrypt.genSalt(10);
    // newUser.password = await bcrypt.hash(newUser.password, salt);

    console.log('Saving user to database...');
    await newUser.save();

    console.log('User registered successfully!');
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/login - Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Checking if email exists...');
    let user = await User.findOne({ email });
    if (!user) {
      console.log('Email not found');
      return res.status(404).json({ message: 'Email not found' });
    }

    console.log('Checking password...');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password');
      return res.status(400).json({ message: 'Invalid password' });
    }

    console.log('Generating JWT token...');
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };

    const token = await jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Login successful!');
    res.json({ token, username: user.username });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/getusers', async (req, res) => {
  try {
    const users = await User.find().select('username imagePath');
    res.json(users);
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// router.post('/chat', async (req, res) => {
//   const userMessage = req.body.message;
//   const botMessage = await generateBotResponse(userMessage); // Implement this function

//   res.json({ message: botMessage });
// });

// // Function to generate bot responses
// async function generateBotResponse(userMessage) {
//   // Convert the user message to lowercase for easier comparison
//   const lowerCaseMessage = userMessage.toLowerCase().trim();

//   // Basic bot responses based on keywords
//   if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
//     return "Hello! How can I assist you today?";
//   } else if (lowerCaseMessage.includes('how are you')) {
//     return "I'm just a bot, but thanks for asking!";
//   } else if (lowerCaseMessage.includes('bye')) {
//     return "Goodbye! Have a great day.";
//   } else {
//     return "I'm sorry, I didn't understand that. Can you please rephrase?";
//   }
// }

router.post('/post', authMiddleware, async (req, res) => {
  const { title, content, photoCaption } = req.body;
  const author = req.user.id; // Assuming req.user contains authenticated user info

  try {
    const newPost = new Post({
      title,
      content,
      photoCaption,
      author,
    });

    await newPost.save();

    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/getposts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username') // Populate author field with username from User model
      .select('title content photoCaption author imagePath'); // Select imagePath field

    // Map the posts to include the full URL for the imagePath
    const postsWithImageUrls = posts.map(post => ({
      ...post.toObject(),
      imageUrl: post.imagePath ? `http://localhost:5000/${post.imagePath.replace(/\\/g, '/')}` : null,
    }));

    res.json(postsWithImageUrls);
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
