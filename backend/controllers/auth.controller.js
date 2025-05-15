import User from "../models/user.model.js";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/sendEmail.js";


// 用户注册
export const registerUser = async (req, res) => {
  try {

    const { firstName, lastName, email, password, role, location, address = {}  } = req.body;


    // 验证用户角色
    if (role !== 'customer') {
      return res.status(400).json({ 
        success: false,
        message: "Only customer registration is allowed" 
      });
    }

    if (!email){
      return res.status(400).json({ 
        success: false,
        message: "Email is null" 
      });
    }

    if (!password){
      return res.status(400).json({ 
        success: false,
        message: "Password is null" 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email format" 
      });
    }

    if (password.length <= 8) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be longer than 8 characters" 
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ 
        success: false,
        message: "Password must include at least one uppercase letter" 
      });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ 
        success: false,
        message: "Password must include at least one lowercase letter" 
      });
    }

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ 
        success: false,
        message: "Password must include at least one number" 
      });
    }
    

    // 检查邮箱是否已经存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "Email already in use" 
      });
    }

    // 对密码进行加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    // 生成邮箱验证 token
    const emailVerifyToken = crypto.randomBytes(32).toString("hex");


    // 创建新用户
    const newUser = new User({
      firstName,
      lastName,
      email,
      username: email.split('@')[0], // 使用邮箱前缀作为默认用户名
      password: hashedPassword,
      role: 'customer',
      profilePictureUrl: "https://avatar.iran.liara.run/public", // 默认头像
      emailVerified: false,
      emailVerifyToken,
      location: location?.coordinates?.length === 2
        ? location
        : { type: "Point", coordinates: [174.7682, -36.8523] },
        address: {
            street: address?.street || "",
            suburb: address?.suburb || "",
            city: address?.city || "",
            state: address?.state || "",
            postalCode: address?.postalCode || "",  
            country: address?.country || ""
          }
    });

    await newUser.save();


    // 构造验证链接
    const verifyUrl = `${process.env.VITE_FRONTEND_URL}/verify-email?token=${emailVerifyToken}`;


    // 模拟发送验证邮件（建议改用 nodemailer）
    await sendVerificationEmail(email, verifyUrl);


    // 生成JWT令牌
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 不返回密码
    const userToReturn = { ...newUser._doc };
    delete userToReturn.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userToReturn,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error during registration", 
      error: error.message 
    });
  }
};

// 用户登录
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证用户是否存在
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ success: false, message: "User not found" });
      }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ success: false, message: "Wrong password" });
      }

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 不返回密码
    const userToReturn = { ...user._doc };
    delete userToReturn.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userToReturn,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error during login", 
      error: error.message 
    });
  }
};

// 获取当前用户信息
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: "Missing verification token" });
    }

    const user = await User.findOne({ emailVerifyToken: token });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    if (user.emailVerified) {
      return res.status(200).json({ success: true, message: "Email already verified" });
    }

    user.emailVerified = true;
    //user.emailVerifyToken = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Update current user profile
export const updateCurrentUser = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("User ID from token:", req.userId);
    
    const allowed = [
      "firstName", "lastName", "phoneNumber", "profilePictureUrl", "bio", "address",
      "serviceType", "hourlyRate", "role", "location"
    ];
    
    const updateFields = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updateFields[key] = req.body[key];
    });
    
    // Check if we're trying to change to provider role
    const isBecomingProvider = req.body.role === 'provider';
    
    // If user is becoming a provider, ensure required fields are set
    if (isBecomingProvider) {
      // Fetch current user to check current role
      const currentUser = await User.findById(req.userId);
      if (!currentUser) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }
      
      // Only allow customer->provider transition
      if (currentUser.role !== 'customer') {
        return res.status(400).json({
          success: false,
          message: "Only customers can become providers"
        });
      }
      
      // Ensure serviceType is a string
      if (req.body.serviceType) {
        if (Array.isArray(req.body.serviceType)) {
          updateFields.serviceType = req.body.serviceType[0];
          console.log("Converted serviceType from array to string:", updateFields.serviceType);
        } else if (typeof req.body.serviceType !== 'string') {
          updateFields.serviceType = String(req.body.serviceType);
          console.log("Converted serviceType to string:", updateFields.serviceType);
        }
      }
      
      // Validate required provider fields
      if (!updateFields.serviceType) {
        return res.status(400).json({
          success: false, 
          message: "Service type is required to become a provider"
        });
      }
      
      // Set default values for provider fields if not provided
      if (!updateFields.hourlyRate) {
        updateFields.hourlyRate = 0; // Default hourly rate
      }
      
      console.log("User is becoming a provider with fields:", updateFields);
    }
    
    console.log("Final update fields:", updateFields);
    
    // Merge address if present
    if (req.body.address) {
      const user = await User.findById(req.userId);
      updateFields.address = {
        ...(user?.address?.toObject ? user.address.toObject() : user?.address || {}),
        ...req.body.address,
      };
    }
    
    try {
      const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select("-password");
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }
      
      res.status(200).json({
        success: true,
        user,
        message: isBecomingProvider ? "Successfully became a provider" : "Profile updated"
      });
    } catch (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;  // Rethrow to be caught by outer catch
    }
  } catch (err) {
    console.error("Full error details:", err);
    res.status(500).json({ 
      success: false,
      message: "Update failed", 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};