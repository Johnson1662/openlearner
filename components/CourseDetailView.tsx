'use client';

import { motion } from 'framer-motion';
import { BookOpen, Target, ArrowLeft, CheckCircle2, Play, Award } from 'lucide-react';
import { Course, Level, Chapter } from '@/types';

interface CourseDetailViewProps {
  course: Course;
  onSelectLevel: (level: Level) => void;
  onBack: () => void;
}

function LevelNode({
  level,
  onClick,
  index
}: {
  level: Level;
  onClick: () => void;
  index: number;
}) {
  const isCompleted = level.status === 'completed';

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 cursor-pointer"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: isCompleted ? '#34C759' : '#007AFF',
          boxShadow: isCompleted
            ? '0 4px 14px rgba(52, 199, 89, 0.3), 0 0 0 3px #fff'
            : '0 4px 14px rgba(0, 122, 255, 0.3), 0 0 0 3px #fff',
        }}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-7 h-7" style={{ color: '#fff' }} />
        ) : (
          <Play className="w-5 h-5 ml-0.5" style={{ color: '#fff', fill: '#fff' }} />
        )}
      </div>
      <span
        className="text-[12px] font-medium max-w-[110px] text-center line-clamp-2 leading-snug"
        style={{ color: '#1d1d1f' }}
      >
        {level.title}
      </span>
    </motion.button>
  );
}

function ChapterDivider({ chapter, chapterIndex }: { chapter: Chapter; chapterIndex: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: chapterIndex * 0.08, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="w-full max-w-sm rounded-xl py-3 px-5 text-center my-8"
      style={{
        background: '#F5F5F7',
        border: '1px solid rgba(0,0,0,0.04)',
      }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#007AFF' }}>
        Chapter {chapterIndex + 1}
      </div>
      <div className="text-[15px] font-semibold" style={{ color: '#1d1d1f' }}>
        {chapter.title}
      </div>
    </motion.div>
  );
}

function SnakePath({
  levels,
  chapters,
  onSelectLevel
}: {
  levels: Level[];
  chapters: Chapter[];
  onSelectLevel: (level: Level) => void;
}) {
  const levelsByChapter: { [key: string]: Level[] } = {};
  chapters.forEach(ch => {
    levelsByChapter[ch.id] = levels.filter(l => ch.levelIds.includes(l.id));
  });

  let levelIndex = 0;

  return (
    <div className="flex flex-col items-center gap-10 relative">
      {chapters.map((chapter, chapterIdx) => {
        const chapterLevels = levelsByChapter[chapter.id] || [];
        const items: React.ReactNode[] = [];

        items.push(<ChapterDivider key={`chapter-${chapter.id}`} chapter={chapter} chapterIndex={chapterIdx} />);

        const levelsPerRow = 2;
        const rows: Level[][] = [];
        for (let i = 0; i < chapterLevels.length; i += levelsPerRow) {
          rows.push(chapterLevels.slice(i, i + levelsPerRow));
        }

        rows.forEach((row, rowIdx) => {
          const isEvenRow = rowIdx % 2 === 0;
          items.push(
            <div
              key={`row-${chapter.id}-${rowIdx}`}
              className={`flex items-center justify-center gap-20 ${isEvenRow ? '' : 'flex-row-reverse'}`}
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
        });

        return items;
      })}
    </div>
  );
}

export default function CourseDetailView({ course, onSelectLevel, onBack }: CourseDetailViewProps) {
  const totalLevels = course?.levels?.length || 0;
  const completedLevels = course?.levels?.filter((l: Level) => l.status === 'completed').length || 0;
  const totalXP = course?.levels?.reduce((sum: number, l: Level) => sum + (l.xpReward || 0), 0) || 0;

  return (
    <div
      className="flex h-[calc(100vh-48px)] overflow-hidden"
      style={{ background: '#FAFAFA' }}
    >
      {/* Left Panel - Course Info */}
      <div
        className="w-2/5 flex flex-col items-center justify-start pt-12 px-8 overflow-y-auto"
        style={{ borderRight: '1px solid rgba(0,0,0,0.06)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
          className="max-w-sm w-full"
        >
          <motion.button
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBack}
            className="flex items-center gap-1.5 text-[13px] font-normal mb-8 transition-colors cursor-pointer"
            style={{ color: '#007AFF' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>

          <div
            className="p-6 rounded-2xl"
            style={{
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl mb-5 flex items-center justify-center text-3xl"
              style={{ background: '#F5F5F7' }}
            >
              {course?.icon || ''}
            </div>

            <h1
              className="text-[24px] font-bold tracking-tight mb-3 leading-snug"
              style={{ color: '#1d1d1f' }}
            >
              {course?.title || 'Untitled'}
            </h1>

            <p
              className="text-[14px] leading-relaxed mb-5"
              style={{ color: '#86868b' }}
            >
              {course?.description || ''}
            </p>

            <div className="flex flex-wrap gap-4 text-[12px] font-medium mb-5" style={{ color: '#86868b' }}>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                {course?.lessons || 0} lessons
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                {course?.exercises || 0} exercises
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" style={{ color: '#FF9F0A' }} />
                {totalXP} XP
              </span>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#F5F5F7' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${course?.progress || 0}%` }}
                  className="h-full rounded-full"
                  style={{ background: '#007AFF' }}
                  transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                />
              </div>
              <span className="text-[13px] font-semibold tabular-nums" style={{ color: '#007AFF' }}>
                {course?.progress || 0}%
              </span>
            </div>
            <p className="text-[12px]" style={{ color: '#86868b' }}>
              {completedLevels}/{totalLevels} levels completed
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Level Map */}
      <div className="w-3/5 overflow-y-auto pt-12 pb-32 px-8">
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
