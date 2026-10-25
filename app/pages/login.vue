<template>
  <main class="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
    <header class="mb-4">
      <BackButton to="/" label="Назад" />
    </header>
    <section class="panel p-8 sm:p-9" aria-labelledby="login-title">
      <div class="flex items-center gap-3">
        <span class="auth-mark" aria-hidden="true">
          <AppIcon :icon="LogIn" size="md" :animate="false" />
        </span>
        <div>
          <h1 id="login-title" class="headline text-3xl">Вход</h1>
          <p class="muted mt-1 text-sm">Прогресс с устройства подтянется после входа.</p>
        </div>
      </div>
      <div class="mt-7">
        <AuthForm mode="login" @success="onSuccess" />
      </div>
      <p class="muted mt-5 text-sm">
        Нет аккаунта?
        <NuxtLink to="/register" class="font-semibold text-[var(--accent)]">Регистрация</NuxtLink>
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { LogIn } from "lucide-vue-next";

usePageSeo({
  title: "Вход",
  description: "Войди в аккаунт, чтобы сохранить прогресс игры «правда или ложь».",
  path: "/login",
});

async function onSuccess() {
  await navigateTo("/levels");
}
</script>

<style scoped></style>
