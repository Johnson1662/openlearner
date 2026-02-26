'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Plus, ChevronRight, Star, BookOpen, Zap } from 'lucide-react';
import { Course, UserProgress, RecentCourse } from '@/types';
import { getStreakDays } from '@/data/mockLevels';

interface HomeViewProps {
  courses: Course[];
  recentCourses: RecentCourse[];
  progress: UserProgress;
  onSelectCourse: (course: Course) => void;
  onAddMaterial: () => void;
}

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } },
};

export default function HomeView({ courses, recentCourses, progress, onSelectCourse, onAddMaterial }: HomeViewProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course>(courses[0] || {} as Course);
  const streakDays = getStreakDays(progress.currentStreak, progress.lastStudyDate);

  return (
    <div className="min-h-screen" style={{ background: '#F7F7F8' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="flex justify-between items-center mb-8"
        >
          <motion.div variants={fadeUp}>
            <h1 className="text-[28px] font-black tracking-tight" style={{ color: '#3C3C3C' }}>
              继续学习
            </h1>
            <p className="text-[14px] font-bold mt-0.5 uppercase tracking-wide" style={{ color: '#AFAFAF' }}>
              Keep it up!
            </p>
          </motion.div>
          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94, y: 3 }}
            onClick={onAddMaterial}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-[14px] text-white uppercase tracking-wider cursor-pointer"
            style={{
              background: '#58CC02',
              boxShadow: '0 4px 0 #46A302',
              borderBottom: '4px solid #46A302',
            }}
          >
            <Plus className="w-4 h-4" />
            添加材料
          </motion.button>
        </motion.div>

        <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-col gap-5">

          {/* Streak Card */}
          <motion.div
            variants={fadeUp}
            className="rounded-3xl p-6 bg-white border-2"
            style={{ borderColor: '#E5E5E5', boxShadow: '0 3px 0 #E5E5E5' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: '#FFF7D6', boxShadow: '0 3px 0 #F0E0A0' }}
                >
                  <Flame className="w-7 h-7 fill-current" style={{ color: '#FF9600' }} />
                </div>
                <div>
                  <div className="text-[28px] font-black leading-none" style={{ color: '#3C3C3C' }}>
                    {progress.currentStreak}
                  </div>
                  <div className="text-[12px] font-extrabold uppercase tracking-wide" style={{ color: '#AFAFAF' }}>
                    Day Streak
                  </div>
                </div>
              </div>
              <div
                className="px-3 py-1.5 rounded-xl text-[13px] font-extrabold uppercase tracking-wide"
                style={{ background: '#FFF7D6', color: '#D4A500' }}
              >
                {progress.energy} XP today
              </div>
            </div>

            {/* Streak days */}
            <div className="grid grid-cols-7 gap-1.5">
              {streakDays.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <motion.div
                    className="w-full aspect-square rounded-xl flex items-center justify-center"
                    animate={item.isToday ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.6, delay: idx * 0.05 }}
                    style={{
                      background: item.active ? '#58CC02' : '#F7F7F8',
                      boxShadow: item.active ? '0 3px 0 #46A302' : '0 3px 0 #E5E5E5',
                      border: item.isToday ? '3px solid #58CC02' : '2px solid transparent',
                    }}
                  >
                    {item.active
                      ? <Flame className="w-4 h-4 fill-current text-white" />
                      : <span className="text-[10px] font-extrabold" style={{ color: '#AFAFAF' }}>--</span>
                    }
                  </motion.div>
                  <span className="text-[10px] font-extrabold uppercase" style={{ color: item.active ? '#3C3C3C' : '#AFAFAF' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Featured Course */}
          {selectedCourse?.id && (
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectCourse(selectedCourse)}
              className="rounded-3xl p-6 bg-white border-2 cursor-pointer"
              style={{ borderColor: '#1CB0F6', boxShadow: '0 4px 0 #1899D6' }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: '#DDF4FF', boxShadow: '0 3px 0 #B0E0F8' }}
                >
                  {selectedCourse?.icon || ''}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#1CB0F6' }}>
                    Current Course
                  </div>
                  <h2 className="text-[20px] font-black truncate" style={{ color: '#3C3C3C' }}>
                    {selectedCourse?.title || ''}
                  </h2>
                  <p className="text-[13px] font-semibold truncate" style={{ color: '#AFAFAF' }}>
                    {selectedCourse?.description || ''}
                  </p>
                </div>
                <ChevronRight className="w-6 h-6 flex-shrink-0" style={{ color: '#1CB0F6' }} />
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12px] font-extrabold uppercase tracking-wider" style={{ color: '#AFAFAF' }}>
                    Progress
                  </span>
                  <span className="text-[14px] font-black" style={{ color: '#1CB0F6' }}>
                    {selectedCourse?.progress || 0}%
                  </span>
                </div>
                <div className="progress-bar-track">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedCourse?.progress || 0}%` }}
                    transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
                    className="progress-bar-fill"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* All Courses */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-black uppercase tracking-wide" style={{ color: '#3C3C3C' }}>
                全部课程
              </h2>
              <span className="text-[12px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-xl" style={{ background: '#F7F7F8', color: '#AFAFAF' }}>
                {courses.length} courses
              </span>
            </div>

            {courses.length === 0 ? (
              <div
                className="rounded-3xl border-2 border-dashed p-12 text-center"
                style={{ borderColor: '#E5E5E5' }}
              >
                <div className="text-[40px] mb-3">📚</div>
                <p className="text-[16px] font-extrabold mb-2" style={{ color: '#3C3C3C' }}>还没有课程</p>
                <p className="text-[14px] font-semibold mb-5" style={{ color: '#AFAFAF' }}>上传材料，让 AI 帮你生成课程</p>
                <button
                  onClick={onAddMaterial}
                  className="duo-btn-green px-6 py-3 text-base"
                >
                  开始学习
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {courses.map((course, i) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    index={i}
                    isSelected={selectedCourse?.id === course.id}
                    onSelect={() => {
                      setSelectedCourse(course);
                      onSelectCourse(course);
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}

function CourseCard({
  course,
  index,
  isSelected,
  onSelect,
}: {
  course: Course;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98, y: 3 }}
      onClick={onSelect}
      className="rounded-3xl bg-white border-2 cursor-pointer overflow-hidden"
      style={{
        borderColor: isSelected ? '#58CC02' : '#E5E5E5',
        boxShadow: isSelected ? '0 4px 0 #46A302' : '0 4px 0 #E5E5E5',
      }}
    >
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: '#F7F7F8', boxShadow: '0 2px 0 #E5E5E5' }}
          >
            {course?.icon || ''}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-black truncate" style={{ color: '#3C3C3C' }}>
              {course?.title || 'Untitled'}
            </h3>
            <p className="text-[12px] font-semibold line-clamp-2 mt-0.5 leading-snug" style={{ color: '#AFAFAF' }}>
              {course?.description || ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[12px] font-extrabold uppercase mb-4" style={{ color: '#AFAFAF' }}>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {course?.lessons || 0}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-current" style={{ color: '#FFC800' }} />
            {course?.exercises || 0}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-current" style={{ color: '#1CB0F6' }} />
            {(course?.levels?.reduce((s, l) => s + (l.xpReward || 0), 0) || 0)} XP
          </span>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="progress-bar-track" style={{ height: '10px' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${course?.progress || 0}%` }}
              transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
              className="progress-bar-fill"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95, y: 3 }}
          className="w-full py-3 rounded-2xl font-extrabold text-[13px] uppercase tracking-wider text-white transition-all"
          style={{
            background: (course?.progress || 0) === 0 ? '#58CC02' : '#1CB0F6',
            boxShadow: (course?.progress || 0) === 0 ? '0 4px 0 #46A302' : '0 4px 0 #1899D6',
            borderBottom: (course?.progress || 0) === 0 ? '4px solid #46A302' : '4px solid #1899D6',
          }}
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
        >
          {(course?.progress || 0) === 0 ? '开始学习' : '继续学习'}
        </motion.button>
      </div>
    </motion.div>
  );
}
