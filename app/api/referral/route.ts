import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { verifyToken } from '@/lib/auth/jwt';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // For production: Get user from JWT token instead of query param
    const token = request.cookies.get('auth_token')?.value;
    
    let userId: string | null = null;
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }

    // Fallback to query param (for development/testing)
    if (!userId) {
      const searchParams = request.nextUrl.searchParams;
      userId = searchParams.get('userId');
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "pointnovaEarn_bot";
    const miniAppName = process.env.NEXT_PUBLIC_APP_NAME || "Pointnova";

    // Build the referral link
    const referralLink =
      `https://t.me/${botUsername}/${miniAppName}?startapp=ref_${user.referralCode}`;

    // Count total referrals
    const referralCount = await User.countDocuments({ referredBy: user.referralCode });

    // Get full referral details with populated user data
    const referrals = await User.find(
      { referredBy: user.referralCode },
      'telegramId username firstName lastName photoUrl createdAt'
    ).lean();

    // Format referral data
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
      // Also return user's referral earnings (if you track them)
      referralEarnings: user.referralEarnings || 0,
    });
  } catch (error) {
    console.error('❌ Referral fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch referral data',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: 500 }
    );
  }
}