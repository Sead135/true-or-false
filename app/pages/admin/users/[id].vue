<template>
  <div class="flex w-full flex-col gap-4 p-4 sm:p-6">
    <div class="flex items-center justify-between gap-3">
      <UButton
        to="/admin/users"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        class="cursor-pointer"
      >
        К списку
      </UButton>
      <UButton
        v-if="user && canEdit"
        icon="i-lucide-trash-2"
        color="error"
        variant="soft"
        class="cursor-pointer"
        @click="remove"
      >
        Удалить
      </UButton>
    </div>

    <UCard v-if="pending">Загрузка…</UCard>
    <UCard v-else-if="user">
      <form class="admin-form grid gap-4 md:grid-cols-2" @submit.prevent="save">
        <UFormField label="Имя" class="w-full">
          <UInput v-model="form.name" class="w-full" size="lg" :disabled="!canEdit" />
        </UFormField>
        <UFormField label="Email" class="w-full">
          <UInput v-model="form.email" type="email" class="w-full" size="lg" :disabled="!canEdit" />
        </UFormField>
        <UFormField label="Аватар (URL)" class="w-full md:col-span-2">
          <UInput v-model="form.image" class="w-full" size="lg" :disabled="!canEdit" />
        </UFormField>
        <UFormField v-if="user.role !== 'owner'" label="Роль" class="w-full">
          <USelect
            v-model="form.role"
            :items="roleItems"
            class="w-full"
            size="lg"
            :disabled="!canAssign"
          />
        </UFormField>
        <div v-else class="flex items-end">
          <UBadge variant="subtle" size="lg">owner</UBadge>
        </div>
        <div class="md:col-span-2">
          <UButton v-if="canEdit" type="submit" size="lg" :loading="saving" class="cursor-pointer">
            Сохранить
          </UButton>
          <p v-else class="text-muted text-sm">
            Нет прав на изменение этого пользователя.
            <NuxtLink
              v-if="isSelf"
              to="/admin/settings"
              class="text-primary cursor-pointer underline"
            >
              Открыть настройки
            </NuxtLink>
          </p>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { canAssignRole, canManageUser } from "../../../../lib/admin/roles";

definePageMeta({ layout: "admin", middleware: "admin" });

const route = useRoute();
const id = computed(() => routeParam(route.params.id));
const toast = useToast();
const { session } = useSession();
const saving = ref(false);

type UserDetail = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
};

const {
  data: user,
  pending,
  refresh,
} = await useAsyncData(
  () => `admin-user-${id.value}`,
  () => $fetch<UserDetail>(`/api/admin/users/${id.value}`),
);

const actor = computed(() => ({
  id: session.value?.user?.id || "",
  role: session.value?.user?.role || "user",
}));

const isSelf = computed(() => !!user.value && user.value.id === actor.value.id);
const canEdit = computed(() => (user.value ? canManageUser(actor.value, user.value) : false));
const canAssign = computed(() => actor.value.role === "owner" && canEdit.value);

const form = reactive<{
  name: string;
  email: string;
  image: string;
  role: "user" | "admin";
}>({
  name: "",
  email: "",
  image: "",
  role: "user",
});

const roleItems = [
  { label: "user", value: "user" },
  { label: "admin", value: "admin" },
];

watch(
  user,
  (u) => {
    if (!u) {
      return;
    }
    form.name = u.name;
    form.email = u.email;
    form.image = u.image || "";
    form.role = u.role === "admin" ? "admin" : "user";
  },
  { immediate: true },
);

async function save() {
  if (!canEdit.value) {
    return;
  }
  saving.value = true;
  try {
    const body: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      image: form.image || null,
    };
    if (canAssign.value && canAssignRole(actor.value.role, form.role)) {
      body.role = form.role;
    }
    await $fetch(`/api/admin/users/${id.value}`, { method: "PUT", body });
    toast.add({ title: "Сохранено" });
    await refresh();
  } finally {
    saving.value = false;
  }
}

async function remove() {
  if (!confirm("Удалить пользователя?")) {
    return;
  }
  await $fetch(`/api/admin/users/${id.value}`, { method: "DELETE" });
  toast.add({ title: "Удалён", color: "error" });
  await navigateTo("/admin/users");
}

useSeoMeta({ title: "Пользователь" });
</script>
