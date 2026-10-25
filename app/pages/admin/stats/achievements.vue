<template>
  <div class="flex flex-col gap-6 p-4 sm:p-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Ачивки</h1>
      <AdminPeriodPicker v-model="preset" v-model:from="from" v-model:to="to" />
    </div>

    <UCard :ui="{ root: 'overflow-visible', body: 'p-0! overflow-hidden rounded-b-[inherit]' }">
      <template #header>
        <div>
          <p class="text-muted mb-1 text-xs uppercase">Выдано за период</p>
          <p class="text-highlighted text-3xl font-semibold tabular-nums">
            {{ data?.total ?? "…" }}
          </p>
        </div>
      </template>
      <div v-if="!perDayChart.length" class="text-muted p-4 text-sm">Нет данных</div>
      <UChart
        v-else
        type="area"
        curve="monotone"
        :data="perDayChart"
        index="date"
        :categories="[{ key: 'count', label: 'Ачивки' }]"
        :aspect-ratio="2.8"
        :initial-width="960"
        class="-my-px"
        aria-label="Ачивки по дням"
      />
    </UCard>

    <UCard :ui="{ root: 'overflow-visible', body: 'p-0! overflow-hidden rounded-b-[inherit]' }">
      <template #header>
        <p class="font-semibold">По ачивкам</p>
      </template>
      <div v-if="!byAchChart.length" class="text-muted p-4 text-sm">Нет данных</div>
      <UChart
        v-else
        type="bar"
        :data="byAchChart"
        index="achievementId"
        :categories="[{ key: 'count', label: 'Выдано' }]"
        :aspect-ratio="2.2"
        :initial-width="960"
        class="-my-px"
        aria-label="Ачивки по типу"
      />
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "admin" });

const preset = ref("7d");
const from = ref("");
const to = ref("");

const query = computed(() => {
  if (preset.value === "custom") {
    return { preset: "custom", from: from.value, to: to.value };
  }
  return { preset: preset.value };
});

type AchStats = {
  total: number;
  perDay: { date: string; count: number }[];
  byAchievement: { achievementId: string; count: number }[];
};

const { data, refresh } = await useAsyncData(
  "admin-stats-achievements",
  () => $fetch<AchStats>("/api/admin/stats/achievements", { query: query.value }),
  { watch: [query] },
);

watch(query, () => refresh());

const perDayChart = computed(() => data.value?.perDay ?? []);
const byAchChart = computed(() => data.value?.byAchievement ?? []);

useSeoMeta({ title: "Статистика ачивок" });
</script>
