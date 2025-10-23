// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import API_BASE_URL from './config';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  IconButton,
  Alert,
  useTheme,
  useMediaQuery,
  Divider,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon, Check as CheckIcon, Close as CloseIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function Profile() {
  const { profile: initialProfile, setProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (initialProfile) {
      setFormData({
        first_name: initialProfile.first_name || '',
        last_name: initialProfile.last_name || '',
        email: initialProfile.email || '',
        phone_number: initialProfile.phone_number || '',
        city: initialProfile.city || '',
        address: initialProfile.address || '',
        profile_picture: initialProfile.profile_picture || '',
      });
    }
  }, [initialProfile]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel: reset to original
      setFormData({
        first_name: initialProfile.first_name || '',
        last_name: initialProfile.last_name || '',
        email: initialProfile.email || '',
        phone_number: initialProfile.phone_number || '',
        city: initialProfile.city || '',
        address: initialProfile.address || '',
        profile_picture: initialProfile.profile_picture || '',
      });
      setMessage('');
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setMessage('');
    try {
      const res = await axios.put('${API_BASE_URL}/api/profile/', {
        phone_number: formData.phone_number,
        city: formData.city,
        address: formData.address,
        profile_picture: formData.profile_picture,
      });
      setProfile(res.data);
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Failed to update profile. Please try again.');
    }
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(initialProfile?.referral_code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!initialProfile) {
    return <Typography>Loading profile...</Typography>;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            My Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your account details and preferences.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={isEditing ? <CheckIcon /> : <EditIcon />}
          onClick={handleEditToggle}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </Box>

      {message && (
        <Alert
          severity={message.includes('success') ? 'success' : 'error'}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {message}
        </Alert>
      )}

      {/* Two-column layout */}
      <Box sx={{ display: 'flex', gap: 3, flexDirection: isMobile ? 'column' : 'row' }}>
        {/* Personal Information */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 3,
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Personal Information
          </Typography>

          {/* Profile Picture */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={formData.profile_picture || ''}
              alt="Profile"
              sx={{ width: 100, height: 100, mb: 2, border: `2px solid ${theme.palette.divider}` }}
            />
            {isEditing && (
              <TextField
                fullWidth
                label="Profile Picture URL"
                name="profile_picture"
                value={formData.profile_picture}
                onChange={handleChange}
                size="small"
                sx={{ maxWidth: 300 }}
              />
            )}
          </Box>

          {/* Form Fields */}
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="First Name"
              name="first_name"
              value={formData.first_name}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Email Address"
              name="email"
              value={formData.email}
              InputProps={{ readOnly: true }}
              fullWidth
              helperText="Verified via Firebase"
            />
            <TextField
              label="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              fullWidth
              disabled={!isEditing}
            />
            <TextField
              label="City/Town"
              name="city"
              value={formData.city}
              onChange={handleChange}
              fullWidth
              disabled={!isEditing}
            />
            <TextField
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              disabled={!isEditing}
            />
          </Box>
        </Paper>

        {/* Account & Referral */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 3,
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            mt: isMobile ? 3 : 0,
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Account & Referral Details
          </Typography>

          {/* Referral Code */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Your Referral Code
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                backgroundColor: '#f0f9ff',
                borderRadius: 2,
                border: '1px solid #dbeafe',
              }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ mr: 1 }}>
                {initialProfile.referral_code}
              </Typography>
              <Tooltip title={copied ? 'Copied!' : 'Copy'} arrow>
                <IconButton onClick={handleCopyReferral}>
                  <CopyIcon fontSize="small" color="primary" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Invite friends and earn when they join using your code.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Payment Method */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Payment Method
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                borderColor: '#cbd5e1',
                backgroundColor: '#fafafa',
              }}
            >
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                M-Pesa
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  label="M-Pesa Phone Number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  size="small"
                />
              ) : (
                <Typography variant="body2">
                  {formData.phone_number || 'Not set'}
                </Typography>
              )}
            </Paper>
            {/* In future: add Bank option with conditional fields */}
          </Box>
        </Paper>
      </Box>

      {/* Footer: timestamps */}
      <Box sx={{ mt: 4, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary">
          Account created: {new Date(initialProfile.created_at).toLocaleString('en-KE')} •{' '}
          Last updated: {new Date(initialProfile.updated_at).toLocaleString('en-KE')}
        </Typography>
      </Box>
    </Box>
  );
}