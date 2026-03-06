<template>
  <div class="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 p-4 md:flex-row">
    <SidebarNav />
    <main class="flex-1 rounded-2xl bg-white p-6 shadow-lg">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-2xl font-bold">Prompt History</h2>
        <LoaderSpinner v-if="promptStore.loading" />
      </div>

      <div v-if="!promptStore.prompts.length" class="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
        No prompts found yet.
      </div>

      <ul v-else class="space-y-3">
        <li v-for="item in promptStore.prompts" :key="item._id" class="rounded-lg border p-4">
          <div class="mb-2 flex items-center justify-between gap-4">
            <RouterLink :to="`/history/${item._id}`" class="font-semibold text-blue-700 hover:underline">
              {{ item.prompt.slice(0, 80) }}{{ item.prompt.length > 80 ? "..." : "" }}
            </RouterLink>
            <button class="rounded bg-rose-600 px-2 py-1 text-xs font-semibold text-white" @click="removePrompt(item._id)">Delete</button>
          </div>
          <p class="text-xs text-slate-500">{{ formatDate(item.createdAt) }}</p>
        </li>
      </ul>

      <div class="mt-6 flex items-center justify-between">
        <button
          class="rounded border px-3 py-1 text-sm disabled:opacity-40"
          :disabled="promptStore.pagination.page <= 1"
          @click="loadPage(promptStore.pagination.page - 1)"
        >
          Previous
        </button>
        <p class="text-sm text-slate-600">
          Page {{ promptStore.pagination.page }} of {{ promptStore.pagination.totalPages }}
        </p>
        <button
          class="rounded border px-3 py-1 text-sm disabled:opacity-40"
          :disabled="promptStore.pagination.page >= promptStore.pagination.totalPages"
          @click="loadPage(promptStore.pagination.page + 1)"
        >
          Next
        </button>
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
