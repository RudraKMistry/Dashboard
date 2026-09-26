import { useState } from 'react';
import { useSettings } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import './SettingsPage.css';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { changePassword } = useAuth();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  
  const [name, setName] = useState(settings.name || '');
  const [pomodoroWork, setPomodoroWork] = useState(settings.pomodoroWork || 25);
  const [pomodoroBreak, setPomodoroBreak] = useState(settings.pomodoroBreak || 5);
  const [notifications, setNotifications] = useState(settings.notifications ?? true);
  const [animationSpeed, setAnimationSpeed] = useState(settings.animationSpeed || 'normal');
  const [scrollAnimationsEnabled, setScrollAnimationsEnabled] = useState(settings.scrollAnimationsEnabled ?? true);
  const [scrollAnimationIntensity, setScrollAnimationIntensity] = useState(settings.scrollAnimationIntensity || 'prominent');
  const [themeMode, setThemeMode] = useState(settings.themeMode || 'dark');
  const [accentColor, setAccentColor] = useState(settings.accentColor || 'blue');
  const [dashboardWidgets, setDashboardWidgets] = useState(settings.dashboardWidgets || {
    tasks: true, habits: true, bills: true, transactions: true, monthlyOverview: true, routine: true
  });
  const [sidebarPages, setSidebarPages] = useState(settings.sidebarPages || {
    finance: true, tasks: true, routine: true, habits: true, calendar: true, notes: true
  });
  const [glassIntensity, setGlassIntensity] = useState(settings.glassIntensity || 'frosted');
  const [layoutSpacing, setLayoutSpacing] = useState(settings.layoutSpacing || 'normal');
  const [typography, setTypography] = useState(settings.typography || 'Inter');
  const [dashboardBgType, setDashboardBgType] = useState(settings.dashboardBgType || 'none');
  const [dashboardBgPreset, setDashboardBgPreset] = useState(settings.dashboardBgPreset || 'mesh');
  const [dashboardBgCustomUrl, setDashboardBgCustomUrl] = useState(settings.dashboardBgCustomUrl || '');
  const [currency, setCurrency] = useState(settings.currency || 'USD');
  const [dateFormat, setDateFormat] = useState(settings.dateFormat || 'MM/DD/YYYY');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [installMsg, setInstallMsg] = useState({ text: '', type: '' });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [saveStatus, setSaveStatus] = useState('');

  const handleSaveProfile = () => {
    updateSettings({ 
      name, pomodoroWork, pomodoroBreak, notifications, animationSpeed,
      scrollAnimationsEnabled, scrollAnimationIntensity, themeMode, accentColor, dashboardWidgets, sidebarPages,
      glassIntensity, layoutSpacing, typography, dashboardBgType, dashboardBgPreset, dashboardBgCustomUrl,
      currency, dateFormat
    });
    setSaveStatus('Saved!');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setPasswordMsg({ text: 'Please enter a new password', type: 'error' });
      return;
    }
    const res = await changePassword(newPassword);
    if (res.success) {
      setPasswordMsg({ text: 'Password updated successfully!', type: 'success' });
      setNewPassword('');
    } else {
      setPasswordMsg({ text: res.error || 'Failed to update password', type: 'error' });
    }
  };

  const handleNotificationRequest = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotifications(true);
        updateSettings({ notifications: true });
      } else {
        setNotifications(false);
        updateSettings({ notifications: false });
      }
    }
  };

  return (
    <div className="settings-page animate-fadeIn">
      <div className="page-header">
        <h1>⚙️ Settings</h1>
        <p className="page-subtitle">Manage your profile, preferences, and security</p>
      </div>

      <div className="settings-grid">
        {/* Profile & General */}
        <div className="glass-card settings-section">
          <h3>Profile & General</h3>
          
          <div className="input-group">
            <label className="input-label">Display Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="What should we call you?"
              value={name} 
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Number Animation Speed</label>
            <select 
              className="input-field" 
              value={animationSpeed} 
              onChange={(e) => setAnimationSpeed(e.target.value)}
            >
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
              <option value="instant">Instant (No Animation)</option>
            </select>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <span className="settings-label">Browser Notifications</span>
              <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                Get alerts for timers and reminders
              </span>
            </div>
            <div 
              className={`toggle-switch ${notifications ? 'active' : ''}`}
              onClick={() => {
                if (!notifications) handleNotificationRequest();
                else setNotifications(false);
              }}
            />
          </div>
        </div>

        {/* Pomodoro Settings */}
        <div className="glass-card settings-section">
          <h3>Pomodoro Defaults</h3>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)' }}>
            Set the default durations for your focus timer.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="input-group">
              <label className="input-label">Focus Session (min)</label>
              <input 
                type="number" 
                className="input-field" 
                value={pomodoroWork} 
                onChange={(e) => setPomodoroWork(parseInt(e.target.value) || 25)} 
                min="1" 
                max="120"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Break Session (min)</label>
              <input 
                type="number" 
                className="input-field" 
                value={pomodoroBreak} 
                onChange={(e) => setPomodoroBreak(parseInt(e.target.value) || 5)} 
                min="1" 
                max="60"
              />
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="glass-card settings-section">
          <h3>Regional Formats</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="input-group">
              <label className="input-label">Currency</label>
              <select className="input-field" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Date Format</label>
              <select className="input-field" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Appearance */}
        <div className="glass-card settings-section">
          <h3>Advanced Appearance</h3>
          
          <div className="input-group">
            <label className="input-label">Typography</label>
            <select className="input-field" value={typography} onChange={(e) => setTypography(e.target.value)}>
              <option value="Inter">Inter (Default, Clean)</option>
              <option value="Roboto">Roboto (Standard)</option>
              <option value="Outfit">Outfit (Modern)</option>
              <option value="Playfair Display">Playfair Display (Serif)</option>
              <option value="Poppins">Poppins (Geometric)</option>
              <option value="Fira Code">Fira Code (Monospace)</option>
              <option value="Montserrat">Montserrat (Wide)</option>
            </select>
          </div>

          <div className="input-group" style={{ marginTop: 'var(--space-md)' }}>
            <label className="input-label">Glassmorphism Intensity</label>
            <select className="input-field" value={glassIntensity} onChange={(e) => setGlassIntensity(e.target.value)}>
              <option value="solid">Solid (No blur)</option>
              <option value="frosted">Frosted (Normal)</option>
              <option value="heavy">Heavy Blur (Max effect)</option>
            </select>
          </div>

          <div className="input-group" style={{ marginTop: 'var(--space-md)' }}>
            <label className="input-label">Layout Spacing</label>
            <select className="input-field" value={layoutSpacing} onChange={(e) => setLayoutSpacing(e.target.value)}>
              <option value="compact">Compact (More data)</option>
              <option value="normal">Normal</option>
              <option value="spacious">Spacious (Breathe)</option>
            </select>
          </div>
        </div>

        {/* Dashboard Background */}
        <div className="glass-card settings-section">
          <h3>Dashboard Background</h3>
          
          <div className="input-group">
            <label className="input-label">Background Type</label>
            <select className="input-field" value={dashboardBgType} onChange={(e) => setDashboardBgType(e.target.value)}>
              <option value="none">Solid Color (Default)</option>
              <option value="preset">Beautiful Preset</option>
              <option value="custom">Custom Image URL</option>
            </select>
          </div>
          
          {dashboardBgType === 'preset' && (
            <div className="input-group" style={{ marginTop: 'var(--space-md)' }}>
              <label className="input-label">Select Preset</label>
              <select className="input-field" value={dashboardBgPreset} onChange={(e) => setDashboardBgPreset(e.target.value)}>
                <option value="mesh">Soft Mesh Gradient</option>
                <option value="waves">Dark Ocean Waves</option>
                <option value="particles">Subtle Particles</option>
              </select>
            </div>
          )}

          {dashboardBgType === 'custom' && (
            <div className="input-group" style={{ marginTop: 'var(--space-md)' }}>
              <label className="input-label">Image URL</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="https://..."
                value={dashboardBgCustomUrl} 
                onChange={(e) => setDashboardBgCustomUrl(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Theme & Appearance */}
        <div className="glass-card settings-section">
          <h3>Theme & Appearance</h3>
          
          <div className="settings-row" style={{ marginTop: 'var(--space-md)' }}>
            <div className="settings-info">
              <span className="settings-label">Dark Mode</span>
              <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                Toggle between dark and light themes
              </span>
            </div>
            <div 
              className={`toggle-switch ${themeMode === 'dark' ? 'active' : ''}`}
              onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            />
          </div>

          <div className="input-group" style={{ marginTop: 'var(--space-md)' }}>
            <label className="input-label">Accent Color</label>
            <select 
              className="input-field" 
              value={accentColor} 
              onChange={(e) => setAccentColor(e.target.value)}
            >
              <option value="blue">Dusty Blue</option>
              <option value="green">Sage Green</option>
              <option value="red">Muted Rose</option>
              <option value="orange">Pale Gold</option>
              <option value="purple">Lavender</option>
            </select>
          </div>
        </div>

        {/* Scroll Animations */}
        <div className="glass-card settings-section">
          <h3>Scroll Animations</h3>
          
          <div className="settings-row" style={{ marginTop: 'var(--space-md)' }}>
            <div className="settings-info">
              <span className="settings-label">Enable Scroll Animations</span>
              <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                Animate cards as you scroll
              </span>
            </div>
            <div 
              className={`toggle-switch ${scrollAnimationsEnabled ? 'active' : ''}`}
              onClick={() => setScrollAnimationsEnabled(!scrollAnimationsEnabled)}
            />
          </div>

          <div className="input-group" style={{ marginTop: 'var(--space-md)', opacity: scrollAnimationsEnabled ? 1 : 0.5, pointerEvents: scrollAnimationsEnabled ? 'auto' : 'none' }}>
            <label className="input-label">Animation Intensity</label>
            <select 
              className="input-field" 
              value={scrollAnimationIntensity} 
              onChange={(e) => setScrollAnimationIntensity(e.target.value)}
            >
              <option value="subtle">Subtle</option>
              <option value="prominent">Prominent</option>
            </select>
          </div>
        </div>

        {/* Dashboard Layout */}
        <div className="glass-card settings-section">
          <h3>Dashboard Layout</h3>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)' }}>
            Toggle which widgets appear on your Home page.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            {Object.keys(dashboardWidgets).map((widgetKey) => {
              const labelMap = {
                tasks: "Today's Tasks",
                habits: "Habits",
                bills: "Upcoming Bills",
                transactions: "Recent Transactions",
                monthlyOverview: "This Month",
                routine: "Today's Routine"
              };
              return (
                <div key={widgetKey} className="settings-row" style={{ background: 'var(--glass-bg-hover)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)' }}>
                  <span className="settings-label" style={{ fontSize: 'var(--font-size-sm)' }}>{labelMap[widgetKey]}</span>
                  <div 
                    className={`toggle-switch ${dashboardWidgets[widgetKey] ? 'active' : ''}`}
                    onClick={() => setDashboardWidgets({...dashboardWidgets, [widgetKey]: !dashboardWidgets[widgetKey]})}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="glass-card settings-section">
          <h3>Sidebar Navigation</h3>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)' }}>
            Toggle which pages appear in your sidebar menu.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            {Object.keys(sidebarPages).map((pageKey) => {
              const labelMap = {
                finance: "Finance",
                tasks: "Tasks",
                routine: "Routine",
                habits: "Habits",
                calendar: "Calendar",
                notes: "Journal"
              };
              return (
                <div key={pageKey} className="settings-row" style={{ background: 'var(--glass-bg-hover)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)' }}>
                  <span className="settings-label" style={{ fontSize: 'var(--font-size-sm)' }}>{labelMap[pageKey]}</span>
                  <div 
                    className={`toggle-switch ${sidebarPages[pageKey] ? 'active' : ''}`}
                    onClick={() => setSidebarPages({...sidebarPages, [pageKey]: !sidebarPages[pageKey]})}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Button for Profile & Pomodoro */}
        <div className="settings-actions">
          <button className="btn btn-primary" onClick={handleSaveProfile} style={{ minWidth: '150px' }}>
            {saveStatus || 'Save Preferences'}
          </button>
        </div>

        {/* Security */}
        <div className="glass-card settings-section security-section">
          <h3>Security</h3>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)' }}>
            Change the shared password used to access this dashboard.
          </p>

          <form onSubmit={handlePasswordChange} className="password-form">
            <div className="input-group">
              <label className="input-label">New Password</label>
              <input 
                type="password" 
                className="input-field" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
              />
            </div>
            
            {passwordMsg.text && (
              <p className={`password-msg ${passwordMsg.type}`}>{passwordMsg.text}</p>
            )}

            <button type="submit" className="btn btn-ghost" style={{ marginTop: 'var(--space-sm)' }}>
              Update Password
            </button>
          </form>
        </div>

        {/* Install App */}
        <div className="glass-card settings-section install-section">
          <h3>📲 Install App</h3>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
            Install this dashboard as a native app on your device for a faster, fullscreen experience — no browser UI in the way.
          </p>

          <div className="install-cta">
            <div className="install-badges">
              <span className="install-badge">🖥️ Desktop</span>
              <span className="install-badge">📱 Mobile</span>
              <span className="install-badge">⚡ Offline ready</span>
            </div>

            <button
              id="pwa-install-btn"
              className={`btn btn-primary install-btn ${isInstalled ? 'install-btn--installed' : ''}`}
              onClick={async () => {
                if (isInstalled) {
                  setInstallMsg({ text: '✅ App is already installed on your device!', type: 'success' });
                  return;
                }
                const { outcome } = await promptInstall();
                if (outcome === 'not-available') {
                  setInstallMsg({ text: '⚠️ Your browser doesn\'t support PWA install. Try Chrome or Edge on desktop/Android.', type: 'warn' });
                } else if (outcome === 'accepted') {
                  setInstallMsg({ text: '🎉 App installed successfully!', type: 'success' });
                } else {
                  setInstallMsg({ text: '', type: '' });
                }
              }}
            >
              {isInstalled ? '✅ Already Installed' : isInstallable ? '⬇️ Install App' : '⬇️ Install App'}
            </button>
          </div>

          {installMsg.text && (
            <p className={`password-msg ${installMsg.type === 'warn' ? 'error' : installMsg.type}`}
               style={{ marginTop: 0 }}>
              {installMsg.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
