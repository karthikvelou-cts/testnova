import { defineStore } from "pinia";
import api from "../services/api";

export const usePromptStore = defineStore("prompts", {
  state: () => ({
    prompts: [],
    activePrompt: null,
    latestResponse: "",
    loading: false,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
  }),
  actions: {
    async submitPrompt(prompt) {
      this.loading = true;
      try {
        const { data } = await api.post("/prompts", { prompt });
        this.latestResponse = data.response;
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
      if (this.activePrompt?._id === id) {
        this.activePrompt = null;
      }
    },
  },
});
