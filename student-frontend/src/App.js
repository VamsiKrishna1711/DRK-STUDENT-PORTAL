import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Hello from './components/Hello.js';
import LoginPage from './components/LoginPage.js';
import RegisterPage from './components/RegisterPage.js';
import StudentInfo from './components/StudentInfo.js';
import ProtectedRoute from './components/ProtectedRoutes.js';

function App() {
  return (
    <div className='app'>
      <h>created by vamsi krishna</h>
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/student" element={<StudentInfo />} />
        <Route path="/" element={<Hello />} />
        <Route 
          path="/student" 
          element={
            <ProtectedRoute>
              <StudentInfo />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
    </div>
    
  );
}

export default App;
