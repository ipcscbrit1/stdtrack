import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import LogoutButton from './Logout';

function StudentForm() {
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [formData, setFormData] = useState({
    intime: '',
    topic: '',
    staffName: '',
    outtime: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [intimeMarked, setIntimeMarked] = useState(false);
  const navigate = useNavigate();

  const ALLOWED_LOCATION = {
    latitude: 11.018324792742353,
    longitude: 76.97797179224519,
  };
  const MAX_DISTANCE_METERS = 100;

  function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = (deg) => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'student') {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const handlePopState = () => window.history.go(1);
    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const checkAlreadySubmitted = async () => {
      try {
        const res = await axios.get('/attendance/check-today');
        if (res.data.submitted) {
          setAlreadySubmitted(true);
          setMessage('You have already submitted today\'s attendance.');
        }
      } catch {
        console.error('Check submission error');
      }
    };

    checkAlreadySubmitted();
  }, []);

  const getISTDateTimeString = () => {
    const now = new Date();
    // IST is UTC+5:30
    const istOffset = 5.5 * 60; // minutes
    const localOffset = now.getTimezoneOffset(); // in minutes
    const istTime = new Date(now.getTime() + (istOffset + localOffset) * 60000);
    return istTime.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  };

  const markIntime = () => {
    setMessage('');
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const distance = getDistanceFromLatLonInMeters(
          latitude,
          longitude,
          ALLOWED_LOCATION.latitude,
          ALLOWED_LOCATION.longitude
        );

        if (distance > MAX_DISTANCE_METERS) {
          setError(`You are too far from the allowed location (Distance: ${Math.round(distance)}m)`);
          return;
        }

        try {
          const intime = getISTDateTimeString();

          const res = await axios.post('/attendance/submit', {
            intime,
            location: { latitude, longitude },
          });

          if (res.status === 201) {
            setIntimeMarked(true);
            setFormData((prev) => ({ ...prev, intime }));
            setMessage('In-time marked successfully. Please fill the rest of the form and submit.');
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to mark in-time');
        }
      },
      (err) => setError('Failed to get your location: ' + err.message)
    );
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!intimeMarked) {
      setError('Please mark in-time first.');
      return;
    }

    if (!formData.topic || !formData.staffName) {
      setError('Please fill in topic and staff name.');
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const distance = getDistanceFromLatLonInMeters(
          latitude,
          longitude,
          ALLOWED_LOCATION.latitude,
          ALLOWED_LOCATION.longitude
        );

        if (distance > MAX_DISTANCE_METERS) {
          setError(`You are too far from the allowed location (Distance: ${Math.round(distance)}m)`);
          return;
        }

        try {
          const outtime = getISTDateTimeString();

          const res = await axios.post('/attendance/submit', {
            intime: formData.intime, // saved intime
            outtime,
            topic: formData.topic,
            staffName: formData.staffName,
            location: { latitude, longitude },
          });

          if (res.status === 200) {
            setMessage('Attendance submitted successfully');
            setAlreadySubmitted(true);
            setFormData({
              intime: '',
              topic: '',
              staffName: '',
              outtime: '',
            });
            setIntimeMarked(false);
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to submit attendance');
        }
      },
      (err) => setError('Failed to get your location: ' + err.message)
    );
  };

  if (alreadySubmitted) {
    return (
      <>
        <LogoutButton />
        <h2>You have already submitted today's attendance.</h2>
      </>
    );
  }

  return (
    <div>
      <LogoutButton />
      <h1>Student Attendance Form</h1>

      {!intimeMarked ? (
        <>
          <button onClick={markIntime}>Mark In-Time</button>
          <p>Click to mark your attendance start time and location</p>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            In-Time (IST):{' '}
            <input
              type="datetime-local"
              name="intime"
              value={formData.intime}
              readOnly
            />
          </label>
          <br />

          <label>
            Topic:
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
            />
          </label>
          <br />

          <label>
            Staff Name:
            <select
              name="staffName"
              value={formData.staffName}
              onChange={handleChange}
              required
            >
              <option value="">Select Staff</option>
              <option value="Aneesh">Aneesh</option>
              <option value="Bhavan Sarathy">Bhavan Sarathy</option>
              <option value="Santhiya">Santhiya</option>
              <option value="Nanthakumar">Nanthakumar</option>
            </select>
          </label>
          <br />

          <button type="submit">Submit Attendance</button>
        </form>
      )}

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default StudentForm;