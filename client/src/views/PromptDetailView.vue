<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
    <div class="mx-auto flex max-w-7xl flex-col gap-6 p-6 md:flex-row">
      <SidebarNav />
      <main class="flex-1 rounded-2xl bg-slate-800/50 border border-slate-700 p-8">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-3xl font-bold">Prompt Detail</h2>
          <LoaderSpinner v-if="promptStore.loading" />
        </div>

        <div v-if="promptStore.activePrompt" class="space-y-8">
          <div>
            <h3 class="mb-4 text-lg font-semibold text-blue-400">Your Prompt</h3>
            <div class="rounded-lg bg-slate-900/50 border border-blue-500/30 p-6">
              <p class="whitespace-pre-wrap text-gray-300 leading-relaxed">{{ promptStore.activePrompt.prompt }}</p>
            </div>
          </div>

          <div>
            <h3 class="mb-4 text-lg font-semibold text-cyan-400">AI Response</h3>
            <div class="rounded-lg bg-slate-900/50 border border-slate-700 p-6">
              <RichTextRenderer :content="promptStore.activePrompt.response" />
            </div>
          </div>

          <p class="text-xs text-gray-500 pt-6 border-t border-slate-700">Generated: {{ formatDate(promptStore.activePrompt.createdAt) }}</p>
        </div>
      </main>
    </div>
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
