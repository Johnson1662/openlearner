'use client';

import { motion } from 'framer-motion';
import { BookOpen, Target, ChevronRight } from 'lucide-react';
import { Course } from '@/types';

interface CourseViewProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
}

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] } },
};

export default function CourseView({ courses, onSelectCourse }: CourseViewProps) {
  return (
    <div className="min-h-screen pb-20" style={{ background: '#FAFAFA' }}>
      <div className="max-w-[980px] mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
          className="mb-10"
        >
          <h1
            className="text-[34px] font-bold tracking-tight"
            style={{ color: '#1d1d1f' }}
          >
            Courses
          </h1>
          <p className="text-[15px] mt-1" style={{ color: '#86868b' }}>
            Choose a course to begin
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {courses.map((course) => (
            <motion.div
              key={course.id}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              onClick={() => onSelectCourse(course)}
              className="rounded-2xl overflow-hidden cursor-pointer group transition-all"
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-105"
                    style={{ background: '#F5F5F7' }}
                  >
                    {course?.icon || ''}
                  </div>
                  <span
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                    style={{
                      background: '#F5F5F7',
                      color: '#86868b',
                    }}
                  >
                    {course?.chapters?.length || 0} chapters
                  </span>
                </div>

                {/* Title & Description */}
                <h3
                  className="text-[17px] font-semibold mb-1.5 group-hover:text-[#007AFF] transition-colors"
                  style={{ color: '#1d1d1f' }}
                >
                  {course?.title || 'Untitled'}
                </h3>
                <p
                  className="text-[13px] line-clamp-2 mb-5 leading-relaxed h-10"
                  style={{ color: '#86868b' }}
                >
                  {course?.description || ''}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-[12px] mb-5" style={{ color: '#86868b' }}>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" style={{ color: '#007AFF' }} />
                    {course?.lessons || 0} lessons
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" style={{ color: '#FF3B30' }} />
                    {course?.exercises || 0} exercises
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#86868b' }}>
                      Progress
                    </span>
                    <span className="text-[13px] font-semibold tabular-nums" style={{ color: '#007AFF' }}>
                      {course?.progress || 0}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F5F5F7' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course?.progress || 0}%` }}
                      className="h-full rounded-full"
                      style={{ background: '#007AFF' }}
                      transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                    />
                  </div>
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  style={{
                    background: '#1d1d1f',
                    color: '#fff',
                  }}
                >
                  {(course?.progress || 0) === 0 ? 'Start' : 'Continue'}
                  <ChevronRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
