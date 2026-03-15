'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import HomeView from '@/components/home/HomeView';
import CourseView from '@/components/course/CourseView';
import CourseDetailView from '@/components/course/CourseDetailView';
import LevelView from '@/components/learning/LevelView';
import LoadingScreen from '@/components/layout/LoadingScreen';
import CourseCreator from '@/components/course/CourseCreator';
import FeedbackModal from '@/components/feedback/FeedbackModal';
import AIAssistant from '@/components/assistant/AIAssistant';
import { mockUserProgress } from '@/data/mockLevels';
import { fetchUserData, fetchCourses, fetchCourseDetails, recordStudySession, updateProgress } from '@/lib/api';
import { PageView, Level, UserProgress, Course } from '@/types';

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
};

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
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  // Dismiss intro after data loads + minimum display time
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowIntro(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const loadUserData = async () => {
    try {
      try {
        const userData = await fetchUserData('user-1');
        setProgress(userData.user);
      } catch (error) {
        console.error('Error loading user data:', error);
      }

      const coursesData = await fetchCourses();
      const coursesList = coursesData.data || coursesData.courses || [];
      if (coursesList.length > 0) {
        setCourses(coursesList);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCourse = useCallback(async (course: Course) => {
    try {
      const courseDetails = await fetchCourseDetails(course.id);
      // 后端返回 {success, data: {course, chapters, levels}} 或直接 {course, chapters, levels}
      const details = courseDetails.data || courseDetails;
      if (details.course) {
        setActiveCourse({
          ...details.course,
          chapters: details.chapters || [],
          levels: details.levels || [],
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

  const handleDeleteCourse = async (courseId: string) => {
    const confirmed = window.confirm('确认删除这个课程吗？此操作不可撤销。');
    if (!confirmed) return;

    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    if (activeCourse?.id === courseId) {
      setActiveCourse(null);
      setCurrentView('courses');
    }
  };

  return (
    <>
      {/* Apple-style intro animation overlay */}
      {showIntro && <LoadingScreen />}

      <main
        className="min-h-screen bg-background"
      >
        {currentView !== 'learning' && (
          <Navbar
            currentView={currentView}
            onViewChange={handleViewChange}
            progress={progress}
          />
        )}

        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div key="home" {...pageTransition}>
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
            <motion.div key="courses" {...pageTransition}>
<CourseView
              courses={courses}
              onSelectCourse={handleSelectCourse}
              onDeleteCourse={handleDeleteCourse}
            />
            </motion.div>
          )}

          {currentView === 'course-detail' && (
            <motion.div key="course-detail" {...pageTransition}>
              <CourseDetailView
                course={activeCourse}
                onSelectLevel={handleSelectLevel}
                onBack={handleBackToCourses}
                onDeleteCourse={handleDeleteCourse}
              />
            </motion.div>
          )}

          {currentView === 'learning' && activeLevel && (
            <motion.div key="learning" {...pageTransition}>
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
    </>
  );
}
