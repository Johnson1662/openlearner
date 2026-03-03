'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, BookOpen, CheckCircle } from 'lucide-react';
import { generateCourse } from '@/lib/api';
import { Course } from '@/types';

interface CourseCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (course: Course) => void;
}

export default function CourseCreator({ isOpen, onClose, onCourseCreated }: CourseCreatorProps) {
  const [step, setStep] = useState<'input' | 'generating' | 'preview'>('input');
  const [material, setMaterial] = useState('');
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [generatedCourse, setGeneratedCourse] = useState<Course | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (material.trim().length < 50) {
      setError('学习材料至少需要50个字符');
      return;
    }
    setStep('generating');
    setError('');
    try {
      const result = await generateCourse(material, title || undefined, difficulty);
      setGeneratedCourse(result.data.course);
      setStep('preview');
    } catch (err: any) {
      setError(err.message || '生成课程失败，请重试');
      setStep('input');
    }
  };

  const handleConfirm = () => {
    if (generatedCourse) {
      onCourseCreated(generatedCourse);
      reset();
      onClose();
    }
  };

  const reset = () => {
    setStep('input');
    setMaterial('');
    setTitle('');
    setDifficulty('intermediate');
    setGeneratedCourse(null);
    setError('');
  };

  const handleClose = () => { reset(); onClose(); };

  if (!isOpen) return null;

  const difficultyOptions = [
    { value: 'beginner', label: '初级' },
    { value: 'intermediate', label: '中级' },
    { value: 'advanced', label: '高级' },
  ] as const;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-2"
          style={{ borderColor: '#E5E5E5', boxShadow: '0 8px 0 #E5E5E5' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2" style={{ borderColor: '#E5E5E5' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: '#FFF7D6', boxShadow: '0 3px 0 #F0E0A0' }}
              >
                <Sparkles className="w-5 h-5" style={{ color: '#FFC800' }} />
              </div>
              <h2 className="text-xl font-black" style={{ color: '#3C3C3C' }}>AI 创建课程</h2>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer"
              style={{ background: '#F7F7F8' }}
            >
              <X className="w-4 h-4" style={{ color: '#AFAFAF' }} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {step === 'input' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-extrabold uppercase tracking-wide mb-2" style={{ color: '#3C3C3C' }}>
                    课程标题 <span className="font-semibold normal-case tracking-normal" style={{ color: '#AFAFAF' }}>(可选)</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="例如：Python编程入门"
                    className="w-full px-4 py-3 rounded-2xl border-2 font-semibold focus:outline-none transition-all"
                    style={{ borderColor: '#E5E5E5', color: '#3C3C3C' }}
                    onFocus={e => (e.target.style.borderColor = '#8257E5')}
                    onBlur={e => (e.target.style.borderColor = '#E5E5E5')}
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-extrabold uppercase tracking-wide mb-2" style={{ color: '#3C3C3C' }}>
                    难度级别
                  </label>
                  <div className="flex gap-3">
                    {difficultyOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setDifficulty(opt.value)}
                        className="flex-1 py-3 rounded-2xl font-extrabold text-sm uppercase tracking-wider transition-all cursor-pointer border-2"
                        style={
                          difficulty === opt.value
                            ? { background: '#58CC02', color: '#fff', borderColor: '#46A302', boxShadow: '0 3px 0 #46A302' }
                            : { background: '#F7F7F8', color: '#AFAFAF', borderColor: '#E5E5E5', boxShadow: '0 3px 0 #E5E5E5' }
                        }
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Material */}
                <div>
                  <label className="block text-sm font-extrabold uppercase tracking-wide mb-2" style={{ color: '#3C3C3C' }}>
                    学习材料 <span style={{ color: '#FF4B4B' }}>*</span>
                  </label>
                  <textarea
                    value={material}
                    onChange={e => setMaterial(e.target.value)}
                    placeholder="粘贴你的学习材料，例如：&#10;- 教科书章节&#10;- 技术文档&#10;- 笔记和知识点"
                    rows={10}
                    className="w-full px-4 py-3 rounded-2xl border-2 font-semibold focus:outline-none transition-all resize-none"
                    style={{ borderColor: '#E5E5E5', color: '#3C3C3C' }}
                    onFocus={e => (e.target.style.borderColor = '#8257E5')}
                    onBlur={e => (e.target.style.borderColor = '#E5E5E5')}
                  />
                  <p className="text-xs font-extrabold uppercase tracking-wide mt-2" style={{ color: '#AFAFAF' }}>
                    已输入 {material.length} 字符（最少需要 50 字符）
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl border-2 text-sm font-bold"
                    style={{ background: '#FFF0F0', borderColor: '#FF4B4B', color: '#FF4B4B' }}
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97, y: 3 }}
                  onClick={handleSubmit}
                  disabled={material.trim().length < 50}
                  className="w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: '#FFC800',
                    boxShadow: '0 5px 0 #D4A500',
                    border: '2px solid #D4A500',
                  }}
                >
                  <Sparkles className="w-5 h-5" />
                  生成课程
                </motion.button>
              </motion.div>
            )}

            {step === 'generating' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <motion.div
                    className="absolute inset-0 rounded-full border-4"
                    style={{ borderColor: '#E5E5E5' }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-t-transparent"
                    style={{ borderColor: '#58CC02' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <Loader2 className="absolute inset-0 m-auto w-8 h-8 animate-spin" style={{ color: '#58CC02' }} />
                </div>
                <h3 className="text-xl font-black mb-2" style={{ color: '#3C3C3C' }}>AI 正在生成课程...</h3>
                <p className="font-semibold" style={{ color: '#AFAFAF' }}>这可能需要 30–60 秒，请稍候</p>
              </motion.div>
            )}

            {step === 'preview' && generatedCourse && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
                {/* Course preview card */}
                <div className="rounded-3xl p-6 border-2" style={{ background: '#F7F7F8', borderColor: '#E5E5E5' }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                      style={{ background: '#fff', boxShadow: '0 3px 0 #E5E5E5' }}
                    >
                      {generatedCourse.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-black" style={{ color: '#3C3C3C' }}>{generatedCourse.title}</h3>
                      <p className="text-sm font-semibold" style={{ color: '#AFAFAF' }}>{generatedCourse.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-5 text-sm font-extrabold uppercase tracking-wide" style={{ color: '#AFAFAF' }}>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      {generatedCourse.chapters?.length || 0} 个章节
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" style={{ color: '#58CC02' }} />
                      {generatedCourse.levels?.length || 0} 个关卡
                    </span>
                  </div>
                </div>

                {/* Chapter list */}
                <div className="flex flex-col gap-3">
                  <h4 className="font-black uppercase tracking-wide text-sm" style={{ color: '#3C3C3C' }}>章节预览</h4>
                  {generatedCourse.chapters?.slice(0, 3).map((chapter, idx) => (
                    <div key={chapter.id || idx} className="p-4 rounded-2xl border-2 flex items-center gap-3" style={{ borderColor: '#E5E5E5' }}>
                      <span
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                        style={{ background: '#F0EBF8', color: '#8257E5' }}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-extrabold text-sm" style={{ color: '#3C3C3C' }}>{chapter.title}</p>
                        <p className="text-xs font-semibold" style={{ color: '#AFAFAF' }}>{chapter.description}</p>
                      </div>
                    </div>
                  ))}
                  {(generatedCourse.chapters?.length || 0) > 3 && (
                    <p className="text-sm font-bold text-center" style={{ color: '#AFAFAF' }}>
                      还有 {generatedCourse.chapters!.length - 3} 个章节...
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('input')}
                    className="flex-1 py-4 rounded-2xl font-extrabold border-2 uppercase tracking-wider cursor-pointer"
                    style={{ background: '#F7F7F8', color: '#AFAFAF', borderColor: '#E5E5E5', boxShadow: '0 4px 0 #E5E5E5' }}
                  >
                    重新编辑
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97, y: 3 }}
                    onClick={handleConfirm}
                    className="flex-1 py-4 rounded-2xl font-black uppercase tracking-wider text-white cursor-pointer"
                    style={{ background: '#58CC02', boxShadow: '0 4px 0 #46A302', border: '2px solid #46A302' }}
                  >
                    确认创建
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
