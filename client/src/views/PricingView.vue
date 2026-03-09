<template>
  <div class="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-screen text-white">
    <!-- Header -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 class="text-5xl font-bold text-center mb-4">
        Simple, Transparent Pricing
      </h1>
      <p class="text-xl text-gray-300 text-center max-w-2xl mx-auto">
        Choose the perfect plan for your coding needs. No hidden fees, cancel anytime.
      </p>
    </div>

    <!-- Pricing Cards -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        <!-- Free Plan -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:border-slate-600 transition flex flex-col">
          <div class="mb-8">
            <h3 class="text-3xl font-bold mb-2">Free</h3>
            <div class="flex items-baseline gap-1 mb-6">
              <span class="text-5xl font-bold">$0</span>
              <span class="text-gray-400">/year</span>
            </div>
            <p class="text-gray-300">Perfect for trying out TestNova</p>
          </div>

          <ul class="space-y-4 mb-8 flex-grow">
            <li class="flex items-start gap-3">
              <span class="text-green-400 font-bold mt-1">✓</span>
              <span>5 prompts per day</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 font-bold mt-1">✓</span>
              <span>Basic models only</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 font-bold mt-1">✓</span>
              <span>7-day chat history</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 font-bold mt-1">✓</span>
              <span>Community support</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-gray-500 font-bold mt-1">✗</span>
              <span class="text-gray-500">Code generation</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-gray-500 font-bold mt-1">✗</span>
              <span class="text-gray-500">Unit test generation</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-gray-500 font-bold mt-1">✗</span>
              <span class="text-gray-500">API access</span>
            </li>
          </ul>

          <router-link 
            to="/register"
            class="w-full px-4 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-center font-semibold"
          >
            Get Started
          </router-link>
        </div>

        <!-- Super Plan (Most Popular) -->
        <div class="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/40 rounded-2xl p-8 hover:border-blue-500/60 transition flex flex-col ring-2 ring-blue-500/20 relative">
          <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span class="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-1 rounded-full text-sm font-semibold">
              MOST POPULAR
            </span>
          </div>
          
          <div class="mb-8 pt-4">
            <h3 class="text-3xl font-bold mb-2">Super</h3>
            <div class="flex items-baseline gap-1 mb-6">
              <span class="text-5xl font-bold">$5</span>
              <span class="text-gray-400">/year</span>
            </div>
            <p class="text-gray-300">Best for active developers</p>
          </div>

          <ul class="space-y-4 mb-8 flex-grow">
            <li class="flex items-start gap-3">
              <span class="text-green-400 font-bold mt-1">✓</span>
              <span>Unlimited prompts</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 font-bold mt-1">✓</span>
              <span>All basic models</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 font-bold mt-1">✓</span>
              <span>90-day chat history</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 font-bold mt-1">✓</span>
              <span>Code generation</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 font-bold mt-1">✓</span>
              <span>Email support</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-gray-500 font-bold mt-1">✗</span>
              <span class="text-gray-500">Unit test generation</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-gray-500 font-bold mt-1">✗</span>
              <span class="text-gray-500">API access</span>
            </li>
          </ul>

          <button 
            @click="handleUpgrade('super')"
            :disabled="isProcessing"
            class="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition text-center font-semibold disabled:opacity-50"
          >
            {{ isProcessing ? 'Processing...' : 'Upgrade Now' }}
          </button>
        </div>

        <!-- Premium Plan -->
        <div class="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/40 rounded-2xl p-8 hover:border-purple-500/60 transition flex flex-col ring-2 ring-purple-500/20">
          <div class="mb-8">
            <h3 class="text-3xl font-bold mb-2">Premium</h3>
            <div class="flex items-baseline gap-1 mb-6">
              <span class="text-5xl font-bold">$10</span>
              <span class="text-gray-400">/year</span>
            </div>
            <p class="text-gray-300">For power users and teams</p>
          </div>

          <ul class="space-y-4 mb-8 flex-grow">
            <li class="flex items-start gap-3">
              <span class="text-green-400 font-bold mt-1">✓</span>
              <span>Unlimited everything</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 font-bold mt-1">✓</span>
              <span>All advanced models</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 font-bold mt-1">✓</span>
              <span>Full chat history</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 font-bold mt-1">✓</span>
              <span>Code generation</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 font-bold mt-1">✓</span>
              <span>Unit test generation</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 font-bold mt-1">✓</span>
              <span>Full API access</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-400 font-bold mt-1">✓</span>
              <span>24/7 priority support</span>
            </li>
          </ul>

          <button 
            @click="handleUpgrade('premium')"
            :disabled="isProcessing"
            class="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition text-center font-semibold disabled:opacity-50"
          >
            {{ isProcessing ? 'Processing...' : 'Upgrade Now' }}
          </button>
        </div>
      </div>

      <!-- Feature Comparison Table -->
      <div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 overflow-x-auto">
        <h2 class="text-2xl font-bold mb-8">Detailed Feature Comparison</h2>
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-slate-700">
              <th class="pb-4 font-semibold">Feature</th>
              <th class="pb-4 font-semibold text-center">Free</th>
              <th class="pb-4 font-semibold text-center">Super</th>
              <th class="pb-4 font-semibold text-center">Premium</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr class="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
              <td class="py-4">Daily Prompts</td>
              <td class="text-center">5</td>
              <td class="text-center">Unlimited</td>
              <td class="text-center">Unlimited</td>
            </tr>
            <tr class="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
              <td class="py-4">Chat History</td>
              <td class="text-center">7 days</td>
              <td class="text-center">90 days</td>
              <td class="text-center">Forever</td>
            </tr>
            <tr class="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
              <td class="py-4">Available Models</td>
              <td class="text-center">3</td>
              <td class="text-center">6</td>
              <td class="text-center">All (10+)</td>
            </tr>
            <tr class="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
              <td class="py-4">Code Generation</td>
              <td class="text-center">✗</td>
              <td class="text-center">✓</td>
              <td class="text-center">✓</td>
            </tr>
            <tr class="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
              <td class="py-4">Unit Test Generation</td>
              <td class="text-center">✗</td>
              <td class="text-center">✗</td>
              <td class="text-center">✓</td>
            </tr>
            <tr class="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
              <td class="py-4">Documentation Generation</td>
              <td class="text-center">✗</td>
              <td class="text-center">✓</td>
              <td class="text-center">✓</td>
            </tr>
            <tr class="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
              <td class="py-4">API Access</td>
              <td class="text-center">✗</td>
              <td class="text-center">✗</td>
              <td class="text-center">✓</td>
            </tr>
            <tr class="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
              <td class="py-4">Support</td>
              <td class="text-center">Community</td>
              <td class="text-center">Email</td>
              <td class="text-center">24/7 Priority</td>
            </tr>
            <tr class="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
              <td class="py-4">Priority Support</td>
              <td class="text-center">✗</td>
              <td class="text-center">✗</td>
              <td class="text-center">✓</td>
            </tr>
            <tr class="hover:bg-slate-700/20 transition">
              <td class="py-4">Model Selection</td>
              <td class="text-center">Fixed</td>
              <td class="text-center">Limited</td>
              <td class="text-center">Full</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h2 class="text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
      <div class="space-y-4">
        <div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition">
          <button 
            @click="toggleFaq(0)"
            class="w-full flex justify-between items-center"
          >
            <span class="font-semibold">Can I upgrade or downgrade anytime?</span>
            <span class="text-2xl">{{ expandedFaq === 0 ? '−' : '+' }}</span>
          </button>
          <div v-if="expandedFaq === 0" class="mt-4 text-gray-300 border-t border-slate-700 pt-4">
            Yes, you can change your plan anytime. If you upgrade mid-cycle, you'll be charged the difference. If you downgrade, credits will be applied to your next billing cycle.
          </div>
        </div>

        <div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition">
          <button 
            @click="toggleFaq(1)"
            class="w-full flex justify-between items-center"
          >
            <span class="font-semibold">What payment methods do you accept?</span>
            <span class="text-2xl">{{ expandedFaq === 1 ? '−' : '+' }}</span>
          </button>
          <div v-if="expandedFaq === 1" class="mt-4 text-gray-300 border-t border-slate-700 pt-4">
            We accept all major credit cards (Visa, Mastercard, American Express) through Stripe. We also support Apple Pay and Google Pay.
          </div>
        </div>

        <div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition">
          <button 
            @click="toggleFaq(2)"
            class="w-full flex justify-between items-center"
          >
            <span class="font-semibold">Is there a free trial for Premium?</span>
            <span class="text-2xl">{{ expandedFaq === 2 ? '−' : '+' }}</span>
          </button>
          <div v-if="expandedFaq === 2" class="mt-4 text-gray-300 border-t border-slate-700 pt-4">
            Yes! Start with our Free plan (5 prompts/day). You'll get a feel for TestNova before upgrading. No credit card required.
          </div>
        </div>

        <div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition">
          <button 
            @click="toggleFaq(3)"
            class="w-full flex justify-between items-center"
          >
            <span class="font-semibold">What if I don't like the service?</span>
            <span class="text-2xl">{{ expandedFaq === 3 ? '−' : '+' }}</span>
          </button>
          <div v-if="expandedFaq === 3" class="mt-4 text-gray-300 border-t border-slate-700 pt-4">
            We offer a 30-day money-back guarantee. If you're not satisfied, contact support for a full refund.
          </div>
        </div>

        <div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition">
          <button 
            @click="toggleFaq(4)"
            class="w-full flex justify-between items-center"
          >
            <span class="font-semibold">Is there a discount for annual billing?</span>
            <span class="text-2xl">{{ expandedFaq === 4 ? '−' : '+' }}</span>
          </button>
          <div v-if="expandedFaq === 4" class="mt-4 text-gray-300 border-t border-slate-700 pt-4">
            Our prices are already annual. We don't charge monthly subscriptions, so you get the best price upfront!
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-center">
        <h2 class="text-4xl font-bold mb-6">Start Building Better Code Today</h2>
        <p class="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
          Join hundreds of developers who are already using TestNova to code faster and better.
        </p>
        <div class="flex gap-4 justify-center">
          <router-link 
            to="/login"
            class="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Sign In
          </router-link>
          <router-link 
            to="/register"
            class="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition"
          >
            Create Account
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isProcessing = ref(false);
const expandedFaq = ref(null);

const toggleFaq = (index) => {
  expandedFaq.value = expandedFaq.value === index ? null : index;
};

const handleUpgrade = async (plan) => {
  isProcessing.value = true;
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=pricing');
      return;
    }

    // Initialize Stripe checkout
    const response = await fetch('/api/payment/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        plan: plan,
        duration: '1year',
      }),
    });

    const data = await response.json();
    
    if (data.checkoutUrl) {
      window.location.assign(data.checkoutUrl);
    } else if (data.sessionId) {
      window.location.assign(`https://checkout.stripe.com/c/pay/${data.sessionId}`);
    } else {
      throw new Error('Checkout URL missing from payment response');
    }
  } catch (error) {
    console.error('Upgrade error:', error);
  } finally {
    isProcessing.value = false;
  }
};
</script>
