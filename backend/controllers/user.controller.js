import User from "../models/user.model.js";
import mongoose from "mongoose";




//This controller needs to be refactored. 
//user is used for operations that do not require an authenticated administrator identity, 
//and user.admin is used for operations that require an authenticated administrator identity

//Andy's Advice
//GET  users/me  =>  Get the currently logged in user through token
//POST  users/me  =>  Modify your own information (such as contact information, profile picture)

// export const createUser = async (req, res) => {
//     const user = req.body;
//     const newUser = new User(user);
//     console.log(newUser);
//     try {
//         await newUser.save();
//         res.status(201).json({
//             success: true,
//             message: "User created successfully",
//             user: newUser
//         });
//     } catch (error) {
//         console.error('Error saving user:', error);
//         res.status(500).json({ 
//             message: "Internal server error", 
//             error: error.message 
//         });
//     }
// };

// export const getUsers = async (req, res) => {
//     try {
//         const users = await User.find();
//         res.status(200).json({
//             success: true,
//             message: "Users fetched successfully",
//             users
//         });
//     } catch (error) {
//         console.error('Error fetching users:', error);
//         res.status(500).json({ 
//             message: "Internal server error", 
//             error: error.message 
//         });
//     }
// };

// export const deleteUser = async (req, res) => {
//     const { id } = req.params;
//     try {
//         await User.findByIdAndDelete(id);
//         res.status(200).json({
//             success: true, 
//             message: "User deleted successfully"
//         });
//     } catch (error) {
//         console.error('Error deleting user:', error);
//         res.status(500).json({ 
//             message: "Internal server error", 
//             error: error.message 
//         });
//     }
// };





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
        //用前端传来的 city 作为 state 去和后端数据库的 state 做对比，state 比如 Auckland 作为奥克兰大区，address.city为更低一级地点
        if (location && location.city) {
            query["address.state"] = location.city;
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


export const getProviderById = async (req, res) => {
    try {
       
        const provider = await User.findById(req.params.id);
        if (!provider) return res.status(404).json({ message: "provider not found" });
        res.status(200).json(provider);
       
    } catch (error) {
        console.error('Error fetching provider detail :', error);
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
};

// 添加新方法，用于更新提供商的可用性设置
export const updateProviderAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { availability, specialDates, dateRanges } = req.body;

    // 验证用户身份（确保用户只能更新自己的可用性）
    // 这里使用中间件设置的已认证用户ID
    if (req.userId !== id) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only update your own availability" 
      });
    }

    // 要更新的数据对象
    const updateData = {};

    // 只更新提供的字段
    if (availability !== undefined) {
      updateData.availability = availability;
    }
    
    if (specialDates !== undefined) {
      updateData.specialDates = specialDates;
    }
    
    if (dateRanges !== undefined) {
      updateData.dateRanges = dateRanges;
    }

    // 如果没有任何要更新的内容，返回错误
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No valid update data provided" 
      });
    }

    // 更新用户文档
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: "Provider not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data: {
        availability: updatedUser.availability,
        specialDates: updatedUser.specialDates,
        dateRanges: updatedUser.dateRanges
      }
    });
  } catch (error) {
    console.error("Error updating provider availability:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error updating availability",
      error: error.message
    });
  }
};

// 添加新方法，用于获取提供商的可用性设置
export const getProviderAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await User.findById(id);
    
    if (!provider) {
      return res.status(404).json({ 
        success: false, 
        message: "Provider not found" 
      });
    }

    res.status(200).json({
      success: true,
      availability: provider.availability || [],
      specialDates: provider.specialDates || [],
      dateRanges: provider.dateRanges || []
    });
  } catch (error) {
    console.error("Error fetching provider availability:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching availability",
      error: error.message
    });
  }
};
