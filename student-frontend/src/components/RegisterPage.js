import { Button, CssVarsProvider, FormControl, FormLabel, Input, Link, Sheet, Typography } from '@mui/joy';
import axios from 'axios';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterPage(props) {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    name: '',
    rollNumber: '',
    password: '',
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
    // Clear any previous errors when user starts typing
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    

    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        name: formData.name,
        rollNumber: formData.rollNumber,
        password: formData.password
      });

      if (response.data.success) {
        setSuccess('Registration successful! Redirecting to login...');
        // Clear form
        setFormData({
          name: '',
          rollNumber: '',
          password: '',
          confirmPassword: ''
        });
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      if (error.response) {
        // Server responded with an error
        setError(error.response.data.message || 'Registration failed');
      } else if (error.request) {
        // Request was made but no response received
        setError('No response from server. Please try again.');
      } else {
        // Something else went wrong
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <CssVarsProvider {...props}>
        <Sheet
          sx={{
            width: 500,
            mx: 'auto',
            my: 4,
            py: 3,
            px: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderRadius: 'sm',
            boxShadow: 'md',
          }}
          variant="outlined"
        >
          <div>
            <Typography level="h4" component="h1">
              <b>Welcome!</b>
            </Typography>
            <Typography level="body-sm">Sign up to continue.</Typography>
          </div>

          <form onSubmit={handleSubmit}>
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Full Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                disabled={isLoading}
              />
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Roll Number</FormLabel>
              <Input
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="Enter your roll number"
                required
                disabled={isLoading}
              />
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Password</FormLabel>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                disabled={isLoading}
              />
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
              />
            </FormControl>

            {error && (
              <Typography 
                color="danger" 
                sx={{ mt: 1, mb: 2, textAlign: 'center' }}
              >
                {error}
              </Typography>
            )}

            {success && (
              <Typography 
                color="success" 
                sx={{ mt: 1, mb: 2, textAlign: 'center' }}
              >
                {success}
              </Typography>
            )}

            <Button 
              type="submit" 
              loading={isLoading}
              fullWidth
              sx={{ mb: 2 }}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>

            <Typography
              endDecorator={<Link href="/login">Log in</Link>}
              sx={{ alignSelf: 'center' }}
            >
              Already have an account?
            </Typography>
            <Typography
              endDecorator={<Link href="/">Home</Link>}
              sx={{ alignSelf: 'center' }}
            >
            </Typography>
          </form>
        </Sheet>
      </CssVarsProvider>
    </main>
  );
}

export default RegisterPage;
