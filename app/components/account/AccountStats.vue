<template>
  <section class="mt-6" aria-labelledby="stats-title">
    <h2 id="stats-title" class="headline text-xl">Статистика</h2>
    <div class="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      <div v-for="s in cards" :key="s.label" class="panel panel-sm p-4">
        <p class="muted text-xs">{{ s.label }}</p>
        <p class="headline mt-1 text-2xl tabular-nums">{{ s.value }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AccountStats } from "./types";

const props = defineProps<{ stats: AccountStats }>();

const cards = computed(() => [
  { label: "Раунды", value: props.stats.roundsCompleted },
  { label: "Ответы", value: props.stats.questionsAnswered },
  { label: "Верные", value: props.stats.correctAnswers },
  { label: "Точность", value: `${props.stats.accuracy}%` },
  { label: "Лучшая серия", value: props.stats.bestStreak },
  { label: "Опыт", value: props.stats.totalXp },
]);
</script>
