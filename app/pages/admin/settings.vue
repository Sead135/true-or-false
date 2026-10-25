<template>
  <div class="flex w-full flex-col gap-4 p-4 sm:p-6">
    <h1 class="text-xl font-semibold">Настройки</h1>
    <UCard>
      <form class="admin-form grid gap-4 md:grid-cols-2" @submit.prevent="save">
        <UFormField label="Имя" class="w-full">
          <UInput v-model="form.name" class="w-full" size="lg" required />
        </UFormField>
        <UFormField label="Email" class="w-full">
          <UInput v-model="form.email" type="email" class="w-full" size="lg" required />
        </UFormField>
        <UFormField label="Аватар (URL)" class="w-full md:col-span-2">
          <UInput v-model="form.image" class="w-full" size="lg" />
        </UFormField>
        <div class="md:col-span-2">
          <UButton type="submit" size="lg" :loading="saving" class="cursor-pointer">
            Сохранить
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "admin" });

const { session, refresh } = useSession();
const toast = useToast();
const saving = ref(false);

const form = reactive({
  name: session.value?.user?.name || "",
  email: session.value?.user?.email || "",
  image: session.value?.user?.image || "",
});

watch(
  () => session.value?.user,
  (u) => {
    if (!u) {
      return;
    }
    form.name = u.name || "";
    form.email = u.email || "";
    form.image = u.image || "";
  },
);

async function save() {
  saving.value = true;
  try {
    await $fetch("/api/admin/me", {
      method: "PUT",
      body: {
        name: form.name,
        email: form.email,
        image: form.image || null,
      },
    });
    await refresh();
    toast.add({ title: "Сохранено" });
  } finally {
    saving.value = false;
  }
}

useSeoMeta({ title: "Настройки" });
</script>
