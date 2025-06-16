import { Router } from "express";
import { body, query, param } from "express-validator";
import validationError from "../../middlewares/validationError.js";
import { verifyJWT, restrictTo } from "../../middlewares/verifyJWT.js";
import { handleCreateBlog } from "../../controllers/blog.controller.js";
// import { upload } from "../../lib/multer.js";
import multer from "multer";
import { uploadBlogBanner } from "../../middlewares/uploadBlogBanner.js";

const router = Router();
const upload = multer();

router
  .route("/")
  .post(
    verifyJWT,
    restrictTo(["admin"]),
    upload.single("banner_image"),
    uploadBlogBanner,
    body("title").notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("status").isIn(["draft", "published"]).withMessage("Invalid status"),
    validationError,
    handleCreateBlog,
  );

export default router;
