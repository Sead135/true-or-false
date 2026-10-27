<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="open"
        class="sheet-scrim fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-5"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="scoring ? 'finish-scoring-title' : 'finish-result-title'"
        :aria-busy="scoring"
      >
        <div
          class="sheet-panel flex h-full w-full flex-col justify-center overflow-y-auto overscroll-contain p-6 text-center sm:h-auto sm:max-w-[22rem] sm:p-7"
        >
          <template v-if="scoring">
            <div class="finish-spinner mx-auto" aria-hidden="true">
              <AppIcon :icon="LoaderCircle" size="lg" class="animate-spin" :animate="false" />
            </div>
            <h2 id="finish-scoring-title" class="headline mt-4 text-[1.4rem]">Считаем ответы</h2>
            <p class="muted mt-3 text-[15px] leading-relaxed">Проверяем ваш раунд на сервере…</p>
          </template>

          <template v-else-if="error">
            <div class="finish-badge finish-badge--muted mx-auto" aria-hidden="true">
              <AppIcon :icon="Frown" size="lg" :animate="false" />
            </div>
            <h2 id="finish-result-title" class="headline mt-4 text-[1.4rem]">Не вышло</h2>
            <p class="muted mt-3 text-[15px] leading-relaxed">
              Не удалось сохранить результат. Попробуйте ещё раз.
            </p>
            <button class="btn btn-ghost mt-6 w-full" type="button" @click="$emit('retry')">
              Повторить
            </button>
          </template>

          <template v-else>
            <div class="finish-badge mx-auto" :class="badgeClass" aria-hidden="true">
              <AppIcon :icon="badgeIcon" size="xl" :animate="false" />
            </div>
            <p class="kicker mt-4">Раунд окончен</p>
            <h2 id="finish-result-title" class="headline mt-2 text-[1.75rem] sm:text-[2rem]">
              {{ headline }}
            </h2>
            <p class="muted mt-3 text-lg tabular-nums">
              {{ correct }} из {{ total }}
              <span v-if="total > 0">· {{ accuracy }}%</span>
            </p>
            <div class="mt-5 flex justify-center">
              <StarsDisplay :stars="stars" />
            </div>
            <nav class="mt-7 flex flex-col gap-3" aria-label="После результата">
              <NuxtLink
                v-if="showNext"
                :to="`/levels/${nextLevelId}/play`"
                class="btn btn-primary w-full"
              >
                Следующий уровень
                <AppIcon :icon="ArrowRight" size="sm" />
              </NuxtLink>
              <div class="grid grid-cols-2 gap-3">
                <button class="btn btn-ghost w-full" type="button" @click="$emit('replay')">
                  <AppIcon :icon="RotateCcw" size="sm" />
                  Повторить
                </button>
                <NuxtLink to="/levels" class="btn btn-ghost w-full">Уровни</NuxtLink>
              </div>
            </nav>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  ArrowRight,
  Frown,
  LoaderCircle,
  PartyPopper,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-vue-next";
import type { Component } from "vue";

const props = defineProps<{
  open: boolean;
  scoring: boolean;
  error?: boolean;
  correct: number;
  total: number;
  stars: number;
  nextLevelId?: string | null;
}>();

defineEmits<{ retry: []; replay: [] }>();

const showNext = computed(() => props.stars >= 1 && !!props.nextLevelId);

const accuracy = computed(() =>
  props.total > 0 ? Math.round((props.correct / props.total) * 100) : 0,
);

const headline = computed(() => {
  if (props.stars >= 3) {
    return "Идеально";
  }
  if (props.stars >= 2) {
    return "Сильный ход";
  }
  if (props.stars >= 1) {
    return "Есть прогресс";
  }
  if (props.total === 0) {
    return "Нет данных";
  }
  return "Ещё раз";
});

const badgeIcon = computed<Component>(() => {
  if (props.stars >= 3) {
    return Trophy;
  }
  if (props.stars >= 2) {
    return PartyPopper;
  }
  if (props.stars >= 1) {
    return Sparkles;
  }
  return Frown;
});

const badgeClass = computed(() => {
  if (props.stars >= 3) {
    return "finish-badge--gold";
  }
  if (props.stars >= 2) {
    return "finish-badge--ok";
  }
  if (props.stars >= 1) {
    return "finish-badge--soft";
  }
  return "finish-badge--muted";
});
</script>

<style scoped>
.finish-spinner,
.finish-badge {
  display: flex;
  width: 3.5rem;
  height: 3.5rem;
  align-items: center;
  justify-content: center;
  margin-inline: auto;
  border-radius: 999px;
}

.finish-spinner {
  color: var(--accent);
  background: var(--accent-soft);
}

.finish-badge--gold {
  color: #8a6a00;
  background: color-mix(in srgb, var(--star) 28%, transparent);
}

.finish-badge--ok {
  color: var(--true-ink);
  background: var(--true-soft);
}

.finish-badge--soft {
  color: var(--accent);
  background: var(--accent-soft);
}

.finish-badge--muted {
  color: var(--muted);
  background: var(--ghost-bg);
}

:global(html.dark) .finish-badge--gold {
  color: var(--star);
}
</style>
