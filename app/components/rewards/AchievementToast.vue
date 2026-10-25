<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="toast" class="toast-root" role="status" aria-live="polite">
        <div class="toast-card panel panel-sm">
          <button type="button" class="toast-close" aria-label="Закрыть" @click="dismiss">
            <AppIcon :icon="X" size="sm" :animate="false" />
          </button>
          <p class="toast-kicker inline-flex items-center gap-1.5">
            <AppIcon :icon="Award" size="sm" :animate="false" />
            Достижение открыто
          </p>
          <div class="mt-2 flex items-start gap-3">
            <span class="toast-icon" aria-hidden="true">{{ toast.icon }}</span>
            <div class="min-w-0 text-left">
              <p class="headline text-lg leading-tight">{{ toast.title }}</p>
              <p class="muted mt-1 text-sm leading-snug">{{ toast.description }}</p>
              <p v-if="toast.xpReward > 0" class="toast-xp mt-2 text-sm font-semibold">
                +{{ toast.xpReward }} XP
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Award, X } from "lucide-vue-next";

const { active, dismiss } = useRewardToasts();
const toast = active;

let timer: ReturnType<typeof setTimeout> | null = null;

watch(
  toast,
  (t) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = null;
    if (!t) {
      return;
    }
    timer = setTimeout(() => dismiss(), 4200);
  },
  { immediate: true },
);

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
  }
});
</script>

<style scoped>
.toast-root {
  position: fixed;
  z-index: 60;
  left: 50%;
  top: max(1rem, env(safe-area-inset-top));
  width: min(22rem, calc(100vw - 1.5rem));
  transform: translateX(-50%);
  pointer-events: none;
}

.toast-card {
  position: relative;
  pointer-events: auto;
  padding: 1rem 1.15rem 1.1rem;
}

.toast-close {
  position: absolute;
  right: 0.55rem;
  top: 0.55rem;
  display: inline-flex;
  padding: 0.3rem;
  border-radius: var(--radius-xs);
  color: var(--muted);
}

.toast-close:hover {
  color: var(--ink);
  background: var(--ghost-bg);
}

.toast-kicker {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--accent);
}

.toast-icon {
  flex-shrink: 0;
  display: inline-flex;
  width: 2.5rem;
  height: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--accent-soft);
  font-size: 1.35rem;
}

.toast-xp {
  color: var(--true);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: opacity 0.15s ease;
  }

  .toast-enter-from,
  .toast-leave-to {
    transform: translateX(-50%);
  }
}
</style>
