<template>
  <div class="flex flex-col gap-4 p-4 sm:p-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Пользователи</h1>
      <UInput v-model="q" icon="i-lucide-search" placeholder="Имя или email…" class="w-72" />
    </div>

    <UCard :ui="{ body: '!p-0' }">
      <UTable :data="rows || []" :columns="columns" @select="onSelect">
        <template #role-cell="{ row }">
          <UBadge variant="subtle">{{ row.original.role }}</UBadge>
        </template>
        <template #actions-cell="{ row }">
          <UButton
            v-if="canDelete(row.original)"
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            square
            @click.stop="remove(row.original)"
          />
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { canManageUser } from "../../../../lib/admin/roles";

definePageMeta({ layout: "admin", middleware: "admin" });

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

const q = ref("");
const toast = useToast();
const { session } = useSession();

const { data: rows, refresh } = await useAsyncData(
  "admin-users",
  () =>
    $fetch<UserRow[]>("/api/admin/users", {
      query: q.value.trim() ? { q: q.value.trim() } : undefined,
    }),
  { watch: [q] },
);

const actor = computed(() => ({
  id: session.value?.user?.id || "",
  role: session.value?.user?.role || "user",
}));

function canDelete(u: UserRow) {
  return canManageUser(actor.value, u);
}

const columns: TableColumn<UserRow>[] = [
  { accessorKey: "name", header: "Имя" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Роль" },
  { id: "actions", header: "" },
];

function onSelect(_e: Event, row: { original: UserRow }) {
  navigateTo(`/admin/users/${row.original.id}`);
}

async function remove(u: UserRow) {
  if (!confirm(`Удалить ${u.email}?`)) {
    return;
  }
  await $fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
  toast.add({ title: "Удалён", color: "error" });
  await refresh();
}

useSeoMeta({ title: "Пользователи" });
</script>
