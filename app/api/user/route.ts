import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser, getStudyStats } from '@/lib/db/memory-db';
import { generateHint, generateExplanation } from '@/lib/ai/course-generator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-1';

    const user = getOrCreateUser(userId);
    const stats = getStudyStats(userId);

    return NextResponse.json({
      user: {
        id: user.id,
        totalXP: user.total_xp,
        currentStreak: user.current_streak,
        energy: user.energy,
        maxEnergy: user.max_energy,
        lastStudyDate: user.last_study_date,
      },
      stats,
    });
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    if (action === 'hint') {
      const { question, attempt } = body;
      const hint = await generateHint(question, attempt);
      return NextResponse.json({ hint });
    }

    if (action === 'explain') {
      const { content } = body;
      const explanation = await generateExplanation(content);
      return NextResponse.json({ explanation });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in AI request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
