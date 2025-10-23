// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { auth } from '../firebase';
import {
  Button,
  Container,
  TextField,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Visibility,
  VisibilityOff,
  LockReset,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled background
const Background = styled('div')({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
});

// Styled login card
const LoginCard = styled('div')(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '20px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: '480px',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(0); // 0: Google, 1: Email, 2: Phone
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otp, setOtp] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/profile/complete');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        alert('✅ Verification email sent! Please check your inbox.');
        setIsSignUp(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/profile/complete');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handlePhoneLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const recaptchaVerifier = new window.RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
      const formattedPhone = phone.startsWith('0')
        ? `+254${phone.slice(1)}`
        : phone.startsWith('254')
        ? `+${phone}`
        : phone;
      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      setConfirmationResult(result);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to send SMS. Please check your number.');
      setLoading(false);
    }
  };

  const handleOtpConfirm = async () => {
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      navigate('/profile/complete');
    } catch (err) {
      setError('Invalid or expired code. Please try again.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
    } catch (err) {
      setError('No account found with that email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <LoginCard>
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="#2575fc">
          Kenya Earn
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          {isSignUp ? 'Create your account' : 'Sign in to continue'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Tabs
          value={mode}
          onChange={(e, newValue) => {
            setMode(newValue);
            setError('');
            setIsSignUp(false);
          }}
          centered
          variant="fullWidth"
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'medium',
            },
          }}
        >
          <Tab label="Google" />
          <Tab label="Email" />
          <Tab label="Phone" />
        </Tabs>

        {/* Google */}
        {mode === 0 && (
          <Box textAlign="center">
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{
                py: 1.5,
                borderColor: '#db4437',
                color: '#db4437',
                '&:hover': { borderColor: '#db4437', backgroundColor: 'rgba(219,68,55,0.04)' },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Continue with Google'}
            </Button>
          </Box>
        )}

        {/* Email/Password */}
        {mode === 1 && (
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleEmailLogin(); }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              variant="outlined"
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 2 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {!isSignUp && (
              <Box textAlign="right" sx={{ mt: 1 }}>
                <Button
                  startIcon={<LockReset />}
                  onClick={() => setForgotPasswordOpen(true)}
                  size="small"
                  sx={{ textTransform: 'none', fontSize: '0.875rem' }}
                >
                  Forgot Password?
                </Button>
              </Box>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
            >
              {loading ? <CircularProgress size={24} /> : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>

            <Box textAlign="center" sx={{ mt: 2 }}>
              <Button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                sx={{ textTransform: 'none', fontSize: '0.875rem' }}
              >
                {isSignUp
                  ? '← Already have an account? Sign in'
                  : "Don't have an account? Create one"}
              </Button>
            </Box>
          </Box>
        )}

        {/* Phone */}
        {mode === 2 && (
          <Box>
            {!confirmationResult ? (
              <>
                <TextField
                  fullWidth
                  label="Phone Number"
                  placeholder="e.g. 0712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  margin="normal"
                  required
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handlePhoneLogin}
                  disabled={loading || phone.length < 10}
                  sx={{ mt: 3, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Send SMS Code'}
                </Button>
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Enter 6-digit Code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  margin="normal"
                  required
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleOtpConfirm}
                  disabled={loading || otp.length < 6}
                  sx={{ mt: 3, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Verify Code'}
                </Button>
                <Button
                  fullWidth
                  onClick={() => {
                    setConfirmationResult(null);
                    setOtp('');
                    setError('');
                  }}
                  sx={{ mt: 2, textTransform: 'none' }}
                >
                  ← Back to Phone Input
                </Button>
              </>
            )}
          </Box>
        )}

        {/* Invisible Recaptcha */}
        <div id="recaptcha-container" style={{ marginTop: '20px' }}></div>
      </LoginCard>

      {/* Forgot Password Modal */}
      <Dialog open={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)}>
        <DialogTitle>Reset Your Password</DialogTitle>
        <DialogContent>
          {resetSent ? (
            <Typography color="success.main">
              ✅ Password reset email sent! Check your inbox.
            </Typography>
          ) : (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Email Address"
                type="email"
                fullWidth
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                variant="outlined"
              />
              {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotPasswordOpen(false)}>Cancel</Button>
          {!resetSent ? (
            <Button
              onClick={handleForgotPassword}
              disabled={loading || !resetEmail}
              variant="contained"
            >
              {loading ? <CircularProgress size={20} /> : 'Send Reset Link'}
            </Button>
          ) : (
            <Button onClick={() => setForgotPasswordOpen(false)} variant="contained">
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Background>
  );
}