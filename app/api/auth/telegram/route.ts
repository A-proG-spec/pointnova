import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { generateToken } from '@/lib/auth/jwt';
import { verifyTelegramWebAppData } from '@/lib/auth/telegram';

export const dynamic = 'force-dynamic';

// Helper function to generate a unique referral code
function generateReferralCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { initData, ref } = body;

    console.log('📥 Received login request');
    console.log('📝 InitData length:', initData?.length || 0);

    if (!initData) {
      console.log('❌ No initData provided');
      return NextResponse.json(
        { error: 'Missing initData' },
        { status: 400 }
      );
    }

    // Parse initData
    const params = new URLSearchParams(initData);
    const data: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      data[key] = value;
    }

    console.log('📊 Parsed data keys:', Object.keys(data));

    // Log the user data for debugging
    let userData = null;
    if (data.user) {
      try {
        userData = JSON.parse(data.user);
        console.log('👤 User data:', userData);
      } catch (e) {
        console.log('⚠️ Could not parse user data');
      }
    }

    // Determine if we're in development mode
    const isDev = process.env.NODE_ENV === 'development';
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    let telegramUser;

    // In development, bypass verification if no bot token
    if (isDev && (!botToken || botToken === 'your_telegram_bot_token')) {
      console.log('🔧 Development mode: Bypassing verification');
      
      const authDate = parseInt(data.auth_date) || Math.floor(Date.now() / 1000);
      
      telegramUser = {
        id: userData?.id || 123456789,
        first_name: userData?.first_name || 'Dev',
        last_name: userData?.last_name || 'User',
        username: userData?.username || 'devuser',
        photo_url: userData?.photo_url || 'https://ui-avatars.com/api/?name=Dev+User&background=22c55e&color=fff',
        auth_date: authDate,
        hash: data.hash || 'mock_hash'
      };
      
      console.log('✅ Using mock user (dev mode):', telegramUser.username);
    } else {
      // Production mode - verify with bot token
      if (!botToken) {
        console.log('❌ TELEGRAM_BOT_TOKEN not set');
        return NextResponse.json(
          { error: 'Bot token not configured' },
          { status: 500 }
        );
      }

      telegramUser = verifyTelegramWebAppData(
        data,
        botToken,
        userData,
        initData
      );
      
      if (!telegramUser) {
        console.log('❌ Invalid Telegram data - verification failed');
        return NextResponse.json(
          { error: 'Invalid Telegram data' },
          { status: 401 }
        );
      }
      
      console.log('✅ Telegram user verified:', telegramUser.id);
    }

    await dbConnect();

    // Find or create user
    let user = await User.findOne({ telegramId: telegramUser.id.toString() });

    let isNewUser = false;

    if (!user) {
      console.log('🆕 Creating new user');
      isNewUser = true;
      
      let referredBy = null;
      let referrerUser = null;
      let referralBonus = 0;

      // Handle referral
      if (ref && ref.startsWith('ref_')) {
        const referralCode = ref.replace('ref_', '');
        referrerUser = await User.findOne({ referralCode: referralCode });
        
        if (referrerUser) {
          referredBy = referralCode;
          referralBonus = 10; // Define bonus amount here
          
          console.log('📎 Referral code used:', referralCode, 'by user:', referrerUser.username);
          
          // Update referrer's referral count
          referrerUser.referralCount = (referrerUser.referralCount || 0) + 1;
          
          // Add referral to history
          if (!referrerUser.referralHistory) {
            referrerUser.referralHistory = [];
          }
          
          // Add bonus to referrer
          referrerUser.balance = (referrerUser.balance || 0) + referralBonus;
          referrerUser.referralEarnings = (referrerUser.referralEarnings || 0) + referralBonus;
          
          await referrerUser.save();
          console.log(`💰 Added ${referralBonus} points to referrer ${referrerUser.username}`);
        }
      }

      // Generate unique referral code
      let referralCode = "";
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!isUnique && attempts < maxAttempts) {
        referralCode = generateReferralCode();
        const existingUser = await User.findOne({ referralCode });
        if (!existingUser) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        // Fallback: use timestamp + random
        referralCode = `REF${Date.now().toString(36).toUpperCase()}`;
      }

      // Create new user with generated referral code
      user = await User.create({
        telegramId: telegramUser.id.toString(),
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name || '',
        photoUrl: telegramUser.photo_url,
        referralCode: referralCode,
        balance: 0,
        totalEarned: 0,
        referredBy: referredBy,
        referralCount: 0,
        referralEarnings: 0,
        referralHistory: [],
        lastLogin: new Date(),
      });

      // Add new user to referrer's referral history
      if (referrerUser) {
        referrerUser.referralHistory.push({
          userId: user._id,
          joinedAt: new Date(),
          reward: referralBonus || 0,
        });
        await referrerUser.save();
      }

      console.log('✅ New user created with referral code:', referralCode);

    } else {
      console.log('👤 Existing user found:', user._id);
      // Update user info
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

    console.log('✅ Login successful for user:', user._id);

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
        referralCount: user.referralCount || 0,
        referralEarnings: user.referralEarnings || 0,
        isNewUser: isNewUser,
      }
    });

    // Set cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('❌ Telegram auth error:', error);
    return NextResponse.json(
      { 
        error: 'Authentication failed', 
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: 500 }
    );
  }
}