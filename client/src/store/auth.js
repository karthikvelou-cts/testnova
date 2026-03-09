import { defineStore } from "pinia";
import api from "../services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user") || "null"),
    token: localStorage.getItem("token") || "",
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    async register(payload) {
      this.loading = true;
      try {
        const { data } = await api.post("/auth/register", payload);
        this.user = data.user;
        this.token = data.token;
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
      } finally {
        this.loading = false;
      }
    },
    async login(payload) {
      this.loading = true;
      try {
        const { data } = await api.post("/auth/login", payload);
        this.user = data.user;
        this.token = data.token;
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        await this.fetchProfile();
      } finally {
        this.loading = false;
      }
    },
    async fetchProfile() {
      try {
        const { data } = await api.get("/auth/profile");
        this.user = data.user;
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    },
    logout() {
      this.user = null;
      this.token = "";
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});
