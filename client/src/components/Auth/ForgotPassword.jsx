import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import Layout from '../Layout/Layout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('/users/forgot-password', { email });
      setMessage('Password reset instructions have been sent to your email address. Please check your inbox and spam folder.');
      
      // If we're in development and using Ethereal, show the preview URL
      if (response.data.previewUrl) {
        setMessage(prev => `${prev}\n\nDevelopment Mode: View the email at: ${response.data.previewUrl}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showContactInfo={false}>
      <Box className="form-container">
      <Container component="main" maxWidth="xs">
        <Paper elevation={6} className="form-paper" sx={{ p: 4 }}>
          <Box className="form-box">
            <Typography component="h1" variant="h4" className="form-title" sx={{ mb: 2 }}>
              Forgot Password
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
              Enter your email address and we'll send you instructions to reset your password
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {message && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                sx={{ mb: 2 }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 2 }}
                disabled={loading}
                className="form-button"
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Send Reset Instructions'
                )}
              </Button>
              
              <Box textAlign="center" sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/login" variant="body2">
                  Remember your password? Back to Login
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
    </Layout>
  );
};

export default ForgotPassword;