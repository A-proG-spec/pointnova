import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Task from '@/lib/db/models/Task';

export async function GET() {
  try {
    await dbConnect();
    const tasks = await Task.find({ isActive: true }).sort({ createdAt: -1 });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Tasks fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}