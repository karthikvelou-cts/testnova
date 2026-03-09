import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["system", "user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

conversationSchema.index({ userId: 1, conversationId: 1 }, { unique: true });
conversationSchema.index({ userId: 1, updatedAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
