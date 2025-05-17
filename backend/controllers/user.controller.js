import User from "../models/user.model.js";
import mongoose from "mongoose";
import cloudinary from '../config/cloudinaryConfig.js';
import streamifier from 'streamifier';




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
        //Use the city from the frontend as the state to compare with the backend database’s state (e.g., Auckland as the Auckland region), where address.city represents a more specific, lower-level location
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

// Added: New function to upload/update user's profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.userId; // Assumes authMiddleware sets req.userId

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // If user already has a profile picture, delete the old one from Cloudinary
    if (user.profilePicturePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePicturePublicId);
      } catch (deleteError) {
        console.warn(
          `Failed to delete old profile picture ${user.profilePicturePublicId} from Cloudinary: ${deleteError.message}`
        );
        // Non-fatal, continue with uploading the new one
      }
    }

    // Upload new image to Cloudinary using a stream from the buffer
    const uploadPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "profile_pictures", // Optional: organize uploads in a specific folder
          // transformation: [{ width: 250, height: 250, crop: "limit" }] // Optional: example transformation
        },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error || new Error("Cloudinary upload stream failed"));
          }
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const cloudinaryResult = await uploadPromise;

    // Update user document with new picture URL and public ID
    user.profilePictureUrl = cloudinaryResult.secure_url;
    user.profilePicturePublicId = cloudinaryResult.public_id;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully.",
      data: {
        profilePictureUrl: user.profilePictureUrl,
        profilePicturePublicId: user.profilePicturePublicId,
      },
    });

  } catch (error) {
    console.error("Error uploading profile picture:", error);
    let statusCode = 500;
    let message = "Server error uploading profile picture.";

    // Check for Cloudinary specific error details
    if (error && error.message && error.message.toLowerCase().includes("cloudinary")) {
        message = `Cloudinary upload error: ${error.message}`;
    } else if (error && error.http_code) { // Cloudinary SDK often uses http_code
        statusCode = error.http_code;
        message = error.message || "Cloudinary error occurred.";
    }
    
    res.status(statusCode).json({ 
        success: false, 
        message: message, 
        error: error.message // Provide original error message for debugging
    });
  }
};

// Add new method to update provider's availability settings
export const updateProviderAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { availability, specialDates, dateRanges } = req.body;

    // Verify user identity (ensure users can only update their own availability)
    // Use the authenticated user ID set by middleware here
    if (req.userId !== id) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only update your own availability" 
      });
    }

    // Data object to update
    const updateData = {};

    // Only update the provided fields
    if (availability !== undefined) {
      updateData.availability = availability;
    }
    
    if (specialDates !== undefined) {
      updateData.specialDates = specialDates;
    }
    
    if (dateRanges !== undefined) {
      updateData.dateRanges = dateRanges;
    }

    // Return an error if there is nothing to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No valid update data provided" 
      });
    }

    // Update user document
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

// Add new method to get provider's availability settings
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
