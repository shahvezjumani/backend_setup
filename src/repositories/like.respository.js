import { Like } from "../models/like.model.js";

const createBlogLike = async (userId, blogId) => {
  return await Like.create({
    user: userId,
    blog: blogId,
  });
};

const deleteBlogLike = async (userId, blogId) => {
  return await Like.deleteOne({
    user: userId,
    blog: blogId,
  });
};

const findBlogLike = async (userId, blogId) => {
  return await Like.findOne({
    user: userId,
    blog: blogId,
  });
};

const findCommentLike = async (userId, commentId) => {
  return await Like.findOne({
    user: userId,
    comment: commentId,
  });
};

const createCommentLike = async (userId, commentId) => {
  return await Like.create({
    user: userId,
    comment: commentId,
  });
};

const deleteCommentLike = async (userId, commentId) => {
  return await Like.findOneAndDelete({
    user: userId,
    comment: commentId,
  });
};

export {
  createBlogLike,
  findBlogLike,
  deleteBlogLike,
  findCommentLike,
  createCommentLike,
  deleteCommentLike,
};
