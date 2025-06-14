import app from "./app.js";
import config from "./config/index.js";
import v1Routes from "./routes/v1/index.js";
import { connectToDatabase, disconnectFromDatabase } from "./lib/mongoose.js";

(async () => {
  try {
    await connectToDatabase();
    app.use("/api/v1", v1Routes);

    app.listen(config.PORT, () => {
      console.log(`server running : http://localhost:${config.PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
})();

const handleServerShutDown = async () => {
  try {
    await disconnectFromDatabase();
    console.log("Server ShutDown");
    process.exit(0);
  } catch (err) {
    console.log("error during server shutdown", err);
  }
};

process.on("SIGTERM", handleServerShutDown);
process.on("SIGINT", handleServerShutDown);
