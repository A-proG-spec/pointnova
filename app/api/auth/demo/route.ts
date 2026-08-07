import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { generateToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }
  
  try {
    console.log('🔧 Demo login requested');
    await dbConnect();
    
    let user = await User.findOne({ telegramId: 'demo_user_123' });
    
    if (!user) {
      console.log('🆕 Creating demo user');
      user = await User.create({
        telegramId: 'demo_user_123',
        username: 'demouser',
        firstName: 'Demo',
        lastName: 'User',
        photoUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=22c55e&color=fff',
        balance: 150,
        totalEarned: 450,
        lastLogin: new Date(),
      });
    }
    
    const token = generateToken({
      userId: user._id.toString(),
      telegramId: user.telegramId,
      username: user.username,
    });
    
    const response = NextResponse.redirect(new URL('/', request.url));
    
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    
    console.log('✅ Demo user logged in:', user._id);
    return response;
  } catch (error) {
    console.error('❌ Demo login error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}