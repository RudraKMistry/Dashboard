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
    // Helper: mark all cards currently in/near viewport as in-view
    const revealVisible = () => {
      document.querySelectorAll('.glass-card:not(.in-view)').forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight + 150 && rect.bottom > -150) {
          card.classList.add('in-view');
        }
      });
    };

    if (!settings.scrollAnimationsEnabled) {
      document.querySelectorAll('.glass-card').forEach(card => card.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Only ADD in-view, never remove it — cards stay visible once seen
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.01, rootMargin: '150px 0px' }
    );

    const observeAllCards = () => {
      document.querySelectorAll('.glass-card').forEach((card) => observer.observe(card));
      revealVisible();
    };

    // Wait for framer-motion page transition (250ms) to finish before observing
    const t1 = setTimeout(observeAllCards, 350);
    // Backup timers for late-rendering cards (e.g. after Supabase data loads)
    const t2 = setTimeout(observeAllCards, 700);
    const t3 = setTimeout(observeAllCards, 1500);

    // Watch for dynamically added cards
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.classList && node.classList.contains('glass-card')) {
              observer.observe(node);
              revealVisible();
            }
            if (node.querySelectorAll) {
              node.querySelectorAll('.glass-card').forEach((card) => {
                observer.observe(card);
              });
              revealVisible();
            }
          }
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [location.pathname, settings.scrollAnimationsEnabled]);

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
