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
      className="rounded-2xl p-6 h-fit cursor-pointer transition-all bg-card border border-border/60 shadow-sm hover:shadow-md"
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-xl mb-5 flex items-center justify-center bg-muted"
      >
        <Icon className="w-7 h-7 text-primary" />
      </div>
      
      {/* Title */}
      <h2 className="text-[20px] font-semibold mb-2 text-foreground">
        {title}
      </h2>
      
      {/* Description */}
      <p className="text-[14px] mb-5 leading-relaxed text-muted-foreground">
        {description}
      </p>
      
      {/* Stats */}
      <div className="flex gap-5 text-[12px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <span className="font-medium">{lessons} lessons</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ListTodo className="w-3.5 h-3.5 text-duo-green" />
          <span className="font-medium">{exercises} exercises</span>
        </div>
      </div>
    </motion.div>
  );
}
