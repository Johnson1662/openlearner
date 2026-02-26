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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      className="glass-card glass-card-hover p-8 h-fit"
    >
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 mb-6 flex items-center justify-center">
        <Icon className="w-10 h-10 text-brand-primary" />
      </div>
      
      {/* Title */}
      <h2 className="text-2xl font-bold mb-3 text-text-primary">{title}</h2>
      
      {/* Description */}
      <p className="text-text-secondary mb-6 leading-relaxed">
        {description}
      </p>
      
      {/* Stats */}
      <div className="flex space-x-6 text-sm">
        <div className="flex items-center gap-2 text-text-secondary">
          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-brand-primary" />
          </div>
          <span className="font-semibold">{lessons} 课时</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <div className="w-8 h-8 rounded-lg bg-brand-cta/10 flex items-center justify-center">
            <ListTodo className="w-4 h-4 text-brand-cta" />
          </div>
          <span className="font-semibold">{exercises} 练习</span>
        </div>
      </div>
    </motion.div>
  );
}
