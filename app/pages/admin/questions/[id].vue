<template>
  <div class="flex w-full flex-col gap-4 p-4 sm:p-6">
    <div class="flex items-center justify-between gap-3">
      <UButton
        to="/admin/questions"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        class="cursor-pointer"
      >
        К списку
      </UButton>
      <div class="flex gap-2">
        <UButton
          :icon="form.hidden ? 'i-lucide-eye' : 'i-lucide-eye-off'"
          color="neutral"
          variant="outline"
          class="cursor-pointer"
          @click="toggleHide"
        >
          {{ form.hidden ? "Показать" : "Скрыть" }}
        </UButton>
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="soft"
          class="cursor-pointer"
          @click="remove"
        >
          Удалить
        </UButton>
      </div>
    </div>

    <UCard v-if="pending">Загрузка…</UCard>
    <UCard v-else-if="question">
      <form class="admin-form grid gap-4 md:grid-cols-2" @submit.prevent="save">
        <UFormField label="Текст" class="w-full md:col-span-2">
          <UTextarea v-model="form.text" :rows="4" class="w-full" size="lg" />
        </UFormField>
        <UFormField label="Уровень" class="w-full">
          <UInput :model-value="question.levelTitle" disabled class="w-full" size="lg" />
        </UFormField>
        <UFormField label="Порядок" class="w-full">
          <UInput v-model.number="form.order" type="number" min="1" class="w-full" size="lg" />
        </UFormField>
        <UFormField label="Правда?" class="w-full md:col-span-2">
          <UCheckbox v-model="form.isTrue" label="Утверждение верно" class="cursor-pointer" />
        </UFormField>
        <UFormField label="Пояснение" class="w-full md:col-span-2">
          <UTextarea v-model="form.explanation" :rows="3" class="w-full" size="lg" />
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

const route = useRoute();
const id = computed(() => routeParam(route.params.id));
const toast = useToast();
const saving = ref(false);

type QuestionDetail = {
  id: string;
  text: string;
  isTrue: boolean;
  explanation: string;
  order: number;
  hidden: boolean;
  levelId: string;
  levelTitle: string;
};

const {
  data: question,
  pending,
  refresh,
} = await useAsyncData(
  () => `admin-question-${id.value}`,
  () => $fetch<QuestionDetail>(`/api/admin/questions/${id.value}`),
);

const form = reactive({
  text: "",
  isTrue: true,
  explanation: "",
  order: 1,
  hidden: false,
});

watch(
  question,
  (q) => {
    if (!q) {
      return;
    }
    form.text = q.text;
    form.isTrue = q.isTrue;
    form.explanation = q.explanation;
    form.order = q.order;
    form.hidden = q.hidden;
  },
  { immediate: true },
);

async function save() {
  saving.value = true;
  try {
    await $fetch(`/api/admin/questions/${id.value}`, {
      method: "PUT",
      body: {
        text: form.text,
        isTrue: form.isTrue,
        explanation: form.explanation,
        order: form.order,
      },
    });
    toast.add({ title: "Сохранено" });
    await refresh();
  } finally {
    saving.value = false;
  }
}

async function toggleHide() {
  await $fetch(`/api/admin/questions/${id.value}`, {
    method: "PUT",
    body: { hidden: !form.hidden },
  });
  toast.add({ title: form.hidden ? "Показан" : "Скрыт" });
  await refresh();
}

async function remove() {
  if (!confirm("Удалить вопрос?")) {
    return;
  }
  await $fetch(`/api/admin/questions/${id.value}`, { method: "DELETE" });
  toast.add({ title: "Удалён", color: "error" });
  await navigateTo("/admin/questions");
}

useSeoMeta({ title: "Вопрос" });
</script>
