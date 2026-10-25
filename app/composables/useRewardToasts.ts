export type RewardToast = {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
};

type QueueState = {
  queue: RewardToast[];
  active: RewardToast | null;
  shownIds: string[];
};

export function useRewardToasts() {
  const state = useState<QueueState>("reward-toasts", () => ({
    queue: [],
    active: null,
    shownIds: [],
  }));

  function pump() {
    if (state.value.active) {
      return;
    }
    const next = state.value.queue.shift();
    state.value.active = next || null;
  }

  function enqueue(items: RewardToast[]) {
    for (const item of items) {
      if (state.value.shownIds.includes(item.id)) {
        continue;
      }
      state.value.shownIds.push(item.id);
      state.value.queue.push(item);
    }
    pump();
  }

  function dismiss() {
    state.value.active = null;
    pump();
  }

  return {
    active: computed(() => state.value.active),
    enqueue,
    dismiss,
  };
}
