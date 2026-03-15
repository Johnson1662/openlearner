'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Star } from 'lucide-react';

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-sm"
          >
            <div
              className="rounded-3xl p-8 text-center border-2 bg-background"
              style={{
                borderColor: isCorrect ? '#58CC02' : '#FF4B4B',
                boxShadow: isCorrect ? '0 8px 0 #46A302' : '0 8px 0 #D03B3B',
              }}
            >
              {isCorrect ? (
                <>
                  {/* Trophy icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.08 }}
                    className="w-24 h-24 mx-auto mb-5 rounded-3xl flex items-center justify-center bg-duo-gold"
                    style={{ boxShadow: '0 6px 0 #D4A500' }}
                  >
                    <Trophy className="w-12 h-12 text-white" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="text-[28px] font-black mb-1 text-duo-green"
                  >
                    Excellent!
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.28 }}
                    className="text-[15px] font-bold mb-5 uppercase tracking-wide text-duo-grayDark"
                  >
                    You nailed it
                  </motion.p>

                  {/* XP badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35, type: 'spring', stiffness: 300, damping: 20 }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl mb-7 bg-duo-goldLight border-2 border-duo-gold"
                    style={{
                      boxShadow: '0 3px 0 #F0E0A0',
                    }}
                  >
                    <Star className="w-6 h-6 fill-current text-duo-gold" />
                    <span className="text-[24px] font-black text-duo-goldDark">
                      +{xpEarned} XP
                    </span>
                    <Zap className="w-5 h-5 fill-current text-duo-gold" />
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Sad icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: 15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.08 }}
                    className="w-24 h-24 mx-auto mb-5 rounded-3xl flex items-center justify-center text-6xl bg-duo-redLight"
                    style={{ boxShadow: '0 6px 0 #FFBCBC' }}
                  >
                    <span>{'😬'}</span>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="text-[28px] font-black mb-1 text-duo-red"
                  >
                    Try Again
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.28 }}
                    className="text-[15px] font-bold mb-7 uppercase tracking-wide text-duo-grayDark"
                  >
                    Practice makes perfect
                  </motion.p>
                </>
              )}

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isCorrect ? 0.45 : 0.36 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95, y: 4 }}
                onClick={onClose}
                className="w-full py-4 rounded-2xl font-extrabold text-[17px] uppercase tracking-wider text-white cursor-pointer"
                style={{
                  background: isCorrect ? '#58CC02' : '#FF4B4B',
                  boxShadow: isCorrect ? '0 5px 0 #46A302' : '0 5px 0 #D03B3B',
                  borderBottom: isCorrect ? '5px solid #46A302' : '5px solid #D03B3B',
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
