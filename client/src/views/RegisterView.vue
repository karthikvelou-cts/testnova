<template>
  <AuthForm
    title="Create Account"
    subtitle="Join us and get started"
    :show-name="true"
    button-text="Register"
    footer-text="Already have an account? "
    footer-link="/login"
    footer-link-text="Sign in"
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
