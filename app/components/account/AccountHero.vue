<template>
  <section class="panel p-6 sm:p-8" aria-labelledby="profile-name">
    <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div class="avatar-lg" aria-hidden="true">
        <img
          v-if="profile.user.image"
          :src="profile.user.image"
          alt=""
          class="size-full rounded-full object-cover"
        />
        <span v-else>{{ initials }}</span>
      </div>
      <div class="min-w-0 flex-1">
        <h1 id="profile-name" class="headline truncate text-3xl">{{ profile.user.name }}</h1>
        <p class="muted mt-1 truncate text-sm">{{ profile.user.email }}</p>
        <p class="mt-3 text-sm font-semibold tracking-tight">
          Ур. {{ profile.level }} · {{ profile.levelTitle }}
        </p>
        <div class="mt-2">
          <div class="flex justify-between text-xs muted">
            <span>{{ profile.xpIntoLevel }} / {{ profile.xpForNext }} XP</span>
            <span>{{ profile.xp }} XP всего</span>
          </div>
          <div
            class="bar mt-1.5"
            role="progressbar"
            :aria-valuenow="Math.round(profile.xpProgress * 100)"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              class="bar-fill"
              :style="{ width: `${Math.min(100, profile.xpProgress * 100)}%` }"
            />
          </div>
        </div>
        <p class="muted mt-3 text-sm">
          Достижения {{ profile.achievements.unlocked }} / {{ profile.achievements.total }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AccountProfile } from "./types";

const props = defineProps<{ profile: AccountProfile }>();

const initials = computed(() => {
  const n = props.profile.user.name.trim() || "?";
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return n.slice(0, 2).toUpperCase();
});
</script>

<style scoped>
.avatar-lg {
  display: inline-flex;
  width: 4.25rem;
  height: 4.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 999px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(145deg, #18b888 0%, var(--true) 55%, #c93d52 130%);
  box-shadow:
    0 8px 20px rgba(12, 154, 114, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
}
</style>
