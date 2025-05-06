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

export const searchProviders = async (req, res) => {
    try {
        const { serviceType, location, date, maxHourlyRate } = req.body;
        
        // Build the query - always search for providers
        const query = { role: "provider" };
        
        // Filter by service type if provided
        if (serviceType) {
            query.serviceType = serviceType;
        }
        
        // Filter by location if provided
        if (location && location.city) {
            query["address.city"] = location.city;
        }
        
        // Filter by hourly rate if provided
        if (maxHourlyRate) {
            // Add hourlyRate filter - include providers with hourlyRate less than or equal to maxHourlyRate
            // or providers that don't have hourlyRate specified
            query.$or = query.$or || [];
            query.$or.push(
                { hourlyRate: { $lte: maxHourlyRate } },
                { hourlyRate: { $exists: false } } // Include providers without hourlyRate set
            );
        }
        
        // Filter by date availability if provided
        if (date) {
            const searchDate = new Date(date);
            const dayOfWeek = searchDate.getDay(); // 0-6 (Sunday to Saturday)
            
            // Create or extend the $or query
            const dateQuery = [
                // Check if provider has weekly availability for this day of week
                {
                    availability: {
                        $elemMatch: {
                            dayOfWeek: dayOfWeek,
                            isAvailable: true
                        }
                    },
                    // And doesn't have a special unavailable day for this date
                    "specialDates": {
                        $not: {
                            $elemMatch: {
                                date: {
                                    $gte: new Date(searchDate.setHours(0,0,0,0)),
                                    $lt: new Date(searchDate.setHours(23,59,59,999))
                                },
                                isAvailable: false
                            }
                        }
                    }
                },
                // OR has this date specifically marked as available
                {
                    "specialDates": {
                        $elemMatch: {
                            date: {
                                $gte: new Date(searchDate.setHours(0,0,0,0)),
                                $lt: new Date(searchDate.setHours(23,59,59,999))
                            },
                            isAvailable: true
                        }
                    }
                }
            ];
            
            // If we already have an $or query (from hourlyRate), we need to use $and to combine them
            if (query.$or) {
                const hourlyRateQuery = query.$or;
                delete query.$or;
                query.$and = [
                    { $or: hourlyRateQuery },
                    { $or: dateQuery }
                ];
            } else {
                query.$or = dateQuery;
            }
            
            // Exclude providers who have this date in an unavailable date range
            query["dateRanges"] = {
                $not: {
                    $elemMatch: {
                        startDate: { $lte: searchDate },
                        endDate: { $gte: searchDate },
                        isAvailable: false
                    }
                }
            };
        }

        const providers = await User.find(query);
        
        res.status(200).json({ providers });
    } catch (error) {
        res.status(500).json({ message: "Error searching providers", error: error.message });
    }
};

