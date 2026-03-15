import { NextRequest, NextResponse } from 'next/server';
import { updateLevelStatus, getOrCreateUser, updateUserProgress } from '@/lib/db/memory-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, courseId, levelId, status, xpEarned } = body;

    if (!userId || !courseId || !levelId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    updateLevelStatus(userId, courseId, levelId, status);

    if (status === 'completed' && xpEarned) {
      const user = getOrCreateUser(userId);
      updateUserProgress(userId, {
        totalXP: user.total_xp + xpEarned,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Progress updated successfully',
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-1';
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID required' },
        { status: 400 }
      );
    }

    const { getUserProgress } = await import('@/lib/db/memory-db');
    const completedLevels = getUserProgress(userId, courseId);

    return NextResponse.json({
      userId,
      courseId,
      completedLevels,
    });
  } catch (error) {
    console.error('Error getting progress:', error);
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    );
  }
}
