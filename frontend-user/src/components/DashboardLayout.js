// src/components/DashboardLayout.js
import React, { useState, useEffect } from 'react';
import API_BASE_URL from './config';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  CssBaseline,
  InputBase,
  Badge,
  alpha,
  Switch,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  AccountBalanceWallet as WalletIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Tasks', icon: <TaskIcon />, path: '/tasks' },
  { text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
  { text: 'Wallet', icon: <WalletIcon />, path: '/wallet' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const getPageTitle = (pathname) => {
  const item = menuItems.find((item) => item.path === pathname);
  return item ? item.text : 'Kenya Earn';
};

export default function DashboardLayout({ children }) {
  const { profile, setProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Set MUI theme based on profile
  useEffect(() => {
    if (profile?.theme_preference === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
    } else if (profile?.theme_preference === 'light') {
      document.body.setAttribute('data-theme', 'light');
    } else {
      // System default — let OS decide (we won’t force it in React)
      document.body.removeAttribute('data-theme');
    }
  }, [profile?.theme_preference]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    const { signOut } = await import('firebase/auth');
    const { auth } = await import('../firebase');
    await signOut(auth);
    navigate('/login');
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleThemeToggle = async () => {
    const newTheme = profile?.theme_preference === 'dark' ? 'light' : 'dark';
    try {
      await axios.put('${API_BASE_URL}/api/settings/', { theme_preference: newTheme });
      setProfile({ ...profile, theme_preference: newTheme });
    } catch (error) {
      console.error('Failed to update theme');
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // You can add real-time filtering later
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const pageTitle = getPageTitle(location.pathname);

  const drawer = (
    <Box sx={{ textAlign: 'center', pt: 2, pb: 2, backgroundColor: '#1e3a8a' }}>
      {/* Logo / App Name */}
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{ color: 'white', mb: 4, letterSpacing: 1 }}
      >
        Kenya Earn
      </Typography>
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.2)', mx: 2 }} />
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{
              color: 'white',
              mb: 1,
              mx: 2,
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderLeft: '4px solid #3b82f6',
              },
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.grey[100] }}>
      <CssBaseline />

      {/* AppBar (Topbar) */}
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
          color: theme.palette.mode === 'dark' ? '#fff' : '#000',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          {/* Hamburger for mobile */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Page Title */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {pageTitle}
          </Typography>

          {/* Search Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: alpha(theme.palette.common.black, 0.05),
              borderRadius: 2,
              px: 1,
              width: { xs: 0, sm: 'auto' },
              transition: 'width 300ms ease',
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.black, 0.1),
                width: { xs: 200, sm: 240 },
              },
            }}
          >
            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <InputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={handleSearch}
              sx={{ width: '100%', py: 0.8 }}
            />
          </Box>

          {/* Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            {/* Theme Toggle */}
            <IconButton onClick={handleThemeToggle} sx={{ mr: 1 }}>
              {profile?.theme_preference === 'dark' ? (
                <LightModeIcon />
              ) : (
                <DarkModeIcon />
              )}
            </IconButton>

            {/* Notifications */}
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* User Avatar */}
            <IconButton onClick={handleProfileMenuOpen}>
              <Avatar
                alt={profile?.first_name || 'User'}
                src={profile?.profile_picture || ''}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar (Drawer) */}
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better performance on mobile
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              backgroundColor: '#1e3a8a',
              color: 'white',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              backgroundColor: '#1e3a8a',
              color: 'white',
              boxSizing: 'border-box',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          backgroundColor: theme.palette.grey[100],
          minHeight: 'calc(100vh - 64px)',
          transition: 'all 0.3s ease',
        }}
      >
        {children}
      </Box>

      {/* User Menu Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            mt: 1.5,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => navigate('/profile')}>
          <ListItemIcon>
            <ProfileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}