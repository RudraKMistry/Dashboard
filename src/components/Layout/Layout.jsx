import { useState, useEffect } from 'react';
import { useOutlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useSettings } from '../../hooks/useData';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const outlet = useOutlet();
  const { settings } = useSettings();

  // Theme initialized in App.jsx

  useEffect(() => {
    if (!settings.scrollAnimationsEnabled) {
      document.querySelectorAll('.glass-card').forEach(card => card.classList.add('in-view'));
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          } else {
            entry.target.classList.remove('in-view');
          }
        });
      },
      { threshold: 0.01, rootMargin: '50px' }
    );

    const cards = document.querySelectorAll('.glass-card');
    cards.forEach((card) => observer.observe(card));
    
    const timer = setTimeout(() => {
      document.querySelectorAll('.glass-card:not(.in-view)').forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          card.classList.add('in-view');
        }
      });
    }, 1000);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.classList.contains('glass-card')) {
              observer.observe(node);
            }
            if (node.querySelectorAll) {
              const childCards = node.querySelectorAll('.glass-card');
              childCards.forEach((card) => observer.observe(card));
            }
          }
        });
      });
    });
    
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      clearTimeout(timer);
    };
  }, [location.pathname]);

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className={`main-area ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <TopBar
          collapsed={sidebarCollapsed}
          onMenuClick={() => {
            if (window.innerWidth <= 768) {
              setMobileMenuOpen(true);
            } else {
              setSidebarCollapsed(!sidebarCollapsed);
            }
          }}
        />
        <main className="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ width: '100%', height: '100%' }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
