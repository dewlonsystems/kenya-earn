// src/pages/Settings.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  useTheme,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function Settings() {
  const { profile, setProfile } = useAuth();
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Apply theme on mount or when profile changes
  useEffect(() => {
    if (profile?.theme_preference) {
      document.body.setAttribute('data-theme', profile.theme_preference);
    }
  }, [profile?.theme_preference]);

  const handleThemeChange = async (newTheme) => {
    try {
      await axios.put('http://localhost:8000/api/settings/', { theme_preference: newTheme });
      setProfile({ ...profile, theme_preference: newTheme });
      setMessage('Theme updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update theme:', error);
      setMessage('Failed to update theme.');
    }
  };

  const handleDeleteClick = () => {
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await axios.delete('http://localhost:8000/api/account/delete/');
      // Also delete Firebase user
      const { getAuth, deleteUser } = await import('firebase/auth');
      const { auth } = await import('../firebase');
      const user = auth.currentUser;
      if (user) {
        await deleteUser(user);
      }
      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Account deletion failed:', error);
      alert('Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteOpen(false);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="#1e3a8a">
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your theme and account settings.
        </Typography>
      </Box>

      {message && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {message}
        </Alert>
      )}

      {/* Theme Mode Card */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Appearance
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['light', 'dark', 'system'].map((mode) => (
            <Button
              key={mode}
              variant={profile?.theme_preference === mode ? 'contained' : 'outlined'}
              onClick={() => handleThemeChange(mode)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                minWidth: 120,
                backgroundColor:
                  profile?.theme_preference === mode
                    ? theme.palette.mode === 'dark'
                      ? '#3b82f6'
                      : '#2563eb'
                    : 'transparent',
                color:
                  profile?.theme_preference === mode
                    ? '#fff'
                    : theme.palette.mode === 'dark'
                    ? '#e2e8f0'
                    : '#4b5563',
                borderColor:
                  profile?.theme_preference === mode
                    ? 'transparent'
                    : theme.palette.mode === 'dark'
                    ? '#4b5563'
                    : '#d1d5db',
                '&:hover': {
                  backgroundColor:
                    profile?.theme_preference === mode
                      ? theme.palette.mode === 'dark'
                        ? '#2563eb'
                        : '#1d4ed8'
                      : theme.palette.mode === 'dark'
                      ? '#374151'
                      : '#f3f4f6',
                },
              }}
            >
              {mode === 'light'
                ? 'Light Mode'
                : mode === 'dark'
                ? 'Dark Mode'
                : 'Follow System'}
            </Button>
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Your preference will apply instantly.
        </Typography>
      </Paper>

      {/* Account Management */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          border: '1px solid #fecaca',
          backgroundColor: '#fef2f2',
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="#b91c1c" gutterBottom>
          Account Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Closing your account will permanently delete your data and history.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<WarningIcon />}
            onClick={handleDeleteClick}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Close Account
          </Button>
        </Box>
      </Paper>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to permanently delete your account? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Yes, Close My Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}