import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../lib/cloudinary.js";
import { findBlogWithId } from "../repositories/blog.repository.js";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const uploadBlogBanner = (method) => {
  return asyncHandler(async (req, res, next) => {
    console.log(req.file);

    if (!req.file && (method === "patch" || method === "put")) {
      req.isBannerToUpdate = false;
      return next();
    }

    if (!req.file) throw new ApiError(400, "Blog Banner is required");

    if (req.file.size > MAX_FILE_SIZE) {
      throw new ApiError(413, "File Size must be less than 2MB");
    }

    const blog = await findBlogWithId(req.params.blogId);
    req.publicId = blog.banner?.publicId;

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
    req.isBannerToUpdate = true;

    next();
  });
};

const deleteBlogBanner = (method) => {
  return asyncHandler(async (req, res, next) => {
    console.log("I am in delete Blog");

    if (!req?.isBannerToUpdate && (method === "patch" || method === "put")) {
      return next();
    }

    // if (method === "delete") {
    //   const blog = await findBlogWithId(req.params.blogId);
    //   req.publicId = blog.banner?.publicId;
    // }

    const publicId = req?.publicId;
    console.log(publicId, "public id");

    if (!publicId) {
      throw new ApiError(400, "Public Id is required");
    }
    const result = await deleteFromCloudinary(publicId);
    if(!result) {
      throw new ApiError(500, "Internal server error");
    }
    next();
  });
};

export { uploadBlogBanner, deleteBlogBanner };
