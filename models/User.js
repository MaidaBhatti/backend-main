const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  age: Number,
  gender: String,
  height: Number,
  weight: Number,
  sleepTime: Number,
  birthdate: String,
  medication: String,
  pain: String,
  financialStatus: String,
  therapyType: String,
  image: String
});

// Optional: hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const bcrypt = require('bcryptjs');
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
