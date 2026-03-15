'use client';

import { motion } from 'framer-motion';
import { BookOpen, ArrowLeft, CheckCircle2, Play, Award, Star, Lock, ChevronRight, Trash2 } from 'lucide-react';
import { Course, Level, Chapter } from '@/types';

interface CourseDetailViewProps {
  course: Course;
  onSelectLevel: (level: Level) => void;
  onBack: () => void;
  onClearLevelContent: () => void;
}

function TimelineLevel({ level, onClick, index, isLast }: { level: Level; onClick: () => void; index: number; isLast: boolean }) {
  const isCompleted = level.status === 'completed';
  const isLocked = level.status === 'locked';

  return (
    <div className="relative pl-8 pb-8 last:pb-0">

      {!isLast && (
        <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border/60" />
      )}


      <div 
        className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-colors duration-300 ${
          isCompleted 
            ? 'bg-green-500 border-green-500 text-white' 
            : isLocked 
            ? 'bg-muted border-muted-foreground/30 text-muted-foreground' 
            : 'bg-primary border-primary text-white'
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ) : isLocked ? (
          <Lock className="w-3 h-3" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-white" />
        )}
      </div>


      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={!isLocked ? onClick : undefined}
        disabled={isLocked}
        className={`w-full text-left group relative rounded-xl border p-4 transition-all duration-200 ${
          isLocked 
            ? 'bg-muted/30 border-border/40 cursor-not-allowed opacity-70' 
            : 'bg-card border-border/60 hover:border-primary/30 hover:shadow-sm hover:bg-muted/20 cursor-pointer'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className={`font-bold text-base mb-1 ${isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
              {level.title}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {level.description || 'Master this concept to progress.'}
            </p>
          </div>
          
          {!isLocked && (
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
              <ChevronRight className="w-5 h-5" />
            </div>
          )}
        </div>


        {!isLocked && (
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-yellow-600 bg-yellow-500/10 px-2 py-1 rounded-md w-fit">
            <Award className="w-3 h-3" />
            <span>{level.xpReward || 15} XP</span>
          </div>
        )}
      </motion.button>
    </div>
  );
}

function TimelineChapter({ chapter, levels, onSelectLevel, idx }: { chapter: Chapter; levels: Level[]; onSelectLevel: (level: Level) => void; idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="mb-12 last:mb-0"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
          {idx + 1}
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Chapter {idx + 1}
          </div>
          <h3 className="text-xl font-bold text-foreground">
            {chapter.title}
          </h3>
        </div>
      </div>

      <div className="pl-6">
        {levels.map((level, i) => (
          <TimelineLevel
            key={level.id}
            level={level}
            index={i}
            isLast={i === levels.length - 1}
            onClick={() => onSelectLevel(level)}
          />
        ))}
      </div>
    </motion.div>
  );
}

function TimelineView({ levels, chapters, onSelectLevel }: { levels: Level[]; chapters: Chapter[]; onSelectLevel: (level: Level) => void }) {
  const levelsByChapter: Record<string, Level[]> = {};
  chapters.forEach((ch, idx) => {
    // AI 返回 chapterIndex (从0开始)，用这个来匹配
    levelsByChapter[ch.id] = levels.filter(l => l.chapterId === ch.id);
  });

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {chapters.map((chapter, idx) => (
        <TimelineChapter
          key={chapter.id}
          chapter={chapter}
          levels={levelsByChapter[chapter.id] || []}
          onSelectLevel={onSelectLevel}
          idx={idx}
        />
      ))}
    </div>
  );
}

export default function CourseDetailView({ course, onSelectLevel, onBack, onClearLevelContent }: CourseDetailViewProps) {
  const totalLevels = course?.levels?.length || 0;
  const completedLevels = course?.levels?.filter((l: Level) => l.status === 'completed').length || 0;
  const totalXP = course?.levels?.reduce((s: number, l: Level) => s + (l.xpReward || 0), 0) || 0;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-background">

      <div className="md:sticky md:top-16 md:self-start w-full md:w-[320px] md:h-[calc(100vh-64px)] p-6 flex-shrink-0 overflow-y-auto border-r border-border/40 bg-card/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-8 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Courses
          </button>

          <button
            onClick={onClearLevelContent}
            className="flex items-center gap-2 mb-6 text-sm font-bold text-red-600 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            清空关卡内容
          </button>


          <div className="mb-8">
            <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center text-4xl mb-6 shadow-sm border border-primary/10">
              {course?.icon || '🎓'}
            </div>

            <h1 className="text-2xl font-black mb-3 text-foreground leading-tight">
              {course?.title || 'Untitled Course'}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {course?.description || 'No description available.'}
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1.5 rounded-lg">
                <BookOpen className="w-3.5 h-3.5" />
                {course?.lessons || 0} lessons
              </span>
              <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1.5 rounded-lg">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                {course?.exercises || 0} exercises
              </span>
            </div>
          </div>


          <div className="p-5 rounded-2xl bg-muted/30 border border-border/50">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Progress</span>
              <span className="text-sm font-black text-primary">{course?.progress || 0}%</span>
            </div>
            
            <div className="h-2.5 w-full bg-background rounded-full overflow-hidden border border-border/20 mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${course?.progress || 0}%` }}
                className="h-full bg-primary"
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>{completedLevels} / {totalLevels} Levels</span>
              <span className="flex items-center gap-1 text-yellow-600">
                <Award className="w-3.5 h-3.5" />
                {totalXP} XP Earned
              </span>
            </div>
          </div>
        </motion.div>
      </div>


      <div className="flex-1 overflow-y-auto bg-background">
        {course?.chapters && course?.levels ? (
          <TimelineView
            levels={course.levels}
            chapters={course.chapters}
            onSelectLevel={onSelectLevel}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-12">
            <p>No content available for this course yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
