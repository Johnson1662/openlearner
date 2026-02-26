'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lightbulb } from 'lucide-react';

export type FeedbackType = 'success' | 'error' | 'neutral';

interface FeedbackPanelProps {
  type: FeedbackType;
  message: string;
  hint?: string;
  onContinue?: () => void;
  onRetry?: () => void;
  show: boolean;
}

export default function FeedbackPanel({
  type,
  message,
  hint,
  onContinue,
  onRetry,
  show
}: FeedbackPanelProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25
          }}
          exit={{ opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } }}
          className={`
            w-full rounded-t-[32px] p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] border-t
            ${type === 'success'
              ? 'bg-[#E8F8F0] border-[#B2E4CA]'
              : type === 'error'
                ? 'bg-[#FEF1F1] border-[#FCD7D7]'
                : 'bg-white border-gray-100'
            }
          `}
        >
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm
                  ${type === 'success'
                    ? 'bg-[#B2E4CA] text-[#1D6F42]'
                    : type === 'error'
                      ? 'bg-[#FCD7D7] text-[#C53030]'
                      : 'bg-gray-100 text-gray-600'
                  }
                `}
              >
                {type === 'success' && <div className="text-3xl">🎉</div>}
                {type === 'error' && <div className="text-3xl">🧩</div>}
                {type === 'neutral' && <Lightbulb className="w-8 h-8" />}
              </motion.div>

              <div>
                <motion.h3
                  className={`
                    text-2xl font-[900] tracking-tight mb-1
                    ${type === 'success' ? 'text-[#1D6F42]' : type === 'error' ? 'text-[#C53030]' : 'text-gray-800'}
                  `}
                >
                  {type === 'success' ? 'Correct!' : type === 'error' ? 'Not quite' : 'Take a look'}
                  {type === 'success' && (
                    <span className="ml-4 text-sm font-black bg-white/60 px-3 py-1.5 rounded-full inline-flex items-center gap-2 border border-white/40">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      +15 XP
                    </span>
                  )}
                </motion.h3>
                <p className="text-[#3C3C3C] text-lg font-medium leading-tight">{message}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <button className="p-4 text-gray-400 hover:text-gray-600 transition-colors">
                <div className="w-6 h-6 border-2 border-current rounded flex items-center justify-center text-xs font-bold italic">?</div>
              </button>

              {type === 'success' && onContinue && (
                <motion.button
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onContinue}
                  className="
                    flex-1 md:flex-none py-4 px-12 rounded-2xl font-black text-white text-xl
                    bg-[#2ecc71] shadow-[0_6px_0_0_#27ae60]
                    hover:shadow-[0_4px_0_0_#27ae60] hover:translate-y-[2px]
                    active:shadow-none active:translate-y-[6px]
                    transition-all duration-75
                  "
                >
                  Continue
                </motion.button>
              )}

              {type === 'error' && onRetry && (
                <motion.button
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRetry}
                  className="
                    flex-1 md:flex-none py-4 px-12 rounded-2xl font-black text-white text-xl
                    bg-[#3C3C3C] shadow-[0_6px_0_0_#1A1A1A]
                    hover:shadow-[0_4px_0_0_#1A1A1A] hover:translate-y-[2px]
                    active:shadow-none active:translate-y-[6px]
                    transition-all duration-75
                  "
                >
                  Try again
                </motion.button>
              )}
            </div>
          </div>

          {hint && type === 'error' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.4 }}
              className="mt-3 p-3 bg-white rounded-lg border border-rose-200"
            >
              <div className="flex items-center gap-2 text-rose-600 mb-1">
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm font-semibold">Hint</span>
              </div>
              <p className="text-sm text-rose-600">{hint}</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ShakeWrapper({
  children,
  shake
}: {
  children: React.ReactNode;
  shake: boolean;
}) {
  return (
    <motion.div
      animate={shake ? {
        x: [0, -8, 8, -8, 8, 0],
        transition: { duration: 0.4 }
      } : {}}
    >
      {children}
    </motion.div>
  );
}

export function BounceWrapper({
  children,
  bounce
}: {
  children: React.ReactNode;
  bounce: boolean;
}) {
  return (
    <motion.div
      animate={bounce ? {
        scale: [1, 1.1, 0.95, 1.05, 1],
        transition: { duration: 0.5, ease: 'easeInOut' }
      } : {}}
    >
      {children}
    </motion.div>
  );
}

interface MicroButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export function MicroButton({
  children,
  onClick,
  variant = 'primary',
  isLoading
}: MicroButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-xl font-semibold transition-all duration-200';
  const variants = {
    primary: 'bg-indigo-500 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-600 hover:shadow-indigo-300',
    secondary: 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <motion.div
          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
      ) : children}
    </motion.button>
  );
}
