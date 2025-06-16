import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

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
      // select: false,
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
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};



export const User = model("User", userSchema);
