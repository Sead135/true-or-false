<template>
  <div class="play-board mx-auto flex h-full w-full max-w-xl flex-col select-none md:max-w-2xl">
    <div class="stack-stage min-h-0 flex-1 touch-none">
      <div
        class="stack-frame relative w-full"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <div
          class="pointer-events-none absolute inset-0 z-0 flex items-center justify-between px-6 md:px-12"
        >
          <div
            class="reveal reveal--false"
            :style="{ opacity: hintLeft, transform: `scale(${0.85 + hintLeft * 0.2})` }"
          >
            <AppIcon :icon="XCircle" size="xl" :animate="false" />
            <span>Ложь</span>
          </div>
          <div
            class="reveal reveal--true"
            :style="{ opacity: hintRight, transform: `scale(${0.85 + hintRight * 0.2})` }"
          >
            <AppIcon :icon="CheckCircle2" size="xl" :animate="false" />
            <span>Правда</span>
          </div>
        </div>

        <div
          v-for="layer in stackLayers"
          :key="layer.key"
          class="stack-card panel pointer-events-none absolute inset-x-0 top-0"
          :style="layer.style"
          aria-hidden="true"
        >
          <div class="stack-face muted">
            <AppIcon :icon="Layers" size="lg" :animate="false" />
          </div>
        </div>

        <Transition name="card-swap" mode="out-in">
          <div
            v-if="current"
            :key="current.id"
            class="stack-card panel claim-card absolute inset-x-0 top-0 flex cursor-grab flex-col items-center justify-center px-7 py-9 text-center active:cursor-grabbing md:px-12 md:py-12"
            :class="{
              'pointer-events-none opacity-55': locked,
              'claim-card--drag-false': hintLeft > 0.35,
              'claim-card--drag-true': hintRight > 0.35,
              'claim-card--exit': exiting,
            }"
            :style="cardStyle"
          >
            <p
              class="claim relative z-[1] max-w-[22rem] text-[1.35rem] md:max-w-[30rem] md:text-[1.9rem]"
            >
              {{ current.text }}
            </p>
          </div>
          <div
            v-else
            key="empty"
            class="stack-card panel absolute inset-x-0 top-0 flex items-center justify-center p-8 text-center muted"
          >
            Нет вопросов
          </div>
        </Transition>
      </div>
    </div>

    <div class="answer-dock shrink-0 pt-4">
      <div class="answer-row w-full" role="group" aria-label="Ответ">
        <button
          type="button"
          class="answer-pad answer-pad--false"
          :disabled="locked || !current"
          aria-keyshortcuts="ArrowLeft"
          @click="answer(false)"
        >
          <span class="answer-pad__icon">
            <AppIcon :icon="X" size="lg" draw />
          </span>
          <span class="answer-pad__label">Ложь</span>
          <span class="answer-pad__hint">←</span>
        </button>
        <button
          type="button"
          class="answer-pad answer-pad--true"
          :disabled="locked || !current"
          aria-keyshortcuts="ArrowRight"
          @click="answer(true)"
        >
          <span class="answer-pad__icon">
            <AppIcon :icon="Check" size="lg" draw />
          </span>
          <span class="answer-pad__label">Правда</span>
          <span class="answer-pad__hint">→</span>
        </button>
      </div>
      <p class="muted mt-2.5 text-center text-xs md:text-sm">
        Свайп карточки или стрелки клавиатуры
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, CheckCircle2, Layers, X, XCircle } from "lucide-vue-next";

const FLY_MS = 280;
const THRESHOLD = 80;

const props = defineProps<{
  questions: { id: string; text: string; order: number }[];
  index: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  answer: [value: boolean];
}>();

const dragX = ref(0);
const dragging = ref(false);
const exiting = ref(false);

let startX = 0;
let pointerId: number | null = null;

const current = computed(() => props.questions[props.index] || null);
const locked = computed(() => props.disabled || exiting.value);

const stackLayers = computed(() =>
  [2, 1].map((layer) => ({
    key: `back-${layer}`,
    style: {
      position: "absolute" as const,
      zIndex: String(3 - layer),
      transform: `translateY(${layer * 14}px) scale(${1 - layer * 0.04})`,
      opacity: String(0.55 - (layer - 1) * 0.12),
    },
  })),
);

const rotation = computed(() => dragX.value * 0.04);
const hintRight = computed(() => Math.min(1, Math.max(0, dragX.value / 70)));
const hintLeft = computed(() => Math.min(1, Math.max(0, -dragX.value / 70)));

const reduceMotion = ref(false);
onMounted(() => {
  reduceMotion.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
});

const cardStyle = computed(() => ({
  position: "absolute" as const,
  zIndex: "10",
  transform: `translateX(${dragX.value}px) rotate(${rotation.value}deg)`,
  opacity:
    exiting.value && Math.abs(dragX.value) > 120
      ? Math.max(0.15, 1 - Math.abs(dragX.value) / 600)
      : 1,
  transition: dragging.value
    ? "none"
    : exiting.value
      ? `transform ${FLY_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${FLY_MS}ms ease`
      : "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
}));

function onPointerDown(e: PointerEvent) {
  if (locked.value || !current.value) {
    return;
  }
  dragging.value = true;
  startX = e.clientX;
  pointerId = e.pointerId;
  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value || pointerId !== e.pointerId) {
    return;
  }
  dragX.value = e.clientX - startX;
}

function onPointerUp(e: PointerEvent) {
  if (!dragging.value || (pointerId !== null && pointerId !== e.pointerId)) {
    return;
  }
  dragging.value = false;
  pointerId = null;
  const dx = dragX.value;
  if (Math.abs(dx) < THRESHOLD) {
    dragX.value = 0;
    return;
  }
  void flyAndEmit(dx > 0);
}

function flyDistance() {
  if (!import.meta.client) {
    return 480;
  }
  return Math.max(window.innerWidth * 0.9, 420);
}

async function flyAndEmit(value: boolean) {
  if (locked.value || !current.value) {
    return;
  }
  exiting.value = true;
  dragging.value = false;
  const dir = value ? 1 : -1;
  dragX.value = dir * flyDistance();
  if (!reduceMotion.value) {
    await new Promise<void>((resolve) => setTimeout(resolve, FLY_MS));
  }
  emit("answer", value);
}

function answer(value: boolean) {
  void flyAndEmit(value);
}

function onKey(e: KeyboardEvent) {
  if (locked.value) return;
  if (e.key === "ArrowRight") answer(true);
  if (e.key === "ArrowLeft") answer(false);
}

onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => window.removeEventListener("keydown", onKey));

watch(
  () => props.index,
  () => {
    dragX.value = 0;
    dragging.value = false;
    exiting.value = false;
  },
);
</script>

<style scoped>
.stack-stage {
  display: flex;
  align-items: center;
  justify-content: center;
}

.stack-frame {
  height: min(22rem, 100%);
  max-height: 27rem;
}

@media (min-width: 768px) {
  .stack-frame {
    height: min(27rem, 100%);
  }
}

.stack-card {
  height: calc(100% - 2rem);
}

.claim-card {
  border-width: 2px;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  will-change: transform;
}

.claim-card--drag-false,
.claim-card--exit.claim-card--drag-false {
  border-color: color-mix(in srgb, var(--false) 55%, transparent);
  box-shadow:
    var(--shadow-lg),
    0 0 0 4px var(--false-soft);
}

.claim-card--drag-true,
.claim-card--exit.claim-card--drag-true {
  border-color: color-mix(in srgb, var(--true) 55%, transparent);
  box-shadow:
    var(--shadow-lg),
    0 0 0 4px var(--true-soft);
}

.stack-face {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.reveal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  transition:
    opacity 0.1s ease,
    transform 0.1s ease;
}

.reveal--false {
  color: var(--false);
}

.reveal--true {
  color: var(--true);
}

.answer-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.answer-pad {
  display: flex;
  min-height: 4.75rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  border-radius: var(--radius-md);
  border: 1.5px solid transparent;
  padding: 0.85rem 0.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  transition:
    transform 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.answer-pad:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.answer-pad:active:not(:disabled) {
  transform: scale(0.97);
}

.answer-pad--false {
  color: var(--false-ink);
  background: var(--false-soft);
  border-color: color-mix(in srgb, var(--false) 28%, transparent);
}

.answer-pad--true {
  color: var(--true-ink);
  background: var(--true-soft);
  border-color: color-mix(in srgb, var(--true) 28%, transparent);
}

@media (hover: hover) and (pointer: fine) {
  .answer-pad:focus-visible {
    box-shadow: var(--focus);
  }

  .answer-pad--false:hover:not(:disabled) {
    background: color-mix(in srgb, var(--false-soft) 70%, var(--false));
  }

  .answer-pad--true:hover:not(:disabled) {
    background: color-mix(in srgb, var(--true-soft) 70%, var(--true));
  }
}

.answer-pad__icon {
  display: flex;
  color: inherit;
}

.answer-pad__label {
  font-size: 1.05rem;
}

.answer-pad__hint {
  display: none;
}

@media (min-width: 768px) {
  .answer-pad {
    min-height: 5.25rem;
    flex-direction: row;
    gap: 0.65rem;
  }

  .answer-pad__hint {
    display: block;
    margin-left: auto;
    font-size: 0.8rem;
    font-weight: 600;
    opacity: 0.55;
  }
}

/* leave is instant — exit is the fly-off; enter brings the next card */
.card-swap-enter-active {
  transition:
    opacity 0.22s ease,
    transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
}

.card-swap-leave-active {
  transition: none;
}

.card-swap-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.97);
}

.card-swap-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .card-swap-enter-active,
  .reveal,
  .answer-pad,
  .claim-card {
    transition: none !important;
  }
}

.stack-frame > .panel {
  position: absolute;
}
</style>
