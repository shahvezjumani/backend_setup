import mongoose from "mongoose";
import config from "../config/index.js";

const connectToDatabase = async () => {
  try {
    if (!config.MONGO_URI || !config.DB_NAME) {
      throw new Error("MongoDB URI or database name is missing in config.");
    }

    const dbConnectionString = `${config.MONGO_URI}/${config.DB_NAME}`;

    const connection = await mongoose.connect(dbConnectionString);

    console.log(`✅ MongoDB connected: ${connection.connection.host}`);
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message || err);
    process.exit(1);
  }
};

const disconnectFromDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log("disconnected from the database");
  } catch (err) {
    console.log("error disconnecting from the database", err.message || err);
  }
};

export { connectToDatabase, disconnectFromDatabase };
