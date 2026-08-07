import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { verifyToken } from '@/lib/auth/jwt';

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

    // Fallback to query param (for development)
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

    const referralLink =
      `https://t.me/${botUsername}/${miniAppName}?startapp=ref_${user.referralCode}`;

    const referralCount = await User.countDocuments({ referredBy: user.referralCode });

    // Get full referral details
    const referrals = user.referrals || [];

    return NextResponse.json({
      referralCode: user.referralCode,
      referralLink,
      referralCount,
      referrals: referrals.map((ref: any) => ({
        userId: ref.userId,
        username: ref.username,
        firstName: ref.firstName,
        joinedAt: ref.joinedAt,
      })),
    });
  } catch (error) {
    console.error('Referral fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral data' },
      { status: 500 }
    );
  }
}