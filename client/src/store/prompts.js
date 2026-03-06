import { defineStore } from "pinia";
import api from "../services/api";

export const usePromptStore = defineStore("prompts", {
  state: () => ({
    prompts: [],
    activePrompt: null,
    chatHistory: [], // Array to keep all responses
    loading: false,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
  }),
  getters: {
    latestResponse: (state) => state.chatHistory.length > 0 ? state.chatHistory[state.chatHistory.length - 1].response : "",
  },
  actions: {
    async submitPrompt(prompt) {
      this.loading = true;
      try {
        const { data } = await api.post("/prompts", { prompt });
        // Add to chat history instead of replacing
        this.chatHistory.push({
          prompt: data.prompt,
          response: data.response,
          _id: data._id,
          createdAt: data.createdAt,
        });
        return data;
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
      this.chatHistory = [];
    },
  },
});

