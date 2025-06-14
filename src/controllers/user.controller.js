import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { findUserByEmail, createUser } from "../repositories/userRepository.js";

const handleRegisterUser = asyncHandler(async (req, res) => {
  const { userName, email, password, role, firstName, lastName, socialLinks } =
    req.body;

  if (!userName || !email || !password || !role) {
    throw new ApiError(400, "required fields are missing");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(400, "Email already registered");
  }

  const user = await createUser(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});

export { handleRegisterUser };
