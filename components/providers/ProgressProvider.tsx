'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type StepStatus = 'locked' | 'available' | 'completed' | 'current';

export interface Step {
  id: string;
  type: 'experiment' | 'discovery' | 'explanation' | 'challenge';
  title: string;
  description?: string;
  status: StepStatus;
  data?: Record<string, unknown>;
}

export interface ProgressState {
  currentStepId: string | null;
  completedSteps: string[];
  steps: Step[];
  totalProgress: number;
  canProceed: boolean;
}

interface ProgressContextType extends ProgressState {
  setCurrentStep: (stepId: string) => void;
  completeStep: (stepId: string) => void;
  unlockStep: (stepId: string) => void;
  setCanProceed: (canProceed: boolean) => void;
  getStepStatus: (stepId: string) => StepStatus;
  getNextStepId: () => string | null;
  getPrevStepId: () => string | null;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

interface ProgressProviderProps {
  children: ReactNode;
  initialSteps: Step[];
  onComplete?: () => void;
}

export function ProgressProvider({ 
  children, 
  initialSteps,
  onComplete 
}: ProgressProviderProps) {
  const [state, setState] = useState<ProgressState>({
    currentStepId: initialSteps.find(s => s.status === 'current')?.id || initialSteps[0]?.id || null,
    completedSteps: [],
    steps: initialSteps,
    totalProgress: 0,
    canProceed: false,
  });

  const calculateProgress = useCallback((completed: string[], total: number) => {
    return total > 0 ? Math.round((completed.length / total) * 100) : 0;
  }, []);

  const completeStep = useCallback((stepId: string) => {
    setState(prev => {
      const newCompleted = [...new Set([...prev.completedSteps, stepId])];
      const newProgress = calculateProgress(newCompleted, prev.steps.length);
      
      return {
        ...prev,
        completedSteps: newCompleted,
        totalProgress: newProgress,
        steps: prev.steps.map(step => ({
          ...step,
          status: step.id === stepId ? 'completed' : step.status
        })),
        canProceed: true,
      };
    });
  }, [calculateProgress]);

  useEffect(() => {
    if (state.completedSteps.length > 0 && 
        state.completedSteps.length === state.steps.length && 
        onComplete) {
      onComplete();
    }
  }, [state.completedSteps.length, state.steps.length, onComplete]);

  const setCurrentStep = useCallback((stepId: string) => {
    setState(prev => ({
      ...prev,
      currentStepId: stepId,
      canProceed: false,
      steps: prev.steps.map(step => ({
        ...step,
        status: step.id === stepId ? 'current' : 
                prev.completedSteps.includes(step.id) ? 'completed' :
                step.status === 'locked' ? 'locked' : 'available'
      }))
    }));
  }, []);

  const unlockStep = useCallback((stepId: string) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId && step.status === 'locked' 
          ? { ...step, status: 'available' as StepStatus }
          : step
      )
    }));
  }, []);

  const setCanProceed = useCallback((canProceed: boolean) => {
    setState(prev => ({ ...prev, canProceed }));
  }, []);

  const getStepStatus = useCallback((stepId: string) => {
    const step = state.steps.find(s => s.id === stepId);
    return step?.status || 'locked';
  }, [state.steps]);

  const getNextStepId = useCallback(() => {
    if (!state.currentStepId) return null;
    const currentIndex = state.steps.findIndex(s => s.id === state.currentStepId);
    return state.steps[currentIndex + 1]?.id || null;
  }, [state.currentStepId, state.steps]);

  const getPrevStepId = useCallback(() => {
    if (!state.currentStepId) return null;
    const currentIndex = state.steps.findIndex(s => s.id === state.currentStepId);
    return state.steps[currentIndex - 1]?.id || null;
  }, [state.currentStepId, state.steps]);

  const resetProgress = useCallback(() => {
    setState({
      currentStepId: initialSteps[0]?.id || null,
      completedSteps: [],
      steps: initialSteps,
      totalProgress: 0,
      canProceed: false,
    });
  }, [initialSteps]);

  return (
    <ProgressContext.Provider value={{
      ...state,
      setCurrentStep,
      completeStep,
      unlockStep,
      setCanProceed,
      getStepStatus,
      getNextStepId,
      getPrevStepId,
      resetProgress,
    }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
