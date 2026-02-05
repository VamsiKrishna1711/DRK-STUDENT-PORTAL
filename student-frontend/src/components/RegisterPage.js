import { Button, CssVarsProvider, FormControl, FormLabel, Input, Link, Sheet, Typography } from '@mui/joy';
import axios from 'axios';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

function RegisterPage(props) {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    name: '',
    rollNumber: '',
    password: '',
    year: '',
    confirmPassword: ''
  });
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        name: formData.name,
        rollNumber: formData.rollNumber,
        year: parseInt(formData.year),
        password: formData.password
      });

      if (response.data.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setFormData({
          name: '',
          rollNumber: '',
          year: '',
          password: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || 'Registration failed');
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
    <main className="register-page-container">
      <div className="wave-elements">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
      
      <CssVarsProvider {...props}>
        <Sheet
          className="register-card"
          variant="outlined"
        >
          <div>
            <Typography level="h4" component="h1" className="register-title">
              Create Your Account
            </Typography>
            <Typography level="body-sm" className="register-subtitle">Register to access your student portal</Typography>
          </div>

          <form onSubmit={handleSubmit}>
            <FormControl className="form-control-custom">
              <FormLabel className="form-label-custom">Full Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                disabled={isLoading}
                className="input-custom"
              />
            </FormControl>

            <FormControl className="form-control-custom">
              <FormLabel className="form-label-custom">Roll Number</FormLabel>
              <Input
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="Enter your roll number"
                required
                disabled={isLoading}
                className="input-custom"
              />
            </FormControl>

            <FormControl className="form-control-custom">
              <FormLabel className="form-label-custom">Year</FormLabel>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="input-custom"
              >
                <option value="">Select your year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </FormControl>

            <FormControl className="form-control-custom">
              <FormLabel className="form-label-custom">Password</FormLabel>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                disabled={isLoading}
                className="input-custom"
              />
            </FormControl>

            <FormControl className="form-control-custom">
              <FormLabel className="form-label-custom">Confirm Password</FormLabel>
              <Input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
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

            {success && (
              <Typography 
                className="success-message"
              >
                {success}
              </Typography>
            )}

            <Button 
              type="submit" 
              loading={isLoading}
              fullWidth
              className="register-button"
            >
              {isLoading ? 'Registering...' : 'Create Account'}
            </Button>

            <Typography
              endDecorator={<Link href="/login">Log in</Link>}
              className="register-links"
              sx={{ alignSelf: 'center' }}
            >
              Already have an account?
            </Typography>
            <Typography
              endDecorator={<Link href="/">Home</Link>}
              className="register-links"
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

export default RegisterPage;
