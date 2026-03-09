import { defineStore } from "pinia";
import api from "../services/api";

export const usePromptStore = defineStore("prompts", {
  state: () => ({
    prompts: [],
    activePrompt: null,
    chatHistory: [], // Array to keep all responses
    loading: false,
    // Model selection
    selectedModel: localStorage.getItem("selectedModel") || "mistral",
    availableModels: [
      {
        id: "mistral",
        name: "Mistral 7B",
        category: "code",
        speed: "Fast",
        description: "Fast and accurate for all languages",
      },
      {
        id: "neural-chat",
        name: "Neural Chat 7B",
        category: "code",
        speed: "Fast",
        description: "Fast and accurate for all languages",
      },
      {
        id: "codellama",
        name: "Code Llama 13B",
        category: "code",
        speed: "Medium",
        description: "Specialized for code generation and understanding",
      },
      {
        id: "llama2",
        name: "Llama 2 7B",
        category: "test",
        speed: "Fast",
        description: "Comprehensive analysis for testing",
      },
      {
        id: "deepseek-coder",
        name: "Deepseek Coder 6.7B",
        category: "code",
        speed: "Fast",
        description: "Advanced code understanding and generation",
      },
      {
        id: "phind-codellama",
        name: "Phind CodeLlama 34B",
        category: "test",
        speed: "Slow",
        description: "Expert code reviews and documentation",
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
  }),
  getters: {
    latestResponse: (state) => state.chatHistory.length > 0 ? state.chatHistory[state.chatHistory.length - 1].response : "",
    codeModels: (state) => state.availableModels.filter(m => m.category === "code"),
    testModels: (state) => state.availableModels.filter(m => m.category === "test"),
  },
  actions: {
    setSelectedModel(modelId) {
      this.selectedModel = modelId;
      localStorage.setItem("selectedModel", modelId);
    },
    async submitPrompt(prompt) {
      this.loading = true;
      try {
        const { data } = await api.post("/prompts", { 
          prompt,
          model: this.selectedModel,
        });
        // Add to chat history instead of replacing
        this.chatHistory.push({
          prompt: data.prompt,
          response: data.response,
          _id: data._id,
          model: data.model || this.selectedModel,
          createdAt: data.createdAt,
        });
        return data;
      } finally {
        this.loading = true;
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
      this.chatHistory = [];
    },
  },
});

