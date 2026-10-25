<template>
  <button type="button" class="icon-btn theme-toggle" :aria-label="label" @click="toggleTheme">
    <AppIcon :icon="mode === 'light' ? Moon : Sun" size="sm" />
  </button>
</template>

<script setup lang="ts">
import { Moon, Sun } from "lucide-vue-next";

const { mode, toggleTheme } = useTheme();

const label = computed(() => {
  return mode.value === "dark" ? "Включить светлую тему" : "Включить тёмную тему";
});
</script>

<style scoped>
/* styles: .icon-btn */
</style>
