<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <div class="text-center mb-12">
        <router-link to="/dashboard" class="inline-block mb-6 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition">
          ← Back to Dashboard
        </router-link>
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Upgrade Your Plan</h1>
        <p class="text-xl text-gray-300">Choose the perfect plan for your needs</p>
      </div>

      <!-- Current Package Badge -->
      <div v-if="authStore.user?.plan" class="text-center mb-12">
        <p class="text-gray-400 text-sm uppercase tracking-wide">Your Current Plan</p>
        <p class="text-2xl font-bold mt-2 capitalize text-blue-400">{{ authStore.user.plan }}</p>
      </div>

      <!-- Pricing Cards -->
      <div class="grid md:grid-cols-3 gap-8 mb-12">
        <!-- Free Plan Card -->
        <div class="rounded-2xl bg-slate-800/50 border border-slate-700 p-8 flex flex-col">
          <h3 class="text-2xl font-bold mb-2">Free</h3>
          <p class="text-gray-400 text-sm mb-6">Perfect for trying out TestNova</p>

          <div class="mb-8">
            <p class="text-sm text-gray-400">Monthly Limit</p>
            <p class="text-3xl font-bold mt-2">5<span class="text-sm text-gray-400"> prompts</span></p>
          </div>

          <ul class="space-y-4 mb-8 flex-1">
            <li class="flex items-start gap-3">
              <span class="text-green-400 mt-1">✓</span>
              <span>2 AI Models</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 mt-1">✓</span>
              <span>Basic Code Generation</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-gray-500 mt-1">✗</span>
              <span class="text-gray-500">Priority Support</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-gray-500 mt-1">✗</span>
              <span class="text-gray-500">Advanced Analytics</span>
            </li>
          </ul>

          <button 
            v-if="authStore.user?.plan !== 'free'"
            disabled
            class="w-full px-6 py-3 bg-slate-700/50 rounded-lg font-semibold text-gray-400 cursor-not-allowed opacity-50"
          >
            Current Plan
          </button>
          <button 
            v-else
            disabled
            class="w-full px-6 py-3 bg-slate-700/50 rounded-lg font-semibold text-gray-400 cursor-not-allowed opacity-50"
          >
            Your Plan
          </button>
        </div>

        <!-- Super Plan Card -->
        <div class="rounded-2xl bg-slate-800/50 border-2 border-blue-500/50 p-8 flex flex-col relative">
          <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span class="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-1 rounded-full text-sm font-semibold">MOST POPULAR</span>
          </div>

          <h3 class="text-2xl font-bold mb-2 mt-2">Super</h3>
          <p class="text-gray-400 text-sm mb-6">For serious developers</p>

          <div class="mb-8">
            <p class="text-sm text-gray-400">One-time Payment</p>
            <p class="text-3xl font-bold mt-2">$<span class="text-2xl">5</span>/year</p>
          </div>

          <ul class="space-y-4 mb-8 flex-1">
            <li class="flex items-start gap-3">
              <span class="text-green-400 mt-1">✓</span>
              <span>4 AI Models</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 mt-1">✓</span>
              <span>100+ prompts/month</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 mt-1">✓</span>
              <span>Test Case Generation</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-gray-500 mt-1">✗</span>
              <span class="text-gray-500">Advanced Analytics</span>
            </li>
          </ul>

          <button 
            v-if="authStore.user?.plan === 'super'"
            disabled
            class="w-full px-6 py-3 bg-slate-700/50 rounded-lg font-semibold text-gray-400 cursor-not-allowed opacity-50"
          >
            Your Current Plan
          </button>
          <button 
            v-else
            @click="upgradeToSuperPlan"
            :disabled="isProcessing"
            class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 rounded-lg font-semibold transition"
          >
            {{ isProcessing ? 'Processing...' : 'Upgrade to Super' }}
          </button>
        </div>

        <!-- Premium Plan Card -->
        <div class="rounded-2xl bg-slate-800/50 border border-slate-700 p-8 flex flex-col">
          <h3 class="text-2xl font-bold mb-2">Premium</h3>
          <p class="text-gray-400 text-sm mb-6">For power users & teams</p>

          <div class="mb-8">
            <p class="text-sm text-gray-400">One-time Payment</p>
            <p class="text-3xl font-bold mt-2">$<span class="text-2xl">10</span>/year</p>
          </div>

          <ul class="space-y-4 mb-8 flex-1">
            <li class="flex items-start gap-3">
              <span class="text-green-400 mt-1">✓</span>
              <span>All 6 AI Models</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 mt-1">✓</span>
              <span>Unlimited prompts</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 mt-1">✓</span>
              <span>Priority Email Support</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 mt-1">✓</span>
              <span>Advanced Analytics</span>
            </li>
          </ul>

          <button 
            v-if="authStore.user?.plan === 'premium'"
            disabled
            class="w-full px-6 py-3 bg-slate-700/50 rounded-lg font-semibold text-gray-400 cursor-not-allowed opacity-50"
          >
            Your Current Plan
          </button>
          <button 
            v-else
            @click="upgradeToPremiumPlan"
            :disabled="isProcessing"
            class="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-lg font-semibold transition"
          >
            {{ isProcessing ? 'Processing...' : 'Upgrade to Premium' }}
          </button>
        </div>
      </div>

      <!-- Features Comparison -->
      <div class="rounded-2xl bg-slate-800/50 border border-slate-700 p-8">
        <h2 class="text-2xl font-bold mb-8">Feature Comparison</h2>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-700">
                <th class="text-left py-4 px-4 text-gray-400">Feature</th>
                <th class="text-center py-4 px-4">Free</th>
                <th class="text-center py-4 px-4 bg-blue-500/10 rounded">Super</th>
                <th class="text-center py-4 px-4">Premium</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-slate-700">
                <td class="py-4 px-4">Monthly Requests</td>
                <td class="text-center">5</td>
                <td class="text-center bg-blue-500/10">100+</td>
                <td class="text-center">Unlimited</td>
              </tr>
              <tr class="border-b border-slate-700">
                <td class="py-4 px-4">AI Models</td>
                <td class="text-center">2</td>
                <td class="text-center bg-blue-500/10">4</td>
                <td class="text-center">6</td>
              </tr>
              <tr class="border-b border-slate-700">
                <td class="py-4 px-4">Code Generation</td>
                <td class="text-center text-green-400">✓</td>
                <td class="text-center bg-blue-500/10 text-green-400">✓</td>
                <td class="text-center text-green-400">✓</td>
              </tr>
              <tr class="border-b border-slate-700">
                <td class="py-4 px-4">Test Case Generation</td>
                <td class="text-center text-gray-500">✗</td>
                <td class="text-center bg-blue-500/10 text-green-400">✓</td>
                <td class="text-center text-green-400">✓</td>
              </tr>
              <tr class="border-b border-slate-700">
                <td class="py-4 px-4">Documentation Generation</td>
                <td class="text-center text-gray-500">✗</td>
                <td class="text-center bg-blue-500/10 text-green-400">✓</td>
                <td class="text-center text-green-400">✓</td>
              </tr>
              <tr>
                <td class="py-4 px-4">Priority Support</td>
                <td class="text-center text-gray-500">✗</td>
                <td class="text-center bg-blue-500/10 text-gray-500">✗</td>
                <td class="text-center text-green-400">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="mt-12 rounded-2xl bg-slate-800/50 border border-slate-700 p-8">
        <h2 class="text-2xl font-bold mb-8">FAQ</h2>
        
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold mb-2">Can I switch plans anytime?</h3>
            <p class="text-gray-400">Yes! You can upgrade from Free to Super or Premium at any time. Downgrading is also available.</p>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold mb-2">Is there a refund policy?</h3>
            <p class="text-gray-400">We offer a 30-day money-back guarantee if you're not satisfied with your purchase.</p>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
            <p class="text-gray-400">We accept all major credit and debit cards through Stripe.</p>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold mb-2">Do you offer team plans?</h3>
            <p class="text-gray-400">Contact our support team at support@testnova.com for custom team pricing.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useToast } from '../composables/useToast';

const router = useRouter();
const authStore = useAuthStore();
const { show } = useToast();

const isProcessing = ref(false);

const upgradePlan = async (plan) => {
  isProcessing.value = true;
  try {
    const response = await fetch('/api/payment/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        plan,
        duration: '1year'
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create checkout session');
    }

    // Redirect to Stripe checkout
    if (data.sessionId) {
      // In production, use Stripe's redirect
      window.location.href = `https://checkout.stripe.com/pay/${data.sessionId}`;
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    show(error.message || 'Failed to initiate payment', 'error');
  } finally {
    isProcessing.value = false;
  }
};

const upgradeToSuperPlan = () => upgradePlan('super');
const upgradeToPremiumPlan = () => upgradePlan('premium');
</script>
