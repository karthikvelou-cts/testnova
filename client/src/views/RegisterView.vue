<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
      <h2 class="mb-5 text-2xl font-bold">Create Account</h2>
      <form class="space-y-4" @submit.prevent="onSubmit">
        <input v-model="form.name" type="text" placeholder="Name" class="w-full rounded-lg border px-3 py-2" />
        <input v-model="form.email" type="email" placeholder="Email" class="w-full rounded-lg border px-3 py-2" />
        <input v-model="form.password" type="password" placeholder="Password" class="w-full rounded-lg border px-3 py-2" />
        <button class="flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white">
          <LoaderSpinner v-if="authStore.loading" />
          <span v-else>Register</span>
        </button>
      </form>
      <p class="mt-4 text-sm">
        Already have an account?
        <RouterLink class="font-semibold text-blue-600" to="/login">Login</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import LoaderSpinner from "../components/LoaderSpinner.vue";
import { useToast } from "../composables/useToast";
import { useAuthStore } from "../store/auth";

const authStore = useAuthStore();
const router = useRouter();
const { show } = useToast();

const form = reactive({
  name: "",
  email: "",
  password: "",
});

const onSubmit = async () => {
  try {
    await authStore.register(form);
    show("Registration successful", "success");
    router.push({ name: "dashboard" });
  } catch (error) {
    show(error.response?.data?.message || "Registration failed", "error");
  }
};
</script>
