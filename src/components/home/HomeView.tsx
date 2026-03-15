'use client';

import { useState, useEffect } from 'react';
import { Zap, Plus, ChevronRight, CheckCircle2, BookOpen, Trophy, Flame, Trash2 } from 'lucide-react';
import { Course, UserProgress, RecentCourse } from '@/types';
import { getStreakDays } from '@/data/mockLevels';

interface HomeViewProps {
  courses: Course[];
  recentCourses: RecentCourse[];
  progress: UserProgress;
  onSelectCourse: (course: Course) => void;
  onAddMaterial: () => void;
  onClearLevelContent: () => void;
}

export default function HomeView({ courses, recentCourses, progress, onSelectCourse, onAddMaterial, onClearLevelContent }: HomeViewProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(courses[0] || null);
  const streakDays = getStreakDays(progress.currentStreak, progress.lastStudyDate);

  useEffect(() => {
    if (!selectedCourse && courses.length > 0) {
      setSelectedCourse(courses[0]);
    }
  }, [courses, selectedCourse]);

  return (
    <div className="min-h-[calc(100vh-73px)] bg-muted/30 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 md:gap-10">
        
        {/* Left Sidebar: Stats & Profile */}
        <div className="flex flex-col gap-6">
          {/* User Stats Card */}
          <div className="bg-card rounded-3xl p-6 border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </div>
                <div>
                  <span className="text-3xl font-black text-foreground tracking-tight">{progress?.energy || 17}</span>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Energy</p>
                </div>
              </div>
            </div>

            {/* Streak Calendar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Streak</h3>
                <span className="text-xs font-medium text-muted-foreground">{progress.currentStreak} days</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {streakDays.slice(0, 5).map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      day.active 
                        ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20 scale-105' 
                        : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                    }`}>
                      <Flame className={`w-5 h-5 ${day.active ? 'fill-current' : ''}`} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      day.active ? 'text-yellow-600' : 'text-muted-foreground'
                    }`}>
                      {day.label.substring(0, 3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions / Mini Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-3xl p-5 border border-border/50 shadow-sm flex flex-col items-center justify-center gap-2 text-center hover:border-primary/20 transition-colors cursor-pointer">
              <Trophy className="w-6 h-6 text-purple-500" />
              <span className="text-sm font-bold text-foreground">Achievements</span>
            </div>
            <div className="bg-card rounded-3xl p-5 border border-border/50 shadow-sm flex flex-col items-center justify-center gap-2 text-center hover:border-primary/20 transition-colors cursor-pointer">
              <BookOpen className="w-6 h-6 text-blue-500" />
              <span className="text-sm font-bold text-foreground">Library</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-10">
          
          {/* Hero Section: Current Course */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-foreground tracking-tight">Current Focus</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClearLevelContent}
                  className="text-sm font-bold text-red-600 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  清空关卡内容
                </button>
                <button onClick={onAddMaterial} className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  New Course
                </button>
              </div>
            </div>

            {selectedCourse ? (
              <div className="group relative bg-card rounded-[32px] border border-border/50 shadow-sm overflow-hidden hover:shadow-md transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                  {/* Icon/Illustration */}
                  <div className="relative flex-shrink-0">
                    <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center shadow-inner border border-white/50">
                      <span className="text-7xl md:text-8xl filter drop-shadow-sm transform group-hover:scale-110 transition-transform duration-500">
                        {selectedCourse.icon || '🚀'}
                      </span>
                    </div>
                    <div className="absolute -bottom-3 -right-3 bg-white rounded-2xl p-2 shadow-lg border border-border/50">
                      <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white font-bold">
                        {Math.floor((selectedCourse.progress || 0) / 10) + 1}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left space-y-6">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-black text-foreground mb-3 leading-tight">
                        {selectedCourse.title}
                      </h3>
                      <p className="text-muted-foreground text-lg leading-relaxed line-clamp-2">
                        {selectedCourse.description}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                      <button 
                        onClick={() => onSelectCourse(selectedCourse)}
                        className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        Continue Learning
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground px-4">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>{selectedCourse.progress || 0}% Complete</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-[32px] border-2 border-dashed border-border p-16 text-center hover:bg-muted/30 transition-colors cursor-pointer group" onClick={onAddMaterial}>
                <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Start a New Journey</h3>
                <p className="text-muted-foreground">Create your first course from any material</p>
              </div>
            )}
          </section>

          {/* Other Courses Grid */}
          <section>
            <h3 className="text-xl font-black text-foreground mb-6 px-1">Your Library</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => onSelectCourse(course)}
                  className={`group relative flex flex-col bg-card rounded-3xl border transition-all duration-300 overflow-hidden text-left p-5
                    ${selectedCourse?.id === course.id 
                      ? 'border-primary ring-2 ring-primary/10 shadow-md' 
                      : 'border-border/50 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1'
                    }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {course.icon || '📖'}
                  </div>
                  
                  <h4 className="font-bold text-foreground text-lg leading-tight mb-2 line-clamp-2">
                    {course.title}
                  </h4>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Level {Math.floor((course.progress || 0) / 10) + 1}
                    </span>
                    {selectedCourse?.id === course.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              ))}
              
              {/* Add New Card */}
              <button
                onClick={onAddMaterial}
                className="flex flex-col items-center justify-center bg-muted/20 rounded-3xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all duration-300 p-5 min-h-[180px] group"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <span className="font-bold text-muted-foreground group-hover:text-primary transition-colors">Add Course</span>
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
