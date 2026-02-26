'use client';

import { motion } from 'framer-motion';
import { BookOpen, ListTodo, GraduationCap, LucideIcon } from 'lucide-react';

interface CourseCardProps {
  title: string;
  description: string;
  lessons: number;
  exercises: number;
  icon?: LucideIcon;
}

export default function CourseCard({ 
  title, 
  description, 
  lessons, 
  exercises, 
  icon: Icon = GraduationCap 
}: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="rounded-2xl p-6 h-fit cursor-pointer transition-all"
      style={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-xl mb-5 flex items-center justify-center"
        style={{ background: '#F5F5F7' }}
      >
        <Icon className="w-7 h-7" style={{ color: '#007AFF' }} />
      </div>
      
      {/* Title */}
      <h2 className="text-[20px] font-semibold mb-2" style={{ color: '#1d1d1f' }}>
        {title}
      </h2>
      
      {/* Description */}
      <p className="text-[14px] mb-5 leading-relaxed" style={{ color: '#86868b' }}>
        {description}
      </p>
      
      {/* Stats */}
      <div className="flex gap-5 text-[12px]" style={{ color: '#86868b' }}>
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" style={{ color: '#007AFF' }} />
          <span className="font-medium">{lessons} lessons</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ListTodo className="w-3.5 h-3.5" style={{ color: '#34C759' }} />
          <span className="font-medium">{exercises} exercises</span>
        </div>
      </div>
    </motion.div>
  );
}
