import { v2 as cloudinary } from "cloudinary";
import config from "../config/index.js";

import fs from "fs";
import { publicDecrypt } from "crypto";

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
  secure: config.NODE_ENV === "production",
});

const uploadOnCloudinary = async (localFilePath, fileType = "auto") => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: fileType, // auto type for image, video, and other files
    });
    fs.unlinkSync(localFilePath); // Delete local file after uploading
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // Ensure the local file is deleted even on error
    console.error("Error uploading file to Cloudinary", error);
    return null;
  }
};

const uploadToCloudinary = (buffer, publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          allowed_formats: ["png", "jpg", "webp"],
          resource_type: "image",
          folder: "blog-api",
          public_id: publicId,
          transformation: { quality: "auto" },
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        },
      )
      .end(buffer);
  });
};

// Function to delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary delete response", result);
    if (result.result === "ok") {
      console.log("File deleted successfully from Cloudinary");
      return true;
    } else {
      console.error("Failed to delete file from Cloudinary");
      return false;
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary", error);
    return false;
  }
};

export { uploadToCloudinary, deleteFromCloudinary };
