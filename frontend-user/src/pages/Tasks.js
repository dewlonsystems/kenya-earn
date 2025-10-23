// src/pages/Tasks.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  Alert,
  useTheme,
  Divider,
  Chip,
} from '@mui/material';
import { Check as CheckIcon, HourglassEmpty as HourglassIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TABS = ['available', 'pending', 'submitted', 'approved', 'rejected'];

export default function Tasks() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Hooks are now at the top — no early return before them

  useEffect(() => {
    if (!profile?.is_activated) {
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      setLoading(true);
      setError('');
      try {
        const status = TABS[activeTab];
        const res = await axios.get(`https://kenya-earn-backend.onrender.com/api/tasks/?status=${status}`);
        setTasks(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [activeTab, profile?.is_activated]);

  // Early return for non-activated users (after hooks)
  if (profile && !profile.is_activated) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center', py: 6 }}>
        <Alert
          severity="error"
          sx={{
            borderRadius: 2,
            border: '1px solid #fecaca',
            backgroundColor: '#fef2f2',
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="#b91c1c" gutterBottom>
            Account Not Activated
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Please activate with Ksh 300 to access tasks.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/activate')}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Activate Now
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Skip to Dashboard
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  const handleAccept = async (taskId) => {
    try {
      await axios.post(`https://kenya-earn-backend.onrender.com/api/tasks/${taskId}/submit/`);
      const status = TABS[activeTab];
      const res = await axios.get(`https://kenya-earn-backend.onrender.com/api/tasks/?status=${status}`);
      setTasks(res.data);
    } catch (error) {
      alert('Failed to accept task. Please try again.');
    }
  };

  const handleSubmit = async (taskId) => {
    try {
      const res = await axios.get(`https://kenya-earn-backend.onrender.com/api/tasks/?status=pending`);
      setTasks(res.data);
      setActiveTab(TABS.indexOf('submitted'));
    } catch (error) {
      alert('Failed to submit task.');
    }
  };

  const getTabLabel = (tab) => {
    switch (tab) {
      case 'available': return 'Available';
      case 'pending': return 'Pending';
      case 'submitted': return 'Submitted';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return tab;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckIcon fontSize="small" />;
      case 'pending': return <HourglassIcon fontSize="small" />;
      case 'rejected': return <CloseIcon fontSize="small" />;
      default: return null;
    }
  };

  // Show loading or content
  if (loading && profile?.is_activated) {
    return <Typography sx={{ mt: 4 }}>Loading tasks...</Typography>;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="#1e3a8a">
          Tasks
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your available and ongoing tasks.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 'medium',
            borderRadius: '20px',
            mr: 1,
            color: theme.palette.text.secondary,
          },
          '& .Mui-selected': {
            color: '#fff',
            backgroundColor: '#2563eb',
          },
        }}
        TabIndicatorProps={{ style: { display: 'none' } }}
      >
        {TABS.map((tab) => (
          <Tab key={tab} label={getTabLabel(tab)} />
        ))}
      </Tabs>

      {/* Task Cards */}
      {tasks.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: '#f9fafb',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No tasks found.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tasks.map((task) => (
            <Paper
              key={task.id}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                borderLeft: activeTab === 0 ? '4px solid #3b82f6' : 
                          activeTab === 1 ? '4px solid #f59e0b' :
                          activeTab === 2 ? '4px solid #9ca3af' :
                          activeTab === 3 ? '4px solid #10b981' :
                          '4px solid #ef4444',
                backgroundColor: '#fff',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateX(4px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {task.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {task.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Posted: {new Date(task.created_at).toLocaleDateString('en-KE')}
                    {task.expires_at && ` • Expires: ${new Date(task.expires_at).toLocaleDateString('en-KE')}`}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Chip
                    icon={getStatusIcon(task.status)}
                    label={`KES ${task.reward_amount}`}
                    size="small"
                    color={getStatusColor(task.status)}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {activeTab === 0 && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleAccept(task.id)}
                    sx={{ textTransform: 'none', borderRadius: 1 }}
                  >
                    Start Task
                  </Button>
                )}
                {activeTab === 1 && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleSubmit(task.id)}
                    sx={{ textTransform: 'none', borderRadius: 1 }}
                  >
                    Submit Work
                  </Button>
                )}
                {activeTab === 2 && (
                  <Typography variant="body2" color="text.secondary">
                    Awaiting approval
                  </Typography>
                )}
                {activeTab === 3 && (
                  <Typography variant="body2" color="success.main">
                    Approved • Reward credited
                  </Typography>
                )}
                {activeTab === 4 && (
                  <Typography variant="body2" color="error.main">
                    Rejected by admin
                    {task.rejection_reason && `: ${task.rejection_reason}`}
                  </Typography>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Footer */}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
        All tasks are reviewed by admin before approval.
      </Typography>
    </Box>
  );
}