import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    telegramId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    photoUrl: {
      type: String,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
    },
    referredBy: {
      type: String,
      sparse: true,
    },
    // Track referral earnings
    referralEarnings: {
      type: Number,
      default: 0,
    },
    // Track referrals who joined
    referralCount: {
      type: Number,
      default: 0,
    },
    // Add referral history (optional - for detailed tracking)
    referralHistory: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        reward: {
          type: Number,
          default: 0,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    languageCode: {
      type: String,
      default: 'en',
    },
    allowsWriteToPm: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate referral code before saving
UserSchema.pre('save', function(next) {
  if (!this.referralCode) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    this.referralCode = result;
  }
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);