import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "../views/DashboardView.vue";
import LoginView from "../views/LoginView.vue";
import PromptDetailView from "../views/PromptDetailView.vue";
import PromptHistoryView from "../views/PromptHistoryView.vue";
import RegisterView from "../views/RegisterView.vue";

const routes = [
  { path: "/login", name: "login", component: LoginView, meta: { guestOnly: true } },
  { path: "/register", name: "register", component: RegisterView, meta: { guestOnly: true } },
  { path: "/", name: "dashboard", component: DashboardView, meta: { requiresAuth: true } },
  { path: "/history", name: "history", component: PromptHistoryView, meta: { requiresAuth: true } },
  { path: "/history/:id", name: "prompt-detail", component: PromptDetailView, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const token = localStorage.getItem("token");

  if (to.meta.requiresAuth && !token) {
    return { name: "login" };
  }

  if (to.meta.guestOnly && token) {
    return { name: "dashboard" };
  }

  return true;
});

export default router;
