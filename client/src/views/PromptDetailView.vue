<template>
  <div class="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 p-4 md:flex-row">
    <SidebarNav />
    <main class="flex-1 rounded-2xl bg-white p-6 shadow-lg">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-2xl font-bold">Prompt Detail</h2>
        <LoaderSpinner v-if="promptStore.loading" />
      </div>

      <div v-if="promptStore.activePrompt" class="space-y-5">
        <div>
          <h3 class="mb-2 text-lg font-semibold">Prompt</h3>
          <p class="whitespace-pre-wrap rounded-lg bg-slate-100 p-4">{{ promptStore.activePrompt.prompt }}</p>
        </div>

        <div>
          <h3 class="mb-2 text-lg font-semibold">AI Response</h3>
          <p class="whitespace-pre-wrap rounded-lg bg-slate-100 p-4">{{ promptStore.activePrompt.response }}</p>
        </div>

        <p class="text-sm text-slate-500">Created: {{ formatDate(promptStore.activePrompt.createdAt) }}</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import LoaderSpinner from "../components/LoaderSpinner.vue";
import SidebarNav from "../components/SidebarNav.vue";
import { useToast } from "../composables/useToast";
import { usePromptStore } from "../store/prompts";

const route = useRoute();
const promptStore = usePromptStore();
const { show } = useToast();

const formatDate = (value) => new Date(value).toLocaleString();

onMounted(async () => {
  try {
    await promptStore.fetchPromptById(route.params.id);
  } catch (error) {
    show(error.response?.data?.message || "Failed to load prompt", "error");
  }
});
</script>
