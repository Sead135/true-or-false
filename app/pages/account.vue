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

      <section class="mt-6" aria-labelledby="stats-title">
        <h2 id="stats-title" class="headline text-xl">Статистика</h2>
        <div class="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <div v-for="s in statCards" :key="s.label" class="panel panel-sm p-4">
            <p class="muted text-xs">{{ s.label }}</p>
            <p class="headline mt-1 text-2xl tabular-nums">{{ s.value }}</p>
          </div>
        </div>
      </section>

      <section class="mt-8" aria-labelledby="ach-title">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <h2 id="ach-title" class="headline text-xl">Достижения</h2>
          <div class="flex gap-1" role="group" aria-label="Фильтр достижений">
            <button
              v-for="f in filters"
              :key="f.id"
              type="button"
              class="filter-btn"
              :class="{ 'filter-btn--on': achFilter === f.id }"
              :aria-pressed="achFilter === f.id"
              @click="achFilter = f.id"
            >
              {{ f.label }}
            </button>
          </div>
        </div>

        <p
          v-if="!filteredAchievements.length"
          class="panel panel-sm mt-3 p-6 text-center muted text-sm"
        >
          {{ emptyAchMessage }}
        </p>
        <ul v-else class="mt-3 grid list-none gap-2.5 p-0 sm:grid-cols-2">
          <li
            v-for="a in filteredAchievements"
            :key="a.id"
            class="ach-card panel panel-sm"
            :class="{ 'ach-card--locked': !a.unlocked }"
          >
            <div class="flex gap-3 p-4">
              <span class="ach-icon" aria-hidden="true">{{ a.icon }}</span>
              <div class="min-w-0 flex-1">
                <p class="font-semibold tracking-tight">{{ a.title }}</p>
                <p class="muted mt-0.5 text-sm leading-snug">{{ a.description }}</p>
                <p v-if="a.unlocked && a.unlockedAt" class="muted mt-2 text-xs">
                  {{ formatDate(a.unlockedAt) }}
                </p>
                <template v-else>
                  <div class="mt-2 flex justify-between text-xs muted">
                    <span>{{ a.current }} / {{ a.target }}</span>
                  </div>
                  <div class="bar mt-1">
                    <div
                      class="bar-fill bar-fill--muted"
                      :style="{ width: `${Math.min(100, (a.current / a.target) * 100)}%` }"
                    />
                  </div>
                </template>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <Teleport to="body">
        <Transition name="sheet">
          <div
            v-if="settingsOpen"
            class="sheet-scrim fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            @click.self="settingsOpen = false"
          >
            <div
              class="sheet-panel h-full w-full overflow-y-auto overscroll-contain p-6 sm:h-auto sm:max-h-[calc(100dvh-2.5rem)] sm:max-w-md sm:p-7"
            >
              <div class="flex items-center justify-between gap-3">
                <h2 id="settings-title" class="headline text-xl">Настройки</h2>
                <button
                  type="button"
                  class="icon-btn"
                  aria-label="Закрыть"
                  @click="settingsOpen = false"
                >
                  <AppIcon :icon="X" size="sm" :animate="false" />
                </button>
              </div>

              <form class="mt-5 flex flex-col gap-4" @submit.prevent="saveProfile">
                <label class="block text-left text-sm font-medium">
                  Имя
                  <input v-model="name" type="text" required class="field mt-1.5" />
                </label>
                <label class="block text-left text-sm font-medium">
                  URL аватара
                  <input v-model="image" type="url" class="field mt-1.5" placeholder="https://…" />
                </label>
                <p
                  v-if="profileMsg"
                  class="text-sm"
                  :class="profileErr ? 'text-[var(--danger)]' : 'text-[var(--ok)]'"
                >
                  {{ profileMsg }}
                </p>
                <button type="submit" class="btn btn-primary w-full" :disabled="profileLoading">
                  {{ profileLoading ? "Сохраняю…" : "Сохранить профиль" }}
                </button>
              </form>

              <div class="my-7 h-px" style="background: var(--surface-border)" />

              <form class="flex flex-col gap-4" @submit.prevent="savePassword">
                <h3 class="headline text-lg">Сменить пароль</h3>
                <label class="block text-left text-sm font-medium">
                  Текущий пароль
                  <input
                    v-model="currentPassword"
                    type="password"
                    required
                    minlength="8"
                    class="field mt-1.5"
                  />
                </label>
                <label class="block text-left text-sm font-medium">
                  Новый пароль
                  <input
                    v-model="newPassword"
                    type="password"
                    required
                    minlength="8"
                    class="field mt-1.5"
                  />
                </label>
                <p
                  v-if="passMsg"
                  class="text-sm"
                  :class="passErr ? 'text-[var(--danger)]' : 'text-[var(--ok)]'"
                >
                  {{ passMsg }}
                </p>
                <button type="submit" class="btn btn-ghost w-full" :disabled="passLoading">
                  {{ passLoading ? "Меняю…" : "Обновить пароль" }}
                </button>
              </form>

              <div class="my-7 h-px" style="background: var(--surface-border)" />

              <div class="flex flex-col gap-3">
                <h3 class="headline text-lg">Удалить аккаунт</h3>
                <p class="muted text-sm leading-relaxed">
                  Прогресс, достижения и сессии удалятся без возможности восстановления.
                </p>
                <button type="button" class="btn btn-danger-soft w-full" @click="openDeleteConfirm">
                  Удалить аккаунт
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <Teleport to="body">
        <Transition name="sheet">
          <div
            v-if="deleteConfirmOpen"
            class="sheet-scrim fixed inset-0 z-[60] flex items-stretch justify-center sm:items-center sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            @click.self="closeDeleteConfirm"
          >
            <div class="sheet-panel h-full w-full overflow-y-auto overscroll-contain p-6 sm:h-auto sm:max-w-sm sm:p-7">
              <div class="flex items-center justify-between gap-3">
                <h2 id="delete-title" class="headline text-xl">Точно удалить?</h2>
                <button
                  type="button"
                  class="icon-btn"
                  aria-label="Закрыть"
                  @click="closeDeleteConfirm"
                >
                  <AppIcon :icon="X" size="sm" :animate="false" />
                </button>
              </div>
              <p class="muted mt-3 text-sm leading-relaxed">
                Это нельзя отменить. Введи пароль, чтобы подтвердить.
              </p>
              <form class="mt-5 flex flex-col gap-4" @submit.prevent="deleteAccount">
                <label class="block text-left text-sm font-medium">
                  Пароль
                  <input
                    v-model="deletePassword"
                    type="password"
                    required
                    minlength="8"
                    autocomplete="current-password"
                    class="field mt-1.5"
                  />
                </label>
                <p v-if="deleteMsg" class="text-sm text-[var(--danger)]">{{ deleteMsg }}</p>
                <button
                  type="submit"
                  class="btn btn-danger-soft w-full"
                  :disabled="deleteLoading || !deletePassword"
                >
                  {{ deleteLoading ? "Удаляю…" : "Удалить" }}
                </button>
              </form>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
  </main>
</template>

<script setup lang="ts">
import { Settings, X } from "lucide-vue-next";

usePageSeo({
  title: "Аккаунт",
  description: "Профиль, статистика и достижения.",
  path: "/account",
  robots: "noindex, nofollow",
});

const { session, client, refresh } = useSession();
const settingsOpen = ref(false);
const deleteConfirmOpen = ref(false);

watch(
  [settingsOpen, deleteConfirmOpen],
  ([settings, del]) => {
    if (!import.meta.client) return;
    document.documentElement.style.overflow = settings || del ? "hidden" : "";
  },
);

onUnmounted(() => {
  if (import.meta.client) {
    document.documentElement.style.overflow = "";
  }
});

await refresh();
if (!session.value?.user) {
  await navigateTo("/login");
}

type Profile = {
  user: { id: string; name: string; email: string; image: string | null };
  level: number;
  levelTitle: string;
  xp: number;
  xpIntoLevel: number;
  xpForNext: number;
  xpProgress: number;
  stats: {
    roundsCompleted: number;
    questionsAnswered: number;
    correctAnswers: number;
    accuracy: number;
    bestStreak: number;
    totalXp: number;
  };
  achievements: {
    unlocked: number;
    total: number;
    items: {
      id: string;
      title: string;
      description: string;
      icon: string;
      target: number;
      current: number;
      unlocked: boolean;
      unlockedAt: string | null;
    }[];
  };
};

const {
  data: profile,
  pending,
  error,
  refresh: refreshProfile,
} = await useAsyncData("profile", () => $fetch<Profile>("/api/profile"));

const name = ref(session.value?.user?.name || "");
const image = ref(session.value?.user?.image || "");
const profileLoading = ref(false);
const profileMsg = ref("");
const profileErr = ref(false);

const currentPassword = ref("");
const newPassword = ref("");
const passLoading = ref(false);
const passMsg = ref("");
const passErr = ref(false);

const deletePassword = ref("");
const deleteLoading = ref(false);
const deleteMsg = ref("");

const achFilter = ref<"all" | "unlocked" | "locked">("all");
const filters = [
  { id: "all" as const, label: "Все" },
  { id: "unlocked" as const, label: "Полученные" },
  { id: "locked" as const, label: "Не получены" },
];

const initials = computed(() => {
  const n = (profile.value?.user.name || session.value?.user?.name || "?").trim();
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return n.slice(0, 2).toUpperCase();
});

const statCards = computed(() => {
  const s = profile.value?.stats;
  if (!s) {
    return [];
  }
  return [
    { label: "Раунды", value: s.roundsCompleted },
    { label: "Ответы", value: s.questionsAnswered },
    { label: "Верные", value: s.correctAnswers },
    { label: "Точность", value: `${s.accuracy}%` },
    { label: "Лучшая серия", value: s.bestStreak },
    { label: "Опыт", value: s.totalXp },
  ];
});

const filteredAchievements = computed(() => {
  const items = profile.value?.achievements.items || [];
  if (achFilter.value === "unlocked") {
    return items.filter((a) => a.unlocked);
  }
  if (achFilter.value === "locked") {
    return items.filter((a) => !a.unlocked);
  }
  return items;
});

const emptyAchMessage = computed(() => {
  if (achFilter.value === "unlocked") {
    return "Пока нет открытых достижений — сыграй раунд.";
  }
  if (achFilter.value === "locked") {
    return "Все достижения уже получены.";
  }
  return "Достижений пока нет.";
});

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

async function saveProfile() {
  profileLoading.value = true;
  profileMsg.value = "";
  profileErr.value = false;

  try {
    const payload: { name: string; image?: string } = { name: name.value.trim() };
    const img = image.value.trim();
    if (img) {
      payload.image = img;
    } else {
      payload.image = "";
    }
    const res = await client.updateUser(payload);
    if (res.error) {
      throw new Error(res.error.message || "Не удалось сохранить");
    }
    await refresh({ force: true });
    await refreshProfile();
    profileMsg.value = "Сохранено";
  } catch (e: unknown) {
    profileErr.value = true;
    profileMsg.value = e instanceof Error ? e.message : "Ошибка сохранения";
  } finally {
    profileLoading.value = false;
  }
}

async function savePassword() {
  passLoading.value = true;
  passMsg.value = "";
  passErr.value = false;
  try {
    const res = await client.changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    });
    if (res.error) throw new Error(res.error.message || "Не удалось сменить пароль");
    currentPassword.value = "";
    newPassword.value = "";
    passMsg.value = "Пароль обновлён";
  } catch (e: unknown) {
    passErr.value = true;
    passMsg.value = e instanceof Error ? e.message : "Ошибка смены пароля";
  } finally {
    passLoading.value = false;
  }
}

function openDeleteConfirm() {
  deletePassword.value = "";
  deleteMsg.value = "";
  deleteConfirmOpen.value = true;
}

function closeDeleteConfirm() {
  if (deleteLoading.value) return;
  deleteConfirmOpen.value = false;
  deletePassword.value = "";
  deleteMsg.value = "";
}

async function deleteAccount() {
  if (!deletePassword.value) return;

  deleteLoading.value = true;
  deleteMsg.value = "";
  try {
    const res = await client.deleteUser({ password: deletePassword.value });
    if (res.error) throw new Error(res.error.message || "Не удалось удалить аккаунт");
    session.value = null;
    deleteConfirmOpen.value = false;
    settingsOpen.value = false;
    await refresh({ force: true });
    await navigateTo("/");
  } catch (e: unknown) {
    deleteMsg.value = e instanceof Error ? e.message : "Ошибка удаления";
  } finally {
    deleteLoading.value = false;
  }
}
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

.filter-btn {
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--muted);
  background: transparent;
  border: 1px solid transparent;
}

.filter-btn--on {
  color: var(--ink);
  background: var(--ghost-bg);
  border-color: var(--ghost-border);
}

.ach-card--locked {
  opacity: 0.55;
  filter: grayscale(0.35);
}

.ach-icon {
  display: inline-flex;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--accent-soft);
  font-size: 1.25rem;
}

.ach-card--locked .ach-icon {
  background: color-mix(in srgb, var(--ink) 8%, transparent);
}
</style>
