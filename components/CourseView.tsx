'use client';

import { motion } from 'framer-motion';
import { BookOpen, Star, Zap, ChevronRight } from 'lucide-react';
import { Course } from '@/types';

interface CourseViewProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
}

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } },
};

export default function CourseView({ courses, onSelectCourse }: CourseViewProps) {
  return (
    <div className="min-h-screen pb-20" style={{ background: '#F7F7F8' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="mb-8"
        >
          <h1 className="text-[28px] font-black tracking-tight" style={{ color: '#3C3C3C' }}>
            全部课程
          </h1>
          <p className="text-[13px] font-extrabold mt-1 uppercase tracking-widest" style={{ color: '#AFAFAF' }}>
            Choose your path
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 gap-5"
        >
          {courses.map((course) => (
            <motion.div
              key={course.id}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97, y: 3 }}
              onClick={() => onSelectCourse(course)}
              className="rounded-3xl bg-white border-2 cursor-pointer overflow-hidden"
              style={{ borderColor: '#E5E5E5', boxShadow: '0 5px 0 #E5E5E5' }}
            >
              <div className="p-6">
                {/* Icon + Chapters badge */}
                <div className="flex justify-between items-start mb-5">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ background: '#F7F7F8', boxShadow: '0 3px 0 #E5E5E5' }}
                  >
                    {course?.icon || ''}
                  </div>
                  <div
                    className="px-3 py-1.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider"
                    style={{ background: '#F7F7F8', color: '#AFAFAF', boxShadow: '0 2px 0 #E5E5E5' }}
                  >
                    {course?.chapters?.length || 0} chapters
                  </div>
                </div>

                <h3 className="text-[18px] font-black mb-1" style={{ color: '#3C3C3C' }}>
                  {course?.title || 'Untitled'}
                </h3>
                <p className="text-[13px] font-semibold line-clamp-2 mb-5 leading-relaxed" style={{ color: '#AFAFAF' }}>
                  {course?.description || ''}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-[12px] font-extrabold uppercase mb-5" style={{ color: '#AFAFAF' }}>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" style={{ color: '#1CB0F6' }} />
                    {course?.lessons || 0} lessons
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-current" style={{ color: '#FFC800' }} />
                    {course?.exercises || 0} exercises
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 fill-current" style={{ color: '#1CB0F6' }} />
                    {(course?.levels?.reduce((s, l) => s + (l.xpReward || 0), 0) || 0)} XP
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: '#AFAFAF' }}>
                      Progress
                    </span>
                    <span className="text-[13px] font-black" style={{ color: '#58CC02' }}>
                      {course?.progress || 0}%
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course?.progress || 0}%` }}
                      className="progress-bar-fill"
                      transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
                    />
                  </div>
                </div>

                {/* CTA */}
                <motion.button
                  whileTap={{ scale: 0.95, y: 3 }}
                  className="w-full py-3.5 rounded-2xl font-extrabold text-[14px] uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    background: (course?.progress || 0) === 0 ? '#58CC02' : '#1CB0F6',
                    boxShadow: (course?.progress || 0) === 0 ? '0 5px 0 #46A302' : '0 5px 0 #1899D6',
                    borderBottom: (course?.progress || 0) === 0 ? '5px solid #46A302' : '5px solid #1899D6',
                  }}
                  onClick={(e) => { e.stopPropagation(); onSelectCourse(course); }}
                >
                  {(course?.progress || 0) === 0 ? '开始' : '继续'}
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
