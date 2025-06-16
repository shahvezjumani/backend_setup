import jwt from "jsonwebtoken";
import config from "../config/index.js";

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, config.ACCESS_TOKEN_SECRET, {
    expiresIn: config.ACCESS_TOKEN_EXPIRY,
    subject: "accessApi",
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, config.REFRESH_TOKEN_SECRET, {
    expiresIn: config.REFRESH_TOKEN_EXPIRY,
    subject: "refreshToken",
  });
};


export { generateAccessToken, generateRefreshToken };
