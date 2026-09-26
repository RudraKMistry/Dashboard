import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSettings } from '../../hooks/useData';
import {
  HiHome, HiCurrencyRupee, HiClipboardList, HiSun,
  HiFire, HiCalendar, HiPencilAlt, HiCog,
  HiChevronLeft, HiChevronRight
} from 'react-icons/hi';
import './Sidebar.css';

const navItems = [
  { path: '/', label: 'Home', icon: HiHome },
  { path: '/finance', label: 'Finance', icon: HiCurrencyRupee },
  { path: '/tasks', label: 'Tasks', icon: HiClipboardList },
  { path: '/routine', label: 'Routine', icon: HiSun },
  { path: '/habits', label: 'Habits', icon: HiFire },
  { path: '/calendar', label: 'Calendar', icon: HiCalendar },
  { path: '/notes', label: 'Journal', icon: HiPencilAlt },
];

const bottomItems = [
  { path: '/settings', label: 'Settings', icon: HiCog },
];

export default function Sidebar({ collapsed, mobileOpen, onToggle, onMobileClose }) {
  const location = useLocation();
  const { settings } = useSettings();
  const sidebarPages = settings.sidebarPages || {};

  const visibleNavItems = navItems.filter(item => {
    if (item.path === '/') return true;
    const key = item.path.substring(1);
    return sidebarPages[key] !== false;
  });

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {mobileOpen && (
        <div className="sidebar-mobile-overlay" onClick={onMobileClose}></div>
      )}
      
      {/* Desktop Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          {!collapsed && (
            <div className="sidebar-logo">
              <div className="logo-icon">✦</div>
              <span className="logo-text">Dashboard</span>
            </div>
          )}
          <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
            {collapsed ? <HiChevronRight /> : <HiChevronLeft />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            {visibleNavItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
                end={item.path === '/'}
                onClick={onMobileClose}
              >
                <item.icon className="nav-icon" />
                {!collapsed && <span className="nav-label">{item.label}</span>}
                {!collapsed && (
                  <div className="nav-active-indicator" />
                )}
              </NavLink>
            ))}
          </div>

          <div className="nav-section nav-bottom">
            {bottomItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
                onClick={onMobileClose}
              >
                <item.icon className="nav-icon" />
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-nav">
        {navItems.slice(0, 5).map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            end={item.path === '/'}
          >
            <item.icon />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
