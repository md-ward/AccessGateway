import multer from "multer";

const storage = multer.memoryStorage();
// export const upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Limiting file size to 5MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]; // Allowed mimetypes
    const fileType = file.mimetype; // Get file type

    console.log("Uploaded file type:", fileType); // Log the file type

    if (!allowedTypes.includes(fileType)) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  },
}).single("file");

export default upload;
