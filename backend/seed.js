import mongoose from "mongoose";
import User from "./models/user.model.js";

async function seedUsers() {
  try {
    await mongoose.connect("mongodb+srv://wedev:d4bw4kWtwckH4Ck2@wedev732.9ja99.mongodb.net/sample_mflix?retryWrites=true&w=majority&appName=wedev732");

    console.log("MongoDB connected");

    // Clear existing users
    await User.deleteMany({});
    console.log("Existing users cleared");

    const profileBase = "https://avatar.iran.liara.run/public";

    const customers = Array.from({ length: 5 }, (_, i) => ({
      username: `customer${i + 1}`,
      email: `customer${i + 1}@example.com`,
      password: `hashed_customer_pass${i + 1}`,
      role: "customer",
      firstName: `CustomerFirst${i + 1}`,
      lastName: `CustomerLast${i + 1}`,
      phoneNumber: `12345678${i + 10}`,
      profilePictureUrl: profileBase,
      address: {
        street: `${100 + i} Customer St`,
        city: "Beijing",
        state: "Beijing",
        postalCode: `1000${i}`,
        country: "China",
      },
    }));

    const providers = Array.from({ length: 5 }, (_, i) => ({
      username: `provider${i + 1}`,
      email: `provider${i + 1}@example.com`,
      password: `hashed_provider_pass${i + 1}`,
      role: "provider",
      firstName: `ProviderFirst${i + 1}`,
      lastName: `ProviderLast${i + 1}`,
      phoneNumber: `22345678${i + 10}`,
      profilePictureUrl: profileBase,
      address: {
        street: `${200 + i} Provider St`,
        city: "Shanghai",
        state: "Shanghai",
        postalCode: `2000${i}`,
        country: "China",
      },
      serviceType: ["Plumbing", "Cleaning", "Babysitting", "Tutoring", "Moving"][i],
      bio: `Experienced ${["plumber", "cleaner", "babysitter", "tutor", "mover"][i]} with great reputation.`,
      location: {
        type: "Point",
        coordinates: [121.47 + i * 0.01, 31.23 + i * 0.01],
      },
      hourlyRate: 30 + i * 5,
      availability: [
        {
          startTime: new Date(),
          endTime: new Date(Date.now() + 3600000 * (i + 1)),
        },
      ],
      portfolioMedia: [
        {
          type: "image",
          url: profileBase,
          caption: `Sample work ${i + 1}`,
        },
      ],
      averageRating: (3 + i % 2),
      reviewCount: i + 1,
    }));

    await User.insertMany([...customers, ...providers]);

    console.log("Users inserted successfully!");
    process.exit();
  } catch (err) {
    console.error("Error inserting users:", err);
    process.exit(1);
  }
}

seedUsers();