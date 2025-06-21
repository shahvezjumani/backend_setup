import { Blog } from "../models/blog.model.js";

const createBlog = async (title, content, status, banner, slug, author) => {
  return await Blog.create({
    title,
    content,
    status,
    banner,
    slug,
    author,
  });
};

const getAllBlogs = async (
  query,
  field,
  projection,
  limit = undefined,
  offset = undefined,
) => {
  let queryBuilder = Blog.find(query)
    .select("-__v")
    .populate(field, projection)
    .sort({ createdAt: -1 });

  if (typeof limit === "number") {
    queryBuilder = queryBuilder.limit(limit);
  }

  if (typeof offset === "number") {
    queryBuilder = queryBuilder.skip(offset);
  }

  return await queryBuilder;
};

const findBlogWithAuthor = async (author) => {
  return await Blog.find({ author });
};

const findBlogWithId = async (blogId) => {
  console.log(blogId, "i am mm");

  return await Blog.findById(blogId);
};

const updateBlog = async (blogId, data) => {
  const blog = await findBlogWithId(blogId);
  if (data?.title) {
    blog.title = data.title;
  }
  if (data?.content) {
    blog.content = data.content;
  }
  if (data?.status) {
    blog.status = data.status;
  }

  if (data?.slug) {
    blog.slug = data.slug;
  }
  if (data?.banner && Object.keys(data.banner).length > 0) {
    blog.banner = data.banner;
  }

  blog.save({ validateBeforeSave: false });

  return await findBlogWithId(blog._id);
};

const deleteBlog = async (author) => {
  await Blog.deleteMany({ author });
};

const incAndDec = async (blogId, key, value) => {
  return await Blog.findByIdAndUpdate(
    blogId,
    { $inc: { [key]: value } },
    { new: true },
  );
};

export {
  createBlog,
  getAllBlogs,
  findBlogWithAuthor,
  updateBlog,
  findBlogWithId,
  deleteBlog,
  incAndDec,
};
