const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Date,default: null  }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
