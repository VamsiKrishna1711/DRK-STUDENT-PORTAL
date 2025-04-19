// StudentInfo.js
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import './StudentInfo.css';

function StudentInfo() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rollNumber, setRollNumber] = useState('');

  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  const handleRollNumberChange = (e) => {
    setRollNumber(e.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem('user'); // Remove user from localStorage
    navigate('/login'); // Redirect to login page
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/api/student/${rollNumber}`);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get logged in user's info
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');

  
  if (!localStorage.getItem('user')) {
    return null; 
  }

  return (
    <div className="student-page-container">
      {/* Decorative elements */}
      <div className="decorative-elements">
        <div className="decorative-element"></div>
        <div className="decorative-element"></div>
        <div className="decorative-element"></div>
      </div>
      
      <div className="content-container">
        <div className="header-container">
          <h1 className="page-title">Student Information</h1>
          <div className="user-info">
            <span className="welcome-text">
              Welcome, {loggedInUser.name || 'Student'}
            </span>
            <button 
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
            <button 
              className="home-button"
              onClick={() => navigate('/')}
            > 
              Home
            </button>
          </div>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Enter Roll Number"
            value={rollNumber}
            onChange={handleRollNumberChange}
            aria-label="Student Roll Number"
            className="search-input"
          />
          <button 
            onClick={fetchStudentData}
            className="search-button"
          >
            Fetch Student Data
          </button>
        </div>
        
        {loading && <p className="loading-text">Loading...</p>}
        {error && <p className="error-text">Error: {error}</p>}
        {data && (
          <div className="result-container">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentInfo;