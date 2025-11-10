import {CloudinaryStorage} from "multer-storage-cloudinary"
import multer from "multer";
import cloudinary from "../lib/cloudinary.js"
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog", 
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});
const upload = multer({ storage:storage });
export default upload;