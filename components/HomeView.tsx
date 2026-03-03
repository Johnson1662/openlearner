'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Course, UserProgress, RecentCourse } from '@/types';
import { getStreakDays } from '@/data/mockLevels';

interface HomeViewProps {
  courses: Course[];
  recentCourses: RecentCourse[];
  progress: UserProgress;
  onSelectCourse: (course: Course) => void;
  onAddMaterial: () => void;
}

export default function HomeView({ courses, recentCourses, progress, onSelectCourse, onAddMaterial }: HomeViewProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(courses[0] || null);
  const streakDays = getStreakDays(progress.currentStreak, progress.lastStudyDate);

  useEffect(() => {
    if (!selectedCourse && courses.length > 0) {
      setSelectedCourse(courses[0]);
    }
  }, [courses, selectedCourse]);

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <div className="max-w-[1200px] mx-auto px-6 py-10 flex flex-col md:flex-row gap-10">
        
        {/* Left Sidebar: Stats */}
        <div className="w-full md:w-[320px] flex flex-col gap-6">
          <div className="bg-white rounded-[32px] p-8 border border-[#E5E5E5] shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="text-[32px] font-black text-[#3C3C3C]">{progress?.energy || 17}</span>
                <Zap className="w-8 h-8 text-[#FFC800] fill-current" />
              </div>
              <div className="flex gap-1">
                <div className="w-3 h-6 rounded-full bg-[#58CC02]" />
                <div className="w-3 h-6 rounded-full bg-[#58CC02]" />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {streakDays.slice(0, 5).map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    day.active ? 'bg-[#FFC800] text-white' : 'bg-[#F0F0F0] text-[#AFAFAF]'
                  }`}>
                    <Zap className={`w-6 h-6 ${day.active ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-[14px] font-bold text-[#3C3C3C] uppercase">{day.label[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content: Current Course */}
        <div className="flex-1 flex flex-col gap-6">
          {selectedCourse ? (
            <div className="bg-white rounded-[32px] border border-[#E5E5E5] shadow-sm overflow-hidden flex flex-col items-center p-12 text-center">
              <h2 className="text-[32px] font-black text-[#3C3C3C] mb-2">{selectedCourse.title}</h2>
              <p className="text-[#8257E5] font-bold uppercase tracking-widest text-sm mb-8">LEVEL {Math.floor((selectedCourse.progress || 0) / 10) + 1}</p>
              
              {/* Illustration Placeholder */}
              <div className="w-64 h-64 bg-[#F7F7F8] rounded-2xl mb-10 flex items-center justify-center relative">
                <div className="text-8xl">{selectedCourse.icon || '🚀'}</div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full border border-[#E5E5E5] flex items-center gap-2 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-[#58CC02] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-[#3C3C3C]">You leveled up!</span>
                </div>
              </div>

              <div className="w-full max-w-md flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-[#E5E5E5] flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-[#757575] font-medium">{selectedCourse.description}</p>
                </div>
                <CheckCircle2 className="w-6 h-6 text-[#8257E5] fill-current" />
              </div>
              
              <button 
                  onClick={() => onSelectCourse(selectedCourse)}
                  className="w-full max-w-md bg-[#8257E5] hover:bg-[#6b44c8] text-white font-black py-5 rounded-2xl text-[18px] transition-all shadow-[0_4px_0_#5a39a3] active:shadow-none active:translate-y-1"
                >
                  Continue course
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-[32px] border-2 border-dashed border-[#E5E5E5] p-20 text-center">
                <div className="text-6xl mb-6">📚</div>
                <h3 className="text-2xl font-black text-[#3C3C3C] mb-4">No courses yet</h3>
                <button 
                  onClick={onAddMaterial}
                  className="bg-[#58CC02] text-white font-black px-10 py-4 rounded-2xl shadow-[0_4px_0_#46A302]"
                >
                  Add Your First Material
                </button>
              </div>
            )}

            {/* Other Courses Carousel */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-[#3C3C3C]">Explore more</h3>
                <button onClick={onAddMaterial} className="text-[#8257E5] font-bold flex items-center gap-1">
                  <Plus className="w-5 h-5" />
                  New
                </button>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => onSelectCourse(course)}
                    className="flex-shrink-0 w-40 h-40 bg-white rounded-[24px] border border-[#E5E5E5] shadow-sm flex flex-col items-center justify-center p-4 hover:border-[#8257E5] transition-all group"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{course.icon || '📖'}</div>
                    <p className="text-sm font-bold text-[#3C3C3C] text-center line-clamp-2">{course.title}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

