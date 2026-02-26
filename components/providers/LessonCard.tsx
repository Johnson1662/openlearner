'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { Step, useProgress } from './ProgressProvider';
import { ProgressBar } from '@/components/ProgressBar';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface LessonCardProps {
  children: ReactNode;
  step: Step;
  onComplete?: () => void;
  onBack?: () => void;
}

export function LessonCard({ children, step, onComplete, onBack }: LessonCardProps) {
  const { 
    canProceed, 
    completeStep, 
    getNextStepId, 
    getPrevStepId,
    setCurrentStep,
    totalProgress 
  } = useProgress();

  const handleContinue = () => {
    completeStep(step.id);
    if (onComplete) {
      onComplete();
    } else {
      const nextId = getNextStepId();
      if (nextId) {
        setCurrentStep(nextId);
      }
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      const prevId = getPrevStepId();
      if (prevId) {
        setCurrentStep(prevId);
      }
    }
  };

  const getStepIcon = (type: Step['type']) => {
    switch (type) {
      case 'experiment': return '🔬';
      case 'discovery': return '💡';
      case 'explanation': return '📚';
      case 'challenge': return '🎯';
      default: return '📖';
    }
  };

  const getStepColor = (type: Step['type']) => {
    switch (type) {
      case 'experiment': return 'from-amber-500 to-orange-500';
      case 'discovery': return 'from-cyan-500 to-blue-500';
      case 'explanation': return 'from-purple-500 to-pink-500';
      case 'challenge': return 'from-emerald-500 to-teal-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStepLabel = (type: Step['type']) => {
    switch (type) {
      case 'experiment': return '动手实验';
      case 'discovery': return '发现规律';
      case 'explanation': return '知识讲解';
      case 'challenge': return '挑战练习';
      default: return '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <ProgressBar progress={totalProgress} showPercentage />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className={`bg-gradient-to-r ${getStepColor(step.type)} p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {getStepIcon(step.type)}
              </motion.div>
              <div>
                <span className="text-white/80 text-sm font-medium">
                  {getStepLabel(step.type)}
                </span>
                <h2 className="text-white text-xl font-bold">{step.title}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-sm">{totalProgress}%</span>
              <CheckCircle2 className="w-5 h-5 text-white/80" />
            </div>
          </div>
        </div>

        <div className="p-8">
          {step.description && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-600 mb-6 text-lg"
            >
              {step.description}
            </motion.p>
          )}
          
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-8 pb-8 pt-2">
          <div className="flex items-center justify-between gap-4">
            <motion.button
              whileHover={{ scale: 1.02, x: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBack}
              disabled={!getPrevStepId()}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 font-medium rounded-xl
                         hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              上一步
            </motion.button>

            <motion.button
              whileHover={canProceed ? { scale: 1.02, x: 2 } : {}}
              whileTap={canProceed ? { scale: 0.98 } : {}}
              onClick={handleContinue}
              disabled={!canProceed}
              className={`flex items-center gap-2 px-8 py-3 font-bold rounded-xl shadow-lg transition-all
                ${canProceed 
                  ? `bg-gradient-to-r ${getStepColor(step.type)} text-white hover:shadow-xl` 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              继续
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
