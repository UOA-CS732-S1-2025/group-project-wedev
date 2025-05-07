import User from "../models/user.model.js";
import mongoose from "mongoose";

export const createUser = async (req, res) => {
    const user = req.body;
    const newUser = new User(user);
    console.log(newUser);
    try {
        await newUser.save();
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: newUser
        });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await User.findByIdAndDelete(id);
        res.status(200).json({
            success: true, 
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
};

export const getUserById = async (req, res) => {
    try {
      const userId = req.params.id;
  
      // 查询用户信息
      const user = await User.findById(userId).select('-password'); // 不返回密码字段
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json(user);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  export const updateUserById = async (req, res) => {
    try {
      const userId = req.params.id;
      const updateData = req.body;
  
      // 确保不更新密码字段
      if (updateData.password) {
        return res.status(400).json({ error: 'Password update is not allowed here' });
      }
  
      // 更新用户资料
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
  
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json(updatedUser);
    } catch (err) {
      console.error('Error updating user profile:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };