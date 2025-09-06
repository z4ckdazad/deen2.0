import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['student', 'imaam', 'admin'],
    default: 'student',
    required: true
  },
  islamicProfile: {
    type: String,
    enum: [
      'student',
      'hafiz',
      'mufti',
      'islamic scholar',
      'qari',
      'imam',
      'islamic teacher',
      'religious counselor',
      'other'
    ],
    required: [true, 'Islamic profile is required']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  // For Imaam specific fields
  specializations: [{
    type: String,
    trim: true
  }],
  experience: {
    type: Number,
    min: 0,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  studentsCount: {
    type: Number,
    default: 0
  },
  // Social media links
  socialLinks: {
    website: String,
    facebook: String,
    twitter: String,
    instagram: String,
    youtube: String
  },
  // Location information
  location: {
    country: String,
    city: String,
    timezone: String
  },
  // Preferences
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ islamicProfile: 1 });
userSchema.index({ 'rating.average': -1 });
userSchema.index({ createdAt: -1 });

// Virtual for full profile URL
userSchema.virtual('profilePictureUrl').get(function() {
  if (this.profilePicture) {
    return this.profilePicture.startsWith('http') 
      ? this.profilePicture 
      : `${process.env.BACKEND_URL}/uploads/${this.profilePicture}`;
  }
  return null;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to find verified imaam
userSchema.statics.findVerifiedImaam = function() {
  return this.find({ 
    role: 'imaam', 
    isVerified: true, 
    isActive: true 
  }).sort({ 'rating.average': -1, studentsCount: -1 });
};

// Update rating when new rating is added
userSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;
