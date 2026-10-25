<template>
  <main class="mx-auto max-w-2xl px-5 py-10">
    <header class="mb-8">
      <BackButton to="/" label="На главную" />
      <h1 class="headline mt-3 text-4xl sm:text-[2.75rem]">Уровни</h1>
      <p class="muted mt-2 max-w-sm text-sm leading-relaxed">
        Иди по порядку. Одна звезда открывает следующий.
      </p>
    </header>

    <p v-if="pending" class="muted" role="status">Загрузка…</p>
    <div v-else-if="error" class="panel panel-sm p-6 text-[var(--danger)]" role="alert">
      Не удалось загрузить уровни. Обнови страницу.
    </div>
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
import { isLevelUnlocked } from "../../utils/unlock";

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

const { data, pending, error } = await useAsyncData(
  () => `levels-${session.value?.user?.id || "guest"}`,
  () => $fetch<ApiLevel[]>("/api/levels"),
  { watch: [() => session.value?.user?.id] },
);

const guestProgress = ref<Awaited<ReturnType<typeof guest.list>>>([]);
onMounted(async () => {
  guestProgress.value = await guest.list();
});

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
