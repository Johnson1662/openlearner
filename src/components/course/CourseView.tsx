'use client';

import { motion } from 'framer-motion';
import { BookOpen, Star, Zap, ChevronRight, Plus } from 'lucide-react';
import { Course } from '@/types';

interface CourseViewProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
}

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } },
};

export default function CourseView({ courses, onSelectCourse }: CourseViewProps) {
  const categories = [
    { title: 'Your Learning Path', courses: courses.slice(0, 3) },
    { title: 'Explore More', courses: courses.slice(3) },
  ].filter(cat => cat.courses.length > 0);

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex justify-between items-end"
        >
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              Course Catalog
            </h1>
            <p className="text-base font-bold mt-2 text-muted-foreground uppercase tracking-widest">
              Level up your skills
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col gap-16">
          {categories.map((category, catIdx) => (
            <motion.section 
              key={catIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: catIdx * 0.1 }}
            >
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-2xl font-black text-foreground">{category.title}</h2>
                <button className="text-primary font-bold text-sm hover:underline">View all</button>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-8 pt-2 px-2 no-scrollbar -mx-2">
                {category.courses.map((course) => (
                  <motion.div
                    key={course.id}
                    whileHover={{ y: -8 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectCourse(course)}
                    className="flex-shrink-0 w-[300px] rounded-[32px] bg-card border border-border/60 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden p-8 flex flex-col h-full"
                  >
                    <div className="w-20 h-20 rounded-[24px] bg-muted/50 flex items-center justify-center text-4xl mb-6 border border-border/20">
                      {course.icon || '📖'}
                    </div>

                    <h3 className="text-xl font-black text-foreground mb-2 line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground mb-6 line-clamp-2 leading-relaxed flex-grow">
                      {course.description}
                    </p>

                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black text-foreground">{course.progress || 0}% Complete</span>
                        <div className="flex items-center gap-1 text-duo-gold">
                          <Zap className="w-3 h-3 fill-current" />
                          <span className="text-xs font-black">{(course.levels?.reduce((s, l) => s + (l.xpReward || 0), 0) || 0)} XP</span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress || 0}%` }}
                          className="h-full bg-duo-green rounded-full"
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <motion.div
                  whileHover={{ y: -8 }}
                  className="flex-shrink-0 w-[300px] rounded-[32px] border-2 border-dashed border-border flex flex-col items-center justify-center p-8 text-center group cursor-pointer hover:border-primary transition-colors bg-muted/5"
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-4">
                    <Plus className="w-8 h-8" />
                  </div>
                  <h4 className="font-black text-foreground group-hover:text-primary transition-colors">Create New</h4>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Add material</p>
                </motion.div>
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}
