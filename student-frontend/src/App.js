import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Hello from './components/Hello.js';
import LoginPage from './components/LoginPage.js';
import ProtectedRoutes from './components/ProtectedRoutes.js';
import RegisterPage from './components/RegisterPage.js';
import ScrollProgressBar from './components/ScrollProgressBar.js';
import StudentInfo from './components/StudentInfo.js';


function App() {
  return (
    <div className='app'>
      <ScrollProgressBar type="circle" position="bottom-right" color="#3b82f6" strokeSize={2} />
      <p>created by V.Vamsi Krishna(23N71A0558)</p>
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Hello />} />
        <Route 
          path="/student" 
          element={
            <ProtectedRoutes>
              <StudentInfo />
            </ProtectedRoutes>
          } 
        />
      </Routes>
    </Router>
    </div>
    
  );
}

export default App;
