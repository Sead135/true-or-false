export function isLevelUnlocked(
  order: number,
  progressByOrder: Map<number, { stars: number }>,
): boolean {
  if (order <= 1) {
    return true;
  }
  const prev = progressByOrder.get(order - 1);
  return (prev?.stars ?? 0) >= 1;
}
