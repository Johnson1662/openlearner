'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, RotateCcw, Zap } from 'lucide-react';
import { Level, LessonStep, QuizOption } from '@/types';
import { Segmenter, Connector, Categorizer, FeedbackPanel, Confetti } from '../interactions';
import UserFeedbackModal, { UserFeedback } from './UserFeedbackModal';
import ContentRenderer from './ContentRenderer';
import LoadingState from '../ui/LoadingState';
import { generateLevel } from '@/lib/api';

interface LevelViewProps {
  level: Level;
  courseId?: string;
  onComplete: (xp: number) => void;
  onBack: () => void;
}

function normalizeGeneratedStep(raw: any, fallbackIndex: number): LessonStep | null {
  if (!raw || raw.type === 'step_plan' || raw.type === 'step_plan_done' || raw.type === 'done') {
    return null;
  }

  if (raw.type === 'info' || raw.type === 'multiple_choice' || raw.type === 'segmenter' || raw.type === 'connector' || raw.type === 'categorizer') {
    return {
      id: raw.id || raw.stepId || `generated-${fallbackIndex}`,
      type: raw.type,
      title: raw.title,
      content: raw.content || '',
      question: raw.question,
      hint: raw.hint,
      options: Array.isArray(raw.options) ? raw.options : undefined,
      correctAnswer: raw.correctAnswer || raw.answer,
    };
  }

  if (raw.type === 'narrative') {
    return {
      id: raw.id || raw.stepId || `generated-${fallbackIndex}`,
      type: 'info',
      title: raw.title || '知识讲解',
      content: raw.content || '',
      hint: raw.hint,
    };
  }

  if (raw.type === 'quiz') {
    const normalizedOptions = Array.isArray(raw.options)
      ? raw.options.map((opt: any, idx: number) => {
          if (typeof opt === 'string') {
            return { id: `opt-${idx}`, text: opt, isCorrect: idx === raw.answer };
          }
          return {
            id: opt.id || `opt-${idx}`,
            text: opt.text || String(opt.label || opt.value || ''),
            isCorrect: typeof opt.isCorrect === 'boolean' ? opt.isCorrect : idx === raw.answer,
          };
        })
      : undefined;

    return {
      id: raw.id || raw.stepId || `generated-${fallbackIndex}`,
      type: 'multiple_choice',
      title: raw.title || '知识小测',
      content: raw.content || '',
      question: raw.question,
      options: normalizedOptions,
      correctAnswer:
        typeof raw.answer === 'number' && normalizedOptions?.[raw.answer]
          ? normalizedOptions[raw.answer].id
          : raw.answer,
    };
  }

  if (raw.type !== 'step' && !raw.stepType) {
    return null;
  }

  const stepKind = raw.stepType || 'info';
  const type: LessonStep['type'] = stepKind === 'quiz' ? 'multiple_choice' : 'info';
  const options = Array.isArray(raw.options) ? raw.options : undefined;

  return {
    id: raw.stepId || raw.id || `generated-${fallbackIndex}`,
    type,
    title: raw.title,
    content: raw.content || '',
    question: raw.question,
    hint: raw.hint,
    options,
    correctAnswer: raw.answer,
  };
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
  const [userAnswers, setUserAnswers] = useState<{ stepId: string; answer: string; isCorrect: boolean }[]>([]);

  useEffect(() => {
    const loadLevelContent = async (retryCount = 0) => {
      if (!isLoadingContent) {
        setIsLoadingContent(true);
        setLevelSteps([]);
        
        // 默认走非流式，避免 SSE 连接异常导致页面长期卡在加载态。
        const useStream = process.env.NEXT_PUBLIC_USE_LEVEL_STREAM === 'true';
        if (courseId && useStream) {
          try {
            const eventSource = new EventSource(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/ai/generate-level/stream/${courseId}/${level.id}?level_title=${encodeURIComponent(level.title)}&depth=concept`
            );
            
            eventSource.addEventListener('step', (event: MessageEvent) => {
              try {
                const data = JSON.parse(event.data);
                console.log('Stream step:', data);

                const payload = data?.data ?? data;
                const normalizedStep = normalizeGeneratedStep(payload, levelSteps.length);
                if (normalizedStep) {
                  setLevelSteps(prev =>
                    prev.some(step => step.id === normalizedStep.id)
                      ? prev
                      : [...prev, normalizedStep]
                  );
                }

                // Stream endpoint may signal completion via done/type/progress
                if (data?.type === 'done' || data?.step === 'done' || data?.progress >= 100) {
                  setIsLoadingContent(false);
                  eventSource.close();
                }
              } catch (e) {
                console.error('Parse stream data error:', e);
              }
            });
            
            eventSource.addEventListener('error', (event: MessageEvent) => {
              console.error('Stream error:', event);
              setIsLoadingContent(false);
              eventSource.close();
            });
            
            return; // 流式不需要 await
          } catch (e) {
            console.error('Stream connection error:', e);
          }
        }
        
        // Fallback: 非流式调用
        try {
          const data = await generateLevel({
            courseId,
            levelId: level.id,
            levelTitle: level.title,
            levelDescription: level.description,
            chapterTitle: '',
            difficulty: 'intermediate',
            depth: 'concept',
          });
          if (data.success) {
            const normalizedSteps = (data.data?.steps || [])
              .map((step, index) => normalizeGeneratedStep(step, index))
              .filter((step): step is LessonStep => !!step);
            if (normalizedSteps.length > 0) {
              setLevelSteps(normalizedSteps);
            } else if (level.steps && level.steps.length > 0) {
              // Keep existing steps as fallback when generation returns empty.
              setLevelSteps(level.steps);
            }
          } else if (retryCount < 2) {
            setTimeout(() => loadLevelContent(retryCount + 1), 1000);
            return;
          }
        } catch {
          if (retryCount < 2) {
            setTimeout(() => loadLevelContent(retryCount + 1), 1000);
            return;
          }
          if (level.steps && level.steps.length > 0) {
            setLevelSteps(level.steps);
          }
        } finally {
          setIsLoadingContent(false);
        }
      }
    };
    loadLevelContent();
  }, [level, courseId]);

  const currentStep = useMemo(() => {
    // 添加边界检查，防止索引越界
    if (currentStepIndex < 0 || currentStepIndex >= levelSteps.length) {
      return null;
    }
    return levelSteps[currentStepIndex] || null;
  }, [levelSteps, currentStepIndex]);
  
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
      setIsCorrect(isAnswerCorrect);
      if (isAnswerCorrect) setXpEarned(prev => prev + 15);
      setShowFeedback(true);
      if (currentStep.question) {
        setUserAnswers(prev => [...prev, { stepId: currentStep.id, answer: selectedAnswer || '', isCorrect: isAnswerCorrect }]);
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
      setTimeout(() => setShowUserFeedback(true), 1500);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setStepData(null);
  };

  const handleUserFeedbackSubmit = (_feedback: UserFeedback) => {
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

  const canCheck = currentStep?.type === 'info' || !!selectedAnswer || !!stepData;

  // 添加 currentStep 为空的检查，防止渲染空白
  if (isLoadingContent || levelSteps.length === 0 || !currentStep) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <LoadingState
          message="正在生成关卡..."
          steps={['Analyzing content...', 'Structuring knowledge...', 'Generating exercises...']}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col select-none font-sans">
      {/* Header - Progress */}
      <header className="px-4 py-4 flex items-center gap-4 max-w-3xl mx-auto w-full">
        <button
          onClick={onBack}
          className="flex-shrink-0 p-1 cursor-pointer transition-colors text-duo-grayDark"
        >
          <X className="w-9 h-9" strokeWidth={3} />
        </button>

        {/* Glowing progress bar */}
        <div className="flex-1 progress-bar-track h-5">
          <motion.div
            className="progress-bar-fill h-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          />
        </div>

        {/* XP badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-[14px] flex-shrink-0 bg-duo-goldLight text-duo-goldDark"
          style={{ boxShadow: '0 2px 0 #F0E0A0' }}
        >
          <Zap className="w-4 h-4 fill-current" />
          {xpEarned}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="flex flex-col gap-6"
            >
              {/* Step label */}
              <div
                className="inline-flex self-start items-center gap-2 px-3 py-1.5 rounded-xl font-extrabold text-[12px] uppercase tracking-widest bg-primary/20 text-primary"
                style={{ boxShadow: '0 2px 0 #D4C5F5' }}
              >
                Step {currentStepIndex + 1} / {levelSteps.length}
              </div>

              {/* Title */}
              <h2 className="text-[26px] font-black leading-snug text-duo-text">
                {currentStep.title || level.title}
              </h2>

              {/* Content */}
              {currentStep.content && (
                <div className="text-[17px] font-semibold leading-relaxed text-duo-text">
                  <ContentRenderer content={currentStep.content} />
                </div>
              )}

              {/* Question */}
              {currentStep.question && (
                <div
                  className="rounded-3xl p-5 border-2 bg-muted border-duo-gray"
                  style={{ boxShadow: '0 3px 0 #E5E5E5' }}
                >
                  <p className="text-[20px] font-black text-duo-text">
                    {currentStep.question}
                  </p>
                </div>
              )}

              {/* Options */}
              {currentStep.type === 'multiple_choice' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentStep.options?.map((option) => (
                    <ChoiceCard
                      key={option.id}
                      option={option}
                      isSelected={selectedAnswer === option.id}
                      showResult={showFeedback}
                      isCorrect={showFeedback && option.isCorrect}
                      isError={showFeedback && !isCorrect && selectedAnswer === option.id}
                      disabled={showFeedback && isCorrect}
                      onClick={() => handleChoiceSelect(option.id)}
                    />
                  ))}
                </div>
              )}

              {currentStep.type === 'segmenter' && (
                <div className="flex flex-col items-center gap-8">
                  <Segmenter content={currentStep.content} onSegment={(segs) => setStepData(segs)} />
                  <button
                    onClick={() => setStepData(null)}
                    className="flex items-center gap-2 font-extrabold text-[13px] uppercase tracking-wide transition-colors text-duo-grayDark"
                  >
                    <RotateCcw className="w-4 h-4" strokeWidth={3} />
                    Start over
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom action bar */}
      <footer className="relative" style={{ minHeight: '140px' }}>
        <AnimatePresence>
          {!showFeedback ? (
            <motion.div
              initial={{ y: 120 }}
              animate={{ y: 0 }}
              exit={{ y: 120 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-0 flex items-center justify-between px-4 py-6 bg-background border-t-[3px] border-duo-gray"
            >
              <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
                {/* Prev button */}
                <motion.button
                  whileTap={currentStepIndex > 0 ? { scale: 0.93, y: 3 } : {}}
                  onClick={handlePrev}
                  disabled={currentStepIndex === 0}
                  className="flex items-center gap-2 px-6 py-4 rounded-2xl font-extrabold text-[15px] uppercase tracking-wider transition-all cursor-pointer bg-muted"
                  style={{
                    color: currentStepIndex === 0 ? '#AFAFAF' : '#3C3C3C',
                    boxShadow: currentStepIndex === 0 ? 'none' : '0 4px 0 #E5E5E5',
                    borderBottom: currentStepIndex === 0 ? 'none' : '4px solid #E5E5E5',
                    opacity: currentStepIndex === 0 ? 0.4 : 1,
                    cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronRight className="w-5 h-5 rotate-180" strokeWidth={3} />
                  Back
                </motion.button>

                {/* Check / Continue button */}
                <motion.button
                  whileHover={canCheck ? { scale: 1.03 } : {}}
                  whileTap={canCheck ? { scale: 0.94, y: 4 } : {}}
                  onClick={handleCheck}
                  disabled={!canCheck}
                  className="px-12 py-4 rounded-2xl font-extrabold text-[18px] uppercase tracking-wider text-white transition-all"
                  style={{
                    background: canCheck ? '#58CC02' : '#E5E5E5',
                    color: canCheck ? '#fff' : '#AFAFAF',
                    boxShadow: canCheck ? '0 5px 0 #46A302' : 'none',
                    borderBottom: canCheck ? '5px solid #46A302' : '5px solid transparent',
                    cursor: canCheck ? 'pointer' : 'not-allowed',
                  }}
                >
                  {currentStep?.type === 'info' ? 'Continue' : 'Check'}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <FeedbackPanel
              type={isCorrect ? 'success' : 'error'}
              message={isCorrect ? 'Correct!' : "That's not it."}
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

function ChoiceCard({
  option,
  isSelected,
  showResult,
  isCorrect,
  isError,
  disabled,
  onClick,
}: {
  option: QuizOption;
  isSelected: boolean;
  showResult: boolean;
  isCorrect: boolean;
  isError: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  let stateClass = 'choice-card';
  if (isSelected && !showResult) stateClass += ' choice-card-selected';
  if (isCorrect) stateClass += ' choice-card-correct';
  if (isError) stateClass += ' choice-card-error';

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.96, y: 3 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={stateClass}
      style={{
        borderBottomWidth: isSelected && !showResult ? '4px' : undefined,
        borderBottomColor: isSelected && !showResult ? '#8257E5' : undefined,
        boxShadow: isCorrect
          ? '0 4px 0 #46A302'
          : isError
          ? '0 4px 0 #D03B3B'
          : isSelected
          ? '0 4px 0 #6B47C6'
          : '0 4px 0 #E5E5E5',
      }}
    >
      <span className="text-[18px] font-extrabold">{option.text}</span>
    </motion.button>
  );
}
