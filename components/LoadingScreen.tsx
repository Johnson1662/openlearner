'use client';

import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] } }}
    >
      <div className="relative flex flex-col items-center">
        {/* Brand Icon with Pulse */}
        <div className="relative mb-8">
          <motion.div
            className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shadow-xl shadow-primary/30"
          >
            <Zap className="w-12 h-12 text-primary-foreground fill-current" />
          </motion.div>
        </div>

        {/* Text Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            OpenLearner
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Master any subject.
          </p>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <motion.div
        className="absolute bottom-12 w-48 h-1 bg-muted rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
        />
      </motion.div>
    </motion.div>
  );
}
