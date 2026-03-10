<template>
  <div class="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
    <!-- Sidebar -->
    <div class="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col">
      <!-- Logo -->
      <div class="p-6 border-b border-slate-800 flex items-center justify-center">
        <img src="/testnova-logo.png" alt="TestNova" class="h-12 w-auto object-contain" />
      </div>

      <!-- New Chat Button -->
      <button
        @click="newChat"
        class="m-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition font-semibold flex items-center justify-center gap-2"
      >
        <span>+ New Chat</span>
      </button>

      <!-- Model Selector -->
      <div class="px-4 py-3 border-b border-slate-800">
        <label class="text-xs uppercase tracking-wide text-gray-400 font-semibold">AI Model</label>
        <select
          v-model="selectedModel"
          @change="updateModel"
          class="mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm hover:border-slate-600 transition"
        >
          <optgroup label="Code Generation" class="text-gray-300">
            <option v-for="model in promptStore.codeModels" :key="model.id" :value="model.id">
              {{ model.name }} ({{ model.speed }})
            </option>
          </optgroup>
          <optgroup label="Testing & Docs" class="text-gray-300">
            <option v-for="model in promptStore.testModels" :key="model.id" :value="model.id">
              {{ model.name }} ({{ model.speed }})
            </option>
          </optgroup>
        </select>
        <p v-if="currentModel" class="text-xs text-gray-400 mt-2">
          {{ currentModel.description }}
        </p>
      </div>

      <!-- Chat History -->
      <div class="flex-1 overflow-y-auto px-4 py-4">
        <h3 class="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-4">History</h3>
        <div class="space-y-2">
          <button
            v-for="item in conversations"
            :key="item.conversationId"
            @click="selectChat(item)"
            class="w-full text-left p-3 rounded-lg hover:bg-slate-800/50 transition text-sm text-gray-300 hover:text-white truncate"
            :class="{ 'bg-slate-800/50': selectedConversationId === item.conversationId }"
          >
            {{ item.preview || "New conversation" }}
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t border-slate-800 p-4 space-y-2">
        <router-link
          to="/history"
          class="w-full flex items-center justify-center px-4 py-2 bg-slate-800/50 hover:bg-slate-700 rounded-lg text-sm transition font-medium text-white"
        >
          View History
        </router-link>
        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center px-4 py-2 bg-slate-800/50 hover:bg-slate-700 rounded-lg text-sm transition font-medium text-white"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <div class="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm p-4 flex justify-between items-center">
        <div>
          <h1 class="text-xl font-bold">TestNova Chat</h1>
          <p v-if="currentModel" class="text-sm text-gray-400">
            Using {{ currentModel.name }}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <span v-if="isGuest" class="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">
            Guest Mode ({{ 5 - guestPromptsUsed }}/5 prompts)
          </span>
          <button
            @click="openSettings"
            class="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            ⚙️
          </button>
        </div>
      </div>

      <!-- Chat Messages -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-6 space-y-6"
      >
        <div v-if="chatHistory.length === 0" class="flex flex-col items-center justify-center h-full">
          <div class="text-center space-y-4">
            <div class="text-6xl">💡</div>
            <h2 class="text-2xl font-bold">Start a conversation</h2>
            <p class="text-gray-400">Ask me anything about code, tests, or documentation</p>
          </div>
        </div>

        <div v-for="(msg, idx) in chatHistory" :key="idx" class="space-y-4">
          <!-- User Message -->
          <div class="flex justify-end">
            <div class="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl rounded-tr-none px-5 py-3 max-w-2xl">
              <p class="text-white break-words">{{ msg.prompt }}</p>
              <span class="text-xs text-blue-100 mt-1 block">{{ formatTime(msg.createdAt) }}</span>
            </div>
          </div>

          <!-- AI Response -->
          <div class="flex justify-start">
            <div class="bg-slate-800/50 border border-slate-700 rounded-2xl rounded-tl-none px-5 py-3 max-w-2xl">
              <RichTextRenderer :content="msg.response" />
              <span class="text-xs text-gray-400 mt-3 block">{{ formatTime(msg.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-start">
          <div class="bg-slate-800/50 border border-slate-700 rounded-2xl rounded-tl-none px-5 py-3">
            <div class="flex items-center gap-2">
              <LoaderSpinner />
              <span>Generating response...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="flex gap-3 items-end">
            <div class="relative flex-1">
              <textarea
                v-model="promptText"
                @keydown="handlePromptKeydown"
                placeholder="Ask me to generate code, write tests, or document your code... (Enter to send, Shift+Enter for new line)"
                class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pr-16 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                rows="3"
                :disabled="isLoading || (isGuest && guestPromptsUsed >= 5)"
              />
              <button
                type="button"
                @click="toggleVoiceInput"
                :disabled="!voiceSupported || isLoading || (isGuest && guestPromptsUsed >= 5)"
                class="absolute top-3 right-3 px-2 py-1 text-[11px] uppercase tracking-wide rounded-full border border-slate-700 bg-slate-900/60 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-gray-300"
                :class="{ 'border-red-500 text-red-300': isListening }"
                :title="voiceSupported ? (isListening ? 'Stop voice input' : 'Start voice input') : 'Voice input not supported in this browser'"
              >
                <span v-if="isListening" class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-red-300 border-t-transparent" aria-hidden="true"></span>
                <svg v-else class="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div class="flex justify-between items-center text-sm text-gray-400">
            <span v-if="isGuest && guestPromptsUsed >= 5" class="text-yellow-400">
              You've reached your guest limit. Sign up to continue!
            </span>
            <button
              v-if="chatHistory.length > 0"
              type="button"
              @click="clearHistory"
              class="text-gray-400 hover:text-red-400 transition"
            >
              Clear History
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { usePromptStore } from "../store/prompts";
import { useAuthStore } from "../store/auth";
import RichTextRenderer from "../components/RichTextRenderer.vue";
import LoaderSpinner from "../components/LoaderSpinner.vue";

const router = useRouter();
const promptStore = usePromptStore();
const authStore = useAuthStore();

const promptText = ref("");
const isLoading = ref(false);
const selectedConversationId = ref(promptStore.currentConversationId || null);
const messagesContainer = ref(null);
const selectedModel = ref(promptStore.selectedModel);
const isGuest = ref(localStorage.getItem("isGuest") === "true");
const guestPromptsUsed = ref(parseInt(localStorage.getItem("guestPromptsUsed") || "0"));
const voiceSupported = ref(false);
const isListening = ref(false);
let recognition = null;

const chatHistory = computed(() => promptStore.chatHistory);
const conversations = computed(() => promptStore.conversations);
const currentModel = computed(() => 
  promptStore.availableModels.find(m => m.id === selectedModel.value)
);

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const updateModel = () => {
  promptStore.setSelectedModel(selectedModel.value);
};

const handlePromptKeydown = (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSubmit();
  }
};

const stopVoiceInput = () => {
  if (recognition && isListening.value) {
    recognition.stop();
  }
};

const toggleVoiceInput = () => {
  if (!voiceSupported.value || !recognition) return;
  if (isListening.value) {
    stopVoiceInput();
  } else {
    recognition.start();
  }
};

const handleSubmit = async () => {
  if (!promptText.value.trim() || isLoading.value) return;

  if (isGuest.value && guestPromptsUsed.value >= 5) {
    alert("Guest limit reached. Please sign up for unlimited access!");
    return;
  }

  isLoading.value = true;
  stopVoiceInput();
  try {
    await promptStore.submitPrompt(promptText.value);
    selectedConversationId.value = promptStore.currentConversationId;
    
    if (isGuest.value) {
      guestPromptsUsed.value++;
      localStorage.setItem("guestPromptsUsed", guestPromptsUsed.value.toString());
    }

    promptText.value = "";
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error("Error submitting prompt:", error);
    alert("Failed to submit prompt. Please try again.");
  } finally {
    isLoading.value = false;
  }
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    nextTick(() => {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    });
  }
};

const newChat = () => {
  const conversationId = promptStore.startNewConversation();
  selectedConversationId.value = conversationId;
  promptText.value = "";
};

const selectChat = async (chat) => {
  selectedConversationId.value = chat.conversationId;
  await promptStore.loadConversation(chat.conversationId);
  await nextTick();
  scrollToBottom();
};

const clearHistory = async () => {
  if (confirm("Are you sure you want to clear all chat history?")) {
    const conversationId = promptStore.startNewConversation();
    selectedConversationId.value = conversationId;
  }
};

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("isGuest");
  localStorage.removeItem("guestToken");
  authStore.logout();
  router.push("/");
};

const openSettings = () => {
  alert("Settings panel coming soon!");
};

onMounted(async () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  voiceSupported.value = Boolean(SpeechRecognition);

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onstart = () => {
      isListening.value = true;
    };

    recognition.onend = () => {
      isListening.value = false;
    };

    recognition.onerror = () => {
      isListening.value = false;
    };

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }

      if (!transcript.trim()) return;

      promptText.value = promptText.value.trim()
        ? `${promptText.value} ${transcript.trim()}`
        : transcript.trim();
    };
  }

  await promptStore.fetchConversations();

  if (promptStore.currentConversationId) {
    selectedConversationId.value = promptStore.currentConversationId;
    await promptStore.loadConversation(promptStore.currentConversationId);
  } else if (promptStore.conversations.length > 0) {
    const latest = promptStore.conversations[0];
    selectedConversationId.value = latest.conversationId;
    await promptStore.loadConversation(latest.conversationId);
  } else {
    selectedConversationId.value = promptStore.startNewConversation();
  }

  scrollToBottom();
});

onUnmounted(() => {
  stopVoiceInput();
  recognition = null;
});
</script>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}
</style>
