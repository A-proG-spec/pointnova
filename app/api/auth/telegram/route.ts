import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { generateToken } from '@/lib/auth/jwt';
import { verifyTelegramWebAppData } from '@/lib/auth/telegram';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 [TELEGRAM AUTH] Received POST request');

    const body = await request.json();
    const { initData, ref } = body;
    console.log("========== RAW INIT DATA ==========");
    console.log(initData);
    console.log("==================================");
    console.log('📝 InitData length:', initData?.length || 0);

    if (!initData) {
      console.log('❌ No initData provided');
      return NextResponse.json(
        { error: 'Missing initData' },
        { status: 400 }
      );
    }

    // Parse initData to extract fields
    const params = new URLSearchParams(initData);
    const data: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      data[key] = value;
    }

    console.log('📊 Parsed data keys:', Object.keys(data));

    // Parse user field from initData
    let userData;
    try {
      if (data.user) {
        userData = JSON.parse(data.user);
        console.log('👤 User data extracted:', {
          id: userData?.id,
          first_name: userData?.first_name,
          username: userData?.username,
        });
      }
    } catch (e) {
      console.log('⚠️ Could not parse user from initData');
    }

    const isDev = process.env.NODE_ENV === 'development';
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    let telegramUser;

    // Development fallback (no bot token)
    if (isDev && !botToken) {
      console.log('🔧 Development mode: Using mock user');

      telegramUser = {
        id: userData?.id || 123456789,
        first_name: userData?.first_name || 'Dev',
        last_name: userData?.last_name || 'User',
        username: userData?.username || 'devuser',
        photo_url: userData?.photo_url || 'https://ui-avatars.com/api/?name=Dev+User&background=22c55e&color=fff',
        auth_date: parseInt(data.auth_date) || Math.floor(Date.now() / 1000),
        hash: data.hash || 'mock_hash'
      };
    } else {
      // Production: Verify Telegram data
      if (!botToken) {
        console.log('❌ TELEGRAM_BOT_TOKEN not set in environment');
        return NextResponse.json(
          { error: 'Bot token not configured' },
          { status: 500 }
        );
      }

      console.log('🔐 Verifying Telegram data with bot token');

      console.log(
        "Bot token:",
        process.env.TELEGRAM_BOT_TOKEN?.slice(0, 15) + "..."
      );
      // Pass the ORIGINAL initData string for verification
      telegramUser = verifyTelegramWebAppData(data, botToken, userData, initData);

      if (!telegramUser) {
        console.log('❌ Invalid Telegram data - verification failed');
        return NextResponse.json(
          { error: 'Invalid Telegram data' },
          { status: 401 }
        );
      }
    }

    console.log('✅ Telegram user verified:', telegramUser.id);

    // Connect to database
    console.log('🗄️ Connecting to MongoDB');
    await dbConnect();
    console.log('✅ MongoDB connected');

    // Find or create user
    let user = await User.findOne({ telegramId: telegramUser.id.toString() });

    // Handle referral
    let referredBy = null;
    let referrer = null;

    if (ref && !user) {
      // Only process referral for new users
      referrer = await User.findOne({ referralCode: ref });
      if (referrer) {
        referredBy = ref;
        console.log('📎 Referral code used:', ref);
        console.log('👤 Referrer found:', referrer.telegramId);
      } else {
        console.log('⚠️ Invalid referral code:', ref);
      }
    }

    if (!user) {
      console.log('🆕 Creating new user');
      
      user = await User.create({
        telegramId: telegramUser.id.toString(),
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        photoUrl: telegramUser.photo_url,
        referralCode: `PN${telegramUser.id}${Date.now().toString().slice(-4)}`,
        balance: 0,
        totalEarned: 0,
        referredBy: referredBy,
        lastLogin: new Date(),
      });

      console.log('✅ New user created:', user._id);

      // Add referral reward and update referrer's referral list
      if (referrer) {
        // Add reward to referrer
        const REFERRAL_REWARD = 100; // 100 ETB per referral
        
        referrer.balance += REFERRAL_REWARD;
        referrer.totalEarned += REFERRAL_REWARD;
        
        // Add the new user to referrer's referrals list
        referrer.referrals.push({
          userId: user._id,
          username: user.username,
          firstName: user.firstName,
          joinedAt: new Date(),
        });
        
        await referrer.save();
        
        console.log(`✅ Referral reward: +${REFERRAL_REWARD} ETB to ${referrer.telegramId}`);
        console.log(`✅ Referral added to list: ${user.firstName}`);
      }
    } else {
      console.log('👤 Existing user found:', user._id);
      user.username = telegramUser.username || user.username;
      user.firstName = telegramUser.first_name;
      user.lastName = telegramUser.last_name || user.lastName;
      user.photoUrl = telegramUser.photo_url || user.photoUrl;
      user.lastLogin = new Date();
      await user.save();
    }

    // Create JWT token
    const token = generateToken({
      userId: user._id.toString(),
      telegramId: user.telegramId,
      username: user.username,
    });

    console.log('🎫 Token generated for user:', user._id);

    const response = NextResponse.json({
      success: true,
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
        referrals: user.referrals || [],
      }
    });

    // Set auth token cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    console.log('✅ [TELEGRAM AUTH] Login successful');
    return response;
  } catch (error) {
    console.error('❌ [TELEGRAM AUTH] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Authentication failed',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}