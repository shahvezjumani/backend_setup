import { Router } from "express";
import { handleRegisterUser } from "../../controllers/user.controller.js";

const router = Router();

router.route("/").post(handleRegisterUser);

export default router;
