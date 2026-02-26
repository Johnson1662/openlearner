'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Home, BookOpen, Menu, X, Flame, Heart, Zap } from 'lucide-react';
import { PageView, UserProgress } from '@/types';
import { useState } from 'react';

interface NavbarProps {
  currentView: PageView;
  onViewChange: (view: PageView) => void;
  progress: UserProgress;
}

export default function Navbar({ currentView, onViewChange, progress }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { view: PageView; label: string; icon: React.ReactNode; match?: PageView[] }[] = [
    { view: 'home', label: '首页', icon: <Home className="w-5 h-5" /> },
    { view: 'courses', label: '课程', icon: <BookOpen className="w-5 h-5" />, match: ['courses', 'course-detail'] },
  ];

  const isActive = (item: typeof navItems[0]) =>
    currentView === item.view || (item.match?.includes(currentView) ?? false);

  const streak = progress?.currentStreak ?? 0;
  const lives = 5;
  const xp = progress?.totalXP ?? 0;

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="sticky top-0 z-50 bg-white"
      style={{ borderBottom: '2px solid #E5E5E5' }}
    >
      <div className="max-w-3xl mx-auto px-4 flex items-center h-16 gap-4">
        {/* Logo */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewChange('home')}
          className="flex items-center gap-2.5 cursor-pointer mr-auto md:mr-0"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#58CC02', boxShadow: '0 3px 0 #46A302' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <span className="text-[18px] font-black tracking-tight hidden sm:block" style={{ color: '#3C3C3C' }}>
            openlearner
          </span>
        </motion.button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <motion.button
                key={item.view}
                onClick={() => onViewChange(item.view)}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-[14px] uppercase tracking-wider transition-colors cursor-pointer relative"
                style={{
                  color: active ? '#58CC02' : '#AFAFAF',
                  background: active ? 'rgba(88, 204, 2, 0.08)' : 'transparent',
                  borderBottom: active ? '3px solid #58CC02' : '3px solid transparent',
                }}
              >
                {item.icon}
                {item.label}
              </motion.button>
            );
          })}
        </div>

        {/* Stats Row */}
        <div className="hidden sm:flex items-center gap-5">
          {/* Streak */}
          <div className="stat-badge" style={{ color: '#FF9600' }}>
            <Flame className="w-6 h-6 fill-current" />
            <span>{streak}</span>
          </div>
          {/* Hearts */}
          <div className="stat-badge" style={{ color: '#FF4B4B' }}>
            <Heart className="w-5 h-5 fill-current" />
            <span>{lives}</span>
          </div>
          {/* XP */}
          <div className="stat-badge" style={{ color: '#1CB0F6' }}>
            <Zap className="w-5 h-5 fill-current" />
            <span>{xp}</span>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 -mr-1 cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen
            ? <X className="w-6 h-6" style={{ color: '#3C3C3C' }} />
            : <Menu className="w-6 h-6" style={{ color: '#3C3C3C' }} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden px-4 pb-4 overflow-hidden"
            style={{ borderTop: '2px solid #E5E5E5' }}
          >
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <button
                  key={item.view}
                  onClick={() => { onViewChange(item.view); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full py-3 font-extrabold text-[15px] uppercase tracking-wide cursor-pointer"
                  style={{ color: active ? '#58CC02' : '#AFAFAF' }}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
            <div className="flex items-center gap-6 pt-3" style={{ borderTop: '2px solid #E5E5E5' }}>
              <div className="stat-badge" style={{ color: '#FF9600' }}>
                <Flame className="w-5 h-5 fill-current" /><span>{streak}</span>
              </div>
              <div className="stat-badge" style={{ color: '#FF4B4B' }}>
                <Heart className="w-5 h-5 fill-current" /><span>{lives}</span>
              </div>
              <div className="stat-badge" style={{ color: '#1CB0F6' }}>
                <Zap className="w-5 h-5 fill-current" /><span>{xp}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
