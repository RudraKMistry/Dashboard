import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiSearch, HiPlus, HiBell, HiCog, HiLogout, HiMenu, 
  HiCheckCircle, HiExclamationCircle, HiCurrencyRupee, HiClipboardList 
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useTasks, useHabits, useSubscriptions, useTransactions } from '../../hooks/useData';
import { getTodayISO, getCurrentMonth, formatCurrency } from '../../lib/utils';
import './TopBar.css';

export default function TopBar({ onMenuClick, collapsed }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  const { tasks } = useTasks();
  const { habits, isCompletedToday } = useHabits();
  const { subscriptions } = useSubscriptions();
  const { transactions } = useTransactions();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowQuickSettings(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  const notifications = useMemo(() => {
    const notifs = [];
    const today = getTodayISO();
    const currentMonthStr = getCurrentMonth();
    const currentDay = new Date().getDate();

    // Overdue Tasks
    tasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate < today).forEach(t => {
      notifs.push({ 
        id: `t_${t.id}`, 
        icon: <HiExclamationCircle className="text-red" />, 
        title: 'Overdue Task', 
        text: t.title, 
        path: '/tasks' 
      });
    });

    // Pending Subscriptions
    subscriptions.filter(s => s.isActive && s.billingDate <= currentDay && s.lastPaidMonth !== currentMonthStr).forEach(s => {
      notifs.push({ 
        id: `s_${s.id}`, 
        icon: <HiCurrencyRupee className="text-orange" />, 
        title: 'Subscription Due', 
        text: `${s.name} (${formatCurrency(s.amount)})`, 
        path: '/finance' 
      });
    });

    // Pending Habits
    const pendingHabits = habits.filter(h => !isCompletedToday(h.id));
    if (pendingHabits.length > 0) {
      notifs.push({ 
        id: 'h_all', 
        icon: <HiCheckCircle className="text-blue" />, 
        title: 'Habits Pending', 
        text: `You have ${pendingHabits.length} habit(s) to complete today`, 
        path: '/habits' 
      });
    }

    return notifs;
  }, [tasks, subscriptions, habits, isCompletedToday]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results = [];
    
    tasks.filter(t => t.title.toLowerCase().includes(query) || (t.description || '').toLowerCase().includes(query)).forEach(t => {
      results.push({ id: `task_${t.id}`, type: 'Task', text: t.title, path: '/tasks' });
    });
    
    transactions.filter(t => (t.description || '').toLowerCase().includes(query) || t.category.toLowerCase().includes(query)).forEach(t => {
      results.push({ id: `trx_${t.id}`, type: 'Transaction', text: `${t.description || t.category} (${formatCurrency(t.amount)})`, path: '/finance' });
    });
    
    return results.slice(0, 5); // top 5
  }, [searchQuery, tasks, transactions]);

  return (
    <header className={`topbar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
          <HiMenu />
        </button>

        <div className={`topbar-search ${showSearch ? 'expanded' : ''}`}>
          <HiSearch className="search-icon" onClick={() => setShowSearch(!showSearch)} />
          {showSearch && (
            <>
              <input
                ref={searchRef}
                type="text"
                className="search-input"
                placeholder="Search tasks, transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  setTimeout(() => { if (!searchQuery) setShowSearch(false) }, 200);
                }}
              />
              {searchQuery && (
                <div className="search-dropdown animate-scaleIn">
                  {searchResults.length > 0 ? (
                    searchResults.map(res => (
                      <div key={res.id} className="search-result-item" onClick={() => { navigate(res.path); setShowSearch(false); setSearchQuery(''); }}>
                        <span className="search-result-type">{res.type}</span>
                        <span className="search-result-text">{res.text}</span>
                      </div>
                    ))
                  ) : (
                    <div className="search-no-results">No results found</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="topbar-right">


        <div className="quick-settings-wrapper" ref={notifRef}>
          <button 
            className="topbar-btn" 
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <HiBell />
            {notifications.length > 0 && <span className="notification-dot" />}
          </button>
          
          {showNotifications && (
            <div className="quick-settings-dropdown notifications-dropdown animate-scaleIn">
              <div className="notifications-header">
                <h4>Notifications</h4>
                <span className="badge">{notifications.length}</span>
              </div>
              <div className="dropdown-divider" />
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="notifications-empty">You're all caught up!</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="notification-item dropdown-item" onClick={() => { navigate(n.path); setShowNotifications(false); }}>
                      <div className="notification-icon">{n.icon}</div>
                      <div className="notification-content">
                        <span className="notification-title">{n.title}</span>
                        <span className="notification-text text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>{n.text}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="quick-settings-wrapper" ref={dropdownRef}>
          <button
            className="topbar-btn"
            onClick={() => setShowQuickSettings(!showQuickSettings)}
            title="Quick Settings"
          >
            <HiCog />
          </button>

          {showQuickSettings && (
            <div className="quick-settings-dropdown animate-scaleIn">
              <button
                className="dropdown-item"
                onClick={() => { navigate('/settings'); setShowQuickSettings(false); }}
              >
                <HiCog />
                <span>Settings</span>
              </button>
              <div className="dropdown-divider" />
              <button
                className="dropdown-item danger"
                onClick={logout}
              >
                <HiLogout />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
