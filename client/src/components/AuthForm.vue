<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500 opacity-20 blur-3xl"></div>
    </div>

    <!-- Main card -->
    <div class="relative w-full max-w-md rounded-3xl bg-white/10 p-8 shadow-2xl backdrop-blur-xl border border-white/20">
      <!-- Header -->
      <div class="mb-8 text-center">
        <div class="mb-4 inline-block rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-3">
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-white">{{ title }}</h1>
        <p class="mt-2 text-sm text-slate-300">{{ subtitle }}</p>
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="$emit('submit')">
        <!-- Name field (register only) -->
        <div v-if="showName" class="space-y-2">
          <label class="block text-sm font-medium text-slate-200">Full Name</label>
          <div class="relative">
            <svg class="absolute left-3 top-3 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <input
              v-model="modelValue.name"
              type="text"
              placeholder="John Doe"
              class="w-full rounded-lg border border-slate-400/30 bg-white/5 pl-10 pr-4 py-3 text-white placeholder-slate-400 backdrop-blur transition focus:border-blue-500 focus:bg-white/10 focus:outline-none"
            />
          </div>
        </div>

        <!-- Email field -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-200">Email Address</label>
          <div class="relative">
            <svg class="absolute left-3 top-3 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <input
              v-model="modelValue.email"
              type="email"
              placeholder="you@example.com"
              class="w-full rounded-lg border border-slate-400/30 bg-white/5 pl-10 pr-4 py-3 text-white placeholder-slate-400 backdrop-blur transition focus:border-blue-500 focus:bg-white/10 focus:outline-none"
            />
          </div>
        </div>

        <!-- Password field -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-200">Password</label>
          <div class="relative">
            <svg class="absolute left-3 top-3 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <input
              v-model="modelValue.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full rounded-lg border border-slate-400/30 bg-white/5 pl-10 pr-12 py-3 text-white placeholder-slate-400 backdrop-blur transition focus:border-blue-500 focus:bg-white/10 focus:outline-none"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition"
            >
              <svg v-if="!showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m4.753-4.753L3.596 3.596m16.807 16.807L9.404 9.404m0 0L6.9 6.9" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          class="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          :disabled="loading"
        >
          <LoaderSpinner v-if="loading" />
          <span v-else>{{ buttonText }}</span>
        </button>
      </form>

      <!-- Footer link -->
      <div class="mt-6 text-center text-sm text-slate-300">
        {{ footerText }}
        <RouterLink :to="footerLink" class="font-semibold text-blue-400 hover:text-blue-300 transition">
          {{ footerLinkText }}
        </RouterLink>
      </div>

      <!-- Divider -->
      <div class="my-6 flex items-center gap-3">
        <div class="h-px flex-1 bg-slate-400/20"></div>
        <span class="text-xs text-slate-400">or continue with</span>
        <div class="h-px flex-1 bg-slate-400/20"></div>
      </div>

      <!-- Social login (optional UI placeholder) -->
      <div class="grid grid-cols-2 gap-3">
        <button type="button" class="rounded-lg border border-slate-400/30 bg-white/5 py-2 text-white transition hover:bg-white/10">
          <svg class="h-5 w-5 mx-auto" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </button>
        <button type="button" class="rounded-lg border border-slate-400/30 bg-white/5 py-2 text-white transition hover:bg-white/10">
          <svg class="h-5 w-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import LoaderSpinner from "./LoaderSpinner.vue";

defineProps({
  title: String,
  subtitle: String,
  showName: Boolean,
  buttonText: String,
  footerText: String,
  footerLink: String,
  footerLinkText: String,
  loading: Boolean,
  modelValue: Object,
});

defineEmits(["submit", "update:modelValue"]);

const showPassword = ref(false);
</script>

<style scoped>
input::placeholder {
  color: rgba(148, 163, 184, 0.6);
}
</style>
