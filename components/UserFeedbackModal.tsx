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

  const reset = () => { setSelectedDifficulty(null); setFeedbackText(''); };

  const handleSubmit = () => { onSubmit({ difficulty: selectedDifficulty, feedbackText: feedbackText.trim() }); reset(); };
  const handleSkip = () => { onSkip(); reset(); };

  const difficultyButtons = [
    {
      value: 'too_hard' as const,
      label: '太难了',
      Icon: ThumbsDown,
      activeStyle: { background: '#FFF0F0', borderColor: '#FF4B4B', color: '#FF4B4B' },
      iconColor: '#FF4B4B',
    },
    {
      value: 'just_right' as const,
      label: '刚刚好',
      Icon: Minus,
      activeStyle: { background: '#F0FFF4', borderColor: '#58CC02', color: '#46A302' },
      iconColor: '#58CC02',
    },
    {
      value: 'too_easy' as const,
      label: '太简单',
      Icon: ThumbsUp,
      activeStyle: { background: '#DDF4FF', borderColor: '#8257E5', color: '#8257E5' },
      iconColor: '#8257E5',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-3xl max-w-md w-full mx-4 overflow-hidden border-2"
            style={{ borderColor: '#E5E5E5', boxShadow: '0 8px 0 #E5E5E5' }}
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-black" style={{ color: '#3C3C3C' }}>课程反馈</h2>
                <button
                  onClick={handleSkip}
                  className="w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer"
                  style={{ background: '#F7F7F8' }}
                >
                  <X className="w-4 h-4" style={{ color: '#AFAFAF' }} />
                </button>
              </div>
              <p className="font-semibold" style={{ color: '#AFAFAF' }}>
                这节课对你来说难度如何？你的反馈会帮助我们生成更合适的下一关。
              </p>
            </div>

            {/* Difficulty buttons */}
            <div className="px-8 pb-4">
              <div className="flex gap-3">
                {difficultyButtons.map(({ value, label, Icon, activeStyle, iconColor }) => {
                  const isActive = selectedDifficulty === value;
                  return (
                    <motion.button
                      key={value}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97, y: 2 }}
                      onClick={() => setSelectedDifficulty(value)}
                      className="flex-1 py-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer font-extrabold text-sm uppercase tracking-wide"
                      style={
                        isActive
                          ? { ...activeStyle, boxShadow: `0 4px 0 ${activeStyle.borderColor}` }
                          : { background: '#F7F7F8', borderColor: '#E5E5E5', color: '#AFAFAF', boxShadow: '0 4px 0 #E5E5E5' }
                      }
                    >
                      <Icon className="w-6 h-6" style={{ color: isActive ? iconColor : '#AFAFAF' }} />
                      {label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Text input */}
            <div className="px-8 pb-6">
              <label className="block text-sm font-extrabold uppercase tracking-wide mb-2" style={{ color: '#3C3C3C' }}>
                其他建议（可选）
              </label>
              <textarea
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="告诉我们更多关于这节课的感受..."
                className="w-full h-24 px-4 py-3 rounded-2xl border-2 font-semibold resize-none focus:outline-none transition-all"
                style={{ borderColor: '#E5E5E5', color: '#3C3C3C' }}
                onFocus={e => (e.target.style.borderColor = '#8257E5')}
                onBlur={e => (e.target.style.borderColor = '#E5E5E5')}
              />
            </div>

            {/* Actions */}
            <div className="px-8 pb-8 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97, y: 2 }}
                onClick={handleSkip}
                className="flex-1 py-4 rounded-2xl border-2 font-extrabold uppercase tracking-wider cursor-pointer"
                style={{ borderColor: '#E5E5E5', color: '#AFAFAF', background: '#F7F7F8', boxShadow: '0 4px 0 #E5E5E5' }}
              >
                跳过
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97, y: 2 }}
                onClick={handleSubmit}
                className="flex-1 py-4 rounded-2xl font-black uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: '#58CC02', boxShadow: '0 4px 0 #46A302', border: '2px solid #46A302' }}
              >
                <Send className="w-4 h-4" />
                提交反馈
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
