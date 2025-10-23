// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material'; // ✅ Correct import
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

// Custom Theme Provider that respects system preference
function AppWithTheme() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const getThemeMode = () => {
    const themeAttr = document.body.getAttribute('data-theme');
    if (themeAttr === 'dark') return 'dark';
    if (themeAttr === 'light') return 'light';
    return prefersDarkMode ? 'dark' : 'light';
  };

  const [mode, setMode] = React.useState(getThemeMode());

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setMode(getThemeMode());
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const theme = createTheme({
    palette: {
      mode: mode,
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWithTheme />
  </React.StrictMode>
);