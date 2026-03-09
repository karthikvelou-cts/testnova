import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "../views/DashboardView.vue";
import LoginView from "../views/LoginView.vue";
import PromptDetailView from "../views/PromptDetailView.vue";
import PromptHistoryView from "../views/PromptHistoryView.vue";
import RegisterView from "../views/RegisterView.vue";
import LandingPageView from "../views/LandingPageView.vue";
import PricingView from "../views/PricingView.vue";
import PaymentSuccessView from "../views/PaymentSuccessView.vue";

const routes = [
  { path: "/", name: "landing", component: LandingPageView, meta: { guestOnly: false } },
  { path: "/pricing", name: "pricing", component: PricingView },
  { path: "/payment-success", name: "payment-success", component: PaymentSuccessView, meta: { requiresAuth: true } },
  { path: "/login", name: "login", component: LoginView, meta: { guestOnly: true } },
  { path: "/register", name: "register", component: RegisterView, meta: { guestOnly: true } },
  { path: "/dashboard", name: "dashboard", component: DashboardView, meta: { requiresAuth: true } },
  { path: "/history", name: "history", component: PromptHistoryView, meta: { requiresAuth: true } },
  { path: "/history/:id", name: "prompt-detail", component: PromptDetailView, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const token = localStorage.getItem("token");
  const isGuest = localStorage.getItem("isGuest") === "true";

  if (to.meta.requiresAuth && !token && !isGuest) {
    return { name: "login" };
  }

  if (to.meta.guestOnly && token && !isGuest) {
    return { name: "dashboard" };
  }

  return true;
});

export default router;
