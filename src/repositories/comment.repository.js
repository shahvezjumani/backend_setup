import { Comment } from "../models/comment.model.js";

const createComment = async (userId, blogId, comment) => {
  return await Comment.create({
    user: userId,
    blog: blogId,
    comment: comment,
  });
};

const findComment = async (userId, blogId) => {
  return await Comment.findOne({
    user: userId,
    blog: blogId,
  });
};

const findCommentByUserId = async (userId, commentId) => {
  return await Comment.findOne({
    user: userId,
    _id: commentId,
  });
};

const findCommentsByBlog = async (blogId) => {
  return await Comment.find({ blog: blogId }).populate(
    "user",
    "_id usreName email",
  );
};

const deleteComment = async (userId, blogId, commentId) => {
  return await Comment.findOneAndDelete({
    user: userId,
    blog: blogId,
    _id: commentId,
  });
};

const incAndDecLikes = async (commentId, value) => {
  return await Comment.findByIdAndUpdate(
    commentId,
    { $inc: { likesCount: value } },
    { new: true },
  );
};

export {
  createComment,
  incAndDecLikes,
  deleteComment,
  findCommentsByBlog,
  findCommentByUserId,
  findComment
};
