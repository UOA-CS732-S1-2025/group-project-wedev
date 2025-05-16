import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  emailVerified: { type: Boolean, default: false }, //Email authentication and token
  emailVerifyToken: { type: String },
  password: { type: String, required: true }, // Hashed password
  role: { type: String, enum: ['customer', 'provider', 'admin'], required: true },
  firstName: { type: String },
  lastName: { type: String },
  phoneNumber: { type: String },
  profilePictureUrl: { type: String },
  profilePicturePublicId: { type: String }, // Add new field to store Cloudinary public_id
  address: {
    street: { type: String },       // Street address, e.g., "10 Downing Street"
    suburb: { type: String },       // Newly added district/area, e.g., "New Lynn"
    city: { type: String },         // City, e.g., "Auckland"
    state: { type: String },        // State/Province/Region, e.g., "Auckland" (in New Zealand, city and state/region can sometimes be the same, or this could be an abbreviation like "AKL")
    postalCode: { type: String },   // Postal code, e.g., "0600"
    country: { type: String },      // Country, e.g., "New Zealand"
  },
  // Provider Specific
  serviceType: { type: String }, // or serviceTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceType' }
  bio: { type: String },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
    },
  },
  hourlyRate: { type: Number },
  // Enhanced availability structure
  availability: [{
    // Weekly recurring availability
    dayOfWeek: { type: Number, min: 0, max: 6 }, // 0=Sunday, 1=Monday, etc.
    startTime: { type: String }, // Format: "HH:MM" in 24h
    endTime: { type: String }, // Format: "HH:MM" in 24h
    isAvailable: { type: Boolean, default: true }
  }],
  // Special dates (overrides or one-time availability)
  specialDates: [{
    date: { type: Date, required: true },
    isAvailable: { type: Boolean, default: true },
    startTime: { type: String }, // Optional, if different from regular hours
    endTime: { type: String }    // Optional, if different from regular hours
  }],
  // Date ranges for longer periods (vacations, special availability periods)
  dateRanges: [{
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isAvailable: { type: Boolean, default: false }, // typically used for unavailability periods
    startTime: { type: String }, // Optional
    endTime: { type: String }    // Optional
  }],
  portfolioMedia: [{
    type: { type: String, enum: ['image', 'video'] },
    url: { type: String },
    caption: { type: String },
  }],
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true }); // Auto-manage createdAt and updatedAt

// Create a geospatial index for location-based queries
userSchema.index({ "location": "2dsphere" });

const User = mongoose.model("User", userSchema);

export default User;