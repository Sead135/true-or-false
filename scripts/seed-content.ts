import { createDb } from "../lib/db";
import { levels, questions } from "../lib/db/schema";
import { SEED_LEVELS } from "./seed-data";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL missing");

const db = createDb(databaseUrl);

await db.delete(levels);

let totalQuestions = 0;

for (const level of SEED_LEVELS) {
  const count = level.questions.length;
  if (count < 5 || count > 20) {
    throw new Error(`Level ${level.slug}: need 5–20 questions, got ${count}`);
  }

  const [row] = await db
    .insert(levels)
    .values({
      slug: level.slug,
      title: level.title,
      introMessage: level.introMessage,
      order: level.order,
    })
    .returning();

  await db.insert(questions).values(
    level.questions.map((q, i) => ({
      levelId: row.id,
      text: q.text,
      isTrue: q.isTrue,
      explanation: q.explanation,
      order: i + 1,
    })),
  );

  totalQuestions += count;
  console.log(`✓ ${level.order}. ${level.title} — ${count} вопросов`);
}

console.log(`Готово: ${SEED_LEVELS.length} уровней, ${totalQuestions} вопросов`);
