<template>
  <NuxtLink :to="to" class="icon-btn back-button" :aria-label="label">
    <AppIcon :icon="ArrowLeft" size="sm" :animate="false" />
  </NuxtLink>
</template>

<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";

withDefaults(
  defineProps<{
    to: string;
    label?: string;
  }>(),
  { label: "Назад" },
);
</script>
