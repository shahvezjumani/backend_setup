import {
  handleLikeBlog,
  handleUnlikeBlog,
} from "../../controllers/like.controller.js";
import { Router } from "express";
import { verifyJWT, restrictTo } from "../../middlewares/verifyJWT.js";

const router = Router();

router.route("/blog/:blogId").post(verifyJWT, handleLikeBlog);
router.route("/blog/:blogId").delete(verifyJWT, handleUnlikeBlog);

export default router;
