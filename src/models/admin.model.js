import mongoose from "mongoose";
import toJSON from "../lib/toJSON.js";
const adminSchema = new mongoose.Schema(
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
      private:true
    }
  },
  {
    timestamps: true,
  }
);
adminSchema.plugin(toJSON);
export default mongoose.model("Admin", adminSchema);
