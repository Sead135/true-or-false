<template>
  <NuxtLink
    v-if="unlocked"
    :to="`/levels/${id}`"
    class="level-row panel panel-sm group relative block px-5 py-4 text-inherit no-underline transition duration-200 hover:-translate-y-px hover:shadow-[var(--shadow-lg)]"
  >
    <div class="flex items-center gap-4">
      <span class="level-num" aria-hidden="true">{{ String(order).padStart(2, "0") }}</span>
      <div class="min-w-0 flex-1">
        <h2 class="headline truncate text-xl leading-tight">{{ title }}</h2>
        <p class="muted mt-1 text-sm">{{ stars > 0 ? "Лучший результат" : "Доступен" }}</p>
      </div>
      <StarsDisplay :stars="stars" compact />
      <AppIcon :icon="ChevronRight" size="sm" class="muted opacity-50" :animate="false" />
    </div>
  </NuxtLink>
  <div
    v-else
    class="level-row panel panel-sm relative block px-5 py-4 opacity-50"
    aria-disabled="true"
  >
    <div class="flex items-center gap-4">
      <span class="level-num locked" aria-hidden="true">{{ String(order).padStart(2, "0") }}</span>
      <div class="min-w-0 flex-1">
        <h2 class="headline truncate text-xl leading-tight">{{ title }}</h2>
        <p class="muted mt-1 text-sm">Сначала пройди предыдущий</p>
      </div>
      <span class="lock-mark" aria-hidden="true">
        <AppIcon :icon="Lock" size="sm" :animate="false" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Lock } from "lucide-vue-next";

defineProps<{
  id: string;
  title: string;
  order: number;
  unlocked: boolean;
  stars: number;
}>();
</script>

<style scoped>
.level-num {
  flex-shrink: 0;
  width: 2.4rem;
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: color-mix(in srgb, var(--ink) 32%, transparent);
  font-variant-numeric: tabular-nums;
}

.level-num.locked {
  color: color-mix(in srgb, var(--ink) 18%, transparent);
}

.lock-mark {
  display: inline-flex;
  color: var(--muted);
}

.level-row {
  color: inherit;
  text-decoration: none;
}

.level-row:focus-visible {
  outline: none;
  box-shadow: var(--focus);
}
</style>
