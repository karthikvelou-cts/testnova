<template>
  <div class="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-screen text-white">
    <!-- Navigation -->
    <nav class="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <img :src="logoUrl" alt="TestNova" class="h-10 w-auto object-contain" />
        <div class="flex gap-4">
          <router-link to="/login" class="px-6 py-2 rounded-lg hover:bg-slate-800 transition">
            Login
          </router-link>
          <router-link to="/register" class="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Sign Up
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div class="space-y-6">
          <h1 class="text-5xl md:text-6xl font-bold leading-tight">
            <span class="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              AI-Powered
            </span>
            <br />
            Chat & Code Generation
          </h1>
          <p class="text-xl text-gray-300">
            Generate code, unit tests, and documentation instantly using state-of-the-art AI models. 
            Perfect for developers who want to work smarter, not harder.
          </p>
          <div class="flex gap-4 pt-4">
            <button 
              @click="handleGuestLogin"
              class="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition"
            >
              Try as Guest
            </button>
            <router-link 
              to="/register"
              class="px-8 py-3 border border-blue-400 rounded-lg font-semibold hover:bg-blue-400/10 transition"
            >
              Get Started Free
            </router-link>
          </div>
          <p class="text-sm text-gray-400">
            ✨ Guest access: 5 free prompts • No credit card needed
          </p>
        </div>
        <div class="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-8 backdrop-blur-sm">
          <div class="space-y-4">
            <div class="bg-slate-800/50 p-4 rounded-lg border border-slate-700 font-mono text-sm">
              <div class="text-cyan-400">$ generate-code</div>
              <div class="text-gray-300 mt-2">Generating Python function...</div>
              <div class="text-green-400 mt-2">✓ Function created in 1.2s</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h2 class="text-4xl font-bold text-center mb-16">Why Choose TestNova?</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="bg-gradient-to-br from-blue-500/10 to-slate-500/10 border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition group">
          <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition">
            <span class="text-2xl">⚡</span>
          </div>
          <h3 class="text-xl font-semibold mb-3">Lightning Fast</h3>
          <p class="text-gray-300">
            Get AI responses in seconds. Optimized models for code generation and testing.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="bg-gradient-to-br from-cyan-500/10 to-slate-500/10 border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-500/40 transition group">
          <div class="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition">
            <span class="text-2xl">🔧</span>
          </div>
          <h3 class="text-xl font-semibold mb-3">Multiple Models</h3>
          <p class="text-gray-300">
            Choose from Mistral, Llama 2, Code Llama, and more. Pick the best for your task.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="bg-gradient-to-br from-teal-500/10 to-slate-500/10 border border-teal-500/20 rounded-2xl p-8 hover:border-teal-500/40 transition group">
          <div class="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-500/30 transition">
            <span class="text-2xl">📚</span>
          </div>
          <h3 class="text-xl font-semibold mb-3">Full History</h3>
          <p class="text-gray-300">
            Save conversations and prompts. Never lose your generated code and documentation.
          </p>
        </div>

        <!-- Feature 4 -->
        <div class="bg-gradient-to-br from-purple-500/10 to-slate-500/10 border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 transition group">
          <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition">
            <span class="text-2xl">🛡️</span>
          </div>
          <h3 class="text-xl font-semibold mb-3">Secure & Private</h3>
          <p class="text-gray-300">
            Enterprise-grade encryption. Your code is never shared or stored publicly.
          </p>
        </div>

        <!-- Feature 5 -->
        <div class="bg-gradient-to-br from-pink-500/10 to-slate-500/10 border border-pink-500/20 rounded-2xl p-8 hover:border-pink-500/40 transition group">
          <div class="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-500/30 transition">
            <span class="text-2xl">🚀</span>
          </div>
          <h3 class="text-xl font-semibold mb-3">Always Learning</h3>
          <p class="text-gray-300">
            Regular model updates with latest AI capabilities and bug fixes.
          </p>
        </div>

        <!-- Feature 6 -->
        <div class="bg-gradient-to-br from-green-500/10 to-slate-500/10 border border-green-500/20 rounded-2xl p-8 hover:border-green-500/40 transition group">
          <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition">
            <span class="text-2xl">💰</span>
          </div>
          <h3 class="text-xl font-semibold mb-3">Affordable</h3>
          <p class="text-gray-300">
            Free tier with 5 prompts daily. Premium plans starting at just $5/year.
          </p>
        </div>
      </div>
    </section>

    <!-- Use Cases Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h2 class="text-4xl font-bold text-center mb-16">Perfect For</h2>
      <div class="grid md:grid-cols-2 gap-8">
        <div class="space-y-4">
          <h3 class="text-2xl font-semibold flex items-center gap-3">
            <span class="text-blue-400">💻</span>
            Code Generation
          </h3>
          <ul class="space-y-2 text-gray-300">
            <li>✓ Generate boilerplate code instantly</li>
            <li>✓ Get function implementations for any language</li>
            <li>✓ Optimize existing code for performance</li>
            <li>✓ Refactor legacy code safely</li>
          </ul>
        </div>
        <div class="space-y-4">
          <h3 class="text-2xl font-semibold flex items-center gap-3">
            <span class="text-cyan-400">🧪</span>
            Unit Test Generation
          </h3>
          <ul class="space-y-2 text-gray-300">
            <li>✓ Auto-generate unit tests for functions</li>
            <li>✓ Increase code coverage faster</li>
            <li>✓ Create edge case tests automatically</li>
            <li>✓ Mock objects and fixtures in seconds</li>
          </ul>
        </div>
        <div class="space-y-4">
          <h3 class="text-2xl font-semibold flex items-center gap-3">
            <span class="text-teal-400">📖</span>
            Documentation
          </h3>
          <ul class="space-y-2 text-gray-300">
            <li>✓ Generate API documentation</li>
            <li>✓ Create README files automatically</li>
            <li>✓ Document complex algorithms</li>
            <li>✓ Generate code comments</li>
          </ul>
        </div>
        <div class="space-y-4">
          <h3 class="text-2xl font-semibold flex items-center gap-3">
            <span class="text-purple-400">🔍</span>
            Code Review & Analysis
          </h3>
          <ul class="space-y-2 text-gray-300">
            <li>✓ Get instant code review suggestions</li>
            <li>✓ Find security vulnerabilities</li>
            <li>✓ Identify performance bottlenecks</li>
            <li>✓ Best practices recommendations</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Pricing Preview Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h2 class="text-4xl font-bold text-center mb-16">Simple Pricing</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Free Plan -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:border-slate-600 transition">
          <h3 class="text-2xl font-bold mb-2">Free</h3>
          <div class="text-3xl font-bold mb-6">$0<span class="text-lg text-gray-400">/year</span></div>
          <ul class="space-y-3 text-gray-300 mb-8">
            <li>✓ 5 prompts daily</li>
            <li>✓ Basic models only</li>
            <li>✓ Chat history (7 days)</li>
            <li>✗ Code generation</li>
            <li>✗ Unit test generation</li>
            <li>✗ Priority support</li>
          </ul>
          <button class="w-full px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
            Get Started
          </button>
        </div>

        <!-- Super Plan -->
        <div class="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/40 rounded-2xl p-8 hover:border-blue-500/60 transition ring-2 ring-blue-500/20">
          <div class="flex items-center gap-2 mb-4">
            <h3 class="text-2xl font-bold">Super</h3>
            <span class="text-xs bg-blue-500/30 px-3 py-1 rounded-full text-blue-200">POPULAR</span>
          </div>
          <div class="text-3xl font-bold mb-6">$5<span class="text-lg text-gray-400">/year</span></div>
          <ul class="space-y-3 text-gray-300 mb-8">
            <li>✓ Unlimited prompts</li>
            <li>✓ All basic models</li>
            <li>✓ Chat history (90 days)</li>
            <li>✓ Code generation</li>
            <li>✗ Unit test generation</li>
            <li>✗ Priority support</li>
          </ul>
          <button class="w-full px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition font-semibold">
            Upgrade Now
          </button>
        </div>

        <!-- Premium Plan -->
        <div class="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/40 rounded-2xl p-8 hover:border-purple-500/60 transition ring-2 ring-purple-500/20">
          <h3 class="text-2xl font-bold mb-2">Premium</h3>
          <div class="text-3xl font-bold mb-6">$10<span class="text-lg text-gray-400">/year</span></div>
          <ul class="space-y-3 text-gray-300 mb-8">
            <li>✓ Unlimited everything</li>
            <li>✓ All advanced models</li>
            <li>✓ Full chat history</li>
            <li>✓ Code generation</li>
            <li>✓ Unit test generation</li>
            <li>✓ Priority support</li>
          </ul>
          <button class="w-full px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition font-semibold">
            Upgrade Now
          </button>
        </div>
      </div>
      <div class="text-center mt-12">
        <router-link 
          to="/pricing"
          class="text-blue-400 hover:text-blue-300 font-semibold flex items-center justify-center gap-2"
        >
          See detailed pricing and features
          <span>→</span>
        </router-link>
      </div>
    </section>

    <!-- Models Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h2 class="text-4xl font-bold text-center mb-16">Available AI Models</h2>
      <div class="grid md:grid-cols-2 gap-8">
        <div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
          <h3 class="text-xl font-bold mb-2 flex items-center gap-2">
            <span class="text-blue-400">⚡</span>
            Code Specialists
          </h3>
          <p class="text-gray-300 mb-4">Optimized for code generation and refactoring</p>
          <ul class="space-y-2 text-sm text-gray-400">
            <li>• <span class="font-semibold text-white">Mistral</span> - Fast & accurate for all languages</li>
            <li>• <span class="font-semibold text-white">Code Llama</span> - Specialized for programming</li>
            <li>• <span class="font-semibold text-white">Deepseek Coder</span> - Advanced code understanding</li>
          </ul>
        </div>
        <div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
          <h3 class="text-xl font-bold mb-2 flex items-center gap-2">
            <span class="text-cyan-400">🧪</span>
            Test & Documentation
          </h3>
          <p class="text-gray-300 mb-4">Optimized for testing and documentation generation</p>
          <ul class="space-y-2 text-sm text-gray-400">
            <li>• <span class="font-semibold text-white">Llama 2</span> - Comprehensive analysis</li>
            <li>• <span class="font-semibold text-white">Neural Chat</span> - Detailed explanations</li>
            <li>• <span class="font-semibold text-white">Phind</span> - Expert code reviews</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-center">
        <h2 class="text-4xl font-bold mb-6">Ready to Code Smarter?</h2>
        <p class="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of developers using TestNova to generate code, tests, and documentation 10x faster.
        </p>
        <div class="flex gap-4 justify-center">
          <button 
            @click="handleGuestLogin"
            class="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Try Free Now
          </button>
          <router-link 
            to="/pricing"
            class="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition"
          >
            View Pricing
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-slate-800 mt-20 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 class="font-bold mb-4">Product</h4>
            <ul class="space-y-2 text-gray-400 text-sm">
              <li><a href="#" class="hover:text-white transition">Features</a></li>
              <li><a href="#" class="hover:text-white transition">Pricing</a></li>
              <li><a href="#" class="hover:text-white transition">Models</a></li>
              <li><a href="#" class="hover:text-white transition">Updates</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4">Company</h4>
            <ul class="space-y-2 text-gray-400 text-sm">
              <li><a href="#" class="hover:text-white transition">About</a></li>
              <li><a href="#" class="hover:text-white transition">Blog</a></li>
              <li><a href="#" class="hover:text-white transition">Careers</a></li>
              <li><a href="#" class="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4">Legal</h4>
            <ul class="space-y-2 text-gray-400 text-sm">
              <li><a href="#" class="hover:text-white transition">Privacy</a></li>
              <li><a href="#" class="hover:text-white transition">Terms</a></li>
              <li><a href="#" class="hover:text-white transition">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4">Social</h4>
            <ul class="space-y-2 text-gray-400 text-sm">
              <li><a href="#" class="hover:text-white transition">Twitter</a></li>
              <li><a href="#" class="hover:text-white transition">GitHub</a></li>
              <li><a href="#" class="hover:text-white transition">Discord</a></li>
              <li><a href="#" class="hover:text-white transition">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-slate-800 pt-8 text-center text-gray-400 text-sm">
          <p>© 2026 TestNova. All rights reserved. Powered by AI.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import logoUrl from '../assets/testnova-logo.png';

const router = useRouter();
const authStore = useAuthStore();

const handleGuestLogin = async () => {
  try {
    // Create guest session
    const guestToken = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guestToken', guestToken);
    localStorage.setItem('isGuest', 'true');
    localStorage.setItem('guestPromptsUsed', '0');
    router.push('/dashboard');
  } catch (error) {
    console.error('Guest login error:', error);
  }
};
</script>

<style scoped>
@keyframes gradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}
</style>
