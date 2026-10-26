<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="open"
        class="sheet-scrim fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        @click.self="open = false"
      >
        <div
          class="sheet-panel h-full w-full overflow-y-auto overscroll-contain p-6 sm:h-auto sm:max-h-[calc(100dvh-2.5rem)] sm:max-w-md sm:p-7"
        >
          <div class="flex items-center justify-between gap-3">
            <h2 id="settings-title" class="headline text-xl">Настройки</h2>
            <button type="button" class="icon-btn" aria-label="Закрыть" @click="open = false">
              <AppIcon :icon="X" size="sm" :animate="false" />
            </button>
          </div>

          <form class="mt-5 flex flex-col gap-4" @submit.prevent="saveProfile">
            <label class="block text-left text-sm font-medium">
              Имя
              <input v-model="profile.name" type="text" required class="field mt-1.5" />
            </label>
            <label class="block text-left text-sm font-medium">
              URL аватара
              <input
                v-model="profile.image"
                type="url"
                class="field mt-1.5"
                placeholder="https://…"
              />
            </label>
            <p
              v-if="profile.msg"
              class="text-sm"
              :class="profile.err ? 'text-[var(--danger)]' : 'text-[var(--ok)]'"
            >
              {{ profile.msg }}
            </p>
            <button type="submit" class="btn btn-primary w-full" :disabled="profile.loading">
              {{ profile.loading ? "Сохраняю…" : "Сохранить профиль" }}
            </button>
          </form>

          <div class="my-7 h-px" style="background: var(--surface-border)" />

          <form class="flex flex-col gap-4" @submit.prevent="savePassword">
            <h3 class="headline text-lg">Сменить пароль</h3>
            <label class="block text-left text-sm font-medium">
              Текущий пароль
              <input
                v-model="password.current"
                type="password"
                required
                minlength="8"
                class="field mt-1.5"
              />
            </label>
            <label class="block text-left text-sm font-medium">
              Новый пароль
              <input
                v-model="password.next"
                type="password"
                required
                minlength="8"
                class="field mt-1.5"
              />
            </label>
            <p
              v-if="password.msg"
              class="text-sm"
              :class="password.err ? 'text-[var(--danger)]' : 'text-[var(--ok)]'"
            >
              {{ password.msg }}
            </p>
            <button type="submit" class="btn btn-ghost w-full" :disabled="password.loading">
              {{ password.loading ? "Меняю…" : "Обновить пароль" }}
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
        v-if="del.open"
        class="sheet-scrim fixed inset-0 z-[60] flex items-stretch justify-center sm:items-center sm:p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        @click.self="closeDeleteConfirm"
      >
        <div
          class="sheet-panel h-full w-full overflow-y-auto overscroll-contain p-6 sm:h-auto sm:max-w-sm sm:p-7"
        >
          <div class="flex items-center justify-between gap-3">
            <h2 id="delete-title" class="headline text-xl">Точно удалить?</h2>
            <button type="button" class="icon-btn" aria-label="Закрыть" @click="closeDeleteConfirm">
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
                v-model="del.password"
                type="password"
                required
                minlength="8"
                autocomplete="current-password"
                class="field mt-1.5"
              />
            </label>
            <p v-if="del.msg" class="text-sm text-[var(--danger)]">{{ del.msg }}</p>
            <button
              type="submit"
              class="btn btn-danger-soft w-full"
              :disabled="del.loading || !del.password"
            >
              {{ del.loading ? "Удаляю…" : "Удалить" }}
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from "lucide-vue-next";

const open = defineModel<boolean>({ required: true });
const emit = defineEmits<{ saved: [] }>();

const { session, client, refresh } = useSession();

const profile = reactive({
  name: session.value?.user?.name || "",
  image: session.value?.user?.image || "",
  loading: false,
  msg: "",
  err: false,
});

const password = reactive({
  current: "",
  next: "",
  loading: false,
  msg: "",
  err: false,
});

const del = reactive({
  open: false,
  password: "",
  loading: false,
  msg: "",
});

watch(open, (v) => {
  if (!v) {
    return;
  }
  profile.name = session.value?.user?.name || "";
  profile.image = session.value?.user?.image || "";
  profile.msg = "";
  password.msg = "";
});

watch([open, () => del.open], ([settings, deleteOpen]) => {
  if (!import.meta.client) {
    return;
  }
  document.documentElement.style.overflow = settings || deleteOpen ? "hidden" : "";
});

onUnmounted(() => {
  if (import.meta.client) {
    document.documentElement.style.overflow = "";
  }
});

async function saveProfile() {
  profile.loading = true;
  profile.msg = "";
  profile.err = false;
  try {
    const res = await client.updateUser({
      name: profile.name.trim(),
      image: profile.image.trim(),
    });
    if (res.error) {
      throw new Error(res.error.message || "Не удалось сохранить");
    }
    await refresh({ force: true });
    emit("saved");
    profile.msg = "Сохранено";
  } catch (e: unknown) {
    profile.err = true;
    profile.msg = e instanceof Error ? e.message : "Ошибка сохранения";
  } finally {
    profile.loading = false;
  }
}

async function savePassword() {
  password.loading = true;
  password.msg = "";
  password.err = false;
  try {
    const res = await client.changePassword({
      currentPassword: password.current,
      newPassword: password.next,
    });
    if (res.error) {
      throw new Error(res.error.message || "Не удалось сменить пароль");
    }
    password.current = "";
    password.next = "";
    password.msg = "Пароль обновлён";
  } catch (e: unknown) {
    password.err = true;
    password.msg = e instanceof Error ? e.message : "Ошибка смены пароля";
  } finally {
    password.loading = false;
  }
}

function openDeleteConfirm() {
  del.password = "";
  del.msg = "";
  del.open = true;
}

function closeDeleteConfirm() {
  if (del.loading) {
    return;
  }
  del.open = false;
  del.password = "";
  del.msg = "";
}

async function deleteAccount() {
  if (!del.password) {
    return;
  }
  del.loading = true;
  del.msg = "";
  try {
    const res = await client.deleteUser({ password: del.password });
    if (res.error) {
      throw new Error(res.error.message || "Не удалось удалить аккаунт");
    }
    session.value = null;
    del.open = false;
    open.value = false;
    await refresh({ force: true });
    await navigateTo("/");
  } catch (e: unknown) {
    del.msg = e instanceof Error ? e.message : "Ошибка удаления";
  } finally {
    del.loading = false;
  }
}
</script>
