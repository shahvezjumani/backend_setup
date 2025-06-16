import { ApiError, asyncHandler } from "../utils/index.js";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { findUserWithId } from "../repositories/userRepository.js";

const verifyJWT = asyncHandler((req, _, next) => {
  const accessToken =
    req.cookies?.accessToken || req.get("Authorization")?.split("Bearer ")[1];

  if (!accessToken) {
    throw new ApiError(401, "Access token missing. Unauthorized request.");
  }

  try {
    const user = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET);

    if (!user) {
      throw new ApiError(400, "User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);

    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired.");
    } else if (err.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid access token.");
    } else {
      throw new ApiError(
        500,
        "Internal server error during token verification.",
      );
    }
  }
});

const restrictTo = (roles) => {
  return asyncHandler(async (req, _, next) => {
    const { userId } = req?.user;
    const user = await findUserWithId(userId);
    if (!roles.includes(user.role)) {
      throw new ApiError(403, "Unauthorized user");
    }
    next();
  });
};

export { verifyJWT, restrictTo };
