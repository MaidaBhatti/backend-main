const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const commentSchema = new Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})
const postSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String },
  photoCaption: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Post', postSchema);
