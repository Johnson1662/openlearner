'use client';

import { motion } from 'framer-motion';
import { BookOpen, ArrowLeft, CheckCircle2, Play, Award, Star, Lock } from 'lucide-react';
import { Course, Level, Chapter } from '@/types';

interface CourseDetailViewProps {
  course: Course;
  onSelectLevel: (level: Level) => void;
  onBack: () => void;
}

function LevelNode({ level, onClick, index }: { level: Level; onClick: () => void; index: number }) {
  const isCompleted = level.status === 'completed';
  const isLocked = level.status === 'locked';

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 220, damping: 18 }}
      whileHover={!isLocked ? { scale: 1.1 } : {}}
      whileTap={!isLocked ? { scale: 0.92 } : {}}
      onClick={!isLocked ? onClick : undefined}
      disabled={isLocked}
      className="flex flex-col items-center gap-2 cursor-pointer"
    >
      {/* Node circle */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center relative"
        style={{
          background: isCompleted ? '#58CC02' : isLocked ? '#E5E5E5' : '#8257E5',
          boxShadow: isCompleted
            ? '0 5px 0 #46A302'
            : isLocked
            ? '0 5px 0 #E5E5E5'
            : '0 5px 0 #6B47C6',
          border: '4px solid white',
          outline: isCompleted
            ? '3px solid #58CC02'
            : isLocked
            ? '3px solid #E5E5E5'
            : '3px solid #8257E5',
        }}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-9 h-9" style={{ color: '#fff' }} />
        ) : isLocked ? (
          <Lock className="w-8 h-8" style={{ color: '#AFAFAF' }} />
        ) : (
          <Play className="w-7 h-7 ml-1" style={{ color: '#fff', fill: '#fff' }} />
        )}
      </div>
      <span
        className="text-[12px] font-extrabold text-center max-w-[100px] leading-snug uppercase tracking-wide"
        style={{ color: isLocked ? '#AFAFAF' : '#3C3C3C' }}
      >
        {level.title}
      </span>
    </motion.button>
  );
}

function ChapterBanner({ chapter, idx }: { chapter: Chapter; idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08, duration: 0.4 }}
      className="w-full rounded-3xl py-4 px-6 flex items-center gap-4 my-6"
      style={{ background: '#8257E5', boxShadow: '0 5px 0 #6B47C6' }}
    >
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-[18px] text-white bg-white/20 flex-shrink-0"
      >
        {idx + 1}
      </div>
      <div>
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">
          Chapter
        </div>
        <div className="text-[16px] font-black text-white">
          {chapter.title}
        </div>
      </div>
    </motion.div>
  );
}

function SnakePath({ levels, chapters, onSelectLevel }: { levels: Level[]; chapters: Chapter[]; onSelectLevel: (level: Level) => void }) {
  const levelsByChapter: Record<string, Level[]> = {};
  chapters.forEach(ch => {
    levelsByChapter[ch.id] = levels.filter(l => ch.levelIds.includes(l.id));
  });

  let levelIndex = 0;
  const COLS = 3;

  return (
    <div className="flex flex-col items-center gap-4">
      {chapters.map((chapter, chapterIdx) => {
        const chapterLevels = levelsByChapter[chapter.id] || [];
        const rows: Level[][] = [];
        for (let i = 0; i < chapterLevels.length; i += COLS) {
          rows.push(chapterLevels.slice(i, i + COLS));
        }

        return (
          <div key={chapter.id} className="w-full">
            <ChapterBanner chapter={chapter} idx={chapterIdx} />
            <div className="flex flex-col gap-8">
              {rows.map((row, rowIdx) => {
                const isReversed = rowIdx % 2 !== 0;
                return (
                  <div
                    key={`row-${rowIdx}`}
                    className="flex items-center justify-center gap-10"
                    style={{ flexDirection: isReversed ? 'row-reverse' : 'row' }}
                  >
                    {row.map((level) => {
                      const idx = levelIndex++;
                      return (
                        <LevelNode
                          key={level.id}
                          level={level}
                          onClick={() => onSelectLevel(level)}
                          index={idx}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CourseDetailView({ course, onSelectLevel, onBack }: CourseDetailViewProps) {
  const totalLevels = course?.levels?.length || 0;
  const completedLevels = course?.levels?.filter((l: Level) => l.status === 'completed').length || 0;
  const totalXP = course?.levels?.reduce((s: number, l: Level) => s + (l.xpReward || 0), 0) || 0;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]" style={{ background: '#F7F7F8' }}>
      {/* Left Panel - sticky on desktop */}
      <div
        className="md:sticky md:top-16 md:self-start w-full md:w-[300px] md:min-h-[calc(100vh-64px)] p-5 flex-shrink-0 overflow-y-auto"
        style={{ borderRight: '2px solid #E5E5E5', background: '#FFFFFF' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-xs"
        >
          <motion.button
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-1.5 mb-5 font-extrabold text-[13px] uppercase tracking-wider cursor-pointer"
            style={{ color: '#8257E5' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>

          {/* Course card */}
          <div
            className="rounded-3xl p-5 bg-white border-2 mb-5"
            style={{ borderColor: '#E5E5E5', boxShadow: '0 4px 0 #E5E5E5' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
              style={{ background: '#F7F7F8', boxShadow: '0 3px 0 #E5E5E5' }}
            >
              {course?.icon || ''}
            </div>

            <h1 className="text-[20px] font-black mb-2 leading-snug" style={{ color: '#3C3C3C' }}>
              {course?.title || 'Untitled'}
            </h1>
            <p className="text-[13px] font-semibold leading-relaxed mb-4" style={{ color: '#AFAFAF' }}>
              {course?.description || ''}
            </p>

            <div className="flex flex-wrap gap-3 text-[12px] font-extrabold uppercase mb-4" style={{ color: '#AFAFAF' }}>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {course?.lessons || 0} lessons
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" style={{ color: '#FFC800' }} />
                {course?.exercises || 0}
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5" style={{ color: '#FFC800' }} />
                {totalXP} XP
              </span>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 progress-bar-track">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${course?.progress || 0}%` }}
                  className="progress-bar-fill"
                  transition={{ duration: 0.8 }}
                />
              </div>
              <span className="text-[14px] font-black" style={{ color: '#58CC02' }}>
                {course?.progress || 0}%
              </span>
            </div>
            <p className="text-[12px] font-extrabold uppercase tracking-wide" style={{ color: '#AFAFAF' }}>
              {completedLevels}/{totalLevels} levels
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Level Map */}
      <div className="flex-1 overflow-y-auto px-5 py-6 pb-28">
        {course?.chapters && course?.levels && (
          <SnakePath
            levels={course.levels}
            chapters={course.chapters}
            onSelectLevel={onSelectLevel}
          />
        )}
      </div>
    </div>
  );
}
