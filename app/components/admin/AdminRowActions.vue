<template>
  <UDropdownMenu :items="items">
    <UButton
      icon="i-lucide-ellipsis"
      color="neutral"
      variant="ghost"
      size="sm"
      square
      @click.stop
    />
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const props = defineProps<{
  detailTo: string;
  hidden?: boolean;
  showHide?: boolean;
  showDelete?: boolean;
}>();

const emit = defineEmits<{
  hide: [];
  remove: [];
}>();

const items = computed(() => {
  const list: DropdownMenuItem[][] = [
    [
      {
        label: "Подробнее",
        icon: "i-lucide-eye",
        to: props.detailTo,
      },
    ],
  ];
  const actions: DropdownMenuItem[] = [];
  if (props.showHide) {
    actions.push({
      label: props.hidden ? "Показать" : "Скрыть",
      icon: props.hidden ? "i-lucide-eye" : "i-lucide-eye-off",
      onSelect: () => emit("hide"),
    });
  }
  if (props.showDelete !== false) {
    actions.push({
      label: "Удалить",
      icon: "i-lucide-trash-2",
      color: "error",
      onSelect: () => emit("remove"),
    });
  }
  if (actions.length) {
    list.push(actions);
  }
  return list;
});
</script>
