<template>
  <div class="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 p-4 md:flex-row">
    <SidebarNav />
    <main class="flex-1 rounded-2xl bg-white p-6 shadow-lg">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-2xl font-bold">Prompt Detail</h2>
        <LoaderSpinner v-if="promptStore.loading" />
      </div>

      <div v-if="promptStore.activePrompt" class="space-y-6">
        <div>
          <h3 class="mb-3 text-lg font-semibold">Prompt</h3>
          <div class="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p class="whitespace-pre-wrap text-slate-700 leading-relaxed">{{ promptStore.activePrompt.prompt }}</p>
          </div>
        </div>

        <div>
          <h3 class="mb-4 text-lg font-semibold">AI Response</h3>
          <div class="rounded-lg bg-slate-50 p-6">
            <RichTextRenderer :content="promptStore.activePrompt.response" />
          </div>
        </div>

        <p class="text-xs text-slate-500 pt-4 border-t">Created: {{ formatDate(promptStore.activePrompt.createdAt) }}</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import LoaderSpinner from "../components/LoaderSpinner.vue";
import SidebarNav from "../components/SidebarNav.vue";
import RichTextRenderer from "../components/RichTextRenderer.vue";
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
