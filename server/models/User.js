const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['student', 'trainer'], default: 'student' },
  department: {type: String, enum: ['IT','DM']}
});

module.exports = mongoose.model('User', userSchema);