import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
function Register() {
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('/auth/register', formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: '#f5eedd' }}>
      <div className="card shadow-lg p-4 w-100" style={{ maxWidth: '400px', borderColor: '#077a7d' }}>
        <h3 className="text-center mb-3" style={{ color: '#06202b' }}>Register</h3>
        
        {error && <div className="alert alert-danger p-2">{error}</div>}
        {success && <div className="alert alert-success p-2">{success}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group mb-3">
            <label>Name</label>
            <input type="text" className="form-control" name="name" required value={formData.name} onChange={handleChange} />
          </div>

          <div className="form-group mb-3">
            <label>Email</label>
            <input type="email" className="form-control" name="email" required value={formData.email} onChange={handleChange} />
          </div>

          <div className="form-group mb-3">
            <label>Password</label>
            <input type="password" className="form-control" name="password" required value={formData.password} onChange={handleChange} />
          </div>

          <input type="hidden" name="role" value={formData.role} />

          <button type="submit" className="btn w-100" style={{ backgroundColor: '#077a7d', color: 'white' }}>
            Register
          </button>
        </form>

        <p className="text-center mt-3">
          Already have an account?{' '}
          <Link to="/" className="text-decoration-none" style={{ color: '#077a7d' }}>
            Click to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;