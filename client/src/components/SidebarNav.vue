<template>
  <aside class="flex w-full flex-col gap-4 rounded-2xl bg-slate-900 p-4 text-slate-100 md:w-64">
    <h1 class="text-xl font-bold">TestNova</h1>
    <nav class="flex flex-col gap-2">
      <RouterLink to="/" class="rounded-lg px-3 py-2 hover:bg-slate-700" active-class="bg-slate-700">Dashboard</RouterLink>
      <RouterLink to="/history" class="rounded-lg px-3 py-2 hover:bg-slate-700" active-class="bg-slate-700">Prompt History</RouterLink>
    </nav>
    <button
      class="mt-auto rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold hover:bg-rose-500"
      @click="handleLogout"
    >
      Logout
    </button>
  </aside>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push({ name: "login" });
};
</script>
