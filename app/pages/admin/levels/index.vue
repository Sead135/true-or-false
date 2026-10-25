<template>
  <div class="flex flex-col gap-4 p-4 sm:p-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Уровни</h1>
      <div class="flex items-stretch gap-2">
        <UInput v-model="q" icon="i-lucide-search" placeholder="Поиск…" size="md" class="w-64" />
        <UButton
          icon="i-lucide-plus"
          size="md"
          square
          class="cursor-pointer self-stretch aspect-square"
          aria-label="Новый уровень"
          @click="openCreate = true"
        />
      </div>
    </div>

    <UModal v-model:open="openCreate" title="Новый уровень" description="Создание уровня">
      <template #body>
        <form class="admin-form grid gap-4 md:grid-cols-2" @submit.prevent="createLevel">
          <UInput v-model="form.slug" required placeholder="slug" class="w-full" size="lg" />
          <UInput v-model="form.title" required placeholder="Название" class="w-full" size="lg" />
          <UInput
            v-model.number="form.order"
            required
            type="number"
            min="1"
            placeholder="Порядок"
            class="w-full"
            size="lg"
          />
          <UTextarea
            v-model="form.introMessage"
            required
            placeholder="Intro"
            class="w-full md:col-span-2"
            size="lg"
            :rows="3"
          />
          <div class="flex justify-end gap-2 md:col-span-2">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              class="cursor-pointer"
              @click="openCreate = false"
            >
              Отмена
            </UButton>
            <UButton type="submit" size="lg" :loading="creating" class="cursor-pointer">
              Создать
            </UButton>
          </div>
        </form>
      </template>
    </UModal>

    <UCard :ui="{ body: '!p-0' }">
      <UTable :data="filtered" :columns="columns" @select="onSelect">
        <template #hidden-cell="{ row }">
          <UBadge :color="row.original.hidden ? 'neutral' : 'success'" variant="subtle">
            {{ row.original.hidden ? "Скрыт" : "Активен" }}
          </UBadge>
        </template>
        <template #actions-cell="{ row }">
          <AdminRowActions
            :detail-to="`/admin/levels/${row.original.id}`"
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

definePageMeta({ layout: "admin", middleware: "admin" });

type Level = {
  id: string;
  slug: string;
  title: string;
  order: number;
  hidden: boolean;
  introMessage: string;
};

const q = ref("");
const openCreate = ref(false);
const creating = ref(false);
const toast = useToast();
const form = reactive({ slug: "", title: "", order: 1, introMessage: "" });

const { data, refresh } = await useAsyncData("admin-levels", () =>
  $fetch<Level[]>("/api/admin/levels"),
);

watch(
  data,
  (list) => {
    if (!list?.length) {
      return;
    }
    const maxOrder = Math.max(...list.map((l) => l.order));
    if (!form.slug && !form.title) {
      form.order = maxOrder + 1;
    }
  },
  { immediate: true },
);

const filtered = computed(() => {
  const list = data.value || [];
  const s = q.value.trim().toLowerCase();
  if (!s) {
    return list;
  }
  return list.filter((l) => includesIgnoreCase(l.title, s) || includesIgnoreCase(l.slug, s));
});

const columns: TableColumn<Level>[] = [
  { accessorKey: "order", header: "#" },
  { accessorKey: "title", header: "Название" },
  { accessorKey: "slug", header: "Slug" },
  { accessorKey: "hidden", header: "Статус" },
  { id: "actions", header: "" },
];

function onSelect(_e: Event, row: { original: Level }) {
  navigateTo(`/admin/levels/${row.original.id}`);
}

async function createLevel() {
  creating.value = true;
  try {
    await $fetch("/api/admin/levels", { method: "POST", body: { ...form } });
    toast.add({ title: "Создан" });
    form.slug = "";
    form.title = "";
    form.introMessage = "";
    form.order += 1;
    openCreate.value = false;
    await refresh();
  } finally {
    creating.value = false;
  }
}

async function toggleHide(row: Level) {
  await $fetch(`/api/admin/levels/${row.id}`, {
    method: "PUT",
    body: { hidden: !row.hidden },
  });
  toast.add({ title: row.hidden ? "Показан" : "Скрыт" });
  await refresh();
}

async function remove(id: string) {
  if (!confirm("Удалить уровень?")) {
    return;
  }
  await $fetch(`/api/admin/levels/${id}`, { method: "DELETE" });
  toast.add({ title: "Удалён", color: "error" });
  await refresh();
}

useSeoMeta({ title: "Уровни" });
</script>
