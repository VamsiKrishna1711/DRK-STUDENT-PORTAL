import { Button, CssVarsProvider, FormControl, FormLabel, Input, Link, Sheet, Typography } from '@mui/joy';
import axios from 'axios';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

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
        localStorage.setItem('user', JSON.stringify(response.data.student));
        
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
    <main>
      <CssVarsProvider {...props}>
        <Sheet
          sx={{
            width: 300,
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
              <b>Welcome back!</b>
            </Typography>
            <Typography level="body-sm">Sign in to continue.</Typography>
          </div>

          <form onSubmit={handleSubmit}>
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Roll Number</FormLabel>
              <Input
                name="rollNumber"
                type="text"
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
                placeholder="Enter your password"
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

            <Button 
              type="submit" 
              loading={isLoading}
              fullWidth
              sx={{ mb: 2 }}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            <Typography
              endDecorator={<Link href="/register">Sign up</Link>}
              sx={{ alignSelf: 'center' }}
            >
              Don't have an account?
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

export default LoginPage;
