'use client';

import { motion } from 'framer-motion';
import { BookOpen, Target, ChevronRight, Clock } from 'lucide-react';
import { Course } from '@/types';

interface CourseViewProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
}

export default function CourseView({ courses, onSelectCourse }: CourseViewProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">课程列表</h1>
          <p className="text-gray-500 mt-2">选择一门课程开始学习</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              onClick={() => onSelectCourse(course)}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl transition-all group"
            >
              <div className="p-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner">
                    {course?.icon || '📚'}
                  </div>
                  <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {course?.chapters?.length || 0} 章节
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{course?.title || '未命名课程'}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-6 h-10">{course?.description || ''}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                    </div>
                    <span className="text-xs font-semibold">{course?.lessons || 0} 课时</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                      <Target className="w-4 h-4 text-rose-500" />
                    </div>
                    <span className="text-xs font-semibold">{course?.exercises || 0} 练习</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">学习进度</span>
                    <span className="text-sm font-black text-indigo-600">{course?.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course?.progress || 0}%` }}
                      className="bg-indigo-600 h-full rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="px-8 pb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                >
                  {(course?.progress || 0) === 0 ? '开始挑战' : '继续挑战'}
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  </div>
);
}
