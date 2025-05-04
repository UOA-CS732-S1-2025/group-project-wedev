
import mongoose from 'mongoose';
import Conversation from './models/conversation.model.js';
import Message from './models/message.model.js';
import User from './models/user.model.js'; // 按你实际路径调整


async function seedUsers() {
  try {
    await mongoose.connect("mongodb+srv://wedev:d4bw4kWtwckH4Ck2@wedev732.9ja99.mongodb.net/sample_mflix?retryWrites=true&w=majority&appName=wedev732");

    console.log("MongoDB connected");

    // 注意：不再删除现有用户
    console.log("Adding new test users while preserving existing ones");

    const profileBase = "https://avatar.iran.liara.run/public";

    // 服务类型列表，用于创建多样化的服务提供者
    const serviceTypes = [
      "Plumbing", 
      "Garden & Lawn Care", 
      "Home Repairs", 
      "Painting", 
      "House Cleaning", 
      "Appliance Repair"
    ];

    // 生成随机的周可用时间
    const generateWeeklyAvailability = () => {
      const availability = [];
      // 随机选择3-6天可用
      const availableDays = [...Array(7).keys()].sort(() => 0.5 - Math.random()).slice(0, 3 + Math.floor(Math.random() * 4));
      
      for (const day of availableDays) {
        // 不同的开始和结束时间
        const startHour = 8 + Math.floor(Math.random() * 4); // 8am to 11am
        const endHour = 16 + Math.floor(Math.random() * 6); // 4pm to 9pm
        
        availability.push({
          dayOfWeek: day,
          startTime: `${startHour.toString().padStart(2, '0')}:00`,
          endTime: `${endHour.toString().padStart(2, '0')}:00`,
          isAvailable: true
        });
      }
      
      return availability;
    };

    // 生成特殊日期
    const generateSpecialDates = () => {
      const specialDates = [];
      const today = new Date();
      
      // 添加1-3个特殊日期
      for (let i = 0; i < 1 + Math.floor(Math.random() * 3); i++) {
        // 在未来30天内的随机日期
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + Math.floor(Math.random() * 30));
        
        specialDates.push({
          date: futureDate,
          isAvailable: Math.random() > 0.3, // 70% 概率可用
          startTime: "09:00",
          endTime: "18:00"
        });
      }
      
      return specialDates;
    };

    // 生成日期范围（通常用于不可用期间，如假期）
    const generateDateRanges = () => {
      const dateRanges = [];
      const today = new Date();
      
      // 50%的几率有不可用日期范围
      if (Math.random() > 0.5) {
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + 40 + Math.floor(Math.random() * 20)); // 40-60天后开始
        
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 3 + Math.floor(Math.random() * 11)); // 3-14天假期
        
        dateRanges.push({
          startDate: startDate,
          endDate: endDate,
          isAvailable: false // 假期不可用
        });
      }
      
      return dateRanges;
    };

    // 创建20个Auckland的provider用户
    const aucklandProviders = Array.from({ length: 20 }, (_, i) => {
      const serviceTypeIndex = i % serviceTypes.length;
      return {
        username: `akl_provider${i + 1}`,
        email: `akl_provider${i + 1}@example.com`,
        password: `hashed_akl_provider_pass${i + 1}`, // 实际应用中应该使用bcrypt加密
        role: "provider",
        firstName: `Provider${i + 1}`,
        lastName: `Auckland${i + 1}`,
        phoneNumber: `64210${100000 + i}`,
        profilePictureUrl: `${profileBase}`,
        address: {
          street: `${100 + i} Queen Street`,
          city: "Auckland", // 所有用户都在Auckland
          state: "Auckland",
          postalCode: `10${i.toString().padStart(2, '0')}`,
          country: "New Zealand",
        },
        serviceType: serviceTypes[serviceTypeIndex],
        bio: `Professional ${serviceTypes[serviceTypeIndex].toLowerCase()} service provider with ${2 + i % 10} years of experience in Auckland.`,
        location: {
          type: "Point",
          // Auckland大致坐标 (174.7633, -36.8485) 周围随机分布
          coordinates: [174.7633 + (Math.random() * 0.1 - 0.05), -36.8485 + (Math.random() * 0.1 - 0.05)],
        },
        hourlyRate: 25 + (i % 10) * 5, // $25-$70/hr
        availability: generateWeeklyAvailability(),
        specialDates: generateSpecialDates(),
        dateRanges: generateDateRanges(),
        portfolioMedia: [
          {
            type: "image",
            url: `${profileBase}`,
            caption: `${serviceTypes[serviceTypeIndex]} work sample`,
          },
        ],
        averageRating: 3 + (Math.random() * 2).toFixed(1), // 3.0-5.0 rating
        reviewCount: 5 + Math.floor(Math.random() * 50), // 5-55 reviews
      };
    });

    // 插入新用户，不删除旧用户
    await User.insertMany(aucklandProviders);

    console.log("Added 20 new Auckland service providers successfully!");
    process.exit();
  } catch (err) {
    console.error("Error inserting users:", err);
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