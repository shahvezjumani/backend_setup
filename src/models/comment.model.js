import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    blog: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);
export const Comment = model("Comment", commentSchema);
