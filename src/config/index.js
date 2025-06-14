import dotenv from "dotenv";

dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV,
  WHITELIST_ORIGINS: [""],
  MONGO_URI: process.env.MONGODB_URI,
  DB_NAME: process.env.DB_NAME
};

export default config;
