import { Router } from "express";
import { body, query, param } from "express-validator";
import validationError from "../../middlewares/validationError.js";
import { verifyJWT, restrictTo } from "../../middlewares/verifyJWT.js";

import {
  handleRegisterUser,
  handleLogin,
  handleRefreshToken,
  handleLogout,
  handleGetCurrentUser,
  handleUpdateCurrentUser,
  handleDeleteCurrentUser,
  handleGetAllUsers,
  handleGetUser,
  handleDeleteUser,
} from "../../controllers/user.controller.js";

const router = Router();

router
  .route("/")
  .post(
    body("email").isEmail().withMessage("invalid email"),
    validationError,
    handleRegisterUser,
  );

router
  .route("/login")
  .post(
    body("email").isEmail().withMessage("invalid email"),
    validationError,
    handleLogin,
  );

// router.route("/").get(verifyJWT, (req, res) => {
//   return res.json({ message: "hello world" });
// });

router.route("/refreshToken").post(handleRefreshToken);

router.route("/logout").post(verifyJWT, handleLogout);

router
  .route("/")
  .get(
    verifyJWT,
    restrictTo(["admin"]),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    handleGetAllUsers,
  );

router
  .route("/current")
  .patch(
    body("email").optional().isEmail().withMessage("invalid email"),
    body("role")
      .optional()
      .isIn(["admin", "user"])
      .withMessage("Role must be either 'admin' or 'user'"),
    body(["socialLinks.website", "socialLinks.linkedIn", "socialLinks.github"])
      .optional()
      .isURL()
      .withMessage("invalid url"),
    validationError,
    verifyJWT,
    handleUpdateCurrentUser,
  )
  .get(verifyJWT, handleGetCurrentUser)
  .delete(verifyJWT, handleDeleteCurrentUser);

router
  .route("/:userId")
  .get(
    verifyJWT,
    restrictTo(["admin"]),
    param("userId").notEmpty().isMongoId().withMessage("invalid user Id"),
    validationError,
    handleGetUser,
  )
  .delete(
    verifyJWT,
    restrictTo(["admin"]),
    param("userId").notEmpty().isMongoId().withMessage("invalid user Id"),
    validationError,
    handleDeleteUser,
  );

export default router;
