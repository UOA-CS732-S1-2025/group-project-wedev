// backend/middleware/multerUpload.js
import multer from 'multer';
import path from 'path';

// 使用内存存储，因为我们要直接将 buffer 上传到 Cloudinary
// 这样可以避免将文件临时保存到服务器磁盘
const storage = multer.memoryStorage();

// 文件过滤器，只允许图片类型
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Error: File upload only supports the following filetypes - ' + allowedTypes), false);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 文件大小限制
  fileFilter: fileFilter,
});

export default upload;