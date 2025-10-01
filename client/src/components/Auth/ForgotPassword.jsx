import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout/Layout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('/users/forgot-password', { email });
      setMessage(response.data.message);
      setResetToken(response.data.resetToken); // This would be sent via email in production
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
        <Paper elevation={6} className="form-paper">
          <Box className="form-box">
            <Typography component="h1" variant="h4" className="form-title">
              Forgot Password
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
              Enter your email address and we'll send you a reset token
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

            {resetToken && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Reset Token: {resetToken}
                </Typography>
                <Typography variant="caption" display="block">
                  Copy this token and use it to reset your password. In production, this would be sent to your email.
                </Typography>
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
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
                className="form-button"
              >
                {loading ? 'Sending...' : 'Send Reset Token'}
              </Button>
              
              <Box textAlign="center">
                <Link component={RouterLink} to="/login" variant="body2">
                  Back to Login
                </Link>
              </Box>

              {resetToken && (
                <Box textAlign="center" sx={{ mt: 2 }}>
                  <Link component={RouterLink} to="/reset-password" variant="body2">
                    Reset Password with Token
                  </Link>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
    </Layout>
  );
};

export default ForgotPassword;