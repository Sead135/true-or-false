<template>
  <main class="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
    <header class="mb-4">
      <BackButton to="/" label="Назад" />
    </header>
    <section class="panel p-8 sm:p-9" aria-labelledby="register-title">
      <div class="flex items-center gap-3">
        <span class="auth-mark" aria-hidden="true">
          <AppIcon :icon="UserPlus" size="md" :animate="false" />
        </span>
        <div>
          <h1 id="register-title" class="headline text-3xl">Регистрация</h1>
          <p class="muted mt-1 text-sm">Сохрани прогресс и играй с любого устройства.</p>
        </div>
      </div>
      <div class="mt-7">
        <AuthForm mode="register" @success="onSuccess" />
      </div>
      <p class="muted mt-5 text-sm">
        Уже есть аккаунт?
        <NuxtLink to="/login" class="font-semibold text-[var(--accent)]">Вход</NuxtLink>
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { UserPlus } from "lucide-vue-next";

usePageSeo({
  title: "Регистрация",
  description: "Создай аккаунт и сохрани прогресс игры «правда или ложь».",
  path: "/register",
});

async function onSuccess() {
  await navigateTo("/levels");
}
</script>

<style scoped></style>
