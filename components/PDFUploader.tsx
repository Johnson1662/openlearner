'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Loader2, CheckCircle, Sparkles, BookOpen, Calculator, Shapes } from 'lucide-react';

interface PDFUploaderProps {
  onUploadComplete: () => void;
}

export default function PDFUploader({ onUploadComplete }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      processFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      
      setTimeout(() => {
        onUploadComplete();
      }, 1200);
    }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto"
    >
      {/* Hero Section */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-glow floating"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-4xl font-extrabold gradient-text-indigo mb-3">
          将知识转化为游戏
        </h1>
        <p className="text-text-secondary text-lg">
          上传 PDF 教材，AI 自动生成学习路径
        </p>
      </div>

      {/* Upload Zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? '#6366F1' : 'rgba(255, 255, 255, 0.4)',
        }}
        className="glass-card p-10 text-center cursor-pointer border-2 border-dashed"
        style={{ borderStyle: isDragging ? 'solid' : 'dashed' }}
      >
        <AnimatePresence mode="wait">
          {!isProcessing && !isComplete ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-surface-bg to-surface-bg-secondary flex items-center justify-center">
                <Upload className="w-8 h-8 text-brand-primary" />
              </div>
              
              <h3 className="text-xl font-bold text-text-primary mb-2">
                拖拽 PDF 文件到这里
              </h3>
              <p className="text-text-muted text-sm mb-6">或点击选择文件</p>
              
              <label className="btn-primary inline-block cursor-pointer">
                选择文件
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </motion.div>
          ) : isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-glow"
              >
                <Loader2 className="w-8 h-8 text-white" />
              </motion.div>
              
              <h3 className="text-xl font-bold text-text-primary mb-2">
                AI 正在解析文档...
              </h3>
              <p className="text-text-muted text-sm mb-5">{fileName}</p>
              
              <div className="max-w-xs mx-auto">
                <div className="progress-bar h-2">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.3, ease: "easeInOut" }}
                    className="progress-bar-fill"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-brand-cta to-emerald-400 flex items-center justify-center shadow-glow-cta"
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>
              
              <h3 className="text-xl font-bold text-text-primary mb-2">
                学习路径已生成！
              </h3>
              <p className="text-text-muted text-sm">
                正在准备游戏化学习体验...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Demo Card */}
      <div className="mt-6 glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-cta to-emerald-400 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-text-primary">演示模式</span>
          <span className="badge-purple ml-auto">离散数学</span>
        </div>
        <p className="text-sm text-text-muted mb-4">
          当前演示使用预设的《离散数学》第二章内容，包含 3 个关卡：
        </p>
        <ul className="space-y-3">
          {[
            { icon: BookOpen, text: '关系的定义与集合表示' },
            { icon: Shapes, text: '自反性、对称性的可视化判定' },
            { icon: Calculator, text: '等价类与商集的交互式划分' }
          ].map((item, index) => (
            <li key={index} className="flex items-center gap-3 text-sm text-text-secondary">
              <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 text-brand-primary text-xs flex items-center justify-center font-bold">
                {index + 1}
              </span>
              <item.icon className="w-4 h-4 text-brand-primary" />
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
