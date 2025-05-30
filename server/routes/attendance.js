const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const auth = require('../middleware/auth');
const moment = require('moment-timezone');
const ExcelJS = require('exceljs');

// Haversine formula to check if inside allowed radius
function isWithinRange(lat1, lon1, lat2, lon2, radiusInMeters) {
  const toRad = (deg) => deg * (Math.PI / 180);
  const R = 6371e3; // meters
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance <= radiusInMeters;
}

// Allowed attendance location & radius
const allowedLat = 11.018324792742353;
const allowedLng = 76.97797179224519;
const allowedRadius = 100; // meters

// POST /attendance/submit
router.post('/submit', auth, async (req, res) => {
  try {
    const { intime, outtime, topic, staffName, location } = req.body;
    if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      return res.status(400).json({ message: 'Location data is required and must be numbers' });
    }

    const { latitude, longitude } = location;

    // Check location is within allowed radius
    if (!isWithinRange(latitude, longitude, allowedLat, allowedLng, allowedRadius)) {
      return res.status(400).json({ message: 'You are not in the allowed location for attendance' });
    }

    const startOfToday = moment().tz('Asia/Kolkata').startOf('day').toDate();
    const endOfToday = moment().tz('Asia/Kolkata').endOf('day').toDate();

    // Find today's attendance for this student
    let attendance = await Attendance.findOne({
      studentId: req.user.id,
      intime: { $gte: startOfToday, $lte: endOfToday },
    });

    if (!attendance) {
      // No attendance today: mark in-time only
      if (!intime) return res.status(400).json({ message: 'In-time is required' });

      attendance = new Attendance({
        studentId: req.user.id,
        intime: moment.tz(intime, 'Asia/Kolkata').toDate(),
      });

      await attendance.save();
      return res.status(201).json({ message: 'In-time marked successfully' });
    } else {
      // Attendance exists: update outtime, topic, staffName
      if (attendance.outtime) {
        return res.status(400).json({ message: 'Attendance already fully submitted today' });
      }

      if (!outtime || !topic || !staffName) {
        return res.status(400).json({ message: 'Out-time, topic, and staff name are required' });
      }

      attendance.outtime = moment.tz(outtime, 'Asia/Kolkata').toDate();
      attendance.topic = topic;
      attendance.staffName = staffName;

      await attendance.save();
      return res.status(200).json({ message: 'Attendance submitted successfully' });
    }
  } catch (err) {
    console.error('Error in /attendance/submit:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /attendance/check-today
router.get('/check-today', auth, async (req, res) => {
  try {
    const startOfToday = moment().tz('Asia/Kolkata').startOf('day').toDate();
    const endOfToday = moment().tz('Asia/Kolkata').endOf('day').toDate();

    const attendance = await Attendance.findOne({
      studentId: req.user.id,
      intime: { $gte: startOfToday, $lte: endOfToday },
      outtime: { $exists: true },
    });

    res.json({ submitted: !!attendance });
  } catch (err) {
    console.error('Error in /attendance/check-today:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
