import React from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="btn"
      style={{
        backgroundColor: '#7ae2cf',
        color: '#06202b',
        float: 'right',
        marginBottom: '20px',
      }}
    >
      Logout
    </button>
  );
}

export default LogoutButton;