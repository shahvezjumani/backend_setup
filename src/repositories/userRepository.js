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

export { findUserByEmail, createUser };
