// src/pages/DashboardOverview.js
import React, { useEffect, useState } from 'react';
import API_BASE_URL from './config';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  useTheme,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  AccountBalanceWallet as WalletIcon,
  North as NorthIcon,
  TaskAlt as TaskAltIcon,
  HourglassEmpty as HourglassIcon,
  Done as DoneIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Mock data for chart (replace with real API later)
const generateMockEarnings = () => {
  const data = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-KE', { weekday: 'short' }),
      earnings: Math.floor(Math.random() * 300) + 50,
    });
  }
  return data;
};

export default function DashboardOverview() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

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

  useEffect(() => {
    // In real app, fetch real data based on timeRange
    setChartData(generateMockEarnings());
  }, [timeRange]);

  // Dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 20) return 'Good evening';
    return 'Good night';
  };

  const getMotivationalLine = () => {
    const lines = [
      'Ready to earn today?',
      'Let’s make progress!',
      'Great things start with small tasks.',
      'Your next opportunity is waiting.',
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  };

  const handleActivateClick = () => {
    navigate('/activate');
  };

  const statCards = [
    {
      title: 'Total Tasks Completed',
      value: dashboardData?.stats?.completed_tasks || 0,
      icon: <CheckCircleIcon sx={{ fontSize: 30, color: '#10b981' }} />,
      color: '#dcfce7',
      border: '#10b981',
    },
    {
      title: 'Tasks Pending Review',
      value: dashboardData?.stats?.pending_tasks || 0,
      icon: <AccessTimeIcon sx={{ fontSize: 30, color: '#f59e0b' }} />,
      color: '#fef3c7',
      border: '#f59e0b',
    },
    {
      title: 'Earnings Balance',
      value: `KES ${(dashboardData?.stats?.total_earnings || 0).toFixed(2)}`,
      icon: <WalletIcon sx={{ fontSize: 30, color: '#3b82f6' }} />,
      color: '#dbeafe',
      border: '#3b82f6',
    },
    {
      title: 'Withdrawals Made',
      value: 0,
      icon: <NorthIcon sx={{ fontSize: 30, color: '#8b5cf6' }} />,
      color: '#ede9fe',
      border: '#8b5cf6',
    },
  ];

  // Mock recent activities
  const recentActivities = [
    { id: 1, action: 'Task submitted', time: '2 hours ago', status: 'pending' },
    { id: 2, action: 'Task approved', time: '1 day ago', status: 'approved' },
    { id: 3, action: 'Withdrawal requested', time: '3 days ago', status: 'pending' },
    { id: 4, action: 'Task rejected', time: '5 days ago', status: 'rejected' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <DoneIcon sx={{ color: '#10b981' }} />;
      case 'pending':
        return <HourglassIcon sx={{ color: '#f59e0b' }} />;
      case 'rejected':
        return <CloseIcon sx={{ color: '#ef4444' }} />;
      default:
        return <TaskAltIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography>Loading your dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Greeting Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {getGreeting()}, {profile?.first_name || 'User'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {getMotivationalLine()}
          </Typography>
        </Box>
        {profile?.profile_picture && (
          <Box
            component="img"
            src={profile.profile_picture}
            alt="Profile"
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: `2px solid ${theme.palette.divider}`,
            }}
          />
        )}
      </Box>

      {/* Activation Banner */}
      {!profile?.is_activated ? (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={handleActivateClick}>
              Activate Now
            </Button>
          }
          sx={{ mb: 3, borderRadius: 2 }}
        >
          Your account is not activated. Activate to unlock tasks and start earning.
        </Alert>
      ) : (
        <Alert
          severity="success"
          sx={{ mb: 3, borderRadius: 2, background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', color: 'white' }}
        >
          Your account status: Verified ✅
        </Alert>
      )}

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderLeft: `4px solid ${card.border}`,
                backgroundColor: card.color,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {card.icon}
                <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                  {card.value}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {card.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Earnings Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">
                Earnings Overview
              </Typography>
              <Box>
                {['week', 'month', 'year'].map((range) => (
                  <Button
                    key={range}
                    size="small"
                    variant={timeRange === range ? 'contained' : 'outlined'}
                    onClick={() => setTimeRange(range)}
                    sx={{ ml: 1, textTransform: 'capitalize' }}
                  >
                    {range}
                  </Button>
                ))}
              </Box>
            </Box>
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#3b82f6' }}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', height: '100%' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Recent Activities
              </Typography>
            </Box>
            <Divider />
            <List sx={{ p: 0 }}>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    {getStatusIcon(activity.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.action}
                    secondary={activity.time}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  />
                  <Chip
                    label={activity.status}
                    size="small"
                    color={getStatusColor(activity.status)}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ p: 2, pt: 0 }}>
              <Button
                size="small"
                onClick={() => navigate('/wallet')}
                sx={{ textTransform: 'none' }}
              >
                View All Transactions →
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Notifications / Announcements */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 2, backgroundColor: '#f0f9ff', borderRadius: '12px 12px 0 0' }}>
          <Typography variant="h6" fontWeight="bold">
            Announcements
          </Typography>
        </Box>
        <CardContent>
          <Alert
            severity="info"
            sx={{ mb: 1, borderRadius: 2 }}
            icon={false}
          >
            🎉 New task category added: Social Media Promotions! Earn up to KES 500 per post.
          </Alert>
          <Alert
            severity="warning"
            sx={{ borderRadius: 2 }}
            icon={false}
          >
            ⏳ Complete your profile to unlock higher-paying tasks.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}