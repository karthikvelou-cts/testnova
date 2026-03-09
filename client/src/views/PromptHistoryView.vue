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
          <h2 class="text-3xl font-bold">Prompt History</h2>
          <LoaderSpinner v-if="promptStore.loading" />
        </div>

        <div v-if="!promptStore.prompts.length" class="rounded-lg bg-slate-700/30 border border-slate-700 p-6 text-center text-gray-400">
          <p class="text-lg">No prompts found yet.</p>
          <p class="text-sm mt-2">Your chat history will appear here</p>
        </div>

        <ul v-else class="space-y-4">
          <li v-for="item in promptStore.prompts" :key="item._id" class="rounded-lg bg-slate-700/30 border border-slate-700 p-5 hover:bg-slate-700/50 transition">
            <div class="mb-3 flex items-center justify-between gap-4">
              <RouterLink :to="`/history/${item._id}`" class="font-semibold text-blue-400 hover:text-blue-300 transition flex-1">
                {{ item.prompt.slice(0, 100) }}{{ item.prompt.length > 100 ? "..." : "" }}
              </RouterLink>
              <button class="rounded bg-rose-600 hover:bg-rose-700 px-3 py-1 text-xs font-semibold text-white transition" @click="removePrompt(item._id)">Delete</button>
            </div>
            <p class="text-xs text-gray-400">{{ formatDate(item.createdAt) }}</p>
          </li>
        </ul>

        <div class="mt-8 flex items-center justify-between">
          <button
            class="rounded px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="promptStore.pagination.page <= 1"
            @click="loadPage(promptStore.pagination.page - 1)"
          >
            ← Previous
          </button>
          <p class="text-sm text-gray-400">
            Page <span class="font-semibold text-white">{{ promptStore.pagination.page }}</span> of <span class="font-semibold text-white">{{ promptStore.pagination.totalPages }}</span>
          </p>
          <button
            class="rounded px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="promptStore.pagination.page >= promptStore.pagination.totalPages"
            @click="loadPage(promptStore.pagination.page + 1)"
          >
            Next →
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import LoaderSpinner from "../components/LoaderSpinner.vue";
import SidebarNav from "../components/SidebarNav.vue";
import { useToast } from "../composables/useToast";
import { usePromptStore } from "../store/prompts";

const promptStore = usePromptStore();
const { show } = useToast();

const loadPage = async (page) => {
  try {
    await promptStore.fetchPrompts(page, promptStore.pagination.limit);
  } catch (error) {
    show(error.response?.data?.message || "Failed to load prompts", "error");
  }
};

const removePrompt = async (id) => {
  try {
    await promptStore.deletePrompt(id);
    show("Prompt deleted", "success");
    await loadPage(promptStore.pagination.page);
  } catch (error) {
    show(error.response?.data?.message || "Delete failed", "error");
  }
};

const formatDate = (value) => new Date(value).toLocaleString();

onMounted(() => {
  loadPage(1);
});
</script>
