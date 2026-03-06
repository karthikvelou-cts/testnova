<template>
  <div class="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 p-4 md:flex-row">
    <SidebarNav />
    <main class="flex-1 rounded-2xl bg-white p-6 shadow-lg flex flex-col">
      <div class="mb-4">
        <h2 class="text-2xl font-bold">Dashboard</h2>
        <p class="text-sm text-slate-600">Submit a prompt and get an AI response from Ollama.</p>
      </div>

      <!-- Chat history section -->
      <div class="flex-1 mb-4 overflow-y-auto space-y-4 min-h-80 bg-slate-50 rounded-lg p-4">
        <div v-if="promptStore.chatHistory.length === 0" class="flex items-center justify-center h-full text-slate-500">
          <p>No chat history yet. Start by submitting a prompt below.</p>
        </div>
        
        <div v-for="(chat, idx) in promptStore.chatHistory" :key="idx" class="space-y-2">
          <!-- User prompt -->
          <div class="flex justify-end">
            <div class="max-w-xs bg-blue-500 text-white rounded-lg px-4 py-2 rounded-br-none">
              <p class="text-sm">{{ chat.prompt }}</p>
              <p class="text-xs opacity-70 mt-1">{{ formatTime(chat.createdAt) }}</p>
            </div>
          </div>
          
          <!-- AI response -->
          <div class="flex justify-start">
            <div class="max-w-lg bg-slate-200 text-slate-900 rounded-lg px-4 py-3 rounded-bl-none">
              <RichTextRenderer :content="chat.response" />
              <p class="text-xs text-slate-600 mt-2">{{ formatTime(chat.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Input form -->
      <form class="space-y-3 border-t pt-4" @submit.prevent="handleSubmit">
        <textarea
          v-model="promptText"
          rows="4"
          placeholder="Enter your prompt..."
          class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div class="flex gap-2 justify-between items-center">
          <button
            type="button"
            @click="clearHistory"
            class="text-sm px-3 py-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
          >
            Clear Chat
          </button>
          <button
            class="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 transition"
            :disabled="promptStore.loading"
          >
            <LoaderSpinner v-if="promptStore.loading" />
            <span v-else>Send</span>
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import LoaderSpinner from "../components/LoaderSpinner.vue";
import SidebarNav from "../components/SidebarNav.vue";
import RichTextRenderer from "../components/RichTextRenderer.vue";
import { useToast } from "../composables/useToast";
import { usePromptStore } from "../store/prompts";

const promptStore = usePromptStore();
const { show } = useToast();
const promptText = ref("");

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

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

const clearHistory = () => {
  if (confirm("Are you sure you want to clear the chat history?")) {
    promptStore.clearChatHistory();
    show("Chat history cleared", "success");
  }
};
</script>
