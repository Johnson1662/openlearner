import { NextRequest, NextResponse } from 'next/server';
import { getAllCourses, getCourseWithDetails } from '@/lib/db/memory-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('id');
    const userId = searchParams.get('userId') || 'user-1';

    if (courseId) {
      const courseData = getCourseWithDetails(courseId, userId);
      if (!courseData) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(courseData);
    }

    const courses = getAllCourses();
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error getting courses:', error);
    return NextResponse.json(
      { error: 'Failed to get courses' },
      { status: 500 }
    );
  }
}
