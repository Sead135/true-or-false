<template>
  <form class="flex flex-col gap-4" @submit.prevent="submit">
    <label class="block text-left text-sm font-medium">
      Email
      <input v-model="email" type="email" required class="field mt-1.5" autocomplete="email" />
    </label>
    <label v-if="mode === 'register'" class="block text-left text-sm font-medium">
      Имя
      <input v-model="name" type="text" required class="field mt-1.5" autocomplete="name" />
    </label>
    <label class="block text-left text-sm font-medium">
      Пароль
      <input
        v-model="password"
        type="password"
        required
        minlength="8"
        class="field mt-1.5"
        autocomplete="current-password"
      />
    </label>
    <p v-if="error" class="text-sm text-[var(--danger)]" role="alert">{{ error }}</p>
    <button type="submit" class="btn btn-primary mt-1 w-full" :disabled="loading">
      <AppIcon
        v-if="loading"
        :icon="LoaderCircle"
        size="sm"
        class="animate-spin"
        :animate="false"
      />
      {{ submitLabel }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { LoaderCircle } from "lucide-vue-next";

const props = defineProps<{ mode: "login" | "register" }>();
const emit = defineEmits<{ success: [] }>();

const { client, session, syncGuestProgress } = useSession();

const email = ref("");
const password = ref("");
const name = ref("");
const error = ref("");
const loading = ref(false);

const submitLabel = computed(() => {
  if (loading.value) {
    return "Секунду…";
  }
  return props.mode === "login" ? "Войти" : "Зарегистрироваться";
});

async function submit() {
  loading.value = true;
  error.value = "";
  try {
    if (props.mode === "login") {
      const res = await client.signIn.email({
        email: email.value.trim(),
        password: password.value,
      });
      if (res.error) {
        throw new Error(res.error.message || "Неверный email или пароль");
      }
      if (res.data) {
        session.value = res.data;
      }
    } else {
      const res = await client.signUp.email({
        email: email.value.trim(),
        password: password.value,
        name: name.value.trim(),
      });
      if (res.error) {
        throw new Error(res.error.message || "Не удалось зарегистрироваться");
      }
      if (res.data) {
        session.value = res.data;
      }
    }

    emit("success");
    syncGuestProgress();
  } catch (e: unknown) {
    const err = (e && typeof e === "object" ? e : {}) as {
      status?: number;
      statusCode?: number;
      message?: string;
      data?: { message?: string };
      response?: { status?: number };
    };
    const status = err.status || err.statusCode || err.response?.status;
    const msg = err.message || err.data?.message || (typeof e === "string" ? e : "");
    if (status === 429 || /too many|rate limit/i.test(String(msg))) {
      error.value = "Слишком много попыток. Подождите несколько минут и попробуйте снова.";
    } else {
      error.value = msg || "Что-то пошло не так";
    }
    console.error("auth submit failed", e);
  } finally {
    loading.value = false;
  }
}
</script>
