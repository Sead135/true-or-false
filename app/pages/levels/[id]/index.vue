<template>
  <main class="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-12">
    <p v-if="pending && !level" class="muted" role="status">Загрузка…</p>
    <article v-else-if="level" class="panel p-8 sm:p-10">
      <p class="kicker">Уровень {{ level.order }}</p>
      <h1 class="headline mt-3 text-3xl sm:text-4xl">{{ level.title }}</h1>
      <p class="muted mt-5 text-[1.05rem] leading-relaxed">{{ level.introMessage }}</p>
      <nav class="mt-9 flex flex-col gap-3" aria-label="Старт уровня">
        <NuxtLink :to="`/levels/${level.id}/play`" class="btn btn-primary w-full">
          <AppIcon :icon="Play" size="sm" />
          Начать
        </NuxtLink>
        <NuxtLink to="/levels" class="btn btn-ghost w-full">
          <AppIcon :icon="ArrowLeft" size="sm" />
          К уровням
        </NuxtLink>
      </nav>
    </article>
  </main>
</template>

<script setup lang="ts">
import { ArrowLeft, Play } from "lucide-vue-next";

const route = useRoute();
const id = computed(() => routeParam(route.params.id));

const { data: level, pending } = await useCachedAsyncData(`level-${id.value}`, () =>
  $fetch<{
    id: string;
    title: string;
    order: number;
    introMessage: string;
  }>(`/api/levels/${id.value}`),
);

usePageSeo(() => ({
  title: level.value?.title || "Уровень",
  description: level.value?.introMessage || "Вступление к уровню игры «правда или ложь».",
  path: `/levels/${id.value}`,
}));
</script>
