'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, Star, Sparkles, Trophy } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  isCorrect: boolean;
  xpEarned: number;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, isCorrect, xpEarned, onClose }: FeedbackModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div
              className="p-8 text-center min-w-[320px] rounded-2xl"
              style={{
                background: '#fff',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
              }}
            >
              {isCorrect ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                    style={{
                      background: '#34C759',
                      boxShadow: '0 8px 24px rgba(52, 199, 89, 0.3)',
                    }}
                  >
                    <Trophy className="w-8 h-8" style={{ color: '#fff' }} />
                  </motion.div>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-[22px] font-bold mb-1"
                    style={{ color: '#1d1d1f' }}
                  >
                    Excellent!
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-[15px] mb-5"
                    style={{ color: '#86868b' }}
                  >
                    You mastered this concept
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center gap-2 rounded-xl p-4 mb-6"
                    style={{
                      background: 'rgba(52, 199, 89, 0.08)',
                      border: '1px solid rgba(52, 199, 89, 0.15)',
                    }}
                  >
                    <Star className="w-5 h-5" style={{ color: '#FF9F0A', fill: '#FF9F0A' }} />
                    <span className="text-[22px] font-bold" style={{ color: '#34C759' }}>
                      +{xpEarned} XP
                    </span>
                    <Sparkles className="w-4 h-4" style={{ color: '#FF9F0A' }} />
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                    style={{
                      background: '#FF3B30',
                      boxShadow: '0 8px 24px rgba(255, 59, 48, 0.3)',
                    }}
                  >
                    <XCircle className="w-8 h-8" style={{ color: '#fff' }} />
                  </motion.div>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-[22px] font-bold mb-1"
                    style={{ color: '#1d1d1f' }}
                  >
                    Try Again
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-[15px] mb-6"
                    style={{ color: '#86868b' }}
                  >
                    Practice makes perfect. Keep going!
                  </motion.p>
                </>
              )}

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full py-3 rounded-xl text-[15px] font-semibold cursor-pointer transition-all"
                style={{
                  background: '#007AFF',
                  color: '#fff',
                }}
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
