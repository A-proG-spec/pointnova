import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';

export const dynamic = 'force-dynamic';

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
    
    // ADD: Get current Telegram user from request (if available)
    // This adds an extra layer of validation
    const telegramInitData = request.cookies.get('telegram_user')?.value;
    if (telegramInitData) {
      try {
        const tgData = JSON.parse(telegramInitData);
        if (tgData.id && user.telegramId !== tgData.id.toString()) {
          console.log('❌ User mismatch: DB user vs Telegram user');
          return NextResponse.json({ error: 'User mismatch' }, { status: 401 });
        }
      } catch (e) {
        console.log('⚠️ Could not parse telegram user data');
      }
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
      }
    });
  } catch (error) {
    console.error('❌ Error getting user:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}