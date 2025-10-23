// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from './config';
import { Container, Typography, Box, Button, Alert, Paper, Grid } from '@mui/material';

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('${API_BASE_URL}/api/dashboard/');
        setDashboardData(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchDashboard();
    }
  }, [profile]);

  const handleActivateClick = () => {
    navigate('/activate');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography>Loading dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Activation Banner */}
      {!profile?.is_activated ? (
        <Alert severity="warning" action={
          <Button color="inherit" size="small" onClick={handleActivateClick}>
            Activate Now
          </Button>
        }>
          Your account is not active. Activate to unlock tasks and start earning.
        </Alert>
      ) : (
        <Alert severity="success">
          Account verified ✅
        </Alert>
      )}

      {/* Greeting */}
      <Typography variant="h4" sx={{ mt: 3, mb: 4 }}>
        {dashboardData?.greeting || `Welcome back, ${profile?.first_name || 'User'}`}
      </Typography>

      {/* Stats Summary */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{dashboardData?.stats?.completed_tasks || 0}</Typography>
            <Typography variant="body2">Completed Tasks</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{dashboardData?.stats?.pending_tasks || 0}</Typography>
            <Typography variant="body2">Pending Tasks</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">KES {dashboardData?.stats?.total_earnings?.toFixed(2) || '0.00'}</Typography>
            <Typography variant="body2">Total Earnings</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">0</Typography>
            <Typography variant="body2">Withdrawals</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          onClick={() => navigate('/tasks')}
          disabled={!profile?.is_activated}
          sx={{ mr: 2 }}
        >
          View Tasks
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/wallet')}
          disabled={!profile?.is_activated}
        >
          Wallet
        </Button>
      </Box>
    </Container>
  );
}