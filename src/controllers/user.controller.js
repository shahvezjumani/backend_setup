import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import {
  findUserByEmail,
  createUser,
  setRefreshToken,
  findUserWithId,
  updateUser,
  isUserAlreadyExistWithEmailAndUsername,
  deleteUser,
  getAllUsers,
} from "../repositories/userRepository.js";
import {
  deleteBlog,
  findBlogWithAuthor,
} from "../repositories/blog.repository.js";
import { generateAccessToken, generateRefreshToken } from "../lib/jwt.js";
import config from "../config/index.js";
import jwt from "jsonwebtoken";
import { deleteFromCloudinary } from "../lib/cloudinary.js";
import cloudinary from "cloudinary";

const handleRegisterUser = asyncHandler(async (req, res) => {
  const { userName, email, password, role } = req.body;

  // if (role === "admin" || !config.WHITELIST_ADMINS_MAIL.includes(email)) {
  //   throw new ApiError(403, "unAuthorized user");
  // }

  if (!userName || !email || !password || !role) {
    throw new ApiError(400, "required fields are missing");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(400, "Email already registered");
  }

  const user = await createUser(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});

const handleLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  console.log("I am in");

  if (!accessToken || !refreshToken) {
    throw new ApiError(500, "something went wrong while generating tokens");
  }

  await setRefreshToken(user._id, refreshToken);

  const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "Strict",
    // maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  res
    .clearCookie("refreshToken", cookieOptions)
    .clearCookie("accessToken", cookieOptions);

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: userObj, accessToken },
        "User login successfully",
      ),
    );
});

const handleLogout = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  await setRefreshToken(userId, undefined);

  const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "Strict",
    // maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logout successfully"));
});

const handleRefreshToken = asyncHandler(async (req, res) => {
  const authHeader = req.get("Authorization");
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split("Bearer ")[1]
      : null;

  const refreshToken = req.cookies?.refreshToken || bearerToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing. Unauthorized request.");
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "expired refreshToken", err);
  }

  // console.log(payload, "id");

  if (!payload.userId) {
    throw new ApiError(401, "Invalid refreshToken or expired refreshToken ");
  }

  const user = await findUserWithId(payload.userId);
  console.log(user.refreshToken, "I am in ");
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  if (user.refreshToken !== refreshToken) {
    throw new ApiError(401, "Invalid refreshToken or expired refreshToken");
  }

  const accessToken = generateAccessToken(user._id);

  if (!accessToken) {
    throw new ApiError(
      500,
      "something went wrong while generating the tokens.",
    );
  }

  const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "Strict",
    // maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  res.clearCookie("accessToken", cookieOptions);

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: userObj, accessToken },
        "Token refreshed successfully",
      ),
    );
});

const handleGetCurrentUser = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const user = await findUserWithId(userId);

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return res
    .status(200)
    .json(new ApiResponse(200, { user: userObj }, "User fetched successfully"));
});

const handleUpdateCurrentUser = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const data = req.body;

  const isAlreadyExist = await isUserAlreadyExistWithEmailAndUsername(
    data?.email,
    data?.userName,
    userId,
  );

  if (isAlreadyExist) {
    throw new ApiError(
      400,
      "User with this email and/or username already exist",
    );
  }

  const user = await updateUser(userId, data);

  if (!user) {
    throw new ApiError(500, "something went wrong while updating the user");
  }

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return res
    .status(200)
    .json(new ApiResponse(200, { user: userObj }, "User updated successfully"));
});

const handleDeleteCurrentUser = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const blogs = await findBlogWithAuthor(userId);

  const publicIds = blogs.map((blog) => blog.banner?.publicId);
  if (publicIds && publicIds.length > 0) {
    await cloudinary.api.detete_resources(publicIds);
  }

  await deleteBlog(userId);

  await deleteUser(userId);
  const user = await findUserWithId(userId);

  if (user) {
    throw new ApiError(500, "server error while deleting the user");
  }

  const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "Strict",
    // maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

const handleGetAllUsers = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) ?? config.defaultResLimit;
  const offset = Number(req.query.offset) ?? config.defaultResOffset;
  const users = await getAllUsers(limit, offset);
  if (!users || users.length === 0) {
    throw new ApiError(400, "No users found");
  }
  console.log("hi");

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const handleGetUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await findUserWithId(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

const handleDeleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await findUserWithId(userId);
  if (!user) {
    throw new ApiError(400, "User not found");
  }
  const blogs = await findBlogWithAuthor(userId);

  const publicIds = blogs.map((blog) => blog.banner?.publicId);
  if (publicIds && publicIds.length > 0) {
    await cloudinary.api.detete_resources(publicIds);
  }

  await deleteUser(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

export {
  handleRegisterUser,
  handleLogin,
  handleRefreshToken,
  handleLogout,
  handleGetCurrentUser,
  handleUpdateCurrentUser,
  handleDeleteCurrentUser,
  handleGetAllUsers,
  handleGetUser,
  handleDeleteUser,
};
