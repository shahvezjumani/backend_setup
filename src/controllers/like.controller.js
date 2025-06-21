import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import {
  createBlogLike,
  findBlogLike,
  deleteBlogLike,
  findCommentLike,
  createCommentLike,
  deleteCommentLike,
} from "../repositories/like.respository.js";
import { incAndDec } from "../repositories/blog.repository.js";
import { incAndDecLikes } from "../repositories/comment.repository.js";

const handleLikeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const userId = req.user.userId;

  const existingLike = await findBlogLike(userId, blogId);
  if (existingLike) {
    throw new ApiError(400, "Blog already liked");
  }

  await createBlogLike(userId, blogId);

  await incAndDecLikes(blogId, 1);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Blog liked successfully"));
});
const handleUnlikeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const userId = req.user.userId;

  const existingLike = await findBlogLike(userId, blogId);
  if (!existingLike) {
    throw new ApiError(400, "Blog is not liked");
  }

  await deleteBlogLike(userId, blogId);

  await incAndDec(blogId,likesCount ,-1);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Blog unliked successfully"));
});

const handleLikeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.userId;

  const existingLike = await findCommentLike(userId, commentId);
  if (existingLike) {
    throw new ApiError(400, "Comment already liked");
  }

  await createCommentLike(userId, commentId);

  await incAndDecLikes(blogId, 1);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Blog liked successfully"));
});

const handleUnlikeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.userId;
});
export {
  handleLikeBlog,
  handleUnlikeBlog,
  handleLikeComment,
  handleUnlikeComment,
};
