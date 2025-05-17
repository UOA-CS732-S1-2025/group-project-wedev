// backend/middleware/multerUpload.js
import multer from 'multer';
import path from 'path';

// Use memory storage because we want to upload the buffer directly to Cloudinary
// This avoids temporarily saving the file to the server disk
const storage = multer.memoryStorage();

// File filter to allow only image types
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: fileFilter,
});

export default upload;