import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';

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
    const { amount = 25, taskId } = body;
    
    await dbConnect();
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if user already completed this task
    if (taskId) {
      if (!user.completedTasks) {
        user.completedTasks = [];
      }
      if (user.completedTasks.includes(taskId)) {
        return NextResponse.json(
          { error: 'Task already completed' },
          { status: 400 }
        );
      }
      // Mark task as completed
      user.completedTasks.push(taskId);
    }
    
    // Add reward
    user.balance = (user.balance || 0) + amount;
    user.totalEarned = (user.totalEarned || 0) + amount;
    
    await user.save();
    
    return NextResponse.json({
      success: true,
      newBalance: user.balance,
      totalEarned: user.totalEarned,
      amount: amount,
      message: `🎉 +${amount} ETB earned!`,
    });
  } catch (error) {
    console.error('❌ Reward error:', error);
    return NextResponse.json(
      { error: 'Failed to add reward' },
      { status: 500 }
    );
  }
}