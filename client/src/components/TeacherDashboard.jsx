import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import LogoutButton from './Logout';

function TeacherDashboard() {
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ date: '', staffName: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleClearFilter = () => {
    setFilters({ date: '', staffName: '' });
    fetchRecords(1);
  };


  // Prevent browser back/forward navigation
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

  // Check user role and fetch records
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'teacher') {
      navigate('/');
    } else {
      (async () => {
        await fetchRecords(1);
      })();
    }
  }, [navigate]);

  const fetchRecords = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: pagination.limit,
      };
      if (filters.date) params.date = filters.date;
      if (filters.staffName) params.staffName = filters.staffName;

      const res = await axios.get('/attendance/records', { params });

      setRecords(res.data.records);
      setPagination({
        page: res.data.pagination.page,
        limit: res.data.pagination.limit,
        totalPages: res.data.pagination.totalPages,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = e => {
    e.preventDefault();
    fetchRecords(1);
  };

  const handlePageChange = newPage => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchRecords(newPage);
    }
  };

  const handleDownload = async () => {
    try {
      const params = {};
      if (filters.date) params.date = filters.date;
      if (filters.staffName) params.staffName = filters.staffName;

      const res = await axios.get('/attendance/export', {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_records.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download Excel');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Teacher Dashboard - Attendance Records</h2>

      {/* Filter and logout */}
      <form onSubmit={handleFilterSubmit} style={{ marginBottom: '20px' }}>
        <label>
          Date:
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            style={{ marginLeft: '10px', marginRight: '20px' }}
          />
        </label>

        <label>
          Staff Name:
          <input
            type="text"
            name="staffName"
            value={filters.staffName}
            onChange={handleFilterChange}
            placeholder="Staff Name"
            style={{ marginLeft: '10px', marginRight: '20px' }}
          />
        </label>

        <button type="submit">Filter</button>
        <button type="button" onClick={handleClearFilter} style={{ marginLeft: '10px' }}>
          Clear Filter
        </button>
        <button type="button" onClick={handleDownload} style={{ marginLeft: '10px' }}>
          Download Excel
        </button>
           <LogoutButton />
      </form>

      {/* Loading and error */}
      {loading && <p>Loading records...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Attendance Table */}
      <table border="1" cellPadding="8" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Email</th>
            <th>In Time (IST)</th>
            <th>Out Time (IST)</th>
            <th>Topic</th>
            <th>Staff Name</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>
                No records found
              </td>
            </tr>
          ) : (
            records.map(record => (
              <tr key={record._id}>
                <td>{record.studentId?.name || 'N/A'}</td>
                <td>{record.studentId?.email || 'N/A'}</td>
                <td>{new Date(record.intime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                <td>{new Date(record.outtime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                <td>{record.topic}</td>
                <td>{record.staffName}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          style={{ marginRight: '10px' }}
        >
          Prev
        </button>

        Page {pagination.page} of {pagination.totalPages}

        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          style={{ marginLeft: '10px' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default TeacherDashboard;
