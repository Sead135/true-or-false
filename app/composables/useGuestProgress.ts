import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { ProgressRow } from "../../lib/game/mergeProgress";

interface ProgressDB extends DBSchema {
  levels: {
    key: string;
    value: ProgressRow;
  };
}

const DB_NAME = "true-false-progress";
const STORE = "levels";

let dbPromise: Promise<IDBPDatabase<ProgressDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<ProgressDB>(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE, { keyPath: "levelId" });
      },
    });
  }
  return dbPromise;
}

export function useGuestProgress() {
  async function list(): Promise<ProgressRow[]> {
    const db = await getDb();
    return db.getAll(STORE);
  }

  async function upsert(row: ProgressRow) {
    const db = await getDb();
    const existing = await db.get(STORE, row.levelId);
    if (!existing || row.stars > existing.stars) {
      await db.put(STORE, row);
      return;
    }
    const betterCorrect = row.stars === existing.stars && row.bestCorrect > existing.bestCorrect;
    if (betterCorrect) {
      await db.put(STORE, row);
    }
  }

  async function replaceAll(rows: ProgressRow[]) {
    const db = await getDb();
    const tx = db.transaction(STORE, "readwrite");
    await tx.store.clear();
    for (const row of rows) {
      await tx.store.put(row);
    }
    await tx.done;
  }

  async function clear() {
    const db = await getDb();
    await db.clear(STORE);
  }

  return { list, upsert, replaceAll, clear };
}
