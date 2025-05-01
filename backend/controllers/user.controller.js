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

export const getProviders = async (req, res) => {
    try {
        const providers = await User.find({ role: "provider" });
        res.status(200).json({
            success: true,
            message: "Providers fetched successfully",
            providers
        });
    } catch (error) {
        console.error('Error fetching providers:', error);
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

