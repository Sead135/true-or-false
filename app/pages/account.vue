<template>
  <main class="mx-auto max-w-2xl px-6 py-10">
    <header class="mb-6 flex items-center justify-between">
      <BackButton to="/levels" label="К уровням" />
      <div class="flex items-center gap-2">
        <button
          v-if="profile"
          type="button"
          class="icon-btn"
          aria-label="Настройки аккаунта"
          :aria-expanded="settingsOpen"
          @click="settingsOpen = true"
        >
          <AppIcon :icon="Settings" size="sm" />
        </button>
        <AppChrome show-theme />
      </div>
    </header>

    <p v-if="pending" class="muted" role="status">Загрузка профиля…</p>
    <p v-else-if="error" class="panel panel-sm p-5 text-[var(--danger)]" role="alert">
      Не удалось загрузить профиль.
    </p>

    <template v-else-if="profile">
      <AccountHero :profile="profile" />
      <AccountStats :stats="profile.stats" />
      <AccountAchievements :items="profile.achievements.items" />
      <AccountSettingsSheet v-model="settingsOpen" @saved="refreshProfile()" />
    </template>
  </main>
</template>

<script setup lang="ts">
import { Settings } from "lucide-vue-next";
import type { AccountProfile } from "../components/account/types";

usePageSeo({
  title: "Аккаунт",
  description: "Профиль, статистика и достижения.",
  path: "/account",
  robots: "noindex, nofollow",
});

const { session, refresh } = useSession();
const settingsOpen = ref(false);

await refresh();
if (!session.value?.user) {
  await navigateTo("/login");
}

const {
  data: profile,
  pending,
  error,
  refresh: refreshProfile,
} = await useAsyncData("profile", () => $fetch<AccountProfile>("/api/profile"));
</script>
