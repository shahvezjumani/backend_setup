import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import {
  findComment,
  createComment,
  findCommentsByBlog,
  deleteComment,
  findCommentByUserId,
} from "../repositories/comment.repository.js";
import { incAndDec } from "../repositories/blog.repository.js";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

const handleCreateComment = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const { comment } = req.body;
  const userId = req.user.userId;

  const commentExists = await findComment(userId, blogId);
  if (commentExists) {
    throw new ApiError(400, "Comment already exists");
  }

  const cleanComment = purify.sanitize(comment);
  const newComment = await createComment(userId, blogId, cleanComment);

  await incAndDec(blogId, "commentsCount", 1);
  return res
    .status(201)
    .json(new ApiResponse(201, newComment, "Comment created successfully"));
});

const handleGetCommentsByBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  const comments = await findCommentsByBlog(blogId);
  if (!comments || comments.length === 0) {
    throw new ApiError(404, "No comments found for this blog");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments retrieved successfully"));
});

const handleDeleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.userId;

  const comment = await findCommentByUserId(userId, commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  await deleteComment(userId, comment.blog, commentId);
  await incAndDec(comment.blog, "commentsCount", -1);
  await incAndDec(commentId, "likesCount", -comment.likesCount);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { handleCreateComment, handleGetCommentsByBlog, handleDeleteComment };
