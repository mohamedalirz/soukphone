import multer from "multer";

// Use memory storage so the file is in req.file.buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;