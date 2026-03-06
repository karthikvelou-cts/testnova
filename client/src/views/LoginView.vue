<template>
  <AuthForm
    title="Welcome Back"
    subtitle="Login to your account and continue"
    :show-name="false"
    button-text="Login"
    footer-text="Don't have an account? "
    footer-link="/register"
    footer-link-text="Sign up"
    :loading="authStore.loading"
    :model-value="form"
    @submit="onSubmit"
  />
</template>

<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import AuthForm from "../components/AuthForm.vue";
import { useToast } from "../composables/useToast";
import { useAuthStore } from "../store/auth";

const authStore = useAuthStore();
const router = useRouter();
const { show } = useToast();

const form = reactive({
  email: "",
  password: "",
});

const onSubmit = async () => {
  try {
    await authStore.login(form);
    show("Login successful", "success");
    router.push({ name: "dashboard" });
  } catch (error) {
    show(error.response?.data?.message || "Login failed", "error");
  }
};
</script>
