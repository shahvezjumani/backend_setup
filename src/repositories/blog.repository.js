import { Blog } from "../models/blog.model.js";

const createBlog = async (title, content, status, banner, author) => {
  return await Blog.create({
    title,
    content,
    status,
    banner,
    author,
  });
};

export { createBlog };
