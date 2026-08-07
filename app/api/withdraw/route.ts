import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Withdraw request:', { userId: decoded.userId, amount: body.amount });

    // MVP: Just return a message that withdrawal is coming soon
    return NextResponse.json({
      success: true,
      message: 'Withdrawal feature coming soon!',
      status: 'coming_soon',
      userId: decoded.userId,
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    return NextResponse.json(
      { error: 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}