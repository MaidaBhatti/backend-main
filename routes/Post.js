// routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

// Create a new post
router.post('/', async (req, res) => {
  try {
    const { content, image, video, authorId } = req.body;

    const newPost = new Post({
      content,
      image,
      video,
      author: authorId,
    });

    const savedPost = await newPost.save();

    // Update user's post list
    const user = await User.findById(authorId);
    user.posts.push(savedPost._id);
    await user.save();

    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username');
    res.status(200).json(posts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
