import { eq } from "drizzle-orm";
import { createError } from "h3";
import { z } from "zod";
import type { Db } from "../db";
import { questions } from "../db/schema";
import { computeStars } from "./stars";

export const answersBodySchema = z
  .array(
    z.object({
      questionId: z.string().uuid(),
      answer: z.boolean(),
    }),
  )
  .min(1);

export type SubmittedAnswer = z.infer<typeof answersBodySchema>[number];

export type GradedAnswer = SubmittedAnswer & {
  correct: boolean;
  isTrue: boolean;
};

export async function gradeAnswers(
  db: Db,
  levelId: string,
  submitted: SubmittedAnswer[],
): Promise<{ graded: GradedAnswer[]; correct: number; total: number; stars: number }> {
  const ids = submitted.map((a) => a.questionId);
  if (new Set(ids).size !== ids.length) {
    throw createError({ statusCode: 400, message: "Duplicate answers" });
  }

  const levelQs = await db
    .select({ id: questions.id, isTrue: questions.isTrue, hidden: questions.hidden })
    .from(questions)
    .where(eq(questions.levelId, levelId));

  const byId = new Map(levelQs.map((q) => [q.id, q]));
  for (const id of ids) {
    if (!byId.has(id)) {
      throw createError({ statusCode: 400, message: "Unknown questions" });
    }
  }

  const submittedSet = new Set(ids);
  for (const q of levelQs) {
    if (!q.hidden && !submittedSet.has(q.id)) {
      throw createError({ statusCode: 400, message: "Incomplete answers" });
    }
  }

  const graded = submitted.map((a) => {
    const q = byId.get(a.questionId)!;
    return { ...a, isTrue: q.isTrue, correct: a.answer === q.isTrue };
  });
  const correct = graded.filter((g) => g.correct).length;
  const total = graded.length;
  return { graded, correct, total, stars: computeStars(correct, total) };
}
