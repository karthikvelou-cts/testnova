<template>
  <div class="fixed right-4 top-4 z-50 space-y-2">
    <div
      v-for="toast in toastState.items"
      :key="toast.id"
      class="rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg"
      :class="toastClass(toast.type)"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { useToast } from "../composables/useToast";

const { toastState } = useToast();

const toastClass = (type) => {
  if (type === "error") return "bg-rose-600";
  if (type === "success") return "bg-emerald-600";
  return "bg-slate-800";
};
</script>
