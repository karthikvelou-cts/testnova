import { defineStore } from "pinia";
import api from "../services/api";

const toChatHistory = (messages, fallbackDate) => {
  const history = [];
  let pendingUser = null;

  messages.forEach((message) => {
    if (message.role === "user") {
      pendingUser = message.content;
      return;
    }

    if (message.role === "assistant" && pendingUser !== null) {
      history.push({
        prompt: pendingUser,
        response: message.content,
        createdAt: fallbackDate,
      });
      pendingUser = null;
    }
  });

  return history;
};

export const usePromptStore = defineStore("prompts", {
  state: () => ({
    prompts: [],
    activePrompt: null,
    chatHistory: [],
    conversations: [],
    currentConversationId: localStorage.getItem("currentConversationId") || "",
    loading: false,
    selectedModel: localStorage.getItem("selectedModel") || "mistral",
    availableModels: [
      [
        {
          "id": "mistral",
          "name": "Mistral 7B",
          "category": "code",
          "speed": "Fast",
          "description": "Fast and accurate for all languages"
        },
        {
          "id": "neural-chat",
          "name": "Neural Chat 7B",
          "category": "code",
          "speed": "Fast",
          "description": "Fast and accurate for all languages"
        },
        {
          "id": "llama2",
          "name": "Llama 2 7B",
          "category": "test",
          "speed": "Fast",
          "description": "Comprehensive analysis for testing"
        },
        {
          "id": "deepseek-coder",
          "name": "Deepseek Coder 6.7B",
          "category": "code",
          "speed": "Fast",
          "description": "Advanced code understanding and generation"
        },
        {
          "id": "codellama",
          "name": "Code Llama 13B",
          "category": "code",
          "speed": "Medium",
          "description": "Specialized for code generation and understanding"
        },
        {
          "id": "devstral-small-2",
          "name": "Devstral Small 2 (24B)",
          "category": "code",
          "speed": "Medium",
          "description": "Optimized for software development, debugging, and generating unit tests"
        },
        {
          "id": "qwen3-coder-next",
          "name": "Qwen3 Coder Next",
          "category": "code",
          "speed": "Medium",
          "description": "Advanced coding model with strong reasoning and multi-language support"
        }
      ]
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
  }),
  getters: {
    latestResponse: (state) =>
      state.chatHistory.length > 0 ? state.chatHistory[state.chatHistory.length - 1].response : "",
    codeModels: (state) => state.availableModels.filter((m) => m.category === "code"),
    testModels: (state) => state.availableModels.filter((m) => m.category === "test"),
  },
  actions: {
    setSelectedModel(modelId) {
      this.selectedModel = modelId;
      localStorage.setItem("selectedModel", modelId);
    },
    generateConversationId() {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
      }
      return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    },
    setCurrentConversation(conversationId) {
      this.currentConversationId = conversationId;
      localStorage.setItem("currentConversationId", conversationId);
    },
    startNewConversation() {
      const conversationId = this.generateConversationId();
      this.setCurrentConversation(conversationId);
      this.chatHistory = [];
      return conversationId;
    },
    upsertConversationMeta(conversation) {
      const existingIndex = this.conversations.findIndex(
        (item) => item.conversationId === conversation.conversationId
      );

      if (existingIndex >= 0) {
        this.conversations[existingIndex] = {
          ...this.conversations[existingIndex],
          ...conversation,
        };
      } else {
        this.conversations.unshift(conversation);
      }

      this.conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    },
    async submitPrompt(prompt) {
      this.loading = true;
      try {
        if (!this.currentConversationId) {
          this.startNewConversation();
        }

        const { data } = await api.post("/chat", {
          conversationId: this.currentConversationId,
          prompt,
        });

        const now = new Date().toISOString();
        this.chatHistory.push({
          prompt,
          response: data.response,
          createdAt: now,
        });

        this.upsertConversationMeta({
          conversationId: this.currentConversationId,
          preview: prompt.length > 70 ? `${prompt.slice(0, 70)}...` : prompt,
          createdAt: now,
          updatedAt: now,
          messageCount: this.chatHistory.length * 2,
        });

        return data;
      } finally {
        this.loading = false;
      }
    },
    async fetchConversations() {
      this.loading = true;
      try {
        const { data } = await api.get("/chat/conversations");
        this.conversations = data.items || [];
      } finally {
        this.loading = false;
      }
    },
    async loadConversation(conversationId) {
      if (!conversationId) return;
      this.loading = true;
      try {
        const { data } = await api.get(`/chat/conversations/${encodeURIComponent(conversationId)}`);
        this.chatHistory = toChatHistory(data.messages || [], data.updatedAt || new Date().toISOString());
        this.setCurrentConversation(data.conversationId);
        this.upsertConversationMeta({
          conversationId: data.conversationId,
          preview:
            data.messages?.find((item) => item.role === "user")?.content?.slice(0, 70) || "New conversation",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          messageCount: (data.messages || []).length,
        });
      } finally {
        this.loading = false;
      }
    },
    async fetchPrompts(page = 1, limit = 10) {
      this.loading = true;
      try {
        const { data } = await api.get(`/prompts?page=${page}&limit=${limit}`);
        this.prompts = data.items;
        this.pagination = data.pagination;
      } finally {
        this.loading = false;
      }
    },
    async fetchPromptById(id) {
      this.loading = true;
      try {
        const { data } = await api.get(`/prompts/${id}`);
        this.activePrompt = data;
      } finally {
        this.loading = false;
      }
    },
    async deletePrompt(id) {
      await api.delete(`/prompts/${id}`);
      this.prompts = this.prompts.filter((item) => item._id !== id);
      this.chatHistory = this.chatHistory.filter((item) => item._id !== id);
      if (this.activePrompt?._id === id) {
        this.activePrompt = null;
      }
    },
    clearChatHistory() {
      this.startNewConversation();
    },
  },
});
