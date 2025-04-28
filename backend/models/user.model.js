import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true }, // Hashed password
  role: { type: String, enum: ['customer', 'provider', 'admin'], required: true },
  firstName: { type: String },
  lastName: { type: String },
  phoneNumber: { type: String },
  profilePictureUrl: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
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
  availability: [{
    startTime: { type: Date },
    endTime: { type: Date },
  }],
  portfolioMedia: [{
    type: { type: String, enum: ['image', 'video'] },
    url: { type: String },
    caption: { type: String },
  }],
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true }); // Auto-manage createdAt and updatedAt

const User = mongoose.model("User", userSchema);

export default User;