<template>
  <main
    class="play-page mx-auto flex h-dvh max-w-lg flex-col px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:max-w-3xl md:px-6 md:pt-6"
  >
    <header class="flex shrink-0 items-center gap-3">
      <BackButton :to="`/levels/${id}`" label="К описанию" />

      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-2 text-xs font-semibold tabular-nums">
          <span class="muted truncate">{{ level?.title || "Уровень" }}</span>
          <span>{{ play.index + 1 }} / {{ questions.length || "…" }}</span>
        </div>
        <div
          class="bar mt-1.5"
          role="progressbar"
          :aria-valuenow="progressPct"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`Вопрос ${play.index + 1} из ${questions.length || 0}`"
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
      :index="play.index"
      :disabled="play.busy"
      @answer="onAnswer"
    />

    <ExplanationModal
      :open="explanation.open"
      :explanation="explanation.text"
      @continue="afterExplanation"
    />
    <FinishModal
      :open="finish.open"
      :scoring="finish.scoring"
      :error="finish.error"
      :correct="finish.correct"
      :total="finish.total"
      :stars="finish.stars"
      @retry="finishRound"
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

type SubmittedAnswer = { questionId: string; answer: boolean };

const route = useRoute();
const id = computed(() => routeParam(route.params.id));
const { session, refresh } = useSession();
const guest = useGuestProgress();
const { enqueue: enqueueRewards } = useRewardToasts();

await refresh();

const play = reactive({
  busy: false,
  index: 0,
  attemptId: null as string | null,
  attemptPromise: null as Promise<string> | null,
  submitted: [] as SubmittedAnswer[],
});

const explanation = reactive({
  open: false,
  text: "",
});

const finish = reactive({
  open: false,
  scoring: false,
  error: false,
  correct: 0,
  total: 0,
  stars: 0,
});

const { data: level } = await useCachedAsyncData(`level-${id.value}`, () =>
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
  return Math.round(((play.index + 1) / total) * 100);
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
  play.attemptPromise = $fetch<{ attemptId: string }>(`/api/levels/${id.value}/start`, {
    method: "POST",
  }).then((res) => {
    play.attemptId = res.attemptId;
    return res.attemptId;
  });
  return play.attemptPromise;
}

async function ensureAttemptId(): Promise<string> {
  if (play.attemptId) {
    return play.attemptId;
  }
  if (play.attemptPromise) {
    return play.attemptPromise;
  }
  const p = startAttempt();
  if (!p) {
    throw new Error("Not authenticated");
  }
  return p;
}

function onAnswer(answer: boolean) {
  if (play.busy || !questions.value.length) {
    return;
  }
  const q = questions.value[play.index];
  if (!q) {
    return;
  }
  play.busy = true;

  play.submitted.push({ questionId: q.id, answer });
  const correct = answer === q.isTrue;

  if (correct) {
    void advance();
  } else {
    explanation.text = q.explanation?.trim() || "Неверно";
    explanation.open = true;
    play.busy = false;
  }
}

async function afterExplanation() {
  explanation.open = false;
  await advance();
}

async function advance() {
  const nextIndex = play.index + 1;
  if (nextIndex >= questions.value.length) {
    await finishRound();
    return;
  }
  play.index = nextIndex;
  play.busy = false;
}

function replay() {
  finish.open = false;
  finish.scoring = false;
  finish.error = false;
  play.index = 0;
  play.submitted = [];
  play.attemptId = null;
  play.attemptPromise = null;
  play.busy = false;
  void startAttempt();
}

function applyGrade(g: { correct: number; total: number; stars: number }) {
  finish.correct = g.correct;
  finish.total = g.total;
  finish.stars = g.stars;
  finish.scoring = false;
}

async function finishRound() {
  finish.open = true;
  finish.scoring = true;
  finish.error = false;
  play.busy = true;

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
        body: { attemptId: aid, answers: play.submitted },
      });
      applyGrade(finishRes);
      if (finishRes.unlockedAchievements?.length) {
        enqueueRewards(finishRes.unlockedAchievements);
      }
      return;
    }

    const graded = await $fetch<{ correct: number; total: number; stars: number }>(
      `/api/levels/${id.value}/finish`,
      { method: "POST", body: { answers: play.submitted } },
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
    finish.scoring = false;
    finish.error = true;
    play.busy = false;
  }
}
</script>
