import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  // 从请求头获取token
  const token = req.header('x-auth-token');

  // 检查是否有token
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "No token, authorization denied" 
    });
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 将用户ID和角色添加到请求对象中
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

// 检查是否为特定角色的中间件
export const checkRole = (role) => {
  return (req, res, next) => {
    if (req.userRole !== role) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Not authorized" 
      });
    }
    next();
  };
};