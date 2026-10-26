<template>
  <section class="mt-8" aria-labelledby="ach-title">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <h2 id="ach-title" class="headline text-xl">Достижения</h2>
      <div class="flex gap-1" role="group" aria-label="Фильтр достижений">
        <button
          v-for="f in filters"
          :key="f.id"
          type="button"
          class="filter-btn"
          :class="{ 'filter-btn--on': filter === f.id }"
          :aria-pressed="filter === f.id"
          @click="filter = f.id"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <p v-if="!filtered.length" class="panel panel-sm mt-3 p-6 text-center muted text-sm">
      {{ emptyMessage }}
    </p>
    <ul v-else class="mt-3 grid list-none gap-2.5 p-0 sm:grid-cols-2">
      <li
        v-for="a in filtered"
        :key="a.id"
        class="ach-card panel panel-sm"
        :class="{ 'ach-card--locked': !a.unlocked }"
      >
        <div class="flex gap-3 p-4">
          <span class="ach-icon" aria-hidden="true">{{ a.icon }}</span>
          <div class="min-w-0 flex-1">
            <p class="font-semibold tracking-tight">{{ a.title }}</p>
            <p class="muted mt-0.5 text-sm leading-snug">{{ a.description }}</p>
            <p v-if="a.unlocked && a.unlockedAt" class="muted mt-2 text-xs">
              {{ formatDate(a.unlockedAt) }}
            </p>
            <template v-else>
              <div class="mt-2 flex justify-between text-xs muted">
                <span>{{ a.current }} / {{ a.target }}</span>
              </div>
              <div class="bar mt-1">
                <div
                  class="bar-fill bar-fill--muted"
                  :style="{ width: `${Math.min(100, (a.current / a.target) * 100)}%` }"
                />
              </div>
            </template>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { AccountAchievementItem } from "./types";

const props = defineProps<{ items: AccountAchievementItem[] }>();

type Filter = "all" | "unlocked" | "locked";
const filter = ref<Filter>("all");
const filters = [
  { id: "all" as const, label: "Все" },
  { id: "unlocked" as const, label: "Полученные" },
  { id: "locked" as const, label: "Не получены" },
];

const filtered = computed(() => {
  if (filter.value === "unlocked") {
    return props.items.filter((a) => a.unlocked);
  }
  if (filter.value === "locked") {
    return props.items.filter((a) => !a.unlocked);
  }
  return props.items;
});

const emptyMessage = computed(() => {
  if (filter.value === "unlocked") {
    return "Пока нет открытых достижений — сыграй раунд.";
  }
  if (filter.value === "locked") {
    return "Все достижения уже получены.";
  }
  return "Достижений пока нет.";
});

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
</script>

<style scoped>
.filter-btn {
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--muted);
  background: transparent;
  border: 1px solid transparent;
}

.filter-btn--on {
  color: var(--ink);
  background: var(--ghost-bg);
  border-color: var(--ghost-border);
}

.ach-card--locked {
  opacity: 0.55;
  filter: grayscale(0.35);
}

.ach-icon {
  display: inline-flex;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--accent-soft);
  font-size: 1.25rem;
}

.ach-card--locked .ach-icon {
  background: color-mix(in srgb, var(--ink) 8%, transparent);
}
</style>
