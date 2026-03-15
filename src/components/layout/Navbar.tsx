'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Home, BookOpen, Menu, X, Zap, Star, User } from 'lucide-react';
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

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center h-[72px] justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewChange('home')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-2xl font-black tracking-tight text-foreground">
              OpenLearner
            </span>
          </motion.button>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <button
                  key={item.view}
                  onClick={() => onViewChange(item.view)}
                  className={`px-4 py-2 rounded-lg font-bold text-base transition-colors relative ${
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-foreground"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-border font-bold text-foreground bg-card/50">
            <span className="text-lg">{progress?.totalXP || 0}</span>
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-border font-bold text-foreground bg-card/50">
            <span className="text-lg">{progress?.energy ?? 100}</span>
            <Zap className="w-5 h-5 text-yellow-500 fill-current" />
          </div>
          
          <button className="p-2 rounded-full hover:bg-muted transition-colors">
            <User className="w-6 h-6 text-muted-foreground" />
          </button>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background px-6 py-4"
          >
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => { onViewChange(item.view); setMobileMenuOpen(false); }}
                className="block w-full text-left py-3 font-bold text-foreground"
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
