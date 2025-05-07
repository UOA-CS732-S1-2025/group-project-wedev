import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';

dotenv.config();

const updateAverageRating = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI not defined in .env');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected.');

    const users = await User.find({});
    let count = 0;

    for (let i = 0; i < users.length; i++) {
      // 生成 2~5 之间带一位小数的随机数
      const newRating = Math.round((Math.random() * 3 + 2) * 10) / 10;
      await User.updateOne(
        { _id: users[i]._id },
        { $set: { averageRating: newRating } }
      );
      count++;
    }

    console.log(`Updated ${count} users' averageRating.`);
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

updateAverageRating();
