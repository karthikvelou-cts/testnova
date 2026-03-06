<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <ToastList />
    <router-view />
  </div>
</template>

<script setup>
import ToastList from "./components/ToastList.vue";
</script>
