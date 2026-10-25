<template>
  <div class="stars" :class="compact ? 'stars--compact' : 'stars--lg'" aria-label="Звёзды">
    <span v-for="i in 3" :key="i" class="star" :class="i <= stars ? 'star--on' : 'star--off'">
      <Star
        class="star-svg"
        :size="compact ? 16 : 28"
        :stroke-width="1.8"
        :fill="i <= stars ? 'currentColor' : 'none'"
        aria-hidden="true"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
import { Star } from "lucide-vue-next";

withDefaults(defineProps<{ stars: number; compact?: boolean }>(), { compact: false });
</script>

<style scoped>
.stars {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
}

.star {
  display: inline-flex;
  line-height: 1;
  transition:
    color 0.15s ease,
    transform 0.15s ease;
}

.star--on {
  color: var(--star);
}

.star--off {
  color: color-mix(in srgb, var(--ink) 18%, transparent);
}

.stars--lg .star--on {
  filter: drop-shadow(0 0 8px color-mix(in srgb, var(--star) 35%, transparent));
}
</style>
