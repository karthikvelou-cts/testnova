<template>
  <div class="flex h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
    <div class="text-center space-y-6 max-w-md">
      <!-- Success Icon -->
      <div class="text-6xl animate-bounce">✨</div>

      <h1 class="text-4xl font-bold">Payment Successful!</h1>

      <div v-if="errorMessage" class="bg-rose-500/10 border border-rose-500/40 rounded-2xl p-4 text-rose-200">
        {{ errorMessage }}
      </div>

      <div v-if="!loading && paymentData" class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4">
        <div class="text-left space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-400">Plan:</span>
            <span class="font-semibold capitalize">{{ paymentData.plan }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Amount:</span>
            <span class="font-semibold">${{ (paymentData.transaction?.amount || 0).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Duration:</span>
            <span class="font-semibold">1 Year</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Expires:</span>
            <span class="font-semibold">{{ formatDate(paymentData.expiresAt) }}</span>
          </div>
        </div>
      </div>

      <p class="text-gray-300">
        Your {{ paymentData?.plan }} plan is now active. You have unlimited access to all features.
      </p>

      <div v-if="!loading" class="space-y-3">
        <router-link
          to="/dashboard"
          class="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition font-semibold"
        >
          Start Using TestNova
        </router-link>
        <router-link
          to="/history"
          class="block w-full px-6 py-3 border border-gray-600 rounded-lg hover:bg-slate-800 transition font-semibold"
        >
          View Your History
        </router-link>
      </div>

      <div v-else class="flex items-center justify-center gap-2">
        <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <span>Processing payment...</span>
      </div>

      <p class="text-xs text-gray-500">
        A receipt has been sent to your email address.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(true);
const paymentData = ref(null);
const errorMessage = ref("");

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

onMounted(async () => {
  try {
    const sessionId = route.query.session_id;
    if (!sessionId) {
      errorMessage.value = "Missing Stripe session id in URL.";
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      const redirectPath = encodeURIComponent(`/payment-success?session_id=${sessionId}`);
      router.push(`/login?redirect=${redirectPath}`);
      return;
    }

    // Call backend to confirm payment
    const response = await fetch('/api/payment/success', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = await response.json();
    if (response.ok) {
      paymentData.value = data;
      // Always refresh profile so plan/status is consistent across pages
      await authStore.fetchProfile();

      // Immediate UI fallback before profile call resolves everywhere
      if (authStore.user && data.plan) {
        authStore.user.plan = data.plan;
        authStore.user.expiresAt = data.expiresAt;
        localStorage.setItem("user", JSON.stringify(authStore.user));
      }
    } else {
      errorMessage.value = data.message || "Failed to confirm payment.";
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    errorMessage.value = "Could not verify payment status. Please check Transactions in Account.";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
}
</style>
