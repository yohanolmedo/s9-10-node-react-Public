import mongoose from "mongoose";
const UserScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  responses: [
    {
      skillId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
        required: true,
      },
      category: {
        type: String,
        enum: ["soft", "technical"],
        required: true,
      },
      type: {
        type: String,
        enum: ["open", "closed", "scale", "yesno", "multiple"],
        required: true,
        default: "scale",
      },
      score: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        enum: ["normal_comment", "praise"],
      },
      praise: {
        type: Boolean,
        default: false,
      },
      praiseCount: {
        type: Number,
        default: 0,
      },
    },
  ],
}, { timestamps: true });

const UserScore = mongoose.model("UserScore", UserScoreSchema);

export default UserScore;
