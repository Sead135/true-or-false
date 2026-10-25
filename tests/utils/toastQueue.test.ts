import { describe, expect, test } from "bun:test";

function createQueue() {
  const items: { id: string }[] = [];
  let active: { id: string } | null = null;
  const shown = new Set<string>();

  function enqueue(item: { id: string }) {
    if (shown.has(item.id)) {
      return;
    }
    shown.add(item.id);
    items.push(item);
    if (!active) advance();
  }

  function advance() {
    active = items.shift() || null;
  }

  function dismiss() {
    active = null;
    advance();
  }

  return {
    enqueue,
    dismiss,
    get active() {
      return active;
    },
    get pending() {
      return items.length;
    },
  };
}

describe("toast queue", () => {
  test("shows sequentially", () => {
    const q = createQueue();
    q.enqueue({ id: "a" });
    q.enqueue({ id: "b" });
    expect(q.active?.id).toBe("a");
    expect(q.pending).toBe(1);
    q.dismiss();
    expect(q.active?.id).toBe("b");
    q.dismiss();
    expect(q.active).toBe(null);
  });

  test("dedupes same achievement id in session", () => {
    const q = createQueue();
    q.enqueue({ id: "a" });
    q.enqueue({ id: "a" });
    expect(q.pending).toBe(0);
    q.dismiss();
    q.enqueue({ id: "a" });
    expect(q.active).toBe(null);
  });
});
