import { model, Schema } from "mongoose";

const blogSchema = new Schema({}, { timestamps: true });

export const Blog = model("Blog", blogSchema);
