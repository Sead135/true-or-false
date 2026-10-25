<template>
  <main class="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-10">
    <header class="mb-5 flex justify-end">
      <AppChrome show-theme show-auth-link show-avatar />
    </header>

    <section class="panel w-full p-8 text-center sm:p-10" aria-labelledby="home-brand">
      <h1 id="home-brand" class="sr-only">Правда или ложь</h1>
      <div class="brand-split hero-in" aria-hidden="true">
        <span class="brand-split__true">Правда</span>
        <span class="brand-split__slash"></span>
        <span class="brand-split__false">Ложь</span>
      </div>

      <p
        class="muted mx-auto mt-6 max-w-[22rem] text-[1.02rem] leading-relaxed hero-in"
        style="animation-delay: 70ms"
      >
        Читай утверждение. Решай — правда это или ложь. Собирай звёзды и открывай уровни.
      </p>

      <nav
        class="mt-8 flex flex-col gap-3 hero-in"
        style="animation-delay: 120ms"
        aria-label="Действия"
      >
        <NuxtLink to="/levels" class="btn btn-primary w-full text-base">
          <AppIcon :icon="Play" size="sm" />
          Играть
        </NuxtLink>
        <div v-if="!pending && !session?.user" class="grid grid-cols-2 gap-3">
          <NuxtLink to="/login" class="btn btn-ghost">
            <AppIcon :icon="LogIn" size="sm" />
            Войти
          </NuxtLink>
          <NuxtLink to="/register" class="btn btn-ghost">Регистрация</NuxtLink>
        </div>
      </nav>
    </section>
  </main>
</template>

<script setup lang="ts">
import { LogIn, Play } from "lucide-vue-next";

usePageSeo({
  title: "Игра «правда или ложь»",
  description: "Свайпай утверждения влево или вправо, собирай звёзды и открывай новые уровни.",
  path: "/",
});

const { session, pending, refresh } = useSession();
await refresh();
</script>
