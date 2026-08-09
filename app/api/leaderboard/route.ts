import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch top earners sorted descending by totalEarned
    const users = await User.find({ totalEarned: { $gt: 0 } })
      .sort({ totalEarned: -1 })
      .limit(100)
      .select('username firstName lastName totalEarned');
    
    const leaderboard = users.map((user, index) => {
      // Resolve display name prioritizing username -> full name -> fallback ID
      const displayName = user.username
        ? `@${user.username}`
        : [user.firstName, user.lastName].filter(Boolean).join(' ') || `User ${user._id.toString().slice(-4)}`;

      return {
        position: index + 1,
        username: displayName,
        totalEarned: user.totalEarned || 0,
      };
    });
    
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('❌ Leaderboard fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}