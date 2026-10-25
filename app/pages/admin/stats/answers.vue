<template>
  <div class="flex flex-col gap-6 p-4 sm:p-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Ответы</h1>
      <AdminPeriodPicker v-model="preset" v-model:from="from" v-model:to="to" />
    </div>

    <UCard :ui="{ root: 'overflow-visible', body: 'p-0! overflow-hidden rounded-b-[inherit]' }">
      <template #header>
        <div>
          <p class="text-muted mb-1 text-xs uppercase">Всего за период</p>
          <p class="text-highlighted text-3xl font-semibold tabular-nums">
            {{ data?.total ?? "…" }}
          </p>
        </div>
      </template>
      <div v-if="!chartData.length" class="text-muted p-4 text-sm">Нет данных</div>
      <UChart
        v-else
        type="area"
        curve="monotone"
        :data="chartData"
        index="date"
        :categories="[{ key: 'count', label: 'Ответы' }]"
        :aspect-ratio="2.8"
        :initial-width="960"
        class="-my-px"
        aria-label="Ответы по дням"
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

type AnswersStats = {
  total: number;
  perDay: { date: string; count: number }[];
};

const { data, refresh } = await useAsyncData(
  "admin-stats-answers",
  () => $fetch<AnswersStats>("/api/admin/stats/answers", { query: query.value }),
  { watch: [query] },
);

watch(query, () => refresh());

const chartData = computed(() => data.value?.perDay ?? []);

useSeoMeta({ title: "Статистика ответов" });
</script>
