import mongoose from 'mongoose';
import Conversation from './models/conversation.model.js';
import Message from './models/message.model.js';
import User from './models/user.model.js'; // 按你实际路径调整

async function seedUsers() {
  try {
    // 连接你的 MongoDB（替换成自己的连接字符串）
    await mongoose.connect('mongodb+srv://wedev:d4bw4kWtwckH4Ck2@wedev732.9ja99.mongodb.net/sample_mflix?retryWrites=true&w=majority&appName=wedev732');

    console.log('MongoDB connected');

    const users = [
        { username: 'alice2024', email: 'alice2024@example.com', password: 'hashed_password1', role: 'customer', firstName: 'Alice', lastName: 'Wang', phoneNumber: '1234567890', address: { street: '123 Main St', city: 'Beijing', state: '', postalCode: '100000', country: 'China' } },
        { username: 'bob2024', email: 'bob2024@example.com', password: 'hashed_password2', role: 'provider', firstName: 'Bob', lastName: 'Chen', phoneNumber: '2345678901', address: { street: '456 Elm St', city: 'Shanghai', state: '', postalCode: '200000', country: 'China' }, serviceType: 'Plumbing', bio: 'Experienced plumber offering affordable services.', location: { coordinates: [121.4737, 31.2304] }, hourlyRate: 50, availability: [{ startTime: new Date(), endTime: new Date(Date.now() + 3600000) }] },
        { username: 'charlie2024', email: 'charlie2024@example.com', password: 'hashed_password3', role: 'admin', firstName: 'Charlie', lastName: 'Li', phoneNumber: '3456789012', address: { street: '789 Oak St', city: 'Guangzhou', state: '', postalCode: '510000', country: 'China' } },
        { username: 'diana2024', email: 'diana2024@example.com', password: 'hashed_password4', role: 'customer', firstName: 'Diana', lastName: 'Zhao', phoneNumber: '4567890123', address: { street: '321 Pine St', city: 'Shenzhen', state: '', postalCode: '518000', country: 'China' } },
        { username: 'ethan2024', email: 'ethan2024@example.com', password: 'hashed_password5', role: 'provider', firstName: 'Ethan', lastName: 'Liu', phoneNumber: '5678901234', serviceType: 'House Cleaning', bio: 'Professional cleaner, 5 years of experience.', location: { coordinates: [114.0579, 22.5431] }, hourlyRate: 30, availability: [{ startTime: new Date(), endTime: new Date(Date.now() + 7200000) }], address: { street: '654 Maple St', city: 'Chengdu', state: '', postalCode: '610000', country: 'China' } },
        { username: 'fiona2024', email: 'fiona2024@example.com', password: 'hashed_password6', role: 'admin', firstName: 'Fiona', lastName: 'Sun', phoneNumber: '6789012345', address: { street: '987 Cedar St', city: 'Hangzhou', state: '', postalCode: '310000', country: 'China' } },
        { username: 'george2024', email: 'george2024@example.com', password: 'hashed_password7', role: 'customer', firstName: 'George', lastName: 'Zheng', phoneNumber: '7890123456', address: { street: '852 Birch St', city: 'Xi\'an', state: '', postalCode: '710000', country: 'China' } },
        { username: 'hannah2024', email: 'hannah2024@example.com', password: 'hashed_password8', role: 'provider', firstName: 'Hannah', lastName: 'Yu', phoneNumber: '8901234567', serviceType: 'Babysitting', bio: 'Reliable babysitter, CPR certified.', location: { coordinates: [108.9398, 34.3416] }, hourlyRate: 40, availability: [{ startTime: new Date(), endTime: new Date(Date.now() + 5400000) }], address: { street: '963 Willow St', city: 'Nanjing', state: '', postalCode: '210000', country: 'China' } },
        { username: 'ian2024', email: 'ian2024@example.com', password: 'hashed_password9', role: 'admin', firstName: 'Ian', lastName: 'Zhou', phoneNumber: '9012345678', address: { street: '159 Spruce St', city: 'Wuhan', state: '', postalCode: '430000', country: 'China' } },
        { username: 'julia2024', email: 'julia2024@example.com', password: 'hashed_password10', role: 'customer', firstName: 'Julia', lastName: 'Huang', phoneNumber: '0123456789', address: { street: '753 Chestnut St', city: 'Tianjin', state: '', postalCode: '300000', country: 'China' } },
      ];

    await User.insertMany(users);

    console.log('Users inserted successfully!');
    process.exit(); // 插入完退出脚本
  } catch (err) {
    console.error('Error inserting users:', err);
    process.exit(1);
  }
}


async function seedMessages() {
  try{
    await mongoose.connect('mongodb+srv://wedev:d4bw4kWtwckH4Ck2@wedev732.9ja99.mongodb.net/sample_mflix?retryWrites=true&w=majority&appName=wedev732');

    console.log('MongoDB connected');
    // data clear
    // await User.deleteMany({});
    // await Conversation.deleteMany({});
    // await Message.deleteMany({});

    const userA = await User.create({
      username: 'usera',
      email: 'usera@example.com',
      password: 'hashedpassword1', 
      role: 'customer',
      firstName: 'user',
      lastName: 'a',
    });

    const userB = await User.create({
      username: 'userb',
      email: 'userb@example.com',
      password: 'hashedpassword2',
      role: 'provider',
      firstName: 'user',
      lastName: 'b',
    });

    //  create conversation
    const conversation = await Conversation.create({
      participants: [userA._id, userB._id],
      lastMessageTimestamp: new Date(),
    });

    //  create message
    const messages = await Message.insertMany([
      {
        conversation: conversation._id,
        sender: userA._id,
        content: 'Hi Bob, I’m interested in your service.',
        isRead: false,
      },
      {
        conversation: conversation._id,
        sender: userB._id,
        content: 'Hi Alice, thanks for reaching out! Let’s discuss further.',
        isRead: false,
      },
    ]);

    //  upload Conversation last time
    conversation.lastMessageTimestamp = messages[messages.length - 1].createdAt;
    await conversation.save();


    process.exit();
  }catch (err) {
    console.error('Error inserting users:', err);
    process.exit(1);
  }

}

//seedUsers();
seedMessages();