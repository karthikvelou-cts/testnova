<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex">
    <!-- Sidebar -->
    <div class="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col flex-shrink-0">
      <SidebarNav />
    </div>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <div class="p-8 space-y-6">
        <div class="flex items-center justify-between">
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
