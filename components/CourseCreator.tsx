'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Sparkles, Loader2, BookOpen, CheckCircle } from 'lucide-react';
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

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">AI 创建课程</h2>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {step === 'input' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    课程标题 <span className="text-gray-400 font-normal">(可选)</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例如：Python编程入门"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    难度级别
                  </label>
                  <div className="flex gap-3">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                          difficulty === level
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {level === 'beginner' ? '初级' : level === 'intermediate' ? '中级' : '高级'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    学习材料 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="粘贴你的学习材料，例如：&#10;- 教科书章节&#10;- 技术文档&#10;- 笔记和知识点&#10;- 任何你想学习的内容&#10;&#10;材料越长，生成的课程越完整..."
                    rows={10}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    已输入 {material.length} 字符 (最少需要 50 字符)
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 text-red-600 rounded-xl text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={material.trim().length < 50}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  生成课程
                </motion.button>
              </motion.div>
            )}

            {step === 'generating' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center"
              >
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-indigo-100"
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI 正在生成课程...</h3>
                <p className="text-gray-500">这可能需要 30-60 秒，请稍候</p>
              </motion.div>
            )}

            {step === 'preview' && generatedCourse && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-sm">
                      {generatedCourse.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{generatedCourse.title}</h3>
                      <p className="text-gray-600 text-sm">{generatedCourse.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>{generatedCourse.chapters?.length || 0} 个章节</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      <span>{generatedCourse.levels?.length || 0} 个关卡</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">章节预览</h4>
                  {generatedCourse.chapters?.slice(0, 3).map((chapter, idx) => (
                    <div key={chapter.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 text-sm font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{chapter.title}</p>
                          <p className="text-sm text-gray-500">{chapter.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(generatedCourse.chapters?.length || 0) > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      还有 {generatedCourse.chapters!.length - 3} 个章节...
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('input')}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    重新编辑
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirm}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
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
