import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { createBlog } from "../repositories/blog.repository.js";

import DOMpurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMpurify(window);

const handleCreateBlog = asyncHandler(async (req, res) => {
  const { title, content, status, banner } = req.body;
  const { userId } = req.user;

  const cleanContent = purify.sanitize(content);

  const blog = await createBlog(title, cleanContent, status, banner, userId);
});

export { handleCreateBlog };
