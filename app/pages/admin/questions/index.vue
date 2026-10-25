<template>
  <div class="flex flex-col gap-4 p-4 sm:p-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Вопросы</h1>
      <UInput v-model="q" icon="i-lucide-search" placeholder="Поиск…" class="w-64" />
    </div>

    <UCard :ui="{ body: '!p-0' }">
      <UTable :data="filtered" :columns="columns" class="w-full" @select="onSelect">
        <template #text-cell="{ row }">
          <span class="line-clamp-2">{{ row.original.text }}</span>
        </template>
        <template #hidden-cell="{ row }">
          <UBadge :color="row.original.hidden ? 'neutral' : 'success'" variant="subtle">
            {{ row.original.hidden ? "Скрыт" : "Активен" }}
          </UBadge>
        </template>
        <template #actions-cell="{ row }">
          <AdminRowActions
            :detail-to="`/admin/questions/${row.original.id}`"
            :hidden="row.original.hidden"
            show-hide
            @hide="toggleHide(row.original)"
            @remove="remove(row.original.id)"
          />
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { useToast } from "#imports";

definePageMeta({ layout: "admin", middleware: "admin" });

type Row = {
  id: string;
  text: string;
  isTrue: boolean;
  hidden: boolean;
  levelTitle: string;
  levelId: string;
};

const q = ref("");
const toast = useToast();

const { data, refresh } = await useAsyncData("admin-questions", () =>
  $fetch<Row[]>("/api/admin/questions"),
);

const filtered = computed(() => {
  const list = data.value || [];
  const s = q.value.trim().toLowerCase();
  if (!s) {
    return list;
  }
  return list.filter((r) => includesIgnoreCase(r.text, s) || includesIgnoreCase(r.levelTitle, s));
});

const columns: TableColumn<Row>[] = [
  { accessorKey: "text", header: "Текст" },
  { accessorKey: "levelTitle", header: "Уровень" },
  {
    accessorKey: "isTrue",
    header: "Ответ",
    cell: ({ row }) => (row.original.isTrue ? "Правда" : "Ложь"),
  },
  { accessorKey: "hidden", header: "Статус" },
  { id: "actions", header: "" },
];

function onSelect(_e: Event, row: { original: Row }) {
  navigateTo(`/admin/questions/${row.original.id}`);
}

async function toggleHide(row: Row) {
  await $fetch(`/api/admin/questions/${row.id}`, {
    method: "PUT",
    body: { hidden: !row.hidden },
  });
  toast.add({ title: row.hidden ? "Показан" : "Скрыт" });
  await refresh();
}

async function remove(id: string) {
  if (!confirm("Удалить вопрос?")) {
    return;
  }
  await $fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
  toast.add({ title: "Удалён", color: "error" });
  await refresh();
}

useSeoMeta({ title: "Вопросы" });
</script>
