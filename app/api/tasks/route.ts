import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Task from '@/lib/db/models/Task';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    
    // Get only active tasks
    const tasks = await Task.find({ isActive: true })
      .sort({ createdAt: 1 }) // Oldest first (consistent order)
      .select('_id name reward'); // Only return what we need
    
    // Transform _id to id for frontend consistency
    const formattedTasks = tasks.map((task) => ({
      id: task._id.toString(),
      name: task.name,
      reward: task.reward || 25,
    }));

    console.log(`📋 Fetched ${formattedTasks.length} tasks`);
    
    return NextResponse.json({
      success: true,
      tasks: formattedTasks,
    });
  } catch (error) {
    console.error('❌ Tasks fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}