'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Minus, Send, X } from 'lucide-react';

interface UserFeedbackModalProps {
  isOpen: boolean;
  onSubmit: (feedback: UserFeedback) => void;
  onSkip: () => void;
}

export interface UserFeedback {
  difficulty: 'too_hard' | 'just_right' | 'too_easy' | null;
  feedbackText: string;
}

export default function UserFeedbackModal({ isOpen, onSubmit, onSkip }: UserFeedbackModalProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'too_hard' | 'just_right' | 'too_easy' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const handleSubmit = () => {
    onSubmit({
      difficulty: selectedDifficulty,
      feedbackText: feedbackText.trim(),
    });
    // Reset state
    setSelectedDifficulty(null);
    setFeedbackText('');
  };

  const handleSkip = () => {
    onSkip();
    setSelectedDifficulty(null);
    setFeedbackText('');
  };

  const handleClose = () => {
    handleSkip();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-gray-900">课程反馈</h2>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <p className="text-gray-500 font-medium">
                这节课对你来说难度如何？你的反馈会帮助我们生成更合适的下一关。
              </p>
            </div>

            {/* Difficulty Selection */}
            <div className="px-8 pb-4">
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDifficulty('too_hard')}
                  className={`flex-1 py-4 rounded-2xl border-3 flex flex-col items-center gap-2 transition-all ${
                    selectedDifficulty === 'too_hard'
                      ? 'border-red-400 bg-red-50 text-red-600'
                      : 'border-gray-200 hover:border-red-200'
                  }`}
                >
                  <ThumbsDown className={`w-6 h-6 ${selectedDifficulty === 'too_hard' ? 'text-red-500' : 'text-gray-400'}`} />
                  <span className={`font-bold text-sm ${selectedDifficulty === 'too_hard' ? 'text-red-600' : 'text-gray-600'}`}>
                    太难了
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDifficulty('just_right')}
                  className={`flex-1 py-4 rounded-2xl border-3 flex flex-col items-center gap-2 transition-all ${
                    selectedDifficulty === 'just_right'
                      ? 'border-green-400 bg-green-50 text-green-600'
                      : 'border-gray-200 hover:border-green-200'
                  }`}
                >
                  <Minus className={`w-6 h-6 ${selectedDifficulty === 'just_right' ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={`font-bold text-sm ${selectedDifficulty === 'just_right' ? 'text-green-600' : 'text-gray-600'}`}>
                    刚刚好
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDifficulty('too_easy')}
                  className={`flex-1 py-4 rounded-2xl border-3 flex flex-col items-center gap-2 transition-all ${
                    selectedDifficulty === 'too_easy'
                      ? 'border-blue-400 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <ThumbsUp className={`w-6 h-6 ${selectedDifficulty === 'too_easy' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={`font-bold text-sm ${selectedDifficulty === 'too_easy' ? 'text-blue-600' : 'text-gray-600'}`}>
                    太简单
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Text Feedback */}
            <div className="px-8 pb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                其他建议（可选）
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="告诉我们更多关于这节课的感受..."
                className="w-full h-24 px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none resize-none font-medium text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Actions */}
            <div className="px-8 pb-8 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSkip}
                className="flex-1 py-4 rounded-2xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                跳过
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                提交反馈
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
