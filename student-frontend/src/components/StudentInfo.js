import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import './StudentInfo.css';

function StudentInfo() {
  const navigate = useNavigate();
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

        const response = await axios.get(`http://localhost:5000/api/student/info/${user.rollNumber}`);
        if (response.data.success) {
          setStoredInfo(response.data.studentInfo);
        }
      } catch (error) {
        console.error('Error fetching stored info:', error);
      }
    };

    fetchStoredInfo();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const rollNumber = JSON.parse(localStorage.getItem('user')).rollNumber;
      const response = await axios.get(`http://localhost:5000/api/student/${rollNumber}`);
      setData(response.data);
      setShowMarks(!showMarks);
      if (showNotes) setShowNotes(false);
    } catch (err) {
      setError(err.message);
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
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handlePincodeChange = async (e) => {
    const pincode = e.target.value;
    setFormData(prevState => ({
      ...prevState,
      pincode: pincode
    }));

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

      const fullAddress = formData.houseNo && formData.buildingArea && formData.city && formData.pincode
        ? `${formData.houseNo}, ${formData.buildingArea}, ${formData.city} - ${formData.pincode}`
        : '';

      const response = await axios.put('http://localhost:5000/api/register', {
        phoneNumber: formData.phoneNumber || undefined,
        email: formData.email || undefined,
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
      const response = await axios.get(`http://localhost:5000/api/notes/${year}`);
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
                <div className="notes-list">
                  {notesList.map((note, index) => (
                    <a
                      key={index}
                      href={note.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="note-link"
                    >
                      {note.subject}
                    </a>
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
                      <td>{data.details.name}</td>
                      <td><strong>Roll Number:</strong></td>
                      <td>{data.details.rollNumber}</td>
                    </tr>
                    <tr>
                      <td><strong>College Code:</strong></td>
                      <td>{data.details.collegeCode}</td>
                      <td><strong>Father's Name:</strong></td>
                      <td>{data.details.fatherName}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {data.results.semesters.map((semester, index) => (
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
                      {semester.subjects.map((subject, subIndex) => (
                        <tr key={subIndex}>
                          <td>{subject.subjectCode}</td>
                          <td>{subject.subjectName}</td>
                          <td>{subject.internalMarks}</td>
                          <td>{subject.externalMarks}</td>
                          <td>{subject.totalMarks}</td>
                          <td className={subject.grades === 'F' ? 'failed-grade' : ''}>{subject.grades}</td>
                          <td>{subject.credits}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="7">
                          <div className="semester-summary">
                            <span><strong>SGPA:</strong> {semester.semesterSGPA}</span>
                            <span><strong>Credits:</strong> {semester.semesterCredits}</span>
                            <span><strong>Backlogs:</strong> {semester.backlogs}</span>
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
                  <span><strong>CGPA:</strong> {data.results.CGPA}</span>
                  <span><strong>Total Credits:</strong> {data.results.credits}</span>
                  <span><strong>Total Backlogs:</strong> {data.results.backlogs}</span>
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
