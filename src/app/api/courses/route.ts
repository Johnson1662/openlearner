import { NextRequest, NextResponse } from 'next/server';
import { getAllCourses, getCourseWithDetails, saveCourse } from '@/lib/db/memory-db';
import { Course, Chapter, Level } from '@/types';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { course, chapters, levels, material } = body;
    
    if (!course || !course.id) {
      return NextResponse.json(
        { error: 'Course data is required' },
        { status: 400 }
      );
    }
    
    // Save course with chapters and levels
    saveCourse(course, chapters || [], levels || []);
    
    // Save material if provided
    if (material) {
      const { saveCourseMaterial } = await import('@/lib/db/memory-db');
      saveCourseMaterial(course.id, material);
    }
    
    return NextResponse.json({ success: true, courseId: course.id });
  } catch (error) {
    console.error('Error saving course:', error);
    return NextResponse.json(
      { error: 'Failed to save course' },
      { status: 500 }
    );
  }
}
