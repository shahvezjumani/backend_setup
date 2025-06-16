import { validationResult } from "express-validator";
import { ApiError } from "../utils/index.js";

const validationError = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.param,
      message: err.msg,
    }));
    throw new ApiError(400, "Validation error", errorMessages);
  }

  next();
};

export default validationError;
