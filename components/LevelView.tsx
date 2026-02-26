'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  Sparkles, 
  RotateCcw,
  Zap,
  Lightbulb
} from 'lucide-react';
import { Level, LessonStep, QuizOption } from '@/types';
import { 
  Segmenter, 
  Connector, 
  Categorizer, 
  FeedbackPanel, 
  Confetti
} from './interactions';
import UserFeedbackModal, { UserFeedback } from './UserFeedbackModal';
import ContentRenderer from './ContentRenderer';

interface LevelViewProps {
  level: Level;
  courseId?: string;
  onComplete: (xp: number) => void;
  onBack: () => void;
}

export default function LevelView({ level, courseId, onComplete, onBack }: LevelViewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [stepData, setStepData] = useState<any>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [levelSteps, setLevelSteps] = useState<LessonStep[]>(level.steps || []);
  const [showUserFeedback, setShowUserFeedback] = useState(false);
  const [feedbackAfterQuestion, setFeedbackAfterQuestion] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{stepId: string; answer: string; isCorrect: boolean}[]>([]);

  // Load level content on-demand if steps are empty
  useEffect(() => {
    const loadLevelContent = async (retryCount = 0) => {
      if (level.steps.length === 0 && !isLoadingContent) {
        setIsLoadingContent(true);
        try {
          const response = await fetch('/api/ai/generate-level', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courseId,
              levelId: level.id,
              levelTitle: level.title,
              levelDescription: level.description,
              chapterTitle: '',
              difficulty: 'intermediate',
            }),
          });
          const data = await response.json();
          if (data.success) {
            setLevelSteps(data.data.steps);
          } else if (retryCount < 2) {
            console.log(`Retrying level content generation (attempt ${retryCount + 2})`);
            setTimeout(() => loadLevelContent(retryCount + 1), 1000);
            return;
          }
        } catch (error) {
          console.error('Failed to load level content:', error);
          if (retryCount < 2) {
            console.log(`Retrying after error (attempt ${retryCount + 2})`);
            setTimeout(() => loadLevelContent(retryCount + 1), 1000);
            return;
          }
        } finally {
          setIsLoadingContent(false);
        }
      }
    };
    loadLevelContent();
  }, [level, courseId]);

  const currentStep = useMemo(() => levelSteps[currentStepIndex], [levelSteps, currentStepIndex]);
  const progress = levelSteps.length > 0 ? ((currentStepIndex + 1) / levelSteps.length) * 100 : 0;

  useEffect(() => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setStepData(null);
  }, [currentStepIndex]);

  const handleChoiceSelect = (optionId: string) => {
    if (showFeedback && isCorrect) return;
    setSelectedAnswer(optionId);
  };

  const handleCheck = () => {
    if (!currentStep) return;
    if (currentStep.type === 'multiple_choice') {
      const option = currentStep.options?.find(o => o.id === selectedAnswer);
      const isAnswerCorrect = option?.isCorrect || false;
      if (isAnswerCorrect) {
        setIsCorrect(true);
        setXpEarned(prev => prev + 15);
      } else {
        setIsCorrect(false);
      }
      setShowFeedback(true);
      
      if (currentStep.question) {
        setUserAnswers(prev => [...prev, {
          stepId: currentStep.id,
          answer: selectedAnswer || '',
          isCorrect: isAnswerCorrect
        }]);
      }
    } else if (currentStep.type === 'segmenter') {
      setIsCorrect(true);
      setShowFeedback(true);
      setXpEarned(prev => prev + 15);
    } else if (currentStep.type === 'info') {
      handleContinue();
    }
  };

  const handleContinue = (skipFeedback = false) => {
    if (!skipFeedback && currentStep.type !== 'info' && !feedbackAfterQuestion) {
      setFeedbackAfterQuestion(true);
      setShowUserFeedback(true);
      return;
    }
    
    if (currentStepIndex < levelSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setFeedbackAfterQuestion(false);
    } else {
      setShowConfetti(true);
      setTimeout(() => {
        setShowUserFeedback(true);
      }, 1500);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setStepData(null);
  };

  const handleUserFeedbackSubmit = (feedback: UserFeedback) => {
    console.log('User feedback after question:', feedback, 'Answers:', userAnswers);
    setShowUserFeedback(false);
    
    if (currentStepIndex >= levelSteps.length - 1) {
      onComplete(xpEarned);
    } else {
      handleContinue(true);
    }
  };

  const handleUserFeedbackSkip = () => {
    setShowUserFeedback(false);
    
    if (currentStepIndex >= levelSteps.length - 1) {
      onComplete(xpEarned);
    } else {
      handleContinue(true);
    }
  };

  if (isLoadingContent || levelSteps.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-16 h-16 border-4 border-[#58CC02] border-t-transparent rounded-full"
        />
        <p className="mt-6 text-[#4B4B4B] text-xl font-semibold">正在生成关卡内容...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans select-none">
      {/* Back button - left side */}
      <button
        onClick={handlePrev}
        disabled={currentStepIndex === 0}
        className={`fixed left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors ${currentStepIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        <ChevronRight className="w-6 h-6 text-white/70 rotate-180" />
      </button>

      <header className="px-6 py-6 flex items-center gap-6 max-w-5xl mx-auto w-full">
        <button onClick={onBack} className="text-[#AFAFAF] hover:text-[#555] transition-colors">
          <X className="w-10 h-10 stroke-[3]" />
        </button>

        <div className="flex-1 h-4 bg-[#E5E5E5] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#58CC02] rounded-full shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          />
        </div>

        <div className="flex items-center gap-2 text-[#E5E5E5]">
          <Zap className="w-8 h-8 fill-current" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-12">
        <div className="max-w-2xl mx-auto w-full flex flex-col min-h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              {currentStep.visualAssets?.map((asset, idx) => (
                <div key={idx} className="mb-12 flex justify-center">
                  {asset.type === 'image' && (
                    <motion.img 
                      src={asset.src} 
                      alt={asset.alt} 
                      className="max-h-72 object-contain"
                      initial={{ scale: 0.8, rotate: -5 }}
                      animate={{ scale: 1, rotate: 0 }}
                    />
                  )}
                </div>
              ))}

              <h2 className="text-[32px] font-black text-[#4B4B4B] mb-8 leading-[1.2] tracking-tight">
                {currentStep.title || level.title}
              </h2>

              <div className="text-[20px] text-[#4B4B4B] font-medium mb-10 leading-[1.6] whitespace-pre-line">
                <ContentRenderer content={currentStep.content} />
              </div>

              {currentStep.question && (
                <div className="text-[24px] font-black text-[#4B4B4B] mb-10 leading-tight">
                  {currentStep.question}
                </div>
              )}

              <div className="flex-1">
                {currentStep.type === 'multiple_choice' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentStep.options?.map((option) => (
                      <ChoiceButton
                        key={option.id}
                        option={option}
                        isSelected={selectedAnswer === option.id}
                        isCorrect={isCorrect && showFeedback}
                        isError={!isCorrect && showFeedback && selectedAnswer === option.id}
                        disabled={showFeedback && isCorrect}
                        onClick={() => handleChoiceSelect(option.id)}
                      />
                    ))}
                  </div>
                )}

                {currentStep.type === 'segmenter' && (
                  <div className="flex flex-col items-center gap-12">
                    <Segmenter
                      content={currentStep.content}
                      onSegment={(segs) => setStepData(segs)}
                    />
                    <button 
                      onClick={() => setStepData(null)}
                      className="flex items-center gap-2 text-[#AFAFAF] hover:text-[#555] font-black tracking-wide text-sm uppercase transition-colors"
                    >
                      <RotateCcw className="w-5 h-5 stroke-[3]" />
                      Start over
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="h-44 relative bg-white">
        <AnimatePresence>
          {!showFeedback ? (
            <motion.div 
              initial={{ y: 150 }}
              animate={{ y: 0 }}
              exit={{ y: 150 }}
              className="absolute inset-0 px-6 py-8 border-t-[3px] border-[#E5E5E5] bg-white flex items-center justify-center"
            >
              <div className="max-w-4xl w-full flex justify-end">
                <motion.button
                  whileHover={currentStep.type === 'info' || selectedAnswer || stepData ? { scale: 1.05 } : {}}
                  whileTap={currentStep.type === 'info' || selectedAnswer || stepData ? { scale: 0.95 } : {}}
                  onClick={handleCheck}
                  disabled={currentStep.type !== 'info' && !selectedAnswer && !stepData}
                  className={`
                    py-5 px-16 rounded-[20px] font-black text-white text-xl transition-all duration-75 uppercase tracking-wider
                    ${(currentStep.type === 'info' || selectedAnswer || stepData)
                      ? 'bg-[#1CB0F6] shadow-[0_5px_0_0_#1899D6] active:shadow-none active:translate-y-[5px]' 
                      : 'bg-[#E5E5E5] text-[#AFAFAF] cursor-not-allowed'}
                  `}
                >
                  {currentStep.type === 'info' ? 'Continue' : 'Check'}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <FeedbackPanel
              type={isCorrect ? 'success' : 'error'}
              message={isCorrect ? "Correct!" : "That's not it."}
              show={true}
              onContinue={handleContinue}
              onRetry={handleRetry}
            />
          )}
        </AnimatePresence>
      </footer>

      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <UserFeedbackModal
        isOpen={showUserFeedback}
        onSubmit={handleUserFeedbackSubmit}
        onSkip={handleUserFeedbackSkip}
      />
    </div>
  );
}

function ChoiceButton({ 
  option, 
  isSelected, 
  isCorrect, 
  isError, 
  disabled, 
  onClick 
}: { 
  option: QuizOption; 
  isSelected: boolean;
  isCorrect: boolean;
  isError: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative p-6 rounded-[20px] border-[3px] text-left transition-all duration-75
        ${isSelected 
          ? isCorrect 
            ? 'bg-[#D7FFB8] border-[#58CC02] text-[#58CC02]' 
            : isError 
              ? 'bg-[#FFDFE0] border-[#EA2B2B] text-[#EA2B2B]'
              : 'bg-[#E1F5FE] border-[#1CB0F6] text-[#1CB0F6] shadow-[0_4px_0_0_#1899D6]' 
          : 'bg-white border-[#E5E5E5] text-[#4B4B4B] hover:bg-[#F7F7F7] shadow-[0_4px_0_0_#E5E5E5]'}
        ${disabled && isCorrect ? 'shadow-none' : ''}
      `}
    >
      <div className="text-[20px] font-bold">{option.text}</div>
    </motion.button>
  );
}
