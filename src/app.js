import express from "express";
import cors from "cors";
import config from "./config/index.js";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { errorHandler } from "./utils/errorHandler.js";

const app = express();

const corsOptions = {
  origin(origin, cb) {
    if (
      config.NODE_ENV === "development" ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      cb(null, true);
      console.log(origin);
    } else {
      cb(new Error(`CORS error: ${origin} is not allowed by CORS`), false);
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  compression({
    threshold: 1024,
  }),
);
app.use(helmet());

import userRouter from "./routes/v1/user.route.js";
import blogRouter from "./routes/v1/blog.route.js";
import likeRouter from "./routes/v1/like.route.js";
import commentRouter from "./routes/v1/comment.route.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/comment", commentRouter);

app.use(errorHandler);
export default app;
