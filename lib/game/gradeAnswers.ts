import { and, eq, inArray } from "drizzle-orm";
import { createError } from "h3";
import { z } from "zod";
import { computeStars } from "../../app/utils/stars";
import type { Db } from "../db";
import { questions } from "../db/schema";

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

  const qs = await db
    .select({ id: questions.id, isTrue: questions.isTrue })
    .from(questions)
    .where(and(eq(questions.levelId, levelId), inArray(questions.id, ids)));

  if (qs.length !== ids.length) {
    throw createError({ statusCode: 400, message: "Unknown questions" });
  }

  const truth = new Map(qs.map((q) => [q.id, q.isTrue]));
  const graded = submitted.map((a) => {
    const isTrue = truth.get(a.questionId)!;
    return { ...a, isTrue, correct: a.answer === isTrue };
  });
  const correct = graded.filter((g) => g.correct).length;
  const total = graded.length;
  return { graded, correct, total, stars: computeStars(correct, total) };
}
