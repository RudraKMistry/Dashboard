import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useSettings } from './hooks/useData';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/Login/LoginPage';
import HomePage from './pages/Home/HomePage';
import FinancePage from './pages/Finance/FinancePage';
import TasksPage from './pages/Tasks/TasksPage';
import RoutinePage from './pages/Routine/RoutinePage';
import HabitsPage from './pages/Habits/HabitsPage';
import CalendarPage from './pages/Calendar/CalendarPage';
import NotesPage from './pages/Notes/NotesPage';
import SettingsPage from './pages/Settings/SettingsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null; // Or a loading spinner

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    document.documentElement.className = `theme-${settings.themeMode || 'dark'} accent-${settings.accentColor || 'blue'} intensity-${settings.scrollAnimationIntensity || 'prominent'} glass-${settings.glassIntensity || 'frosted'} spacing-${settings.layoutSpacing || 'normal'}`;
    
    // Apply Typography
    const fontName = settings.typography || 'Inter';
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@300;400;500;600;700;800&display=swap`;
    let link = document.getElementById('dynamic-font');
    if (!link) {
      link = document.createElement('link');
      link.id = 'dynamic-font';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = fontUrl;
    document.documentElement.style.setProperty('--font-family', `"${fontName}", sans-serif`);

    // Apply Background
    if (settings.dashboardBgType === 'custom' && settings.dashboardBgCustomUrl) {
      document.body.style.backgroundImage = `url(${settings.dashboardBgCustomUrl})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    } else if (settings.dashboardBgType === 'preset') {
      const presets = {
        mesh: 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,0.2) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,0.2) 0, transparent 50%)',
        waves: 'linear-gradient(180deg, #121214 0%, #1a1a2e 100%)',
        particles: 'radial-gradient(circle at center, #1C1C21 0%, #121214 100%)'
      };
      document.body.style.backgroundImage = presets[settings.dashboardBgPreset || 'mesh'];
      document.body.style.backgroundSize = '100% 100%';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.style.backgroundImage = 'none';
      document.body.style.backgroundSize = 'auto';
    }
  }, [
    settings.themeMode, settings.accentColor, settings.scrollAnimationIntensity, 
    settings.glassIntensity, settings.layoutSpacing, settings.typography,
    settings.dashboardBgType, settings.dashboardBgPreset, settings.dashboardBgCustomUrl
  ]);

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<HomePage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="routine" element={<RoutinePage />} />
        <Route path="habits" element={<HabitsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
