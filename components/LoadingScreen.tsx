'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [phase, setPhase] = useState<'logo' | 'text' | 'complete'>('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 800);
    const t2 = setTimeout(() => setPhase('complete'), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <AnimatePresence>
      {phase !== 'complete' && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: '#FAFAFA' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="flex flex-col items-center">
            {/* Logo Mark */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="relative mb-8"
            >
              {/* Outer glow ring */}
              <motion.div
                className="absolute inset-0 rounded-[22px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  background: 'transparent',
                  boxShadow: '0 0 60px rgba(0, 122, 255, 0.15)',
                }}
              />
              
              {/* Icon container */}
              <motion.div
                className="w-20 h-20 rounded-[22px] flex items-center justify-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, #1d1d1f 0%, #2d2d2f 100%)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12), 0 2px 10px rgba(0, 0, 0, 0.08)',
                }}
              >
                {/* Subtle shimmer */}
                <motion.div
                  className="absolute inset-0"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 1.5, delay: 0.3, ease: 'easeInOut' }}
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
                  }}
                />
                
                {/* Book icon - clean SVG */}
                <motion.svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </motion.svg>
              </motion.div>
            </motion.div>

            {/* Brand Name */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="text-center"
            >
              <h1
                className="text-[28px] font-semibold tracking-tight"
                style={{ color: '#1d1d1f' }}
              >
                OpenLearner
              </h1>
            </motion.div>

            {/* Tagline - appears in second phase */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={phase === 'text' ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="mt-2 text-[15px] font-normal"
              style={{ color: '#86868b' }}
            >
              AI-Powered Learning
            </motion.p>

            {/* Minimal loading indicator */}
            <motion.div
              className="mt-10 flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#86868b' }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
