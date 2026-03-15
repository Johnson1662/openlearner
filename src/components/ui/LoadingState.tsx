'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  steps?: string[];
  className?: string;
}

export default function LoadingState({ 
  message = 'Loading...', 
  steps = ['Analyzing content...', 'Structuring knowledge...', 'Generating exercises...', 'Finalizing course...'],
  className = ''
}: LoadingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!steps || steps.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [steps]);

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="relative w-24 h-24 mb-8">

        <motion.div
          className="absolute inset-0 rounded-full bg-primary/10"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/10"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
        />
        

        <div className="absolute inset-0 m-auto w-16 h-16 bg-card rounded-2xl shadow-sm border border-primary/10 flex items-center justify-center z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
        </div>
        

        <motion.div
          className="absolute inset-0 m-auto w-20 h-20 rounded-full border-2 border-primary/10 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="text-center h-16">
        <h3 className="text-lg font-bold text-foreground mb-2">
          {message}
        </h3>
        
        <div className="relative h-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-medium text-muted-foreground"
            >
              {steps[currentStep]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
