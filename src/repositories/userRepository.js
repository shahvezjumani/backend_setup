import { User } from "../models/user.model.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

const createUser = async (data) => {
  const user = await User.create(data);

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

const findUserWithId = async (userId) => {
  return await User.findById(userId);
};

const setRefreshToken = async (userId, token) => {
  const user = await findUserWithId(userId);
  user.refreshToken = token;
  user.save({
    validateBeforeSave: false,
  });
};

const updateUser = async (userId, data) => {
  const user = await findUserWithId(userId);

  if (data?.userName) user.userName = data.userName;
  if (data?.email) user.email = data.email;
  if (data?.password) user.password = data.password;
  if (data?.role) user.role = data.role;
  if (data?.firstName) user.firstName = data.firstName;
  if (data?.lastName) user.lastName = data.lastName;

  if (data?.socialLinks && Object.keys(data.socialLinks).length > 0) {
    if (data.socialLinks?.website)
      user.socialLinks.website = data.socialLinks.website;
    if (data.socialLinks?.linkedIn)
      user.socialLinks.linkedIn = data.socialLinks.linkedIn;
    if (data.socialLinks?.github)
      user.socialLinks.github = data.socialLinks.github;
  }

  await user.save({ validateBeforeSave: false });

  return await findUserWithId(user._id);
};

const isUserAlreadyExistWithEmailAndUsername = async (
  email = "",
  userName = "",
  userId,
) => {
  return !!(await User.findOne({
    $or: [{ email }, { userName }],
    _id: { $ne: userId },
  }));
};

const deleteUser = async (userId) => {
  await User.findByIdAndDelete(userId);
};

const getAllUsers = async (limit,offset) => {
  return await User.find({}).select('-password -refreshToken').limit(limit).skip(offset)
};

export {
  findUserByEmail,
  createUser,
  setRefreshToken,
  findUserWithId,
  updateUser,
  isUserAlreadyExistWithEmailAndUsername,
  deleteUser,
  getAllUsers
};
