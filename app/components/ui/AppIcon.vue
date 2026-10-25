<template>
  <component
    :is="icon"
    class="app-icon"
    :class="[`app-icon--${size}`, { 'icon-animate': animate, 'icon-draw': draw }]"
    :size="pixel"
    :stroke-width="stroke"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import type { Component } from "vue";

type IconSize = "sm" | "md" | "lg" | "xl";

const ICON_SIZES: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  lg: 28,
  xl: 36,
};

const props = withDefaults(
  defineProps<{
    icon: Component;
    size?: IconSize;
    stroke?: number;
    animate?: boolean;
    draw?: boolean;
  }>(),
  {
    size: "md",
    stroke: 2,
    animate: true,
    draw: false,
  },
);

const pixel = computed(() => ICON_SIZES[props.size]);
</script>

<style scoped>
.app-icon {
  display: block;
  flex-shrink: 0;
}

.app-icon--sm {
  width: 1rem;
  height: 1rem;
}

.app-icon--md {
  width: 1.25rem;
  height: 1.25rem;
}

.app-icon--lg {
  width: 1.75rem;
  height: 1.75rem;
}

.app-icon--xl {
  width: 2.25rem;
  height: 2.25rem;
}
</style>
