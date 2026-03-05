import { NextRequest, NextResponse } from 'next/server';
import { generateCourse } from '@/lib/ai/course-generator';
import { saveCourse, saveCourseMaterial, saveCourseRequirements } from '@/lib/db/memory-db';
import { isLikelyNetworkTimeout } from '@/lib/ai/network-timeout';
import { v4 as uuidv4 } from 'uuid';
import { Course, Chapter, Level } from '@/types';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { material, title, difficulty = 'intermediate', subject, priorKnowledge, learningGoal, learningPacing, materialSourceType } = body;

    if (!material || material.trim().length < 50) {
      return NextResponse.json(
        { error: 'Material must be at least 50 characters long' },
        { status: 400 }
      );
    }

    const generatedCourse = await generateCourse({
      material,
      title,
      difficulty,
      subject,
      priorKnowledge,
      learningGoal,
      learningPacing,
      abortSignal: request.signal,
    });

    const courseId = `course-${uuidv4()}`;
    
    const course: Course = {
      id: courseId,
      title: generatedCourse.title,
      description: generatedCourse.description,
      icon: generatedCourse.icon,
      thumbnail: generatedCourse.thumbnail,
      coverImage: generatedCourse.coverImage,
      lessons: generatedCourse.estimatedLessons,
      exercises: generatedCourse.estimatedExercises,
      progress: 0,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      chapters: [],
      levels: [],
    };

    const chapters: Chapter[] = generatedCourse.chapters.map((ch, idx) => ({
      id: `chapter-${courseId}-${idx}`,
      title: ch.title,
      description: ch.description,
      order: ch.order,
      levelIds: [],
    }));

    const levels: Level[] = generatedCourse.levels.map((lvl, idx) => {
      const chapterIndex = lvl.chapterIndex;
      const levelId = `level-${courseId}-${idx}`;

      // Level outline only - content will be generated on-demand
      return {
        id: levelId,
        title: lvl.title,
        description: lvl.description,
        order: lvl.order,
        chapterId: chapters[chapterIndex]?.id || chapters[0]?.id,
        status: 'available',
        steps: [], // Empty initially - will be generated when user enters the level
        xpReward: lvl.xpReward,
      };
    });

    chapters.forEach(ch => {
      ch.levelIds = levels
        .filter(l => l.chapterId === ch.id)
        .map(l => l.id);
    });

    course.chapters = chapters;
    course.levels = levels;

    saveCourse(course, chapters, levels);
    saveCourseMaterial(courseId, material);

    // Save course requirements if provided
    saveCourseRequirements(courseId, {
      subject: subject || title || undefined,
      priorKnowledge: priorKnowledge || difficulty,
      learningGoal,
      learningPacing,
      materialSourceType,
    });

    return NextResponse.json({
      success: true,
      data: {
        courseId,
        course,
      },
    });
  } catch (error: unknown) {
    console.error('Error generating course:', error);

    const details = error instanceof Error ? error.message : String(error);
    const isNetworkTimeout = isLikelyNetworkTimeout(details);
    const isConnectTimeout = details.toLowerCase().includes('und_err_connect_timeout')
      || details.toLowerCase().includes('connect timeout error');

    return NextResponse.json(
      { 
        error: isConnectTimeout
          ? 'Cannot connect to Gemini API from current network. Configure GEMINI_BASE_URL/proxy or retry later.'
          : isNetworkTimeout
            ? 'Gemini API network timeout. Please retry in a moment.'
            : 'Failed to generate course. Please try again.',
        details,
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      },
      { status: isNetworkTimeout ? 503 : 500 }
    );
  }
}
