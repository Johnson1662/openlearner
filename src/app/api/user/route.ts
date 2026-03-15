import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser, getStudyStats } from '@/lib/db/memory-db';

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
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/ai/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, attempt }),
      });
      if (!response.ok) throw new Error('Failed to get hint from backend');
      const data = await response.json();
      return NextResponse.json({ hint: data.hint || data.data?.hint });
    }

    if (action === 'explain') {
      const { content } = body;
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/ai/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to get explanation from backend');
      const data = await response.json();
      return NextResponse.json({ explanation: data.explanation || data.data?.explanation });
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
