import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 用户注册
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // 验证用户角色
    if (role !== 'customer') {
      return res.status(400).json({ 
        success: false,
        message: "Only customer registration is allowed" 
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

    // 创建新用户
    const newUser = new User({
      firstName,
      lastName,
      email,
      username: email.split('@')[0], // 使用邮箱前缀作为默认用户名
      password: hashedPassword,
      role: 'customer',
      profilePictureUrl: "https://avatar.iran.liara.run/public" // 默认头像
    });

    await newUser.save();

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