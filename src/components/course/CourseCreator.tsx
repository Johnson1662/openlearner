'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, Loader2, BookOpen, CheckCircle,
  FileText, Link, ClipboardPaste, Upload, ArrowRight, ArrowLeft,
  GraduationCap, Target, Gauge, Eye,
  Briefcase, Award, Heart, Zap, Scale, BookMarked,
} from 'lucide-react';
import { generateCourse, parseMaterialFromPDF, parseMaterialFromURL, GenerateCourseParams } from '@/lib/api';
import { Course } from '@/types';
import LoadingState from '@/components/ui/LoadingState';

interface CourseCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (course: Course) => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5;
type MaterialSource = 'paste' | 'pdf' | 'url';
type PriorKnowledge = 'beginner' | 'intermediate' | 'advanced';
type LearningGoal = 'professional' | 'exam' | 'hobby';
type LearningPacing = 'fast' | 'balanced' | 'thorough';
type Phase = 'wizard' | 'generating' | 'preview';

export default function CourseCreator({ isOpen, onClose, onCourseCreated }: CourseCreatorProps) {
  const [phase, setPhase] = useState<Phase>('wizard');
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);

  const [subject, setSubject] = useState('');
  const [materialSource, setMaterialSource] = useState<MaterialSource>('paste');
  const [material, setMaterial] = useState('');
  const [url, setUrl] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [priorKnowledge, setPriorKnowledge] = useState<PriorKnowledge>('intermediate');
  const [learningGoal, setLearningGoal] = useState<LearningGoal>('professional');
  const [learningPacing, setLearningPacing] = useState<LearningPacing>('balanced');

  const [generatedCourse, setGeneratedCourse] = useState<Course | null>(null);
  const [error, setError] = useState('');

  const totalSteps = 5;

  const handlePdfUpload = async (file: File) => {
    setPdfFile(file);
    setIsParsing(true);
    setParseError('');
    try {
      const result = await parseMaterialFromPDF(file);
      setMaterial(result.text);
      if (result.title && !subject) setSubject(result.title);
    } catch (err: any) {
      setParseError(err.message || 'PDF 解析失败');
      setPdfFile(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleUrlParse = async () => {
    if (!url.trim()) return;
    setIsParsing(true);
    setParseError('');
    try {
      const result = await parseMaterialFromURL(url.trim());
      setMaterial(result.text);
      if (result.title && !subject) setSubject(result.title);
    } catch (err: any) {
      setParseError(err.message || '网页内容提取失败');
    } finally {
      setIsParsing(false);
    }
  };

  const canProceedStep1 = (): boolean => {
    const m = material || '';
    if (materialSource === 'paste') return m.trim().length >= 50;
    if (materialSource === 'pdf') return m.trim().length >= 50 && !isParsing;
    if (materialSource === 'url') return m.trim().length >= 50 && !isParsing;
    return false;
  };

  const handleGenerate = async () => {
    const m = material || '';
    if (m.trim().length < 50) {
      setError('学习材料至少需要 50 个字符');
      return;
    }
    setPhase('generating');
    setError('');
    try {
      const params: GenerateCourseParams = {
        material,
        title: subject || undefined,
        difficulty: priorKnowledge,
        subject: subject || undefined,
        priorKnowledge,
        learningGoal,
        learningPacing,
        materialSourceType: materialSource,
      };
      const result = await generateCourse(params);
      setGeneratedCourse(result.data.course);
      setPhase('preview');
    } catch (err: any) {
      setError(err.message || '生成课程失败，请重试');
      setPhase('wizard');
      setWizardStep(5);
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
    setPhase('wizard');
    setWizardStep(1);
    setSubject('');
    setMaterialSource('paste');
    setMaterial('');
    setUrl('');
    setPdfFile(null);
    setIsParsing(false);
    setParseError('');
    setPriorKnowledge('intermediate');
    setLearningGoal('professional');
    setLearningPacing('balanced');
    setGeneratedCourse(null);
    setError('');
  };

  const handleClose = () => { reset(); onClose(); };

  if (!isOpen) return null;

  const knowledgeLabels: Record<PriorKnowledge, { label: string; desc: string; icon: React.ReactNode }> = {
    beginner: { label: '初学者', desc: '这个领域我完全是新手', icon: <GraduationCap className="w-5 h-5" /> },
    intermediate: { label: '有基础', desc: '我了解基本概念', icon: <BookOpen className="w-5 h-5" /> },
    advanced: { label: '高级', desc: '我需要深入学习进阶内容', icon: <Award className="w-5 h-5" /> },
  };

  const goalLabels: Record<LearningGoal, { label: string; desc: string; icon: React.ReactNode }> = {
    professional: { label: '职业发展', desc: '用于工作或职业提升', icon: <Briefcase className="w-5 h-5" /> },
    exam: { label: '考试备考', desc: '为考试或认证做准备', icon: <Award className="w-5 h-5" /> },
    hobby: { label: '兴趣爱好', desc: '纯粹出于兴趣学习', icon: <Heart className="w-5 h-5" /> },
  };

  const pacingLabels: Record<LearningPacing, { label: string; desc: string; icon: React.ReactNode }> = {
    fast: { label: '快速掌握', desc: '精炼要点，快速上手', icon: <Zap className="w-5 h-5" /> },
    balanced: { label: '均衡学习', desc: '理论与练习结合', icon: <Scale className="w-5 h-5" /> },
    thorough: { label: '深入理解', desc: '详细讲解，大量练习', icon: <BookMarked className="w-5 h-5" /> },
  };

  const sourceOptions: { value: MaterialSource; label: string; icon: React.ReactNode }[] = [
    { value: 'paste', label: '粘贴文本', icon: <ClipboardPaste className="w-4 h-4" /> },
    { value: 'pdf', label: '上传 PDF', icon: <FileText className="w-4 h-4" /> },
    { value: 'url', label: '网页链接', icon: <Link className="w-4 h-4" /> },
  ];

  const stepTitles: Record<WizardStep, string> = {
    1: '学习材料',
    2: '知识水平',
    3: '学习目标',
    4: '学习节奏',
    5: '确认信息',
  };

  const renderProgressBar = () => (
    <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
      {([1, 2, 3, 4, 5] as WizardStep[]).map(step => (
        <div key={step} className="flex-1 flex items-center gap-1">
          <div
            className={`h-2 rounded-full flex-1 transition-all duration-300 ${
              step <= wizardStep ? 'bg-primary' : 'bg-secondary'
            }`}
          />
        </div>
      ))}
      <span className="text-xs font-bold ml-2 text-muted-foreground">
        {wizardStep}/{totalSteps}
      </span>
    </div>
  );

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
      {/* Subject */}
      <div>
        <label className="block text-sm font-bold uppercase tracking-wide mb-2 text-foreground">
          学习主题 <span className="font-medium normal-case tracking-normal text-muted-foreground">(可选，AI 可自动识别)</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="例如：Python编程、微积分、机器学习..."
          className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground"
        />
      </div>

      {/* Material Source Selector */}
      <div>
        <label className="block text-sm font-bold uppercase tracking-wide mb-2 text-foreground">
          材料来源 <span className="text-destructive">*</span>
        </label>
        <div className="flex gap-2">
          {sourceOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => {
                setMaterialSource(opt.value);
                setParseError('');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                materialSource === opt.value
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-secondary text-muted-foreground border-transparent hover:bg-secondary/80'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Material Input Area */}
      {materialSource === 'paste' && (
        <div>
          <textarea
            value={material}
            onChange={e => setMaterial(e.target.value)}
            placeholder="粘贴你的学习材料，例如：&#10;- 教科书章节&#10;- 技术文档&#10;- 笔记和知识点"
            rows={8}
            className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none placeholder:text-muted-foreground"
          />
          <p className="text-xs font-bold uppercase tracking-wide mt-2 text-muted-foreground">
            已输入 {(material?.length || 0)} 字符（最少需要 50 字符）
          </p>
        </div>
      )}

      {materialSource === 'pdf' && (
        <div className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handlePdfUpload(file);
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsing}
            className={`w-full py-10 rounded-xl border-2 border-dashed font-bold text-sm flex flex-col items-center gap-3 cursor-pointer transition-all disabled:opacity-50 ${
              pdfFile 
                ? 'border-primary bg-primary/5 text-primary' 
                : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
            }`}
          >
            {isParsing ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin" />
                <span>正在解析 PDF...</span>
              </>
            ) : pdfFile ? (
              <>
                <CheckCircle className="w-8 h-8" />
                <span>{pdfFile.name}</span>
                <span className="text-xs font-medium text-muted-foreground">已提取 {(material?.length || 0)} 字符 · 点击重新上传</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8" />
                <span>点击上传 PDF 文件</span>
                <span className="text-xs font-medium normal-case text-muted-foreground">最大 10MB</span>
              </>
            )}
          </button>
        </div>
      )}

      {materialSource === 'url' && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="flex-1 px-4 py-3 rounded-xl border border-input bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground"
            />
            <button
              onClick={handleUrlParse}
              disabled={!url.trim() || isParsing}
              className="px-5 py-3 rounded-xl font-bold text-sm text-primary-foreground bg-primary hover:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : '提取'}
            </button>
          </div>
          {material && (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary">已提取 {(material?.length || 0)} 字符</span>
              </div>
              <p className="text-xs font-medium line-clamp-2 text-muted-foreground">
                {(material || '').slice(0, 150)}...
              </p>
            </div>
          )}
        </div>
      )}

      {parseError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-bold"
        >
          {parseError}
        </motion.div>
      )}
    </motion.div>
  );

  const renderChoiceStep = <T extends string>(
    title: string,
    subtitle: string,
    options: Record<T, { label: string; desc: string; icon: React.ReactNode }>,
    value: T,
    onChange: (v: T) => void,
  ) => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
      <div className="text-center mb-2">
        <h3 className="text-xl font-black text-foreground">{title}</h3>
        <p className="text-sm font-medium mt-1 text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-3">
        {(Object.keys(options) as T[]).map(key => {
          const opt = options[key];
          const selected = value === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 cursor-pointer transition-all ${
                selected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card hover:border-primary/30 hover:bg-secondary/30'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  selected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {opt.icon}
              </div>
              <div className="flex-1">
                <p className={`font-bold text-sm ${selected ? 'text-primary' : 'text-foreground'}`}>
                  {opt.label}
                </p>
                <p className="text-xs font-medium mt-0.5 text-muted-foreground">
                  {opt.desc}
                </p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  selected
                    ? 'border-primary bg-primary'
                    : 'border-border bg-transparent'
                }`}
              >
                {selected && <CheckCircle className="w-4 h-4 text-primary-foreground" />}
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  const renderStep5Preview = () => {
    const summaryItems = [
      { label: '学习主题', value: subject || '(AI 自动识别)', icon: <Target className="w-4 h-4" /> },
      { label: '材料来源', value: sourceOptions.find(s => s.value === materialSource)?.label || '-', icon: sourceOptions.find(s => s.value === materialSource)?.icon },
      { label: '材料长度', value: `${material?.length || 0} 字符`, icon: <FileText className="w-4 h-4" /> },
      { label: '知识水平', value: knowledgeLabels[priorKnowledge].label, icon: knowledgeLabels[priorKnowledge].icon },
      { label: '学习目标', value: goalLabels[learningGoal].label, icon: goalLabels[learningGoal].icon },
      { label: '学习节奏', value: pacingLabels[learningPacing].label, icon: pacingLabels[learningPacing].icon },
    ];

    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
        <div className="text-center mb-2">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-primary/10">
            <Eye className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-black text-foreground">确认你的学习计划</h3>
          <p className="text-sm font-medium mt-1 text-muted-foreground">检查以下信息，然后开始生成课程</p>
        </div>

        <div className="rounded-xl border border-border overflow-hidden bg-card">
          {summaryItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-secondary text-muted-foreground">
                {item.icon}
              </div>
              <span className="text-xs font-bold uppercase tracking-wide flex-shrink-0 text-muted-foreground min-w-[64px]">
                {item.label}
              </span>
              <span className="text-sm font-bold ml-auto text-right text-foreground">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-bold"
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    );
  };

  const renderWizardContent = () => {
    switch (wizardStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderChoiceStep<PriorKnowledge>(
          '你的知识水平如何？',
          '这将帮助 AI 调整课程难度',
          knowledgeLabels,
          priorKnowledge,
          setPriorKnowledge,
        );
      case 3:
        return renderChoiceStep<LearningGoal>(
          '你的学习目标是什么？',
          '我们会根据目标调整课程侧重点',
          goalLabels,
          learningGoal,
          setLearningGoal,
        );
      case 4:
        return renderChoiceStep<LearningPacing>(
          '你期望的学习节奏？',
          '这将影响课程的深度和练习量',
          pacingLabels,
          learningPacing,
          setLearningPacing,
        );
      case 5:
        return renderStep5Preview();
    }
  };

  const canGoNext = (): boolean => {
    if (wizardStep === 1) return canProceedStep1();
    return true;
  };

  const handleNext = () => {
    if (wizardStep < 5) setWizardStep((wizardStep + 1) as WizardStep);
  };

  const handleBack = () => {
    if (wizardStep > 1) setWizardStep((wizardStep - 1) as WizardStep);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card text-card-foreground rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-border shadow-xl flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">AI 创建课程</h2>
                {phase === 'wizard' && (
                  <p className="text-xs font-bold text-muted-foreground">
                    步骤 {wizardStep}: {stepTitles[wizardStep]}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Progress bar for wizard */}
          {phase === 'wizard' && renderProgressBar()}

          <div className="p-6 overflow-y-auto flex-1">
            {/* Wizard Steps */}
            {phase === 'wizard' && (
              <>
                <AnimatePresence mode="wait">
                  <div key={wizardStep}>
                    {renderWizardContent()}
                  </div>
                </AnimatePresence>

                {/* Navigation buttons */}
                <div className="flex gap-3 mt-8">
                  {wizardStep > 1 && (
                    <button
                      onClick={handleBack}
                      className="flex-shrink-0 px-6 py-4 rounded-xl font-bold border border-border bg-card text-muted-foreground uppercase tracking-wider cursor-pointer flex items-center gap-2 hover:bg-secondary/50 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      上一步
                    </button>
                  )}

                  {wizardStep < 5 ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNext}
                      disabled={!canGoNext()}
                      className="flex-1 py-4 rounded-xl font-black text-base uppercase tracking-wider text-primary-foreground bg-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                    >
                      下一步
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGenerate}
                      className="flex-1 py-4 rounded-xl font-black text-base uppercase tracking-wider text-primary-foreground bg-primary flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
                    >
                      <Sparkles className="w-5 h-5" />
                      开始生成课程
                    </motion.button>
                  )}
                </div>
              </>
            )}

            {/* Generating */}
            {phase === 'generating' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12">
                <LoadingState 
                  message="AI 正在生成课程..." 
                  steps={[
                    '正在分析学习材料...',
                    '构建知识图谱...',
                    '生成章节和关卡...',
                    '设计互动练习...',
                    '即将完成...'
                  ]}
                />
              </motion.div>
            )}

            {/* Preview */}
            {phase === 'preview' && generatedCourse && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
                <div className="rounded-2xl p-6 border border-border bg-secondary/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 bg-card shadow-sm border border-border">
                      {generatedCourse.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-foreground">{generatedCourse.title}</h3>
                      <p className="text-sm font-medium text-muted-foreground">{generatedCourse.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-5 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      {generatedCourse.chapters?.length || 0} 个章节
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      {generatedCourse.levels?.length || 0} 个关卡
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="font-black uppercase tracking-wide text-sm text-foreground">章节预览</h4>
                  {generatedCourse.chapters?.slice(0, 3).map((chapter, idx) => (
                    <div key={chapter.id || idx} className="p-4 rounded-xl border border-border bg-card flex items-center gap-4">
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0 bg-primary/10 text-primary">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-sm text-foreground">{chapter.title}</p>
                        <p className="text-xs font-medium text-muted-foreground">{chapter.description}</p>
                      </div>
                    </div>
                  ))}
                  {(generatedCourse.chapters?.length || 0) > 3 && (
                    <p className="text-sm font-bold text-center text-muted-foreground">
                      还有 {generatedCourse.chapters!.length - 3} 个章节...
                    </p>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => { setPhase('wizard'); setWizardStep(1); }}
                    className="flex-1 py-4 rounded-xl font-bold border border-border bg-card text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-secondary/50 transition-all"
                  >
                    重新编辑
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirm}
                    className="flex-1 py-4 rounded-xl font-black uppercase tracking-wider text-primary-foreground bg-primary cursor-pointer shadow-md hover:shadow-lg transition-all"
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
