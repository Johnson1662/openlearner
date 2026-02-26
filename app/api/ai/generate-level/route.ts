import { NextRequest, NextResponse } from 'next/server';
import { generateLevelContent } from '@/lib/ai/level-generator';
import { getCourseMaterial, getLevelContent, saveLevelContent } from '@/lib/db/memory-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      courseId, 
      levelId, 
      levelTitle, 
      levelDescription, 
      chapterTitle, 
      material: providedMaterial, 
      difficulty,
      userFeedback,
      previousAnswers,
      generateNext 
    } = body;

    if (!levelTitle) {
      return NextResponse.json(
        { error: 'Missing level title' },
        { status: 400 }
      );
    }

    const shouldBypassCache = generateNext || userFeedback || (previousAnswers && previousAnswers.length > 0);

    if (levelId && !shouldBypassCache) {
      const cached = getLevelContent(levelId);
      if (cached) {
        return NextResponse.json({
          success: true,
          data: { steps: cached.steps },
          cached: true,
        });
      }
    }

    let material = providedMaterial;
    if (!material && courseId) {
      material = getCourseMaterial(courseId);
    }

    if (!material) {
      material = `Course: ${courseId || 'Unknown'}
Level: ${levelTitle}
Description: ${levelDescription || 'No description'}`;
    }

    const steps = await generateLevelContent({
      levelTitle,
      levelDescription: levelDescription || '',
      chapterTitle: chapterTitle || '',
      material,
      difficulty: difficulty || 'intermediate',
      userFeedback,
      previousAnswers,
    });

    if (levelId) {
      saveLevelContent(levelId, steps);
    }

    return NextResponse.json({
      success: true,
      data: { steps },
      cached: false,
    });
  } catch (error: any) {
    console.error('Error generating level content:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate level content',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
