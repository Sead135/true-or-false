import { z } from "zod";
import { answersBodySchema, gradeAnswers } from "../../../../lib/game/gradeAnswers";
import { getDb } from "../../../utils/db";

const bodySchema = z.object({ answers: answersBodySchema });

export default defineEventHandler(async (event) => {
  const levelId = getRouterParam(event, "id");
  if (!levelId) {
    throw createError({ statusCode: 400, message: "Missing id" });
  }

  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: "Invalid body" });
  }

  const { correct, total, stars } = await gradeAnswers(getDb(), levelId, parsed.data.answers);
  return { correct, total, stars };
});
