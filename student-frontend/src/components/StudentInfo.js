// StudentInfo.js
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

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
    <div className="App">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
        <h1>Student Information</h1>
        <div>
          <span style={{ marginRight: '20px' }}>
            Welcome, {loggedInUser.name || 'Student'}
          </span>
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
          <button 
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'inherit',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: '10px',
            textDecoration: 'none'
          }}
          onClick={() => navigate('/')}
        > 
          Home
        </button>

        </div>
      </div>

      <div style={{ margin: '20px 0' }}>
        <input
          type="text"
          placeholder="Enter Roll Number"
          value={rollNumber}
          onChange={handleRollNumberChange}
          aria-label="Student Roll Number"
          style={{
            padding: '8px',
            marginRight: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <button 
          onClick={fetchStudentData}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Fetch Student Data
        </button>
      </div>
      
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {data && (
        <div className="result-container">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default StudentInfo;
