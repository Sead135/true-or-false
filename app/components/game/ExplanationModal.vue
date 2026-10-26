<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="open"
        class="sheet-scrim fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wrong-title"
      >
        <div
          class="sheet-panel flex h-full w-full flex-col justify-center overflow-y-auto overscroll-contain p-6 text-center sm:h-auto sm:max-w-[22rem] sm:p-7"
        >
          <div class="error-icon mx-auto icon-draw" aria-hidden="true">
            <AppIcon :icon="XCircle" size="lg" :animate="false" :draw="false" />
          </div>

          <h2 id="wrong-title" class="headline mt-4 text-[1.4rem]">Неверно</h2>

          <p class="muted mt-3 text-[15px] leading-relaxed">
            {{ explanation || "Неверно" }}
          </p>

          <button class="btn btn-primary mt-6 w-full" type="button" @click="$emit('continue')">
            Дальше
            <AppIcon :icon="ArrowRight" size="sm" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ArrowRight, XCircle } from "lucide-vue-next";

defineProps<{ open: boolean; explanation: string }>();
defineEmits<{ continue: [] }>();
</script>

<style scoped>
.error-icon {
  display: flex;
  width: 3.25rem;
  height: 3.25rem;
  align-items: center;
  justify-content: center;
  margin-inline: auto;
  border-radius: 999px;
  color: var(--false);
  background: var(--false-soft);
}
</style>
