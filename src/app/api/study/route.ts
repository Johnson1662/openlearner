import { NextRequest, NextResponse } from 'next/server';
import { recordStudySession, getStudyStats, hasStudiedToday } from '@/lib/db/memory-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, courseId, levelId, duration, xpEarned } = body;

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = recordStudySession(userId, courseId, levelId || null, duration || 0, xpEarned || 0);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error recording study session:', error);
    return NextResponse.json(
      { error: 'Failed to record study session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-1';
    const type = searchParams.get('type');

    if (type === 'today') {
      const hasStudied = hasStudiedToday(userId);
      return NextResponse.json({ hasStudied });
    }

    const stats = getStudyStats(userId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting study stats:', error);
    return NextResponse.json(
      { error: 'Failed to get study stats' },
      { status: 500 }
    );
  }
}
