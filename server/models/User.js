import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    // Subscription fields
    plan: {
      type: String,
      enum: ['free', 'super', 'premium'],
      default: 'free',
    },
    subscriptionId: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    // Ollama model preference
    preferredModel: {
      type: String,
      default: 'mistral',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const User = mongoose.model("User", userSchema);
export default User;
