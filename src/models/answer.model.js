import mongoose from "mongoose";

const ResponseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  evaluatedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Form",
    required: true,
  },
  comment: {
    type: [
      {
        type: {
          type: String,
          enum: ["comment", "praise"],
          default: "comment",
        },
        content: {
          type: String,
        },
      },
    ],
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Form.questions",
        required: true,
      },
      skill: {
        type: String,
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
      },
      score: {
        type: Number,
        required: function () {
          return this.type === "scale";
        },
      },
      answer: {
        type: mongoose.Schema.Types.Mixed, // Puede ser String, Boolean o Array según el tipo de pregunta
        required: function () {
          return this.type === "open" || this.type === "multiple" || this.type === "yesno";
        },
      },
    },
  ],
});

export default mongoose.model("Response", ResponseSchema);
