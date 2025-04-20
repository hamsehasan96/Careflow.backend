const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create participant-specific directory if needed
    let participantDir = uploadDir;
    if (req.params.participantId) {
      participantDir = path.join(uploadDir, `participant-${req.params.participantId}`);
      if (!fs.existsSync(participantDir)) {
        fs.mkdirSync(participantDir, { recursive: true });
      }
    }
    cb(null, participantDir);
  },
  filename: (req, file, cb) => {
    // Generate a secure random filename with original extension
    const randomName = crypto.randomBytes(16).toString('hex');
    const fileExt = path.extname(file.originalname);
    const sanitizedExt = fileExt.replace(/[^a-zA-Z0-9.]/g, '');
    const timestamp = Date.now();
    cb(null, `${timestamp}-${randomName}${sanitizedExt}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 
    'application/pdf', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'text/csv'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only images, PDFs, Word documents, Excel spreadsheets, and CSV files are allowed.`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 5 // Max 5 files per upload
  }
});

// Middleware for handling file upload errors
const handleFileUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum file size is 10MB.'
      });
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum is 5 files per upload.'
      });
    } else {
      return res.status(400).json({
        message: `File upload error: ${err.message}`
      });
    }
  } else if (err) {
    // A non-Multer error occurred
    return res.status(400).json({
      message: err.message
    });
  }
  next();
};

// Export middleware functions for different upload scenarios
module.exports = {
  // Single file upload
  uploadSingle: (fieldName) => [
    upload.single(fieldName),
    handleFileUploadErrors
  ],
  
  // Multiple files, same field
  uploadMultiple: (fieldName, maxCount = 5) => [
    upload.array(fieldName, maxCount),
    handleFileUploadErrors
  ],
  
  // Multiple fields with different files
  uploadFields: (fields) => [
    upload.fields(fields),
    handleFileUploadErrors
  ],
  
  // Handle file upload errors directly
  handleFileUploadErrors
};
