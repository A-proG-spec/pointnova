import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { verifyToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    let userId: string | null = null;
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }

    if (!userId) {
      const searchParams = request.nextUrl.searchParams;
      userId = searchParams.get('userId');
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "pointnovaEarn_bot";
    const referralLink = `https://t.me/${botUsername}?startapp=ref_${user.referralCode}`;

    // Dynamically find all users referred by this user
    const referrals = await User.find(
      { referredBy: user.referralCode },
      'telegramId username firstName lastName photoUrl createdAt'
    ).sort({ createdAt: -1 }).lean();

    const referralCount = referrals.length;
    
    // Constant matches the frontend REFERRAL_REWARD
    const REFERRAL_REWARD = 100;
    
    // Calculate earnings dynamically or use database field if tracked properly
    // Fallback to calculation if database field is 0 but referrals exist
    const calculatedEarnings = referralCount * REFERRAL_REWARD;
    const actualEarnings = user.referralEarnings > 0 ? user.referralEarnings : calculatedEarnings;

    const formattedReferrals = referrals.map((ref: any) => ({
      userId: ref._id,
      telegramId: ref.telegramId,
      username: ref.username || 'Unknown',
      firstName: ref.firstName || 'User',
      lastName: ref.lastName || '',
      photoUrl: ref.photoUrl || '',
      joinedAt: ref.createdAt || new Date(),
    }));

    return NextResponse.json({
      success: true,
      referralCode: user.referralCode,
      referralLink,
      referralCount,
      referrals: formattedReferrals,
      referralEarnings: actualEarnings,
    });
  } catch (error) {
    console.error('❌ Referral fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral data' },
      { status: 500 }
    );
  }
}