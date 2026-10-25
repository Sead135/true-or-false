<template>
  <div class="flex w-full flex-col gap-4 p-4 sm:p-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <UButton
        to="/admin/levels"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        class="cursor-pointer"
      >
        К списку
      </UButton>
      <div class="flex gap-2">
        <UButton
          v-if="level"
          :icon="level.hidden ? 'i-lucide-eye' : 'i-lucide-eye-off'"
          color="neutral"
          variant="outline"
          class="cursor-pointer"
          @click="toggleHide"
        >
          {{ level.hidden ? "Показать" : "Скрыть" }}
        </UButton>
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="soft"
          class="cursor-pointer"
          @click="removeLevel"
        >
          Удалить
        </UButton>
      </div>
    </div>

    <UCard v-if="level">
      <template #header>
        <p class="font-semibold">Уровень</p>
      </template>
      <form class="admin-form grid gap-4 md:grid-cols-2" @submit.prevent="saveLevel">
        <UInput v-model="level.title" placeholder="Название" class="w-full" size="lg" />
        <UInput v-model="level.slug" placeholder="slug" class="w-full" size="lg" />
        <UInput
          v-model.number="level.order"
          type="number"
          placeholder="Порядок"
          class="w-full"
          size="lg"
        />
        <UTextarea
          v-model="level.introMessage"
          :rows="3"
          placeholder="Intro"
          class="w-full md:col-span-2"
          size="lg"
        />
        <UButton type="submit" size="lg" class="cursor-pointer md:col-span-2 md:w-fit">
          Сохранить уровень
        </UButton>
      </form>
    </UCard>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold">Вопросы</h2>
        <p class="text-muted text-sm">Перетащи, чтобы изменить порядок</p>
      </div>
      <UButton icon="i-lucide-plus" class="cursor-pointer" @click="openAdd = true">
        Добавить вопрос
      </UButton>
    </div>

    <UModal v-model:open="openAdd" title="Новый вопрос" description="Добавление к уровню">
      <template #body>
        <form class="admin-form grid gap-4 md:grid-cols-2" @submit.prevent="addQuestion">
          <UTextarea
            v-model="qForm.text"
            placeholder="Текст"
            :rows="3"
            class="w-full md:col-span-2"
            size="lg"
            required
          />
          <UCheckbox v-model="qForm.isTrue" label="Это правда" class="cursor-pointer" />
          <div class="md:col-span-2">
            <UFormField label="Пояснение при ошибке">
              <UTextarea
                v-model="qForm.explanation"
                placeholder="Пояснение"
                :rows="2"
                class="w-full"
                size="lg"
              />
            </UFormField>
          </div>
          <div class="flex justify-end gap-2 md:col-span-2">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              class="cursor-pointer"
              @click="openAdd = false"
            >
              Отмена
            </UButton>
            <UButton type="submit" size="lg" :loading="adding" class="cursor-pointer">
              Добавить
            </UButton>
          </div>
        </form>
      </template>
    </UModal>

    <div v-if="!questions.length" class="text-muted text-sm">Пока нет вопросов</div>
    <div v-else class="grid gap-2">
      <UCard
        v-for="(q, index) in questions"
        :key="q.id"
        class="admin-clickable"
        :class="{ 'ring-2 ring-primary': dragOver === index }"
        @dragover.prevent="onDragOver(index)"
        @drop.prevent="onDrop(index)"
      >
        <div class="flex items-start gap-3">
          <button
            type="button"
            class="text-muted hover:text-highlighted mt-0.5 cursor-grab touch-none active:cursor-grabbing"
            draggable="true"
            aria-label="Перетащить"
            @dragstart="onDragStart(index, $event)"
            @dragend="onDragEnd"
          >
            <UIcon name="i-lucide-grip-vertical" class="size-5" />
          </button>
          <div class="min-w-0 flex-1">
            <p class="font-medium">{{ index + 1 }}. {{ q.text }}</p>
            <p class="text-muted mt-1 text-sm">
              {{ q.isTrue ? "Правда" : "Ложь" }} · {{ q.hidden ? "скрыт" : "активен" }}
            </p>
          </div>
          <div class="flex shrink-0 gap-1">
            <UButton
              :to="`/admin/questions/${q.id}`"
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="sm"
              square
              class="cursor-pointer"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              square
              class="cursor-pointer"
              @click="removeQuestion(q.id)"
            />
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "admin" });

type Level = {
  id: string;
  slug: string;
  title: string;
  order: number;
  hidden: boolean;
  introMessage: string;
};

type Question = {
  id: string;
  text: string;
  isTrue: boolean;
  explanation: string;
  order: number;
  hidden: boolean;
};

const route = useRoute();
const id = routeParam(route.params.id);
const toast = useToast();

const level = ref<Level | null>(null);
const questions = ref<Question[]>([]);
const openAdd = ref(false);
const adding = ref(false);
const dragFrom = ref<number | null>(null);
const dragOver = ref<number | null>(null);
const qForm = reactive({
  text: "",
  isTrue: true,
  explanation: "",
});

async function load() {
  const levels = await $fetch<Level[]>("/api/admin/levels");
  level.value = levels.find((l) => l.id === id) || null;
  questions.value = await $fetch<Question[]>(`/api/admin/levels/${id}/questions`);
}

async function saveLevel() {
  if (!level.value) {
    return;
  }
  await $fetch(`/api/admin/levels/${id}`, {
    method: "PUT",
    body: {
      title: level.value.title,
      slug: level.value.slug,
      order: level.value.order,
      introMessage: level.value.introMessage,
    },
  });
  toast.add({ title: "Сохранено" });
}

async function toggleHide() {
  if (!level.value) {
    return;
  }
  await $fetch(`/api/admin/levels/${id}`, {
    method: "PUT",
    body: { hidden: !level.value.hidden },
  });
  toast.add({ title: level.value.hidden ? "Показан" : "Скрыт" });
  await load();
}

async function removeLevel() {
  if (!confirm("Удалить уровень?")) {
    return;
  }
  await $fetch(`/api/admin/levels/${id}`, { method: "DELETE" });
  await navigateTo("/admin/levels");
}

async function addQuestion() {
  adding.value = true;
  try {
    await $fetch(`/api/admin/levels/${id}/questions`, {
      method: "POST",
      body: {
        text: qForm.text,
        isTrue: qForm.isTrue,
        explanation: qForm.explanation,
        order: questions.value.length + 1,
      },
    });
    qForm.text = "";
    qForm.explanation = "";
    qForm.isTrue = true;
    openAdd.value = false;
    toast.add({ title: "Добавлен" });
    await load();
  } finally {
    adding.value = false;
  }
}

async function removeQuestion(qid: string) {
  if (!confirm("Удалить вопрос?")) {
    return;
  }
  await $fetch(`/api/admin/questions/${qid}`, { method: "DELETE" });
  await load();
}

function onDragStart(index: number, e: DragEvent) {
  dragFrom.value = index;
  e.dataTransfer?.setData("text/plain", String(index));
  if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
}

function onDragOver(index: number) {
  dragOver.value = index;
}

function onDragEnd() {
  dragFrom.value = null;
  dragOver.value = null;
}

async function onDrop(toIndex: number) {
  const fromIndex = dragFrom.value;
  dragOver.value = null;
  dragFrom.value = null;
  if (fromIndex === null || fromIndex === toIndex) {
    return;
  }

  const list = [...questions.value];
  const [item] = list.splice(fromIndex, 1);
  if (!item) {
    return;
  }
  list.splice(toIndex, 0, item);
  questions.value = list.map((q, i) => ({ ...q, order: i + 1 }));

  try {
    await $fetch(`/api/admin/levels/${id}/questions/reorder`, {
      method: "PUT",
      body: { orderedIds: questions.value.map((q) => q.id) },
    });
    toast.add({ title: "Порядок сохранён" });
  } catch (e) {
    console.error(e);
    toast.add({ title: "Не удалось сохранить порядок", color: "error" });
    await load();
  }
}

await load();
useSeoMeta({ title: "Редактор уровня" });
</script>
