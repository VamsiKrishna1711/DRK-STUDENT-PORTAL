import { Button, CssVarsProvider, FormControl, FormLabel, Input, Link, Sheet, Typography } from '@mui/joy';
import axios from 'axios';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage(props) {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    rollNumber: '',
    password: ''
  });
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // Check if user is already logged in
  React.useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      navigate('/'); // Redirect to home if already logged in
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear any previous errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        rollNumber: formData.rollNumber,
        password: formData.password
      });

      if (response.data.success) {
        // Store user data in localStorage
        const userData = {
          ...response.data.student,  // includes name, rollNumber, courseName
        };
        localStorage.setItem('user', JSON.stringify(userData));
       // Add this temporarily to check the stored data
      console.log('Stored user data:', JSON.parse(localStorage.getItem('user')));

        
        // Clear form
        setFormData({
          rollNumber: '',
          password: ''
        });

        // Redirect to student page instead of home
        navigate('/student');
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || 'Login failed');
      } else if (error.request) {
        setError('No response from server. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page-container">
      {/* Animated particles */}
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      
      <CssVarsProvider {...props}>
        <Sheet
          className="login-card"
          variant="outlined"
        >
          <div>
            <Typography level="h4" component="h1" className="login-title">
              Welcome to DRK Student Portal
            </Typography>
            <Typography level="body-sm" className="login-subtitle">Sign in to continue to your dashboard</Typography>
          </div>

          <form onSubmit={handleSubmit}>
            <FormControl className="form-control-custom">
              <FormLabel className="form-label-custom">Roll Number</FormLabel>
              <Input
                name="rollNumber"
                type="text"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="Enter your roll number"
                required
                disabled={isLoading}
                className="input-custom"
              />
            </FormControl>

            <FormControl className="form-control-custom">
              <FormLabel className="form-label-custom">Password</FormLabel>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                className="input-custom"
              />
            </FormControl>

            {error && (
              <Typography 
                className="error-message"
              >
                {error}
              </Typography>
            )}

            <Button 
              type="submit" 
              loading={isLoading}
              fullWidth
              className="login-button"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            <Typography
              endDecorator={<Link href="/register">Sign up</Link>}
              className="login-links"
              sx={{ alignSelf: 'center' }}
            >
              Don't have an account?
            </Typography>
            <Typography
              endDecorator={<Link href="/">Home</Link>}
              className="login-links"
              sx={{ alignSelf: 'center', mt: 1 }}
            >
              Return to
            </Typography>
          </form>
        </Sheet>
      </CssVarsProvider>
    </main>
  );
}

export default LoginPage;