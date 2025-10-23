// src/pages/CompleteProfile.js
import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from './config';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  useTheme,
  CircularProgress,
  Backdrop,
  Fade,
  Avatar,
  IconButton,
} from '@mui/material';
import { CameraAlt as CameraIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export default function CompleteProfile() {
  const { currentUser, setProfile } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    city: '',
    address: '',
    profile_picture: '',
    referral_code: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Initialize from Firebase or empty
  useEffect(() => {
    if (currentUser) {
      const nameParts = (currentUser.displayName || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData((prev) => ({
        ...prev,
        first_name: firstName,
        last_name: lastName,
        phone_number: prev.phone_number || '',
        profile_picture: currentUser.photoURL || '',
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, etc.).');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const compressedFile = await compressImage(file, 300, 300);
      const storagePath = `profile_pictures/${currentUser.uid}/${Date.now()}_${file.name}`;
      const imageRef = storageRef(storage, storagePath);

      const uploadTask = uploadBytesResumable(imageRef, compressedFile);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          null,
          (error) => reject(error),
          () => resolve()
        );
      });

      const downloadURL = await getDownloadURL(imageRef);
      setFormData((prev) => ({ ...prev, profile_picture: downloadURL }));
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const compressImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.85
        );
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.first_name || !formData.last_name) {
      setError('Please enter your first and last name.');
      return;
    }
    if (!formData.phone_number || !formData.city || !formData.address) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/^\d{12}$/.test(formData.phone_number) || !formData.phone_number.startsWith('254')) {
      setError('Phone must be 12 digits and start with 254 (e.g. 254712345678)');
      return;
    }

    setSaving(true);
    setShowOverlay(true);

    try {
      const token = await currentUser.getIdToken();
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const res = await axios.post('${API_BASE_URL}/api/profile/complete/', {
        phone_number: formData.phone_number,
        city: formData.city,
        address: formData.address,
        profile_picture: formData.profile_picture,
        referral_code: formData.referral_code,
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
      setProfile(res.data);
      navigate('/activate');
    } catch (err) {
      console.error(err);
      setError('Couldn’t save your details. Please check your internet connection and try again.');
    } finally {
      setShowOverlay(false);
      setSaving(false);
    }
  };

  // Determine if name fields should be editable
  const isFirstNameEditable = !currentUser?.displayName;
  const isLastNameEditable = !currentUser?.displayName;

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          backgroundColor: '#fff',
          position: 'relative',
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="#1e3a8a" gutterBottom>
          Complete Your Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please confirm your details to continue.
        </Typography>

        {/* Profile Picture */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box
            onClick={handleImageClick}
            sx={{
              position: 'relative',
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.05)',
                transition: 'transform 0.2s',
              },
            }}
          >
            <Avatar
              src={formData.profile_picture || ''}
              alt="Profile"
              sx={{
                width: 100,
                height: 100,
                border: `2px solid ${theme.palette.divider}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: '#2563eb',
                borderRadius: '50%',
                p: 0.5,
              }}
            >
              <CameraIcon sx={{ fontSize: 16, color: 'white' }} />
            </Box>
          </Box>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </Box>

        {uploading && (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Uploading image...
            </Typography>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            name="first_name"
            label="First Name"
            fullWidth
            value={formData.first_name}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            required
            InputProps={{ readOnly: !isFirstNameEditable }}
          />
          <TextField
            name="last_name"
            label="Last Name"
            fullWidth
            value={formData.last_name}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            required
            InputProps={{ readOnly: !isLastNameEditable }}
          />
          <TextField
            fullWidth
            label="Email"
            value={currentUser?.email || ''}
            InputProps={{ readOnly: true }}
            margin="normal"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            name="phone_number"
            label="Phone Number (M-Pesa)"
            fullWidth
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="254712345678"
            margin="normal"
            variant="outlined"
            required
            helperText="Used for M-Pesa activation and payouts"
          />
          <TextField
            name="city"
            label="City/Town"
            fullWidth
            value={formData.city}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            required
          />
          <TextField
            name="address"
            label="Address"
            fullWidth
            multiline
            rows={3}
            value={formData.address}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            required
          />
          <TextField
            name="referral_code"
            label="Referral Code (Optional)"
            fullWidth
            value={formData.referral_code || ''}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            helperText="Enter a friend's code to support them"
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={saving || uploading}
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
              textTransform: 'none',
            }}
          >
            Save and Continue
          </Button>
        </form>
      </Paper>

      <Backdrop
        open={showOverlay}
        sx={{
          zIndex: 1500,
          color: '#fff',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <Fade in={showOverlay}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: '#2563eb', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Saving your details...
            </Typography>
          </Box>
        </Fade>
      </Backdrop>
    </Box>
  );
}