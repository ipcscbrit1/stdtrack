const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  intime: Date,
  outtime: Date,
  topic: String,
  staffName: String,
  createdAt: { type: Date, default: Date.now }
});

// Virtual to get date only (yyyy-mm-dd) for "today" checks
attendanceSchema.virtual('dateString').get(function() {
  return this.intime ? this.intime.toISOString().slice(0, 10) : null;
});

module.exports = mongoose.model('Attendance', attendanceSchema);