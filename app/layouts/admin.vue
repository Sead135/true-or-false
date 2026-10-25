<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const open = ref(false);
const { session } = useSession();

const welcome = computed(() => {
  const u = session.value?.user;
  if (!u) {
    return "Добро пожаловать";
  }
  return `Добро пожаловать, ${u.name || u.email}`;
});

const links = [
  [
    {
      label: "Главная",
      icon: "i-lucide-house",
      to: "/admin",
      exact: true,
      onSelect: () => {
        open.value = false;
      },
    },
    {
      label: "Вопросы",
      icon: "i-lucide-help-circle",
      to: "/admin/questions",
      onSelect: () => {
        open.value = false;
      },
    },
    {
      label: "Уровни",
      icon: "i-lucide-layers",
      to: "/admin/levels",
      onSelect: () => {
        open.value = false;
      },
    },
    {
      label: "Пользователи",
      icon: "i-lucide-users",
      to: "/admin/users",
      onSelect: () => {
        open.value = false;
      },
    },
    {
      label: "Настройки",
      icon: "i-lucide-settings",
      to: "/admin/settings",
      onSelect: () => {
        open.value = false;
      },
    },
  ],
] satisfies NavigationMenuItem[][];
</script>

<template>
  <div class="admin-shell min-h-screen bg-default text-default">
    <UDashboardGroup unit="rem">
      <UDashboardSidebar
        id="admin"
        v-model:open="open"
        collapsible
        resizable
        class="bg-elevated/25"
      >
        <template #header="{ collapsed }">
          <div class="flex items-center gap-2 px-2 py-1">
            <UIcon name="i-lucide-shield" class="size-5 shrink-0 text-primary" />
            <span v-if="!collapsed" class="truncate font-semibold">Админка</span>
          </div>
        </template>

        <template #default="{ collapsed }">
          <UNavigationMenu
            :collapsed="collapsed"
            :items="links[0]"
            orientation="vertical"
            tooltip
          />
        </template>

        <template #footer="{ collapsed }">
          <UButton
            :to="'/levels'"
            :label="collapsed ? undefined : 'К игре'"
            icon="i-lucide-gamepad-2"
            color="neutral"
            variant="ghost"
            block
            class="justify-start"
          />
        </template>
      </UDashboardSidebar>

      <UDashboardPanel>
        <template #header>
          <UDashboardNavbar :title="welcome">
            <template #leading>
              <UDashboardSidebarCollapse />
            </template>
          </UDashboardNavbar>
        </template>

        <template #body>
          <slot />
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </div>
</template>

<style scoped>
.admin-shell {
  background: var(--ui-bg, #fff);
}
</style>
