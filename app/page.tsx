'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import HomeView from '@/components/HomeView';
import CourseView from '@/components/CourseView';
import CourseDetailView from '@/components/CourseDetailView';
import LevelView from '@/components/LevelView';
import LoadingScreen from '@/components/LoadingScreen';
import CourseCreator from '@/components/CourseCreator';
import FeedbackModal from '@/components/FeedbackModal';
import AIAssistant from '@/components/AIAssistant';
import { mockUserProgress } from '@/data/mockLevels';
import { fetchUserData, fetchCourses, fetchCourseDetails, recordStudySession, updateProgress } from '@/lib/api';
import { PageView, Level, UserProgress, Course } from '@/types';

export default function Home() {
  const [currentView, setCurrentView] = useState<PageView>('home');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showCourseCreator, setShowCourseCreator] = useState(false);
  const [progress, setProgress] = useState<UserProgress>(mockUserProgress);
  const [courses, setCourses] = useState<Course[]>([]);
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await fetchUserData('user-1');
      setProgress(userData.user);
      
      const coursesData = await fetchCourses();
      if (coursesData.courses && coursesData.courses.length > 0) {
        setCourses(coursesData.courses);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCourse = useCallback(async (course: Course) => {
    try {
      const courseDetails = await fetchCourseDetails(course.id);
      if (courseDetails.course) {
        setActiveCourse({
          ...courseDetails.course,
          chapters: courseDetails.chapters || [],
          levels: courseDetails.levels || [],
        });
      } else {
        setActiveCourse(course);
      }
      setCurrentView('course-detail');
    } catch (error) {
      console.error('Error fetching course details:', error);
      setActiveCourse(course);
      setCurrentView('course-detail');
    }
  }, []);

  const handleSelectLevel = useCallback((level: Level) => {
    setActiveLevel(level);
    setCurrentView('learning');
  }, []);

  const handleLevelComplete = useCallback(async (xpEarned: number) => {
    const passed = xpEarned > 0;
    setIsCorrect(passed);
    setShowFeedback(true);

    if (passed && activeLevel && activeCourse) {
      try {
        await recordStudySession('user-1', activeCourse.id, activeLevel.id, 15, xpEarned);
        await updateProgress('user-1', activeCourse.id, activeLevel.id, 'completed', xpEarned);

        setProgress(prev => ({
          ...prev,
          totalXP: prev.totalXP + xpEarned,
          completedLevels: [...(prev.completedLevels || []), activeLevel.id],
        }));
      } catch (error) {
        console.error('Error recording progress:', error);
      }
    }
  }, [activeLevel, activeCourse]);

  const handleFeedbackClose = useCallback(async () => {
    setShowFeedback(false);
    setActiveLevel(null);
    
    // Reload course details to get updated level status
    if (activeCourse) {
      try {
        const courseDetails = await fetchCourseDetails(activeCourse.id);
        if (courseDetails.course) {
          setActiveCourse({
            ...courseDetails.course,
            chapters: courseDetails.chapters || [],
            levels: courseDetails.levels || [],
          });
        }
      } catch (error) {
        console.error('Error reloading course:', error);
      }
    }
    
    setCurrentView('course-detail');
  }, [activeCourse]);

  const handleBackToCourses = useCallback(() => {
    setCurrentView('courses');
    setActiveLevel(null);
  }, []);

  const handleBackToCourseDetail = useCallback(() => {
    setCurrentView('course-detail');
    setActiveLevel(null);
  }, []);

  const handleViewChange = useCallback((view: PageView) => {
    setCurrentView(view);
    if (view === 'home' || view === 'courses') {
      setActiveLevel(null);
    }
  }, []);

  const handleAddMaterial = useCallback(() => {
    setShowCourseCreator(true);
  }, []);

  const handleCourseCreated = useCallback((newCourse: Course) => {
    setCourses(prev => [newCourse, ...prev]);
    setRecentCourses(prev => [
      {
        courseId: newCourse.id,
        courseTitle: newCourse.title,
        thumbnail: newCourse.thumbnail,
        progress: 0,
        lastAccessedAt: new Date(),
      },
      ...prev,
    ]);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {currentView !== 'learning' && (
        <Navbar
          currentView={currentView}
          onViewChange={handleViewChange}
          progress={progress}
        />
      )}

      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HomeView
              courses={courses}
              recentCourses={recentCourses}
              progress={progress}
              onSelectCourse={handleSelectCourse}
              onAddMaterial={handleAddMaterial}
            />
          </motion.div>
        )}

        {currentView === 'courses' && (
          <motion.div
            key="courses"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CourseView
              courses={courses}
              onSelectCourse={handleSelectCourse}
            />
          </motion.div>
        )}

        {currentView === 'course-detail' && (
          <motion.div
            key="course-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CourseDetailView
              course={activeCourse}
              onSelectLevel={handleSelectLevel}
              onBack={handleBackToCourses}
            />
          </motion.div>
        )}

        {currentView === 'learning' && activeLevel && (
          <motion.div
            key="learning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LevelView
              level={activeLevel}
              courseId={activeCourse?.id}
              onComplete={handleLevelComplete}
              onBack={handleBackToCourseDetail}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {currentView !== 'home' && (
        <AIAssistant currentTopic={activeLevel?.title} />
      )}

      <FeedbackModal
        isOpen={showFeedback}
        isCorrect={isCorrect}
        xpEarned={activeLevel?.xpReward || 0}
        onClose={handleFeedbackClose}
      />

      <CourseCreator
        isOpen={showCourseCreator}
        onClose={() => setShowCourseCreator(false)}
        onCourseCreated={handleCourseCreated}
      />
    </main>
  );
}
