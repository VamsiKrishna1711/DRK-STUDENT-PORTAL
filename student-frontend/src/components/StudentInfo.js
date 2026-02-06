import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import API_URL from '../config/api.js';
import { BackgroundPaths } from './BackgroundPaths.js';
import { ShaderAnimation } from './ShaderAnimation.js';
import './StudentInfo.css';

function StudentInfo() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMarks, setShowMarks] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notesList, setNotesList] = useState([]);
  const [selectedYear, setSelectedYear] = useState(localStorage.getItem('selectedYear') || '1');
  const [storedInfo, setStoredInfo] = useState({
    phoneNumber: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    localStorage.setItem('selectedYear', year);
    if (showNotes) {
      fetchNotesForYear(year);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('selectedYear');
    navigate('/login');
  };

  useEffect(() => {
    const fetchStoredInfo = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.rollNumber) return;

        const response = await axios.get(`${API_URL}/api/student/info/${user.rollNumber}`);
        if (response.data.success) {
          setStoredInfo(response.data.studentInfo);
        }
      } catch (error) {
        console.error('Error fetching stored info:', error);
      }
    };

    fetchStoredInfo();
  }, []);

  // If navigated here with state.openNotes === true, open notes section
  useEffect(() => {
    if (location && location.state && location.state.openNotes) {
      setShowNotes(true);
      // fetch notes for the selected year
      fetchNotesForYear(selectedYear);
      // clear the navigation state so it doesn't reopen on refresh/navigation
      try {
        window.history.replaceState({}, document.title);
      } catch (e) {
        // ignore
      }
    }
  }, [location, selectedYear]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const rollNumber = user.rollNumber;
      if (!rollNumber) {
        setError('Roll number not found. Please login again.');
        return;
      }

      const response = await axios.get(`${API_URL}/api/student/${rollNumber}`);

      // Normalize backend response: supports both legacy (raw data) and new ({ success: true, data: {...} }) formats
      const payload = (response.data && response.data.data) ? response.data.data : response.data;
      if (!payload) {
        setError('No data returned from server');
        return;
      }

      setData(payload);
      setShowMarks(true);  // Explicitly show results instead of toggling
      if (showNotes) setShowNotes(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch student data');
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: '',
    houseNo: '',
    buildingArea: '',
    city: '',
    pincode: ''
  });

  const [submitStatus, setSubmitStatus] = useState({
    message: '',
    isError: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Trim all inputs except city (which is read-only)
    setFormData(prevState => ({
      ...prevState,
      [name]: name === 'city' ? value : value.trim()
    }));
  };

  const handlePincodeChange = async (e) => {
    const pincode = e.target.value;
    setFormData(prevState => ({
      ...prevState,
      pincode: pincode
    }));

    // Auto-fetch city when 6-digit pincode is entered
    if (pincode.length === 6) {
      try {
        const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
        if (response.data[0].Status === 'Success') {
          const city = response.data[0].PostOffice[0].District;
          setFormData(prevState => ({
            ...prevState,
            city: city
          }));
        }
      } catch (error) {
        console.error('Error fetching city:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ message: '', isError: false });

    try {
      const rollNumber = JSON.parse(localStorage.getItem('user'))?.rollNumber;

      if (!rollNumber) {
        setSubmitStatus({
          message: 'Roll number not found. Please login again.',
          isError: true
        });
        return;
      }

      const fullAddress = formData.houseNo.trim() && formData.buildingArea.trim() && formData.city.trim() && formData.pincode.trim()
        ? `${formData.houseNo.trim()}, ${formData.buildingArea.trim()}, ${formData.city.trim()} - ${formData.pincode.trim()}`
        : '';

      const response = await axios.put(`${API_URL}/api/register`, {
        phoneNumber: formData.phoneNumber ? formData.phoneNumber.trim() : undefined,
        email: formData.email ? formData.email.trim() : undefined,
        address: fullAddress || undefined,
        rollNumber
      });

      if (response.data.success) {
        setStoredInfo(prevState => ({
          ...prevState,
          phoneNumber: formData.phoneNumber || prevState.phoneNumber,
          email: formData.email || prevState.email,
          address: fullAddress || prevState.address
        }));

        setFormData({
          phoneNumber: '',
          email: '',
          houseNo: '',
          buildingArea: '',
          city: '',
          pincode: ''
        });

        setSubmitStatus({
          message: 'Information updated successfully!',
          isError: false
        });
      }
    } catch (error) {
      setSubmitStatus({
        message: error.response?.data?.message || 'Failed to update information',
        isError: true
      });
    }
  };

  const fetchNotesForYear = async (year) => {
    try {
      const response = await axios.get(`${API_URL}/api/notes/${year}`);
      if (response.data.success) {
        setNotesList(response.data.notes);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const fetchNotes = async () => {
    setShowNotes(!showNotes);
    if (showMarks) setShowMarks(false);

    if (!showNotes) {
      fetchNotesForYear(selectedYear);
    }
  };

  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');

  if (!localStorage.getItem('user')) {
    return null;
  }

  const shouldShowInput = (fieldName) => {
    return !storedInfo[fieldName];
  };

  return (
    <div className="student-page-container">
      <BackgroundPaths />
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
            <div className="year-selector">
              <label>Year: </label>
              <select value={selectedYear} onChange={handleYearChange} className="year-dropdown">
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
            <button className="home-button" onClick={() => navigate('/')}>
              Home
            </button>
          </div>
        </div>

        <ShaderAnimation />

        <div className="search-container">
          <div className="search-buttons-wrapper">
            <button onClick={fetchStudentData} className="search-button">
              Fetch academic results
            </button>
            <button onClick={fetchNotes} className="search-button">
              View notes
            </button>
          </div>

          {showNotes && (
            <div className="notes-container">
              <h3>Year {selectedYear} Notes</h3>
              {notesList.length > 0 ? (
                <div className="notes-grid">
                  {notesList.map((note, index) => (
                    <div key={index} className="note-card">
                      <a
                        href={note.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="note-link"
                      >
                        {note.subject}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No notes available for year {selectedYear}</p>
              )}
            </div>
          )}

          {loading && <p className="loading-text">Loading...</p>}
          {error && <p className="error-text">Error: {error}</p>}
          {showMarks && data && (
            <div className="result-container">
              <div className="student-details">
                <h2>Student Details</h2>
                <table className="details-table">
                  <tbody>
                    <tr>
                      <td><strong>Name:</strong></td>
                      <td>{(data.details && data.details.name) || (data.Details && data.Details.name) || 'N/A'}</td>
                      <td><strong>Roll Number:</strong></td>
                      <td>{(data.details && data.details.rollNumber) || (data.Details && data.Details.rollNumber) || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td><strong>College Code:</strong></td>
                      <td>{(data.details && data.details.collegeCode) || (data.Details && data.Details.collegeCode) || 'N/A'}</td>
                      <td><strong>Father's Name:</strong></td>
                      <td>{(data.details && data.details.fatherName) || (data.Details && data.Details.fatherName) || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {((data.results && data.results.semesters) || (data.Results && data.Results.semesters) || []).map((semester, index) => (
                <div key={index} className="semester-section">
                  <h3>Semester {semester.semester}</h3>
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Internal</th>
                        <th>External</th>
                        <th>Total</th>
                        <th>Grade</th>
                        <th>Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(semester.subjects || []).map((subject, subIndex) => (
                        <tr key={subIndex}>
                          <td>{subject.subjectCode || ''}</td>
                          <td>{subject.subjectName || ''}</td>
                          <td>{subject.internalMarks ?? ''}</td>
                          <td>{subject.externalMarks ?? ''}</td>
                          <td>{subject.totalMarks ?? ''}</td>
                          <td className={subject.grades === 'F' ? 'failed-grade' : ''}>{subject.grades ?? ''}</td>
                          <td>{subject.credits ?? ''}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="7">
                          <div className="semester-summary">
                            <span><strong>SGPA:</strong> {semester.semesterSGPA ?? 'N/A'}</span>
                            <span><strong>Credits:</strong> {semester.semesterCredits ?? 'N/A'}</span>
                            <span><strong>Backlogs:</strong> {semester.backlogs ?? 'N/A'}</span>
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ))}
              <div className="overall-summary">
                <h3>Overall Performance</h3>
                <div className="summary-details">
                  <span><strong>CGPA:</strong> {(data.results && data.results.CGPA) || (data.Results && data.Results.CGPA) || 'N/A'}</span>
                  <span><strong>Total Credits:</strong> {(data.results && data.results.credits) || (data.Results && data.Results.credits) || 'N/A'}</span>
                  <span><strong>Total Backlogs:</strong> {(data.results && data.results.backlogs) || (data.Results && data.Results.backlogs) || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="content-container">
        <h2>Additional Info</h2>

        <div className="stored-info">
          {storedInfo.phoneNumber && (
            <div className="info-display">
              <h3>Phone Number</h3>
              <p>{storedInfo.phoneNumber}</p>
            </div>
          )}
          {storedInfo.email && (
            <div className="info-display">
              <h3>Email</h3>
              <p>{storedInfo.email}</p>
            </div>
          )}
          {storedInfo.address && (
            <div className="info-display">
              <h3>Address</h3>
              <p>{storedInfo.address}</p>
            </div>
          )}
        </div>

        {(shouldShowInput('phoneNumber') || shouldShowInput('email') || shouldShowInput('address')) && (
          <form onSubmit={handleSubmit}>
            {shouldShowInput('phoneNumber') && (
              <div className="form-group">
                <h3>Phone Number</h3>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Enter phone number" className="form-input" />
              </div>
            )}
            {shouldShowInput('email') && (
              <div className="form-group">
                <h3>Email</h3>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email" className="form-input" />
              </div>
            )}
            {shouldShowInput('address') && (
              <>
                <div className="form-group">
                  <h3>House/Flat No</h3>
                  <input type="text" name="houseNo" value={formData.houseNo} onChange={handleChange} placeholder="Enter house/flat number" className="form-input" />
                </div>
                <div className="form-group">
                  <h3>Building Name, Area</h3>
                  <input type="text" name="buildingArea" value={formData.buildingArea} onChange={handleChange} placeholder="Enter building name and area" className="form-input" />
                </div>
                <div className="form-group">
                  <h3>Pincode</h3>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handlePincodeChange} placeholder="Enter 6-digit pincode" maxLength="6" className="form-input" />
                </div>
                <div className="form-group">
                  <h3>City</h3>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City (auto-filled from pincode)" className="form-input" readOnly />
                </div>
              </>
            )}
            {submitStatus.message && (
              <div className={`status-message ${submitStatus.isError ? 'error' : 'success'}`}>
                {submitStatus.message}
              </div>
            )}
            <button type="submit" className="submit-button">Submit</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default StudentInfo;
