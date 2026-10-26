<template>
  <main class="mx-auto max-w-2xl px-5 py-10">
    <header class="mb-8">
      <BackButton to="/" label="На главную" />
      <h1 class="headline mt-3 text-4xl sm:text-[2.75rem]">Уровни</h1>
      <p class="muted mt-2 max-w-sm text-sm leading-relaxed">
        Иди по порядку. Одна звезда открывает следующий.
      </p>
    </header>

    <div v-if="error && !data" class="panel panel-sm p-6 text-[var(--danger)]" role="alert">
      Не удалось загрузить уровни. Обнови страницу.
    </div>

    <ol v-else-if="!listReady" class="grid list-none gap-2.5 p-0 sm:gap-3" aria-busy="true">
      <li v-for="i in 5" :key="i" class="level-skel panel panel-sm px-5 py-4">
        <div class="flex items-center gap-4">
          <span class="level-skel__num" />
          <div class="min-w-0 flex-1 space-y-2">
            <span class="level-skel__line level-skel__line--title" />
            <span class="level-skel__line level-skel__line--sub" />
          </div>
          <span class="level-skel__stars" />
        </div>
      </li>
      <span class="sr-only">Загрузка уровней…</span>
    </ol>

    <div v-else-if="!displayLevels.length" class="panel panel-sm p-8 text-center">
      <AppIcon :icon="Inbox" size="lg" class="mx-auto text-[var(--muted)]" :animate="false" />
      <p class="headline mt-3 text-2xl">Пока пусто</p>
      <p class="muted mt-2 text-sm">Уровней ещё нет — загляни позже.</p>
    </div>

    <ol v-else class="grid list-none gap-2.5 p-0 sm:gap-3">
      <li v-for="level in displayLevels" :key="level.id">
        <LevelCard
          :id="level.id"
          :title="level.title"
          :order="level.order"
          :unlocked="level.unlocked"
          :stars="level.stars"
        />
      </li>
    </ol>
  </main>
</template>

<script setup lang="ts">
import { Inbox } from "lucide-vue-next";
import type { ProgressRow } from "../../../lib/game/mergeProgress";
import { isLevelUnlocked } from "../../../lib/game/unlock";

usePageSeo({
  title: "Уровни",
  description: "Список уровней игры «правда или ложь». Открывай по порядку и улучшай звёзды.",
  path: "/levels",
});

type ApiLevel = {
  id: string;
  title: string;
  order: number;
  stars?: number;
  unlocked?: boolean;
};

const { session, refresh } = useSession();
const guest = useGuestProgress();
await refresh();

const { data, error } = await useCachedAsyncData(
  () => `levels-${session.value?.user?.id || "guest"}`,
  () => $fetch<ApiLevel[]>("/api/levels"),
  { watch: [() => session.value?.user?.id] },
);

const guestProgress = ref<ProgressRow[]>([]);
const progressReady = ref(false);

if (session.value?.user) {
  progressReady.value = true;
} else if (import.meta.client) {
  guestProgress.value = await guest.list();
  progressReady.value = true;
} else {
  onMounted(async () => {
    guestProgress.value = await guest.list();
    progressReady.value = true;
  });
}

const authDataReady = computed(() => {
  if (!session.value?.user) {
    return true;
  }
  const levels = data.value;
  if (!levels) {
    return false;
  }
  if (!levels.length) {
    return true;
  }
  return "stars" in levels[0]! || "unlocked" in levels[0]!;
});

const listReady = computed(
  () => progressReady.value && Array.isArray(data.value) && authDataReady.value,
);

const displayLevels = computed(() => {
  const levels = data.value || [];
  if (session.value?.user) {
    return levels.map((l) => ({
      ...l,
      unlocked: l.unlocked ?? l.order === 1,
      stars: l.stars ?? 0,
    }));
  }
  const byLevel = new Map(guestProgress.value.map((p) => [p.levelId, p]));
  const progressByOrder = new Map<number, { stars: number }>();
  for (const l of levels) {
    const p = byLevel.get(l.id);
    if (p) progressByOrder.set(l.order, { stars: p.stars });
  }
  return levels.map((l) => ({
    ...l,
    unlocked: isLevelUnlocked(l.order, progressByOrder),
    stars: byLevel.get(l.id)?.stars ?? 0,
  }));
});
</script>

<style scoped>
.level-skel__num,
.level-skel__line,
.level-skel__stars {
  display: block;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--ink) 8%, transparent);
  animation: level-skel-pulse 1.2s ease-in-out infinite;
}

.level-skel__num {
  width: 2.4rem;
  height: 1.35rem;
  flex-shrink: 0;
}

.level-skel__line--title {
  width: 55%;
  height: 1.1rem;
}

.level-skel__line--sub {
  width: 35%;
  height: 0.75rem;
}

.level-skel__stars {
  width: 3.5rem;
  height: 1rem;
  flex-shrink: 0;
}

@keyframes level-skel-pulse {
  0%,
  100% {
    opacity: 0.55;
  }

  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .level-skel__num,
  .level-skel__line,
  .level-skel__stars {
    animation: none;
  }
}
</style>
