import {
  ApiError,
  ApiResponse,
  asyncHandler,
  generateSlug,
} from "../utils/index.js";
import {
  createBlog,
  getAllBlogs,
  findBlogWithAuthor,
  findBlogWithId,
  updateBlog,
  deleteBlog,
} from "../repositories/blog.repository.js";
import { findUserWithId } from "../repositories/userRepository.js";
import config from "../config/index.js";

import { deleteFromCloudinary } from "../lib/cloudinary.js";

import DOMpurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMpurify(window);

const handleCreateBlog = asyncHandler(async (req, res) => {
  const { title, content, status, banner } = req.body;
  const { userId } = req.user;

  const cleanContent = purify.sanitize(content);

  const slug = generateSlug(title);

  console.log(slug);

  const blog = await createBlog(
    title,
    cleanContent,
    status,
    banner,
    slug,
    userId,
  );

  if (!blog) throw new ApiError(500, "server error");

  return res
    .status(200)
    .json(new ApiResponse(200, blog, "Blog created successfully"));
});

const handleGetAllBlogs = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const limit = Number(req.query.limit) ?? config.defaultResLimit;
  const offset = Number(req.query.offset) ?? config.defaultResOffset;

  const user = await findUserWithId(userId);

  let query = {};
  if (user?.role === "user") {
    query.status = "published";
  }

  const blogs = await getAllBlogs(
    limit,
    offset,
    query,
    "author",
    "-__v -password -refreshToken -createdAt -updatedAt",
  );
  if (!blogs || blogs.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No blogs found"));
  }
  console.log("hi");

  return res
    .status(200)
    .json(new ApiResponse(200, blogs, "Blogs fetched successfully"));
});

const handleGetBlogsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.userId;
  const limit = Number(req.query.limit) ?? config.defaultResLimit;
  const offset = Number(req.query.offset) ?? config.defaultResOffset;

  const user = await findUserWithId(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const currentUser = await findUserWithId(currentUserId);

  let query = {
    author: userId,
  };

  if (currentUser?.role === "user") {
    query.status = "published";
  }

  const blogs = await getAllBlogs(
    limit,
    offset,
    query,
    "author",
    "-__v -password -refreshToken -createdAt -updatedAt",
  );
  if (!blogs || blogs.length === 0) {
    throw new ApiError(404, "No Blogs found");
  }
  console.log("hi");

  return res
    .status(200)
    .json(new ApiResponse(200, blogs, "Blogs fetched successfully"));
});

const handleGetBlogBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const currentUserId = req.user.userId;

  const currentUser = await findUserWithId(currentUserId);

  let query = {
    slug,
  };

  if (currentUser?.role === "user") {
    query.status = "published";
  }

  const blog = await getAllBlogs(
    query,
    "author",
    "-__v -password -refreshToken -createdAt -updatedAt",
  );
  if (!blog) {
    throw new ApiError(404, "No Blog found");
  }
  console.log("hi");

  return res
    .status(200)
    .json(new ApiResponse(200, blog, "Blog fetched successfully"));
});

const handleUpdateBlog = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const blogId = req.params.blogId;
  const data = req.body;

  const blog = await findBlogWithId(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }
  const user = await findUserWithId(userId);

  if (blog.author !== userId && user.role !== "admin") {
    throw new ApiError(403, "Access denied, insufficient permissions");
  }

  let dataToUpdate = {};
  if (data?.content) {
    dataToUpdate.content = purify.sanitize(data.content);
  }

  if (data?.title) {
    dataToUpdate.slug = generateSlug(data.title);
    dataToUpdate.title = data.title;
  }

  if (req?.banner) {
    dataToUpdate.banner = req.banner;
  }

  if (data?.status) {
    dataToUpdate.status = data.status;
  }

  const updatedBlog = await updateBlog(blogId, dataToUpdate);

  if (!updatedBlog) throw new ApiError(500, "server error");

  return res
    .status(200)
    .json(
      new ApiResponse(200, { blog: updatedBlog }, "Blog updated successfully"),
    );
});

const handleDeleteBlog = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const blogId = req.params.blogId;

  const blog = await findBlogWithId(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }
  const user = await findUserWithId(userId);

  if (blog.author !== userId && user.role !== "admin") {
    throw new ApiError(403, "Access denied, insufficient permissions");
  }

  if (blog.banner?.publicId) {
    const result = await deleteFromCloudinary(blog.banner.publicId);
    if (!result) {
      throw new ApiError(500, "Internal server error");
    }
  }

  await deleteBlog(blogId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Blog deleted successfully"));
});



export {
  handleCreateBlog,
  handleGetAllBlogs,
  handleGetBlogsByUser,
  handleGetBlogBySlug,
  handleUpdateBlog,
  handleDeleteBlog,
};
