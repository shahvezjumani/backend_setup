import { model, Schema } from "mongoose";

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      maxLength: [180, "Title must be less than 180 characters"],
    },
    slug: {
      type: String,
      unique: true,
      required: [true, "Slug is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    banner: {
      publicId: {
        type: String,
        required: [true, "Banner public Id is required"],
      },
      url: {
        type: String,
        required: [true, "Banner URL is required"],
      },
      width: {
        type: Number,
        required: [true, "Banner Width is required"],
      },
      height: {
        type: Number,
        required: [true, "Banner Height is required"],
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commnetsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ["draft", "published"],
        message: "{VALUE} is not supported",
      },
      default: "draft",
    },
  },
  { timestamps: true },
);

export const Blog = model("Blog", blogSchema);
