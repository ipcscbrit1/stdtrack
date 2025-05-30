import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  useEffect(() => {
    const handlePopState = () => {
      window.history.go(1);
    };
    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);

      if (res.data.user.role === 'student') {
        navigate('/student');
      } else if (res.data.user.role === 'teacher') {
        navigate('/teacher');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: '#f5eedd' }}>
      <div className="card shadow-lg p-4 w-100" style={{ maxWidth: '400px', borderColor: '#077a7d' }}>
        <h3 className="text-center mb-3" style={{ color: '#06202b' }}>Login</h3>

        {error && <div className="alert alert-danger p-2">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group mb-3">
            <label>Email</label>
            <input type="email" className="form-control" name="email" required value={formData.email} onChange={handleChange} />
          </div>

          <div className="form-group mb-3">
            <label>Password</label>
            <input type="password" className="form-control" name="password" required value={formData.password} onChange={handleChange} />
          </div>

          <button type="submit" className="btn w-100" style={{ backgroundColor: '#077a7d', color: 'white' }}>
            Login
          </button>
        </form>

        <p className="text-center mt-3">
          Are you a new user?{' '}
          <Link to="/register" className="text-decoration-none" style={{ color: '#077a7d' }}>
            Click to register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;