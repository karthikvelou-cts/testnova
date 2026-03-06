<template>
  <div class="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 p-4 md:flex-row">
    <SidebarNav />
    <main class="flex-1 rounded-2xl bg-white p-6 shadow-lg">
      <h2 class="mb-4 text-2xl font-bold">Dashboard</h2>
      <p class="mb-4 text-sm text-slate-600">Submit a prompt and get an AI response from Ollama.</p>

      <form class="space-y-3" @submit.prevent="handleSubmit">
        <textarea
          v-model="promptText"
          rows="6"
          placeholder="Enter your prompt..."
          class="w-full rounded-lg border px-3 py-2"
        />
        <button
          class="flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white"
          :disabled="promptStore.loading"
        >
          <LoaderSpinner v-if="promptStore.loading" />
          <span v-else>Generate Response</span>
        </button>
      </form>

      <section v-if="promptStore.latestResponse" class="mt-6 rounded-xl bg-slate-50 p-4">
        <h3 class="mb-2 text-lg font-semibold">AI Response</h3>
        <p class="whitespace-pre-wrap text-sm text-slate-800">{{ promptStore.latestResponse }}</p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import LoaderSpinner from "../components/LoaderSpinner.vue";
import SidebarNav from "../components/SidebarNav.vue";
import { useToast } from "../composables/useToast";
import { usePromptStore } from "../store/prompts";

const promptStore = usePromptStore();
const { show } = useToast();
const promptText = ref("");

const handleSubmit = async () => {
  if (!promptText.value.trim()) {
    show("Prompt is required", "error");
    return;
  }

  try {
    await promptStore.submitPrompt(promptText.value);
    show("Response generated and saved", "success");
    promptText.value = "";
  } catch (error) {
    show(error.response?.data?.message || "Failed to generate response", "error");
  }
};
</script>
