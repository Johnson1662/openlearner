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
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2"
    >
      <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 border-4 border-white shadow-lg ${
        isCompleted
        ? 'bg-gradient-to-br from-emerald-400 to-emerald-500'
        : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'
      }`}>
        {isCompleted ? (
          <CheckCircle2 className="w-8 h-8 text-white" />
        ) : (
          <Play className="w-6 h-6 text-white fill-white ml-1" />
        )}
      </div>
      <span className="text-sm font-semibold text-gray-700 max-w-[120px] text-center line-clamp-2">
        {level.title}
      </span>
    </motion.button>
  );
}

function ChapterDivider({ chapter, chapterIndex }: { chapter: Chapter; chapterIndex: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: chapterIndex * 0.1 }}
      className="w-full max-w-md border-2 border-indigo-200 rounded-2xl py-3 text-center bg-white shadow-sm my-8"
    >
      <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest">章节 {chapterIndex + 1}</div>
      <div className="font-bold text-lg text-gray-900">{chapter.title}</div>
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
    <div className="flex flex-col items-center space-y-12 relative">
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
              className={`flex items-center justify-center gap-24 ${isEvenRow ? '' : 'flex-row-reverse'}`}
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
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
      <div className="w-2/5 flex flex-col items-center justify-start pt-16 px-10 border-r border-gray-100 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回课程列表
          </motion.button>

          <div className="p-8 rounded-3xl border border-gray-100 shadow-sm bg-white">
            <div className="bg-indigo-100 w-20 h-20 rounded-2xl mb-6 flex items-center justify-center text-4xl">
              {course?.icon || '📚'}
            </div>
            <h1 className="text-3xl font-extrabold mb-4 text-gray-900">{course?.title || '未命名课程'}</h1>
            <p className="text-gray-500 leading-relaxed mb-6">
              {course?.description || ''}
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-600 mb-6">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {course?.lessons || 0} 课时
              </span>
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                {course?.exercises || 0} 练习
              </span>
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" />
                {totalXP} XP
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${course?.progress || 0}%` }}
                />
              </div>
              <span className="text-sm font-bold text-indigo-600">{course?.progress || 0}%</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              已完成 {completedLevels}/{totalLevels} 关卡
            </div>
          </div>
        </motion.div>
      </div>

      <div className="w-3/5 overflow-y-auto pt-16 pb-32 px-8">
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
