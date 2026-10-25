<template>
  <main
    class="play-page mx-auto flex h-dvh max-w-lg flex-col px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:max-w-3xl md:px-6 md:pt-6"
  >
    <header class="flex shrink-0 items-center gap-3">
      <BackButton :to="`/levels/${id}`" label="К описанию" />

      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-2 text-xs font-semibold tabular-nums">
          <span class="muted truncate">{{ level?.title || "Уровень" }}</span>
          <span>{{ index + 1 }} / {{ questions.length || "…" }}</span>
        </div>
        <div
          class="bar mt-1.5"
          role="progressbar"
          :aria-valuenow="progressPct"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`Вопрос ${index + 1} из ${questions.length || 0}`"
        >
          <div class="bar-fill" :style="{ width: `${progressPct}%` }" />
        </div>
      </div>
    </header>

    <h1 class="sr-only">Игра: {{ level?.title || "уровень" }}</h1>
    <p
      v-if="!questions.length"
      class="muted flex flex-1 items-center justify-center text-center"
      role="status"
    >
      Загрузка вопросов…
    </p>
    <SwipeCardStack
      v-else
      class="min-h-0 flex-1"
      :questions="questions"
      :index="index"
      :disabled="busy"
      @answer="onAnswer"
    />

    <ExplanationModal :open="modalOpen" :explanation="explanation" @continue="afterExplanation" />
    <FinishModal
      :open="finishOpen"
      :scoring="finishScoring"
      :error="finishError"
      :correct="finishCorrect"
      :total="finishTotal"
      :stars="finishStars"
      @retry="finish"
      @replay="replay"
    />
  </main>
</template>

<script setup lang="ts">
import type { UnlockedAchievementPayload } from "../../../../lib/achievements/apply";

type PlayQuestion = {
  id: string;
  text: string;
  order: number;
  isTrue: boolean;
  explanation: string;
};

const route = useRoute();
const id = computed(() => routeParam(route.params.id));
const { session, refresh } = useSession();
const guest = useGuestProgress();
const { enqueue: enqueueRewards } = useRewardToasts();

await refresh();

const busy = ref(false);
const index = ref(0);
const attemptId = ref<string | null>(null);
const attemptPromise = ref<Promise<string> | null>(null);
const modalOpen = ref(false);
const explanation = ref("");
const submitted = ref<{ questionId: string; answer: boolean }[]>([]);
const finishOpen = ref(false);
const finishScoring = ref(false);
const finishError = ref(false);
const finishCorrect = ref(0);
const finishTotal = ref(0);
const finishStars = ref(0);

const { data: level } = await useAsyncData(`play-${id.value}`, () =>
  $fetch<{
    id: string;
    title?: string;
    questions: PlayQuestion[];
  }>(`/api/levels/${id.value}`),
);

const questions = computed(() => level.value?.questions || []);
const progressPct = computed(() => {
  const total = questions.value.length;
  if (!total) {
    return 0;
  }
  return Math.round(((index.value + 1) / total) * 100);
});

usePageSeo(() => ({
  title: level.value?.title ? `${level.value.title} — игра` : "Игра",
  description: "Свайпай утверждения: влево — ложь, вправо — правда.",
  path: `/levels/${id.value}/play`,
  robots: "noindex, follow",
}));

onMounted(() => {
  void startAttempt();
});

function startAttempt(): Promise<string> | null {
  if (!session.value?.user) {
    return null;
  }
  attemptPromise.value = $fetch<{ attemptId: string }>(`/api/levels/${id.value}/start`, {
    method: "POST",
  }).then((res) => {
    attemptId.value = res.attemptId;
    return res.attemptId;
  });
  return attemptPromise.value;
}

async function ensureAttemptId(): Promise<string> {
  if (attemptId.value) {
    return attemptId.value;
  }
  if (attemptPromise.value) {
    return attemptPromise.value;
  }
  const p = startAttempt();
  if (!p) throw new Error("Not authenticated");
  return p;
}

function onAnswer(answer: boolean) {
  if (busy.value || !questions.value.length) {
    return;
  }
  const q = questions.value[index.value];
  if (!q) {
    return;
  }
  busy.value = true;

  submitted.value.push({ questionId: q.id, answer });
  const correct = answer === q.isTrue;

  if (correct) {
    void advance();
  } else {
    explanation.value = q.explanation?.trim() || "Неверно";
    modalOpen.value = true;
    busy.value = false;
  }
}

async function afterExplanation() {
  modalOpen.value = false;
  await advance();
}

async function advance() {
  const nextIndex = index.value + 1;
  if (nextIndex >= questions.value.length) {
    await finish();
    return;
  }
  index.value = nextIndex;
  busy.value = false;
}

function replay() {
  finishOpen.value = false;
  finishScoring.value = false;
  finishError.value = false;
  index.value = 0;
  submitted.value = [];
  attemptId.value = null;
  attemptPromise.value = null;
  busy.value = false;
  void startAttempt();
}

function applyGrade(g: { correct: number; total: number; stars: number }) {
  finishCorrect.value = g.correct;
  finishTotal.value = g.total;
  finishStars.value = g.stars;
  finishScoring.value = false;
}

async function finish() {
  finishOpen.value = true;
  finishScoring.value = true;
  finishError.value = false;
  busy.value = true;

  try {
    if (session.value?.user) {
      const aid = await ensureAttemptId();
      const finishRes = await $fetch<{
        correct: number;
        total: number;
        stars: number;
        unlockedAchievements?: UnlockedAchievementPayload[];
      }>("/api/progress/level", {
        method: "POST",
        body: { attemptId: aid, answers: submitted.value },
      });
      applyGrade(finishRes);
      if (finishRes.unlockedAchievements?.length) {
        enqueueRewards(finishRes.unlockedAchievements);
      }
      return;
    }

    const graded = await $fetch<{ correct: number; total: number; stars: number }>(
      `/api/levels/${id.value}/finish`,
      { method: "POST", body: { answers: submitted.value } },
    );
    await guest.upsert({
      levelId: id.value,
      stars: graded.stars,
      bestCorrect: graded.correct,
      bestTotal: graded.total,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    applyGrade(graded);
  } catch (e) {
    console.error(e);
    finishScoring.value = false;
    finishError.value = true;
    busy.value = false;
  }
}
</script>
