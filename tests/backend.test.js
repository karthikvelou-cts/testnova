import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Mock models
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const promptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    prompt: { type: String, required: true, trim: true },
    response: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const User = mongoose.model("User", userSchema);
const Prompt = mongoose.model("Prompt", promptSchema);

describe("Backend Tests", () => {
  beforeAll(async () => {
    // Connect to test database
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGO_URI_TEST || process.env.MONGO_URI);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe("User Authentication", () => {
    let testUser;

    beforeEach(async () => {
      // Clean up before each test
      await User.deleteMany({ email: /^test-/ });
    });

    it("should register a new user with valid credentials", async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("password123", salt);

      const user = await User.create({
        name: "Test User",
        email: "test-user@example.com",
        password: hashedPassword,
      });

      expect(user).toBeDefined();
      expect(user.email).toBe("test-user@example.com");
      expect(user.password).not.toBe("password123"); // Should be hashed
    });

    it("should reject duplicate email registration", async () => {
      const email = "test-duplicate@example.com";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("password123", salt);

      await User.create({
        name: "User 1",
        email,
        password: hashedPassword,
      });

      try {
        await User.create({
          name: "User 2",
          email,
          password: hashedPassword,
        });
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error.code).toBe(11000); // MongoDB duplicate key error
      }
    });

    it("should hash passwords correctly", async () => {
      const plainPassword = "mySecurePassword123!";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);

      expect(hashedPassword).not.toBe(plainPassword);
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it("should generate valid JWT token", () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ userId }, process.env.JWT_SECRET || "test-secret", {
        expiresIn: "7d",
      });

      expect(token).toBeDefined();
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "test-secret");
      expect(decoded.userId.toString()).toBe(userId.toString());
    });

    it("should reject invalid JWT tokens", () => {
      const token = "invalid.token.here";

      expect(() => {
        jwt.verify(token, process.env.JWT_SECRET || "test-secret");
      }).toThrow();
    });
  });

  describe("User Model Validation", () => {
    beforeEach(async () => {
      await User.deleteMany({ email: /^test-/ });
    });

    it("should require name field", async () => {
      try {
        await User.create({
          email: "test@example.com",
          password: "password123",
        });
        expect(false).toBe(true);
      } catch (error) {
        expect(error.message).toContain("name");
      }
    });

    it("should require email field", async () => {
      try {
        await User.create({
          name: "Test",
          password: "password123",
        });
        expect(false).toBe(true);
      } catch (error) {
        expect(error.message).toContain("email");
      }
    });

    it("should require password field", async () => {
      try {
        await User.create({
          name: "Test",
          email: "test@example.com",
        });
        expect(false).toBe(true);
      } catch (error) {
        expect(error.message).toContain("password");
      }
    });

    it("should convert email to lowercase", async () => {
      const salt = await bcrypt.genSalt(10);
      const user = await User.create({
        name: "Test",
        email: "TEST@EXAMPLE.COM",
        password: await bcrypt.hash("password123", salt),
      });

      expect(user.email).toBe("test@example.com");
    });

    it("should trim email and name", async () => {
      const salt = await bcrypt.genSalt(10);
      const user = await User.create({
        name: "  Test User  ",
        email: "  test@example.com  ",
        password: await bcrypt.hash("password123", salt),
      });

      expect(user.name).toBe("Test User");
      expect(user.email).toBe("test@example.com");
    });
  });

  describe("Prompt Model", () => {
    let userId;

    beforeAll(async () => {
      const salt = await bcrypt.genSalt(10);
      const user = await User.create({
        name: "Prompt Test User",
        email: "prompt-test@example.com",
        password: await bcrypt.hash("password123", salt),
      });
      userId = user._id;
    });

    beforeEach(async () => {
      await Prompt.deleteMany({ userId });
    });

    it("should create a new prompt", async () => {
      const prompt = await Prompt.create({
        userId,
        prompt: "What is 2+2?",
        response: "2+2 equals 4",
      });

      expect(prompt).toBeDefined();
      expect(prompt.prompt).toBe("What is 2+2?");
      expect(prompt.userId.toString()).toBe(userId.toString());
    });

    it("should trim prompt text", async () => {
      const prompt = await Prompt.create({
        userId,
        prompt: "  What is AI?  ",
        response: "AI is artificial intelligence",
      });

      expect(prompt.prompt).toBe("What is AI?");
    });

    it("should require userId", async () => {
      try {
        await Prompt.create({
          prompt: "Test prompt",
          response: "Test response",
        });
        expect(false).toBe(true);
      } catch (error) {
        expect(error.message).toContain("userId");
      }
    });

    it("should require prompt field", async () => {
      try {
        await Prompt.create({
          userId,
          response: "Test response",
        });
        expect(false).toBe(true);
      } catch (error) {
        expect(error.message).toContain("prompt");
      }
    });

    it("should require response field", async () => {
      try {
        await Prompt.create({
          userId,
          prompt: "Test prompt",
        });
        expect(false).toBe(true);
      } catch (error) {
        expect(error.message).toContain("response");
      }
    });

    it("should sort prompts by creation date", async () => {
      const prompt1 = await Prompt.create({
        userId,
        prompt: "First prompt",
        response: "Response 1",
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const prompt2 = await Prompt.create({
        userId,
        prompt: "Second prompt",
        response: "Response 2",
      });

      const prompts = await Prompt.find({ userId }).sort({ createdAt: -1 });

      expect(prompts[0]._id.toString()).toBe(prompt2._id.toString());
      expect(prompts[1]._id.toString()).toBe(prompt1._id.toString());
    });

    it("should support pagination", async () => {
      // Create 15 prompts
      for (let i = 0; i < 15; i++) {
        await Prompt.create({
          userId,
          prompt: `Prompt ${i}`,
          response: `Response ${i}`,
        });
      }

      const page1 = await Prompt.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .skip(0);

      const page2 = await Prompt.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .skip(10);

      expect(page1.length).toBe(10);
      expect(page2.length).toBe(5);

      // Ensure no overlap
      const page1Ids = page1.map((p) => p._id.toString());
      const page2Ids = page2.map((p) => p._id.toString());
      const overlap = page1Ids.filter((id) => page2Ids.includes(id));

      expect(overlap.length).toBe(0);
    });
  });

  describe("Access Control", () => {
    let user1Id, user2Id, user1PromptId;

    beforeAll(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("password123", salt);

      const user1 = await User.create({
        name: "User 1",
        email: "user1-access@example.com",
        password: hashedPassword,
      });
      user1Id = user1._id;

      const user2 = await User.create({
        name: "User 2",
        email: "user2-access@example.com",
        password: hashedPassword,
      });
      user2Id = user2._id;

      const prompt = await Prompt.create({
        userId: user1Id,
        prompt: "User 1 prompt",
        response: "Response 1",
      });
      user1PromptId = prompt._id;
    });

    it("user should only see their own prompts", async () => {
      const user1Prompts = await Prompt.find({ userId: user1Id });
      const user2Prompts = await Prompt.find({ userId: user2Id });

      expect(user1Prompts.length).toBeGreaterThan(0);
      expect(user2Prompts.length).toBe(0);
    });

    it("user should not be able to delete other user's prompt", async () => {
      const result = await Prompt.findOneAndDelete({
        _id: user1PromptId,
        userId: user2Id,
      });

      expect(result).toBeNull();

      // Verify prompt still exists
      const prompt = await Prompt.findById(user1PromptId);
      expect(prompt).toBeDefined();
    });
  });
});
