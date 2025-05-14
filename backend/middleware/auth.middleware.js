import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  // Get token from request headers
  const token = req.header("x-auth-token") || (req.header("Authorization") && req.header("Authorization").split(" ")[1]);

  // Check if token exists
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "No token, authorization denied" 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user ID and role to the request object
    req.userId = decoded.id;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: "Token is not valid" 
    });
  }
};

// Check if user is of a specific role
// export const checkRole = (role) => {
//   return (req, res, next) => {
//     if (req.userRole !== role) {
//       return res.status(403).json({ 
//         success: false,
//         message: "Access denied. Not authorized" 
//       });
//     }
//     next();
//   };
// };
