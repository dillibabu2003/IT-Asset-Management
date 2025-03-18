import  { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import axiosInstance from '../utils/axios';
import { Link, useParams } from 'react-router';
import Icon from '../components/Icon';

function ForgotPassword({ onBack, onSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const {email,code}=useParams();
  const validatePassword = (value) => {
    if (value.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(value)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(value)) {
      return 'Password must contain at least one number';
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordValidation = validatePassword(password);
    setPasswordError(passwordValidation);
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    } else {
      setConfirmPasswordError('');
    }
    if (passwordValidation) {
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.patch('/auth/forgot-password', {
        new_password: password,
        encrypted_email: email,
        encrypted_code: code
      });
      await new Promise(resolve =>setTimeout(resolve, 1000));
      setNotification({
        open: true,
        message: 'Password has been reset successfully!',
        severity: 'success',
      });
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      setNotification({
        open: true,
        message: error.response.data.message||'Failed to reset password. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ height: '100vh', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
          opacity: 0.1,
          zIndex: -1,
        }}
      />
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Link to="/login">
        <Button
          startIcon={<Icon name="arrow-left" size={18} />}
          onClick={onBack}
          sx={{ position: 'absolute', top: 24, left: 24 }}
        >
          Back to Sign In
        </Button>
        </Link>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 440,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h4" fontWeight="700" gutterBottom>
              Reset Password
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please enter your new password
            </Typography>
          </Box>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <TextField
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              required
              fullWidth
              error={!!passwordError}
              helperText={passwordError}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <Icon name="eye-off" size={18} /> : <Icon name="eye" size={18} />}
                  </IconButton>
                ),
              }}
            />

            <TextField
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
              fullWidth
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <Icon name="eye-off" size={18} /> : <Icon name="eye" size={18} />}
                  </IconButton>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
          </form>
        </Paper>
      </Box>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          // severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
ForgotPassword.propTypes = {
  onBack: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default ForgotPassword;
