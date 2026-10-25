<template>
  <div class="flex flex-col gap-6 p-4 sm:p-6">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <UPageCard
        title="Пользователи"
        :description="String(overview?.usersTotal ?? '…')"
        icon="i-lucide-users"
      />
      <UPageCard title="Вопросы" :description="questionsLabel" icon="i-lucide-help-circle" />
      <NuxtLink to="/admin/stats/answers" class="admin-clickable block cursor-pointer">
        <UPageCard
          title="Ответы (7д)"
          :description="String(overview?.answersInPeriod ?? '…')"
          icon="i-lucide-mouse-pointer-click"
          class="transition hover:ring-2 hover:ring-primary"
        />
      </NuxtLink>
      <NuxtLink to="/admin/stats/achievements" class="admin-clickable block cursor-pointer">
        <UPageCard
          title="Ачивки (7д)"
          :description="String(overview?.achievementsInPeriod ?? '…')"
          icon="i-lucide-trophy"
          class="transition hover:ring-2 hover:ring-primary"
        />
      </NuxtLink>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <UCard :ui="{ root: 'overflow-visible', body: 'p-0! overflow-hidden rounded-b-[inherit]' }">
        <template #header>
          <div>
            <p class="text-muted mb-1 text-xs uppercase">Ответы по дням</p>
            <p class="text-highlighted text-2xl font-semibold tabular-nums">
              {{ overview?.answersInPeriod ?? "…" }}
            </p>
          </div>
        </template>
        <div v-if="!answersChart.length" class="text-muted p-4 text-sm">Нет данных</div>
        <UChart
          v-else
          type="area"
          curve="monotone"
          :data="answersChart"
          index="date"
          :categories="[{ key: 'count', label: 'Ответы' }]"
          :aspect-ratio="2.4"
          :initial-width="560"
          class="-my-px"
          aria-label="Ответы по дням"
        />
      </UCard>

      <UCard :ui="{ root: 'overflow-visible', body: 'p-0! overflow-hidden rounded-b-[inherit]' }">
        <template #header>
          <div>
            <p class="text-muted mb-1 text-xs uppercase">Топ уровней</p>
            <p class="text-highlighted text-2xl font-semibold tabular-nums">
              {{ topLevelsTotal }}
            </p>
          </div>
        </template>
        <div v-if="!levelsChart.length" class="text-muted p-4 text-sm">Нет прохождений</div>
        <UChart
          v-else
          type="bar"
          :data="levelsChart"
          index="title"
          :categories="[{ key: 'completions', label: 'Прохождения' }]"
          :aspect-ratio="2.4"
          :initial-width="560"
          class="-my-px"
          aria-label="Топ уровней"
        />
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "admin" });

type Overview = {
  usersTotal: number;
  questionsTotal: number;
  questionsHidden: number;
  answersInPeriod: number;
  achievementsInPeriod: number;
  answersPerDay: { date: string; count: number }[];
  topLevels: { levelId: string; title: string; completions: number }[];
};

const { data: overview } = await useAsyncData("admin-overview", () =>
  $fetch<Overview>("/api/admin/stats/overview", { query: { preset: "7d" } }),
);

const questionsLabel = computed(() => {
  if (!overview.value) {
    return "…";
  }
  const { questionsTotal, questionsHidden } = overview.value;
  if (!questionsHidden) {
    return String(questionsTotal);
  }
  return `${questionsTotal} (скрыто ${questionsHidden})`;
});

const answersChart = computed(() => overview.value?.answersPerDay ?? []);

const levelsChart = computed(() => {
  return (
    overview.value?.topLevels.map((l) => ({
      title: l.title.length > 18 ? `${l.title.slice(0, 16)}…` : l.title,
      completions: l.completions,
    })) ?? []
  );
});

const topLevelsTotal = computed(() => levelsChart.value.reduce((sum, l) => sum + l.completions, 0));

useSeoMeta({ title: "Админка" });
</script>
