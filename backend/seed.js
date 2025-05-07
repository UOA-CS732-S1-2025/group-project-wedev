// seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// 假设你的 User 模型在项目根目录下的 models 文件夹中
import User from './models/user.model.js'; // 如果 seed.js 在 scripts 文件夹，models 在根目录，则使用 '../models/user.model.js'

dotenv.config(); // 从 .env 文件加载环境变量

const aucklandLocations = [
  {
    address: { street: "17 Swanson Street", city: "Auckland", state: "Auckland", postalCode: "1010", country: "New Zealand" },
    coordinates: [174.7650, -36.8450] // CBD
  },
  {
    address: { street: "25 St Stephens Avenue", city: "Auckland", state: "Auckland", postalCode: "1052", country: "New Zealand" },
    coordinates: [174.7820, -36.8560] // Parnell
  },
  {
    address: { street: "150 Ponsonby Road", city: "Auckland", state: "Auckland", postalCode: "1011", country: "New Zealand" },
    coordinates: [174.7455, -36.8520] // Ponsonby
  },
  {
    address: { street: "457 Mount Eden Road", city: "Auckland", state: "Auckland", postalCode: "1024", country: "New Zealand" },
    coordinates: [174.7625, -36.8810] // Mount Eden
  },
  {
    address: { street: "123 Broadway", city: "Auckland", state: "Auckland", postalCode: "1023", country: "New Zealand" },
    coordinates: [174.7770, -36.8680] // Newmarket
  },
  {
    address: { street: "50 Hurstmere Road", city: "Takapuna", state: "Auckland", postalCode: "0622", country: "New Zealand" },
    coordinates: [174.7710, -36.7865] // Takapuna
  },
  {
    address: { street: "85 Picton Street", city: "Howick", state: "Auckland", postalCode: "2014", country: "New Zealand" },
    coordinates: [174.9270, -36.8920] // Howick
  },
  {
    address: { street: "5 Vitasovich Avenue", city: "Henderson", state: "Auckland", postalCode: "0612", country: "New Zealand" },
    coordinates: [174.6340, -36.8790] // Henderson
  },
  {
    address: { street: "652 Great South Road", city: "Manukau", state: "Auckland", postalCode: "2104", country: "New Zealand" },
    coordinates: [174.8810, -36.9920] // Manukau
  },
  {
    address: { street: "311 Remuera Road", city: "Remuera", state: "Auckland", postalCode: "1050", country: "New Zealand" },
    coordinates: [174.7950, -36.8700] // Remuera
  }
];

const seedProviders = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI 未在您的 .env 文件中定义");
    }
    await mongoose.connect(mongoUri);
    console.log('MongoDB 已连接，准备填充数据...');

    // 可选: 清除已有的 provider 用户
    // await User.deleteMany({ role: 'provider' });
    // console.log('已清除现有的 provider 用户。');

    const providers = [];
    const plainPassword = '12345678'; // 所有种子用户的通用明文密码

    for (let i = 0; i < 10; i++) {
      const locationData = aucklandLocations[i % aucklandLocations.length]; // 如果需要超过10个用户，则循环使用地址数据

      providers.push({
        username: `akl_lawn_provider${i + 1}`,
        email: `akl_lawn_provider${i + 1}@example.com`,
        password: plainPassword, // 直接使用明文密码
        role: 'provider',
        firstName: `园艺服务商${i + 1}`, // ProviderFirstName
        lastName: `奥克兰${i + 1}`,    // ProviderLastName
        phoneNumber: `642102000${i.toString().padStart(2, '0')}`, // 示例电话号码
        profilePictureUrl: `https://avatar.iran.liara.run/public/${i + 1}`,
        address: locationData.address,
        serviceType: 'Garden & Lawn', // 服务类型：园艺和草坪
        bio: `位于 ${locationData.address.city} 的专业园艺和草坪服务。经验丰富，值得信赖。`,
        location: {
          type: 'Point',
          coordinates: locationData.coordinates,
        },
        hourlyRate: Math.floor(Math.random() * (70 - 40 + 1)) + 40, // 40到70之间的随机时薪
        availability: [ // 示例可用时间 - 如果需要可以使其多样化
          { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isAvailable: true }, // 周一
          { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isAvailable: true }, // 周二
          { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isAvailable: true }, // 周三
          { dayOfWeek: 4, startTime: "10:00", endTime: "16:00", isAvailable: true }, // 周四
          { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isAvailable: true }, // 周五
        ],
        specialDates: [ // 特殊日期安排
          { date: new Date(new Date().setDate(new Date().getDate() + 30)), isAvailable: false, startTime: "09:00", endTime: "17:00" } // 30天后不可用
        ],
        dateRanges: [], // 如果需要，可以添加日期范围示例
        portfolioMedia: [{ // 作品集媒体文件
          type: 'image',
          url: 'https://via.placeholder.com/300x200.png?text=Lawn+Before', // 占位图片
          caption: '草坪修整前示例',
        },
        {
            type: 'image',
            url: 'https://via.placeholder.com/300x200.png?text=Lawn+After', // 占位图片
            caption: '草坪修整后示例',
          }],
        averageRating: Math.round((Math.random() * (5 - 3.5) + 3.5) * 10) / 10, // 3.5 到 5 之间的随机评分
        reviewCount: Math.floor(Math.random() * 50) + 5, // 5 到 54 之间的随机评论数
      });
    }

    await User.insertMany(providers);
    console.log(`${providers.length} 个 provider 用户已成功添加。`);

  } catch (error) {
    console.error('填充数据库时出错:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 连接已断开。');
  }
};

seedProviders();