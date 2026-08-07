import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    const users = await User.find({ totalEarned: { $gt: 0 } })
      .sort({ totalEarned: -1 })
      .limit(100)
      .select('name totalEarned');
    
    const leaderboard = users.map((user, index) => ({
      position: index + 1,
      username: user.name || `User ${user._id.toString().slice(-6)}`,
      totalEarned: user.totalEarned,
    }));
    
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}