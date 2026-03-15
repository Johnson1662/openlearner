'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lightbulb } from 'lucide-react';

export type FeedbackType = 'success' | 'error' | 'neutral';

interface FeedbackPanelProps {
  type: FeedbackType;
  message: string;
  hint?: string;
  onContinue?: () => void;
  continueLabel?: string;
  onRetry?: () => void;
  show: boolean;
}

export default function FeedbackPanel({
  type,
  message,
  hint,
  onContinue,
  continueLabel = 'Continue',
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
              ? 'bg-duo-greenBg border-duo-green/40'
              : type === 'error'
                ? 'bg-duo-redLight border-duo-red/30'
                : 'bg-background border-duo-gray'
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
                    ? 'bg-duo-green/30 text-duo-greenDark'
                    : type === 'error'
                      ? 'bg-duo-red/20 text-duo-redDark'
                      : 'bg-muted text-muted-foreground'
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
                    ${type === 'success' ? 'text-duo-greenDark' : type === 'error' ? 'text-duo-redDark' : 'text-duo-text'}
                  `}
                >
                  {type === 'success' ? 'Correct!' : type === 'error' ? 'Not quite' : 'Take a look'}
                  {type === 'success' && (
                    <span className="ml-4 text-sm font-black bg-white/60 px-3 py-1.5 rounded-full inline-flex items-center gap-2 border border-white/40">
                      <Sparkles className="w-4 h-4 text-duo-gold" />
                      +15 XP
                    </span>
                  )}
                </motion.h3>
                <p className="text-duo-text text-lg font-medium leading-tight">{message}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <button className="p-4 text-duo-grayDark hover:text-duo-text transition-colors">
                <div className="w-6 h-6 border-2 border-current rounded flex items-center justify-center text-xs font-bold italic">?</div>
              </button>

              {type === 'success' && onContinue && (
                <motion.button
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onContinue}
                  className="
                    flex-1 md:flex-none py-4 px-12 rounded-2xl font-black text-white text-xl
                    bg-duo-green shadow-[0_6px_0_0_#46A302]
                    hover:shadow-[0_4px_0_0_#46A302] hover:translate-y-[2px]
                    active:shadow-none active:translate-y-[6px]
                    transition-all duration-75
                  "
                >
                  {continueLabel}
                </motion.button>
              )}

              {type === 'error' && onRetry && (
                <motion.button
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRetry}
                  className="
                    flex-1 md:flex-none py-4 px-12 rounded-2xl font-black text-white text-xl
                    bg-duo-text shadow-[0_6px_0_0_#1A1A1A]
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
              className="mt-3 p-3 bg-background rounded-lg border border-duo-red/30"
            >
              <div className="flex items-center gap-2 text-duo-redDark mb-1">
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm font-semibold">Hint</span>
              </div>
              <p className="text-sm text-duo-redDark">{hint}</p>
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
    primary: 'text-white font-extrabold uppercase tracking-wider',
    secondary: 'border-2 font-extrabold uppercase tracking-wider',
    ghost: 'font-semibold',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: '#58CC02', boxShadow: '0 4px 0 #46A302', border: '2px solid #46A302', color: '#fff' },
    secondary: { background: '#F7F7F8', borderColor: '#E5E5E5', boxShadow: '0 4px 0 #E5E5E5', color: '#AFAFAF' },
    ghost: { color: '#AFAFAF' },
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      style={variantStyles[variant]}
    >
      {isLoading ? (
        <motion.div
          className="w-5 h-5 rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
      ) : children}
    </motion.button>
  );
}
