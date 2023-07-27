import mongoose from "mongoose";
const FormSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
    maxlength: 400,
  },
  createdBy: {
    type: String,
  },
  rolesAllowed: {
    type: [String],
    default: [],  
  },
  questions: [
    {
      question: {
        type: String,
        required: true,
      },
      skill: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        enum: ["soft skills", "technical skills"],
        required: true,
      },
      type: {
        type: String,
        required: true,
        enum: ["open", "closed", "scale", "yesno", "multiple"],
      },
      options: {
        type: [String],
        default: undefined,
      },
      scaleRange: {
        min: {
          type: Number,
          required: function () {
            return this.type === "scale";
          },
        },
        max: {
          type: Number,
          required: function () {
            return this.type === "scale";
          },
        },
      },
    },
  ],
  comments: {
    praise: {
      active: {
        type: Boolean,
        default: false,
      },
      content: {
        type: String,
        default: "",
      },
    },
    normal: {
      active: {
        type: Boolean,
        default: false,
      },
      content: {
        type: String,
        default: "",
      },
    },
  },
});

export default mongoose.model("Form", FormSchema);
