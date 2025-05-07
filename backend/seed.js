import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';

dotenv.config();

const updateProfilePictureUrl = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI not defined in .env');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected.');

    const users = await User.find({});
    let count = 0;

    for (let i = 0; i < users.length; i++) {
      const newUrl = `https://avatar.iran.liara.run/public/${i + 1}`;
      await User.updateOne(
        { _id: users[i]._id },
        { $set: { profilePictureUrl: newUrl } }
      );
      count++;
    }

    console.log(`Updated ${count} users' profilePictureUrl.`);
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

updateProfilePictureUrl();
