import { NextRequest, NextResponse } from 'next/server';
import { generateCourse } from '@/lib/ai/course-generator';
import { saveCourse, saveCourseMaterial } from '@/lib/db/memory-db';
import { v4 as uuidv4 } from 'uuid';
import { Course, Chapter, Level } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { material, title, difficulty = 'intermediate' } = body;

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

    return NextResponse.json({
      success: true,
      data: {
        courseId,
        course,
      },
    });
  } catch (error: any) {
    console.error('Error generating course:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate course. Please try again.',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
