import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      console.log('❌ No auth token found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      console.log('❌ Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    await dbConnect();
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log('❌ User not found:', decoded.userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('✅ User found:', user._id);
    
    return NextResponse.json({
      user: {
        id: user._id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        balance: user.balance,
        totalEarned: user.totalEarned,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        referrals: user.referrals || [], // Include referrals
      }
    });
  } catch (error) {
    console.error('❌ Error getting user:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}