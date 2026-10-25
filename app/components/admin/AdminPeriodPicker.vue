<template>
  <div class="flex flex-wrap items-end gap-3">
    <UButtonGroup>
      <UButton
        v-for="p in PRESETS"
        :key="p.value"
        size="sm"
        :color="model === p.value ? 'primary' : 'neutral'"
        :variant="model === p.value ? 'solid' : 'outline'"
        @click="pickPreset(p.value)"
      >
        {{ p.label }}
      </UButton>
    </UButtonGroup>
    <div v-if="model === 'custom'" class="flex flex-wrap items-end gap-2">
      <UInput v-model="fromLocal" type="date" size="sm" />
      <UInput v-model="toLocal" type="date" size="sm" />
      <UButton size="sm" @click="applyCustom">Применить</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const PRESETS = [
  { value: "7d", label: "7 дней" },
  { value: "30d", label: "30 дней" },
  { value: "90d", label: "90 дней" },
  { value: "all", label: "Всё" },
  { value: "custom", label: "Свой" },
];

const model = defineModel<string>({ default: "7d" });
const from = defineModel<string>("from", { default: "" });
const to = defineModel<string>("to", { default: "" });

const fromLocal = ref(from.value);
const toLocal = ref(to.value);

watch(from, (v) => {
  fromLocal.value = v;
});
watch(to, (v) => {
  toLocal.value = v;
});

function pickPreset(v: string) {
  model.value = v;
}

function applyCustom() {
  from.value = fromLocal.value;
  to.value = toLocal.value;
  model.value = "custom";
}
</script>
