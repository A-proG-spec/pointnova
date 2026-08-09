import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import Task from '@/lib/db/models/Task';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { taskId } = body;
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    if (!task.isActive) {
      return NextResponse.json(
        { error: 'Task is no longer active' },
        { status: 400 }
      );
    }
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (!user.completedTasks) {
      user.completedTasks = [];
    }
    
    const taskIdString = taskId.toString();
    if (user.completedTasks.includes(taskIdString)) {
      return NextResponse.json(
        { error: 'Task already completed' },
        { status: 400 }
      );
    }
    
    user.completedTasks.push(taskIdString);
    
    const rewardAmount = task.reward || 25;
    user.balance = (user.balance || 0) + rewardAmount;
    user.totalEarned = (user.totalEarned || 0) + rewardAmount;
    
    await user.save();
    
    return NextResponse.json({
      success: true,
      newBalance: user.balance,
      totalEarned: user.totalEarned,
      amount: rewardAmount,
      completedTasks: user.completedTasks,
      message: `🎉 +${rewardAmount} ETB earned!`,
    });
  } catch (error) {
    console.error('❌ Reward error:', error);
    return NextResponse.json(
      { error: 'Failed to add reward' },
      { status: 500 }
    );
  }
}