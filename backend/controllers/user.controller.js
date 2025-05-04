import User from "../models/user.model.js";



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

