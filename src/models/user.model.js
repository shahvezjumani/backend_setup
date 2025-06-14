import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, "Username is required"],
      maxLength: [20, "Username must be less than 20 characters"],
      unique: [true, "Username must be unique"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email must be unique"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be greather than 8 characters"],
      select: false,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["admin", "user"],
        message: "{VALUE} is not supported",
      },
      default: "user",
    },
    firstName: {
      type: String,
      maxLength: [20, "First name must be less than 20 characters"],
    },
    lastName: {
      type: String,
      maxLength: [20, "Last name must be less than 20 characters"],
    },
    socialLinks: {
      website: {
        type: String,
      },
      linkedIn: {
        type: String,
      },
      github: {
        type: String,
      },
    },
  },
  { timestamps: true },
);

export const User = model("User", userSchema);
