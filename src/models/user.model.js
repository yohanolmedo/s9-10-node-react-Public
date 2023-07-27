import mongoose from "mongoose";
import toJSON from "../lib/toJSON.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      private:true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    subrole: {
      type: String,
      enum: ["team leader", "employee"],
    },
    equip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equip",
    },
    profilePicture: {
      type: String,
      default:
        "https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg",
    },
  },
  {
    timestamps: true,
  }
);
userSchema.plugin(toJSON);

export default mongoose.model("User", userSchema);
