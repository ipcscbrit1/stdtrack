import React from 'react';
import { Button, Alert } from 'react-bootstrap';
import axios from '../api/axiosInstance';

function MarkInComponent({ onSuccess, setError }) {
  const ALLOWED_LOCATION = {
    latitude: 11.018324792742353,
    longitude: 76.97797179224519,
  };
  const MAX_DISTANCE_METERS = 100;

  const getDistance = (lat1, lon1, lat2, lon2) => {
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
  };

  const getIST = () => {
    const now = new Date();
    const istOffset = 5.5 * 60;
    const localOffset = now.getTimezoneOffset();
    const istTime = new Date(now.getTime() + (istOffset + localOffset) * 60000);
    return istTime.toISOString().slice(0, 16);
  };

  const markIn = () => {
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const distance = getDistance(
          latitude,
          longitude,
          ALLOWED_LOCATION.latitude,
          ALLOWED_LOCATION.longitude
        );

        if (distance > MAX_DISTANCE_METERS) {
          setError(`You are too far from allowed location (${Math.round(distance)}m)`);
          return;
        }

        try {
          const intime = getIST();
          const res = await axios.post('/attendance/submit', {
            intime,
            location: { latitude, longitude },
          });

          if (res.status === 201) {
            onSuccess(intime);
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to mark in-time');
        }
      },
      (err) => setError('Location access failed: ' + err.message)
    );
  };

  return (
    <>
      <Button variant="primary" onClick={markIn}>
        Mark In-Time
      </Button>
      <p className="text-muted mt-2">Click to record your starting time and location.</p>
    </>
  );
}

export default MarkInComponent;
