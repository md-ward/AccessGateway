import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadImage = async (
  fileStream: Buffer<ArrayBufferLike>,
  fileName: string
) => {
  const result = await uploadStream(fileStream, fileName);
  return result;
};

const uploadStream = (fileStream: Buffer<ArrayBufferLike>, name: string) => {
  //wrapping into promise for using modern async/await
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ public_id: name }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
      .end(fileStream);
  });
};

const cloudinaryController = {
  uploadImage,
};

export default cloudinaryController;
