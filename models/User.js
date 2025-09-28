const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Date } 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
