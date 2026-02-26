'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, BookOpen, BarChart3, Plus, ChevronRight, Clock, Flame } from 'lucide-react';
import { Course, UserProgress, RecentCourse } from '@/types';
import { getStreakDays } from '@/data/mockLevels';

interface HomeViewProps {
  courses: Course[];
  recentCourses: RecentCourse[];
  progress: UserProgress;
  onSelectCourse: (course: Course) => void;
  onAddMaterial: () => void;
}

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] } },
};

export default function HomeView({
  courses,
  recentCourses,
  progress,
  onSelectCourse,
  onAddMaterial
}: HomeViewProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course>(courses[0] || {} as Course);
  const streakDays = getStreakDays(progress.currentStreak, progress.lastStudyDate);

  return (
    <div className="min-h-screen" style={{ background: '#FAFAFA' }}>
      <div className="max-w-[980px] mx-auto px-6 py-10">
        {/* Page Title */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="flex justify-between items-end mb-10"
        >
          <motion.div variants={fadeUp}>
            <h1
              className="text-[34px] font-bold tracking-tight leading-tight"
              style={{ color: '#1d1d1f' }}
            >
              Welcome back
            </h1>
            <p
              className="text-[15px] mt-1"
              style={{ color: '#86868b' }}
            >
              Continue where you left off
            </p>
          </motion.div>
          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAddMaterial}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium cursor-pointer transition-all"
            style={{
              background: '#007AFF',
              color: '#fff',
            }}
          >
            <Plus className="w-4 h-4" />
            Add Material
          </motion.button>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-12 gap-5"
        >
          {/* --- Left Column --- */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
            {/* Streak Card */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-5"
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-[32px] font-bold tracking-tight" style={{ color: '#1d1d1f' }}>
                    {progress.energy}
                  </span>
                  <span className="text-[13px] font-medium" style={{ color: '#86868b' }}>
                    energy
                  </span>
                </div>
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold"
                  style={{
                    background: 'rgba(255, 159, 10, 0.1)',
                    color: '#C77800',
                  }}
                >
                  <Flame className="w-3 h-3" />
                  {progress.currentStreak} day streak
                </div>
              </div>

              <div className="flex justify-between">
                {streakDays.map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all text-[13px] font-medium"
                      style={{
                        background: item.active ? '#007AFF' : '#F5F5F7',
                        color: item.active ? '#fff' : '#86868b',
                        boxShadow: item.isToday ? '0 0 0 2px #fff, 0 0 0 3.5px #007AFF' : 'none',
                      }}
                    >
                      {item.active ? (
                        <Zap className="w-4 h-4" style={{ fill: '#fff' }} />
                      ) : (
                        <span style={{ fontSize: '11px' }}>{'--'}</span>
                      )}
                    </div>
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: item.active ? '#1d1d1f' : '#86868b' }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Current Course Summary Card */}
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectCourse(selectedCourse)}
              className="rounded-2xl p-5 cursor-pointer transition-all"
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex items-center gap-3.5 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    background: '#F5F5F7',
                  }}
                >
                  {selectedCourse?.icon || ''}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-[15px] font-semibold truncate"
                    style={{ color: '#1d1d1f' }}
                  >
                    {selectedCourse?.title || 'No course selected'}
                  </h3>
                  <p className="text-[12px]" style={{ color: '#86868b' }}>
                    {selectedCourse?.chapters?.length || 0} chapters
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#C7C7CC' }} />
              </div>

              <div className="flex items-center gap-4 text-[12px] mb-4" style={{ color: '#86868b' }}>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  {selectedCourse?.lessons || 0} lessons
                </span>
                <span className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  {selectedCourse?.exercises || 0} exercises
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#F5F5F7' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedCourse?.progress || 0}%` }}
                    transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                    className="h-full rounded-full"
                    style={{ background: '#007AFF' }}
                  />
                </div>
                <span className="text-[12px] font-semibold" style={{ color: '#007AFF' }}>
                  {selectedCourse?.progress || 0}%
                </span>
              </div>
            </motion.div>
          </div>

          {/* --- Right Column --- */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
            {/* Featured Course Hero */}
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.005 }}
              onClick={() => onSelectCourse(selectedCourse)}
              className="rounded-2xl overflow-hidden cursor-pointer group"
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div className="relative p-8 flex flex-col md:flex-row items-center gap-8 min-h-[280px]">
                {/* Subtle background accent */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    background: 'radial-gradient(ellipse at 30% 50%, #007AFF, transparent 70%)',
                  }}
                />

                <motion.div
                  className="w-40 h-40 rounded-3xl flex items-center justify-center text-6xl relative z-10"
                  style={{
                    background: '#F5F5F7',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                >
                  {selectedCourse?.icon || ''}
                </motion.div>

                <div className="flex-1 text-center md:text-left relative z-10">
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-4"
                    style={{
                      background: 'rgba(0, 122, 255, 0.08)',
                      color: '#007AFF',
                    }}
                  >
                    <Clock className="w-3 h-3" />
                    In Progress
                  </div>
                  <h2
                    className="text-[28px] font-bold tracking-tight mb-2"
                    style={{ color: '#1d1d1f' }}
                  >
                    {selectedCourse?.title || 'No course selected'}
                  </h2>
                  <p
                    className="text-[15px] mb-6 line-clamp-2 leading-relaxed"
                    style={{ color: '#86868b' }}
                  >
                    {selectedCourse?.description || 'Start your learning journey'}
                  </p>
                  <div className="flex items-center gap-4 max-w-sm mx-auto md:mx-0">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#F5F5F7' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedCourse?.progress || 0}%` }}
                        className="h-full rounded-full"
                        style={{ background: '#007AFF' }}
                        transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
                      />
                    </div>
                    <span
                      className="text-[15px] font-semibold tabular-nums"
                      style={{ color: '#007AFF' }}
                    >
                      {selectedCourse?.progress || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Continue Learning */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-6"
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <h3
                className="text-[17px] font-semibold mb-4"
                style={{ color: '#1d1d1f' }}
              >
                Continue Learning
              </h3>

              {recentCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentCourses.slice(0, 6).map((recent) => {
                    const course = courses.find(c => c.id === recent.courseId);
                    const isSelected = selectedCourse?.id === recent.courseId;
                    return (
                      <motion.button
                        key={recent.courseId}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          if (course) setSelectedCourse(course);
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl transition-all text-left cursor-pointer"
                        style={{
                          background: isSelected ? 'rgba(0, 122, 255, 0.06)' : '#F5F5F7',
                          border: isSelected ? '1px solid rgba(0, 122, 255, 0.2)' : '1px solid transparent',
                        }}
                      >
                        <div
                          className="w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center text-xl"
                          style={{ background: '#fff' }}
                        >
                          {course?.icon || ''}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[13px] font-semibold truncate"
                            style={{ color: '#1d1d1f' }}
                          >
                            {recent.courseTitle}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className="flex-1 h-1 rounded-full overflow-hidden"
                              style={{ background: 'rgba(0,0,0,0.06)' }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${recent.progress}%`, background: '#007AFF' }}
                              />
                            </div>
                            <span
                              className="text-[10px] font-semibold tabular-nums"
                              style={{ color: '#86868b' }}
                            >
                              {recent.progress}%
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="text-center py-8 text-[13px]"
                  style={{ color: '#86868b' }}
                >
                  No recent courses. Start learning to see your progress here.
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
