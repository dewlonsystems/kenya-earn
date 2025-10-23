// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import CompleteProfile from './pages/CompleteProfile';
import ActivateAccount from './pages/ActivateAccount';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Wallet from './pages/Wallet';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/complete" element={<ProtectedRouteForIncompleteProfile><CompleteProfile /></ProtectedRouteForIncompleteProfile>} />
        <Route path="/activate" element={<ProtectedRoute><ActivateAccount /></ProtectedRoute>} />

        {/* Dashboard Layout Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardOverview />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute requireActivation={true}>
              <DashboardLayout>
                <Tasks />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Wallet />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function ProtectedRoute({ children, requireActivation = false }) {
  const { currentUser, profile } = useAuth();

  if (!currentUser) return <Navigate to="/login" />;
  if (requireActivation && (!profile || !profile.is_activated)) {
    return <Navigate to="/activate" />;
  }
  return children;
}

function ProtectedRouteForIncompleteProfile({ children }) {
  const { currentUser, profile } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  if (profile) return <Navigate to="/dashboard" />;
  return children;
}

export default App;