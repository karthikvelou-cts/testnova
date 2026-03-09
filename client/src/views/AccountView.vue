<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
    <div class="mx-auto max-w-6xl flex flex-col gap-6 p-6">
      <!-- Header with back button -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold">Account Settings</h1>
        <router-link to="/dashboard" class="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition">
          ← Back to Dashboard
        </router-link>
      </div>

      <!-- Account Info Card -->
      <div class="rounded-2xl bg-slate-800/50 border border-slate-700 p-8">
        <h2 class="text-2xl font-bold mb-6">Account Information</h2>
        
        <div class="space-y-6">
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="text-sm text-gray-400 uppercase tracking-wide">Name</label>
              <p class="text-xl font-semibold mt-2">{{ authStore.user?.name }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-400 uppercase tracking-wide">Email</label>
              <p class="text-xl font-semibold mt-2">{{ authStore.user?.email }}</p>
            </div>
          </div>

          <div class="border-t border-slate-700 pt-6">
            <label class="text-sm text-gray-400 uppercase tracking-wide">Member Since</label>
            <p class="text-lg text-gray-300 mt-2">{{ formatDate(authStore.user?.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Current Package Card -->
      <div class="rounded-2xl bg-slate-800/50 border border-slate-700 p-8">
        <h2 class="text-2xl font-bold mb-6">Current Package</h2>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm uppercase tracking-wide">Current Plan</p>
              <p class="text-3xl font-bold mt-2 capitalize">{{ authStore.user?.plan || 'Free' }}</p>
            </div>
            <div class="text-right">
              <div v-if="isSubscriptionActive" class="px-4 py-2 bg-green-500/20 rounded-lg border border-green-500/50">
                <p class="text-green-400 font-semibold text-sm">ACTIVE</p>
              </div>
              <div v-else class="px-4 py-2 bg-yellow-500/20 rounded-lg border border-yellow-500/50">
                <p class="text-yellow-400 font-semibold text-sm">INACTIVE</p>
              </div>
            </div>
          </div>

          <div v-if="authStore.user?.expiresAt" class="border-t border-slate-700 pt-4">
            <p class="text-gray-400 text-sm uppercase tracking-wide">Expires</p>
            <p class="text-lg font-semibold mt-2">{{ formatDate(authStore.user.expiresAt) }}</p>
          </div>

          <div class="border-t border-slate-700 pt-4">
            <div class="grid grid-cols-3 gap-4">
              <div>
                <p class="text-gray-400 text-xs uppercase">Requests/Month</p>
                <p class="text-2xl font-bold mt-2">{{ getPackageLimit(authStore.user?.plan) }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs uppercase">Models Available</p>
                <p class="text-2xl font-bold mt-2">{{ getModelCount(authStore.user?.plan) }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs uppercase">Priority Support</p>
                <p class="text-2xl font-bold mt-2">{{ hasSupport(authStore.user?.plan) ? '✓' : '✗' }}</p>
              </div>
            </div>
          </div>

          <!-- Upgrade Button -->
          <div v-if="authStore.user?.plan !== 'premium'" class="border-t border-slate-700 pt-6">
            <router-link 
              to="/upgrade" 
              class="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-semibold text-center transition"
            >
              Upgrade Your Plan
            </router-link>
          </div>
        </div>
      </div>

      <!-- Transaction History -->
      <div class="rounded-2xl bg-slate-800/50 border border-slate-700 p-8">
        <h2 class="text-2xl font-bold mb-6">Transaction History</h2>

        <div v-if="isLoadingTransactions" class="flex justify-center py-8">
          <LoaderSpinner />
        </div>

        <div v-else-if="!transactions.length" class="text-center py-8">
          <p class="text-gray-400">No transactions yet.</p>
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="tx in transactions" 
            :key="tx._id"
            class="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-700 hover:bg-slate-700/50 transition"
          >
            <div class="flex-1">
              <p class="font-semibold capitalize">{{ tx.plan }} Plan</p>
              <p class="text-sm text-gray-400">{{ formatDate(tx.createdAt) }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold">${{ tx.amount.toFixed(2) }}</p>
              <p :class="getStatusColor(tx.status)" class="text-sm font-medium mt-1">{{ tx.status.toUpperCase() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="rounded-2xl bg-red-950/20 border border-red-500/30 p-8">
        <h2 class="text-2xl font-bold mb-6 text-red-400">Danger Zone</h2>
        
        <div class="space-y-4">
          <p class="text-gray-400">Permanently delete your TestNova account and all associated data. This action cannot be undone.</p>
          
          <button 
            @click="confirmDelete"
            class="w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
          >
            Delete Account
          </button>

          <p class="text-xs text-gray-500">All your prompts, transactions, and account data will be permanently deleted.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useToast } from '../composables/useToast';
import LoaderSpinner from '../components/LoaderSpinner.vue';

const router = useRouter();
const authStore = useAuthStore();
const { show } = useToast();

const transactions = ref([]);
const isLoadingTransactions = ref(false);

const isSubscriptionActive = computed(() => {
  if (!authStore.user?.expiresAt) return false;
  return new Date(authStore.user.expiresAt) > new Date();
});

const getPackageLimit = (plan) => {
  const limits = {
    free: '5',
    super: '100',
    premium: 'Unlimited'
  };
  return limits[plan] || '5';
};

const getModelCount = (plan) => {
  const counts = {
    free: '2',
    super: '4',
    premium: '6'
  };
  return counts[plan] || '2';
};

const hasSupport = (plan) => {
  return plan === 'premium';
};

const getStatusColor = (status) => {
  const colors = {
    completed: 'text-green-400',
    pending: 'text-yellow-400',
    failed: 'text-red-400',
    refunded: 'text-gray-400'
  };
  return colors[status] || 'text-gray-400';
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const loadTransactions = async () => {
  isLoadingTransactions.value = true;
  try {
    const response = await fetch('/api/payment/transactions', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    transactions.value = data.transactions || [];
  } catch (error) {
    console.error('Failed to load transactions:', error);
    show('Failed to load transaction history', 'error');
  } finally {
    isLoadingTransactions.value = false;
  }
};

const confirmDelete = () => {
  if (confirm('Are you absolutely sure? This will permanently delete your account and all data. This action cannot be undone.')) {
    deleteAccount();
  }
};

const deleteAccount = async () => {
  try {
    const response = await fetch('/api/auth/delete-account', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete account');
    }

    localStorage.removeItem('token');
    authStore.logout();
    show('Account deleted successfully', 'success');
    router.push('/');
  } catch (error) {
    console.error('Error deleting account:', error);
    show('Failed to delete account', 'error');
  }
};

onMounted(() => {
  loadTransactions();
});
</script>
