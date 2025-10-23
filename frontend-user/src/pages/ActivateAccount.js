// src/pages/ActivateAccount.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Use live key from environment (or fallback if not set)
const PAYSTACK_PUBLIC_KEY = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || 'pk_live_8d069145e43375c34e41659f028f018b6a447072';

export default function ActivateAccount() {
  const { profile, setProfile } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile?.phone_number) {
      setPhone(profile.phone_number);
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.is_activated) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  const handleActivate = async () => {
    if (!/^\d{12}$/.test(phone) || !phone.startsWith('254')) {
      setError('Phone must be 12 digits and start with 254 (e.g. 254712345678)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/activate/', {
        phone_number: phone,
        email: profile?.email || 'user@example.com',
      });

      const { data } = res.data;

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        transaction: data.transaction,
        email: profile?.email || 'user@example.com',
        onSuccess: async (response) => {
          try {
            // Verify via backend (trust webhook more, but this gives instant UX)
            const verifyRes = await axios.get(`/api/verify-payment/${response.reference}/`);
            if (verifyRes.data.activated) {
              const profileRes = await axios.get('/api/profile/');
              setProfile(profileRes.data);
              setSuccess(true);
            } else {
              setError('Payment succeeded but activation is pending. Check back in a minute.');
            }
          } catch (err) {
            setError('Verification failed. But payment may have succeeded — check your dashboard.');
          }
          setLoading(false);
        },
        onCancel: () => {
          setError('Payment was cancelled.');
          setLoading(false);
        },
        onError: (error) => {
          console.error('Paystack error:', error);
          setError('An error occurred during payment. Please try again.');
          setLoading(false);
        },
      });
      handler.openIframe();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to start payment. Please try again.');
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          backgroundColor: '#fff',
        }}
      >
        {success ? (
          <Box sx={{ textAlign: 'center' }}>
            <CheckIcon sx={{ fontSize: 60, color: '#10b981', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" color="#10b981" gutterBottom>
              Payment successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your account has been activated.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard')}
              sx={{ textTransform: 'none', borderRadius: 2, px: 4 }}
            >
              Go to Dashboard
            </Button>
          </Box>
        ) : (
          <>
            <Typography variant="h5" fontWeight="bold" color="#1e3a8a" gutterBottom>
              Activate Your Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Pay a one-time fee of <strong>Ksh 300</strong> via M-Pesa to activate your account and start earning.
            </Typography>

            <TextField
              fullWidth
              label="M-Pesa Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="254712345678"
              margin="normal"
              variant="outlined"
              InputProps={{ sx: { borderRadius: 2 } }}
              helperText="Enter the phone number registered on your M-Pesa."
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={handleActivate}
              disabled={loading || phone.length < 12}
              sx={{
                mt: 3,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                textTransform: 'none',
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                  <span>Processing... (Check your phone)</span>
                </Box>
              ) : (
                'Pay Ksh 300 via M-Pesa'
              )}
            </Button>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, textAlign: 'center' }}
            >
              You’ll receive an STK Push on your phone to complete the payment.
            </Typography>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                onClick={handleSkip}
                disabled={loading}
                sx={{ textTransform: 'none', color: theme.palette.text.secondary }}
              >
                Skip to Dashboard
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}