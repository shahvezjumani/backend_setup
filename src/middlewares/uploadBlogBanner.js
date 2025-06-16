import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { uploadToCloudinary } from "../lib/cloudinary.js";

const MAX_FILE_SIZE = 6 * 1024 * 1024; // 2MB

const uploadBlogBanner = asyncHandler(async (req, res, next) => {
  console.log(req.file);

  if (!req.file) throw new ApiError(400, "Blog Banner is required");

  if (req.file.size > MAX_FILE_SIZE) {
    throw new ApiError(413, "File Size must be less than 2MB");
  }

  const result = await uploadToCloudinary(req.file.buffer);

  console.log(result);

  if (!result) throw new ApiError(500, "Internal server error");

  const newBanner = {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
  };

  req.body.banner = newBanner;

  next();
});

export  { uploadBlogBanner };
