import { Router } from "express";
import { body, query, param } from "express-validator";
import validationError from "../../middlewares/validationError.js";
import { verifyJWT, restrictTo } from "../../middlewares/verifyJWT.js";
import {
  handleCreateBlog,
  handleGetAllBlogs,
  handleGetBlogsByUser,
  handleGetBlogBySlug,
  handleUpdateBlog,
  handleDeleteBlog,
} from "../../controllers/blog.controller.js";
// import { upload } from "../../lib/multer.js";
import multer from "multer";
import {
  uploadBlogBanner,
  deleteBlogBanner,
} from "../../middlewares/uploadBlogBanner.js";

const router = Router();
const upload = multer();

router
  .route("/")
  .post(
    verifyJWT,
    restrictTo(["admin"]),
    upload.single("banner_image"),
    uploadBlogBanner("post"),
    body("title").notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("status").isIn(["draft", "published"]).withMessage("Invalid status"),
    validationError,
    handleCreateBlog,
    handleDeleteBlog,
  );

router
  .route("/")
  .get(
    verifyJWT,
    restrictTo(["admin", "user"]),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    query("offset")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Offset must be a positive interger"),
    handleGetAllBlogs,
  );

router
  .route("/user/:userId")
  .get(
    verifyJWT,
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    query("offset")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Offset must be a positive interger"),
    param("userId").notEmpty().isMongoId().withMessage("Invalid user Id"),
    validationError,
    handleGetBlogsByUser,
  );

router
  .route("/:slug")
  .get(
    verifyJWT,
    param("slug").notEmpty().withMessage("Slug is required"),
    validationError,
    handleGetBlogBySlug,
  );

router
  .route("/:blogId")
  .patch(
    verifyJWT,
    restrictTo(["admin"]),
    upload.single("banner_image"),
    param("blogId").isMongoId().withMessage("Invalid Blog Id"),
    uploadBlogBanner("patch"),
    deleteBlogBanner("patch"),
    body("title").notEmpty().optional().withMessage("Title is required"),
    body("content").notEmpty().optional().withMessage("Content is required"),
    body("status")
      .optional()
      .isIn(["draft", "published"])
      .withMessage("Invalid status"),
    validationError,
    handleUpdateBlog,
  )
  .delete(
    verifyJWT,
    restrictTo(["admin"]),
    param("blogId").isMongoId().withMessage("Invalid Blog Id"),
    validationError,
    handleDeleteBlog,
  );

export default router;
