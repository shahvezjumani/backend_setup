import { Router } from "express";
import { verifyJWT, restrictTo } from "../../middlewares/verifyJWT.js";
import { body, param } from "express-validator";
import validationError from "../../middlewares/validationError.js";
import {
  handleCreateComment,
  handleGetCommentsByBlog,
  handleDeleteComment,
} from "../../controllers/comment.controller.js";

const router = Router();

router
  .route("/blog/:blogId")
  .post(
    verifyJWT,
    param("blogId").isMongoId().withMessage("Invalid blog ID"),
    body("comment").notEmpty().withMessage("Comment is required"),
    validationError,
    handleCreateComment,
  );

router
  .route("/blog/:blogId")
  .get(
    verifyJWT,
    param("blogId").isMongoId().withMessage("Invalid blog ID"),
    validationError,
    handleGetCommentsByBlog,
  );

export default router;
