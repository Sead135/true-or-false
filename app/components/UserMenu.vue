<template>
  <div v-if="user" ref="root" class="relative">
    <button
      type="button"
      class="icon-btn avatar-btn"
      :aria-expanded="open"
      aria-haspopup="menu"
      :aria-label="`Меню: ${user.name || 'Игрок'}`"
      @click="open = !open"
    >
      <span class="avatar-circle">{{ initials }}</span>
    </button>

    <Transition name="menu">
      <div v-if="open" class="user-menu panel panel-sm" role="menu">
        <div class="border-b px-3.5 py-3" style="border-color: var(--surface-border)">
          <p class="truncate text-sm font-semibold tracking-tight">{{ user.name || "Игрок" }}</p>
          <p class="muted truncate text-xs">{{ user.email }}</p>
        </div>
        <NuxtLink to="/account" class="menu-item" role="menuitem" @click="open = false">
          Аккаунт
        </NuxtLink>
        <NuxtLink
          v-if="isElevated(user.role)"
          to="/admin"
          class="menu-item"
          role="menuitem"
          @click="open = false"
        >
          Админка
        </NuxtLink>
        <button type="button" class="menu-item menu-danger" role="menuitem" @click="logout">
          Выйти
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { isElevated } from "../../lib/admin/roles";

const { session, client, refresh } = useSession();
const open = ref(false);
const root = ref<HTMLElement | null>(null);

const user = computed(() => session.value?.user ?? null);

const initials = computed(() => {
  const { name, email } = user.value ?? {};
  const n = (name || email || "?").trim();
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return n.slice(0, 2).toUpperCase();
});

async function logout() {
  open.value = false;
  await client.signOut();
  session.value = null;
  await refresh({ force: true });
  await navigateTo("/");
}

function onDocClick(e: MouseEvent) {
  if (!open.value || !root.value) {
    return;
  }
  if (!root.value.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener("click", onDocClick));
onUnmounted(() => document.removeEventListener("click", onDocClick));
</script>

<style scoped>
.avatar-btn {
  border-radius: 999px;
  padding: 0;
  border: none;
  background: transparent;
}

.avatar-btn:hover {
  background: transparent;
}

.avatar-circle {
  display: inline-flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #fff;
  background: linear-gradient(145deg, #18b888 0%, var(--true) 55%, #c93d52 130%);
  box-shadow:
    0 6px 16px rgba(12, 154, 114, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.user-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  z-index: 40;
  min-width: 12.5rem;
  overflow: hidden;
  padding: 0.35rem;
}

.menu-item {
  display: block;
  width: 100%;
  border-radius: 12px;
  padding: 0.65rem 0.85rem;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--ink);
  transition: background 0.12s ease;
}

.menu-item:hover {
  background: var(--ghost-bg);
}

.menu-danger {
  color: var(--danger);
}

.menu-enter-active,
.menu-leave-active {
  transition:
    opacity 0.14s ease,
    transform 0.14s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
