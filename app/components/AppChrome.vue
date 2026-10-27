<template>
  <div v-if="hasChrome" class="flex items-center gap-2">
    <ThemeToggle v-if="showTheme" />
    <template v-if="showAvatar">
      <UserMenu v-if="session?.user" />
      <NuxtLink
        v-else-if="showAuthLink"
        to="/login"
        class="icon-btn !w-auto px-3 text-sm font-semibold"
      >
        Войти
      </NuxtLink>
      <span v-else-if="pending" class="chrome-slot" aria-hidden="true" />
    </template>
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    showAuthLink?: boolean;
    showAvatar?: boolean;
    showTheme?: boolean;
  }>(),
  { showAuthLink: false, showAvatar: false, showTheme: false },
);

const { session, pending, refresh } = useSession();
const slots = useSlots();

const hasChrome = computed(() => {
  return props.showTheme || props.showAvatar || props.showAuthLink || !!slots.default;
});

if (props.showAvatar || props.showAuthLink) {
  await refresh();
}
</script>

<style scoped>
.chrome-slot {
  display: inline-block;
  width: 2.5rem;
  height: 2.5rem;
}
</style>
