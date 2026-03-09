<template>
  <aside class="flex w-full flex-col gap-4 rounded-2xl bg-slate-900 p-4 text-slate-100 md:w-64">
    <img src="/testnova-logo.png" alt="TestNova" class="h-10 w-auto object-contain" />
    <nav class="flex flex-col gap-2">
      <RouterLink to="/" class="rounded-lg px-3 py-2 hover:bg-slate-700" active-class="bg-slate-700">Dashboard</RouterLink>
      <RouterLink to="/history" class="rounded-lg px-3 py-2 hover:bg-slate-700" active-class="bg-slate-700">Prompt History</RouterLink>
      <RouterLink to="/account" class="rounded-lg px-3 py-2 hover:bg-slate-700" active-class="bg-slate-700">Account</RouterLink>
      <RouterLink to="/upgrade" class="rounded-lg px-3 py-2 hover:bg-slate-700 text-cyan-300" active-class="bg-slate-700">Upgrade</RouterLink>
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
