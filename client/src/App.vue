<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
    <ToastList />
    <router-view />
  </div>
</template>

<script setup>
import ToastList from "./components/ToastList.vue";
</script>
