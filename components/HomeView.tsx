'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, BookOpen, BarChart3, Plus, ChevronRight, Clock } from 'lucide-react';
import { Course, UserProgress, RecentCourse } from '@/types';
import { getStreakDays } from '@/data/mockLevels';

interface HomeViewProps {
  courses: Course[];
  recentCourses: RecentCourse[];
  progress: UserProgress;
  onSelectCourse: (course: Course) => void;
  onAddMaterial: () => void;
}

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">首页</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddMaterial}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            添加材料
          </motion.button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-gray-900">{progress.energy}</span>
                  <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="flex space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Zap key={i} className="w-4 h-4 text-lime-400 fill-lime-400" />
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                {streakDays.map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      item.active
                      ? 'bg-gradient-to-br from-lime-400 to-green-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-400'
                    } ${item.isToday ? 'ring-2 ring-offset-2 ring-lime-400' : ''}`}>
                      {item.active ? <Zap className="w-5 h-5" /> : <span className="text-xs">-</span>}
                    </div>
                    <span className={`text-xs font-bold ${item.active ? 'text-gray-700' : 'text-gray-400'}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectCourse(selectedCourse)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <BarChart3 className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 line-clamp-2">{selectedCourse?.title || '未选择课程'}</h3>
                  <p className="text-xs text-gray-500">{selectedCourse?.chapters?.length || 0} 个章节</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{selectedCourse?.lessons || 0} 课时</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Target className="w-4 h-4" />
                  <span>{selectedCourse?.exercises || 0} 练习</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${selectedCourse?.progress || 0}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-indigo-600">{selectedCourse?.progress || 0}%</span>
              </div>
            </motion.div>
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group"
              onClick={() => onSelectCourse(selectedCourse)}
            >
              <div className="relative p-8 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-indigo-50 to-white min-h-[320px]">
                <div className="w-48 h-48 rounded-3xl bg-white shadow-xl flex items-center justify-center text-7xl transform group-hover:scale-110 transition-transform duration-500">
                  {selectedCourse?.icon || '📚'}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold mb-4">
                    <Clock className="w-3 h-3" />
                    进行中
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">{selectedCourse?.title || '未选择课程'}</h2>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2">{selectedCourse?.description || '开始你的学习之旅'}</p>
                  <div className="flex items-center gap-4 max-w-md mx-auto md:mx-0">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedCourse?.progress || 0}%` }}
                        className="bg-indigo-600 h-full rounded-full"
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-indigo-600 font-bold text-lg">{selectedCourse?.progress || 0}%</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">继续学习</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {recentCourses.slice(0, 6).map((recent) => {
                  const course = courses.find(c => c.id === recent.courseId);
                  return (
                    <motion.button
                      key={recent.courseId}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (course) setSelectedCourse(course);
                      }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        selectedCourse?.id === recent.courseId
                          ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-1 ring-indigo-500'
                          : 'border-gray-100 bg-white hover:border-indigo-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl border border-gray-100">
                        {course?.icon || '📚'}
                      </div>
                      <div className="flex-1 text-left overflow-hidden">
                        <p className="text-gray-900 text-sm font-bold truncate mb-1">{recent.courseTitle}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-full rounded-full"
                              style={{ width: `${recent.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-indigo-600">{recent.progress}%</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
